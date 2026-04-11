import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const ticketId = params.id;
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    
    const response = await fetch(`${backendUrl}/api/v1/channels/webform/ticket/${ticketId}`);

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
      }
      const errorText = await response.text();
      return NextResponse.json({ error: 'Backend fetch failed', details: errorText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Status fetch error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
