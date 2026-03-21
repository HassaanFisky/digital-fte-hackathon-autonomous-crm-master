import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://spotty-agneta-hassaanfisky-2a742a92.koyeb.app";
    const response = await fetch(`${apiUrl}/api/v1/tickets/${params.id}`, {
      next: { revalidate: 0 }, // always fetch fresh
    });

    if (response.status === 404) {
      return NextResponse.json({ detail: "Ticket not found" }, { status: 404 });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Ticket fetch error:", error);
    return NextResponse.json({ detail: "Internal Server Error" }, { status: 500 });
  }
}
