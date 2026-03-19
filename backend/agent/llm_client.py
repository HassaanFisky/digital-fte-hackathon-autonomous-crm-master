import os, asyncio, logging
from openai import AsyncOpenAI
from typing import List, Dict, Any, Optional

logger = logging.getLogger("LLMClient")

class LLMProvider:
    def __init__(self, name: str, api_key: str, base_url: str, default_model: str):
        self.name = name
        self.client = AsyncOpenAI(api_key=api_key, base_url=base_url)
        self.default_model = default_model

# Preferred Providers Config
OPENROUTER = LLMProvider(
    name="OpenRouter",
    api_key=os.getenv("OPENROUTER_API_KEY", ""),
    base_url="https://openrouter.ai/api/v1",
    default_model=os.getenv("OPENROUTER_MODEL", "google/gemini-2.0-flash-exp:free")
)

GROQ = LLMProvider(
    name="GROQ",
    api_key=os.getenv("GROQ_API_KEY", ""),
    base_url=os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1"),
    default_model=os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
)

async def chat_completion(
    messages: List[Dict[str, str]], 
    tools: Optional[List[Dict[str, Any]]] = None,
    tool_choice: str = "auto",
    temperature: float = 0.3,
    max_tokens: int = 2048,
    priority_provider: Optional[str] = None
) -> Any:
    """Resilient chat completion with primary (OpenRouter) and secondary (GROQ) providers."""
    
    providers = [OPENROUTER, GROQ]
    if priority_provider == "GROQ":
        providers = [GROQ, OPENROUTER]
        
    last_error = None
    for provider in providers:
        if not provider.api_key:
            continue
            
        try:
            logger.info(f"🔄 Attempting completion via {provider.name}...")
            response = await provider.client.chat.completions.create(
                model=provider.default_model,
                messages=messages,
                tools=tools,
                tool_choice=tool_choice if tools else None,
                temperature=temperature,
                max_tokens=max_tokens,
                extra_headers={
                    "HTTP-Referer": "https://aria.techcorp.local",
                    "X-Title": "Digital FTE ARIA Agent"
                } if provider.name == "OpenRouter" else {}
            )
            logger.info(f"✅ Success via {provider.name}")
            return response
        except Exception as e:
            logger.warning(f"❌ {provider.name} failed: {e}")
            last_error = e
            continue
            
    raise Exception(f"All LLM providers failed. Last error: {last_error}")

async def analyze_sentiment(text: str) -> float:
    """Dedicated sentiment analysis with fast routing."""
    try:
        response = await chat_completion(
            messages=[{
                "role": "user",
                "content": f"Rate the sentiment of this customer message from 0.0 (extremely negative/angry) to 1.0 (very positive/happy). Reply with ONLY a decimal number, nothing else.\n\nMessage: {text[:500]}"
            }],
            temperature=0,
            max_tokens=10,
            priority_provider="GROQ" # Prefer GROQ for fast, cheap sentiment
        )
        score = float(response.choices[0].message.content.strip())
        return max(0.0, min(1.0, score))
    except Exception:
        return 0.5
