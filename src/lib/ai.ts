import { AISuggestion, Entry } from '@/types';

async function callClaude(systemPrompt: string, userMessage: string) {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemPrompt, userMessage }),
  });

  if (!response.ok) {
    throw new Error('AI request failed');
  }

  return response.json();
}

export interface ChatResponse {
  should_record: boolean;
  type: 'fitness' | 'diet' | 'mood' | 'energy' | null;
  parsed_data: Record<string, unknown>;
  reply: string;
}

export async function chat(
  input: string,
  language: 'en' | 'zh',
  recentEntries?: Entry[]
): Promise<ChatResponse> {
  // 构建历史记录摘要
  let historyContext = '';
  if (recentEntries && recentEntries.length > 0) {
    const summary = recentEntries.slice(0, 10).map(e => {
      const date = new Date(e.created_at).toLocaleDateString();
      return `- [${e.type}] ${e.content} (${date})`;
    }).join('\n');
    historyContext = language === 'zh'
      ? `\n\n用户最近的记录：\n${summary}\n\n请基于这些记录来给用户更个性化的建议。`
      : `\n\nUser's recent records:\n${summary}\n\nPlease give personalized advice based on these records.`;
  }

  const systemPrompt = language === 'zh'
    ? `你是一个温暖、专业的健康生活助手，名叫 LifeTracker。你可以和用户自然地聊天，同时帮助他们记录健康数据。

你的职责：
1. 判断用户的输入是否与健康记录相关（健身、饮食、心情、能量状态）
2. 如果相关，提取数据并给出友好的回复和实时建议
3. 如果不相关，就正常聊天，不记录
4. 根据用户的历史记录，给出个性化的建议

你的性格：
- 温暖、caring，像一个关心你的朋友
- 专业如 MBB 顾问：简洁、清晰、有结构
- 鼓励用户，提供情绪价值${historyContext}

回复风格要求（非常重要）：
- 简短有力，不要长篇大论
- 用 bullet points 或换行分隔要点
- 每个要点一句话，不超过15字
- 先给情绪价值（鼓励/认可），再给建议
- 建议最多2-3条，具体可执行

返回 JSON 格式：
{
  "should_record": true或false,
  "type": "fitness"或"diet"或"mood"或"energy"或null,
  "parsed_data": {
    // 不记录时为空对象 {}
    // 健身: exercise, duration(分钟), calories_burned, intensity("低"|"中"|"高")
    // 饮食: food, calories, protein(g), carbs(g), fat(g)
    // 心情: mood_score(1-10), mood_keywords(数组)
    // 能量: energy_level(1-10), reason
  },
  "reply": "简洁的回复，用\\n换行分隔要点"
}

示例 reply 格式：
"已记录！跑步30分钟很棒 💪\\n\\n建议：\\n• 跑后记得拉伸5分钟\\n• 补充点蛋白质"

只返回 JSON，以 { 开头`
    : `You are a warm, professional health assistant named LifeTracker. You chat naturally with users while helping track their health data.

Your role:
1. Determine if input relates to health (fitness, diet, mood, energy)
2. If related, extract data and give a friendly reply with real-time advice
3. If unrelated, just chat normally, don't record
4. Give personalized advice based on user's history

Your personality:
- Warm, caring, like a supportive friend
- Professional like MBB consultant: concise, clear, structured
- Encouraging, provide emotional support${historyContext}

Reply style (very important):
- Short and punchy, no long paragraphs
- Use bullet points or line breaks to separate points
- Each point max 10 words
- First give emotional support, then advice
- Max 2-3 actionable suggestions

Return JSON:
{
  "should_record": true or false,
  "type": "fitness" or "diet" or "mood" or "energy" or null,
  "parsed_data": {
    // Empty {} if not recording
    // fitness: exercise, duration(min), calories_burned, intensity("low"|"medium"|"high")
    // diet: food, calories, protein(g), carbs(g), fat(g)
    // mood: mood_score(1-10), mood_keywords(array)
    // energy: energy_level(1-10), reason
  },
  "reply": "concise reply, use \\n for line breaks"
}

Example reply format:
"Logged! 30min run - great job 💪\\n\\nTips:\\n• Stretch for 5min after\\n• Have some protein"

Only return JSON starting with {`;

  const result = await callClaude(systemPrompt, input);

  let content = result.content;

  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    content = jsonMatch[1].trim();
  }

  try {
    return JSON.parse(content);
  } catch {
    console.error('Failed to parse AI response:', content);
    // 返回一个默认的聊天回复
    return {
      should_record: false,
      type: null,
      parsed_data: {},
      reply: language === 'zh' ? '抱歉，我没太理解。你可以再说一遍吗？' : "Sorry, I didn't quite understand. Could you say that again?"
    };
  }
}

export async function generateSuggestions(
  entries: Entry[],
  language: 'en' | 'zh'
): Promise<AISuggestion> {
  const systemPrompt = language === 'zh'
    ? `你是一位专业的健身教练和营养师，同时也是一个温暖的生活教练。
根据用户过去几天的健身和饮食记录，给出下周的具体建议。

重点关注：
1. 健身建议：根据用户的运动记录，建议下周的训练计划（频率、强度、类型）
2. 饮食建议：根据用户的饮食记录，建议如何调整饮食结构
3. 注意营养均衡和运动恢复的平衡

原则：
- 专业但不说教，建议要具体可执行
- 提供情绪价值，鼓励而不是批评
- 注意休息和恢复的重要性

返回 JSON 格式：
{
  "summary": "对用户近期健身和饮食状态的分析（2-3句话）",
  "fitness_suggestions": ["健身建议1", "健身建议2"],
  "diet_suggestions": ["饮食建议1", "饮食建议2"],
  "encouragement": "一句温暖的鼓励话语"
}
只返回 JSON。`
    : `You are a professional fitness coach and nutritionist, as well as a warm life coach.
Based on the user's fitness and diet records from the past few days, provide specific suggestions for the coming week.

Focus on:
1. Fitness advice: Based on exercise records, suggest next week's training plan (frequency, intensity, type)
2. Diet advice: Based on diet records, suggest how to adjust eating habits
3. Balance nutrition and exercise recovery

Principles:
- Professional but not preachy, suggestions should be specific and actionable
- Provide emotional support, encourage rather than criticize
- Emphasize the importance of rest and recovery

Return JSON format:
{
  "summary": "Analysis of user's recent fitness and diet state (2-3 sentences)",
  "fitness_suggestions": ["fitness suggestion 1", "fitness suggestion 2"],
  "diet_suggestions": ["diet suggestion 1", "diet suggestion 2"],
  "encouragement": "A warm encouraging message"
}
Return only JSON.`;

  const entrySummary = entries.map(e =>
    `[${e.type}] ${e.content} (${new Date(e.created_at).toLocaleDateString()})`
  ).join('\n');

  const result = await callClaude(systemPrompt, `用户近期记录:\n${entrySummary}`);

  let content = result.content;
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    content = jsonMatch[1].trim();
  }

  try {
    return JSON.parse(content);
  } catch {
    return {
      summary: language === 'zh' ? '继续保持记录习惯！' : 'Keep up the tracking habit!',
      suggestions: [],
      encouragement: language === 'zh' ? '你做得很好！' : 'You are doing great!'
    };
  }
}
