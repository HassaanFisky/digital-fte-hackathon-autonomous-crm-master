import pytest
import os
from agent.crm_agent import run_agent

@pytest.mark.asyncio
async def test_agent_initialization():
    """Verify the agent can boot and handle a basic request without crashing."""
    # Note: This will actually attempt LLM calls if keys are present
    # In a real CI, we'd mock the chat_completion.
    
    response = await run_agent(
        customer_id="test-customer-123",
        channel="web_form",
        content="Hello ARIA, I have a question about my order.",
        customer_contact="test@example.com",
        subject="Test Inquiry"
    )
    
    assert "output" in response
    assert response["ticket_id"] is not None or response["escalated"] is True
    print(f"Test agent output: {response['output'][:100]}...")

@pytest.mark.asyncio
async def test_sentiment_bridge():
    """Verify the sentiment analyzer is reachable."""
    from agent.sentiment import analyze_sentiment
    score = await analyze_sentiment("I am extremely happy with your service, you are the best!")
    assert score > 0.8
    
    bad_score = await analyze_sentiment("Your service is terrible and I want a refund right now!!!")
    assert bad_score < 0.3
