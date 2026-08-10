import { NextRequest, NextResponse } from "next/server";

// Placeholder chat API route
// TODO: Replace mock logic with real IBM watsonx.ai / Granite call
// using the `ibm-watsonx-ai` Python backend or the watsonx SDK directly.

export interface ChatRequestBody {
  messages: { role: "user" | "assistant"; content: string }[];
}

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

    const lastUserMessage = messages
      .filter((m) => m.role === "user")
      .at(-1)?.content ?? "";

    // ---------------------------------------------------------------
    // PLACEHOLDER — swap this block for a real watsonx.ai Granite call
    // ---------------------------------------------------------------
    const reply = `You asked: "${lastUserMessage}"\n\nThis is a placeholder response. Once connected to IBM watsonx.ai and Granite, I'll answer with real AI-powered space knowledge. 🚀`;
    // ---------------------------------------------------------------

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("[/api/chat] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
