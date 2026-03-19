import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))

SCHEMA = """
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS customer_identifiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    identifier_type VARCHAR(50) NOT NULL,
    identifier_value VARCHAR(255) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(identifier_type, identifier_value)
);

CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id),
    initial_channel VARCHAR(50) NOT NULL CHECK (initial_channel IN ('email','whatsapp','web_form')),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active','resolved','escalated','closed')),
    sentiment_score DECIMAL(3,2),
    resolution_type VARCHAR(50),
    escalated_to VARCHAR(255),
    metadata JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    channel VARCHAR(50) NOT NULL CHECK (channel IN ('email','whatsapp','web_form')),
    direction VARCHAR(20) NOT NULL CHECK (direction IN ('inbound','outbound')),
    role VARCHAR(20) NOT NULL CHECK (role IN ('customer','agent','system')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    tokens_used INTEGER,
    latency_ms INTEGER,
    tool_calls JSONB DEFAULT '[]',
    channel_message_id VARCHAR(255),
    delivery_status VARCHAR(50) DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id),
    customer_id UUID REFERENCES customers(id),
    source_channel VARCHAR(50) NOT NULL,
    category VARCHAR(100),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open','processing','escalated','resolved','closed')),
    subject VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT
);

CREATE TABLE IF NOT EXISTS knowledge_base (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,4) NOT NULL,
    channel VARCHAR(50),
    dimensions JSONB DEFAULT '{}',
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    action_type VARCHAR(100) NOT NULL,
    actor VARCHAR(100) DEFAULT 'groq_agent',
    target TEXT,
    parameters JSONB DEFAULT '{}',
    approval_status VARCHAR(50),
    result VARCHAR(50),
    error_message TEXT
);

CREATE TABLE IF NOT EXISTS ceo_briefings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    revenue_this_week DECIMAL(10,2) DEFAULT 0,
    total_tickets INTEGER DEFAULT 0,
    escalation_count INTEGER DEFAULT 0,
    avg_sentiment DECIMAL(3,2) DEFAULT 0.5,
    briefing_markdown TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_conversations_customer ON conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_channel ON conversations(initial_channel);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_channel ON tickets(source_channel);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp DESC);

INSERT INTO knowledge_base (title, content, category) VALUES
('Password Reset', 'To reset your password: visit login page, click Forgot Password, enter email, check inbox for reset link valid 24 hours, set new password.', 'technical'),
('API Authentication', 'Use Bearer token in Authorization header: "Authorization: Bearer YOUR_API_KEY". Generate keys in Settings > API Keys panel.', 'technical'),
('Billing Inquiries', 'Billing and pricing questions are handled by our dedicated billing team. Email billing@techcorp.com for immediate assistance.', 'billing'),
('Feature Requests', 'Submit feature requests at feedback.techcorp.com. Product team reviews submissions monthly and publishes a roadmap update.', 'general'),
('Bug Reporting', 'Report bugs with: description, steps to reproduce, expected vs actual behavior, browser and OS version. Screenshots help.', 'technical'),
('Account Upgrade', 'Upgrade your plan in Settings > Subscription. Changes take effect immediately. Prorated billing applies automatically.', 'billing'),
('Data Export', 'Export your data in Settings > Data > Export. CSV and JSON formats available. Exports are emailed within 24 hours.', 'technical'),
('Integrations', 'We support Zapier, Slack, GitHub, and Jira integrations. Configure them in Settings > Integrations with your API key.', 'technical')
ON CONFLICT DO NOTHING;
"""

async def main():
    try:
        conn = await asyncpg.connect(os.getenv("DATABASE_URL"))
        await conn.execute(SCHEMA)
        print("Schema successfully executed.")
        await conn.close()
    except Exception as e:
        print(f"Error executing schema: {e}")

if __name__ == "__main__":
    asyncio.run(main())
