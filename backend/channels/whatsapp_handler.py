from twilio.rest import Client
from twilio.request_validator import RequestValidator
from fastapi import Request, HTTPException
import os
from datetime import datetime

class WhatsAppHandler:
    def __init__(self):
        self.client = Client(os.getenv("TWILIO_ACCOUNT_SID"), os.getenv("TWILIO_AUTH_TOKEN"))
        self.validator = RequestValidator(os.getenv("TWILIO_AUTH_TOKEN"))
        self.number = os.getenv("TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")

    async def validate_webhook(self, request: Request) -> bool:
        signature = request.headers.get("X-Twilio-Signature", "")
        url = str(request.url)
        form_data = dict(await request.form())
        return self.validator.validate(url, form_data, signature)

    async def process_webhook(self, form_data: dict) -> dict:
        return {
            "channel": "whatsapp",
            "channel_message_id": form_data.get("MessageSid"),
            "customer_phone": form_data.get("From", "").replace("whatsapp:", ""),
            "customer_name": form_data.get("ProfileName", "WhatsApp User"),
            "content": form_data.get("Body", ""),
            "received_at": datetime.utcnow().isoformat(),
            "metadata": {
                "wa_id": form_data.get("WaId"),
                "profile_name": form_data.get("ProfileName"),
                "num_media": form_data.get("NumMedia", "0")
            }
        }

    async def send_message(self, to_phone: str, body: str) -> dict:
        if not to_phone.startswith("whatsapp:"):
            to_phone = f"whatsapp:{to_phone}"
        if len(body) > 1600:
            body = body[:1597] + "..."
        msg = self.client.messages.create(body=body, from_=self.number, to=to_phone)
        return {"channel_message_id": msg.sid, "delivery_status": msg.status}
