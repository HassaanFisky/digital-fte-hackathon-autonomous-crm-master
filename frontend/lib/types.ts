export interface Message {
  id: string;
  conversation_id: string;
  channel: string;
  direction: 'inbound' | 'outbound';
  role: 'customer' | 'agent';
  content: string;
  created_at: string;
  latency_ms?: number;
  delivery_status: string;
}

export interface Ticket {
  id: string;
  conversation_id: string;
  customer_id: string;
  source_channel: string;
  category: string;
  priority: string;
  status: 'open' | 'processing' | 'resolved' | 'escalated';
  subject: string;
  created_at: string;
  resolved_at?: string;
  resolution_notes?: string;
  messages?: Message[];
}

export interface Customer {
  id: string;
  email: string;
  phone: string;
  name: string;
  created_at: string;
  metadata: Record<string, any>;
}

export interface ChannelMetrics {
  ticket_count: number;
  avg_sentiment: number;
}

export interface CEOBriefing {
  id: string;
  generated_at: string;
  period_start: string;
  period_end: string;
  total_tickets: number;
  escalation_count: number;
  avg_sentiment: number;
  briefing_markdown: string;
}

export interface SupportFormData {
  name: string;
  email: string;
  subject: string;
  category: string;
  priority: string;
  message: string;
}
