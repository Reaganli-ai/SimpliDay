import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProfile, Gender, Goal, ActivityLevel } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 只在有有效配置时创建客户端
const isValidUrl = supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://');

export const supabase: SupabaseClient = isValidUrl
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as unknown as SupabaseClient); // 在配置之前使用 null placeholder

// 数据库操作函数
export async function createEntry(
  userId: string,
  type: string,
  content: string,
  parsedData: Record<string, unknown>
) {
  const { data, error } = await supabase
    .from('entries')
    .insert({
      user_id: userId,
      type,
      content,
      parsed_data: parsedData,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getEntries(userId: string, limit = 50) {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function getEntriesByDateRange(
  userId: string,
  startDate: string,
  endDate: string
) {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateUserLanguage(userId: string, language: 'en' | 'zh') {
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, language })
    .eq('id', userId);

  if (error) throw error;
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function deleteEntry(entryId: string) {
  const { error } = await supabase
    .from('entries')
    .delete()
    .eq('id', entryId);

  if (error) throw error;
}

export async function updateEntry(
  entryId: string,
  content: string,
  parsedData: Record<string, unknown>
) {
  const { data, error } = await supabase
    .from('entries')
    .update({ content, parsed_data: parsedData })
    .eq('id', entryId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// TDEE Calculation (Mifflin-St Jeor)
export function calculateTDEE(
  gender: Gender,
  age: number,
  heightCm: number,
  weightKg: number,
  activityLevel: ActivityLevel
): number {
  // BMR
  let bmr: number;
  if (gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }

  // Activity multiplier
  const multipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
  };

  return Math.round(bmr * multipliers[activityLevel]);
}

export async function updateProfile(
  userId: string,
  profile: Partial<Omit<UserProfile, 'id'>>
) {
  // Calculate TDEE if we have all required fields
  let tdee = profile.tdee;
  if (profile.gender && profile.age && profile.height_cm && profile.weight_kg && profile.activity_level) {
    tdee = calculateTDEE(
      profile.gender,
      profile.age,
      profile.height_cm,
      profile.weight_kg,
      profile.activity_level
    );
  }

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      ...profile,
      tdee,
    });

  if (error) throw error;
}
