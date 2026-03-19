import datetime
import uuid
from typing import Optional, List, Dict, Any
from .connection import get_db_pool

async def create_customer(email: str = None, phone: str = None, name: str = None) -> str:
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        customer_id = await conn.fetchval(
            "INSERT INTO customers (email, phone, name) VALUES ($1, $2, $3) RETURNING id",
            email, phone, name
        )
        return str(customer_id)

async def get_customer_by_email(email: str) -> Optional[Dict[str, Any]]:
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM customers WHERE email = $1", email)
        return dict(row) if row else None

async def get_customer_by_phone(phone: str) -> Optional[Dict[str, Any]]:
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        # Check customer_identifiers for whatsapp
        row = await conn.fetchrow(
            """SELECT c.* FROM customers c 
               JOIN customer_identifiers ci ON c.id = ci.customer_id 
               WHERE ci.identifier_type = 'whatsapp' AND ci.identifier_value = $1""",
            phone
        )
        if not row:
            # Fallback to direct phone match
            row = await conn.fetchrow("SELECT * FROM customers WHERE phone = $1", phone)
        return dict(row) if row else None

async def upsert_customer(email: str = None, phone: str = None, name: str = None) -> str:
    customer = None
    if email:
        customer = await get_customer_by_email(email)
    if not customer and phone:
        customer = await get_customer_by_phone(phone)
    
    if customer:
        return str(customer["id"])
    return await create_customer(email, phone, name)

async def create_conversation(customer_id: str, channel: str) -> str:
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        id = await conn.fetchval(
            "INSERT INTO conversations (customer_id, initial_channel) VALUES ($1, $2) RETURNING id",
            uuid.UUID(customer_id), channel
        )
        return str(id)

async def get_active_conversation(customer_id: str) -> Optional[Dict[str, Any]]:
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM conversations WHERE customer_id = $1 AND status = 'active' AND started_at > NOW() - INTERVAL '24 hours' ORDER BY started_at DESC LIMIT 1",
            uuid.UUID(customer_id)
        )
        return dict(row) if row else None

async def create_message(conversation_id: str, channel: str, direction: str, role: str, content: str, **kwargs) -> str:
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        id = await conn.fetchval(
            """INSERT INTO messages (conversation_id, channel, direction, role, content, tokens_used, latency_ms, tool_calls, channel_message_id, delivery_status) 
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id""",
            uuid.UUID(conversation_id), channel, direction, role, content, 
            kwargs.get("tokens_used"), kwargs.get("latency_ms"), kwargs.get("tool_calls", "[]"),
            kwargs.get("channel_message_id"), kwargs.get("delivery_status", "pending")
        )
        return str(id)

async def create_ticket(customer_id: str, conversation_id: str, channel: str, subject: str, category: str = "general", priority: str = "medium") -> str:
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        id = await conn.fetchval(
            """INSERT INTO tickets (customer_id, conversation_id, source_channel, subject, category, priority) 
               VALUES ($1, $2, $3, $4, $5, $6) RETURNING id""",
            uuid.UUID(customer_id), uuid.UUID(conversation_id), channel, subject, category, priority
        )
        return str(id)

async def update_ticket_status(ticket_id: str, status: str, notes: str = None):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        if status == "resolved":
            await conn.execute(
                "UPDATE tickets SET status = $1, resolution_notes = $2, resolved_at = NOW() WHERE id = $3",
                status, notes, uuid.UUID(ticket_id)
            )
        else:
            await conn.execute(
                "UPDATE tickets SET status = $1, resolution_notes = $2 WHERE id = $3",
                status, notes, uuid.UUID(ticket_id)
            )

async def get_ticket_by_id(ticket_id: str) -> Optional[Dict[str, Any]]:
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM tickets WHERE id = $1", uuid.UUID(ticket_id))
        if not row:
            return None
        ticket = dict(row)
        # messages join implied for context-rich returns
        msgs = await conn.fetch(
            "SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC",
            ticket["conversation_id"]
        )
        ticket["messages"] = [dict(m) for m in msgs]
        return ticket

async def get_conversation_messages(conversation_id: str, limit: int = 20) -> List[Dict[str, Any]]:
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at DESC LIMIT $2",
            uuid.UUID(conversation_id), limit
        )
        return [dict(r) for r in rows]

async def get_customer_cross_channel_history(customer_id: str) -> List[Dict[str, Any]]:
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        # interactions across ALL channels
        rows = await conn.fetch(
            """SELECT m.*, c.initial_channel 
               FROM messages m 
               JOIN conversations c ON m.conversation_id = c.id 
               WHERE c.customer_id = $1 
               ORDER BY m.created_at DESC LIMIT 20""",
            uuid.UUID(customer_id)
        )
        return [dict(r) for r in rows]

async def search_knowledge_base(query: str, limit: int = 5) -> List[Dict[str, Any]]:
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT * FROM knowledge_base WHERE content ILIKE $1 OR title ILIKE $1 ORDER BY created_at LIMIT $2",
            f"%{query}%", limit
        )
        return [dict(r) for r in rows]

async def log_audit(action_type: str, target: str = None, parameters: Any = None, result: str = "success", error: str = None):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        import json
        params_json = json.dumps(parameters) if parameters else "{}"
        await conn.execute(
            "INSERT INTO audit_log (action_type, target, parameters, result, error_message) VALUES ($1, $2, $3, $4, $5)",
            action_type, target, params_json, result, error
        )

async def record_metric(metric_name: str, metric_value: float, channel: str = None, dimensions: Any = None):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        import json
        dims_json = json.dumps(dimensions) if dimensions else "{}"
        await conn.execute(
            "INSERT INTO agent_metrics (metric_name, metric_value, channel, dimensions) VALUES ($1, $2, $3, $4)",
            metric_name, metric_value, channel, dims_json
        )

async def save_briefing(period_start: datetime.date, period_end: datetime.date, briefing_markdown: str, **stats) -> str:
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        id = await conn.fetchval(
            """INSERT INTO ceo_briefings (period_start, period_end, briefing_markdown, revenue_this_week, total_tickets, escalation_count, avg_sentiment) 
               VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id""",
            period_start, period_end, briefing_markdown, stats.get("revenue_this_week", 0),
            stats.get("total_tickets", 0), stats.get("escalation_count", 0), stats.get("avg_sentiment", 0.5)
        )
        return str(id)

async def get_channel_metrics_last_24h() -> Dict[str, Any]:
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

async def get_weekly_briefing_stats() -> Dict[str, Any]:
    """Aggregate all KPIs for the past 7 days needed for the CEO briefing."""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        # Total tickets & status breakdown
        ticket_rows = await conn.fetch(
            """SELECT status, COUNT(*) as count FROM tickets
               WHERE created_at > NOW() - INTERVAL '7 days'
               GROUP BY status"""
        )
        ticket_stats = {r["status"]: int(r["count"]) for r in ticket_rows}
        total_tickets = sum(ticket_stats.values())
        escalation_count = ticket_stats.get("escalated", 0)

        # Channel volume
        channel_rows = await conn.fetch(
            """SELECT initial_channel as channel, COUNT(*) as count
               FROM conversations
               WHERE started_at > NOW() - INTERVAL '7 days'
               GROUP BY initial_channel"""
        )
        channel_breakdown = {r["channel"]: int(r["count"]) for r in channel_rows}

        # Sentiment & latency from metrics
        metric_rows = await conn.fetch(
            """SELECT metric_name, AVG(metric_value)::float as avg_val, MIN(metric_value)::float as min_val, MAX(metric_value)::float as max_val
               FROM agent_metrics
               WHERE recorded_at > NOW() - INTERVAL '7 days'
               GROUP BY metric_name"""
        )
        metrics = {r["metric_name"]: {"avg": r["avg_val"], "min": r["min_val"], "max": r["max_val"]} for r in metric_rows}

        # Top categories
        cat_rows = await conn.fetch(
            """SELECT category, COUNT(*) as count FROM tickets
               WHERE created_at > NOW() - INTERVAL '7 days'
               GROUP BY category ORDER BY count DESC LIMIT 5"""
        )
        top_categories = [{"category": r["category"], "count": int(r["count"])} for r in cat_rows]

        # Auto-resolution rate
        resolved = ticket_stats.get("resolved", 0)
        auto_resolution_rate = round((resolved / total_tickets * 100) if total_tickets else 0, 1)

        return {
            "period": "last_7_days",
            "total_tickets": total_tickets,
            "ticket_breakdown": ticket_stats,
            "escalation_count": escalation_count,
            "escalation_rate_pct": round((escalation_count / total_tickets * 100) if total_tickets else 0, 1),
            "auto_resolution_rate_pct": auto_resolution_rate,
            "channel_breakdown": channel_breakdown,
            "top_categories": top_categories,
            "avg_sentiment": round(metrics.get("sentiment_score", {}).get("avg", 0.75), 3),
            "avg_response_latency_ms": round(metrics.get("response_latency_ms", {}).get("avg", 0), 0),
            "min_response_latency_ms": round(metrics.get("response_latency_ms", {}).get("min", 0), 0),
            "max_response_latency_ms": round(metrics.get("response_latency_ms", {}).get("max", 0), 0),
        }


async def get_latest_briefing() -> Optional[Dict[str, Any]]:
    """Fetch the most recently generated CEO briefing from the database."""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM ceo_briefings ORDER BY created_at DESC LIMIT 1"
        )
        return dict(row) if row else None
