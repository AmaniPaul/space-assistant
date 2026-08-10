"use client";

import { useEffect, useRef, useState } from "react";

interface ISSPosition {
  latitude: number;
  longitude: number;
  altitude_km: number;
  velocity_kmh: number;
  timestamp: number;
}

// Convert lat/lon to SVG x/y on a simple equirectangular projection
// SVG viewBox is "0 0 360 180"
function toSVG(lat: number, lon: number): { x: number; y: number } {
  return {
    x: lon + 180,          // longitude: -180..180 → 0..360
    y: 90 - lat,           // latitude:  -90..90  → 180..0 (SVG y is top-down)
  };
}

function formatCoord(val: number, posLabel: string, negLabel: string): string {
  return `${Math.abs(val).toFixed(2)}° ${val >= 0 ? posLabel : negLabel}`;
}

// Keep the last N positions for the trail
const TRAIL_LENGTH = 40;
const POLL_INTERVAL_MS = 5000;

export default function ISSTracker() {
  const [position, setPosition] = useState<ISSPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchPosition = async () => {
    try {
      const res = await fetch("/api/iss", { cache: "no-store" });
      if (!res.ok) {
        const e = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(e.error ?? "Request failed");
      }
      const data = await res.json() as ISSPosition;
      setPosition(data);
      setError(null);
      setTrail((prev) => {
        const pt = toSVG(data.latitude, data.longitude);
        const next = [...prev, pt];
        return next.length > TRAIL_LENGTH ? next.slice(-TRAIL_LENGTH) : next;
      });
    } catch (err: unknown) {
      setError(String(err));
    }
  };

  useEffect(() => {
    fetchPosition();
    intervalRef.current = setInterval(fetchPosition, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const issPos = position ? toSVG(position.latitude, position.longitude) : null;

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[var(--foreground)]">
            ISS Live Tracker
          </h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Open Notify API · Polls every 5s
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {error ? (
            <span className="w-2 h-2 rounded-full bg-red-400" />
          ) : position ? (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          )}
          <span className="text-xs text-[var(--muted)]">
            {error ? "Error" : position ? "Live" : "Connecting…"}
          </span>
        </div>
      </div>

      {/* SVG world map */}
      <div className="w-full rounded-xl overflow-hidden border border-[var(--border)] bg-[#0a1628]">
        <svg
          viewBox="0 0 360 180"
          className="w-full"
          aria-label="World map showing ISS position"
        >
          {/* Graticule — grid lines every 30° */}
          {[-60, -30, 0, 30, 60].map((lat) => (
            <line
              key={`lat-${lat}`}
              x1="0" y1={90 - lat}
              x2="360" y2={90 - lat}
              stroke="#1e3a5f" strokeWidth="0.4"
            />
          ))}
          {[-120, -60, 0, 60, 120].map((lon) => (
            <line
              key={`lon-${lon}`}
              x1={lon + 180} y1="0"
              x2={lon + 180} y2="180"
              stroke="#1e3a5f" strokeWidth="0.4"
            />
          ))}

          {/* Equator */}
          <line x1="0" y1="90" x2="360" y2="90" stroke="#1e4d7f" strokeWidth="0.6" />

          {/* Simplified world landmasses as filled polygons */}
          {/* North America */}
          <polygon points="50,20 80,18 95,25 100,40 90,55 75,60 60,55 45,45 40,30" fill="#1a3a2a" />
          {/* South America */}
          <polygon points="75,65 95,62 105,75 100,100 85,115 70,105 68,85" fill="#1a3a2a" />
          {/* Europe */}
          <polygon points="155,20 185,18 195,30 185,40 165,42 150,35" fill="#1a3a2a" />
          {/* Africa */}
          <polygon points="160,45 190,42 200,60 195,90 175,110 158,95 152,70 155,50" fill="#1a3a2a" />
          {/* Asia */}
          <polygon points="190,15 270,12 300,25 305,50 280,60 240,65 210,55 195,40" fill="#1a3a2a" />
          {/* Australia */}
          <polygon points="265,95 300,90 310,105 300,120 272,118 260,108" fill="#1a3a2a" />
          {/* Greenland */}
          <polygon points="105,10 130,8 132,22 115,28 100,22" fill="#1a3a2a" />

          {/* ISS orbital inclination band (~51.6°) */}
          <rect
            x="0" y={90 - 51.6}
            width="360" height={51.6 * 2}
            fill="#4f8ef7" fillOpacity="0.04"
          />

          {/* Trail */}
          {trail.length > 1 && trail.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x} cy={pt.y} r="0.8"
              fill="#4f8ef7"
              fillOpacity={0.2 + (i / trail.length) * 0.6}
            />
          ))}

          {/* ISS marker */}
          {issPos && (
            <g transform={`translate(${issPos.x}, ${issPos.y})`}>
              {/* Pulse ring */}
              <circle r="4" fill="none" stroke="#4f8ef7" strokeWidth="0.8" opacity="0.5">
                <animate attributeName="r" values="4;7;4" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
              </circle>
              {/* Core dot */}
              <circle r="2.5" fill="#4f8ef7" />
              {/* ISS icon cross */}
              <line x1="-4" y1="0" x2="4" y2="0" stroke="#4f8ef7" strokeWidth="0.8" />
              <line x1="0" y1="-4" x2="0" y2="4" stroke="#4f8ef7" strokeWidth="0.8" />
            </g>
          )}
        </svg>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400 font-mono break-all">{error}</p>
      )}

      {/* Coordinate stats */}
      <div className="grid grid-cols-2 gap-2">
        {[
          {
            label: "Latitude",
            value: position
              ? formatCoord(position.latitude, "N", "S")
              : "—",
          },
          {
            label: "Longitude",
            value: position
              ? formatCoord(position.longitude, "E", "W")
              : "—",
          },
          {
            label: "Altitude",
            value: position ? `${position.altitude_km.toFixed(0)} km` : "~408 km",
          },
          {
            label: "Speed",
            value: position
              ? `${position.velocity_kmh.toLocaleString()} km/h`
              : "~27,600 km/h",
          },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2"
          >
            <p className="text-xs text-[var(--muted)]">{label}</p>
            <p className="text-sm font-mono font-medium text-[var(--foreground)] mt-0.5 tabular-nums">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Last updated */}
      {position && (
        <p className="text-xs text-[var(--muted)] text-right">
          Updated {new Date(position.timestamp * 1000).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
