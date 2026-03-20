import json
import uuid
from .connection import get_db_pool

async def upsert_customer(email=None, phone=None, name=None):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        customer = None
        if email:
            customer = await conn.fetchrow("SELECT id FROM customers WHERE email = $1", email)
        if not customer and phone:
            customer = await conn.fetchrow("SELECT id FROM customers WHERE phone = $1", phone)
        
        if customer:
            customer_id = customer['id']
            if name:
                await conn.execute("UPDATE customers SET name = $1 WHERE id = $2", name, customer_id)
            return str(customer_id)
        
        # Insert new
        customer_id = await conn.fetchval(
            "INSERT INTO customers (email, phone, name) VALUES ($1, $2, $3) RETURNING id",
            email, phone, name
        )
        return str(customer_id)

async def get_customer_by_email(email):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM customers WHERE email = $1", email)
        return dict(row) if row else None

async def get_customer_by_phone(phone):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM customers WHERE phone = $1", phone)
        return dict(row) if row else None

async def create_conversation(customer_id, channel):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        conv_id = await conn.fetchval(
            "INSERT INTO conversations (customer_id, initial_channel) VALUES ($1, $2) RETURNING id",
            uuid.UUID(customer_id), channel
        )
        return str(conv_id)

async def get_active_conversation(customer_id):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM conversations WHERE customer_id = $1 AND status = 'active' AND started_at > NOW() - interval '24 hours' ORDER BY started_at DESC LIMIT 1",
            uuid.UUID(customer_id)
        )
        return dict(row) if row else None

async def create_message(conversation_id, channel, direction, role, content, **kwargs):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        latency = kwargs.get('latency_ms')
        delivery_status = kwargs.get('delivery_status', 'pending')
        msg_id = await conn.fetchval(
            "INSERT INTO messages (conversation_id, channel, direction, role, content, latency_ms, delivery_status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
            uuid.UUID(conversation_id), channel, direction, role, content, latency, delivery_status
        )
        return str(msg_id)

async def create_ticket(customer_id, conversation_id, channel, subject, category, priority):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        ticket_id = await conn.fetchval(
            "INSERT INTO tickets (customer_id, conversation_id, source_channel, subject, category, priority) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
            uuid.UUID(customer_id), uuid.UUID(conversation_id), channel, subject, category, priority
        )
        return str(ticket_id)

async def update_ticket_status(ticket_id, status, notes=None):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        if status == 'resolved':
            await conn.execute("UPDATE tickets SET status = $1, resolution_notes = $2, resolved_at = NOW() WHERE id = $3", status, notes, uuid.UUID(ticket_id))
        else:
            await conn.execute("UPDATE tickets SET status = $1, resolution_notes = $2 WHERE id = $3", status, notes, uuid.UUID(ticket_id))

async def get_ticket_by_id(ticket_id):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        ticket = await conn.fetchrow("SELECT * FROM tickets WHERE id = $1", uuid.UUID(ticket_id))
        if not ticket:
            return None
        
        messages = await conn.fetch(
            "SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC",
            ticket['conversation_id']
        )
        
        result = dict(ticket)
        result['messages'] = [dict(m) for m in messages]
        return result

async def get_conversation_messages(conversation_id, limit=20):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at DESC LIMIT $2",
            uuid.UUID(conversation_id), limit
        )
        return [dict(r) for r in reversed(rows)]

async def get_customer_cross_channel_history(customer_id):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT m.* 
            FROM messages m
            JOIN conversations c ON m.conversation_id = c.id
            WHERE c.customer_id = $1
            ORDER BY m.created_at DESC
            LIMIT 20
            """,
            uuid.UUID(customer_id)
        )
        return [dict(r) for r in rows]

async def search_knowledge_base(query, limit=5):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT * FROM knowledge_base WHERE title ILIKE $1 OR content ILIKE $1 LIMIT $2",
            f'%{query}%', limit
        )
        return [dict(r) for r in rows]

async def log_audit(action_type, target=None, parameters=None, result="success", error=None):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        params_json = json.dumps(parameters) if parameters else '{}'
        await conn.execute(
            "INSERT INTO audit_log (action_type, target, parameters, result, error_message) VALUES ($1, $2, $3, $4, $5)",
            action_type, target, params_json, result, error
        )

async def record_metric(metric_name, metric_value, channel=None):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            "INSERT INTO agent_metrics (metric_name, metric_value, channel) VALUES ($1, $2, $3)",
            metric_name, metric_value, channel
        )

async def get_channel_metrics_last_24h():
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT channel, COUNT(*) as ticket_count, AVG(sentiment_score) as avg_sentiment
            FROM conversations
            WHERE started_at > NOW() - interval '24 hours'
            GROUP BY channel
            """
        )
        # Handle cases where channel might not exist in conversations (join tickets)
        # Actually agent_metrics might be better for some metrics
        # The prompt says: "group by channel with counts and avg sentiment"
        # We'll use conversations for sentiment
        res = {r['channel']: {"ticket_count": r['ticket_count'], "avg_sentiment": float(r['avg_sentiment'])} for r in rows}
        return res

async def save_briefing(period_start, period_end, briefing_markdown, **stats):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        total_tickets = stats.get('total_tickets', 0)
        escalation_count = stats.get('escalation_count', 0)
        avg_sentiment = stats.get('avg_sentiment', 0.5)
        
        briefing_id = await conn.fetchval(
            """
            INSERT INTO ceo_briefings (period_start, period_end, briefing_markdown, total_tickets, escalation_count, avg_sentiment)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
            """,
            period_start, period_end, briefing_markdown, total_tickets, escalation_count, avg_sentiment
        )
        return str(briefing_id)
