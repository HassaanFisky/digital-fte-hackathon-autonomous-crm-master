import asyncio
import os
import sys

# Add the parent directory to sys.path to import backend modules
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.database import connection

async def migrate():
    print("Running migration for tickets table...")
    try:
        pool = await connection.get_db_pool()
        async with pool.acquire() as conn:
            await conn.execute("ALTER TABLE tickets ADD COLUMN IF NOT EXISTS subject VARCHAR(500);")
            await conn.execute("ALTER TABLE tickets ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;")
            await conn.execute("ALTER TABLE tickets ADD COLUMN IF NOT EXISTS resolution_notes TEXT;")
            print("Migration successful.")
    except Exception as e:
        print(f"Migration error: {e}")

if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    asyncio.run(migrate())
