import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://spotty-agneta-hassaanfisky-2a742a92.koyeb.app";
    
    const response = await fetch(`${apiUrl}/api/v1/channels/webform/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Submission Error:", error);
    return NextResponse.json({ detail: "Internal Server Error" }, { status: 500 });
  }
}
