import time
import logging

class BaseWatcher:
    def __init__(self, check_interval=60):
        self.check_interval = check_interval
        self.running = False
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(self.__class__.__name__)

    def check(self):
        raise NotImplementedError("Subclasses must implement check()")

    def run(self):
        self.running = True
        self.logger.info(f"Started {self.__class__.__name__} with interval {self.check_interval}s")
        while self.running:
            try:
                self.check()
            except Exception as e:
                self.logger.error(f"Error in watcher check: {e}")
            time.sleep(self.check_interval)

    def stop(self):
        self.running = False
        self.logger.info(f"Stopped {self.__class__.__name__}")
