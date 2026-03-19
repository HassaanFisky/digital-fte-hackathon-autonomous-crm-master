import os
import json
import asyncio
from openai import AsyncOpenAI
import datetime

groq_client = AsyncOpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url=os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1")
)
MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
VAULT_PATH = os.getenv("VAULT_PATH", "./vault")

async def run_until_complete(task_id: str, prompt: str, max_iterations=10):
    os.makedirs(f"{VAULT_PATH}/Logs", exist_ok=True)
    os.makedirs(f"{VAULT_PATH}/Done", exist_ok=True)
    log_file = f"{VAULT_PATH}/Logs/ralph_{task_id}.jsonl"
    
    messages = [
        {"role": "system", "content": "You are Ralph, an autonomous reasoning loop. Output your thoughts. When you are truly finished with the task, you MUST conclude your entire response with exactly the phrase: TASK_COMPLETE"},
        {"role": "user", "content": prompt}
    ]
    
    iterations = 0
    failures = 0
    while iterations < max_iterations:
        iterations += 1
        try:
            response = await groq_client.chat.completions.create(
                model=MODEL,
                messages=messages,
                temperature=0.3,
                max_tokens=2048
            )
            content = response.choices[0].message.content or ""
            
            with open(log_file, "a") as f:
                f.write(json.dumps({"iteration": iterations, "output": content}) + "\n")
            
            if "TASK_COMPLETE" in content:
                done_file = f"{VAULT_PATH}/Done/{task_id}.md"
                with open(done_file, "w") as df:
                    df.write(f"# Task {task_id} Complete\n\n```\n{content}\n```\n")
                return True
                
            messages.append({"role": "assistant", "content": content})
            messages.append({"role": "user", "content": "The task is not yet complete. Please continue your reasoning and provide next steps or final answer. If finished say TASK_COMPLETE."})
        except Exception as e:
            failures += 1
            if failures >= 3:
                error_file = f"{VAULT_PATH}/Logs/ERRORS.md"
                with open(error_file, "a") as ef:
                    ef.write(f"[{datetime.datetime.now().isoformat()}] Task {task_id} failed after 3 retries: {str(e)}\n")
                return False
                
    return False

if __name__ == "__main__":
    asyncio.run(run_until_complete("test_task", "Figure out how to deploy to vercel headless."))
