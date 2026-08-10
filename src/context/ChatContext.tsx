"use client";

import { createContext, useContext, useRef } from "react";

interface ChatContextValue {
  // Call this from anywhere in the tree to inject a message into the chat
  sendMessage: (content: string) => void;
  // ChatWindow registers its handler here on mount
  registerSend: (fn: (content: string) => void) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const sendRef = useRef<((content: string) => void) | null>(null);

  const registerSend = (fn: (content: string) => void) => {
    sendRef.current = fn;
  };

  const sendMessage = (content: string) => {
    sendRef.current?.(content);
  };

  return (
    <ChatContext.Provider value={{ sendMessage, registerSend }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext must be used inside <ChatProvider>");
  return ctx;
}
