// src/pages/NutritionAnalyzer.tsx
// Nutrition-Based Mental Health Analysis — full page component
// Drop into Zen Zone / MannMitra dashboard

import React, { useState, useRef, useEffect } from 'react';
import { useNutritionAnalyzer } from '../hooks/useNutritionAnalyzer';
import { DAILY_REQUIREMENTS, type NutrientKey } from '@/lib/indianFoodDatabase';
import type { NutrientStatus, MentalHealthInsight } from '@/lib/nutritionEngine';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const MEAL_TYPES = [
  { key: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { key: 'lunch', label: 'Lunch', emoji: '☀️' },
  { key: 'dinner', label: 'Dinner', emoji: '🌙' },
  { key: 'snack', label: 'Snack', emoji: '🍎' },
] as const;

const NUTRIENT_ICONS: Record<NutrientKey, string> = {
  protein: '💪', vitamin_b12: '🔋', iron: '🩸',
  magnesium: '🧘', omega3: '🐟', vitamin_d: '☀️',
};

const QUICK_FOODS = [
  'Poha', 'Idli', 'Dal', 'Rice', 'Roti', 'Paneer',
  'Eggs', 'Curd', 'Rajma', 'Spinach', 'Milk', 'Fish',
  'Almonds', 'Banana', 'Chicken', 'Chole',
];

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function NutrientBar({ status }: { status: NutrientStatus }) {
  const pct = Math.min(status.percentage, 100);
  const barColor =
    status.status === 'good' ? 'bg-emerald-400' :
    status.status === 'low' ? 'bg-amber-400' :
    status.status === 'very_low' ? 'bg-orange-400' : 'bg-red-500';

  const textColor =
    status.status === 'good' ? 'text-emerald-600' :
    status.status === 'low' ? 'text-amber-600' :
    status.status === 'very_low' ? 'text-orange-500' : 'text-red-500';

  const bgLight =
    status.status === 'good' ? 'bg-emerald-50 border-emerald-100' :
    status.status === 'low' ? 'bg-amber-50 border-amber-100' :
    status.status === 'very_low' ? 'bg-orange-50 border-orange-100' : 'bg-red-50 border-red-100';

  return (
    <div className={`rounded-2xl border p-4 ${bgLight} transition-all duration-300`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{NUTRIENT_ICONS[status.key]}</span>
          <span className="font-semibold text-gray-800 text-sm">{status.label}</span>
        </div>
        <div className="text-right">
          <span className={`font-bold text-sm ${textColor}`}>
            {status.value}{status.unit}
          </span>
          <span className="text-xs text-gray-400 ml-1">/ {status.required}{status.unit}</span>
        </div>
      </div>
      <div className="relative h-2.5 bg-white/70 rounded-full overflow-hidden">
        <div
          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <span className={`text-xs font-medium ${textColor}`}>{status.statusLabel}</span>
        <span className="text-xs text-gray-400">{status.percentage}%</span>
      </div>
    </div>
  );
}

function InsightCard({ insight, index }: { insight: MentalHealthInsight; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);

  const severityBg = {
    mild: 'bg-amber-50 border-amber-200',
    moderate: 'bg-orange-50 border-orange-200',
    severe: 'bg-red-50 border-red-200',
  }[insight.severity];

  const severityBadge = {
    mild: 'bg-amber-100 text-amber-700',
    moderate: 'bg-orange-100 text-orange-700',
    severe: 'bg-red-100 text-red-700',
  }[insight.severity];

  return (
    <div
      className={`rounded-2xl border-2 p-5 transition-all duration-300 cursor-pointer hover:shadow-md ${severityBg}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-2xl shrink-0">{insight.icon}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-bold text-gray-800 text-sm leading-tight">{insight.headline}</p>
              <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide ${severityBadge}`}>
                {insight.severity}
              </span>
            </div>
            <p className="text-gray-600 text-xs leading-relaxed">{insight.detail}</p>
          </div>
        </div>
        <span className="text-gray-400 text-sm shrink-0">{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-current/10 space-y-3">
          {/* Mood impacts */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Possible mood effects
            </p>
            <div className="flex flex-wrap gap-1.5">
              {insight.moodImpact.map(impact => (
                <span key={impact} className="text-xs px-2.5 py-1 bg-white/80 rounded-full text-gray-600 border border-current/10 font-medium">
                  {impact}
                </span>
              ))}
            </div>
          </div>

          {/* Suggested foods */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              🍽️ Boost with these Indian foods
            </p>
            <div className="flex flex-wrap gap-1.5">
              {insight.suggestedFoods.map(food => (
                <span key={food} className="text-xs px-2.5 py-1 bg-emerald-100 rounded-full text-emerald-700 font-semibold border border-emerald-200">
                  {food}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const radius = 42;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#84cc16' : score >= 40 ? '#f59e0b' : '#ef4444';

  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    let cur = 0;
    const step = score / 40;
    const timer = setInterval(() => {
      cur = Math.min(cur + step, score);
      setDisplayed(Math.round(cur));
      if (cur >= score) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [score]);

  return (
    <div className="relative w-28 h-28">
      <svg className="-rotate-90 w-full h-full" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="9" />
        <circle
          cx="50" cy="50" r={radius} fill="none"
          stroke={color} strokeWidth="9"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black" style={{ color, fontVariantNumeric: 'tabular-nums' }}>
          {displayed}
        </span>
        <span className="text-xs text-gray-400 font-medium">/100</span>
      </div>
    </div>
  );
}

function MoodCorrelationChart({ result }: { result: NonNullable<ReturnType<typeof useNutritionAnalyzer>['result']> }) {
  return (
    <div className="space-y-2">
      {result.statuses.map(status => {
        const pct = Math.min(status.percentage, 100);
        const color =
          status.status === 'good' ? '#22c55e' :
          status.status === 'low' ? '#f59e0b' :
          status.status === 'very_low' ? '#f97316' : '#ef4444';

        return (
          <div key={status.key} className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 w-32 shrink-0">
              <span className="text-base">{NUTRIENT_ICONS[status.key]}</span>
              <span className="text-xs font-medium text-gray-600 truncate">{status.label}</span>
            </div>
            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${pct}%`, background: color }}
              />
            </div>
            <span className="text-xs text-gray-400 w-10 text-right font-mono">{pct}%</span>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function NutritionAnalyzer() {
  const {
    foodInput, currentMealType, meals, result, isAnalyzing, suggestions,
    allFoodsCount, handleInputChange, setCurrentMealType, addFood, removeFood,
    clearAll, analyze, saveToDatabase, isSaving, setSuggestions,
  } = useNutritionAnalyzer();

  const inputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'nutrients' | 'insights' | 'chart' | 'tips'>('nutrients');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && foodInput.trim()) {
      addFood(foodInput);
    }
  };

  const handleQuickAdd = (food: string) => {
    addFood(food);
    inputRef.current?.focus();
  };

  return (
    <div
      className="min-h-screen p-4 md:p-6"
      style={{ background: 'linear-gradient(135deg, #fafff9 0%, #f0fdf4 50%, #fafffe 100%)' }}
    >
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ── PAGE HEADER ─────────────────────────────────────────── */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Nutrition Analysis
            </div>
            <h1
              className="text-3xl font-black text-gray-800 leading-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              How is your food<br />
              <span style={{ color: '#16a34a' }}>feeding your mind?</span>
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              Optimized for Indian diet · Tracks 6 mood-critical nutrients
            </p>
          </div>
          {result && (
            <div className="flex gap-2">
              <button
                onClick={clearAll}
                className="px-4 py-2 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
              >
                Clear All
              </button>
              <button
                onClick={saveToDatabase}
                disabled={isSaving}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-60 flex items-center gap-1.5"
              >
                {isSaving ? '...' : '💾'} Save Log
              </button>
            </div>
          )}
        </div>

        {/* ── MEAL TYPE SELECTOR ──────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {MEAL_TYPES.map(mt => (
            <button
              key={mt.key}
              onClick={() => setCurrentMealType(mt.key)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                currentMealType === mt.key
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-emerald-300'
              }`}
            >
              <span>{mt.emoji}</span>
              <span>{mt.label}</span>
              {meals.find(m => m.mealType === mt.key) && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  currentMealType === mt.key ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  {meals.find(m => m.mealType === mt.key)?.foods.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── FOOD INPUT ──────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
          <label className="block text-sm font-bold text-gray-700 mb-3">
            {MEAL_TYPES.find(m => m.key === currentMealType)?.emoji} What did you have for{' '}
            {MEAL_TYPES.find(m => m.key === currentMealType)?.label.toLowerCase()}?
          </label>

          <div className="relative">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={foodInput}
                onChange={e => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. poha, dal, roti, paneer curry..."
                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-400 focus:outline-none text-sm text-gray-800 placeholder-gray-300 transition-all bg-gray-50 focus:bg-white"
              />
              <button
                onClick={() => foodInput.trim() && addFood(foodInput)}
                disabled={!foodInput.trim()}
                className="px-5 py-3 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 active:scale-95 disabled:opacity-40 transition-all shadow-sm"
              >
                Add +
              </button>
            </div>

            {/* Autocomplete dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute z-20 top-full left-0 right-12 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                {suggestions.map(s => (
                  <button
                    key={s}
                    onClick={() => { addFood(s); setSuggestions([]); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors border-b border-gray-50 last:border-0"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-gray-400 mt-2">
            Tip: You can type multiple foods separated by commas, or use the quick-add buttons below.
          </p>

          {/* Quick add pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-xs text-gray-400 font-medium self-center">Quick add:</span>
            {QUICK_FOODS.map(food => (
              <button
                key={food}
                onClick={() => handleQuickAdd(food)}
                className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-emerald-100 hover:text-emerald-700 text-gray-600 rounded-full transition-all font-medium border border-transparent hover:border-emerald-200"
              >
                {food}
              </button>
            ))}
          </div>
        </div>

        {/* ── CURRENT MEAL LOGS ───────────────────────────────────── */}
        {meals.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-700 text-sm mb-4">
              Today's Foods ({allFoodsCount} items)
            </h3>
            <div className="space-y-3">
              {MEAL_TYPES.map(mt => {
                const meal = meals.find(m => m.mealType === mt.key);
                if (!meal) return null;
                return (
                  <div key={mt.key}>
                    <div className="flex items-center gap-2 mb-2">
                      <span>{mt.emoji}</span>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{mt.label}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {meal.foods.map((food, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full text-sm text-emerald-700 font-medium group"
                        >
                          <span>{food}</span>
                          <button
                            onClick={() => removeFood(mt.key, idx)}
                            className="text-emerald-400 hover:text-red-400 transition-colors text-xs leading-none opacity-0 group-hover:opacity-100"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Analyze button */}
            <button
              onClick={analyze}
              disabled={isAnalyzing || allFoodsCount === 0}
              className="mt-5 w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-base rounded-2xl hover:opacity-90 active:scale-[0.98] disabled:opacity-60 transition-all shadow-md shadow-emerald-200 flex items-center justify-center gap-3"
            >
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Analyzing your nutrition...
                </>
              ) : (
                <>🔬 Analyze My Nutrition & Mental Wellness</>
              )}
            </button>
          </div>
        )}

        {/* ── EMPTY STATE ─────────────────────────────────────────── */}
        {meals.length === 0 && !result && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🥘</div>
            <h3 className="font-bold text-gray-700 text-lg mb-2">Log what you ate today</h3>
            <p className="text-gray-400 text-sm max-w-sm mx-auto">
              Add your meals above and discover how your Indian diet supports — or affects — your mental health.
            </p>
          </div>
        )}

        {/* ── RESULTS SECTION ─────────────────────────────────────── */}
        {result && (
          <div className="space-y-5 animate-fade-in">

            {/* Summary card */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-xl shadow-emerald-200">
              <div className="flex items-center gap-6">
                <ScoreRing score={result.score.total} />
                <div className="flex-1">
                  <p className="text-emerald-200 text-xs font-semibold uppercase tracking-wide mb-1">
                    Nutrition Score
                  </p>
                  <p className="text-2xl font-black mb-1">{result.score.category}</p>
                  <p className="text-emerald-100 text-sm leading-relaxed">{result.summary}</p>
                  {result.unrecognizedFoods.length > 0 && (
                    <p className="text-emerald-300 text-xs mt-2">
                      ⚠️ Could not find: {result.unrecognizedFoods.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Nav tabs */}
            <div className="flex gap-1.5 bg-white rounded-2xl border border-gray-100 p-1.5 shadow-sm">
              {[
                { key: 'nutrients', label: 'Nutrients', icon: '📊' },
                { key: 'insights', label: 'Mental Health', icon: '🧠' },
                { key: 'chart', label: 'Chart', icon: '📈' },
                { key: 'tips', label: 'Food Tips', icon: '🌿' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === tab.key
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* ── TAB: NUTRIENTS ───────────────────────────────────── */}
            {activeTab === 'nutrients' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.statuses.map(status => (
                  <NutrientBar key={status.key} status={status} />
                ))}
              </div>
            )}

            {/* ── TAB: MENTAL HEALTH INSIGHTS ──────────────────────── */}
            {activeTab === 'insights' && (
              <div className="space-y-3">
                {result.insights.length > 0 ? (
                  result.insights.map((insight, i) => (
                    <InsightCard key={insight.nutrient} insight={insight} index={i} />
                  ))
                ) : (
                  <div className="text-center py-12 bg-emerald-50 rounded-3xl border border-emerald-100">
                    <div className="text-5xl mb-3">🌟</div>
                    <h3 className="font-bold text-emerald-700 text-lg mb-1">
                      Your nutrition looks great!
                    </h3>
                    <p className="text-emerald-500 text-sm">
                      No significant deficiencies detected today. Keep up the balanced diet!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: MOOD-NUTRITION CHART ─────────────────────────── */}
            {activeTab === 'chart' && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-800 mb-1">Nutrient Adequacy Chart</h3>
                <p className="text-gray-400 text-xs mb-5">How much of your daily mental-health nutrient needs you met today</p>
                <MoodCorrelationChart result={result} />
                <div className="mt-5 pt-4 border-t border-gray-50 grid grid-cols-4 gap-3">
                  {[
                    { label: 'Adequate', color: 'bg-emerald-400', pct: '≥70%' },
                    { label: 'Low', color: 'bg-amber-400', pct: '50–69%' },
                    { label: 'Very Low', color: 'bg-orange-400', pct: '30–49%' },
                    { label: 'Deficient', color: 'bg-red-500', pct: '<30%' },
                  ].map(l => (
                    <div key={l.label} className="flex items-center gap-1.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${l.color} shrink-0`} />
                      <div>
                        <p className="text-xs font-medium text-gray-600">{l.label}</p>
                        <p className="text-xs text-gray-400">{l.pct}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── TAB: INDIAN FOOD TIPS ─────────────────────────────── */}
            {activeTab === 'tips' && (
              <div className="space-y-4">
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                  <h3 className="font-bold text-gray-800 mb-4">🌿 Best Indian Foods for Mental Wellness</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { food: 'Bajra / Jowar Roti', why: 'Rich in Magnesium — reduces anxiety and stress', icon: '🫓', tags: ['Mg', 'Iron'] },
                      { food: 'Rajma & Chole', why: 'Iron + protein for energy and mood stability', icon: '🫘', tags: ['Iron', 'Protein'] },
                      { food: 'Palak Paneer', why: 'Iron + Protein + B12 — a mood powerhouse', icon: '🥬', tags: ['Iron', 'Mg', 'B12'] },
                      { food: 'Eggs', why: 'B12, Vitamin D, Omega-3 in one package', icon: '🥚', tags: ['B12', 'Vit D', 'Ω3'] },
                      { food: 'Walnuts (Akhrot)', why: 'Highest plant source of Omega-3 for brain health', icon: '🌰', tags: ['Ω3', 'Mg'] },
                      { food: 'Fish (Rohu/Catla)', why: 'Vitamin D + Omega-3 — fights depression naturally', icon: '🐟', tags: ['Ω3', 'B12', 'Vit D'] },
                      { food: 'Almonds (Badam)', why: 'Magnesium-rich — calms the nervous system', icon: '🌰', tags: ['Mg', 'Protein'] },
                      { food: 'Curd / Dahi', why: 'B12 + probiotics — gut-brain connection support', icon: '🥛', tags: ['B12', 'Probiotics'] },
                      { food: 'Flaxseeds (Alsi)', why: 'Best plant Omega-3 — add to roti dough or curd', icon: '🌱', tags: ['Ω3', 'Mg'] },
                      { food: 'Dal (any variety)', why: 'Protein + iron for sustained mood and energy', icon: '🍲', tags: ['Protein', 'Iron'] },
                    ].map(item => (
                      <div key={item.food} className="flex items-start gap-3 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
                        <span className="text-2xl shrink-0">{item.icon}</span>
                        <div className="flex-1">
                          <p className="font-bold text-gray-800 text-sm">{item.food}</p>
                          <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{item.why}</p>
                          <div className="flex gap-1 mt-2">
                            {item.tags.map(t => (
                              <span key={t} className="text-xs px-2 py-0.5 bg-emerald-200 text-emerald-700 rounded-full font-semibold">{t}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Daily plate recommendation */}
                <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6">
                  <h3 className="font-bold text-amber-800 mb-3">💡 The Mental Wellness Thali</h3>
                  <p className="text-amber-600 text-sm mb-4">
                    A balanced Indian meal that covers all 6 mood-critical nutrients:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { item: '2 Bajra rotis', purpose: 'Magnesium + Iron' },
                      { item: '1 katori Dal', purpose: 'Protein + Iron' },
                      { item: 'Palak sabzi', purpose: 'Iron + Magnesium' },
                      { item: '1 katori Curd', purpose: 'B12 + Protein' },
                      { item: 'Handful of walnuts', purpose: 'Omega-3' },
                      { item: 'Egg or fish', purpose: 'B12 + Vitamin D' },
                    ].map(x => (
                      <div key={x.item} className="bg-white/70 rounded-xl p-3">
                        <p className="text-amber-800 font-semibold text-xs">{x.item}</p>
                        <p className="text-amber-500 text-xs mt-0.5">{x.purpose}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-gray-400 text-xs leading-relaxed">
                    <strong className="text-gray-500">Disclaimer:</strong> This analysis is based on approximate nutritional values and general dietary guidelines (ICMR 2020). It is not a medical diagnosis. If you suspect nutritional deficiencies, consult a registered dietitian or doctor.
                  </p>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
