import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

export interface ISSPosition {
  latitude: number;
  longitude: number;
  altitude_km: number;
  velocity_kmh: number;
  timestamp: number;
}

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/iss`, {
      // No caching — ISS moves ~7.7 km/s, always fresh
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { detail?: string };
      return NextResponse.json(
        { error: err.detail ?? "Backend error" },
        { status: res.status }
      );
    }

    const data = await res.json() as ISSPosition;
    return NextResponse.json(data);
  } catch (error) {
    console.error("[/api/iss] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
