// src/lib/nutritionEngine.ts
// Core analysis engine: nutrients → deficiency detection → mental health insights

import { INDIAN_FOOD_DB, DAILY_REQUIREMENTS, type NutrientKey, type FoodNutrients } from './indianFoodDatabase';

export interface NutrientTotals {
  protein: number;
  vitamin_b12: number;
  iron: number;
  magnesium: number;
  omega3: number;
  vitamin_d: number;
}

export interface NutrientStatus {
  key: NutrientKey;
  label: string;
  value: number;
  unit: string;
  required: number;
  percentage: number;       // 0–100+ (>100 = adequate)
  status: 'good' | 'low' | 'very_low' | 'deficient';
  statusLabel: string;
}

export interface MentalHealthInsight {
  nutrient: NutrientKey;
  severity: 'mild' | 'moderate' | 'severe';
  icon: string;
  headline: string;
  detail: string;
  moodImpact: string[];
  suggestedFoods: string[];
  color: string;
}

export interface NutritionScore {
  total: number;           // 0–100
  category: string;
  color: string;
  breakdown: Record<NutrientKey, number>;
}

export interface AnalysisResult {
  foods: FoodNutrients[];
  totals: NutrientTotals;
  statuses: NutrientStatus[];
  insights: MentalHealthInsight[];
  score: NutritionScore;
  summary: string;
  topDeficiencies: NutrientKey[];
  recognizedFoods: string[];
  unrecognizedFoods: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// MENTAL HEALTH CORRELATION DATABASE
// ─────────────────────────────────────────────────────────────────────────────

const MENTAL_HEALTH_CORRELATIONS: Record<NutrientKey, {
  mildThreshold: number;    // % of DRI below which = mild concern
  severeThreshold: number;  // % of DRI below which = severe concern
  icon: string;
  color: string;
  moodImpacts: { mild: string[]; severe: string[] };
  insights: { mild: string; moderate: string; severe: string };
  suggestedFoods: string[];
}> = {
  protein: {
    mildThreshold: 70, severeThreshold: 40,
    icon: '💪',
    color: '#f97316',
    moodImpacts: {
      mild: ['reduced motivation', 'low energy'],
      severe: ['serotonin imbalance', 'persistent low mood', 'poor concentration', 'irritability'],
    },
    insights: {
      mild: 'Your protein intake is slightly below recommended levels.',
      moderate: 'Your protein intake looks low today. Amino acids from protein are essential building blocks for serotonin and dopamine — your mood hormones.',
      severe: 'Very low protein detected. Protein deficiency directly impairs production of serotonin, dopamine, and norepinephrine, which regulate mood, focus, and emotional resilience.',
    },
    suggestedFoods: ['Dal', 'Rajma', 'Chole', 'Paneer', 'Eggs', 'Chicken', 'Moong dal', 'Peanuts'],
  },
  vitamin_b12: {
    mildThreshold: 60, severeThreshold: 30,
    icon: '🔋',
    color: '#ef4444',
    moodImpacts: {
      mild: ['mild fatigue', 'occasional brain fog'],
      severe: ['severe fatigue', 'depression risk', 'memory issues', 'irritability', 'nerve-related anxiety'],
    },
    insights: {
      mild: 'Your Vitamin B12 intake is somewhat low today.',
      moderate: 'Your Vitamin B12 intake appears low. B12 is critical for myelin sheath health and neurotransmitter synthesis — deficiency is a common hidden driver of fatigue and low mood.',
      severe: 'Very low Vitamin B12 detected. This nutrient is almost exclusive to animal products in Indian diets. Chronic deficiency is strongly linked to depression, fatigue, and neurological symptoms.',
    },
    suggestedFoods: ['Milk', 'Curd', 'Paneer', 'Eggs', 'Fish', 'Chicken', 'Mutton'],
  },
  iron: {
    mildThreshold: 60, severeThreshold: 35,
    icon: '🩸',
    color: '#dc2626',
    moodImpacts: {
      mild: ['reduced energy', 'mild tiredness'],
      severe: ['chronic fatigue', 'brain fog', 'poor concentration', 'depressive symptoms'],
    },
    insights: {
      mild: 'Your iron intake is slightly below recommended levels.',
      moderate: 'Your iron intake looks low. Iron carries oxygen to the brain — even mild deficiency impairs cognitive function and can cause persistent fatigue.',
      severe: 'Very low iron detected. Iron deficiency is one of the most common nutritional causes of fatigue and cognitive impairment in India, particularly affecting mood and focus.',
    },
    suggestedFoods: ['Spinach (Palak)', 'Rajma', 'Chole', 'Bajra roti', 'Eggs', 'Mutton', 'Jaggery (Gur)'],
  },
  magnesium: {
    mildThreshold: 55, severeThreshold: 30,
    icon: '🧘',
    color: '#8b5cf6',
    moodImpacts: {
      mild: ['mild tension', 'restlessness'],
      severe: ['anxiety', 'muscle tension', 'poor sleep quality', 'heightened stress response'],
    },
    insights: {
      mild: 'Your magnesium intake could be a bit higher.',
      moderate: 'Your magnesium intake looks low. Magnesium regulates the HPA axis (your stress response system) and GABA receptors — low levels are directly linked to increased anxiety.',
      severe: 'Very low magnesium detected. This "anti-stress mineral" is chronically under-consumed in modern Indian diets. Deficiency significantly increases anxiety, muscle tension, and sleep disruption.',
    },
    suggestedFoods: ['Almonds', 'Bajra roti', 'Brown rice', 'Jowar roti', 'Spinach', 'Banana', 'Walnuts'],
  },
  omega3: {
    mildThreshold: 50, severeThreshold: 20,
    icon: '🐟',
    color: '#0ea5e9',
    moodImpacts: {
      mild: ['minor mood variability'],
      severe: ['emotional instability', 'increased depression risk', 'poor stress resilience', 'inflammation-linked low mood'],
    },
    insights: {
      mild: 'Your omega-3 intake is somewhat below recommended levels.',
      moderate: 'Your omega-3 intake looks low. EPA and DHA (omega-3 fatty acids) are essential for cell membrane fluidity in brain neurons — low levels are associated with mood instability and depression.',
      severe: 'Very low omega-3 detected. India\'s traditional plant-based diet is often omega-3 deficient. Chronic deficiency is one of the strongest dietary predictors of depression and anxiety.',
    },
    suggestedFoods: ['Fish (Rohu/Catla/Salmon)', 'Walnuts', 'Flaxseeds (Alsi)', 'Chia seeds', 'Mustard oil'],
  },
  vitamin_d: {
    mildThreshold: 40, severeThreshold: 15,
    icon: '☀️',
    color: '#eab308',
    moodImpacts: {
      mild: ['seasonal mood dips', 'slight fatigue'],
      severe: ['depression risk', 'seasonal affective disorder', 'chronic fatigue', 'low motivation'],
    },
    insights: {
      mild: 'Your dietary Vitamin D intake is below recommended levels.',
      moderate: 'Your Vitamin D intake looks low. Beyond bone health, Vitamin D receptors are found throughout the brain — deficiency is strongly associated with depression and fatigue.',
      severe: 'Very low Vitamin D detected. India has a paradoxically high rate of Vitamin D deficiency despite abundant sunlight. Dietary sources are limited; consider sun exposure and foods like eggs and fish.',
    },
    suggestedFoods: ['Eggs', 'Fish', 'Milk (fortified)', 'Mushrooms (sun-dried)'],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// FOOD RESOLUTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolves a user-typed food string to a database key
 * Handles common variations, Hindi names, and partial matches
 */
export function resolveFoodKey(input: string): string | null {
  const normalized = input.toLowerCase().trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');

  // Direct match
  if (INDIAN_FOOD_DB[normalized]) return normalized;

  // Common aliases and alternate spellings
  const ALIASES: Record<string, string> = {
    chapati: 'roti', chapatti: 'roti', chappati: 'roti',
    daal: 'dal', toor_dal: 'dal', arhar_dal: 'dal', moong: 'moong_dal',
    chana: 'chole', chickpeas: 'chole', kidney_beans: 'rajma',
    rice_white: 'rice', boiled_rice: 'rice', plain_rice: 'rice',
    egg: 'eggs', anda: 'eggs', ande: 'eggs',
    dahi: 'curd', yogurt: 'curd', yoghurt: 'curd',
    dudh: 'milk', doodh: 'milk',
    sabzi: 'spinach', palak: 'spinach', saag: 'spinach',
    badam: 'almonds', akhrot: 'walnuts', mungfali: 'peanuts',
    alsi: 'flaxseeds', flax: 'flaxseeds',
    poha_flattened_rice: 'poha', beaten_rice: 'poha',
    sambar_south_indian: 'sambar',
    fish_curry: 'fish', rohu: 'fish', catla: 'fish', surmai: 'fish',
    mutton_curry: 'mutton', lamb: 'mutton', gosht: 'mutton',
    chicken_curry: 'chicken', murgi: 'chicken',
  };

  if (ALIASES[normalized]) return ALIASES[normalized];

  // Partial / contains match
  for (const key of Object.keys(INDIAN_FOOD_DB)) {
    if (key.includes(normalized) || normalized.includes(key)) return key;
  }

  // Match against food names
  for (const [key, food] of Object.entries(INDIAN_FOOD_DB)) {
    if (food.name.toLowerCase().includes(input.toLowerCase())) return key;
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// ANALYSIS FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

function sumNutrients(foods: FoodNutrients[]): NutrientTotals {
  return foods.reduce((totals, food) => ({
    protein: totals.protein + food.protein,
    vitamin_b12: totals.vitamin_b12 + food.vitamin_b12,
    iron: totals.iron + food.iron,
    magnesium: totals.magnesium + food.magnesium,
    omega3: totals.omega3 + food.omega3,
    vitamin_d: totals.vitamin_d + food.vitamin_d,
  }), { protein: 0, vitamin_b12: 0, iron: 0, magnesium: 0, omega3: 0, vitamin_d: 0 });
}

function buildStatuses(totals: NutrientTotals): NutrientStatus[] {
  return (Object.keys(DAILY_REQUIREMENTS) as NutrientKey[]).map(key => {
    const req = DAILY_REQUIREMENTS[key];
    const value = parseFloat(totals[key].toFixed(2));
    const pct = Math.min(Math.round((value / req.value) * 100), 150);

    let status: NutrientStatus['status'] = 'good';
    let statusLabel = 'Adequate';
    if (pct < 30) { status = 'deficient'; statusLabel = 'Deficient'; }
    else if (pct < 50) { status = 'very_low'; statusLabel = 'Very Low'; }
    else if (pct < 70) { status = 'low'; statusLabel = 'Low'; }

    return { key, label: req.label, value, unit: req.unit, required: req.value, percentage: pct, status, statusLabel };
  });
}

function buildInsights(statuses: NutrientStatus[]): MentalHealthInsight[] {
  const insights: MentalHealthInsight[] = [];

  for (const status of statuses) {
    if (status.status === 'good') continue;

    const corr = MENTAL_HEALTH_CORRELATIONS[status.key];
    const severity: MentalHealthInsight['severity'] =
      status.status === 'deficient' ? 'severe' :
      status.status === 'very_low' ? 'moderate' : 'mild';

    const insightText = corr.insights[severity];
    const moodImpact = severity === 'mild'
      ? corr.moodImpacts.mild
      : corr.moodImpacts.severe;

    insights.push({
      nutrient: status.key,
      severity,
      icon: corr.icon,
      headline: `${status.label} is ${status.statusLabel} (${status.percentage}% of daily need)`,
      detail: insightText,
      moodImpact,
      suggestedFoods: corr.suggestedFoods,
      color: corr.color,
    });
  }

  // Sort by severity: severe > moderate > mild
  const order = { severe: 0, moderate: 1, mild: 2 };
  return insights.sort((a, b) => order[a.severity] - order[b.severity]);
}

function calculateScore(statuses: NutrientStatus[]): NutritionScore {
  const breakdown: Record<NutrientKey, number> = {} as any;
  let total = 0;

  for (const s of statuses) {
    // Each nutrient contributes equally, capped at 100%
    const pts = Math.min(s.percentage, 100);
    breakdown[s.key] = pts;
    total += pts;
  }

  const avg = Math.round(total / statuses.length);

  return {
    total: avg,
    breakdown,
    category: avg >= 80 ? 'Excellent' : avg >= 60 ? 'Good' : avg >= 40 ? 'Needs Improvement' : 'Low',
    color: avg >= 80 ? '#22c55e' : avg >= 60 ? '#84cc16' : avg >= 40 ? '#f59e0b' : '#ef4444',
  };
}

function buildSummary(score: NutritionScore, insights: MentalHealthInsight[], foodCount: number): string {
  if (foodCount === 0) return 'Add some foods to get your nutrition analysis.';
  if (insights.length === 0) return `Your nutrition looks well-balanced today! Score: ${score.total}/100. Keep it up. 🌟`;

  const severeCount = insights.filter(i => i.severity === 'severe').length;
  const topInsight = insights[0];

  if (severeCount >= 2) {
    return `Your diet today shows significant gaps in ${severeCount} key nutrients. Focus on adding protein and B12 sources to your next meal.`;
  }
  if (topInsight) {
    return `Your ${topInsight.nutrient.replace('_', ' ')} intake looks low today — this may affect your energy and mood. Check the suggestions below.`;
  }
  return `Your nutrition score is ${score.total}/100. A few small tweaks could significantly support your mental wellbeing.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export function analyzeNutrition(foodInputs: string[]): AnalysisResult {
  const recognizedFoods: string[] = [];
  const unrecognizedFoods: string[] = [];
  const resolvedFoods: FoodNutrients[] = [];

  for (const input of foodInputs) {
    if (!input.trim()) continue;
    const key = resolveFoodKey(input);
    if (key && INDIAN_FOOD_DB[key]) {
      recognizedFoods.push(input);
      resolvedFoods.push(INDIAN_FOOD_DB[key]);
    } else {
      unrecognizedFoods.push(input);
    }
  }

  const totals = sumNutrients(resolvedFoods);
  const statuses = buildStatuses(totals);
  const insights = buildInsights(statuses);
  const score = calculateScore(statuses);
  const summary = buildSummary(score, insights, resolvedFoods.length);
  const topDeficiencies = statuses
    .filter(s => s.status !== 'good')
    .sort((a, b) => a.percentage - b.percentage)
    .map(s => s.key);

  return {
    foods: resolvedFoods,
    totals,
    statuses,
    insights,
    score,
    summary,
    topDeficiencies,
    recognizedFoods,
    unrecognizedFoods,
  };
}

// Weekly nutrition summary (accepts array of daily analysis results)
export function weeklyNutritionSummary(dailyResults: AnalysisResult[]) {
  if (dailyResults.length === 0) return null;

  const avgScore = Math.round(dailyResults.reduce((s, r) => s + r.score.total, 0) / dailyResults.length);

  // Count how many days each nutrient was deficient
  const deficiencyDays: Record<string, number> = {};
  for (const result of dailyResults) {
    for (const status of result.statuses) {
      if (status.status !== 'good') {
        deficiencyDays[status.key] = (deficiencyDays[status.key] || 0) + 1;
      }
    }
  }

  // Most consistently deficient nutrients
  const chronicDeficiencies = Object.entries(deficiencyDays)
    .filter(([, days]) => days >= Math.ceil(dailyResults.length / 2))
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => key as NutrientKey);

  return { avgScore, deficiencyDays, chronicDeficiencies, daysAnalyzed: dailyResults.length };
}
