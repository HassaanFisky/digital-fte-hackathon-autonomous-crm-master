from openai import AsyncOpenAI
import os, json
from database.queries import (
    search_knowledge_base, create_ticket as db_create_ticket,
    get_customer_cross_channel_history, update_ticket_status,
    create_message, log_audit, record_metric
)
from agent.formatters import format_for_channel
from channels.gmail_handler import GmailHandler
from channels.whatsapp_handler import WhatsAppHandler

groq_client = AsyncOpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url=os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1")
)

TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "search_knowledge_base",
            "description": "Search product documentation. Use when customer asks about features, how-to, technical questions, or account management.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search query derived from customer question"},
                    "max_results": {"type": "integer", "default": 5}
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "create_ticket",
            "description": "Create support ticket. ALWAYS call this first before anything else.",
            "parameters": {
                "type": "object",
                "properties": {
                    "customer_id": {"type": "string"},
                    "subject": {"type": "string"},
                    "category": {"type": "string", "enum": ["general","technical","billing","feedback","bug_report"]},
                    "priority": {"type": "string", "enum": ["low","medium","high","critical"]},
                    "channel": {"type": "string", "enum": ["email","whatsapp","web_form"]}
                },
                "required": ["customer_id","subject","category","priority","channel"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_customer_history",
            "description": "Retrieve customer's full interaction history across ALL channels. Call this second, after create_ticket.",
            "parameters": {
                "type": "object",
                "properties": {
                    "customer_id": {"type": "string"}
                },
                "required": ["customer_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "escalate_to_human",
            "description": "Escalate conversation to human support agent. Use for pricing, legal, refunds, angry customers, or security issues.",
            "parameters": {
                "type": "object",
                "properties": {
                    "ticket_id": {"type": "string"},
                    "reason": {"type": "string"},
                    "urgency": {"type": "string", "enum": ["low","normal","high","critical"]}
                },
                "required": ["ticket_id","reason","urgency"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "send_response",
            "description": "Send formatted response to customer via their channel. ALWAYS call this last to complete the interaction.",
            "parameters": {
                "type": "object",
                "properties": {
                    "ticket_id": {"type": "string"},
                    "message": {"type": "string", "description": "Raw response text before channel formatting"},
                    "channel": {"type": "string", "enum": ["email","whatsapp","web_form"]},
                    "customer_contact": {"type": "string", "description": "Email address or phone number for routing"}
                },
                "required": ["ticket_id","message","channel","customer_contact"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_order_status",
            "description": "Retrieve real-time order status, tracking, and carrier details. Use when customer asks about their shipment, order, or delivery.",
            "parameters": {
                "type": "object",
                "properties": {
                    "order_id": {"type": "string", "description": "The order ID starting with ORD- (e.g. ORD-10243)"}
                },
                "required": ["order_id"]
            }
        }
    }
]

async def execute_tool_call(tool_name: str, tool_args: dict, context: dict) -> str:
    dry_run = os.getenv("DRY_RUN", "false").lower() == "true"
    
    if tool_name == "get_order_status":
        import sys
        sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
        try:
            from agent_skills.order_skill import get_order_status
            data = await get_order_status(tool_args["order_id"])
            if "error" in data:
                return f"Error retrieving order: {data['error']}"
            
            return f"""Order Found: {data['order_id']}
- Status: {data['status'].upper()}
- Carrier: {data['carrier']}
- Tracking: {data['tracking_number']}
- Estimated Arrival: {data['estimated_arrival']}
- Last Updated: {data['last_updated']}"""
        except Exception as e:
            return f"Order lookup failed: {str(e)}"

    if tool_name == "search_knowledge_base":
        results = await search_knowledge_base(tool_args["query"], tool_args.get("max_results", 5))
        if not results:
            return "No relevant documentation found. Consider searching with different terms or escalating to human support."
        return "\n\n".join([f"**{r['title']}** ({r['category']})\n{r['content']}" for r in results])
    
    elif tool_name == "create_ticket":
        from database.queries import create_ticket as db_ct, create_conversation, get_active_conversation
        conv = await get_active_conversation(tool_args["customer_id"])
        if not conv:
            from database.queries import create_conversation as db_cc
            conv_id = await db_cc(tool_args["customer_id"], tool_args["channel"])
        else:
            conv_id = str(conv["id"])
        ticket_id = await db_ct(
            customer_id=tool_args["customer_id"],
            conversation_id=conv_id,
            channel=tool_args["channel"],
            subject=tool_args["subject"],
            category=tool_args["category"],
            priority=tool_args["priority"]
        )
        context["ticket_id"] = ticket_id
        context["conversation_id"] = conv_id
        await log_audit("ticket_created", ticket_id, tool_args, "success")
        return f"Ticket created successfully. ID: {ticket_id}"
    
    elif tool_name == "get_customer_history":
        history = await get_customer_cross_channel_history(tool_args["customer_id"])
        if not history:
            return "No previous interaction history found for this customer."
        lines = [f"[{h['channel']}] {h['direction']} at {h['created_at']}: {h['content'][:200]}" for h in history[:10]]
        return "Customer History:\n" + "\n".join(lines)
    
    elif tool_name == "escalate_to_human":
        ticket_id = tool_args["ticket_id"]
        await update_ticket_status(ticket_id, "escalated", f"Escalation reason: {tool_args['reason']}")
        # Write escalation file to vault
        import pathlib, datetime
        vault_path = pathlib.Path(os.getenv("VAULT_PATH", "./vault"))
        escalation_file = vault_path / "Pending_Approval" / f"ESCALATE_{ticket_id}.md"
        escalation_file.parent.mkdir(parents=True, exist_ok=True)
        escalation_file.write_text(f"""---
type: escalation
ticket_id: {ticket_id}
reason: {tool_args['reason']}
urgency: {tool_args['urgency']}
created: {datetime.datetime.now().isoformat()}
---
## Escalation Required
Human review needed for ticket {ticket_id}.
**Reason:** {tool_args['reason']}
**Urgency:** {tool_args['urgency']}
""")
        await log_audit("escalation", ticket_id, tool_args, "escalated")
        return f"Escalated to human support team. Reference: {ticket_id}. Urgency: {tool_args['urgency']}"
    
    elif tool_name == "send_response":
        formatted = format_for_channel(tool_args["message"], tool_args["channel"])
        if dry_run:
            print(f"[DRY RUN] Would send via {tool_args['channel']} to {tool_args['customer_contact']}: {formatted[:100]}...")
            return f"[DRY RUN] Response logged for {tool_args['channel']}"
        
        channel = tool_args["channel"]
        contact = tool_args["customer_contact"]
        
        if channel == "email":
            handler = GmailHandler()
            result = await handler.send_reply(contact, "Re: Your Support Request", formatted)
        elif channel == "whatsapp":
            handler = WhatsAppHandler()
            result = await handler.send_message(contact, formatted)
        else:
            result = {"delivery_status": "stored", "channel_message_id": f"web_{tool_args['ticket_id']}"}
        
        if context.get("conversation_id"):
            await create_message(
                context["conversation_id"], channel, "outbound", "agent",
                formatted, delivery_status=result.get("delivery_status", "sent")
            )
        
        await log_audit("send_response", tool_args["ticket_id"], tool_args, result.get("delivery_status", "sent"))
        return f"Response sent via {channel}. Status: {result.get('delivery_status', 'sent')}"
    
    return f"Unknown tool: {tool_name}"
