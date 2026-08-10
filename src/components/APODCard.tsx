"use client";

// Placeholder APOD Card — will be wired to NASA APOD API
export default function APODCard() {
  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[var(--foreground)]">
            Astronomy Picture of the Day
          </h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">NASA APOD · Updated daily</p>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-[var(--accent-dim)] text-[var(--accent)] border border-[var(--accent)] border-opacity-30">
          Coming soon
        </span>
      </div>

      {/* Image placeholder */}
      <div className="flex-1 min-h-48 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex flex-col items-center justify-center gap-3 relative overflow-hidden">
        {/* Decorative stars */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 rounded-full bg-white opacity-40"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
        <span className="text-4xl">🌌</span>
        <p className="text-sm text-[var(--muted)] text-center px-4">
          Connect your NASA API key to see today&apos;s astronomy picture
        </p>
        <div className="flex gap-2">
          <div className="h-1.5 w-16 rounded-full bg-[var(--border)] animate-pulse" />
          <div className="h-1.5 w-10 rounded-full bg-[var(--border)] animate-pulse" />
          <div className="h-1.5 w-14 rounded-full bg-[var(--border)] animate-pulse" />
        </div>
      </div>

      {/* Info placeholder */}
      <div className="flex flex-col gap-2">
        <div className="h-4 w-3/4 rounded bg-[var(--border)] animate-pulse" />
        <div className="h-3 w-full rounded bg-[var(--border)] animate-pulse opacity-60" />
        <div className="h-3 w-5/6 rounded bg-[var(--border)] animate-pulse opacity-40" />
      </div>
    </div>
  );
}
