import asyncio
import os
import sys

# Add the parent directory to sys.path to import backend modules
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.database import queries

async def verify_queries():
    print("Verifying database queries...")
    try:
        tickets = await queries.get_tickets(limit=1)
        print(f"Successfully fetched {len(tickets)} tickets.")
        if tickets:
            print(f"Sample ticket: {tickets[0]}")
    except Exception as e:
        print(f"Error fetching tickets: {e}")

if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    asyncio.run(verify_queries())
