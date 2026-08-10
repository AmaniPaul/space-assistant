import { NextResponse } from "next/server";

// Placeholder APOD API route
// TODO: Fetch from https://api.nasa.gov/planetary/apod?api_key=YOUR_KEY
// and pass the description through Granite for a plain-language summary.

export async function GET() {
  // ---------------------------------------------------------------
  // PLACEHOLDER — swap with real NASA APOD fetch + Granite summary
  // ---------------------------------------------------------------
  const placeholder = {
    title: "Astronomy Picture of the Day",
    date: new Date().toISOString().split("T")[0],
    explanation:
      "Connect your NASA API key to see today's astronomy picture with an AI-generated plain-language explanation powered by IBM Granite.",
    url: null,
    mediaType: "image",
  };
  // ---------------------------------------------------------------

  return NextResponse.json(placeholder);
}
