import { useState, useEffect, useCallback } from "react";
import { Message } from "@/types/chat";

const STORAGE_KEY = "space-assistant:chat-history";
// Cap stored messages so localStorage doesn't grow unbounded
const MAX_STORED = 200;

// JSON stores timestamps as strings — revive them back to Date objects
function reviveMessages(raw: unknown): Message[] {
  if (!Array.isArray(raw)) return [];
  return (raw as Record<string, unknown>[]).map((m) => ({
    id: String(m.id ?? crypto.randomUUID()),
    role: m.role === "user" ? "user" : "assistant",
    content: String(m.content ?? ""),
    timestamp: m.timestamp ? new Date(m.timestamp as string) : new Date(),
  }));
}

function loadFromStorage(fallback: Message[]): Message[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as unknown;
    const messages = reviveMessages(parsed);
    return messages.length > 0 ? messages : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(messages: Message[]): void {
  try {
    const toStore = messages.slice(-MAX_STORED);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch {
    // Quota exceeded or private browsing — fail silently
  }
}

export function useChatHistory(welcome: Message) {
  // Initialise lazily from localStorage on first render
  const [messages, setMessages] = useState<Message[]>(() =>
    loadFromStorage([welcome])
  );

  // Persist to localStorage whenever messages change
  useEffect(() => {
    saveToStorage(messages);
  }, [messages]);

  const clearHistory = useCallback(() => {
    setMessages([welcome]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, [welcome]);

  return { messages, setMessages, clearHistory };
}
