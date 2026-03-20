def format_for_channel(response, channel) -> str:
    channel = channel.lower()
    if channel == "email":
        return f"Dear Valued Customer,\n\n{response}\n\nWarm regards,\nARIA — TechCorp Support"
    elif channel == "whatsapp":
        truncated = response[:300] if len(response) > 300 else response
        return f"{truncated}\n\n💬 Type *human* for live support."
    elif channel == "web_form":
        truncated = response[:1000] if len(response) > 1000 else response
        return f"{truncated}\n\n---\n📋 Ticket logged. Reply here for follow-up."
    return response
