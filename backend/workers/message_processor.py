import asyncio, os, json, logging
from datetime import datetime
from kafka_client import create_consumer, TOPICS
from agent.crm_agent import run_agent
from database.queries import (
    upsert_customer, create_conversation, get_active_conversation,
    create_message, get_conversation_messages, record_metric
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("MessageProcessor")

async def process_message(message: dict):
    start = datetime.now()
    channel = message.get("channel", "web_form")
    content = message.get("content", "")
    
    try:
        customer_id = await upsert_customer(
            email=message.get("customer_email"),
            phone=message.get("customer_phone"),
            name=message.get("customer_name", "Customer")
        )
        
        conv = await get_active_conversation(customer_id)
        if not conv:
            conv_id = await create_conversation(customer_id, channel)
        else:
            conv_id = str(conv["id"])
        
        await create_message(conv_id, channel, "inbound", "customer", content,
                             channel_message_id=message.get("channel_message_id"))
        
        history = await get_conversation_messages(conv_id, limit=10)
        formatted_history = [
            {"role": "assistant" if m["role"] == "agent" else "user", "content": m["content"]}
            for m in reversed(history)
        ]
        
        customer_contact = message.get("customer_email") or message.get("customer_phone", "")
        
        result = await run_agent(
            customer_id=customer_id,
            channel=channel,
            content=content,
            customer_contact=customer_contact,
            subject=message.get("subject", "Customer Support Request"),
            conversation_history=formatted_history
        )
        
        latency = int((datetime.now() - start).total_seconds() * 1000)
        logger.info(f"✅ Processed {channel} message | Latency: {latency}ms | Escalated: {result['escalated']}")
        await record_metric("messages_processed", 1, channel)
        
    except Exception as e:
        logger.error(f"❌ Processing error: {e}")

async def main():
    logger.info("🚀 Message Processor starting...")
    consumer = create_consumer([TOPICS["tickets_incoming"]], "fte-processor-main")
    await consumer.start()
    logger.info("✅ Connected to Confluent Kafka — listening for tickets...")
    try:
        async for msg in consumer:
            asyncio.create_task(process_message(msg.value))
    finally:
        await consumer.stop()

if __name__ == "__main__":
    asyncio.run(main())
