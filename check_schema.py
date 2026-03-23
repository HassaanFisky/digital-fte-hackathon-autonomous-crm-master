import asyncio
import os
import sys

# Add the parent directory to sys.path to import backend modules
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.database import connection

async def check_schema():
    print("Checking tickets table schema...")
    try:
        pool = await connection.get_db_pool()
        async with pool.acquire() as conn:
            columns = await conn.fetch("""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'tickets'
                ORDER BY ordinal_position
            """)
            for c in columns:
                print(f"Col: {c['column_name']} ({c['data_type']})")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    asyncio.run(check_schema())
