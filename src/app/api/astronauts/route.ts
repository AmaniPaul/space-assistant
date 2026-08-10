import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

export interface Astronaut {
  name: string;
  craft: string;
}

export interface AstronautsData {
  people: Astronaut[];
  number: number;
}

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/astronauts`, {
      // Revalidate every 10 minutes — crew changes are infrequent
      next: { revalidate: 600 },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { detail?: string };
      return NextResponse.json(
        { error: err.detail ?? "Backend error" },
        { status: res.status }
      );
    }

    const data = await res.json() as AstronautsData;
    return NextResponse.json(data);
  } catch (error) {
    console.error("[/api/astronauts] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
