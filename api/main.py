import os
import json
import uuid
import datetime
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, Request, Response, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from contextlib import asynccontextmanager
import asyncpg
from mangum import Mangum
from dotenv import load_dotenv

load_dotenv()

# --- Database Connection Logic (Inlined) ---
_pool: Optional[asyncpg.Pool] = None

async def get_db_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(
            dsn=os.getenv("DATABASE_URL"),
            min_size=1,
            max_size=5,
            command_timeout=60,
            ssl="require"
        )
    return _pool

async def close_db_pool():
    global _pool
    if _pool:
        await _pool.close()
        _pool = None

# --- FastAPI App Configuration ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    await get_db_pool()
    yield
    await close_db_pool()

app = FastAPI(
    title="Digital FTE — Vercel Serverless API",
    description="Full-restructure for Vercel Python Runtime. No more detection errors.",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# --- Models ---
class SupportFormSubmission(BaseModel):
    name: str
    email: EmailStr
    subject: str
    category: str
    message: str
    priority: Optional[str] = "medium"

# --- Endpoints ---

@app.get("/api/health")
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
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "database": db_status,
        "version": "2.1.0-serverless"
    }

@app.post("/api/v1/channels/webform/submit")
async def submit_support_form(submission: SupportFormSubmission):
    pool = await get_db_pool()
    ticket_id = str(uuid.uuid4())
    
    async with pool.acquire() as conn:
        # Upsert Customer
        row = await conn.fetchrow("SELECT id FROM customers WHERE email = $1", str(submission.email))
        if row:
            customer_id = row["id"]
        else:
            customer_id = await conn.fetchval(
                "INSERT INTO customers (email, name) VALUES ($1, $2) RETURNING id",
                str(submission.email), submission.name
            )
        
        # Create Conversation
        conv_id = await conn.fetchval(
            "INSERT INTO conversations (customer_id, initial_channel) VALUES ($1, $2) RETURNING id",
            customer_id, "web_form"
        )
        
        # Create Ticket
        await conn.execute(
            """INSERT INTO tickets (customer_id, conversation_id, source_channel, subject, category, priority) 
               VALUES ($1, $2, $3, $4, $5, $6)""",
            customer_id, conv_id, "web_form", submission.subject, submission.category, submission.priority
        )
        
        # Log Audit
        await conn.execute(
            "INSERT INTO audit_log (action_type, target, result) VALUES ($1, $2, $3)",
            "web_form_submission", ticket_id, "success"
        )

    return {
        "ticket_id": ticket_id,
        "message": "Your request has been received! ARIA, our AI agent, will respond within 5 minutes.",
        "status": "processing"
    }

@app.get("/api/v1/tickets/{ticket_id}")
async def get_ticket(ticket_id: str):
    pool = await get_db_pool()
    try:
        ticket_uuid = uuid.UUID(ticket_id)
    except ValueError:
        raise HTTPException(400, "Invalid Ticket ID format")
        
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM tickets WHERE id = $1", ticket_uuid)
        if not row:
            raise HTTPException(404, "Ticket not found")
        
        ticket = dict(row)
        msgs = await conn.fetch(
            "SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC",
            ticket["conversation_id"]
        )
        ticket["messages"] = [dict(m) for m in msgs]
        
        # Serialize UUIDs and datetimes
        def serialise(obj):
            if isinstance(obj, uuid.UUID): return str(obj)
            if isinstance(obj, (datetime.datetime, datetime.date)): return obj.isoformat()
            return obj
            
        return {k: serialise(v) for k, v in ticket.items()}

@app.get("/api/v1/briefings/latest")
async def get_latest_briefing():
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM ceo_briefings ORDER BY created_at DESC LIMIT 1")
        if not row:
            raise HTTPException(404, "No briefing found")
        
        def serialise(obj):
            if isinstance(obj, uuid.UUID): return str(obj)
            if isinstance(obj, (datetime.datetime, datetime.date)): return obj.isoformat()
            return obj
            
        return {k: serialise(v) for k, v in row.items()}

@app.get("/api/v1/metrics/channels")
async def channel_metrics():
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """SELECT initial_channel as channel, COUNT(*), AVG(sentiment_score) as avg_sentiment, 
               SUM(CASE WHEN status='escalated' THEN 1 ELSE 0 END) as escalation_count 
               FROM conversations 
               WHERE started_at > NOW() - INTERVAL '24 hours' 
               GROUP BY initial_channel"""
        )
        return {r["channel"]: {"count": r["count"], "avg_sentiment": float(r["avg_sentiment"] or 0.5), "escalation_count": r["escalation_count"]} for r in rows}

@app.post("/api/v1/briefings/generate")
async def trigger_briefing():
    # In Vercel, we can't run the actual worker, but we can return 202
    return {"status": "triggered", "message": "Manual briefing generation is handled by the background worker on the dedicated VPS."}

# --- Mangum Handler for Vercel ---
handler = Mangum(app)
