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

// Placeholder AI response — will be replaced with real watsonx.ai / Granite call
async function fetchAIResponse(messages: Message[]): Promise<string> {
  const lastMessage = messages[messages.length - 1].content.toLowerCase();

  // Simulated responses for scaffolding purposes
  await new Promise((resolve) => setTimeout(resolve, 1200));

  if (lastMessage.includes("iss") || lastMessage.includes("space station")) {
    return "The International Space Station (ISS) orbits Earth at approximately 408 km altitude, traveling at 27,600 km/h. It completes one full orbit every 90 minutes! 🛸\n\nRight now, there are likely 7 crew members aboard conducting scientific experiments. You can track the ISS live using the Open Notify API — I'll be connected to it soon!";
  }
  if (lastMessage.includes("james webb") || lastMessage.includes("jwst")) {
    return "The James Webb Space Telescope (JWST) is the most powerful space telescope ever built! 🔭\n\nLaunched on December 25, 2021, it observes the universe in infrared light, allowing it to see through dust clouds and observe the earliest galaxies — some formed just 300 million years after the Big Bang.";
  }
  if (lastMessage.includes("asteroid")) {
    return "Great question! NASA's Center for Near Earth Object Studies (CNEOS) tracks thousands of asteroids. 🪨\n\nMost near-Earth asteroids are completely harmless, but NASA monitors them closely. I'll be connected to the NASA NeoWs API soon to show you real-time asteroid data!";
  }
  if (lastMessage.includes("astronomy picture") || lastMessage.includes("apod")) {
    return "NASA's Astronomy Picture of the Day (APOD) is one of the most popular websites on the internet! 🌌\n\nEvery day, a professional astronomer selects a stunning image of our universe and provides an explanation. Once I'm connected to the NASA APOD API, I'll show you today's image with an explanation tailored for everyone!";
  }

  return "That's a fascinating space question! 🌠\n\nI'm currently in demo mode — once connected to IBM watsonx.ai and NASA APIs, I'll be able to give you detailed, real-time answers about anything in the cosmos. Try asking about the ISS, James Webb Telescope, asteroids, or the astronomy picture of the day!";
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
