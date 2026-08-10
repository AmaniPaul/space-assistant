"use client";

export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-3">
      {/* Avatar */}
      <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm bg-[var(--surface-2)] border border-[var(--border)] text-[var(--accent)]">
        🛸
      </div>

      {/* Animated dots */}
      <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-[var(--assistant-bubble)] border border-[var(--border)] flex items-center gap-1">
        <span
          className="w-2 h-2 rounded-full bg-[var(--accent)] opacity-60 animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="w-2 h-2 rounded-full bg-[var(--accent)] opacity-60 animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="w-2 h-2 rounded-full bg-[var(--accent)] opacity-60 animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  );
}
