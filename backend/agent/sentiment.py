import os
from openai import AsyncOpenAI

async def analyze_sentiment(text: str) -> float:
    try:
        client = AsyncOpenAI(
            api_key=os.getenv("GROQ_API_KEY"),
            base_url=os.getenv("GROQ_BASE_URL")
        )
        
        response = await client.chat.completions.create(
            model=os.getenv("GROQ_MODEL"),
            messages=[{
                "role": "system",
                "content": "You are a sentiment analyzer. Rate the sentiment of the input text from 0.0 (extremely negative/angry) to 1.0 (extremely positive/happy). Output ONLY a single floating point number."
            }, {
                "role": "user",
                "content": text
            }],
            temperature=0,
            max_tokens=5
        )
        
        score_text = response.choices[0].message.content.strip()
        return float(score_text)
    except Exception as e:
        print(f"Sentiment analysis error: {e}")
        return 0.5
