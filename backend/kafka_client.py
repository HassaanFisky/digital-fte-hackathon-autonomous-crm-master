import os, json
from datetime import datetime
from aiokafka import AIOKafkaProducer, AIOKafkaConsumer
from aiokafka.helpers import create_ssl_context

KAFKA_BOOTSTRAP = os.getenv("KAFKA_BOOTSTRAP_SERVERS")
KAFKA_API_KEY = os.getenv("KAFKA_API_KEY")
KAFKA_API_SECRET = os.getenv("KAFKA_API_SECRET")

TOPICS = {
    "tickets_incoming": "fte.tickets.incoming",
    "email_inbound": "fte.channels.email.inbound",
    "whatsapp_inbound": "fte.channels.whatsapp.inbound",
    "webform_inbound": "fte.channels.webform.inbound",
    "escalations": "fte.escalations",
    "metrics": "fte.metrics",
    "dlq": "fte.dlq"
}

_producer = None

async def get_producer() -> AIOKafkaProducer:
    global _producer
    if _producer is None:
        ssl_ctx = create_ssl_context()
        _producer = AIOKafkaProducer(
            bootstrap_servers=KAFKA_BOOTSTRAP,
            security_protocol="SASL_SSL",
            sasl_mechanism="PLAIN",
            sasl_plain_username=KAFKA_API_KEY,
            sasl_plain_password=KAFKA_API_SECRET,
            ssl_context=ssl_ctx,
            value_serializer=lambda v: json.dumps(v).encode("utf-8")
        )
        await _producer.start()
    return _producer

async def publish_to_kafka(topic: str, event: dict):
    event["timestamp"] = datetime.utcnow().isoformat()
    try:
        producer = await get_producer()
        await producer.send_and_wait(topic, event)
    except Exception as e:
        print(f"[KAFKA ERROR] Topic: {topic} | Error: {e}")

def create_consumer(topics: list, group_id: str) -> AIOKafkaConsumer:
    ssl_ctx = create_ssl_context()
    return AIOKafkaConsumer(
        *topics,
        bootstrap_servers=KAFKA_BOOTSTRAP,
        security_protocol="SASL_SSL",
        sasl_mechanism="PLAIN",
        sasl_plain_username=KAFKA_API_KEY,
        sasl_plain_password=KAFKA_API_SECRET,
        ssl_context=ssl_ctx,
        group_id=group_id,
        value_deserializer=lambda v: json.loads(v.decode("utf-8")),
        auto_offset_reset="earliest"
    )
