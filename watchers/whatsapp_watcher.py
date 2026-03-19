from watchers.base_watcher import BaseWatcher

class WhatsAppWatcher(BaseWatcher):
    def __init__(self, check_interval=60):
        super().__init__(check_interval)
        self.keywords = ["urgent", "invoice", "payment", "asap", "help"]

    def check(self):
        self.logger.info(f"Checking WhatsApp metrics or queues for keywords: {self.keywords}")
        # In a real implementation this might poll Twilio or internal DB
        pass

if __name__ == "__main__":
    watcher = WhatsAppWatcher()
    watcher.run()
