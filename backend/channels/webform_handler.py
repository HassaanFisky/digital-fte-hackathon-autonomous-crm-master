"""
channels/webform_handler.py

Web form channel handler.
Bypasses Kafka — writes ticket directly to the database so data appears
in the dashboard immediately. The AI agent runs as a fire-and-forget
asyncio background task, keeping API response time < 1s.
"""
import asyncio
from enum import Enum
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field
from database import queries

router = APIRouter(prefix="/api/v1/channels/webform", tags=["webform"])


class Category(str, Enum):
    general = "general"
    technical = "technical"
    billing = "billing"
    feedback = "feedback"
    bug_report = "bug_report"


class Priority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class SupportFormSubmission(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    subject: str = Field(..., min_length=5)
    category: Category
    message: str = Field(..., min_length=10)
    priority: Priority = Priority.medium


async def _run_agent_background(
    customer_id: str,
    conversation_id: str,
    ticket_id: str,
    channel: str,
    content: str,
    customer_contact: str,
    subject: str,
) -> None:
    """Fire-and-forget task: run the AI agent, update ticket status."""
    try:
        from agent.crm_agent import run_agent
        result = await run_agent(
            customer_id=customer_id,
            channel=channel,
            content=content,
            customer_contact=customer_contact,
            subject=subject,
        )
        # Mark ticket as resolved or escalated based on agent result
        final_status = "escalated" if result.get("escalated") else "resolved"
        await queries.update_ticket_status(
            ticket_id,
            final_status,
            result.get("output", "")[:2000],
        )
    except Exception as exc:  # pragma: no cover
        print(f"[webform background agent error] ticket={ticket_id}: {exc}")
        # Best-effort: mark as open so a human can pick it up
        try:
            await queries.update_ticket_status(ticket_id, "open", str(exc)[:500])
        except Exception:
            pass


@router.post("/submit")
async def submit_form(submission: SupportFormSubmission):
    try:
        # 1. Upsert customer
        customer_id = await queries.upsert_customer(
            email=submission.email,
            name=submission.name,
        )

        # 2. Create a new conversation for this channel session
        conversation_id = await queries.create_conversation(customer_id, "web_form")

        # 3. Write the ticket to the DB immediately (it shows up in the dashboard at once)
        ticket_id = await queries.create_ticket(
            customer_id=customer_id,
            conversation_id=conversation_id,
            channel="web_form",
            subject=submission.subject,
            category=submission.category.value,
            priority=submission.priority.value,
        )

        # 4. Store the inbound message so the conversation thread is populated
        await queries.create_message(
            conversation_id=conversation_id,
            channel="web_form",
            direction="inbound",
            role="customer",
            content=submission.message,
        )

        # 5. Spin up the AI agent in the background (non-blocking)
        asyncio.create_task(
            _run_agent_background(
                customer_id=customer_id,
                conversation_id=conversation_id,
                ticket_id=ticket_id,
                channel="web_form",
                content=submission.message,
                customer_contact=submission.email,
                subject=submission.subject,
            )
        )

        return {
            "status": "success",
            "ticket_id": ticket_id,
            "message": "Your request has been received. ARIA is on it.",
            "estimated_response_time": "< 30 seconds",
        }

    except Exception as exc:
        print(f"Webform submit error: {exc}")
        raise HTTPException(status_code=500, detail="Internal server error")
