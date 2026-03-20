const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function submitSupportForm(data: any) {
  const res = await fetch(`${API_URL}/api/v1/channels/webform/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getTicketStatus(id: string) {
  const res = await fetch(`${API_URL}/api/v1/tickets/${id}`);
  if (!res.ok) throw new Error("Ticket not found");
  return res.json();
}

export async function getChannelMetrics() {
  const res = await fetch(`${API_URL}/api/v1/metrics/channels`);
  return res.json();
}

export async function generateBriefing() {
  const res = await fetch(`${API_URL}/api/v1/briefing/generate`, { method: "POST" });
  return res.json();
}

export async function getLatestBriefing() {
  // Mock endpoint or actual endpoint if implemented
  const res = await fetch(`${API_URL}/api/v1/briefing/latest`);
  return res.json();
}
