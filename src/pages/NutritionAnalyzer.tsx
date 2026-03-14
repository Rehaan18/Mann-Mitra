import React, { useState, useRef, useEffect } from 'react';
import { useNutritionAnalyzer } from '@/hooks/useNutritionAnalyzer';
import { DAILY_REQUIREMENTS, type NutrientKey } from '@/lib/indianFoodDatabase';
import type { NutrientStatus, MentalHealthInsight } from '@/lib/nutritionEngine';

const MEAL_TYPES = [
  { key: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { key: 'lunch',     label: 'Lunch',     emoji: '☀️' },
  { key: 'dinner',    label: 'Dinner',    emoji: '🌙' },
  { key: 'snack',     label: 'Snack',     emoji: '🍎' },
] as const;

const NUTRIENT_ICONS: Record<NutrientKey, string> = {
  protein: '💪', vitamin_b12: '🔋', iron: '🩸',
  magnesium: '🧘', omega3: '🐟', vitamin_d: '☀️',
};

const QUICK_FOODS = [
  'Poha','Idli','Dal','Rice','Roti','Paneer',
  'Eggs','Curd','Rajma','Spinach','Milk','Fish',
  'Almonds','Banana','Chicken','Chole',
];

// ── Status colours that work in both dark & light ─────────────────────────
function statusClasses(s: string) {
  switch (s) {
    case 'good':    return { card: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-400', bar: 'bg-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300' };
    case 'low':     return { card: 'bg-amber-500/10   border-amber-500/30',   text: 'text-amber-400',   bar: 'bg-amber-400',   badge: 'bg-amber-500/20   text-amber-300'   };
    case 'very_low':return { card: 'bg-orange-500/10  border-orange-500/30',  text: 'text-orange-400',  bar: 'bg-orange-400',  badge: 'bg-orange-500/20  text-orange-300'  };
    default:        return { card: 'bg-red-500/10     border-red-500/30',     text: 'text-red-400',     bar: 'bg-red-500',     badge: 'bg-red-500/20     text-red-300'     };
  }
}

// ── NutrientBar ────────────────────────────────────────────────────────────
function NutrientBar({ status }: { status: NutrientStatus }) {
  const pct = Math.min(status.percentage, 100);
  const cls = statusClasses(status.status);
  return (
    <div className={`rounded-2xl border p-4 transition-all duration-300 ${cls.card}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{NUTRIENT_ICONS[status.key]}</span>
          <span className="font-semibold text-foreground text-sm">{status.label}</span>
        </div>
        <div className="text-right">
          <span className={`font-bold text-sm ${cls.text}`}>{status.value}{status.unit}</span>
          <span className="text-xs text-muted-foreground ml-1">/ {status.required}{status.unit}</span>
        </div>
      </div>
      <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
        <div className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${cls.bar}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <span className={`text-xs font-medium ${cls.text}`}>{status.statusLabel}</span>
        <span className="text-xs text-muted-foreground">{status.percentage}%</span>
      </div>
    </div>
  );
}

// ── InsightCard ────────────────────────────────────────────────────────────
function InsightCard({ insight, index }: { insight: MentalHealthInsight; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);
  const severityCard = { mild: 'bg-amber-500/10 border-amber-500/40', moderate: 'bg-orange-500/10 border-orange-500/40', severe: 'bg-red-500/10 border-red-500/40' }[insight.severity];
  const severityBadge = { mild: 'bg-amber-500/20 text-amber-300', moderate: 'bg-orange-500/20 text-orange-300', severe: 'bg-red-500/20 text-red-300' }[insight.severity];

  return (
    <div className={`rounded-2xl border-2 p-5 transition-all duration-300 cursor-pointer hover:brightness-110 ${severityCard}`} onClick={() => setExpanded(!expanded)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-2xl shrink-0">{insight.icon}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <p className="font-bold text-foreground text-sm leading-tight">{insight.headline}</p>
              <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide ${severityBadge}`}>{insight.severity}</span>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">{insight.detail}</p>
          </div>
        </div>
        <span className="text-muted-foreground text-sm shrink-0">{expanded ? '▲' : '▼'}</span>
      </div>
      {expanded && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Possible mood effects</p>
            <div className="flex flex-wrap gap-1.5">
              {insight.moodImpact.map(impact => (
                <span key={impact} className="text-xs px-2.5 py-1 bg-muted rounded-full text-foreground border border-border font-medium">{impact}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">🍽️ Boost with these Indian foods</p>
            <div className="flex flex-wrap gap-1.5">
              {insight.suggestedFoods.map(food => (
                <span key={food} className="text-xs px-2.5 py-1 bg-emerald-500/20 rounded-full text-emerald-300 font-semibold border border-emerald-500/30">{food}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ScoreRing ──────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const r = 42, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#84cc16' : score >= 40 ? '#f59e0b' : '#ef4444';
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    let cur = 0; const step = score / 40;
    const t = setInterval(() => { cur = Math.min(cur + step, score); setDisplayed(Math.round(cur)); if (cur >= score) clearInterval(t); }, 16);
    return () => clearInterval(t);
  }, [score]);
  return (
    <div className="relative w-28 h-28">
      <svg className="-rotate-90 w-full h-full" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="9" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="9"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black" style={{ color }}>{displayed}</span>
        <span className="text-xs text-muted-foreground font-medium">/100</span>
      </div>
    </div>
  );
}

// ── Chart ──────────────────────────────────────────────────────────────────
function MoodCorrelationChart({ result }: { result: NonNullable<ReturnType<typeof useNutritionAnalyzer>['result']> }) {
  return (
    <div className="space-y-2">
      {result.statuses.map(status => {
        const pct = Math.min(status.percentage, 100);
        const color = status.status === 'good' ? '#22c55e' : status.status === 'low' ? '#f59e0b' : status.status === 'very_low' ? '#f97316' : '#ef4444';
        return (
          <div key={status.key} className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 w-32 shrink-0">
              <span className="text-base">{NUTRIENT_ICONS[status.key]}</span>
              <span className="text-xs font-medium text-muted-foreground truncate">{status.label}</span>
            </div>
            <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: color }} />
            </div>
            <span className="text-xs text-muted-foreground w-10 text-right font-mono">{pct}%</span>
          </div>
        );
      })}
    </div>
  );
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────
export default function NutritionAnalyzer() {
  const {
    foodInput, currentMealType, meals, result, isAnalyzing, suggestions,
    allFoodsCount, handleInputChange, setCurrentMealType, addFood, removeFood,
    clearAll, analyze, saveToDatabase, isSaving, setSuggestions,
  } = useNutritionAnalyzer();

  const inputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'nutrients' | 'insights' | 'chart' | 'tips'>('nutrients');

  return (
    <div className="min-h-screen p-4 md:p-6 bg-background">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Nutrition Analysis
            </div>
            <h1 className="text-3xl font-black text-foreground leading-tight">
              How is your food<br />
              <span className="text-emerald-400">feeding your mind?</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-2">Optimized for Indian diet · Tracks 6 mood-critical nutrients</p>
          </div>
          {result && (
            <div className="flex gap-2">
              <button onClick={clearAll} className="px-4 py-2 text-xs font-semibold text-muted-foreground bg-muted border border-border rounded-xl hover:bg-accent transition-all">Clear All</button>
              <button onClick={saveToDatabase} disabled={isSaving} className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-500 transition-all disabled:opacity-60 flex items-center gap-1.5">
                {isSaving ? '...' : '💾'} Save Log
              </button>
            </div>
          )}
        </div>

        {/* Meal type selector */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {MEAL_TYPES.map(mt => (
            <button key={mt.key} onClick={() => setCurrentMealType(mt.key)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                currentMealType === mt.key
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                  : 'bg-card border border-border text-muted-foreground hover:border-emerald-500/50 hover:text-foreground'
              }`}>
              <span>{mt.emoji}</span>
              <span>{mt.label}</span>
              {meals.find(m => m.mealType === mt.key) && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${currentMealType === mt.key ? 'bg-white/25 text-white' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {meals.find(m => m.mealType === mt.key)?.foods.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Food input */}
        <div className="bg-card rounded-3xl border border-border shadow-sm p-5">
          <label className="block text-sm font-bold text-foreground mb-3">
            {MEAL_TYPES.find(m => m.key === currentMealType)?.emoji} What did you have for {MEAL_TYPES.find(m => m.key === currentMealType)?.label.toLowerCase()}?
          </label>
          <div className="relative">
            <div className="flex gap-2">
              <input ref={inputRef} type="text" value={foodInput}
                onChange={e => handleInputChange(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && foodInput.trim() && addFood(foodInput)}
                placeholder="e.g. poha, dal, roti, paneer curry..."
                className="flex-1 px-4 py-3 rounded-xl border-2 border-border bg-muted focus:border-emerald-500 focus:outline-none text-sm text-foreground placeholder-muted-foreground transition-all focus:bg-card"
              />
              <button onClick={() => foodInput.trim() && addFood(foodInput)} disabled={!foodInput.trim()}
                className="px-5 py-3 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-500 active:scale-95 disabled:opacity-40 transition-all">
                Add +
              </button>
            </div>
            {suggestions.length > 0 && (
              <div className="absolute z-20 top-full left-0 right-12 mt-1.5 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
                {suggestions.map(s => (
                  <button key={s} onClick={() => { addFood(s); setSuggestions([]); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors border-b border-border last:border-0">
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Tip: Type multiple foods separated by commas, or use the quick-add buttons below.</p>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-xs text-muted-foreground font-medium self-center">Quick add:</span>
            {QUICK_FOODS.map(food => (
              <button key={food} onClick={() => { addFood(food); inputRef.current?.focus(); }}
                className="text-xs px-3 py-1.5 bg-muted hover:bg-emerald-500/20 hover:text-emerald-400 text-muted-foreground rounded-full transition-all font-medium border border-border hover:border-emerald-500/50">
                {food}
              </button>
            ))}
          </div>
        </div>

        {/* Meal log */}
        {meals.length > 0 && (
          <div className="bg-card rounded-3xl border border-border shadow-sm p-5">
            <h3 className="font-bold text-foreground text-sm mb-4">Today's Foods ({allFoodsCount} items)</h3>
            <div className="space-y-3">
              {MEAL_TYPES.map(mt => {
                const meal = meals.find(m => m.mealType === mt.key);
                if (!meal) return null;
                return (
                  <div key={mt.key}>
                    <div className="flex items-center gap-2 mb-2">
                      <span>{mt.emoji}</span>
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{mt.label}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {meal.foods.map((food, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/30 rounded-full text-sm text-emerald-300 font-medium group">
                          <span>{food}</span>
                          <button onClick={() => removeFood(mt.key, idx)} className="text-emerald-500/60 hover:text-red-400 transition-colors text-xs leading-none opacity-0 group-hover:opacity-100">×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <button onClick={analyze} disabled={isAnalyzing || allFoodsCount === 0}
              className="mt-5 w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-base rounded-2xl hover:opacity-90 active:scale-[0.98] disabled:opacity-60 transition-all shadow-md shadow-emerald-900/40 flex items-center justify-center gap-3">
              {isAnalyzing ? (
                <><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Analyzing your nutrition...</>
              ) : <>🔬 Analyze My Nutrition & Mental Wellness</>}
            </button>
          </div>
        )}

        {/* Empty state */}
        {meals.length === 0 && !result && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🥘</div>
            <h3 className="font-bold text-foreground text-lg mb-2">Log what you ate today</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">Add your meals above and discover how your Indian diet supports — or affects — your mental health.</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-5 animate-fade-in">

            {/* Score summary */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-xl shadow-emerald-900/40">
              <div className="flex items-center gap-6">
                <ScoreRing score={result.score.total} />
                <div className="flex-1">
                  <p className="text-emerald-200 text-xs font-semibold uppercase tracking-wide mb-1">Nutrition Score</p>
                  <p className="text-2xl font-black mb-1">{result.score.category}</p>
                  <p className="text-emerald-100 text-sm leading-relaxed">{result.summary}</p>
                  {result.unrecognizedFoods.length > 0 && (
                    <p className="text-emerald-300 text-xs mt-2">⚠️ Could not find: {result.unrecognizedFoods.join(', ')}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1.5 bg-card rounded-2xl border border-border p-1.5">
              {[{ key: 'nutrients', label: 'Nutrients', icon: '📊' }, { key: 'insights', label: 'Mental Health', icon: '🧠' }, { key: 'chart', label: 'Chart', icon: '📈' }, { key: 'tips', label: 'Food Tips', icon: '🌿' }].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === tab.key ? 'bg-emerald-600 text-white shadow-sm' : 'text-muted-foreground hover:bg-muted'
                  }`}>
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab: Nutrients */}
            {activeTab === 'nutrients' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.statuses.map(s => <NutrientBar key={s.key} status={s} />)}
              </div>
            )}

            {/* Tab: Insights */}
            {activeTab === 'insights' && (
              <div className="space-y-3">
                {result.insights.length > 0 ? result.insights.map((ins, i) => <InsightCard key={ins.nutrient} insight={ins} index={i} />) : (
                  <div className="text-center py-12 bg-emerald-500/10 rounded-3xl border border-emerald-500/20">
                    <div className="text-5xl mb-3">🌟</div>
                    <h3 className="font-bold text-emerald-400 text-lg mb-1">Your nutrition looks great!</h3>
                    <p className="text-emerald-300/70 text-sm">No significant deficiencies detected today. Keep up the balanced diet!</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Chart */}
            {activeTab === 'chart' && (
              <div className="bg-card rounded-3xl border border-border shadow-sm p-6">
                <h3 className="font-bold text-foreground mb-1">Nutrient Adequacy Chart</h3>
                <p className="text-muted-foreground text-xs mb-5">How much of your daily mental-health nutrient needs you met today</p>
                <MoodCorrelationChart result={result} />
                <div className="mt-5 pt-4 border-t border-border grid grid-cols-4 gap-3">
                  {[{ label: 'Adequate', color: 'bg-emerald-400', pct: '≥70%' }, { label: 'Low', color: 'bg-amber-400', pct: '50–69%' }, { label: 'Very Low', color: 'bg-orange-400', pct: '30–49%' }, { label: 'Deficient', color: 'bg-red-500', pct: '<30%' }].map(l => (
                    <div key={l.label} className="flex items-center gap-1.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${l.color} shrink-0`} />
                      <div>
                        <p className="text-xs font-medium text-foreground">{l.label}</p>
                        <p className="text-xs text-muted-foreground">{l.pct}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Tips */}
            {activeTab === 'tips' && (
              <div className="space-y-4">
                <div className="bg-card rounded-3xl border border-border shadow-sm p-6">
                  <h3 className="font-bold text-foreground mb-4">🌿 Best Indian Foods for Mental Wellness</h3>
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
                      <div key={item.food} className="flex items-start gap-3 p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                        <span className="text-2xl shrink-0">{item.icon}</span>
                        <div className="flex-1">
                          <p className="font-bold text-foreground text-sm">{item.food}</p>
                          <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">{item.why}</p>
                          <div className="flex gap-1 mt-2">
                            {item.tags.map(t => <span key={t} className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full font-semibold">{t}</span>)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-6">
                  <h3 className="font-bold text-amber-300 mb-3">💡 The Mental Wellness Thali</h3>
                  <p className="text-amber-300/70 text-sm mb-4">A balanced Indian meal that covers all 6 mood-critical nutrients:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { item: '2 Bajra rotis', purpose: 'Magnesium + Iron' },
                      { item: '1 katori Dal', purpose: 'Protein + Iron' },
                      { item: 'Palak sabzi', purpose: 'Iron + Magnesium' },
                      { item: '1 katori Curd', purpose: 'B12 + Protein' },
                      { item: 'Handful of walnuts', purpose: 'Omega-3' },
                      { item: 'Egg or fish', purpose: 'B12 + Vitamin D' },
                    ].map(x => (
                      <div key={x.item} className="bg-amber-500/10 rounded-xl p-3">
                        <p className="text-amber-300 font-semibold text-xs">{x.item}</p>
                        <p className="text-amber-300/60 text-xs mt-0.5">{x.purpose}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-muted rounded-2xl p-4 border border-border">
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    <strong className="text-foreground">Disclaimer:</strong> This analysis is based on approximate nutritional values (ICMR 2020). Not a medical diagnosis. Consult a registered dietitian for deficiency concerns.
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
