"use client";

// Placeholder ISS Tracker — will be wired to Open Notify API + react-globe.gl
export default function ISSTracker() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[var(--foreground)]">
            ISS Live Tracker
          </h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">Open Notify API · Real-time</p>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-[var(--accent-dim)] text-[var(--accent)] border border-[var(--accent)] border-opacity-30">
          Coming soon
        </span>
      </div>

      {/* Globe placeholder */}
      <div className="h-40 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex flex-col items-center justify-center gap-2 relative overflow-hidden">
        <span className="text-3xl">🌍</span>
        <p className="text-xs text-[var(--muted)]">Interactive globe coming soon</p>
      </div>

      {/* Coordinates placeholder */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Latitude", value: "—" },
          { label: "Longitude", value: "—" },
          { label: "Altitude", value: "~408 km" },
          { label: "Speed", value: "~27,600 km/h" },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2"
          >
            <p className="text-xs text-[var(--muted)]">{label}</p>
            <p className="text-sm font-mono font-medium text-[var(--foreground)] mt-0.5">
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
