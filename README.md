# 🚀 Space Assistant

An AI-powered space exploration assistant for public outreach, built with IBM Granite, watsonx.ai, NASA APIs, Next.js, and Python FastAPI.

---

## Problem Statement

Space exploration generates vast amounts of fascinating data — live satellite positions, daily astronomical imagery, near-Earth asteroid trajectories, and crew manifests — but most of it is locked behind technical interfaces, dense scientific language, or hard-to-find APIs. The general public, from curious children to engaged adults, has no single friendly place to ask questions, explore what's happening in space right now, and get answers they can actually understand.

---

## Solution Description

Space Assistant is a full-stack web application that acts as a knowledgeable, approachable AI guide to the universe. It brings together live space data from NASA and Open Notify into a single interface, and uses IBM Granite to explain everything in plain, enthusiastic language accessible to anyone.

### Features

| Feature | Description |
|---|---|
| 💬 **AI Chat** | Conversational interface powered by IBM Granite — ask anything about space |
| 🌌 **Astronomy Picture of the Day** | NASA APOD image displayed daily with a Granite-generated plain-language summary |
| 🛸 **ISS Live Tracker** | Real-time ISS position on an SVG world map, polling every 5 seconds |
| 👨‍🚀 **Humans in Space** | Live crew list grouped by spacecraft (ISS, Tiangong) with per-astronaut chat buttons |
| 🪨 **Near-Earth Asteroid Feed** | This week's asteroid flybys from NASA NeoWs, each explained by Granite in plain language |
| 💬 **Ask about the APOD** | One-click button sends today's image title to the chat for deeper exploration |
| 🧠 **Chat History Persistence** | Conversations saved to `localStorage` — survive page refreshes, with a clear option |

---

## AI Approach & Architecture

### Architecture Overview

```
Browser (Next.js / React)
    │
    ├── GET /api/apod        ──► Python FastAPI ──► NASA APOD API
    │                                          └──► IBM Granite (summary)
    │
    ├── GET /api/iss         ──► Python FastAPI ──► Open Notify /iss-now.json
    │
    ├── GET /api/astronauts  ──► Python FastAPI ──► Open Notify /astros.json
    │
    ├── GET /api/asteroids   ──► Python FastAPI ──► NASA NeoWs API
    │                                          └──► IBM Granite (per-asteroid blurb)
    │
    └── POST /api/chat       ──► Python FastAPI ──► IBM Granite (watsonx.ai)
```

Next.js API routes act as a secure proxy — API keys never reach the browser. All AI inference is handled by the Python FastAPI backend via the `ibm-watsonx-ai` SDK.

### IBM Granite Usage

Granite (`ibm/granite-4-h-small` on watsonx.ai) is used in three distinct ways:

1. **Conversational chat** — a multi-turn assistant with a carefully engineered system prompt that keeps answers accessible, enthusiastic, and grounded in real science. The full conversation history is passed on every request so Granite maintains context.

2. **APOD summarisation** — NASA's official image explanations are written for scientists. Granite rewrites each one in 2–3 friendly sentences for a general audience, with a prompt that explicitly forbids jargon and instructs Granite to be inspiring.

3. **Asteroid blurbs** — raw NeoWs data (miss distance, velocity, size, hazard status) is formatted into a structured prompt. Granite generates a 1–2 sentence plain-language perspective for each flyby, with instructions to use relatable analogies and never cause alarm.

### Data Sources

| API | Data | Key required |
|---|---|---|
| [NASA APOD](https://api.nasa.gov) | Daily astronomy image + explanation | Yes (free) |
| [NASA NeoWs](https://api.nasa.gov) | Near-Earth asteroid feed | Yes (free) |
| [Open Notify ISS](http://api.open-notify.org) | Live ISS lat/lon | No |
| [Open Notify Astros](http://api.open-notify.org) | Humans currently in space | No |

---

## Selected Challenge Theme

**"Making space more accessible and understandable"**

Space Assistant directly addresses the public outreach theme by taking raw, technical space data and transforming it into human-friendly experiences. IBM Granite acts as the translation layer between the complexity of space science and the curiosity of everyday people — explaining a nebula, contextualising an asteroid flyby, or introducing an astronaut in terms anyone can appreciate.

---

## How IBM Bob Was Used

IBM Bob was the primary development tool throughout the entire project — not just for boilerplate generation, but as an active engineering partner at every stage.

### Scaffolding & Architecture
Bob scaffolded the full Next.js + TypeScript + Tailwind project from a single prompt, and designed the two-tier architecture (Next.js proxy + Python FastAPI backend) to keep API keys server-side.

### Backend Development
Bob wrote the complete Python FastAPI backend including the `ibm-watsonx-ai` Granite client, all Pydantic models, CORS configuration, and all five API endpoints (`/chat`, `/apod`, `/iss`, `/astronauts`, `/asteroids`). Bob also diagnosed and fixed a critical bug where `WATSONX_API_KEY` was being read at module import time before `load_dotenv()` had run.

### Prompt Engineering
Bob authored all three Granite prompt templates (`SPACE_ASSISTANT_SYSTEM_PROMPT`, `APOD_SUMMARY_PROMPT`, `ASTEROID_BLURB_PROMPT`) with careful instructions around tone, length, accessibility, and safety (e.g. "never cause alarm" for asteroid blurbs).

### Frontend Development
Bob built all React components — `ChatWindow`, `MessageBubble`, `ChatInput`, `TypingIndicator`, `APODCard`, `ISSTracker`, `AstronautCrew`, and `AsteroidFeed` — including the SVG world map with live ISS trail animation, the accordion asteroid list, and the crew grouping by spacecraft.

### Cross-Component Communication
Bob designed and implemented the `ChatContext` pattern (ref-based, zero re-renders) that allows sidebar components (`APODCard`, `AstronautCrew`) to inject messages into the chat panel without a state management library.

### Debugging & Fixes
Bob diagnosed live errors from terminal output, including the watsonx.ai `InvalidCredentialsError` caused by the import-time env var read, the `no_associated_service_instance_error` requiring WML association, and the unsupported model ID — each resolved with targeted, minimal fixes.

### Layout & UX
Bob fixed the viewport height bug (`min-h-screen` → `h-screen`) that caused the chat input to require scrolling to reach, and added the chat history persistence hook with `localStorage`, Date revival, and a confirmation-gated clear button.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React, TypeScript, Tailwind CSS |
| Backend | Python 3.13, FastAPI, Uvicorn |
| AI | IBM Granite (`ibm/granite-4-h-small`) via watsonx.ai |
| AI SDK | `ibm-watsonx-ai` Python SDK |
| Space APIs | NASA APOD, NASA NeoWs, Open Notify |
| Dev Tool | IBM Bob |

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- IBM Cloud account with watsonx.ai project + Watson Machine Learning instance
- NASA API key (free at [api.nasa.gov](https://api.nasa.gov))

### 1. Frontend

```bash
cd space-assistant
cp .env.example .env.local
# Set BACKEND_URL=http://localhost:8000 in .env.local
npm install
npm run dev
```

### 2. Backend

```bash
cd space-assistant/backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Fill in WATSONX_API_KEY, WATSONX_PROJECT_ID, NASA_API_KEY in .env
uvicorn main:app --reload --port 8000
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
space-assistant/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Main layout
│   │   ├── layout.tsx                # Root layout
│   │   └── api/
│   │       ├── chat/route.ts         # POST /api/chat → Granite
│   │       ├── apod/route.ts         # GET  /api/apod → NASA + Granite
│   │       ├── iss/route.ts          # GET  /api/iss  → Open Notify
│   │       ├── astronauts/route.ts   # GET  /api/astronauts → Open Notify
│   │       └── asteroids/route.ts    # GET  /api/asteroids → NASA NeoWs + Granite
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatWindow.tsx        # Chat orchestrator + localStorage persistence
│   │   │   ├── MessageBubble.tsx     # Message rendering
│   │   │   ├── ChatInput.tsx         # Input + suggested prompts
│   │   │   └── TypingIndicator.tsx   # Animated loading state
│   │   ├── APODCard.tsx              # NASA APOD + Granite summary + Ask button
│   │   ├── ISSTracker.tsx            # Live SVG map + coordinates
│   │   ├── AstronautCrew.tsx         # Crew list grouped by spacecraft
│   │   └── AsteroidFeed.tsx          # Accordion asteroid list
│   ├── context/
│   │   └── ChatContext.tsx           # Cross-component sendMessage ref
│   ├── hooks/
│   │   └── useChatHistory.ts         # localStorage persistence hook
│   └── types/
│       └── chat.ts                   # Message types
└── backend/
    ├── main.py                       # FastAPI app — all endpoints
    ├── granite_client.py             # watsonx.ai ModelInference wrapper
    ├── prompts.py                    # Granite prompt templates
    └── requirements.txt
```
