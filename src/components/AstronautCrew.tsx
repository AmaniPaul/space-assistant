"use client";

import { useEffect, useState } from "react";
import { useChatContext } from "@/context/ChatContext";

interface Astronaut {
  name: string;
  craft: string;
}

interface AstronautsData {
  people: Astronaut[];
  number: number;
}

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: AstronautsData };

// Craft-specific colours
const CRAFT_COLORS: Record<string, string> = {
  ISS: "text-[var(--accent)] border-[var(--accent)] bg-[var(--accent-dim)]",
  "Tiangong": "text-red-400 border-red-800 bg-red-900/20",
};

function craftBadgeClass(craft: string): string {
  return CRAFT_COLORS[craft] ?? "text-[var(--muted)] border-[var(--border)] bg-[var(--surface-2)]";
}

// Group astronauts by spacecraft
function groupByCraft(people: Astronaut[]): Record<string, Astronaut[]> {
  return people.reduce<Record<string, Astronaut[]>>((acc, p) => {
    (acc[p.craft] ??= []).push(p);
    return acc;
  }, {});
}

export default function AstronautCrew() {
  const [state, setState] = useState<State>({ status: "loading" });
  const { sendMessage } = useChatContext();

  useEffect(() => {
    fetch("/api/astronauts")
      .then((res) => {
        if (!res.ok) return res.json().then((e) => Promise.reject((e as { error?: string }).error ?? "Failed"));
        return res.json() as Promise<AstronautsData>;
      })
      .then((data) => setState({ status: "success", data }))
      .catch((err: unknown) =>
        setState({ status: "error", message: String(err) })
      );
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[var(--foreground)]">
            Humans in Space
          </h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Open Notify · Right now
          </p>
        </div>
        {state.status === "success" && (
          <span className="text-xs font-mono font-semibold text-[var(--accent)]">
            {state.data.number} aboard
          </span>
        )}
      </div>

      {/* Loading skeleton */}
      {state.status === "loading" && (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-10 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Error */}
      {state.status === "error" && (
        <div className="rounded-lg bg-[var(--surface-2)] border border-[var(--border)] p-3 text-center">
          <p className="text-xs text-[var(--muted)]">Could not load crew data.</p>
          <p className="text-xs text-red-400 mt-1 font-mono break-all">{state.message}</p>
        </div>
      )}

      {/* Crew list grouped by spacecraft */}
      {state.status === "success" && (() => {
        const groups = groupByCraft(state.data.people);
        return Object.entries(groups).map(([craft, crew]) => (
          <div key={craft} className="flex flex-col gap-2">
            {/* Spacecraft label */}
            <div className="flex items-center gap-2">
              <span className="text-base">🛸</span>
              <span className="text-xs font-semibold text-[var(--foreground)]">
                {craft}
              </span>
              <span className={`ml-auto text-xs px-2 py-0.5 rounded-full border font-mono ${craftBadgeClass(craft)}`}>
                {crew.length} crew
              </span>
            </div>

            {/* Crew members */}
            <div className="flex flex-col gap-1.5 pl-1">
              {crew.map((astronaut) => (
                <div
                  key={astronaut.name}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]"
                >
                  <span className="text-base">👨‍🚀</span>
                  <span className="text-xs text-[var(--foreground)] font-medium flex-1">
                    {astronaut.name}
                  </span>
                  <button
                    onClick={() =>
                      sendMessage(`Tell me about astronaut ${astronaut.name} who is currently aboard ${astronaut.craft}.`)
                    }
                    className="text-xs text-[var(--accent)] hover:underline shrink-0"
                    title={`Ask about ${astronaut.name}`}
                  >
                    Ask →
                  </button>
                </div>
              ))}
            </div>
          </div>
        ));
      })()}

      {/* Total footer */}
      {state.status === "success" && (
        <button
          onClick={() =>
            sendMessage(
              `Who are the ${state.data.number} humans currently in space? Give me a brief overview of the crew.`
            )
          }
          className="w-full text-xs py-2 px-3 rounded-lg border border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-dim)] hover:bg-[var(--accent)] hover:text-white transition-colors font-medium"
        >
          💬 Ask about the crew
        </button>
      )}
    </div>
  );
}
