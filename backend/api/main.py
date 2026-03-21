from contextlib import asynccontextmanager
import json
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from database import connection, queries
from channels import webform_handler, whatsapp_handler, gmail_handler
from kafka_client import publish_to_kafka
from agent.ceo_briefing import generate_briefing


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connection.get_db_pool()
    yield
    await connection.close_db_pool()


app = FastAPI(
    title="ARIA Digital FTE API",
    version="2.0.0",
    description="Autonomous Response & Intelligence Agent — TechCorp SaaS CRM",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(webform_handler.router)


# ─────────────────────────────────────────────
# Core
# ─────────────────────────────────────────────

@app.get("/")
async def root():
    return {"message": "ARIA Digital FTE API", "status": "operational", "version": "2.0.0"}


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
                "gmail": "active",
            },
        }
    except Exception as e:
        return JSONResponse(status_code=503, content={"status": "unhealthy", "error": str(e)})


# ─────────────────────────────────────────────
# Webhooks
# ─────────────────────────────────────────────

@app.post("/api/v1/webhooks/whatsapp")
async def whatsapp_webhook(request: Request):
    form_data = await request.form()
    if not await whatsapp_handler.WhatsAppHandler.validate_webhook(request, dict(form_data)):
        return Response(content="Unauthorized", status_code=403)
    data = await whatsapp_handler.WhatsAppHandler.process_webhook(dict(form_data))
    await publish_to_kafka("fte.tickets.incoming", data)
    return Response(
        content='<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
        media_type="text/xml",
    )


@app.post("/api/v1/webhooks/whatsapp/status")
async def whatsapp_status_webhook(request: Request):
    data = dict(await request.form())
    await publish_to_kafka("fte.metrics.general", data)
    return {"status": "ok"}


@app.post("/api/v1/webhooks/gmail")
async def gmail_webhook():
    emails = await gmail_handler.GmailHandler.get_unread_important()
    for email in emails:
        await publish_to_kafka("fte.tickets.incoming", email)
    return {"processed": len(emails)}


# ─────────────────────────────────────────────
# Metrics
# ─────────────────────────────────────────────

@app.get("/api/v1/metrics/channels")
async def channel_metrics():
    return await queries.get_channel_metrics_last_24h()


# ─────────────────────────────────────────────
# Tickets & Customers
# ─────────────────────────────────────────────

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
        return Response(content="email or phone param required", status_code=400)
    if not res:
        return Response(status_code=404)
    return res


# ─────────────────────────────────────────────
# CEO Briefings
# ─────────────────────────────────────────────

@app.post("/api/v1/briefing/generate")
async def briefing_generate():
    """Generate a fresh CEO briefing using Groq and persist it."""
    try:
        markdown = await generate_briefing()
        return {"status": "generated", "briefing_markdown": markdown}
    except Exception as e:
        return JSONResponse(status_code=500, content={"detail": str(e)})


@app.get("/api/v1/briefing/latest")
async def briefing_latest():
    """Return the most recently saved CEO briefing."""
    try:
        pool = await connection.get_db_pool()
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT * FROM ceo_briefings ORDER BY generated_at DESC LIMIT 1"
            )
        if not row:
            return JSONResponse(status_code=404, content={"detail": "No briefings yet"})
        result = dict(row)
        # Convert date objects to ISO strings for JSON serialisation
        result["period_start"] = str(result["period_start"])
        result["period_end"] = str(result["period_end"])
        result["generated_at"] = result["generated_at"].isoformat()
        return result
    except Exception as e:
        return JSONResponse(status_code=500, content={"detail": str(e)})
