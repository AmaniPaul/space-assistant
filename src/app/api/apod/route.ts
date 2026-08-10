import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

export interface APODData {
  title: string;
  date: string;
  explanation: string;
  summary: string;
  url: string | null;
  hdurl: string | null;
  media_type: string;
  copyright: string | null;
}

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/apod`, {
      // Revalidate once per day — APOD updates at midnight UTC
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { detail?: string };
      return NextResponse.json(
        { error: err.detail ?? "Backend error" },
        { status: res.status }
      );
    }

    const data = await res.json() as APODData;
    return NextResponse.json(data);
  } catch (error) {
    console.error("[/api/apod] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
