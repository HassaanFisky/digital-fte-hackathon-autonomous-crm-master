import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL 
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:8000');

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/briefings/latest`, {
      // Don't cache — always serve the freshest briefing
      cache: 'no-store',
    });

    if (response.status === 404) {
      return NextResponse.json({ error: 'No briefing available yet. Try generating one first.' }, { status: 404 });
    }
    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json({ error: 'Backend error', detail }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to connect to backend', detail: error.message }, { status: 503 });
  }
}

export async function POST() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/briefings/generate`, {
      method: 'POST',
    });

    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json({ error: 'Backend error', detail }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to trigger briefing', detail: error.message }, { status: 503 });
  }
}
