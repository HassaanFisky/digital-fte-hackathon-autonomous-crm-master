import os, base64
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from email.mime.text import MIMEText
from pathlib import Path
import json

SCOPES = ["https://www.googleapis.com/auth/gmail.modify"]

class GmailHandler:
    def __init__(self):
        self.service = None
        self._init_service()

    def _init_service(self):
        creds = None
        token_path = Path("credentials/gmail_token.json")
        creds_path = Path(os.getenv("GMAIL_CREDENTIALS_PATH", "credentials/gmail_credentials.json"))
        
        if token_path.exists():
            creds = Credentials.from_authorized_user_file(str(token_path), SCOPES)
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
                token_path.write_text(creds.to_json())
            # If no valid creds, service will be None (requires manual OAuth flow)
        if creds and creds.valid:
            self.service = build("gmail", "v1", credentials=creds)

    async def send_reply(self, to_email: str, subject: str, body: str, thread_id: str = None) -> dict:
        if not self.service:
            print(f"[GMAIL NOT CONFIGURED] Would send to {to_email}: {body[:100]}")
            return {"channel_message_id": "not_configured", "delivery_status": "skipped"}
        message = MIMEText(body)
        message["to"] = to_email
        message["subject"] = subject if subject.startswith("Re:") else f"Re: {subject}"
        raw = base64.urlsafe_b64encode(message.as_bytes()).decode("utf-8")
        send_req = {"raw": raw}
        if thread_id:
            send_req["threadId"] = thread_id
        result = self.service.users().messages().send(userId="me", body=send_req).execute()
        return {"channel_message_id": result["id"], "delivery_status": "sent"}

    async def get_unread_important(self) -> list:
        if not self.service:
            return []
        try:
            results = self.service.users().messages().list(
                userId="me", q="is:unread is:important", maxResults=10
            ).execute()
            return results.get("messages", [])
        except Exception as e:
            print(f"[GMAIL ERROR] {e}")
            return []
