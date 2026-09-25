"use client";

import { useState, useRef, useEffect } from "react";
import api from "../lib/api";

const LOGO_SRC = "/logo.webp";
const LOGO_FALLBACK = "/logo.png";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const WELCOME_MSG = "Hi! I'm **Caat** 🤖, Caakus's AI assistant. Ask me anything about the platform, Yuyu, or how to get started!";

async function sendMessage(messages: Message[]): Promise<string> {
  const data = await api.post("caakus-chat", { messages }, { isGuest: true, timeoutMs: 30000 });
  return data?.reply ?? "Something went wrong. Please try again or contact hello@caakus.com.";
}

function Logo({ className, onError }: { className: string; onError: (e: React.SyntheticEvent<HTMLImageElement>) => void }) {
  return <img src={LOGO_SRC} alt="Caat" width={48} height={48} decoding="async" className={className} onError={onError} />;
}

const logoError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const t = e.currentTarget;
  if (t.src !== LOGO_FALLBACK) t.src = LOGO_FALLBACK;
};

const SUGGESTIONS = [
  "What is Caakus?",
  "What is Yuyu?",
  "How do I earn money?",
  "How do I join?",
];

export default function CaakusChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: WELCOME_MSG },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (overrideInput?: string) => {
    const text = (overrideInput ?? input).trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const reply = await sendMessage(updated);
      setMessages([...updated, { role: "assistant", content: reply }]);
    } catch {
      setMessages([
        ...updated,
        { role: "assistant", content: "Sorry, I couldn't connect. Try again or email hello@caakus.com." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating trigger button — always shows logo + "Help" label */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 right-4 z-[9999] flex h-11 items-center gap-2 overflow-hidden rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 pl-0 pr-3 shadow-lg shadow-violet-500/30 transition-all duration-200 hover:scale-105 sm:bottom-5 sm:right-5 sm:h-12 sm:pr-4"
        aria-label="Open Caakus AI chat"
      >
        <Logo
          className="h-11 w-11 shrink-0 rounded-full object-cover sm:h-12 sm:w-12"
          onError={logoError}
        />
        <span className="whitespace-nowrap text-xs font-bold text-white sm:text-sm">
          Help
        </span>
      </button>

      {/* Chat panel — floats above the button with a clear gap, never overlaps */}
      {open && (
        <div className="fixed bottom-[4.5rem] right-3 z-[9998] flex h-[min(460px,calc(100dvh-6rem))] w-[min(320px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl sm:bottom-20 sm:right-5 sm:h-[480px] sm:w-[340px]">

          {/* Header */}
          <div className="flex shrink-0 items-center gap-2.5 bg-gradient-to-r from-violet-600 to-cyan-600 px-3 py-2.5">
            <Logo
              className="h-7 w-7 flex-shrink-0 rounded-full object-contain ring-2 ring-white/25"
              onError={logoError}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold leading-tight text-white">Caat</p>
                <span className="rounded bg-white/20 px-1 py-px text-[9px] font-semibold uppercase tracking-wide text-white/90">AI</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-[10px] leading-tight text-white/70">Caakus Assistant · Online</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 text-white/80 transition hover:bg-white/25 hover:text-white"
              aria-label="Close chat"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M1 1l8 8M9 1L1 9"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-2.5 py-2.5">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-end gap-1.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {msg.role === "assistant" && (
                  <Logo
                    className="h-5 w-5 flex-shrink-0 self-end rounded-full object-contain"
                    onError={logoError}
                  />
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-2.5 py-1.5 text-[12px] leading-relaxed ${
                    msg.role === "user"
                      ? "rounded-br-sm bg-gradient-to-br from-violet-600 to-violet-700 text-white"
                      : "rounded-bl-sm bg-slate-800 text-slate-100"
                  }`}
                  style={{ wordBreak: "break-word" }}
                  dangerouslySetInnerHTML={{
                    __html: msg.content
                      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                      .replace(/\n/g, "<br/>"),
                  }}
                />
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex items-end gap-1.5">
                <Logo className="h-5 w-5 flex-shrink-0 rounded-full object-contain" onError={logoError} />
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-slate-800 px-3 py-2">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions — only on first message */}
          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-1 px-2.5 pb-1.5">
              {SUGGESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="rounded-full border border-violet-500/35 bg-violet-500/10 px-2 py-0.5 text-[10px] text-violet-300 transition hover:bg-violet-500/20"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input bar */}
          <div className="flex shrink-0 items-center gap-1.5 border-t border-white/8 bg-slate-800/60 px-2.5 py-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask anything..."
              disabled={loading}
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-900/80 px-2.5 py-1.5 text-[12px] text-white placeholder-slate-500 outline-none transition focus:border-violet-500/50"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Send"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
