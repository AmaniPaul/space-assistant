import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

export interface Asteroid {
  id: string;
  name: string;
  date: string;
  miss_km: number;
  miss_lunar: number;
  velocity_kmh: number;
  diameter_min: number;
  diameter_max: number;
  is_hazardous: boolean;
  blurb: string;
  nasa_url: string;
}

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/asteroids`, {
      // Revalidate once per hour — NeoWs feed doesn't change that fast
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { detail?: string };
      return NextResponse.json(
        { error: err.detail ?? "Backend error" },
        { status: res.status }
      );
    }

    const data = await res.json() as Asteroid[];
    return NextResponse.json(data);
  } catch (error) {
    console.error("[/api/asteroids] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
