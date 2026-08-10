import ChatWindow from "@/components/chat/ChatWindow";
import APODCard from "@/components/APODCard";
import ISSTracker from "@/components/ISSTracker";
import AsteroidFeed from "@/components/AsteroidFeed";
import AstronautCrew from "@/components/AstronautCrew";
import { ChatProvider } from "@/context/ChatContext";

export default function Home() {
  return (
  <ChatProvider>
    <div className="h-screen flex flex-col bg-[var(--background)] overflow-hidden">
      {/* Top nav */}
      <header className="shrink-0 h-14 border-b border-[var(--border)] flex items-center px-6 gap-3">
        <span className="text-xl">🚀</span>
        <span className="font-semibold text-[var(--foreground)] tracking-tight">
          Space Assistant
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent-dim)] text-[var(--accent)] ml-1">
          Beta
        </span>
        <div className="ml-auto flex items-center gap-4 text-xs text-[var(--muted)]">
          <span>Powered by IBM Granite</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">watsonx.ai</span>
        </div>
      </header>

      {/* Main layout */}
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar — APOD + ISS tracker + Asteroid feed */}
        <aside className="hidden lg:flex flex-col w-80 xl:w-96 shrink-0 border-r border-[var(--border)] overflow-y-auto p-5 gap-8 bg-[var(--surface)]">
          <APODCard />
          <div className="border-t border-[var(--border)]" />
          <ISSTracker />
          <div className="border-t border-[var(--border)]" />
          <AstronautCrew />
          <div className="border-t border-[var(--border)]" />
          <AsteroidFeed />
        </aside>

        {/* Chat panel — flex-1 + h-0 trick forces it to fill without overflowing */}
        <section className="flex-1 flex flex-col min-w-0 h-full bg-[var(--background)]">
          <ChatWindow />
        </section>
      </main>

      {/* Footer */}
      <footer className="shrink-0 h-8 border-t border-[var(--border)] flex items-center justify-center">
        <p className="text-xs text-[var(--muted)]">
          Space Assistant · Built with IBM Bob, IBM Granite &amp; NASA APIs
        </p>
      </footer>
    </div>
  </ChatProvider>
  );
}
