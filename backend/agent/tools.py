import json
from database import queries
from agent import formatters
# Handlers will be imported here
# from channels.whatsapp_handler import WhatsAppHandler
# from channels.gmail_handler import GmailHandler

TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "search_knowledge_base",
            "description": "Search the official knowledge base for relevant help docs.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search query keywords"},
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
            "description": "Create a formal support ticket for tracking the inquiry.",
            "parameters": {
                "type": "object",
                "properties": {
                    "customer_id": {"type": "string"},
                    "subject": {"type": "string"},
                    "category": {
                        "type": "string", 
                        "enum": ["general", "technical", "billing", "feedback", "bug_report"]
                    },
                    "priority": {
                        "type": "string",
                        "enum": ["low", "medium", "high", "critical"]
                    },
                    "channel": {
                        "type": "string",
                        "enum": ["email", "whatsapp", "web_form"]
                    }
                },
                "required": ["customer_id", "subject", "category", "priority", "channel"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_customer_history",
            "description": "Get past interaction history for the customer across all channels.",
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
            "description": "Escalate the ticket to a human agent.",
            "parameters": {
                "type": "object",
                "properties": {
                    "ticket_id": {"type": "string"},
                    "reason": {"type": "string"},
                    "urgency": {
                        "type": "string",
                        "enum": ["low", "normal", "high", "critical"]
                    }
                },
                "required": ["ticket_id", "reason", "urgency"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "send_response",
            "description": "Send a response message to the customer via their current channel.",
            "parameters": {
                "type": "object",
                "properties": {
                    "ticket_id": {"type": "string"},
                    "message": {"type": "string"},
                    "channel": {"type": "string"},
                    "customer_contact": {"type": "string"}
                },
                "required": ["ticket_id", "message", "channel", "customer_contact"]
            }
        }
    }
]

async def execute_tool_call(tool_name, tool_args, context):
    if tool_name == "search_knowledge_base":
        results = await queries.search_knowledge_base(tool_args["query"], tool_args.get("max_results", 5))
        return f"Knowledge base results: {json.dumps(results)}"
    
    elif tool_name == "create_ticket":
        ticket_id = await queries.create_ticket(
            tool_args["customer_id"],
            context.get("conversation_id"),
            tool_args["channel"],
            tool_args["subject"],
            tool_args["category"],
            tool_args["priority"]
        )
        context["ticket_id"] = ticket_id
        return f"Ticket created with ID: {ticket_id}"
    
    elif tool_name == "get_customer_history":
        history = await queries.get_customer_cross_channel_history(tool_args["customer_id"])
        if not history:
            return "No previous history found for this customer."
        readable = "\n".join([f"[{m['direction'].upper()}] {m['created_at'].isoformat()}: {m['content']}" for m in history])
        return f"Customer interacton history (last 20):\n{readable}"
    
    elif tool_name == "escalate_to_human":
        await queries.update_ticket_status(tool_args["ticket_id"], "escalated", tool_args["reason"])
        await queries.log_audit("escalation", target=tool_args["ticket_id"], parameters=tool_args)
        context["escalated"] = True
        return f"Ticket {tool_args['ticket_id']} has been escalated."
    
    elif tool_name == "send_response":
        from channels.whatsapp_handler import WhatsAppHandler
        from channels.gmail_handler import GmailHandler
        
        formatted = formatters.format_for_channel(tool_args["message"], tool_args["channel"])
        
        if tool_args["channel"] == "whatsapp":
            await WhatsAppHandler.send_message(tool_args["customer_contact"], formatted)
        elif tool_args["channel"] == "email":
            # Assuming subject is in context or tool_args
            await GmailHandler.send_reply(tool_args["customer_contact"], "Re: Support Inquiry", formatted)
            
        await queries.create_message(
            context["conversation_id"],
            tool_args["channel"],
            "outbound",
            "agent",
            tool_args["message"]
        )
        await queries.log_audit("outbound_response", target=tool_args["ticket_id"])
        return "Message sent successfully."
    
    return f"Tool {tool_name} not found."
