"use client";

import { useEffect, useState } from "react";

interface Asteroid {
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

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: Asteroid[] };

function DangerBadge({ hazardous }: { hazardous: boolean }) {
  return hazardous ? (
    <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/40 text-red-400 border border-red-800">
      Potentially hazardous
    </span>
  ) : (
    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900/30 text-emerald-400 border border-emerald-800">
      Safe flyby
    </span>
  );
}

export default function AsteroidFeed() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/asteroids")
      .then((res) => {
        if (!res.ok) return res.json().then((e) => Promise.reject((e as { error?: string }).error ?? "Failed"));
        return res.json() as Promise<Asteroid[]>;
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
            Near-Earth Asteroids
          </h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            NASA NeoWs · This week&apos;s flybys
          </p>
        </div>
        {state.status === "success" && (
          <span className="text-xs text-[var(--muted)]">
            {state.data.length} tracked
          </span>
        )}
      </div>

      {/* Loading skeleton */}
      {state.status === "loading" && (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Error */}
      {state.status === "error" && (
        <div className="rounded-lg bg-[var(--surface-2)] border border-[var(--border)] p-3 text-center">
          <p className="text-xs text-[var(--muted)]">Could not load asteroid data.</p>
          <p className="text-xs text-red-400 mt-1 font-mono break-all">{state.message}</p>
        </div>
      )}

      {/* Asteroid list */}
      {state.status === "success" && state.data.length === 0 && (
        <p className="text-xs text-[var(--muted)] text-center py-4">
          No asteroid flybys this week. 🪨
        </p>
      )}

      {state.status === "success" && state.data.map((asteroid) => {
        const isOpen = expanded === asteroid.id;
        return (
          <div
            key={asteroid.id}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] overflow-hidden"
          >
            {/* Row — always visible */}
            <button
              onClick={() => setExpanded(isOpen ? null : asteroid.id)}
              className="w-full text-left px-3 py-2.5 flex items-start gap-2 hover:bg-white/5 transition-colors"
            >
              <span className="text-lg mt-0.5 shrink-0">🪨</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs font-semibold text-[var(--foreground)] truncate">
                    {asteroid.name}
                  </p>
                  <DangerBadge hazardous={asteroid.is_hazardous} />
                </div>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  {asteroid.date} · {asteroid.miss_lunar.toFixed(2)} lunar distances away
                </p>
              </div>
              <span className="text-[var(--muted)] text-xs mt-1 shrink-0">
                {isOpen ? "▲" : "▼"}
              </span>
            </button>

            {/* Expanded detail */}
            {isOpen && (
              <div className="px-3 pb-3 flex flex-col gap-3 border-t border-[var(--border)]">
                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {[
                    { label: "Miss distance", value: `${asteroid.miss_km.toLocaleString()} km` },
                    { label: "Velocity", value: `${asteroid.velocity_kmh.toLocaleString()} km/h` },
                    { label: "Est. diameter", value: `${Math.round(asteroid.diameter_min)}–${Math.round(asteroid.diameter_max)} m` },
                    { label: "Lunar distances", value: asteroid.miss_lunar.toFixed(3) },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-[var(--surface)] rounded-md px-2.5 py-1.5">
                      <p className="text-xs text-[var(--muted)]">{label}</p>
                      <p className="text-xs font-mono font-medium text-[var(--foreground)] mt-0.5 tabular-nums">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Granite blurb */}
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  {asteroid.blurb}
                </p>

                {/* NASA link */}
                <a
                  href={asteroid.nasa_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--accent)] hover:underline"
                >
                  View on NASA JPL →
                </a>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
