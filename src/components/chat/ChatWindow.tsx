"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Message } from "@/types/chat";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "👋 Hi! I'm your Space Assistant, powered by IBM Granite.\n\nI can help you explore the universe — from today's astronomy picture to live ISS tracking and near-Earth asteroids. Ask me anything about space! 🚀",
  timestamp: new Date(),
};

async function fetchAIResponse(messages: Message[]): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: messages.map(({ role, content }) => ({ role, content })),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? "Request failed");
  }

  const data = await res.json() as { reply: string };
  return data.reply;
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = useCallback(
    async (content: string) => {
      if (isLoading) return;

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const updatedMessages = [...messages, userMessage];
        const responseText = await fetchAIResponse(updatedMessages);

        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: responseText,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch {
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Sorry, I encountered an error reaching the AI. Please try again! 🛸",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 px-6 py-4 border-b border-[var(--border)] flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[var(--accent-dim)] border border-[var(--accent)] flex items-center justify-center text-lg">
          🛸
        </div>
        <div>
          <h2 className="text-sm font-semibold text-[var(--foreground)]">
            Space Assistant
          </h2>
          <p className="text-xs text-[var(--muted)]">
            Powered by IBM Granite · watsonx.ai
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-[var(--muted)]">Online</span>
        </div>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-6 py-4 border-t border-[var(--border)]">
        <ChatInput onSend={handleSend} isLoading={isLoading} />
      </div>
    </div>
  );
}
