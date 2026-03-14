// src/lib/dsmDiagnosticEngine.ts
// DSM-5 based diagnostic engine for Mann Mitra
// Analyses data from: AI chat, mood garden, stress assessment, nutrition
// Generates clinical-style (but non-diagnostic) wellness report

export interface DSMCriteria {
  domain: string;
  code: string;
  name: string;
  threshold: number;       // score threshold for flagging
  indicators: string[];
  severity: 'minimal' | 'mild' | 'moderate' | 'severe';
}

export interface DataSources {
  // From stress assessment (GAD-7 style)
  assessmentScore: number;         // 0-21
  assessmentSeverity: string;      // Minimal/Mild/Moderate/Severe
  assessmentAnswers: Record<number, string>;
  
  // From AI Support chat — freetext what they typed
  chatText: string;
  voiceText: string;               // from speech-to-text
  
  // From Mood Garden
  moodLogs: { mood: string; date: string }[];
  completedActivities: string[];
  
  // From Nutrition
  nutritionScore: number;          // 0-100
  nutritionSeverity: string;
  nutritionDeficiencies: string[];
}

export interface DiagnosticFlag {
  domain: string;
  code: string;
  name: string;
  flagged: boolean;
  score: number;           // 0-100
  severity: 'none' | 'minimal' | 'mild' | 'moderate' | 'severe';
  evidence: string[];      // what triggered this
  dsmCriteria: string;     // plain-English DSM criteria summary
  recommendations: string[];
}

export interface DiagnosticReport {
  generatedAt: string;
  overallWellnessScore: number;  // 0-100
  overallCategory: string;
  flags: DiagnosticFlag[];
  primaryConcern: string | null;
  summary: string;
  clinicalNarrative: string;
  immediateActions: string[];
  longTermRecommendations: string[];
  dataCompleteness: {
    assessment: boolean;
    chat: boolean;
    mood: boolean;
    nutrition: boolean;
    completenessScore: number; // 0-100
  };
  disclaimer: string;
}

// ─── KEYWORD ANALYZERS ──────────────────────────────────────────────────────

const DSM_KEYWORD_CLUSTERS = {
  depression: {
    primary: ['hopeless','helpless','worthless','empty','numb','pointless','no purpose','cant feel','cant enjoy','nothing matters','end it','give up'],
    secondary: ['sad','down','low','tired','exhausted','sleep','appetite','weight','concentrate','slow','guilty','failure','crying'],
  },
  anxiety: {
    primary: ['panic','racing heart','cant breathe','terrified','doom','dread','spiral','overwhelming','trembling','shaking'],
    secondary: ['worried','anxious','nervous','tense','restless','fear','scared','on edge','stress','overthinking'],
  },
  ptsd: {
    primary: ['flashback','nightmare','trauma','abuse','assault','accident','disaster','intrusive','reliving'],
    secondary: ['avoid','numb','detached','jumpy','startle','hypervigilant','distrust'],
  },
  socialAnxiety: {
    primary: ['humiliated','embarrassed','judged','scrutinized','avoid people','cant speak','freeze'],
    secondary: ['shy','awkward','self-conscious','blushing','stuttering','lonely','isolated'],
  },
  burnout: {
    primary: ['burnout','exhausted','drained','depleted','cynical','detached work','no motivation'],
    secondary: ['tired','overwhelmed','overloaded','stress','deadline','pressure','performance'],
  },
  sleepDisorder: {
    primary: ['insomnia','cant sleep','wake up','nightmares','sleep paralysis','oversleeping','daytime sleepy'],
    secondary: ['restless','sleep','tired','fatigue','bed','night','morning'],
  },
  substanceUse: {
    primary: ['alcohol','drinking','drunk','smoke','weed','drugs','pills','substance','addicted','cravings'],
    secondary: ['cope','numb','escape','relax','need to drink','need to smoke'],
  },
};

function analyzeText(text: string): Record<string, number> {
  const lower = (text || '').toLowerCase();
  const scores: Record<string, number> = {};

  for (const [domain, clusters] of Object.entries(DSM_KEYWORD_CLUSTERS)) {
    let score = 0;
    for (const word of clusters.primary) {
      if (lower.includes(word)) score += 3;
    }
    for (const word of clusters.secondary) {
      if (lower.includes(word)) score += 1;
    }
    scores[domain] = Math.min(score, 15); // cap per domain
  }
  return scores;
}

function analyzeMoodPattern(moodLogs: { mood: string; date: string }[]): {
  avgScore: number;
  negativeRatio: number;
  variability: number;
  streak: number;
} {
  if (!moodLogs || moodLogs.length === 0) return { avgScore: 3, negativeRatio: 0, variability: 0, streak: 0 };

  const moodValues: Record<string, number> = {
    'Happy': 5, 'Motivated': 5, 'Calm': 4,
    'Okay': 3, 'Stressed': 2, 'Anxious': 2, 'Sad': 1, 'Struggling': 1,
  };

  const values = moodLogs.map(l => moodValues[l.mood] || 3);
  const avgScore = values.reduce((a, b) => a + b, 0) / values.length;
  const negativeRatio = values.filter(v => v <= 2).length / values.length;

  // variability = std dev
  const mean = avgScore;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const variability = Math.sqrt(variance);

  return { avgScore, negativeRatio, variability, streak: moodLogs.length };
}

// ─── MAIN DIAGNOSTIC ENGINE ─────────────────────────────────────────────────

export function generateDSMReport(data: DataSources): DiagnosticReport {
  const now = new Date().toISOString();

  // Data completeness check
  const dataCompleteness = {
    assessment: data.assessmentScore > 0,
    chat: (data.chatText || '').length > 20 || (data.voiceText || '').length > 20,
    mood: (data.moodLogs || []).length > 0,
    nutrition: data.nutritionScore > 0,
    completenessScore: 0,
  };
  dataCompleteness.completenessScore = [
    dataCompleteness.assessment,
    dataCompleteness.chat,
    dataCompleteness.mood,
    dataCompleteness.nutrition,
  ].filter(Boolean).length * 25;

  // Text analysis
  const combinedText = `${data.chatText || ''} ${data.voiceText || ''}`;
  const textScores = analyzeText(combinedText);
  const moodPattern = analyzeMoodPattern(data.moodLogs || []);

  // Build diagnostic flags
  const flags: DiagnosticFlag[] = [];

  // ── 1. DEPRESSION / MDD (DSM-5 F32) ──
  const depressionScore = Math.min(100, (
    (textScores.depression || 0) * 5 +
    (moodPattern.negativeRatio * 40) +
    (data.assessmentScore >= 15 ? 20 : data.assessmentScore >= 10 ? 10 : 0) +
    (data.nutritionScore < 40 ? 10 : 0)
  ));

  flags.push({
    domain: 'Mood',
    code: 'F32',
    name: 'Major Depressive Episode Indicators',
    flagged: depressionScore >= 30,
    score: Math.round(depressionScore),
    severity: depressionScore >= 70 ? 'severe' : depressionScore >= 50 ? 'moderate' : depressionScore >= 30 ? 'mild' : 'none',
    evidence: [
      moodPattern.negativeRatio > 0.5 ? `${Math.round(moodPattern.negativeRatio * 100)}% of logged moods were negative` : null,
      textScores.depression >= 6 ? 'Depressive language patterns detected in conversation' : null,
      data.assessmentScore >= 10 ? `GAD-7 equivalent score: ${data.assessmentScore}/21` : null,
      data.nutritionScore < 40 ? 'Poor nutritional profile (linked to low mood)' : null,
    ].filter(Boolean) as string[],
    dsmCriteria: 'DSM-5 criteria for MDE requires 5+ symptoms (depressed mood, anhedonia, weight change, sleep disturbance, fatigue, worthlessness, concentration issues, psychomotor changes, suicidal ideation) for ≥2 weeks.',
    recommendations: [
      'Consider scheduling a professional counselling session',
      'Engage daily with Mood Garden activities (proven mood-lifting effect)',
      'Increase protein and B12 intake (serotonin precursors)',
      'Practice 10-minute daily meditation',
      depressionScore >= 60 ? '⚠️ Recommend consultation with a mental health professional' : '',
    ].filter(Boolean),
  });

  // ── 2. GENERALISED ANXIETY (DSM-5 F41.1) ──
  const anxietyScore = Math.min(100, (
    data.assessmentScore * 4 +
    (textScores.anxiety || 0) * 4 +
    (moodPattern.variability > 1.5 ? 15 : 0) +
    (data.nutritionDeficiencies?.includes('magnesium') ? 10 : 0) +
    (data.nutritionDeficiencies?.includes('omega3') ? 5 : 0)
  ));

  flags.push({
    domain: 'Anxiety',
    code: 'F41.1',
    name: 'Generalised Anxiety Indicators',
    flagged: anxietyScore >= 25,
    score: Math.round(anxietyScore),
    severity: anxietyScore >= 75 ? 'severe' : anxietyScore >= 50 ? 'moderate' : anxietyScore >= 25 ? 'mild' : 'none',
    evidence: [
      data.assessmentScore >= 5 ? `Stress assessment score: ${data.assessmentScore}/21 (${data.assessmentSeverity})` : null,
      textScores.anxiety >= 4 ? 'Anxiety-related language detected in conversation' : null,
      moodPattern.variability > 1.5 ? 'High mood variability suggests emotional dysregulation' : null,
      data.nutritionDeficiencies?.includes('magnesium') ? 'Magnesium deficiency (key regulator of stress response)' : null,
    ].filter(Boolean) as string[],
    dsmCriteria: 'DSM-5 GAD criteria: excessive worry about multiple topics, difficulty controlling worry, ≥3 of: restlessness, fatigue, concentration difficulty, irritability, muscle tension, sleep disturbance — for ≥6 months.',
    recommendations: [
      'Daily 4-7-8 breathing exercises (proven to reduce cortisol)',
      'Increase magnesium intake (almonds, dark leafy greens, bajra roti)',
      'Limit caffeine intake',
      'Try progressive muscle relaxation via Wellness Tools',
      anxietyScore >= 55 ? '⚠️ Consider professional consultation for anxiety management' : '',
    ].filter(Boolean),
  });

  // ── 3. BURNOUT / STRESS (DSM-5 F43.0 Acute Stress) ──
  const burnoutScore = Math.min(100, (
    (textScores.burnout || 0) * 5 +
    (data.completedActivities?.length === 0 ? 15 : 0) +
    (moodPattern.streak < 3 ? 10 : 0) +
    (data.assessmentScore >= 10 ? 15 : 0)
  ));

  flags.push({
    domain: 'Stress',
    code: 'F43.0',
    name: 'Burnout / Acute Stress Indicators',
    flagged: burnoutScore >= 25,
    score: Math.round(burnoutScore),
    severity: burnoutScore >= 70 ? 'severe' : burnoutScore >= 45 ? 'moderate' : burnoutScore >= 25 ? 'mild' : 'none',
    evidence: [
      textScores.burnout >= 5 ? 'Burnout-related language detected' : null,
      !data.completedActivities?.length ? 'No wellness activities completed this week' : null,
      data.assessmentScore >= 10 ? 'Moderate-high stress assessment score' : null,
    ].filter(Boolean) as string[],
    dsmCriteria: 'DSM-5 acute stress indicators: emotional numbing, detachment, reduced awareness, derealization/depersonalization, inability to recall stressor details.',
    recommendations: [
      'Complete at least 3 Mood Garden activities this week',
      'Break tasks into smaller steps to reduce overwhelm',
      'Set clear work/study boundaries',
      'Practice the 5-4-3-2-1 grounding technique',
    ],
  });

  // ── 4. SLEEP DISTURBANCE (DSM-5 F51.01) ──
  const sleepScore = Math.min(100, (textScores.sleepDisorder || 0) * 7);

  flags.push({
    domain: 'Sleep',
    code: 'F51.01',
    name: 'Sleep Disturbance Indicators',
    flagged: sleepScore >= 20,
    score: Math.round(sleepScore),
    severity: sleepScore >= 60 ? 'severe' : sleepScore >= 40 ? 'moderate' : sleepScore >= 20 ? 'mild' : 'none',
    evidence: [
      textScores.sleepDisorder >= 3 ? 'Sleep-related concerns mentioned in conversation' : null,
    ].filter(Boolean) as string[],
    dsmCriteria: 'DSM-5 insomnia disorder: dissatisfaction with sleep quality/quantity, difficulty initiating/maintaining sleep ≥3 nights/week for ≥3 months, causing daytime distress.',
    recommendations: [
      'Maintain consistent sleep/wake times (even weekends)',
      'Avoid screens 1 hour before bed',
      'Try the evening breathing exercise in Wellness Tools',
      'Increase magnesium intake (natural sleep aid)',
    ],
  });

  // ── 5. SOCIAL ISOLATION (DSM-5 context) ──
  const socialScore = Math.min(100, (
    (textScores.socialAnxiety || 0) * 5 +
    (moodPattern.negativeRatio > 0.4 ? 15 : 0)
  ));

  flags.push({
    domain: 'Social',
    code: 'F40.10',
    name: 'Social Anxiety / Isolation Indicators',
    flagged: socialScore >= 25,
    score: Math.round(socialScore),
    severity: socialScore >= 65 ? 'severe' : socialScore >= 40 ? 'moderate' : socialScore >= 25 ? 'mild' : 'none',
    evidence: [
      textScores.socialAnxiety >= 4 ? 'Social anxiety language detected in conversation' : null,
      moodPattern.negativeRatio > 0.4 ? 'High frequency of negative moods may indicate social withdrawal' : null,
    ].filter(Boolean) as string[],
    dsmCriteria: 'DSM-5 social anxiety: marked fear/anxiety in ≥1 social situation where person is exposed to scrutiny, fear of acting in ways that will be humiliating, causing avoidance or distress.',
    recommendations: [
      'Try the Peer Support feature to connect anonymously',
      'Join a Study Buddy group for low-pressure social interaction',
      'Practice gradual exposure to social situations',
    ],
  });

  // ── 6. NUTRITIONAL WELLNESS ──
  const nutritionFlag: DiagnosticFlag = {
    domain: 'Nutrition',
    code: 'Z72.4',
    name: 'Nutritional Deficiency Indicators',
    flagged: data.nutritionScore < 50,
    score: data.nutritionScore || 0,
    severity: data.nutritionScore < 25 ? 'severe' : data.nutritionScore < 45 ? 'moderate' : data.nutritionScore < 60 ? 'mild' : 'none',
    evidence: (data.nutritionDeficiencies || []).map(d => `Low ${d} (linked to ${d === 'vitamin_b12' ? 'depression and fatigue' : d === 'omega3' ? 'mood instability' : d === 'magnesium' ? 'anxiety and sleep issues' : d === 'iron' ? 'cognitive fatigue' : d === 'vitamin_d' ? 'seasonal depression' : 'mood regulation'})`),
    dsmCriteria: 'Nutritional factors are recognised comorbidities in DSM-5 mental health conditions. Deficiencies in B12, D, iron, magnesium and omega-3 have strong evidence links to depression, anxiety and cognitive impairment.',
    recommendations: [
      ...(data.nutritionDeficiencies || []).slice(0,3).map(d => `Address ${d} deficiency through diet or supplementation`),
      'Use the Nutrition Analyzer daily to track intake',
    ],
  };
  flags.push(nutritionFlag);

  // ── OVERALL SCORE ──────────────────────────────────────────────────────────
  const flaggedFlags = flags.filter(f => f.flagged);
  const maxFlagScore = flaggedFlags.length > 0
    ? Math.max(...flaggedFlags.map(f => f.score))
    : 0;

  const overallWellnessScore = Math.max(0, Math.min(100,
    100 - (maxFlagScore * 0.5) - (flaggedFlags.length * 5) +
    (dataCompleteness.completenessScore * 0.1) +
    (data.completedActivities?.length > 3 ? 5 : 0)
  ));

  const overallCategory =
    overallWellnessScore >= 80 ? 'Thriving' :
    overallWellnessScore >= 65 ? 'Good' :
    overallWellnessScore >= 45 ? 'Needs Attention' :
    overallWellnessScore >= 25 ? 'Struggling' : 'Seek Support';

  // ── PRIMARY CONCERN ────────────────────────────────────────────────────────
  const sortedFlags = [...flaggedFlags].sort((a, b) => b.score - a.score);
  const primaryConcern = sortedFlags[0]?.name || null;

  // ── NARRATIVE ─────────────────────────────────────────────────────────────
  const clinicalNarrative = buildNarrative(data, flags, moodPattern, dataCompleteness);
  const summary = buildSummary(overallWellnessScore, overallCategory, flaggedFlags, primaryConcern);

  const immediateActions: string[] = [
    dataCompleteness.completenessScore < 75 ? '📋 Complete remaining sections for a more accurate report' : null,
    flaggedFlags.some(f => f.severity === 'severe') ? '🚨 Please consider booking a counselling session — some indicators need professional attention' : null,
    !dataCompleteness.mood ? '🌸 Start logging your mood daily in Mood Garden' : null,
    !dataCompleteness.nutrition ? '🥗 Complete at least one day of Nutrition Analyzer' : null,
  ].filter(Boolean) as string[];

  const longTermRecommendations = [
    '📅 Book a monthly check-in session with a counsellor',
    '🌱 Complete all 5 Mood Garden activities daily',
    '🥗 Aim for a nutrition score above 70 using the Nutrition Analyzer',
    '🧘 Practice breathing exercises 3x per week',
    '💬 Engage with AI Support at least twice a week',
    '📊 Retake this assessment monthly to track progress',
  ];

  return {
    generatedAt: now,
    overallWellnessScore: Math.round(overallWellnessScore),
    overallCategory,
    flags,
    primaryConcern,
    summary,
    clinicalNarrative,
    immediateActions,
    longTermRecommendations,
    dataCompleteness,
    disclaimer: 'This report is a wellness screening tool based on self-reported data and is NOT a clinical diagnosis. The DSM-5 criteria references are educational. For any mental health concerns, please consult a qualified mental health professional. If you are in crisis, contact iCall: 9152987821.',
  };
}

function buildSummary(score: number, category: string, flagged: DiagnosticFlag[], primary: string | null): string {
  if (flagged.length === 0) return `Your wellness score of ${score}/100 (${category}) shows no significant concerns. Keep up the great work!`;
  if (flagged.length === 1) return `Your wellness score of ${score}/100 (${category}) shows one area needing attention: ${primary}. See the recommendations below.`;
  return `Your wellness score of ${score}/100 (${category}) identified ${flagged.length} areas needing attention. Your primary concern is ${primary}. Please review the detailed findings and recommendations.`;
}

function buildNarrative(
  data: DataSources,
  flags: DiagnosticFlag[],
  mood: ReturnType<typeof analyzeMoodPattern>,
  completeness: DiagnosticReport['dataCompleteness']
): string {
  const parts: string[] = [];

  parts.push(`This diagnostic summary was generated based on data collected across ${completeness.completenessScore / 25} of 4 data sources (${completeness.completenessScore}% completeness).`);

  if (completeness.assessment) {
    parts.push(`The stress assessment returned a score of ${data.assessmentScore}/21, classified as ${data.assessmentSeverity}.`);
  }

  if (completeness.chat) {
    const flaggedDomains = flags.filter(f => f.flagged).map(f => f.domain);
    if (flaggedDomains.length > 0) {
      parts.push(`Conversational analysis identified language patterns associated with: ${flaggedDomains.join(', ')}.`);
    } else {
      parts.push(`Conversational analysis did not identify significant distress markers.`);
    }
  }

  if (completeness.mood) {
    parts.push(`Mood tracking over ${data.moodLogs.length} log entries showed an average score of ${mood.avgScore.toFixed(1)}/5 with ${Math.round(mood.negativeRatio * 100)}% negative moods.`);
  }

  if (completeness.nutrition) {
    parts.push(`Nutritional analysis returned a score of ${data.nutritionScore}/100 (${data.nutritionSeverity}). ${data.nutritionDeficiencies?.length > 0 ? `Key deficiencies: ${data.nutritionDeficiencies.join(', ')}.` : 'No major deficiencies detected.'}`);
  }

  return parts.join(' ');
}
