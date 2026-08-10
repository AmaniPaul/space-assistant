"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface APODData {
  title: string;
  date: string;
  explanation: string;
  summary: string;
  url: string | null;
  hdurl: string | null;
  media_type: string;
  copyright: string | null;
}

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: APODData };

export default function APODCard() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    fetch("/api/apod")
      .then((res) => {
        if (!res.ok) return res.json().then((e) => Promise.reject(e.error ?? "Failed"));
        return res.json() as Promise<APODData>;
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
            Astronomy Picture of the Day
          </h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">NASA APOD · Updated daily</p>
        </div>
        {state.status === "success" && (
          <span className="text-xs text-[var(--muted)]">{state.data.date}</span>
        )}
      </div>

      {/* Loading skeleton */}
      {state.status === "loading" && (
        <>
          <div className="w-full aspect-video rounded-xl bg-[var(--surface-2)] border border-[var(--border)] animate-pulse" />
          <div className="flex flex-col gap-2">
            <div className="h-4 w-3/4 rounded bg-[var(--border)] animate-pulse" />
            <div className="h-3 w-full rounded bg-[var(--border)] animate-pulse opacity-60" />
            <div className="h-3 w-5/6 rounded bg-[var(--border)] animate-pulse opacity-40" />
          </div>
        </>
      )}

      {/* Error state */}
      {state.status === "error" && (
        <div className="w-full rounded-xl bg-[var(--surface-2)] border border-[var(--border)] p-4 text-center">
          <p className="text-xs text-[var(--muted)]">
            Could not load today&apos;s picture.
          </p>
          <p className="text-xs text-red-400 mt-1 font-mono break-all">{state.message}</p>
        </div>
      )}

      {/* Success state */}
      {state.status === "success" && (
        <>
          {/* Image or video thumbnail */}
          {state.data.url ? (
            <a
              href={state.data.hdurl ?? state.data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block relative w-full aspect-video rounded-xl overflow-hidden border border-[var(--border)] hover:border-[var(--accent)] transition-colors group"
            >
              <Image
                src={state.data.url}
                alt={state.data.title}
                fill
                className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                sizes="(max-width: 1280px) 320px, 384px"
                unoptimized
              />
              {state.data.media_type === "video" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <span className="text-3xl">▶️</span>
                </div>
              )}
            </a>
          ) : (
            <div className="w-full aspect-video rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-3xl">
              🌌
            </div>
          )}

          {/* Title */}
          <p className="text-sm font-semibold text-[var(--foreground)] leading-snug">
            {state.data.title}
          </p>

          {/* Granite-generated plain-language summary */}
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            {state.data.summary}
          </p>

          {/* Copyright */}
          {state.data.copyright && (
            <p className="text-xs text-[var(--muted)] opacity-60">
              © {state.data.copyright.trim()}
            </p>
          )}
        </>
      )}
    </div>
  );
}
