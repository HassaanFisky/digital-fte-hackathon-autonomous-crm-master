import os
import asyncio
import datetime
from openai import AsyncOpenAI
from database.queries import get_channel_metrics_last_24h
from database.connection import close_db_pool

groq_client = AsyncOpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url=os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1")
)
MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
VAULT_PATH = os.getenv("VAULT_PATH", "./vault")

from agent.prompts import CEO_BRIEFING_SYSTEM_PROMPT

async def generate_briefing():
    os.makedirs(f"{VAULT_PATH}/Briefings", exist_ok=True)
    os.makedirs(f"{VAULT_PATH}/Done", exist_ok=True)
    
    # Read Business Goals
    try:
        with open(f"{VAULT_PATH}/Business_Goals.md", "r") as f:
            goals = f.read()
    except:
        goals = "No business goals defined."
        
    done_count = len([name for name in os.listdir(f"{VAULT_PATH}/Done") if os.path.isfile(os.path.join(f"{VAULT_PATH}/Done", name))]) if os.path.exists(f"{VAULT_PATH}/Done") else 0
    try:
        metrics = await get_channel_metrics_last_24h()
    except:
        metrics = "Metrics DB not connected."
        
    prompt = f"Goals:\n{goals}\n\nTasks Done: {done_count}\n\nMetrics:\n{metrics}\n\nPlease generate the Monday Morning CEO Briefing."
    
    response = await groq_client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": CEO_BRIEFING_SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        temperature=0.4
    )
    
    markdown_content = response.choices[0].message.content or ""
    today = datetime.datetime.now().strftime("%Y-%m-%d")
    
    briefing_file = f"{VAULT_PATH}/Briefings/{today}_Monday_Briefing.md"
    with open(briefing_file, "w") as bf:
        bf.write(markdown_content)
        
    # Update dashboard
    db_file = f"{VAULT_PATH}/Dashboard.md"
    try:
        with open(db_file, "a") as f:
            f.write(f"\n\n## Latest Briefing ({today})\n{markdown_content[:200]}...\n")
    except:
        pass
        
    # pseudo DB insert
    from database.queries import save_briefing
    try:
        period_start = datetime.datetime.now() - datetime.timedelta(days=7)
        await save_briefing(period_start, datetime.datetime.now(), markdown_content)
    except:
        pass
        
    print(f"Briefing generated successfully at {briefing_file}")

if __name__ == "__main__":
    asyncio.run(generate_briefing())
