import asyncio
import json
from database import queries
from kafka_client import create_consumer
from agent.crm_agent import run_agent

class UnifiedMessageProcessor:
    def __init__(self, group_id="aria-worker-group"):
        self.group_id = group_id

    async def start(self):
        consumer = await create_consumer(["fte.tickets.incoming"], self.group_id)
        await consumer.start()
        
        print(f"UnifiedMessageProcessor started on group {self.group_id}")
        
        try:
            async for msg in consumer:
                try:
                    event = json.loads(msg.value.decode('utf-8'))
                    await self.process_event(event)
                except Exception as e:
                    print(f"Error processing kafka event: {e}")
                    # Log and continue as per instructions
                    continue
        finally:
            await consumer.stop()

    async def process_event(self, event):
        customer_email = event.get("customer_contact") if "@" in str(event.get("customer_contact", "")) else None
        customer_phone = event.get("customer_contact") if "@" not in str(event.get("customer_contact", "")) else None
        
        # Upsert customer
        customer_id = await queries.upsert_customer(
            email=customer_email,
            phone=customer_phone,
            name=event.get("name")
        )
        
        # Get or create conversation (run_agent handles some of this, but we'll do it manually)
        conv = await queries.get_active_conversation(customer_id)
        if not conv:
            conversation_id = await queries.create_conversation(customer_id, event.get("channel"))
        else:
            conversation_id = str(conv['id'])
            
        # Get history
        history = await queries.get_conversation_messages(conversation_id)
        # Format as list for run_agent
        formatted_history = [{"role": m['role'], "content": m['content']} for m in history]
        
        # Run AI agent
        result = await run_agent(
            customer_id=customer_id,
            channel=event.get("channel"),
            content=event.get("content"),
            customer_contact=event.get("customer_contact"),
            subject=event.get("subject", "Inquiry from Web Form"),
            conversation_history=formatted_history
        )
        
        # Log result
        await queries.log_audit("agent_run", target=customer_id, parameters={
            "channel": event.get("channel"),
            "ticket_id": result.get("ticket_id"),
            "escalated": result.get("escalated")
        })
        
        print(f"Processed message for customer {customer_id} on channel {event.get('channel')}")

if __name__ == "__main__":
    processor = UnifiedMessageProcessor()
    asyncio.run(processor.start())
