import { AISuggestion, Entry } from '@/types';

interface ApiMessage {
  role: 'user' | 'assistant';
  content: string;
}

async function callClaude(systemPrompt: string, messages: ApiMessage[]) {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemPrompt, messages }),
  });

  if (!response.ok) {
    throw new Error('AI request failed');
  }

  return response.json();
}

// Legacy single-message call (for generateSuggestions)
async function callClaudeSingle(systemPrompt: string, userMessage: string) {
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

export interface EntryRecord {
  type: 'fitness' | 'diet' | 'mood' | 'energy';
  content: string;
  parsed_data: Record<string, unknown>;
}

export interface ChatResponse {
  entries: EntryRecord[];
  reply: string;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function chat(
  input: string,
  language: 'en' | 'zh',
  recentEntries?: Entry[],
  conversationHistory?: ConversationMessage[]
): Promise<ChatResponse> {
  // 构建历史记录摘要
  let historyContext = '';
  if (recentEntries && recentEntries.length > 0) {
    const summary = recentEntries.slice(0, 10).map(e => {
      const date = new Date(e.created_at).toLocaleDateString();
      return `- [${e.type}] ${e.content} (${date})`;
    }).join('\n');
    historyContext = language === 'zh'
      ? `\n\n用户最近的已确认记录：\n${summary}\n\n请基于这些记录来给用户更个性化的建议。`
      : `\n\nUser's recent confirmed records:\n${summary}\n\nPlease give personalized advice based on these records.`;
  }

  // 当前时间信息
  const now = new Date();
  const currentHour = now.getHours();
  const isLateNight = currentHour >= 0 && currentHour < 3;
  const timeInfo = language === 'zh'
    ? `\n当前时间：${now.toLocaleString('zh-CN')}${isLateNight ? '\n注意：现在是凌晨时段（0-3点），用户提到的活动可能是昨天发生的，请询问确认。' : ''}`
    : `\nCurrent time: ${now.toLocaleString('en-US')}${isLateNight ? '\nNote: It is early morning (0-3am). Activities mentioned may have happened yesterday. Please ask to confirm.' : ''}`;

  const systemPrompt = language === 'zh'
    ? `你是健康助手 SimpliDay。帮用户记录健身、饮食、心情、能量数据。${timeInfo}${historyContext}

规则：
1. 用户提到不同类别的事，拆成多条 entry（如运动+吃饭 → 一条fitness + 一条diet）
2. 同类别的合在一起（多种食物 → 一条diet）
3. 和健康无关就正常聊天，entries 为空 []
4. 用户确认（"对/OK"）时，entries 也为空 []
5. 用户纠正数据时，返回修正后的 entries

回复风格：简洁总结用户的记录内容，列出关键数据（热量、时长等），然后问"这样记录OK吗？"
示例："收到！整理一下：\n• 健身：椭圆机，消耗约250kcal\n• 饮食：鸡蛋+咖啡，约85kcal\n这样记录OK吗？"

必须返回 JSON：
{"entries":[{"type":"fitness","content":"椭圆机","parsed_data":{"exercise":"椭圆机","duration":30,"calories_burned":250,"intensity":"中"}}],"reply":"你的回复"}

parsed_data 字段：
- fitness: exercise, duration, calories_burned, intensity
- diet: food, calories, protein, carbs, fat
- mood: mood_score(1-10), mood_keywords
- energy: energy_level(1-10), reason

只返回JSON，以{开头，不要任何其他文字。`
    : `You are SimpliDay, a health assistant. Help users record fitness, diet, mood, energy data.${timeInfo}${historyContext}

Rules:
1. Split different categories into separate entries (workout+food → 1 fitness + 1 diet)
2. Combine same category (multiple foods → 1 diet entry)
3. Not health-related → normal chat, entries = []
4. User confirming ("yes/OK") → entries = []
5. User correcting data → return corrected entries

Reply style: briefly summarize what the user did, list key data (calories, duration), then ask "Look good?"
Example: "Got it!\\n• Fitness: Elliptical, ~250kcal burned\\n• Diet: Egg + coffee, ~85kcal\\nLook good?"

Must return JSON:
{"entries":[{"type":"fitness","content":"Elliptical","parsed_data":{"exercise":"elliptical","duration":30,"calories_burned":250,"intensity":"medium"}}],"reply":"your reply"}

parsed_data fields:
- fitness: exercise, duration, calories_burned, intensity
- diet: food, calories, protein, carbs, fat
- mood: mood_score(1-10), mood_keywords
- energy: energy_level(1-10), reason

Return ONLY JSON starting with {, no other text.`;

  // Build messages array with conversation history
  const apiMessages: ApiMessage[] = [];

  if (conversationHistory && conversationHistory.length > 0) {
    // Include last 10 messages for context
    const recentMessages = conversationHistory.slice(-10);
    for (const msg of recentMessages) {
      apiMessages.push({ role: msg.role, content: msg.content });
    }
  }

  // Add current user message
  apiMessages.push({ role: 'user', content: input });

  const result = await callClaude(systemPrompt, apiMessages);

  if (!result || !result.content) {
    return {
      entries: [],
      reply: language === 'zh' ? 'AI 服务暂时不可用，请稍后再试' : 'AI service temporarily unavailable, please try again',
    };
  }

  let content = result.content;

  // Try multiple strategies to extract JSON
  // 1. Code block wrapped
  const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    content = codeBlockMatch[1].trim();
  }

  // 2. If not valid JSON yet, try to find a JSON object in the text
  try {
    JSON.parse(content);
  } catch {
    const jsonObjectMatch = content.match(/\{[\s\S]*\}/);
    if (jsonObjectMatch) {
      content = jsonObjectMatch[0];
    }
  }

  try {
    const parsed = JSON.parse(content);
    // Handle new format (entries array)
    if (parsed.entries && Array.isArray(parsed.entries)) {
      return {
        entries: parsed.entries,
        reply: parsed.reply || '',
      };
    }
    // Backward compatibility: old format with should_record/type/parsed_data
    if (parsed.should_record && parsed.type) {
      return {
        entries: [{
          type: parsed.type,
          content: input,
          parsed_data: parsed.parsed_data || {},
        }],
        reply: parsed.reply || '',
      };
    }
    return {
      entries: [],
      reply: parsed.reply || '',
    };
  } catch {
    console.error('Failed to parse AI response:', content);
    // Show the raw AI response instead of a generic error
    // This way the user at least sees what the AI said
    return {
      entries: [],
      reply: content || (language === 'zh' ? '抱歉，我没太理解。你可以再说一遍吗？' : "Sorry, I didn't quite understand. Could you say that again?")
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

  const result = await callClaudeSingle(systemPrompt, `用户近期记录:\n${entrySummary}`);

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
      fitness_suggestions: [],
      diet_suggestions: [],
      encouragement: language === 'zh' ? '你做得很好！' : 'You are doing great!'
    };
  }
}
