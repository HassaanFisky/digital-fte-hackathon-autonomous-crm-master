from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from database import connection, queries
from channels import webform_handler, whatsapp_handler, gmail_handler
from kafka_client import publish_to_kafka

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup DB Pool
    await connection.get_db_pool()
    yield
    # Cleanup DB Pool
    await connection.close_db_pool()

app = FastAPI(title="ARIA Digital FTE API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(webform_handler.router)

@app.get("/")
async def root():
    return {"message": "ARIA Digital FTE API", "status": "operational"}

@app.get("/api/v1/health")
async def health():
    try:
        pool = await connection.get_db_pool()
        async with pool.acquire() as conn:
            await conn.execute("SELECT 1")
            
        return {
            "status": "healthy",
            "db": "connected",
            "channels": {
                "webform": "active",
                "whatsapp": "active",
                "gmail": "active"
            }
        }
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

@app.post("/api/v1/webhooks/whatsapp")
async def whatsapp_webhook(request: Request):
    form_data = await request.form()
    # Validate
    if not await whatsapp_handler.WhatsAppHandler.validate_webhook(request, form_data):
        return Response(content="Unauthorized", status_code=403)
        
    data = await whatsapp_handler.WhatsAppHandler.process_webhook(form_data)
    await publish_to_kafka("fte.tickets.incoming", data)
    
    # Return empty TwiML
    return Response(content='<?xml version="1.0" encoding="UTF-8"?><Response></Response>', media_type="text/xml")

@app.post("/api/v1/webhooks/whatsapp/status")
async def whatsapp_status_webhook(request: Request):
    data = await request.form()
    await publish_to_kafka("fte.metrics.general", dict(data))
    return {"status": "ok"}

@app.post("/api/v1/webhooks/gmail")
async def gmail_webhook():
    emails = await gmail_handler.GmailHandler.get_unread_important()
    for email in emails:
        await publish_to_kafka("fte.tickets.incoming", email)
    return {"processed": len(emails)}

@app.get("/api/v1/metrics/channels")
async def channel_metrics():
    return await queries.get_channel_metrics_last_24h()

@app.get("/api/v1/tickets/{ticket_id}")
async def get_ticket(ticket_id: str):
    res = await queries.get_ticket_by_id(ticket_id)
    if not res:
        return Response(status_code=404)
    return res

@app.get("/api/v1/customers/lookup")
async def customer_lookup(email: str = None, phone: str = None):
    if email:
        res = await queries.get_customer_by_email(email)
    elif phone:
        res = await queries.get_customer_by_phone(phone)
    else:
        return Response(content="Email or phone required", status_code=400)
    
    if not res:
        return Response(status_code=404)
    return res
