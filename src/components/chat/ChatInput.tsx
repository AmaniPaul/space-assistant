"use client";

import { useState, useRef, KeyboardEvent } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

const SUGGESTED_PROMPTS = [
  "What is the ISS doing right now?",
  "Explain the James Webb Telescope to me",
  "Are any asteroids near Earth this week?",
  "What's today's astronomy picture?",
];

export default function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Suggested prompts */}
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSend(prompt)}
            disabled={isLoading}
            className="text-xs px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div className="flex items-end gap-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl px-4 py-3 focus-within:border-[var(--accent)] transition-colors">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Ask anything about space…"
          rows={1}
          disabled={isLoading}
          className="flex-1 bg-transparent resize-none text-sm text-[var(--foreground)] placeholder-[var(--muted)] outline-none leading-relaxed disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!value.trim() || isLoading}
          className="shrink-0 w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
      <p className="text-xs text-center text-[var(--muted)]">
        Press <kbd className="px-1 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)] font-mono text-[10px]">Enter</kbd> to send · <kbd className="px-1 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)] font-mono text-[10px]">Shift+Enter</kbd> for new line
      </p>
    </div>
  );
}
