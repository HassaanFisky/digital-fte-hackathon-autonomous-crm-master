from enum import Enum
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field
from database import queries
from kafka_client import publish_to_kafka

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

@router.post("/submit")
async def submit_form(submission: SupportFormSubmission):
    try:
        # Upsert customer
        customer_id = await queries.upsert_customer(
            email=submission.email,
            name=submission.name
        )
        
        # Publish to Kafka for processing
        event = {
            "customer_id": customer_id,
            "channel": "web_form",
            "customer_contact": submission.email,
            "subject": submission.subject,
            "content": submission.message,
            "category": submission.category.value,
            "priority": submission.priority.value
        }
        
        await publish_to_kafka("fte.tickets.incoming", event)
        
        return {
            "status": "success",
            "message": "Your request has been received. Our AI agent ARIA is processing it.",
            "estimated_response_time": "< 30 seconds"
        }
    except Exception as e:
        print(f"Webform error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/ticket/{ticket_id}")
async def get_ticket(ticket_id: str):
    ticket = await queries.get_ticket_by_id(ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket
