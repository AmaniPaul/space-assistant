"use client";

import { Message } from "@/types/chat";

interface MessageBubbleProps {
  message: Message;
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex items-end gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
          isUser
            ? "bg-[var(--accent)] text-white"
            : "bg-[var(--surface-2)] border border-[var(--border)] text-[var(--accent)]"
        }`}
      >
        {isUser ? "U" : "🛸"}
      </div>

      {/* Bubble */}
      <div className={`flex flex-col gap-1 max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
            isUser
              ? "bg-[var(--user-bubble)] text-[var(--foreground)] rounded-br-sm"
              : "bg-[var(--assistant-bubble)] text-[var(--foreground)] border border-[var(--border)] rounded-bl-sm"
          }`}
        >
          {message.content}
        </div>
        <span className="text-xs text-[var(--muted)] px-1">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}
