/**
 * useChatbot.ts
 *
 * Custom React hook that encapsulates all chatbot business logic:
 *   - Message state management
 *   - AI API calls via aiAdapter
 *   - Web Speech API voice input
 *   - Client-side crisis keyword screening
 *   - Supabase interaction logging
 *
 * Usage:
 *   const chat = useChatbot({ userId: session.user.id });
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

import { sendMessage, type ChatMessage, type AIResponse, type MoodTag } from "./aiAdapter";
import {
  CRISIS_KEYWORDS_REGEX,
  STATIC_CRISIS_RESPONSE,
} from "./systemPrompt";
import { saveRoundTrip } from "./saveInteraction";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A message as stored in UI state (extends ChatMessage with metadata). */
export interface UIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  detectedMood?: MoodTag;
  timestamp: Date;
  isCrisis?: boolean;
}

export interface UseChatbotOptions {
  /**
   * Authenticated Supabase user ID. If omitted, logging is skipped
   * (useful during unauthenticated preview/demo mode).
   */
  userId?: string;
}

export interface UseChatbotReturn {
  /** Full message thread for rendering. */
  messages: UIMessage[];
  /** True while the AI API call is in-flight. */
  isLoading: boolean;
  /** Error string if the last API call failed, otherwise null. */
  error: string | null;
  /** True while the Web Speech API is actively capturing audio. */
  isListening: boolean;
  /** Whether the browser supports the Web Speech API. */
  voiceSupported: boolean;
  /** The live interim transcript while the user is speaking. */
  interimTranscript: string;
  /** Submit a message from the text input. */
  submitMessage: (text: string) => Promise<void>;
  /** Toggle voice recording on/off. */
  toggleVoice: () => void;
  /** Clear the conversation and start fresh. */
  clearChat: () => void;
  /** The current session ID (UUID) for grouping messages in Supabase. */
  sessionId: string;
}

// ---------------------------------------------------------------------------
// Web Speech API type augmentation
// (TypeScript's lib.dom.d.ts has limited Speech API types)
// ---------------------------------------------------------------------------

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

// ---------------------------------------------------------------------------
// Hook implementation
// ---------------------------------------------------------------------------

const WELCOME_MESSAGE: UIMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi there 👋 I'm Serenity, your mental health support companion. This is a safe, judgment-free space.\n\nHow are you feeling today?",
  detectedMood: "neutral",
  timestamp: new Date(),
};

export function useChatbot({ userId }: UseChatbotOptions = {}): UseChatbotReturn {
  const [messages, setMessages] = useState<UIMessage[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");

  // Stable session ID for the lifetime of this hook instance
  const sessionId = useRef<string>(uuidv4());

  // Speech recognition instance (ref so we don't recreate it on re-renders)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // Check browser support once
  const SpeechRecognitionConstructor =
    window.SpeechRecognition ?? window.webkitSpeechRecognition;
  const voiceSupported = Boolean(SpeechRecognitionConstructor);

  // ---------------------------------------------------------------------------
  // Core: submit a message (text or from voice)
  // ---------------------------------------------------------------------------

  const submitMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      setError(null);

      // Add the user's message to the thread immediately
      const userMsg: UIMessage = {
        id: uuidv4(),
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        // --- Client-side crisis keyword pre-screen ---
        // This fires immediately, before the API call, to show crisis resources
        // with zero latency if the message clearly indicates acute distress.
        if (CRISIS_KEYWORDS_REGEX.test(trimmed)) {
          const crisisMsg: UIMessage = {
            id: uuidv4(),
            role: "assistant",
            content: STATIC_CRISIS_RESPONSE.reply,
            detectedMood: "crisis",
            isCrisis: true,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, crisisMsg]);

          // Log the crisis interaction asynchronously (don't await in the hot path)
          if (userId) {
            saveRoundTrip({
              userId,
              sessionId: sessionId.current,
              userMessage: trimmed,
              assistantReply: STATIC_CRISIS_RESPONSE.reply,
              detectedMood: "crisis",
            }).catch(console.error);
          }

          setIsLoading(false);
          return;
        }

        // --- Build conversation history for context window ---
        // Exclude the welcome message and send the last 20 turns max to
        // control token usage. The system prompt is injected by the adapter.
        const history: ChatMessage[] = messages
          .filter((m) => m.id !== "welcome")
          .slice(-20)
          .map((m) => ({ role: m.role, content: m.content }));

        // --- Call the AI ---
        const aiResponse: AIResponse = await sendMessage(history, trimmed);

        const isCrisis = aiResponse.detected_mood === "crisis";

        const assistantMsg: UIMessage = {
          id: uuidv4(),
          role: "assistant",
          content: aiResponse.reply,
          detectedMood: aiResponse.detected_mood,
          isCrisis,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMsg]);

        // --- Log to Supabase ---
        if (userId) {
          saveRoundTrip({
            userId,
            sessionId: sessionId.current,
            userMessage: trimmed,
            assistantReply: aiResponse.reply,
            detectedMood: aiResponse.detected_mood,
          }).catch(console.error);
        }
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.";
        setError(message);

        // Add a graceful fallback message so the UI doesn't just freeze
        const errorMsg: UIMessage = {
          id: uuidv4(),
          role: "assistant",
          content:
            "I'm having a little trouble connecting right now. Please try again in a moment. If you need immediate support, please call or text 988.",
          detectedMood: "neutral",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLoading, messages, userId]
  );

  // ---------------------------------------------------------------------------
  // Voice input: Web Speech API
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!voiceSupported || !SpeechRecognitionConstructor) return;

    const recognition = new SpeechRecognitionConstructor();
    recognition.continuous = false;    // single utterance per activation
    recognition.interimResults = true; // show live transcript as user speaks
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      setInterimTranscript(interim);

      if (final) {
        // Finalized speech — auto-submit
        setInterimTranscript("");
        setIsListening(false);
        submitMessage(final);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      setInterimTranscript("");
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
    // submitMessage is stable via useCallback; including it would cause
    // the effect to re-run unnecessarily. eslint-disable is intentional.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceSupported]);

  const toggleVoice = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setInterimTranscript("");
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        // Already started — ignore
      }
    }
  }, [isListening]);

  // ---------------------------------------------------------------------------
  // Clear chat
  // ---------------------------------------------------------------------------

  const clearChat = useCallback(() => {
    sessionId.current = uuidv4(); // new session for the fresh conversation
    setMessages([WELCOME_MESSAGE]);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    messages,
    isLoading,
    error,
    isListening,
    voiceSupported,
    interimTranscript,
    submitMessage,
    toggleVoice,
    clearChat,
    sessionId: sessionId.current,
  };
}
