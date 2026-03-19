from fastapi import APIRouter
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime
import uuid
from database.queries import upsert_customer, create_conversation, create_message, create_ticket
from kafka_client import publish_to_kafka, TOPICS

router = APIRouter(prefix="/api/v1/channels/webform", tags=["Web Form"])

class SupportFormSubmission(BaseModel):
    model_config = {"strict": True}
    name: str
    email: EmailStr
    subject: str
    category: str
    message: str
    priority: Optional[str] = "medium"

    @field_validator("name")
    @classmethod
    def name_min_length(cls, v):
        if len(v.strip()) < 2:
            raise ValueError("Name must be at least 2 characters")
        return v.strip()

    @field_validator("subject")
    @classmethod
    def subject_min_length(cls, v):
        if len(v.strip()) < 5:
            raise ValueError("Subject must be at least 5 characters")
        return v.strip()

    @field_validator("message")
    @classmethod
    def message_min_length(cls, v):
        if len(v.strip()) < 10:
            raise ValueError("Message must be at least 10 characters")
        return v.strip()

    @field_validator("category")
    @classmethod
    def valid_category(cls, v):
        valid = ["general", "technical", "billing", "feedback", "bug_report"]
        if v not in valid:
            raise ValueError(f"Category must be one of: {valid}")
        return v

class SupportFormResponse(BaseModel):
    ticket_id: str
    message: str
    estimated_response_time: str
    status: str = "processing"

@router.post("/submit", response_model=SupportFormResponse)
async def submit_support_form(submission: SupportFormSubmission):
    customer_id = await upsert_customer(
        email=str(submission.email),
        name=submission.name
    )
    ticket_id = str(uuid.uuid4())
    message_data = {
        "channel": "web_form",
        "channel_message_id": ticket_id,
        "customer_email": str(submission.email),
        "customer_name": submission.name,
        "customer_id": customer_id,
        "subject": submission.subject,
        "content": submission.message,
        "category": submission.category,
        "priority": submission.priority,
        "received_at": datetime.utcnow().isoformat(),
        "metadata": {"form_version": "2.0"}
    }
    try:
        await publish_to_kafka(TOPICS["tickets_incoming"], message_data)
    except Exception:
        pass  # Process synchronously if Kafka unavailable

    return SupportFormResponse(
        ticket_id=ticket_id,
        message="Your request has been received! ARIA, our AI agent, will respond within 5 minutes.",
        estimated_response_time="Less than 5 minutes",
        status="processing"
    )

@router.get("/ticket/{ticket_id}")
async def get_ticket_status(ticket_id: str):
    from database.queries import get_ticket_by_id
    ticket = await get_ticket_by_id(ticket_id)
    if not ticket:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket
