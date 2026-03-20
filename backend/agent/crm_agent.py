import os
import json
import time
from openai import AsyncOpenAI
from agent import prompts, tools, sentiment
from database import queries

async def run_agent(customer_id, channel, content, customer_contact, subject, conversation_history=[]) -> dict:
    start_time = time.time()
    client = AsyncOpenAI(
        api_key=os.getenv("GROQ_API_KEY"),
        base_url=os.getenv("GROQ_BASE_URL")
    )
    
    # Analyze sentiment
    sentiment_score = await sentiment.analyze_sentiment(content)
    
    # Get or create conversation (should be done before run_agent call usually, but we'll do it if not present)
    conv = await queries.get_active_conversation(customer_id)
    if not conv:
        conversation_id = await queries.create_conversation(customer_id, channel)
    else:
        conversation_id = str(conv['id'])
    
    # Store inbound message
    await queries.create_message(conversation_id, channel, "inbound", "customer", content)
    
    context = {
        "customer_id": customer_id,
        "conversation_id": conversation_id,
        "channel": channel,
        "customer_contact": customer_contact,
        "subject": subject,
        "escalated": False,
        "ticket_id": None
    }
    
    messages = [
        {"role": "system", "content": prompts.CUSTOMER_SUCCESS_SYSTEM_PROMPT},
    ]
    
    # Add conversation history
    for msg in conversation_history:
        # Expecting msg to be dict with role and content
        messages.append(msg)
    
    # Add current message
    messages.append({
        "role": "user",
        "content": f"New message via {channel}. Customer contact: {customer_contact}. Subject: {subject}. Content: {content}"
    })
    
    num_rounds = 0
    max_rounds = 8
    
    while num_rounds < max_rounds:
        response = await client.chat.completions.create(
            model=os.getenv("GROQ_MODEL"),
            messages=messages,
            tools=tools.TOOL_DEFINITIONS,
            tool_choice="auto",
            temperature=0.3,
            max_tokens=2048
        )
        
        response_msg = response.choices[0].message
        messages.append(response_msg)
        
        if not response_msg.tool_calls:
            # Final response
            latency = int((time.time() - start_time) * 1000)
            output = response_msg.content
            
            # Record metrics
            await queries.record_metric("inbound_sentiment", sentiment_score, channel)
            await queries.record_metric("agent_latency", float(latency), channel)
            
            return {
                "output": output,
                "escalated": context["escalated"],
                "escalation_reason": "sentiment_or_keyword" if context["escalated"] else None,
                "tool_calls": [],
                "sentiment_score": sentiment_score,
                "latency_ms": latency,
                "ticket_id": context["ticket_id"],
                "conversation_id": conversation_id
            }
        
        # Execute tool calls
        for tool_call in response_msg.tool_calls:
            tool_name = tool_call.function.name
            tool_args = json.loads(tool_call.function.arguments)
            
            result = await tools.execute_tool_call(tool_name, tool_args, context)
            
            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "name": tool_name,
                "content": result
            })
            
        num_rounds += 1
        
    # Max rounds exceeded
    return {
        "output": "I am escalating this to a human agent for further assistance.",
        "escalated": True,
        "escalation_reason": "max_rounds_exceeded",
        "tool_calls": [],
        "sentiment_score": sentiment_score,
        "latency_ms": int((time.time() - start_time) * 1000),
        "ticket_id": context["ticket_id"],
        "conversation_id": conversation_id
    }
