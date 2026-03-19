"""
ARIA CEO Briefing Generator
===========================
Autonomous Monday Morning Intelligence Report Engine.
Runs on a schedule (every Monday 08:00) or can be triggered manually.

Architecture:
    1. Pull all KPIs from the DB via get_weekly_briefing_stats()
    2. Format a structured data payload as context for the LLM
    3. Call the LLM with CEO_BRIEFING_SYSTEM_PROMPT
    4. Persist the generated markdown to ceo_briefings table
    5. Optionally email the briefing to a configured recipient
"""

import asyncio
import json
import logging
import os
import schedule
import time
from datetime import date, datetime, timedelta
from threading import Thread

from database.connection import get_db_pool, close_db_pool
from database.queries import get_weekly_briefing_stats, save_briefing, get_latest_briefing
from agent.llm_client import chat_completion
from agent.prompts import CEO_BRIEFING_SYSTEM_PROMPT

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s"
)
logger = logging.getLogger("CEOBriefingEngine")


def _format_stats_for_llm(stats: dict) -> str:
    """Convert the raw KPI dict into a structured, LLM-digestible context block."""
    channel_lines = "\n".join(
        f"  - {ch}: {vol} conversations"
        for ch, vol in stats.get("channel_breakdown", {}).items()
    )
    category_lines = "\n".join(
        f"  - {c['category']}: {c['count']} tickets"
        for c in stats.get("top_categories", [])
    )
    ticket_status_lines = "\n".join(
        f"  - {status}: {count}"
        for status, count in stats.get("ticket_breakdown", {}).items()
    )

    return f"""
## Operational Data Context — Last 7 Days

### Volume
- Total Tickets: {stats['total_tickets']}
- Ticket Status Breakdown:
{ticket_status_lines or '  - No data'}

### Performance
- Auto-Resolution Rate: {stats['auto_resolution_rate_pct']}%
- Escalation Count: {stats['escalation_count']} ({stats['escalation_rate_pct']}% of volume)
- Avg Sentiment Score: {stats['avg_sentiment']} (0 = very negative, 1 = very positive)
- Avg AI Response Latency: {stats['avg_response_latency_ms']}ms
- Fastest Response: {stats['min_response_latency_ms']}ms
- Slowest Response: {stats['max_response_latency_ms']}ms

### Channel Breakdown
{channel_lines or '  - No data'}

### Top Issue Categories
{category_lines or '  - No data'}

### Report Context
- Generated: {datetime.now().strftime('%A, %B %d, %Y at %H:%M UTC')}
- Period: {stats['period']}
""".strip()


async def generate_briefing() -> dict:
    """
    Full pipeline: DB query → LLM inference → DB persist.
    Returns the generated briefing dict.
    """
    logger.info("📊 Pulling weekly KPIs from database...")
    try:
        stats = await get_weekly_briefing_stats()
    except Exception as e:
        logger.error(f"❌ Failed to fetch KPI stats: {e}")
        raise

    if stats["total_tickets"] == 0:
        logger.warning("⚠️  Zero tickets this week. Generating diagnostic briefing instead.")

    context_block = _format_stats_for_llm(stats)
    logger.info(f"📝 KPI context built. Tickets: {stats['total_tickets']}, Escalations: {stats['escalation_count']}")

    # Build the prompt
    messages = [
        {"role": "system", "content": CEO_BRIEFING_SYSTEM_PROMPT},
        {
            "role": "user",
            "content": (
                "Generate this week's CEO Briefing. "
                "Use ONLY the data provided below. "
                "Be clinical, data-driven, and actionable. "
                "Highlight both wins and risks with equal weight.\n\n"
                f"{context_block}"
            )
        }
    ]

    logger.info("🤖 Calling LLM for briefing generation...")
    try:
        response = await chat_completion(
            messages=messages,
            temperature=0.5,  # Slightly creative but still factual
            max_tokens=3000,
        )
        briefing_markdown = response.choices[0].message.content
        logger.info(f"✅ LLM generated briefing ({len(briefing_markdown)} chars)")
    except Exception as e:
        logger.error(f"❌ LLM call failed: {e}")
        raise

    # Persist to database
    period_end = date.today()
    period_start = period_end - timedelta(days=7)

    try:
        briefing_id = await save_briefing(
            period_start=period_start,
            period_end=period_end,
            briefing_markdown=briefing_markdown,
            total_tickets=stats["total_tickets"],
            escalation_count=stats["escalation_count"],
            avg_sentiment=stats["avg_sentiment"],
        )
        logger.info(f"💾 Briefing saved to DB with ID: {briefing_id}")
    except Exception as e:
        logger.error(f"❌ Failed to persist briefing: {e}")
        raise

    # Optionally email the briefing
    recipient = os.getenv("CEO_BRIEFING_EMAIL")
    if recipient:
        await _send_briefing_email(recipient, briefing_markdown, period_start, period_end)

    return {
        "briefing_id": briefing_id,
        "period_start": str(period_start),
        "period_end": str(period_end),
        "total_tickets": stats["total_tickets"],
        "escalation_count": stats["escalation_count"],
        "avg_sentiment": stats["avg_sentiment"],
        "briefing_markdown": briefing_markdown,
        "generated_at": datetime.now().isoformat(),
    }


async def _send_briefing_email(to_email: str, markdown: str, period_start: date, period_end: date):
    """Send the CEO briefing via Gmail if configured."""
    try:
        from channels.gmail_handler import GmailHandler
        handler = GmailHandler()
        subject = f"📊 ARIA CEO Briefing — Week of {period_start.strftime('%b %d')} to {period_end.strftime('%b %d, %Y')}"
        result = await handler.send_reply(to_email, subject, markdown)
        logger.info(f"📧 Briefing emailed to {to_email}. Status: {result.get('delivery_status')}")
    except Exception as e:
        logger.warning(f"⚠️  Email send failed (non-critical): {e}")


def _run_scheduled():
    """Thread-safe scheduler runner."""
    while True:
        schedule.run_pending()
        time.sleep(30)


async def main():
    logger.info("🚀 ARIA CEO Briefing Engine starting...")

    # Initialize DB connection
    await get_db_pool()
    logger.info("✅ Database pool ready")

    # Schedule the briefing every Monday at 08:00
    def _sync_generate():
        asyncio.run(generate_briefing())

    schedule.every().monday.at("08:00").do(_sync_generate)
    logger.info("⏰ Scheduled: Monday 08:00 weekly briefing")

    # If RUN_BRIEFING_NOW is set, generate immediately on startup
    if os.getenv("RUN_BRIEFING_NOW", "false").lower() == "true":
        logger.info("⚡ RUN_BRIEFING_NOW=true — generating immediately...")
        try:
            result = await generate_briefing()
            logger.info(f"✅ Immediate briefing complete. ID: {result['briefing_id']}")
        except Exception as e:
            logger.error(f"❌ Immediate briefing failed: {e}")

    # Start the scheduler in a background thread so we can keep the async loop free
    scheduler_thread = Thread(target=_run_scheduled, daemon=True)
    scheduler_thread.start()
    logger.info("🔄 Scheduler thread active. Waiting for Monday 08:00...")

    # Keep the process alive
    try:
        while True:
            await asyncio.sleep(60)
    except KeyboardInterrupt:
        logger.info("🛑 Briefing engine shutting down gracefully...")
        await close_db_pool()


if __name__ == "__main__":
    asyncio.run(main())
