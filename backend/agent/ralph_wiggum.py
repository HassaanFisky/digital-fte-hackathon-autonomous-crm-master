import os
import asyncio
from openai import AsyncOpenAI

class RalphWiggumLoop:
    def __init__(self, group_id="ralph-watcher-group"):
        self.group_id = group_id
        self.client = AsyncOpenAI(
            api_key=os.getenv("GROQ_API_KEY"),
            base_url=os.getenv("GROQ_BASE_URL")
        )

    async def run_until_complete(self, task_id, prompt, max_iterations=10) -> bool:
        """
        Self-healing loop that iterates on a task until completion or failure.
        """
        current_context = ""
        iteration = 0
        
        # Log to file
        log_file = f"e:/logs/ralph_{task_id}.log"
        os.makedirs(os.path.dirname(log_file), exist_ok=True)
        
        with open(log_file, "a") as f:
            f.write(f"--- Task {task_id} started ---\n")
            
        while iteration < max_iterations:
            try:
                iteration += 1
                messages = [
                    {"role": "system", "content": "You are Ralph Wiggum, an autonomous watcher. Complete the task as requested. If the task is finished, output 'TASK_COMPLETE'. Otherwise, generate the next steps or instructions for improvement."},
                    {"role": "user", "content": f"Previous iteration context: {current_context}\nTask prompt: {prompt}"}
                ]
                
                response = await self.client.chat.completions.create(
                    model=os.getenv("GROQ_MODEL"),
                    messages=messages,
                    temperature=0.3,
                    max_tokens=2048
                )
                
                output = response.choices[0].message.content
                
                with open(log_file, "a") as f:
                    f.write(f"--- Iteration {iteration} ---\n{output}\n")
                
                if "TASK_COMPLETE" in output:
                    print(f"Task {task_id} completed successfully after {iteration} iterations.")
                    return True
                    
                # Re-inject previous output as context for next
                current_context = output
                
            except Exception as e:
                print(f"Ralph Wiggum iteration {iteration} failure: {e}")
                if iteration >= 3:
                    error_log = f"c:/logs/ralph_ERRORS.log"
                    os.makedirs(os.path.dirname(error_log), exist_ok=True)
                    with open(error_log, "a") as f:
                        f.write(f"Task {task_id} failed at iteration {iteration}: {e}\n")
                    return False
        
        print(f"Task {task_id} reached max iterations ({max_iterations}) without completion.")
        return False
