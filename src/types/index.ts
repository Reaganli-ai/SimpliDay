export type EntryType = 'fitness' | 'diet' | 'mood' | 'energy' | 'other';

export interface Entry {
  id: string;
  user_id: string;
  type: EntryType;
  content: string;
  parsed_data: Record<string, unknown>;
  created_at: string;
}

export type Gender = 'male' | 'female';
export type Goal = 'lose' | 'maintain' | 'gain';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active';

export interface UserProfile {
  id: string;
  language: 'en' | 'zh';
  gender?: Gender;
  age?: number;
  height_cm?: number;
  weight_kg?: number;
  goal?: Goal;
  activity_level?: ActivityLevel;
  lifestyle?: string;
  tdee?: number;
}

export interface User {
  id: string;
  email: string;
  language: 'en' | 'zh';
  created_at: string;
}

export interface AIClassification {
  type: EntryType;
  confidence: number;
  parsed_data: {
    // 健身相关
    exercise?: string;
    duration?: number;
    sets?: number;
    reps?: number;
    weight?: number;
    // 饮食相关
    food?: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    // 心情相关
    mood_score?: number;
    mood_description?: string;
    // 能量相关
    energy_level?: number;
  };
}

export interface AISuggestion {
  summary: string;
  fitness_suggestions: string[];
  diet_suggestions: string[];
  encouragement: string;
}
