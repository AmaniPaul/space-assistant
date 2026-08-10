import ChatWindow from "@/components/chat/ChatWindow";
import APODCard from "@/components/APODCard";
import ISSTracker from "@/components/ISSTracker";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
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
        {/* Sidebar — APOD + ISS tracker */}
        <aside className="hidden lg:flex flex-col w-80 xl:w-96 shrink-0 border-r border-[var(--border)] overflow-y-auto p-5 gap-8 bg-[var(--surface)]">
          <APODCard />
          <div className="border-t border-[var(--border)]" />
          <ISSTracker />
        </aside>

        {/* Chat panel */}
        <section className="flex-1 flex flex-col min-w-0 bg-[var(--background)]">
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
  );
}
