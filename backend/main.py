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
from prompts import SPACE_ASSISTANT_SYSTEM_PROMPT, APOD_SUMMARY_PROMPT


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
