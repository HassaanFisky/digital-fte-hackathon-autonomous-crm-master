from watchers.base_watcher import BaseWatcher
from backend.channels.gmail_handler import GmailHandler
import os

class GmailWatcher(BaseWatcher):
    def __init__(self, check_interval=120):
        super().__init__(check_interval)
        self.handler = GmailHandler()
        self.vault_path = os.getenv("VAULT_PATH", "./vault")

    def check(self):
        self.logger.info("Polling Gmail for unread and important messages...")
        # Since this uses async functions in the real logic, we'd wrap it in an asyncio loop
        # For the mock/watcher structure described in prompt:
        import asyncio
        messages = asyncio.run(self.handler.get_unread_important())
        
        for msg in messages:
            file_path = f"{self.vault_path}/Needs_Action/GMAIL_{msg['id']}.md"
            if not os.path.exists(file_path):
                os.makedirs(os.path.dirname(file_path), exist_ok=True)
                with open(file_path, "w") as f:
                    f.write(f"---\nmessage_id: {msg['id']}\nsource: gmail\n---\nNeeds action.")
                self.logger.info(f"Created needs action item for {msg['id']}")

if __name__ == "__main__":
    watcher = GmailWatcher()
    watcher.run()
