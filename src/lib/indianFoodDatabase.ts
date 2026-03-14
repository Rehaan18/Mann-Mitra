// src/lib/indianFoodDatabase.ts
// Comprehensive Indian food nutrition database
// Values per standard serving (approximate, based on ICMR / NIN India data)
// Units: protein(g), vitamin_b12(mcg), iron(mg), magnesium(mg), omega3(g), vitamin_d(IU), calories(kcal)

export interface FoodNutrients {
  name: string;
  emoji: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink' | 'ingredient';
  serving: string;
  protein: number;
  vitamin_b12: number;
  iron: number;
  magnesium: number;
  omega3: number;
  vitamin_d: number;
  calories: number;
  tags: string[];
}

export const INDIAN_FOOD_DB: Record<string, FoodNutrients> = {
  // ── BREAKFAST ──────────────────────────────────────────────────────────────
  poha: {
    name: 'Poha', emoji: '🍚', category: 'breakfast', serving: '1 plate (150g)',
    protein: 3.5, vitamin_b12: 0.0, iron: 2.8, magnesium: 22, omega3: 0.0, vitamin_d: 0, calories: 180,
    tags: ['vegetarian', 'breakfast', 'maharashtrian']
  },
  idli: {
    name: 'Idli', emoji: '🫓', category: 'breakfast', serving: '3 pieces (150g)',
    protein: 4.0, vitamin_b12: 0.0, iron: 1.2, magnesium: 18, omega3: 0.0, vitamin_d: 0, calories: 130,
    tags: ['vegetarian', 'breakfast', 'south-indian', 'fermented']
  },
  dosa: {
    name: 'Dosa', emoji: '🥞', category: 'breakfast', serving: '1 large (100g)',
    protein: 3.5, vitamin_b12: 0.0, iron: 1.5, magnesium: 20, omega3: 0.0, vitamin_d: 0, calories: 165,
    tags: ['vegetarian', 'breakfast', 'south-indian']
  },
  upma: {
    name: 'Upma', emoji: '🍲', category: 'breakfast', serving: '1 bowl (180g)',
    protein: 5.0, vitamin_b12: 0.0, iron: 2.0, magnesium: 30, omega3: 0.0, vitamin_d: 0, calories: 200,
    tags: ['vegetarian', 'breakfast', 'south-indian']
  },
  paratha: {
    name: 'Paratha', emoji: '🫓', category: 'breakfast', serving: '2 pieces (120g)',
    protein: 5.5, vitamin_b12: 0.1, iron: 2.2, magnesium: 28, omega3: 0.0, vitamin_d: 0, calories: 280,
    tags: ['vegetarian', 'breakfast', 'north-indian']
  },
  aloo_paratha: {
    name: 'Aloo Paratha', emoji: '🫓', category: 'breakfast', serving: '2 pieces (150g)',
    protein: 6.0, vitamin_b12: 0.1, iron: 2.5, magnesium: 32, omega3: 0.0, vitamin_d: 0, calories: 330,
    tags: ['vegetarian', 'breakfast', 'punjabi']
  },
  puri: {
    name: 'Puri', emoji: '🍞', category: 'breakfast', serving: '3 pieces (90g)',
    protein: 4.0, vitamin_b12: 0.0, iron: 1.8, magnesium: 18, omega3: 0.0, vitamin_d: 0, calories: 240,
    tags: ['vegetarian', 'breakfast']
  },
  bread: {
    name: 'Bread (white)', emoji: '🍞', category: 'breakfast', serving: '2 slices (60g)',
    protein: 4.2, vitamin_b12: 0.0, iron: 1.4, magnesium: 12, omega3: 0.0, vitamin_d: 0, calories: 150,
    tags: ['vegetarian', 'breakfast']
  },
  oats: {
    name: 'Oats / Daliya', emoji: '🥣', category: 'breakfast', serving: '1 bowl (50g dry)',
    protein: 6.5, vitamin_b12: 0.0, iron: 2.1, magnesium: 44, omega3: 0.05, vitamin_d: 0, calories: 190,
    tags: ['vegetarian', 'breakfast', 'healthy']
  },

  // ── DAL / LEGUMES ───────────────────────────────────────────────────────────
  dal: {
    name: 'Dal (toor/arhar)', emoji: '🍲', category: 'lunch', serving: '1 katori (150ml)',
    protein: 8.5, vitamin_b12: 0.0, iron: 2.7, magnesium: 36, omega3: 0.02, vitamin_d: 0, calories: 120,
    tags: ['vegetarian', 'vegan', 'protein', 'lunch']
  },
  dal_makhani: {
    name: 'Dal Makhani', emoji: '🍲', category: 'dinner', serving: '1 katori (150ml)',
    protein: 9.0, vitamin_b12: 0.1, iron: 3.2, magnesium: 42, omega3: 0.02, vitamin_d: 0, calories: 190,
    tags: ['vegetarian', 'protein', 'dinner', 'punjabi']
  },
  rajma: {
    name: 'Rajma', emoji: '🫘', category: 'lunch', serving: '1 katori (150ml)',
    protein: 9.5, vitamin_b12: 0.0, iron: 3.9, magnesium: 48, omega3: 0.06, vitamin_d: 0, calories: 165,
    tags: ['vegetarian', 'vegan', 'protein', 'iron-rich']
  },
  chole: {
    name: 'Chole / Chana', emoji: '🫘', category: 'lunch', serving: '1 katori (150ml)',
    protein: 10.0, vitamin_b12: 0.0, iron: 4.2, magnesium: 52, omega3: 0.04, vitamin_d: 0, calories: 175,
    tags: ['vegetarian', 'vegan', 'protein', 'iron-rich', 'punjabi']
  },
  moong_dal: {
    name: 'Moong Dal', emoji: '🍵', category: 'lunch', serving: '1 katori (150ml)',
    protein: 7.5, vitamin_b12: 0.0, iron: 2.2, magnesium: 28, omega3: 0.01, vitamin_d: 0, calories: 105,
    tags: ['vegetarian', 'vegan', 'light', 'protein']
  },
  sambar: {
    name: 'Sambar', emoji: '🥘', category: 'lunch', serving: '1 bowl (200ml)',
    protein: 4.5, vitamin_b12: 0.0, iron: 2.5, magnesium: 30, omega3: 0.02, vitamin_d: 0, calories: 90,
    tags: ['vegetarian', 'vegan', 'south-indian', 'lunch']
  },

  // ── GRAINS / STAPLES ────────────────────────────────────────────────────────
  rice: {
    name: 'White Rice', emoji: '🍚', category: 'lunch', serving: '1 katori cooked (150g)',
    protein: 3.5, vitamin_b12: 0.0, iron: 0.8, magnesium: 12, omega3: 0.01, vitamin_d: 0, calories: 195,
    tags: ['vegetarian', 'vegan', 'staple']
  },
  brown_rice: {
    name: 'Brown Rice', emoji: '🍚', category: 'lunch', serving: '1 katori cooked (150g)',
    protein: 4.5, vitamin_b12: 0.0, iron: 1.2, magnesium: 42, omega3: 0.01, vitamin_d: 0, calories: 180,
    tags: ['vegetarian', 'vegan', 'healthy', 'magnesium-rich']
  },
  roti: {
    name: 'Roti / Chapati', emoji: '🫓', category: 'lunch', serving: '2 rotis (60g)',
    protein: 4.5, vitamin_b12: 0.0, iron: 2.0, magnesium: 24, omega3: 0.0, vitamin_d: 0, calories: 160,
    tags: ['vegetarian', 'vegan', 'staple', 'north-indian']
  },
  jowar_roti: {
    name: 'Jowar Roti', emoji: '🫓', category: 'lunch', serving: '2 rotis (60g)',
    protein: 4.8, vitamin_b12: 0.0, iron: 2.8, magnesium: 55, omega3: 0.0, vitamin_d: 0, calories: 150,
    tags: ['vegetarian', 'gluten-free', 'millets', 'healthy']
  },
  bajra_roti: {
    name: 'Bajra Roti', emoji: '🫓', category: 'lunch', serving: '2 rotis (60g)',
    protein: 5.2, vitamin_b12: 0.0, iron: 3.5, magnesium: 62, omega3: 0.0, vitamin_d: 0, calories: 155,
    tags: ['vegetarian', 'gluten-free', 'millets', 'iron-rich', 'magnesium-rich']
  },

  // ── DAIRY ───────────────────────────────────────────────────────────────────
  milk: {
    name: 'Milk (full fat)', emoji: '🥛', category: 'drink', serving: '1 glass (250ml)',
    protein: 8.0, vitamin_b12: 1.0, iron: 0.1, magnesium: 28, omega3: 0.07, vitamin_d: 40, calories: 150,
    tags: ['vegetarian', 'b12-rich', 'vitamin-d']
  },
  curd: {
    name: 'Curd / Dahi', emoji: '🥛', category: 'snack', serving: '1 katori (150g)',
    protein: 5.5, vitamin_b12: 0.4, iron: 0.1, magnesium: 18, omega3: 0.04, vitamin_d: 8, calories: 100,
    tags: ['vegetarian', 'probiotic', 'b12-rich']
  },
  paneer: {
    name: 'Paneer', emoji: '🧀', category: 'ingredient', serving: '100g',
    protein: 18.0, vitamin_b12: 0.8, iron: 0.5, magnesium: 14, omega3: 0.16, vitamin_d: 15, calories: 265,
    tags: ['vegetarian', 'protein-rich', 'b12-rich', 'north-indian']
  },
  paneer_curry: {
    name: 'Paneer Curry', emoji: '🍛', category: 'dinner', serving: '1 katori (150g)',
    protein: 14.0, vitamin_b12: 0.6, iron: 1.2, magnesium: 20, omega3: 0.12, vitamin_d: 12, calories: 280,
    tags: ['vegetarian', 'protein-rich', 'b12-rich', 'north-indian']
  },
  lassi: {
    name: 'Lassi', emoji: '🥛', category: 'drink', serving: '1 glass (250ml)',
    protein: 5.0, vitamin_b12: 0.4, iron: 0.1, magnesium: 15, omega3: 0.03, vitamin_d: 6, calories: 150,
    tags: ['vegetarian', 'probiotic']
  },
  cheese: {
    name: 'Cheese', emoji: '🧀', category: 'ingredient', serving: '30g',
    protein: 7.0, vitamin_b12: 0.5, iron: 0.1, magnesium: 8, omega3: 0.1, vitamin_d: 6, calories: 120,
    tags: ['vegetarian', 'b12-rich']
  },

  // ── EGGS ────────────────────────────────────────────────────────────────────
  eggs: {
    name: 'Eggs', emoji: '🥚', category: 'breakfast', serving: '2 whole eggs',
    protein: 12.5, vitamin_b12: 1.6, iron: 1.8, magnesium: 12, omega3: 0.18, vitamin_d: 82, calories: 155,
    tags: ['non-vegetarian', 'protein-rich', 'b12-rich', 'vitamin-d', 'omega3']
  },
  boiled_eggs: {
    name: 'Boiled Eggs', emoji: '🥚', category: 'snack', serving: '2 eggs',
    protein: 12.5, vitamin_b12: 1.6, iron: 1.8, magnesium: 12, omega3: 0.18, vitamin_d: 82, calories: 140,
    tags: ['non-vegetarian', 'protein-rich', 'b12-rich']
  },
  omelette: {
    name: 'Omelette', emoji: '🍳', category: 'breakfast', serving: '2-egg omelette',
    protein: 13.0, vitamin_b12: 1.6, iron: 1.9, magnesium: 14, omega3: 0.2, vitamin_d: 82, calories: 180,
    tags: ['non-vegetarian', 'protein-rich', 'b12-rich']
  },

  // ── FISH / MEAT ─────────────────────────────────────────────────────────────
  fish: {
    name: 'Fish (rohu/catla)', emoji: '🐟', category: 'dinner', serving: '1 piece (120g)',
    protein: 22.0, vitamin_b12: 3.2, iron: 1.0, magnesium: 28, omega3: 1.2, vitamin_d: 200, calories: 135,
    tags: ['non-vegetarian', 'protein-rich', 'omega3-rich', 'b12-rich', 'vitamin-d']
  },
  salmon: {
    name: 'Salmon', emoji: '🐟', category: 'dinner', serving: '1 piece (100g)',
    protein: 25.0, vitamin_b12: 3.2, iron: 0.8, magnesium: 32, omega3: 2.3, vitamin_d: 570, calories: 208,
    tags: ['non-vegetarian', 'omega3-rich', 'b12-rich', 'vitamin-d', 'protein-rich']
  },
  chicken: {
    name: 'Chicken (curry)', emoji: '🍗', category: 'dinner', serving: '1 piece + gravy (150g)',
    protein: 25.0, vitamin_b12: 0.5, iron: 1.5, magnesium: 26, omega3: 0.08, vitamin_d: 8, calories: 230,
    tags: ['non-vegetarian', 'protein-rich']
  },
  chicken_breast: {
    name: 'Chicken Breast (grilled)', emoji: '🍗', category: 'dinner', serving: '100g',
    protein: 31.0, vitamin_b12: 0.5, iron: 1.0, magnesium: 29, omega3: 0.06, vitamin_d: 4, calories: 165,
    tags: ['non-vegetarian', 'protein-rich', 'lean']
  },
  mutton: {
    name: 'Mutton', emoji: '🥩', category: 'dinner', serving: '1 serving (120g)',
    protein: 22.0, vitamin_b12: 2.6, iron: 2.4, magnesium: 24, omega3: 0.12, vitamin_d: 4, calories: 260,
    tags: ['non-vegetarian', 'b12-rich', 'iron-rich', 'protein-rich']
  },

  // ── VEGETABLES ──────────────────────────────────────────────────────────────
  spinach: {
    name: 'Spinach / Palak', emoji: '🥬', category: 'ingredient', serving: '1 katori cooked (100g)',
    protein: 2.5, vitamin_b12: 0.0, iron: 3.5, magnesium: 58, omega3: 0.14, vitamin_d: 0, calories: 23,
    tags: ['vegetarian', 'vegan', 'iron-rich', 'magnesium-rich', 'superfood']
  },
  palak_paneer: {
    name: 'Palak Paneer', emoji: '🥬', category: 'dinner', serving: '1 katori (150g)',
    protein: 13.0, vitamin_b12: 0.6, iron: 3.8, magnesium: 48, omega3: 0.14, vitamin_d: 12, calories: 210,
    tags: ['vegetarian', 'iron-rich', 'protein-rich', 'magnesium-rich']
  },
  broccoli: {
    name: 'Broccoli', emoji: '🥦', category: 'ingredient', serving: '1 cup (90g)',
    protein: 2.5, vitamin_b12: 0.0, iron: 0.6, magnesium: 19, omega3: 0.13, vitamin_d: 0, calories: 31,
    tags: ['vegetarian', 'vegan', 'healthy']
  },
  tomato: {
    name: 'Tomato', emoji: '🍅', category: 'ingredient', serving: '1 medium (120g)',
    protein: 1.0, vitamin_b12: 0.0, iron: 0.4, magnesium: 11, omega3: 0.0, vitamin_d: 0, calories: 22,
    tags: ['vegetarian', 'vegan']
  },
  potato: {
    name: 'Potato', emoji: '🥔', category: 'ingredient', serving: '1 medium (150g)',
    protein: 3.0, vitamin_b12: 0.0, iron: 0.8, magnesium: 30, omega3: 0.0, vitamin_d: 0, calories: 130,
    tags: ['vegetarian', 'vegan', 'staple']
  },
  onion: {
    name: 'Onion', emoji: '🧅', category: 'ingredient', serving: '1 medium (100g)',
    protein: 1.1, vitamin_b12: 0.0, iron: 0.2, magnesium: 10, omega3: 0.0, vitamin_d: 0, calories: 40,
    tags: ['vegetarian', 'vegan']
  },

  // ── NUTS & SEEDS ────────────────────────────────────────────────────────────
  nuts: {
    name: 'Mixed Nuts', emoji: '🥜', category: 'snack', serving: '1 handful (30g)',
    protein: 5.5, vitamin_b12: 0.0, iron: 1.2, magnesium: 48, omega3: 0.3, vitamin_d: 0, calories: 175,
    tags: ['vegetarian', 'vegan', 'magnesium-rich', 'healthy-fat']
  },
  almonds: {
    name: 'Almonds', emoji: '🌰', category: 'snack', serving: '20 almonds (28g)',
    protein: 6.0, vitamin_b12: 0.0, iron: 1.1, magnesium: 76, omega3: 0.0, vitamin_d: 0, calories: 165,
    tags: ['vegetarian', 'vegan', 'magnesium-rich', 'protein-rich']
  },
  walnuts: {
    name: 'Walnuts', emoji: '🌰', category: 'snack', serving: '1 handful (28g)',
    protein: 4.3, vitamin_b12: 0.0, iron: 0.8, magnesium: 44, omega3: 2.5, vitamin_d: 0, calories: 185,
    tags: ['vegetarian', 'vegan', 'omega3-rich', 'magnesium-rich']
  },
  flaxseeds: {
    name: 'Flaxseeds (Alsi)', emoji: '🌱', category: 'ingredient', serving: '1 tbsp (10g)',
    protein: 1.8, vitamin_b12: 0.0, iron: 0.6, magnesium: 27, omega3: 2.35, vitamin_d: 0, calories: 55,
    tags: ['vegetarian', 'vegan', 'omega3-rich', 'superfood']
  },
  chia_seeds: {
    name: 'Chia Seeds', emoji: '🌱', category: 'ingredient', serving: '1 tbsp (12g)',
    protein: 2.0, vitamin_b12: 0.0, iron: 1.0, magnesium: 33, omega3: 2.4, vitamin_d: 0, calories: 58,
    tags: ['vegetarian', 'vegan', 'omega3-rich', 'iron-rich', 'magnesium-rich']
  },
  peanuts: {
    name: 'Peanuts / Mungfali', emoji: '🥜', category: 'snack', serving: '1 handful (30g)',
    protein: 7.5, vitamin_b12: 0.0, iron: 0.6, magnesium: 29, omega3: 0.0, vitamin_d: 0, calories: 170,
    tags: ['vegetarian', 'vegan', 'protein-rich']
  },

  // ── INDIAN SWEETS & SNACKS ──────────────────────────────────────────────────
  banana: {
    name: 'Banana', emoji: '🍌', category: 'snack', serving: '1 medium',
    protein: 1.3, vitamin_b12: 0.0, iron: 0.3, magnesium: 32, omega3: 0.0, vitamin_d: 0, calories: 105,
    tags: ['vegetarian', 'vegan', 'fruit', 'magnesium-rich']
  },
  apple: {
    name: 'Apple', emoji: '🍎', category: 'snack', serving: '1 medium',
    protein: 0.5, vitamin_b12: 0.0, iron: 0.1, magnesium: 9, omega3: 0.0, vitamin_d: 0, calories: 95,
    tags: ['vegetarian', 'vegan', 'fruit']
  },
  orange: {
    name: 'Orange / Santra', emoji: '🍊', category: 'snack', serving: '1 medium',
    protein: 1.2, vitamin_b12: 0.0, iron: 0.1, magnesium: 13, omega3: 0.0, vitamin_d: 0, calories: 62,
    tags: ['vegetarian', 'vegan', 'fruit', 'vitamin-c']
  },

  // ── SPECIAL DISHES ──────────────────────────────────────────────────────────
  khichdi: {
    name: 'Khichdi', emoji: '🍚', category: 'dinner', serving: '1 bowl (200g)',
    protein: 7.5, vitamin_b12: 0.0, iron: 2.5, magnesium: 35, omega3: 0.02, vitamin_d: 0, calories: 200,
    tags: ['vegetarian', 'vegan', 'light', 'comfort-food']
  },
  biryani: {
    name: 'Biryani (veg)', emoji: '🍛', category: 'dinner', serving: '1 plate (250g)',
    protein: 8.0, vitamin_b12: 0.0, iron: 2.2, magnesium: 32, omega3: 0.02, vitamin_d: 0, calories: 350,
    tags: ['vegetarian', 'lunch', 'dinner']
  },
  biryani_chicken: {
    name: 'Chicken Biryani', emoji: '🍗', category: 'dinner', serving: '1 plate (300g)',
    protein: 22.0, vitamin_b12: 0.4, iron: 2.5, magnesium: 38, omega3: 0.06, vitamin_d: 6, calories: 430,
    tags: ['non-vegetarian', 'protein-rich', 'lunch', 'dinner']
  },
  pav_bhaji: {
    name: 'Pav Bhaji', emoji: '🍞', category: 'dinner', serving: '2 pav + bhaji',
    protein: 6.5, vitamin_b12: 0.1, iron: 2.8, magnesium: 35, omega3: 0.0, vitamin_d: 0, calories: 320,
    tags: ['vegetarian', 'street-food', 'mumbai']
  },
  chaat: {
    name: 'Chaat', emoji: '🥗', category: 'snack', serving: '1 plate (150g)',
    protein: 5.0, vitamin_b12: 0.0, iron: 1.8, magnesium: 25, omega3: 0.0, vitamin_d: 0, calories: 180,
    tags: ['vegetarian', 'snack', 'street-food']
  },
};

// Daily Recommended Intake (DRI) — Indian adults (ICMR 2020)
export const DAILY_REQUIREMENTS = {
  protein:     { value: 60,   unit: 'g',   label: 'Protein' },
  vitamin_b12: { value: 2.2,  unit: 'mcg', label: 'Vitamin B12' },
  iron:        { value: 17,   unit: 'mg',  label: 'Iron' },
  magnesium:   { value: 340,  unit: 'mg',  label: 'Magnesium' },
  omega3:      { value: 1.6,  unit: 'g',   label: 'Omega-3' },
  vitamin_d:   { value: 600,  unit: 'IU',  label: 'Vitamin D' },
};

export type NutrientKey = keyof typeof DAILY_REQUIREMENTS;

// Get list of all food names for autocomplete
export const ALL_FOOD_NAMES = Object.keys(INDIAN_FOOD_DB);

// Fuzzy search: find matching food keys from user input
export function searchFoods(query: string): string[] {
  const q = query.toLowerCase().trim().replace(/\s+/g, '_');
  const results: string[] = [];

  for (const [key, food] of Object.entries(INDIAN_FOOD_DB)) {
    const nameMatch = food.name.toLowerCase().includes(query.toLowerCase());
    const keyMatch = key.includes(q) || key.includes(query.toLowerCase());
    const tagMatch = food.tags.some(t => t.includes(query.toLowerCase()));
    if (nameMatch || keyMatch || tagMatch) results.push(key);
  }
  return results.slice(0, 8);
}
