// src/lib/diagnosticDataService.ts
// Central service that fetches ALL user data from Supabase
// Used by WellnessTools to build the diagnostic report

import { supabase } from "@/integrations/supabase/client";
import type { DataSources } from "./dsmDiagnosticEngine";

export async function fetchAllDiagnosticData(userId: string): Promise<DataSources> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const fromDate = sevenDaysAgo.toISOString();

  // Run all queries in parallel
  const [
    assessmentsRes,
    chatMessagesRes,
    moodLogsRes,
    nutritionRes,
    gardenActivitiesRes,
    feelingCheckinsRes,
  ] = await Promise.allSettled([
    // 1. Latest stress assessment
    (supabase as any)
      .from("stress_assessments")
      .select("score, severity, answers, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1),

    // 2. Chat messages (last 7 days)
    (supabase as any)
      .from("chat_messages")
      .select("role, content, created_at")
      .eq("user_id", userId)
      .gte("created_at", fromDate)
      .order("created_at", { ascending: true }),

    // 3. Mood logs (last 14 days)
    (supabase as any)
      .from("mood_logs")
      .select("mood, created_at")
      .eq("user_id", userId)
      .gte("created_at", new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false }),

    // 4. Latest nutrition log
    (supabase as any)
      .from("nutrition_logs")
      .select("score, severity, totals, foods, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(3),

    // 5. Garden activities (completed)
    (supabase as any)
      .from("garden_activities")
      .select("activity_name, category, created_at")
      .eq("user_id", userId)
      .gte("created_at", fromDate),

    // 6. Feeling check-ins from chat_messages with role='user'
    (supabase as any)
      .from("chat_messages")
      .select("content, created_at")
      .eq("user_id", userId)
      .eq("role", "user")
      .gte("created_at", fromDate),
  ]);

  // ── Extract assessment data ──
  const latestAssessment = assessmentsRes.status === 'fulfilled'
    ? assessmentsRes.value.data?.[0]
    : null;

  // ── Extract chat text ──
  const chatData = chatMessagesRes.status === 'fulfilled'
    ? chatMessagesRes.value.data || []
    : [];
  const userMessages = chatData.filter((m: any) => m.role === 'user');
  const chatText = userMessages.map((m: any) => m.content).join(' ');

  // Feeling check-ins
  const feelingData = feelingCheckinsRes.status === 'fulfilled'
    ? feelingCheckinsRes.value.data || []
    : [];
  const voiceText = feelingData.map((m: any) => m.content).join(' ');

  // ── Extract mood logs ──
  const moodData = moodLogsRes.status === 'fulfilled'
    ? moodLogsRes.value.data || []
    : [];
  const moodLogs = moodData.map((m: any) => ({
    mood: m.mood,
    date: m.created_at,
  }));

  // ── Extract nutrition data ──
  const nutritionData = nutritionRes.status === 'fulfilled'
    ? nutritionRes.value.data || []
    : [];
  const latestNutrition = nutritionData[0] as any;
  const avgNutritionScore = nutritionData.length > 0
    ? Math.round(nutritionData.reduce((sum: number, n: any) => sum + (n.score || 0), 0) / nutritionData.length)
    : 0;

  // Extract deficiencies from nutrition totals
  let nutritionDeficiencies: string[] = [];
  if (latestNutrition?.totals) {
    const totals = latestNutrition.totals as Record<string, number>;
    const dailyRequirements: Record<string, number> = {
      protein: 60, vitamin_b12: 2.2, iron: 17,
      magnesium: 340, omega3: 1.6, vitamin_d: 600,
    };
    nutritionDeficiencies = Object.entries(totals)
      .filter(([key, val]) => {
        const req = dailyRequirements[key];
        return req && val < req * 0.5; // below 50% of daily requirement
      })
      .map(([key]) => key);
  }

  // ── Extract garden activities ──
  const activitiesData = gardenActivitiesRes.status === 'fulfilled'
    ? gardenActivitiesRes.value.data || []
    : [];
  const completedActivities = activitiesData.map((a: any) => a.activity_name);

  return {
    assessmentScore: latestAssessment?.score || 0,
    assessmentSeverity: latestAssessment?.severity || 'None',
    assessmentAnswers: latestAssessment?.answers || {},
    chatText,
    voiceText,
    moodLogs,
    completedActivities,
    nutritionScore: avgNutritionScore,
    nutritionSeverity: latestNutrition?.severity || 'Unknown',
    nutritionDeficiencies,
  };
}

// Check data completeness for the readiness indicator
export function checkDataReadiness(data: DataSources) {
  return {
    assessment: data.assessmentScore > 0,
    chat: data.chatText.length > 20 || data.voiceText.length > 20,
    mood: data.moodLogs.length > 0,
    nutrition: data.nutritionScore > 0,
    get count() { return [this.assessment, this.chat, this.mood, this.nutrition].filter(Boolean).length; },
    get percentage() { return this.count * 25; },
  };
}
