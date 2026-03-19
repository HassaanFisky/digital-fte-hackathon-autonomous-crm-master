def format_for_channel(response: str, channel: str) -> str:
    if channel == "email":
        if len(response) > 2000:
            response = response[:1997] + "..."
        return f"""Dear Valued Customer,

Thank you for reaching out to TechCorp Support.

{response}

Should you have any further questions, please don't hesitate to reply to this email — we're here 24/7.

Warm regards,
ARIA — Customer Success AI
TechCorp Support Team
━━━━━━━━━━━━━━━━━━━━━━━━
⚡ Powered by AI · Backed by Humans
For urgent issues, reply with URGENT in the subject line."""

    elif channel == "whatsapp":
        if len(response) > 300:
            response = response[:297] + "..."
        return f"{response}\n\n💬 Need more help? Type *human* to reach our team instantly."

    else:  # web_form
        if len(response) > 1000:
            response = response[:997] + "..."
        return f"""{response}

---
📋 Your ticket has been logged and you will receive email updates on any changes.
💡 Tip: Reply to this conversation with any follow-up questions."""
