import os
import json
from datetime import datetime, timedelta
from openai import AsyncOpenAI
from database import queries, connection

async def generate_briefing() -> str:
    pool = await connection.get_db_pool()
    async with pool.acquire() as conn:
        # Get stats for last 7 days
        period_end = datetime.now().date()
        period_start = period_end - timedelta(days=7)
        
        # Total tickets
        total_tickets = await conn.fetchval(
            "SELECT COUNT(*) FROM tickets WHERE created_at > NOW() - interval '7 days'"
        )
        # Escalation count
        escalation_count = await conn.fetchval(
            "SELECT COUNT(*) FROM tickets WHERE status = 'escalated' AND created_at > NOW() - interval '7 days'"
        )
        # Average sentiment
        avg_sentiment = await conn.fetchval(
            "SELECT AVG(sentiment_score) FROM conversations WHERE started_at > NOW() - interval '7 days'"
        )
        # Top categories
        top_categories = await conn.fetch(
            "SELECT category, COUNT(*) as count FROM tickets WHERE created_at > NOW() - interval '7 days' GROUP BY category ORDER BY count DESC LIMIT 3"
        )
        
        stats = {
            "total_tickets": total_tickets or 0,
            "escalation_count": escalation_count or 0,
            "avg_sentiment": float(avg_sentiment or 0.5),
            "top_categories": [dict(r) for r in top_categories]
        }
        
    client = AsyncOpenAI(
        api_key=os.getenv("GROQ_API_KEY"),
        base_url=os.getenv("GROQ_BASE_URL")
    )
    
    # Generate structured markdown with Groq
    response = await client.chat.completions.create(
        model=os.getenv("GROQ_MODEL"),
        messages=[{
            "role": "system",
            "content": "You are a CEO Briefing Generator. Synthesize the provided support stats into a professional executive summary. Use markdown with sections: Executive Summary, KPIs, Wins, Bottlenecks, Recommendations."
        }, {
            "role": "user",
            "content": f"Stats for {period_start} to {period_end}:\n{json.dumps(stats)}"
        }],
        temperature=0.3,
        max_tokens=4096
    )
    
    briefing_markdown = response.choices[0].message.content
    
    # Save to database
    await queries.save_briefing(period_start, period_end, briefing_markdown, **stats)
    
    return briefing_markdown
