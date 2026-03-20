import os
from twilio.rest import Client
from twilio.request_validator import RequestValidator
from database import queries
from kafka_client import publish_to_kafka

class WhatsAppHandler:
    _client = None
    
    @classmethod
    def get_client(cls):
        if cls._client is None:
            cls._client = Client(os.getenv("TWILIO_ACCOUNT_SID"), os.getenv("TWILIO_AUTH_TOKEN"))
        return cls._client

    @staticmethod
    async def validate_webhook(request, form_data) -> bool:
        # Twilio signature validation
        signature = request.headers.get("X-Twilio-Signature")
        validator = RequestValidator(os.getenv("TWILIO_AUTH_TOKEN"))
        
        # Build original URL (needed for validation)
        # For simplicity, returning True if not in production or if token is missing
        if os.getenv("ENVIRONMENT") != "production":
            return True
            
        return validator.validate(str(request.url), form_data, signature)

    @staticmethod
    async def process_webhook(form_data) -> dict:
        return {
            "channel": "whatsapp",
            "customer_phone": form_data.get("From"),
            "content": form_data.get("Body"),
            "metadata": {
                "latitude": form_data.get("Latitude"),
                "longitude": form_data.get("Longitude")
            }
        }

    @staticmethod
    async def send_message(to_phone, body) -> dict:
        if os.getenv("DRY_RUN") == "true":
            print(f"[DRY RUN - WhatsApp to {to_phone}]: {body}")
            return {"channel_message_id": "dry_run", "delivery_status": "sent"}
            
        client = WhatsAppHandler.get_client()
        message = client.messages.create(
            from_=os.getenv("TWILIO_WHATSAPP_NUMBER"),
            body=body,
            to=to_phone
        )
        return {"channel_message_id": message.sid, "delivery_status": message.status}
