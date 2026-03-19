import os
from fastapi import FastAPI, Request, BackgroundTasks, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
from database.connection import get_db_pool, close_db_pool
from channels.webform_handler import router as webform_router
from kafka_client import publish_to_kafka, TOPICS
from channels.whatsapp_handler import WhatsAppHandler
from channels.gmail_handler import GmailHandler
from datetime import datetime
import json

@asynccontextmanager
async def lifespan(app: FastAPI):
    await get_db_pool()
    yield
    await close_db_pool()

app = FastAPI(
    title="Digital FTE — ARIA Customer Success API",
    description="24/7 AI-powered customer support across Email, WhatsApp, and Web Form. Built for GIAIC Hackathon.",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

app.add_middleware(CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(webform_router)

@app.get("/")
async def root():
    return {"message": "ARIA Digital FTE API — Online", "status": "operational", "version": "2.0.0"}

@app.get("/api/v1/health")
async def health():
    pool = await get_db_pool()
    db_status = "connected"
    try:
        async with pool.acquire() as conn:
            await conn.fetchval("SELECT 1")
    except Exception:
        db_status = "error"
    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "timestamp": datetime.utcnow().isoformat(),
        "database": db_status,
        "channels": {"email": "active", "whatsapp": "active", "web_form": "active"},
        "version": "2.0.0"
    }

@app.post("/api/v1/webhooks/whatsapp")
async def whatsapp_webhook(request: Request, background_tasks: BackgroundTasks):
    handler = WhatsAppHandler()
    form_data = dict(await request.form())
    message = await handler.process_webhook(form_data)
    background_tasks.add_task(publish_to_kafka, TOPICS["tickets_incoming"], message)
    return Response(
        content='<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
        media_type="application/xml"
    )

@app.post("/api/v1/webhooks/whatsapp/status")
async def whatsapp_status(request: Request):
    form_data = dict(await request.form())
    await publish_to_kafka(TOPICS["metrics"], {
        "event_type": "delivery_status",
        "message_sid": form_data.get("MessageSid"),
        "status": form_data.get("MessageStatus")
    })
    return {"status": "received"}

@app.post("/api/v1/webhooks/gmail")
async def gmail_webhook(request: Request, background_tasks: BackgroundTasks):
    body = await request.json()
    handler = GmailHandler()
    messages = await handler.get_unread_important()
    for msg in messages:
        background_tasks.add_task(publish_to_kafka, TOPICS["tickets_incoming"], {
            "channel": "email",
            "channel_message_id": msg["id"],
            "content": "Email detected — full body fetched asynchronously",
            "received_at": datetime.utcnow().isoformat()
        })
    return {"status": "processed", "count": len(messages)}

@app.get("/api/v1/metrics/channels")
async def channel_metrics():
    from database.queries import get_channel_metrics_last_24h
    return await get_channel_metrics_last_24h()

@app.get("/api/v1/tickets/{ticket_id}")
async def get_ticket(ticket_id: str):
    from database.queries import get_ticket_by_id
    ticket = await get_ticket_by_id(ticket_id)
    if not ticket:
        raise HTTPException(404, "Ticket not found")
    return ticket

@app.get("/api/v1/customers/lookup")
async def lookup_customer(email: str = None, phone: str = None):
    if not email and not phone:
        raise HTTPException(400, "Provide email or phone")
    from database.queries import get_customer_by_email, get_customer_by_phone
    customer = None
    if email:
        customer = await get_customer_by_email(email)
    if not customer and phone:
        customer = await get_customer_by_phone(phone)
    if not customer:
        raise HTTPException(404, "Customer not found")
    return customer

@app.get("/api/v1/briefings/latest")
async def get_latest_briefing():
    """Return the most recently generated CEO briefing."""
    from database.queries import get_latest_briefing as db_get_latest_briefing
    briefing = await db_get_latest_briefing()
    if not briefing:
        raise HTTPException(404, "No CEO briefing found. Generate one first via POST /api/v1/briefings/generate")
    # asyncpg returns date objects; serialise safely
    return {
        "briefing_id": str(briefing["id"]),
        "period_start": str(briefing["period_start"]),
        "period_end": str(briefing["period_end"]),
        "briefing_markdown": briefing["briefing_markdown"],
        "total_tickets": briefing.get("total_tickets"),
        "escalation_count": briefing.get("escalation_count"),
        "avg_sentiment": float(briefing.get("avg_sentiment") or 0.75),
        "created_at": briefing["created_at"].isoformat() if briefing.get("created_at") else None,
    }

@app.post("/api/v1/briefings/generate")
async def trigger_briefing_generation(background_tasks: BackgroundTasks):
    """Manually trigger an immediate CEO briefing generation."""
    async def _run_briefing():
        from workers.briefing_generator import generate_briefing
        import logging
        logger = logging.getLogger("BriefingAPI")
        try:
            result = await generate_briefing()
            logger.info(f"✅ On-demand briefing generated: {result['briefing_id']}")
        except Exception as e:
            logger.error(f"❌ On-demand briefing failed: {e}")

    background_tasks.add_task(_run_briefing)
    return {"status": "triggered", "message": "CEO Briefing generation started in background. Check /api/v1/briefings/latest in ~30 seconds."}
