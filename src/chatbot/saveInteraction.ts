/**
 * saveInteraction.ts
 *
 * Supabase integration for persisting chat interactions and mood data.
 *
 * Database schema (run this migration in your Supabase SQL editor):
 *
 * ```sql
 * -- Enable UUID extension if not already enabled
 * create extension if not exists "uuid-ossp";
 *
 * create table public.chat_interactions (
 *   id           uuid primary key default uuid_generate_v4(),
 *   user_id      uuid not null references auth.users(id) on delete cascade,
 *   session_id   uuid not null,                   -- groups messages into conversations
 *   role         text not null check (role in ('user', 'assistant')),
 *   content      text not null,
 *   detected_mood text check (detected_mood in (
 *                  'positive','neutral','mild_stress','anxious',
 *                  'sad','depressed','overwhelmed','crisis'
 *                )),
 *   is_crisis    boolean not null default false,
 *   created_at   timestamptz not null default now()
 * );
 *
 * -- Row-Level Security: users can only read/write their own rows
 * alter table public.chat_interactions enable row level security;
 *
 * create policy "Users manage own interactions"
 *   on public.chat_interactions
 *   for all
 *   using  (auth.uid() = user_id)
 *   with check (auth.uid() = user_id);
 *
 * -- Index for efficient mood-trend queries per user
 * create index idx_interactions_user_mood
 *   on public.chat_interactions (user_id, detected_mood, created_at desc);
 * ```
 */

// import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { MoodTag } from "./aiAdapter";

// ---------------------------------------------------------------------------
// Supabase client (singleton)
// ---------------------------------------------------------------------------

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// if (!supabaseUrl || !supabaseAnonKey) {
//   console.error(
//     "[saveInteraction] Missing Supabase env vars. " +
//       "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local"
//   );
// }

// export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
export { supabase } from "@/integrations/supabase/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface InteractionRecord {
  user_id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  detected_mood?: MoodTag;
  is_crisis: boolean;
}

export interface SaveInteractionResult {
  success: boolean;
  error?: string;
}

// ---------------------------------------------------------------------------
// Core save function
// ---------------------------------------------------------------------------

/**
 * Persists a single chat turn (user message or assistant reply) to Supabase.
 *
 * Called twice per round-trip:
 *   1. After the user submits a message (role: "user")
 *   2. After the AI responds (role: "assistant", includes mood tag)
 *
 * @param record  The interaction data to persist.
 */
export async function saveInteraction(
  record: InteractionRecord
): Promise<SaveInteractionResult> {
  try {
    const { error } = await supabase.from("chat_interactions").insert({
      user_id: record.user_id,
      session_id: record.session_id,
      role: record.role,
      content: record.content,
      detected_mood: record.detected_mood ?? null,
      is_crisis: record.is_crisis,
    });

    if (error) {
      console.error("[saveInteraction] Supabase insert error:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[saveInteraction] Unexpected error:", message);
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Convenience: save a full round-trip (user + assistant) atomically
// ---------------------------------------------------------------------------

export interface RoundTripPayload {
  userId: string;
  sessionId: string;
  userMessage: string;
  assistantReply: string;
  detectedMood: MoodTag;
}

/**
 * Saves both the user message and the AI reply in a single batch insert.
 * Prefer this over two separate saveInteraction calls for efficiency.
 */
export async function saveRoundTrip(
  payload: RoundTripPayload
): Promise<SaveInteractionResult> {
  const isCrisis = payload.detectedMood === "crisis";

  try {
    const { error } = await supabase.from("chat_interactions").insert([
      {
        user_id: payload.userId,
        session_id: payload.sessionId,
        role: "user",
        content: payload.userMessage,
        detected_mood: null, // mood is derived from the AI response, not the raw input
        is_crisis: isCrisis,
      },
      {
        user_id: payload.userId,
        session_id: payload.sessionId,
        role: "assistant",
        content: payload.assistantReply,
        detected_mood: payload.detectedMood,
        is_crisis: isCrisis,
      },
    ]);

    if (error) {
      console.error("[saveRoundTrip] Supabase batch insert error:", error.message);
      return { success: false, error: error.message };
    }

    // If this was a crisis interaction, trigger a Supabase Edge Function
    // (or database trigger) to alert the campus wellness team.
    if (isCrisis) {
      await notifyCrisisTeam(payload.userId, payload.sessionId);
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[saveRoundTrip] Unexpected error:", message);
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Crisis notification (calls a Supabase Edge Function)
// ---------------------------------------------------------------------------

/**
 * Invokes a Supabase Edge Function that notifies the campus wellness team
 * when a crisis interaction is detected. The Edge Function handles the
 * actual notification logic (email, Slack, PagerDuty, etc.) server-side
 * so no sensitive credentials are exposed to the browser.
 *
 * Deploy the Edge Function at: supabase/functions/notify-crisis/index.ts
 */
async function notifyCrisisTeam(userId: string, sessionId: string): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke("notify-crisis", {
      body: { userId, sessionId, timestamp: new Date().toISOString() },
    });

    if (error) {
      console.error("[notifyCrisisTeam] Edge Function error:", error.message);
    }
  } catch (err) {
    // Silently fail — the crisis response has already been shown to the user.
    // Logging failure here should NOT interrupt the student-facing flow.
    console.error("[notifyCrisisTeam] Unexpected error:", err);
  }
}

// ---------------------------------------------------------------------------
// Analytics: fetch mood trend for the current user
// ---------------------------------------------------------------------------

export interface MoodTrendEntry {
  detected_mood: MoodTag;
  created_at: string;
}

/**
 * Retrieves the last N mood-tagged assistant responses for the current user.
 * Useful for rendering a mood history chart in the wellness dashboard.
 *
 * @param userId  The authenticated user's UUID.
 * @param limit   How many records to fetch (default: 30).
 */
export async function getMoodTrend(
  userId: string,
  limit = 30
): Promise<MoodTrendEntry[]> {
  const { data, error } = await supabase
    .from("chat_interactions")
    .select("detected_mood, created_at")
    .eq("user_id", userId)
    .eq("role", "assistant")
    .not("detected_mood", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[getMoodTrend] Query error:", error.message);
    return [];
  }

  return (data as MoodTrendEntry[]) ?? [];
}
