"""
Space Assistant — FastAPI backend
Exposes a /chat endpoint that calls IBM Granite via watsonx.ai.
"""
from dotenv import load_dotenv
load_dotenv()  # loads backend/.env automatically

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator

from granite_client import chat
from prompts import SPACE_ASSISTANT_SYSTEM_PROMPT


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
# App setup
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Warm up the Granite client on startup so the first request isn't slow
    from granite_client import get_model
    get_model()
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
    return {"status": "ok", "model": "ibm/granite-3-8b-instruct"}


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
