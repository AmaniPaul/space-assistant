"""
Space Assistant — FastAPI backend
Exposes /chat and /apod endpoints backed by IBM Granite on watsonx.ai.
"""
from dotenv import load_dotenv
load_dotenv()  # loads backend/.env automatically

import os
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator

from granite_client import chat
from prompts import SPACE_ASSISTANT_SYSTEM_PROMPT, APOD_SUMMARY_PROMPT, ASTEROID_BLURB_PROMPT


# ---------------------------------------------------------------------------
# Request / response models
# ---------------------------------------------------------------------------

class ChatMessage(BaseModel):
    role: str
    content: str

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        if v not in ("user", "assistant"):
            raise ValueError("role must be 'user' or 'assistant'")
        return v


class ChatRequest(BaseModel):
    messages: list[ChatMessage]

    @field_validator("messages")
    @classmethod
    def validate_messages(cls, v: list[ChatMessage]) -> list[ChatMessage]:
        if not v:
            raise ValueError("messages list must not be empty")
        return v


class ChatResponse(BaseModel):
    reply: str


# ---------------------------------------------------------------------------
# APOD models
# ---------------------------------------------------------------------------

class AsteroidItem(BaseModel):
    id: str
    name: str
    date: str
    miss_km: float
    miss_lunar: float
    velocity_kmh: float
    diameter_min: float
    diameter_max: float
    is_hazardous: bool
    blurb: str
    nasa_url: str


class ISSPosition(BaseModel):
    latitude: float
    longitude: float
    altitude_km: float
    velocity_kmh: float
    timestamp: int


# ---------------------------------------------------------------------------
# APOD models
# ---------------------------------------------------------------------------

class APODResponse(BaseModel):
    title: str
    date: str
    explanation: str
    summary: str
    url: str | None
    hdurl: str | None
    media_type: str
    copyright: str | None


# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Credentials are validated lazily on the first request, not at startup,
    # so the server boots successfully even before .env is fully configured.
    yield


app = FastAPI(
    title="Space Assistant API",
    description="AI-powered space exploration assistant backed by IBM Granite on watsonx.ai",
    version="1.0.0",
    lifespan=lifespan,
)

# Allow requests from the Next.js dev server and production origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",   # Next.js dev
        "http://localhost:3001",
    ],
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type"],
)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health")
def health() -> dict:
    """Simple liveness check."""
    return {"status": "ok", "model": "ibm/granite-4-h-small"}


@app.post("/chat", response_model=ChatResponse)
def chat_endpoint(body: ChatRequest) -> ChatResponse:
    """
    Accept a conversation history and return Granite's next reply.

    The frontend sends the full message list so Granite has conversation
    context — it is stateless on the backend side.
    """
    try:
        messages = [m.model_dump() for m in body.messages]
        reply = chat(messages=messages, system_prompt=SPACE_ASSISTANT_SYSTEM_PROMPT)
        return ChatResponse(reply=reply)
    except KeyError as exc:
        # Missing env vars surface here during the first model call
        raise HTTPException(
            status_code=503,
            detail=f"watsonx.ai configuration error: {exc}. Check your .env file.",
        ) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/apod", response_model=APODResponse)
async def apod_endpoint() -> APODResponse:
    """
    Fetch today's NASA Astronomy Picture of the Day and return it with
    a Granite-generated plain-language summary.
    """
    nasa_key = os.environ.get("NASA_API_KEY", "DEMO_KEY")

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                "https://api.nasa.gov/planetary/apod",
                params={"api_key": nasa_key, "thumbs": "true"},
            )
            resp.raise_for_status()
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"NASA API error: {exc}") from exc

    data = resp.json()

    # Generate a plain-language summary with Granite
    try:
        prompt = APOD_SUMMARY_PROMPT.format(explanation=data.get("explanation", ""))
        summary = chat(
            messages=[{"role": "user", "content": prompt}],
            system_prompt="You are a friendly space guide for the public.",
        )
    except Exception:
        # Fall back to the raw NASA explanation if Granite is unavailable
        summary = data.get("explanation", "")

    # Videos return a thumbnail URL under "thumbnail_url" when thumbs=true
    image_url = data.get("url") if data.get("media_type") == "image" else data.get("thumbnail_url")

    return APODResponse(
        title=data.get("title", ""),
        date=data.get("date", ""),
        explanation=data.get("explanation", ""),
        summary=summary,
        url=image_url,
        hdurl=data.get("hdurl"),
        media_type=data.get("media_type", "image"),
        copyright=data.get("copyright"),
    )


class Astronaut(BaseModel):
    name: str
    craft: str


class AstronautsResponse(BaseModel):
    people: list[Astronaut]
    number: int


@app.get("/astronauts", response_model=AstronautsResponse)
async def astronauts_endpoint() -> AstronautsResponse:
    """
    Return the list of humans currently in space via Open Notify.
    No API key required.
    """
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            resp = await client.get("http://api.open-notify.org/astros.json")
            resp.raise_for_status()
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Open Notify API error: {exc}") from exc

    data = resp.json()
    return AstronautsResponse(
        people=[Astronaut(name=p["name"], craft=p["craft"]) for p in data["people"]],
        number=int(data["number"]),
    )


@app.get("/asteroids", response_model=list[AsteroidItem])
async def asteroids_endpoint() -> list[AsteroidItem]:
    """
    Fetch this week's near-Earth asteroid flybys from NASA NeoWs and
    return each one with a Granite-generated plain-language blurb.
    """
    nasa_key = os.environ.get("NASA_API_KEY", "DEMO_KEY")

    # Build start/end date range for the current week
    from datetime import date, timedelta
    today = date.today()
    end = today + timedelta(days=7)

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                "https://api.nasa.gov/neo/rest/v1/feed",
                params={
                    "start_date": today.isoformat(),
                    "end_date": end.isoformat(),
                    "api_key": nasa_key,
                },
            )
            resp.raise_for_status()
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"NASA NeoWs API error: {exc}") from exc

    raw = resp.json()

    # Flatten all daily buckets into a single list, sorted by closest approach
    asteroids: list[AsteroidItem] = []
    for day_objects in raw.get("near_earth_objects", {}).values():
        for obj in day_objects:
            approach = obj["close_approach_data"][0]
            diam = obj["estimated_diameter"]["meters"]

            name = obj["name"].strip("()")
            miss_km = float(approach["miss_distance"]["kilometers"])
            miss_lunar = float(approach["miss_distance"]["lunar"])
            velocity_kmh = float(approach["relative_velocity"]["kilometers_per_hour"])
            diameter_min = float(diam["estimated_diameter_min"])
            diameter_max = float(diam["estimated_diameter_max"])
            approach_date = approach["close_approach_date"]
            hazardous = obj.get("is_potentially_hazardous_asteroid", False)

            # Generate a Granite blurb for this asteroid
            try:
                blurb = chat(
                    messages=[{
                        "role": "user",
                        "content": ASTEROID_BLURB_PROMPT.format(
                            name=name,
                            date=approach_date,
                            miss_km=f"{miss_km:,.0f}",
                            miss_lunar=f"{miss_lunar:.2f}",
                            diameter_min=f"{diameter_min:.0f}",
                            diameter_max=f"{diameter_max:.0f}",
                            velocity_kmh=f"{velocity_kmh:,.0f}",
                            hazardous="Yes" if hazardous else "No",
                        ),
                    }],
                    system_prompt="You are a friendly space guide for the public.",
                )
            except Exception:
                blurb = f"This asteroid will pass Earth at {miss_lunar:.2f} lunar distances — safely by."

            asteroids.append(AsteroidItem(
                id=obj["id"],
                name=name,
                date=approach_date,
                miss_km=round(miss_km, 1),
                miss_lunar=round(miss_lunar, 4),
                velocity_kmh=round(velocity_kmh, 1),
                diameter_min=round(diameter_min, 1),
                diameter_max=round(diameter_max, 1),
                is_hazardous=hazardous,
                blurb=blurb,
                nasa_url=obj["nasa_jpl_url"],
            ))

    # Sort by closest approach distance ascending
    asteroids.sort(key=lambda a: a.miss_km)
    return asteroids


@app.get("/iss", response_model=ISSPosition)
async def iss_endpoint() -> ISSPosition:
    """
    Return the current ISS position from the Open Notify API.
    No API key required — open public endpoint.
    """
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            resp = await client.get("http://api.open-notify.org/iss-now.json")
            resp.raise_for_status()
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Open Notify API error: {exc}") from exc

    data = resp.json()
    pos = data["iss_position"]

    return ISSPosition(
        latitude=float(pos["latitude"]),
        longitude=float(pos["longitude"]),
        altitude_km=408.0,    # ISS maintains ~408 km — Open Notify doesn't expose this
        velocity_kmh=27600.0, # ISS average orbital velocity
        timestamp=int(data["timestamp"]),
    )
