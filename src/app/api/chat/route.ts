import { NextRequest, NextResponse } from "next/server";

export interface ChatRequestBody {
  messages: { role: "user" | "assistant"; content: string }[];
}

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequestBody = await req.json();
    const { messages } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "No messages provided" },
        { status: 400 }
      );
    }

    // Proxy to the Python FastAPI backend
    const backendRes = await fetch(`${BACKEND_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    if (!backendRes.ok) {
      const err = await backendRes.json().catch(() => ({}));
      console.error("[/api/chat] Backend error:", err);
      return NextResponse.json(
        { error: (err as { detail?: string }).detail ?? "Backend error" },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json() as { reply: string };
    return NextResponse.json({ reply: data.reply });
  } catch (error) {
    console.error("[/api/chat] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
