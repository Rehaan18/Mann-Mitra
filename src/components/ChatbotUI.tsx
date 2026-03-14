/**
 * ChatbotUI.tsx — full-screen fill version for Mann Mitra / Zen Zone
 * Fills the parent container instead of using fixed 680px height.
 */

import React, {
  useRef,
  useEffect,
  useState,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";
import {
  Mic,
  MicOff,
  Send,
  RotateCcw,
  AlertTriangle,
  Sparkles,
  ChevronDown,
} from "lucide-react";

import { useChatbot, type UIMessage } from "@/chatbot/useChatbot";
import type { MoodTag } from "@/chatbot/aiAdapter";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface ChatbotUIProps {
  userId?: string;
  userName?: string;
}

// ---------------------------------------------------------------------------
// Mood config
// ---------------------------------------------------------------------------
const MOOD_CONFIG: Record<MoodTag, { label: string; dotClass: string; badgeClass: string }> = {
  positive:    { label: "Feeling good",      dotClass: "bg-emerald-400", badgeClass: "bg-emerald-500/20 text-emerald-300" },
  neutral:     { label: "Checking in",       dotClass: "bg-slate-400",   badgeClass: "bg-slate-500/20 text-slate-300"   },
  mild_stress: { label: "A little stressed", dotClass: "bg-amber-400",   badgeClass: "bg-amber-500/20 text-amber-300"   },
  anxious:     { label: "Anxious",           dotClass: "bg-orange-400",  badgeClass: "bg-orange-500/20 text-orange-300" },
  sad:         { label: "Feeling sad",       dotClass: "bg-blue-400",    badgeClass: "bg-blue-500/20 text-blue-300"     },
  depressed:   { label: "Low mood",          dotClass: "bg-indigo-400",  badgeClass: "bg-indigo-500/20 text-indigo-300" },
  overwhelmed: { label: "Overwhelmed",       dotClass: "bg-purple-400",  badgeClass: "bg-purple-500/20 text-purple-300" },
  crisis:      { label: "Crisis detected",   dotClass: "bg-red-500",     badgeClass: "bg-red-500/20 text-red-300"       },
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function PulsingRing() {
  return <span className="absolute inset-0 rounded-full animate-ping bg-rose-400 opacity-40 pointer-events-none" />;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function FormattedMessage({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <span>
      {lines.map((line, li) => {
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <React.Fragment key={li}>
            {parts.map((part, pi) =>
              part.startsWith("**") && part.endsWith("**") ? (
                <strong key={pi} className="font-semibold">{part.slice(2, -2)}</strong>
              ) : (
                <span key={pi}>{part}</span>
              )
            )}
            {li < lines.length - 1 && <br />}
          </React.Fragment>
        );
      })}
    </span>
  );
}

function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  const isCrisis = message.isCrisis;

  return (
    <div
      className={`flex items-end gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"} group`}
      style={{ animation: "slideUp 0.25s ease-out both" }}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
          style={{ background: "linear-gradient(135deg, #7fb5a0 0%, #5f9ea0 100%)" }}>
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      )}

      <div className={`flex flex-col gap-1 max-w-[78%] ${isUser ? "items-end" : "items-start"}`}>
        <div className={[
          "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm transition-shadow",
          isUser
            ? "bg-gradient-to-br from-teal-600 to-teal-700 text-white rounded-br-sm"
            : isCrisis
            ? "bg-red-500/10 border border-red-500/30 text-foreground rounded-bl-sm"
            : "bg-card border border-border text-foreground rounded-bl-sm",
        ].join(" ")}>
          {isCrisis && (
            <div className="flex items-center gap-1.5 mb-2 text-red-400 font-medium text-xs uppercase tracking-wide">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Crisis Support Resources</span>
            </div>
          )}
          <FormattedMessage content={message.content} />
        </div>

        <div className={`flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ${isUser ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-[10px] text-muted-foreground tabular-nums">{formatTime(message.timestamp)}</span>
          {message.detectedMood && !isUser && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${MOOD_CONFIG[message.detectedMood].badgeClass}`}>
              {MOOD_CONFIG[message.detectedMood].label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5" style={{ animation: "slideUp 0.2s ease-out both" }}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
        style={{ background: "linear-gradient(135deg, #7fb5a0 0%, #5f9ea0 100%)" }}>
        <Sparkles className="w-4 h-4 text-white" />
      </div>
      <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map(i => (
            <span key={i} className="w-1.5 h-1.5 rounded-full bg-teal-400"
              style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component — fills its parent container completely
// ---------------------------------------------------------------------------
export function ChatbotUI({ userId, userName }: ChatbotUIProps) {
  const {
    messages, isLoading, error, isListening, voiceSupported,
    interimTranscript, submitMessage, toggleVoice, clearChat,
  } = useChatbot({ userId });

  const [inputValue, setInputValue] = useState("");
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = scrollAreaRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isLoading]);

  const handleScroll = () => {
    const el = scrollAreaRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 120);
  };

  const scrollToBottom = () => {
    const el = scrollAreaRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleSend = () => {
    const text = inputValue.trim() || interimTranscript.trim();
    if (!text || isLoading) return;
    setInputValue("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    submitMessage(text);
    inputRef.current?.focus();
  };

  const latestMood = [...messages].reverse().find(m => m.role === "assistant" && m.detectedMood)?.detectedMood;

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40%           { transform: translateY(-6px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .chat-scroll::-webkit-scrollbar { width: 4px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 2px; }
      `}</style>

      {/* 
        KEY CHANGE: w-full h-full instead of fixed w/h.
        rounded-3xl only on screens where there's space around it.
        The parent in AISupport.tsx drives the actual dimensions.
      */}
      <div
        className="flex flex-col w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-border"
        style={{ background: "hsl(var(--card))", fontFamily: "'DM Sans', sans-serif" }}
      >

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #5f9ea0 0%, #4a8a7a 100%)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles style={{ width: 18, height: 18 }} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-semibold text-[15px] leading-tight" style={{ fontFamily: "'Lora', serif" }}>
                Serenity
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                {latestMood && <span className={`w-2 h-2 rounded-full flex-shrink-0 ${MOOD_CONFIG[latestMood].dotClass}`} />}
                <span className="text-white/70 text-[11px]">
                  {latestMood ? MOOD_CONFIG[latestMood].label : "Mental Health Companion"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {userName && <span className="text-white/60 text-xs hidden sm:block">Hi, {userName}</span>}
            <button onClick={clearChat} title="Start new conversation"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center">
              <RotateCcw className="w-3.5 h-3.5 text-white/80" />
            </button>
          </div>
        </div>

        {/* ── Messages ─────────────────────────────────────────────────── */}
        <div className="relative flex-1 overflow-hidden">
          <div
            ref={scrollAreaRef}
            onScroll={handleScroll}
            className="chat-scroll h-full overflow-y-auto px-5 py-5 flex flex-col gap-4"
          >
            {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}
            {isLoading && <TypingIndicator />}
            {error && !isLoading && (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2"
                style={{ animation: "fadeIn 0.2s ease-out" }}>
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {showScrollBtn && (
            <button onClick={scrollToBottom}
              className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-card shadow-md border border-border flex items-center justify-center hover:bg-muted transition-all"
              style={{ animation: "fadeIn 0.15s ease-out" }}>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* ── Voice listening banner ────────────────────────────────────── */}
        {isListening && (
          <div className="mx-4 mb-1 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2"
            style={{ animation: "slideUp 0.15s ease-out" }}>
            <div className="relative flex-shrink-0">
              <span className="absolute inset-0 rounded-full animate-ping bg-rose-300 opacity-50" />
              <span className="relative w-2 h-2 rounded-full bg-rose-500 block" />
            </div>
            <span className="text-xs text-rose-400 flex-1 truncate">
              {interimTranscript || "Listening… speak now"}
            </span>
          </div>
        )}

        {/* ── Input bar ─────────────────────────────────────────────────── */}
        <div className="flex-shrink-0 px-4 pb-4 pt-2">
          <div className="flex items-end gap-2 bg-muted rounded-2xl px-3 py-2 border border-border">
            <textarea
              ref={inputRef}
              value={interimTranscript || inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Listening…" : "How are you feeling today?"}
              disabled={isLoading || isListening}
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none leading-relaxed py-1 max-h-[120px] min-h-[28px] disabled:opacity-60"
              style={{ fontFamily: "'DM Sans', sans-serif", scrollbarWidth: "none" }}
            />

            {voiceSupported && (
              <button onClick={toggleVoice} disabled={isLoading}
                title={isListening ? "Stop listening" : "Speak your message"}
                className={[
                  "relative flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-40",
                  isListening ? "bg-rose-500/20 text-rose-400" : "bg-background text-muted-foreground hover:bg-accent",
                ].join(" ")}>
                {isListening && <PulsingRing />}
                {isListening ? <MicOff className="w-4 h-4 relative" /> : <Mic className="w-4 h-4" />}
              </button>
            )}

            <button onClick={handleSend}
              disabled={isLoading || (!inputValue.trim() && !interimTranscript.trim())}
              title="Send message"
              className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all bg-teal-600 text-white hover:bg-teal-500 disabled:opacity-35 disabled:cursor-not-allowed active:scale-95">
              <Send className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[10px] text-muted-foreground text-center mt-2 leading-tight px-2">
            Serenity is a support tool, not a licensed therapist.{" "}
            <span className="font-medium text-foreground">In crisis? Call iCall: 9152987821</span>
          </p>
        </div>
      </div>
    </>
  );
}

export default ChatbotUI;
