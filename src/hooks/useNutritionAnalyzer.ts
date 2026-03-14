// src/hooks/useNutritionAnalyzer.ts
import { useState, useCallback } from 'react';
import { analyzeNutrition, type AnalysisResult } from '@/lib/nutritionEngine';
import { searchFoods } from '@/lib/indianFoodDatabase';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

interface Meal {
  mealType: MealType;
  foods: string[];
}

export function useNutritionAnalyzer() {
  const [foodInput, setFoodInput] = useState('');
  const [currentMealType, setCurrentMealType] = useState<MealType>('breakfast');
  const [meals, setMeals] = useState<Meal[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const allFoodsCount = meals.reduce((sum, m) => sum + m.foods.length, 0);

  const handleInputChange = useCallback((value: string) => {
    setFoodInput(value);
    if (value.trim().length >= 2) {
      const results = searchFoods(value);
      setSuggestions(results.map(key =>
        key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      ));
    } else {
      setSuggestions([]);
    }
  }, []);

  const addFood = useCallback((food: string) => {
    const trimmed = food.trim();
    if (!trimmed) return;

    // Handle comma-separated input
    const items = trimmed.split(',').map(f => f.trim()).filter(Boolean);

    setMeals(prev => {
      const existing = prev.find(m => m.mealType === currentMealType);
      if (existing) {
        return prev.map(m =>
          m.mealType === currentMealType
            ? { ...m, foods: [...m.foods, ...items] }
            : m
        );
      }
      return [...prev, { mealType: currentMealType, foods: items }];
    });

    setFoodInput('');
    setSuggestions([]);
    setResult(null); // reset result when new food is added
  }, [currentMealType]);

  const removeFood = useCallback((mealType: MealType, index: number) => {
    setMeals(prev =>
      prev
        .map(m =>
          m.mealType === mealType
            ? { ...m, foods: m.foods.filter((_, i) => i !== index) }
            : m
        )
        .filter(m => m.foods.length > 0)
    );
    setResult(null);
  }, []);

  const clearAll = useCallback(() => {
    setMeals([]);
    setResult(null);
    setFoodInput('');
    setSuggestions([]);
  }, []);

  const analyze = useCallback(async () => {
    if (allFoodsCount === 0) return;
    setIsAnalyzing(true);

    // Small delay for UX feel
    await new Promise(r => setTimeout(r, 600));

    const allFoods = meals.flatMap(m => m.foods);
    const analysisResult = analyzeNutrition(allFoods);
    setResult(analysisResult);
    setIsAnalyzing(false);
  }, [meals, allFoodsCount]);

  const saveToDatabase = useCallback(async () => {
    if (!result) return;
    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');

      // Save to nutrition_logs table
      const { error } = await (supabase as any).from('nutrition_logs').insert({
        user_id: user.id,
        foods: meals.flatMap(m => m.foods),
        meal_types: meals.map(m => ({ type: m.mealType, foods: m.foods })),
        score: result.score.total,
        severity: result.score.category,
        totals: result.totals,
      });

      if (error) throw error;
      toast.success(`Nutrition log saved! Score: ${result.score.total}/100 🥗`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save log');
    } finally {
      setIsSaving(false);
    }
  }, [result]);

  return {
    foodInput,
    currentMealType,
    meals,
    result,
    isAnalyzing,
    isSaving,
    suggestions,
    allFoodsCount,
    handleInputChange,
    setCurrentMealType,
    addFood,
    removeFood,
    clearAll,
    analyze,
    saveToDatabase,
    setSuggestions,
  };
}
