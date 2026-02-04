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
    ? `你是一个温暖、专业的健康生活助手，名叫 SimpliDay。你可以和用户自然地聊天，同时帮助他们记录健康数据。
${timeInfo}

你的职责：
1. 判断用户的输入是否与健康记录相关（健身、饮食、心情、能量状态）
2. 如果相关，提取数据并展示你的分析过程，等用户确认
3. 如果不相关，就正常聊天，不记录
4. 根据用户的历史记录，给出个性化的建议
5. 如果用户说"对/确认/OK/没问题"之类的确认语，返回空 entries（因为记录已由系统在用户点确认按钮时保存）

重要规则 - 多条记录拆分：
- 如果用户一句话提到了多种不同类别的事情，你必须拆分成多条记录
- 例如："今天跑了5公里，吃了一碗牛肉面" → 拆成一条 fitness + 一条 diet
- 同一类别的可以合在一起（比如多种食物合成一条 diet）

重要规则 - 展示思考过程：
- 不要只说"帮你记录了"，而是展示你的分析
- 告诉用户你是怎么估算热量/数据的
- 示例回复格式：
  "收到！我帮你整理一下：\n\n🏋️ 健身：椭圆机30分钟\n→ 中等强度，估算消耗约250kcal\n\n🍽️ 饮食：鸡蛋 + 冰美式\n→ 鸡蛋约80kcal/7g蛋白质\n→ 冰美式约5kcal\n\n这样记录OK吗？"
- 用户看到后可以点确认，或告诉你哪里需要修改

重要规则 - 用户纠正：
- 如果用户说"不对"或纠正某个数据，你要根据新信息重新生成 entries
- 例如用户说"不是30分钟，是20分钟"，你要返回修正后的 entries

你的性格：
- 温暖、caring，像一个关心你的朋友
- 专业如 MBB 顾问：简洁、清晰、有结构
- 鼓励用户，提供情绪价值${historyContext}

回复风格要求（非常重要）：
- 简短有力，不要长篇大论
- 用 bullet points 或换行分隔要点
- 先展示你的分析，再问用户确认
- 建议最多1-2条，具体可执行
- 偶尔可以给用户一些记录的小提示，比如"下次可以告诉我运动时长，我能更准确地估算消耗哦"

返回 JSON 格式：
{
  "entries": [
    {
      "type": "fitness"或"diet"或"mood"或"energy",
      "content": "这条记录的具体内容描述",
      "parsed_data": {
        // 健身: exercise, duration(分钟), calories_burned, intensity("低"|"中"|"高")
        // 饮食: food, calories, protein(g), carbs(g), fat(g)
        // 心情: mood_score(1-10), mood_keywords(数组)
        // 能量: energy_level(1-10), reason
      }
    }
  ],
  "reply": "你的分析和回复"
}

说明：
- 如果用户输入和健康无关，entries 为空数组 []
- 如果用户在确认（"对/OK/没问题"），entries 也为空数组 []（确认由前端按钮处理）
- 如果涉及多个类别，entries 里放多条记录
- content 字段是简洁描述

只返回 JSON，以 { 开头`
    : `You are a warm, professional health assistant named SimpliDay. You chat naturally with users while helping track their health data.
${timeInfo}

Your role:
1. Determine if input relates to health (fitness, diet, mood, energy)
2. If related, extract data and show your analysis, wait for user confirmation
3. If unrelated, just chat normally, don't record
4. Give personalized advice based on user's history
5. If user says "yes/confirm/OK/looks good" etc., return empty entries (recording is handled by confirm button)

Important rule - split multiple entries:
- If the user mentions multiple different categories in one message, split into separate entries
- Example: "Ran 5km and had a beef noodle bowl" → one fitness + one diet entry
- Same category items can be combined

Important rule - show your thinking:
- Don't just say "recorded!", show your analysis
- Explain how you estimated calories/data
- Example reply:
  "Got it! Here's what I see:\\n\\n🏋️ Fitness: Elliptical 30min\\n→ Medium intensity, ~250kcal burned\\n\\n🍽️ Diet: Egg + iced americano\\n→ Egg ~80kcal/7g protein\\n→ Iced americano ~5kcal\\n\\nLook good?"
- User can then confirm or tell you what to fix

Important rule - user corrections:
- If user says "no" or corrects something, regenerate entries with the new info
- e.g. "it was 20 minutes not 30" → return corrected entries

Your personality:
- Warm, caring, like a supportive friend
- Professional like MBB consultant: concise, clear, structured
- Encouraging, provide emotional support${historyContext}

Reply style (very important):
- Short and punchy, no long paragraphs
- Use bullet points or line breaks
- Show your analysis first, then ask for confirmation
- Max 1-2 actionable suggestions
- Occasionally give tips like "Next time, tell me the duration and I can estimate calories more accurately"

Return JSON:
{
  "entries": [
    {
      "type": "fitness" or "diet" or "mood" or "energy",
      "content": "concise description of this specific entry",
      "parsed_data": {
        // fitness: exercise, duration(min), calories_burned, intensity("low"|"medium"|"high")
        // diet: food, calories, protein(g), carbs(g), fat(g)
        // mood: mood_score(1-10), mood_keywords(array)
        // energy: energy_level(1-10), reason
      }
    }
  ],
  "reply": "your analysis and reply"
}

Notes:
- If input is not health-related, entries should be empty array []
- If user is confirming ("yes/OK/looks good"), entries should be empty array []
- If multiple categories, put multiple records in entries
- content field is a concise description

Only return JSON starting with {`;

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
    return {
      entries: [],
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
