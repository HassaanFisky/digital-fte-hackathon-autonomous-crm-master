import os
import json
import asyncio
from aiokafka import AIOKafkaProducer, AIOKafkaConsumer

TOPICS = {
    "incoming_tickets": "fte.tickets.incoming",
    "metrics": "fte.metrics.general",
    "ceo_briefings": "fte.ceo.briefing"
}

_producer = None

async def get_producer():
    global _producer
    if _producer is None:
        _producer = AIOKafkaProducer(
            bootstrap_servers=os.getenv("KAFKA_BOOTSTRAP_SERVERS"),
            security_protocol="SASL_SSL",
            sasl_mechanism="PLAIN",
            sasl_plain_username=os.getenv("KAFKA_API_KEY"),
            sasl_plain_password=os.getenv("KAFKA_API_SECRET"),
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )
        await _producer.start()
    return _producer

async def publish_to_kafka(topic, event):
    try:
        if os.getenv("DRY_RUN") == "true":
            print(f"[DRY RUN - Kafka Topic {topic}]: {json.dumps(event)}")
            return
            
        producer = await get_producer()
        # Handle cases where topic is not in TOPICS mapping
        topic_name = TOPICS.get(topic, topic)
        await producer.send_and_wait(topic_name, event)
    except Exception as e:
        print(f"Kafka publish error: {e}")
        # Continue as per instructions (never crash API)
        pass

async def create_consumer(topics, group_id):
    topic_names = [TOPICS.get(t, t) for t in topics]
    consumer = AIOKafkaConsumer(
        *topic_names,
        bootstrap_servers=os.getenv("KAFKA_BOOTSTRAP_SERVERS"),
        group_id=group_id,
        auto_offset_reset="earliest",
        security_protocol="SASL_SSL",
        sasl_mechanism="PLAIN",
        sasl_plain_username=os.getenv("KAFKA_API_KEY"),
        sasl_plain_password=os.getenv("KAFKA_API_SECRET")
    )
    return consumer
