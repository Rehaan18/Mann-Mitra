/**
 * ChatbotUI.tsx
 *
 * Main chatbot interface component for the student mental health platform.
 *
 * Design direction: "Soft Sanctuary" — warm sage greens, dusty rose accents,
 * rounded organic shapes, and gentle transitions. Feels calming and safe,
 * never clinical or corporate. Typography uses DM Sans (body) + Lora (display).
 *
 * Dependencies (shadcn/ui): Button, ScrollArea, Avatar, AvatarFallback, Badge
 * Icons: lucide-react
 * Fonts: Add to index.html or import via @fontsource in main.tsx
 *   <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Lora:ital,wght@0,500;1,400&display=swap" rel="stylesheet">
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
  /** Authenticated user ID from Supabase session. Optional (demo mode if absent). */
  userId?: string;
  /** Optional display name for the logged-in student. */
  userName?: string;
}

// ---------------------------------------------------------------------------
// Mood configuration (color + label for each mood tag)
// ---------------------------------------------------------------------------

const MOOD_CONFIG: Record<
  MoodTag,
  { label: string; dotClass: string; badgeClass: string }
> = {
  positive:    { label: "Feeling good",   dotClass: "bg-emerald-400",  badgeClass: "bg-emerald-100 text-emerald-800" },
  neutral:     { label: "Checking in",    dotClass: "bg-slate-400",    badgeClass: "bg-slate-100 text-slate-700" },
  mild_stress: { label: "A little stressed", dotClass: "bg-amber-400", badgeClass: "bg-amber-100 text-amber-800" },
  anxious:     { label: "Anxious",        dotClass: "bg-orange-400",   badgeClass: "bg-orange-100 text-orange-800" },
  sad:         { label: "Feeling sad",    dotClass: "bg-blue-400",     badgeClass: "bg-blue-100 text-blue-800" },
  depressed:   { label: "Low mood",       dotClass: "bg-indigo-400",   badgeClass: "bg-indigo-100 text-indigo-800" },
  overwhelmed: { label: "Overwhelmed",    dotClass: "bg-purple-400",   badgeClass: "bg-purple-100 text-purple-800" },
  crisis:      { label: "Crisis detected",dotClass: "bg-red-500",      badgeClass: "bg-red-100 text-red-800" },
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Animated pulsing ring shown on the mic button while listening. */
function PulsingRing() {
  return (
    <span className="absolute inset-0 rounded-full animate-ping bg-rose-400 opacity-40 pointer-events-none" />
  );
}

/** Formats a Date into a short HH:MM time string. */
function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** Renders markdown-lite: bold (**text**) and line breaks. */
function FormattedMessage({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <span>
      {lines.map((line, li) => {
        // Replace **bold** with <strong>
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <React.Fragment key={li}>
            {parts.map((part, pi) =>
              part.startsWith("**") && part.endsWith("**") ? (
                <strong key={pi} className="font-semibold">
                  {part.slice(2, -2)}
                </strong>
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

/** A single message bubble. */
function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  const isCrisis = message.isCrisis;

  return (
    <div
      className={`flex items-end gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"} group`}
      style={{ animation: "slideUp 0.25s ease-out both" }}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sage-400 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-sm"
          style={{ background: "linear-gradient(135deg, #7fb5a0 0%, #5f9ea0 100%)" }}>
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      )}

      <div className={`flex flex-col gap-1 max-w-[78%] ${isUser ? "items-end" : "items-start"}`}>
        {/* Bubble */}
        <div
          className={[
            "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm transition-shadow",
            isUser
              ? "bg-gradient-to-br from-teal-600 to-teal-700 text-white rounded-br-sm"
              : isCrisis
              ? "bg-red-50 border border-red-200 text-red-900 rounded-bl-sm"
              : "bg-white border border-stone-100 text-stone-700 rounded-bl-sm",
          ].join(" ")}
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {isCrisis && (
            <div className="flex items-center gap-1.5 mb-2 text-red-600 font-medium text-xs uppercase tracking-wide">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Crisis Support Resources</span>
            </div>
          )}
          <FormattedMessage content={message.content} />
        </div>

        {/* Timestamp + mood badge */}
        <div
          className={`flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ${
            isUser ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <span className="text-[10px] text-stone-400 tabular-nums">
            {formatTime(message.timestamp)}
          </span>
          {message.detectedMood && !isUser && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                MOOD_CONFIG[message.detectedMood].badgeClass
              }`}
            >
              {MOOD_CONFIG[message.detectedMood].label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/** Animated typing indicator shown while AI is generating a response. */
function TypingIndicator() {
  return (
    <div
      className="flex items-end gap-2.5"
      style={{ animation: "slideUp 0.2s ease-out both" }}
    >
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
        style={{ background: "linear-gradient(135deg, #7fb5a0 0%, #5f9ea0 100%)" }}>
        <Sparkles className="w-4 h-4 text-white" />
      </div>
      <div className="bg-white border border-stone-100 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-teal-400"
              style={{
                animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ChatbotUI({ userId, userName }: ChatbotUIProps) {
  const {
    messages,
    isLoading,
    error,
    isListening,
    voiceSupported,
    interimTranscript,
    submitMessage,
    toggleVoice,
    clearChat,
  } = useChatbot({ userId });

  const [inputValue, setInputValue] = useState("");
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const el = scrollAreaRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isLoading]);

  // Show scroll-to-bottom button when user scrolls up
  const handleScroll = () => {
    const el = scrollAreaRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distanceFromBottom > 120);
  };

  const scrollToBottom = () => {
    const el = scrollAreaRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  // Handle textarea auto-resize
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    // Reset and recalculate height
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const text = inputValue.trim() || interimTranscript.trim();
    if (!text || isLoading) return;
    setInputValue("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    submitMessage(text);
    inputRef.current?.focus();
  };

  // Latest mood from the last assistant message (for the header indicator)
  const latestMood = [...messages]
    .reverse()
    .find((m) => m.role === "assistant" && m.detectedMood)?.detectedMood;

  return (
    <>
      {/* Keyframe animations injected via a style tag */}
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
        .chat-scroll::-webkit-scrollbar-thumb { background: #d6d3d1; border-radius: 2px; }
      `}</style>

      <div
        className="flex flex-col h-[680px] w-full max-w-[440px] rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: "linear-gradient(160deg, #f8f6f2 0%, #f0ede8 100%)",
          fontFamily: "'DM Sans', sans-serif",
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        {/* ---------------------------------------------------------------- */}
        {/* Header                                                            */}
        {/* ---------------------------------------------------------------- */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #5f9ea0 0%, #4a8a7a 100%)",
          }}
        >
          <div className="flex items-center gap-3">
            {/* Logo mark */}
            <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <h1
                className="text-white font-semibold text-[15px] leading-tight"
                style={{ fontFamily: "'Lora', serif" }}
              >
                Serenity
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                {latestMood && (
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${MOOD_CONFIG[latestMood].dotClass}`}
                  />
                )}
                <span className="text-white/70 text-[11px]">
                  {latestMood
                    ? MOOD_CONFIG[latestMood].label
                    : "Mental Health Companion"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {userName && (
              <span className="text-white/60 text-xs hidden sm:block">
                Hi, {userName}
              </span>
            )}
            <button
              onClick={clearChat}
              title="Start new conversation"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
            >
              <RotateCcw className="w-3.5 h-3.5 text-white/80" />
            </button>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Message thread                                                    */}
        {/* ---------------------------------------------------------------- */}
        <div className="relative flex-1 overflow-hidden">
          <div
            ref={scrollAreaRef}
            onScroll={handleScroll}
            className="chat-scroll h-full overflow-y-auto px-4 py-5 flex flex-col gap-4"
          >
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {/* Loading indicator */}
            {isLoading && <TypingIndicator />}

            {/* Error toast */}
            {error && !isLoading && (
              <div
                className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2"
                style={{ animation: "fadeIn 0.2s ease-out" }}
              >
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Scroll-to-bottom button */}
          {showScrollBtn && (
            <button
              onClick={scrollToBottom}
              className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white shadow-md border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition-all"
              style={{ animation: "fadeIn 0.15s ease-out" }}
            >
              <ChevronDown className="w-4 h-4 text-stone-500" />
            </button>
          )}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Voice listening banner                                            */}
        {/* ---------------------------------------------------------------- */}
        {isListening && (
          <div
            className="mx-4 mb-1 px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2"
            style={{ animation: "slideUp 0.15s ease-out" }}
          >
            <div className="relative flex-shrink-0">
              <span className="absolute inset-0 rounded-full animate-ping bg-rose-300 opacity-50" />
              <span className="relative w-2 h-2 rounded-full bg-rose-500 block" />
            </div>
            <span className="text-xs text-rose-700 flex-1 truncate">
              {interimTranscript || "Listening… speak now"}
            </span>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Input bar                                                         */}
        {/* ---------------------------------------------------------------- */}
        <div
          className="flex-shrink-0 px-4 pb-4 pt-2"
        >
          <div
            className="flex items-end gap-2 bg-white rounded-2xl px-3 py-2 shadow-sm"
            style={{ border: "1px solid rgba(0,0,0,0.08)" }}
          >
            {/* Textarea */}
            <textarea
              ref={inputRef}
              value={interimTranscript || inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={
                isListening ? "Listening…" : "How are you feeling today?"
              }
              disabled={isLoading || isListening}
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm text-stone-700 placeholder-stone-400 outline-none leading-relaxed py-1 max-h-[120px] min-h-[28px] disabled:opacity-60"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                scrollbarWidth: "none",
              }}
            />

            {/* Voice button */}
            {voiceSupported && (
              <button
                onClick={toggleVoice}
                disabled={isLoading}
                title={isListening ? "Stop listening" : "Speak your message"}
                className={[
                  "relative flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-40",
                  isListening
                    ? "bg-rose-100 text-rose-600"
                    : "bg-stone-100 text-stone-500 hover:bg-stone-200",
                ].join(" ")}
              >
                {isListening && <PulsingRing />}
                {isListening ? (
                  <MicOff className="w-4 h-4 relative" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={isLoading || (!inputValue.trim() && !interimTranscript.trim())}
              title="Send message"
              className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-35 disabled:cursor-not-allowed active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Disclaimer */}
          <p className="text-[10px] text-stone-400 text-center mt-2 leading-tight px-2">
            Serenity is a support tool, not a licensed therapist.{" "}
            <span className="font-medium">In crisis? Call or text 988.</span>
          </p>
        </div>
      </div>
    </>
  );
}

export default ChatbotUI;
