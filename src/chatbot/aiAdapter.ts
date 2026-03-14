/**
 * aiAdapter.ts
 *
 * Provider-agnostic AI service layer. Supports OpenAI, Anthropic Claude, and
 * Google Gemini out of the box. Switch providers by changing the
 * VITE_AI_PROVIDER environment variable — zero component changes required.
 *
 * Environment variables required (set in .env.local):
 *   VITE_AI_PROVIDER=openai | anthropic | gemini
 *   VITE_AI_API_KEY=<your key>
 *   VITE_AI_MODEL=<optional model override>
 */

import { SYSTEM_PROMPT } from "./systemPrompt";

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

/** A single turn in the conversation history. */
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** The structured payload every provider adapter must return. */
export interface AIResponse {
  reply: string;
  detected_mood: MoodTag;
  /** Raw text returned by the API before JSON parsing (useful for debugging). */
  raw?: string;
}

export type MoodTag =
  | "positive"
  | "neutral"
  | "mild_stress"
  | "anxious"
  | "sad"
  | "depressed"
  | "overwhelmed"
  | "crisis";

// ---------------------------------------------------------------------------
// Provider adapter interface — implement this to add a new provider
// ---------------------------------------------------------------------------

interface AIProviderAdapter {
  /** Call the provider API and return a parsed AIResponse. */
  complete(history: ChatMessage[], userMessage: string): Promise<AIResponse>;
}

// ---------------------------------------------------------------------------
// Utility: safely parse the structured JSON response from the AI
// ---------------------------------------------------------------------------

/**
 * Attempts to extract and parse the JSON object from the model's reply.
 * Models sometimes wrap JSON in markdown code fences — this strips those.
 */
function parseAIJsonResponse(raw: string): AIResponse {
  // Strip optional ```json ... ``` fences
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned) as Partial<AIResponse>;

    if (typeof parsed.reply !== "string" || !parsed.detected_mood) {
      throw new Error("Missing required fields in AI response JSON.");
    }

    return {
      reply: parsed.reply,
      detected_mood: parsed.detected_mood,
      raw,
    };
  } catch {
    // Fallback: treat the entire response as a plain reply with neutral mood.
    // This prevents the UI from breaking even if the model misbehaves.
    console.warn("[aiAdapter] Failed to parse structured JSON; using fallback.", raw);
    return {
      reply: cleaned || "I'm here to listen. Could you tell me more about how you're feeling?",
      detected_mood: "neutral",
      raw,
    };
  }
}

// ---------------------------------------------------------------------------
// OpenAI adapter (GPT-4o, GPT-4-turbo, etc.)
// ---------------------------------------------------------------------------

class OpenAIAdapter implements AIProviderAdapter {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly endpoint = "https://api.openai.com/v1/chat/completions";

  constructor(apiKey: string, model = "gpt-4o") {
    this.apiKey = apiKey;
    this.model = model;
  }

  async complete(history: ChatMessage[], userMessage: string): Promise<AIResponse> {
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: userMessage },
    ];

    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.7,
        max_tokens: 800,
        response_format: { type: "json_object" }, // OpenAI JSON mode
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI API error ${response.status}: ${err}`);
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };

    const raw = data.choices[0]?.message?.content ?? "";
    return parseAIJsonResponse(raw);
  }
}

// ---------------------------------------------------------------------------
// Anthropic Claude adapter (claude-3-5-sonnet, etc.)
// ---------------------------------------------------------------------------

class AnthropicAdapter implements AIProviderAdapter {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly endpoint = "https://api.anthropic.com/v1/messages";

  constructor(apiKey: string, model = "claude-sonnet-4-5") {
    this.apiKey = apiKey;
    this.model = model;
  }

  async complete(history: ChatMessage[], userMessage: string): Promise<AIResponse> {
    const messages = [
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: userMessage },
    ];

    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        system: SYSTEM_PROMPT,
        messages,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Anthropic API error ${response.status}: ${err}`);
    }

    const data = (await response.json()) as {
      content: Array<{ type: string; text: string }>;
    };

    const raw = data.content.find((b) => b.type === "text")?.text ?? "";
    return parseAIJsonResponse(raw);
  }
}

// ---------------------------------------------------------------------------
// Google Gemini adapter (gemini-1.5-pro, etc.)
// ---------------------------------------------------------------------------

class GeminiAdapter implements AIProviderAdapter {
  private readonly apiKey: string;
  private readonly model: string;

  constructor(apiKey: string, model = "gemini-1.5-pro") {
    this.apiKey = apiKey;
    this.model = model;
  }

  private get endpoint(): string {
    return `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
  }

  async complete(history: ChatMessage[], userMessage: string): Promise<AIResponse> {
    // Gemini uses a "contents" array with alternating user/model roles.
    // System instruction is passed separately.
    const contents = [
      ...history.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      { role: "user", parts: [{ text: userMessage }] },
    ];

    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${err}`);
    }

    const data = (await response.json()) as {
      candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
    };

    const raw = data.candidates[0]?.content?.parts[0]?.text ?? "";
    return parseAIJsonResponse(raw);
  }
}

// ---------------------------------------------------------------------------
// Factory: resolves the correct adapter from env vars at runtime
// ---------------------------------------------------------------------------

type SupportedProvider = "openai" | "anthropic" | "gemini";

/**
 * Creates and returns the correct AI provider adapter based on the
 * VITE_AI_PROVIDER environment variable.
 *
 * @throws Error if the provider is unsupported or the API key is missing.
 */
function createAIAdapter(): AIProviderAdapter {
  const provider = (import.meta.env.VITE_AI_PROVIDER as SupportedProvider) ?? "openai";
  const apiKey = import.meta.env.VITE_AI_API_KEY as string;
  const model = import.meta.env.VITE_AI_MODEL as string | undefined;

  if (!apiKey) {
    throw new Error(
      "[aiAdapter] VITE_AI_API_KEY is not set. Add it to your .env.local file."
    );
  }

  switch (provider) {
    case "openai":
      return new OpenAIAdapter(apiKey, model);
    case "anthropic":
      return new AnthropicAdapter(apiKey, model);
    case "gemini":
      return new GeminiAdapter(apiKey, model);
    default:
      throw new Error(
        `[aiAdapter] Unsupported provider "${provider}". ` +
          `Valid options: openai | anthropic | gemini`
      );
  }
}

// Singleton adapter instance — created once on module load.
let _adapterInstance: AIProviderAdapter | null = null;

function getAdapter(): AIProviderAdapter {
  if (!_adapterInstance) {
    _adapterInstance = createAIAdapter();
  }
  return _adapterInstance;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Send a user message along with the full conversation history to the
 * configured AI provider and return the structured response.
 *
 * @param history  Previous turns in the conversation (for context window).
 * @param userMessage  The latest message from the student.
 */
export async function sendMessage(
  history: ChatMessage[],
  userMessage: string
): Promise<AIResponse> {
  return getAdapter().complete(history, userMessage);
}
