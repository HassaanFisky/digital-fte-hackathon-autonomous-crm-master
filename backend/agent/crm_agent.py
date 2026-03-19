from agent.llm_client import chat_completion, analyze_sentiment
from agent.prompts import CUSTOMER_SUCCESS_SYSTEM_PROMPT
from agent.tools import TOOL_DEFINITIONS, execute_tool_call
from database.queries import record_metric
from datetime import datetime

async def run_agent(customer_id: str, channel: str, content: str,
                    customer_contact: str, subject: str = "Support Request",
                    conversation_history: list = None) -> dict:
    start_time = datetime.now()
    context = {"customer_id": customer_id, "channel": channel, "ticket_id": None, "conversation_id": None}
    tool_calls_log = []
    escalated = False
    escalation_reason = None

    messages = [
        {"role": "system", "content": CUSTOMER_SUCCESS_SYSTEM_PROMPT},
        *(conversation_history or []),
        {"role": "user", "content": f"[Channel: {channel}] [Customer ID: {customer_id}] [Contact: {customer_contact}]\n\n{content}"}
    ]

    max_tool_rounds = 8
    for round_num in range(max_tool_rounds):
        try:
            response = await chat_completion(
                messages=messages,
                tools=TOOL_DEFINITIONS,
                tool_choice="auto" if round_num < 7 else None, # Force final thought in last round
                temperature=0.3,
                max_tokens=2048
            )
        except Exception as e:
            return {
                "output": f"ARIA is experiencing a technical difficulty: {str(e)}",
                "escalated": True,
                "escalation_reason": "llm_failure",
                "tool_calls": tool_calls_log,
                "sentiment_score": 0.5,
                "latency_ms": int((datetime.now() - start_time).total_seconds() * 1000),
                "ticket_id": context.get("ticket_id"),
                "conversation_id": context.get("conversation_id")
            }

        message = response.choices[0].message
        
        # Prepare assistant message for log
        assistant_msg = {"role": "assistant", "content": message.content or ""}
        if message.tool_calls:
            assistant_msg["tool_calls"] = [
                {"id": tc.id, "type": "function", "function": {"name": tc.function.name, "arguments": tc.function.arguments}}
                for tc in message.tool_calls
            ]
        messages.append(assistant_msg)

        if not message.tool_calls:
            # Agent is finished — finalize
            latency_ms = int((datetime.now() - start_time).total_seconds() * 1000)
            sentiment = await analyze_sentiment(content)
            
            if sentiment < 0.3 and not escalated:
                escalated = True
                escalation_reason = "low_sentiment_auto_escalation"
            
            await record_metric("response_latency_ms", latency_ms, channel)
            await record_metric("sentiment_score", sentiment, channel)
            
            return {
                "output": message.content or "Your request has been processed.",
                "escalated": escalated,
                "escalation_reason": escalation_reason,
                "tool_calls": tool_calls_log,
                "sentiment_score": sentiment,
                "latency_ms": latency_ms,
                "ticket_id": context.get("ticket_id"),
                "conversation_id": context.get("conversation_id")
            }

        # Execute all tool calls in this round synchronously (sequentially within this task)
        for tool_call in (message.tool_calls or []):
            tool_name = tool_call.function.name
            try:
                tool_args = json.loads(tool_call.function.arguments)
                # Ensure context for routing
                if tool_name == "send_response" and "customer_contact" not in tool_args:
                    tool_args["customer_contact"] = customer_contact
                
                result = await execute_tool_call(tool_name, tool_args, context)
                tool_calls_log.append({"tool": tool_name, "args": tool_args, "result": result[:200]})
                
                if tool_name == "escalate_to_human":
                    escalated = True
                    escalation_reason = tool_args.get("reason", "manual_escalation")
                
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": result
                })
            except Exception as e:
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": f"Tool execution error: {str(e)}"
                })

    return {
        "output": "I apologize, but I'm having trouble completing this complex request. A human agent will step in and assist you manually.",
        "escalated": True,
        "escalation_reason": "max_tool_rounds_exceeded",
        "tool_calls": tool_calls_log,
        "sentiment_score": 0.5,
        "latency_ms": int((datetime.now() - start_time).total_seconds() * 1000),
        "ticket_id": context.get("ticket_id"),
        "conversation_id": context.get("conversation_id")
    }

