import { createClient, SupabaseClient } from '@supabase/supabase-js';

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
