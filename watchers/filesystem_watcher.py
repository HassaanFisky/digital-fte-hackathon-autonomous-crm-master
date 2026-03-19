import os, time, logging
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import asyncio
from database.queries import update_ticket_status, log_audit
import pathlib

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ARIAWatchdog")

class VaultHandler(FileSystemEventHandler):
    def __init__(self, loop):
        self.loop = loop
        
    def on_moved(self, event):
        if event.is_directory:
            return
        
        # When a file is moved from Pending to Resolved
        source = pathlib.Path(event.src_path)
        dest = pathlib.Path(event.dest_path)
        
        if "Resolved" in dest.parts and "Pending_Approval" in source.parts:
            ticket_id = source.stem.replace("ESCALATE_", "")
            logger.info(f"🔍 Detection: Manual resolution of ticket {ticket_id}")
            
            # Update DB — since we are in a thread, use the event loop
            asyncio.run_coroutine_threadsafe(
                self.resolve_ticket(ticket_id),
                self.loop
            )

    async def resolve_ticket(self, ticket_id: str):
        try:
            from database.connection import get_db_pool
            await get_db_pool() # Ensure pool ready
            
            await update_ticket_status(ticket_id, "resolved", "Manually resolved via vault override by human supervisor.")
            await log_audit("manual_resolution", ticket_id, {"source": "filesystem_watcher"}, "success")
            logger.info(f"✅ Database updated for ticket {ticket_id}")
        except Exception as e:
            logger.error(f"❌ Failed to sync manual resolution for {ticket_id}: {e}")

async def main():
    logger.info("🛡️ ARIA Watchdog initialized...")
    
    vault_path = os.getenv("VAULT_PATH", "./vault")
    pathlib.Path(vault_path).joinpath("Pending_Approval").mkdir(parents=True, exist_ok=True)
    pathlib.Path(vault_path).joinpath("Resolved").mkdir(parents=True, exist_ok=True)
    
    loop = asyncio.get_running_loop()
    event_handler = VaultHandler(loop)
    observer = Observer()
    observer.schedule(event_handler, vault_path, recursive=True)
    observer.start()
    
    logger.info(f"👀 Monitoring vault at: {vault_path}")
    
    try:
        while True:
            await asyncio.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()

if __name__ == "__main__":
    asyncio.run(main())
