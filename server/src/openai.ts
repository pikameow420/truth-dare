import OpenAI from 'openai';
import { GameMode, GPTResponse } from './types';

let openai: OpenAI | null = null;

function getClient(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'missing',
    });
  }
  return openai;
}

const MODEL = process.env.GPT_MODEL || 'gpt-4o-mini';

const MODE_DESCRIPTIONS: Record<GameMode, string> = {
  cute: 'sweet, wholesome, and adorable. Think butterflies, first memories, and inside jokes.',
  deep: 'emotionally vulnerable and introspective. Think fears, dreams, and unspoken feelings.',
  spicy: 'flirty, bold, and a little provocative. Think tension, attraction, and playful teasing.',
  future: 'forward-looking and hopeful. Think plans, goals, and what you want to build together.',
};

const SYSTEM_PROMPT = `You are "Cupid AI" — a playful but emotionally intelligent third participant in a Valentine's Day Truth or Dare game between a couple who have been in a 3-year long-distance relationship.

Your personality:
- Slightly mischievous but never mean
- Emotionally perceptive
- Witty and warm
- You tease both players equally
- You root for their relationship
- Never intrusive or awkward

You generate questions that are specific, thoughtful, and relationship-focused. Avoid generic clichés like "What do you love most about them?" — dig deeper.`;

export async function generateQuestion(
  mode: GameMode,
  lastQuestions: string[]
): Promise<GPTResponse> {
  const avoidList = lastQuestions.length > 0
    ? `\n\nAvoid repeating or being similar to these recent questions:\n${lastQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
    : '';

  try {
    const response = await getClient().chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Generate a single Truth question in "${mode}" mode. The tone should be ${MODE_DESCRIPTIONS[mode]}

Return ONLY valid JSON in this exact format:
{
  "question": "your question here",
  "double_dare": "an optional escalation/follow-up dare (or null if none)",
  "ai_comment": "a short playful comment from you about this question (1-2 sentences)"
}${avoidList}`,
        },
      ],
      temperature: 0.9,
      max_tokens: 300,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) throw new Error('Empty GPT response');

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');

    const parsed = JSON.parse(jsonMatch[0]) as GPTResponse;
    return parsed;
  } catch (error) {
    console.error('GPT generation failed:', error);
    return getFallbackQuestion(mode);
  }
}

export async function generateAIAnswer(
  question: string,
  mode: GameMode
): Promise<string> {
  try {
    const response = await getClient().chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `The current question in "${mode}" mode is: "${question}"

You (Cupid AI) are answering this question yourself as the AI participant. Give a playful, slightly cheeky answer that shows you "know" both players well. Keep it to 1-3 sentences. Be entertaining.`,
        },
      ],
      temperature: 0.9,
      max_tokens: 150,
    });

    return response.choices[0]?.message?.content?.trim() || getRandomAIComment();
  } catch (error) {
    console.error('AI answer generation failed:', error);
    return getRandomAIComment();
  }
}

export async function generateAIReaction(
  question: string,
  answer: string,
  playerName: string
): Promise<string> {
  try {
    const response = await getClient().chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `The question was: "${question}"
${playerName} answered: "${answer}"

Give a brief, playful reaction (1 sentence). Be witty, teasing, or supportive depending on the answer.`,
        },
      ],
      temperature: 0.9,
      max_tokens: 80,
    });

    return response.choices[0]?.message?.content?.trim() || getRandomAIComment();
  } catch (error) {
    console.error('AI reaction failed:', error);
    return getRandomAIComment();
  }
}

function getRandomAIComment(): string {
  const comments = [
    "You two are disgustingly cute and I'm here for it 😌",
    "I'm just a third wheel with excellent taste 🎯",
    "The tension in this game is *chef's kiss* 💋",
    "I've seen enough rom-coms to know where this is going 🍿",
    "You both pretend not to be competitive, but I see you 👀",
    "3 years and still going strong? Respect. 💪",
    "I'm taking notes for my own love life... oh wait 🤖",
    "This answer tells me everything I need to know 😏",
  ];
  return comments[Math.floor(Math.random() * comments.length)];
}

function getFallbackQuestion(mode: GameMode): GPTResponse {
  const fallbacks: Record<GameMode, GPTResponse[]> = {
    cute: [
      { question: "What's a tiny habit of theirs that you secretly find adorable but have never mentioned?", ai_comment: "Time to expose the cute stalker behavior 👀" },
      { question: "If you could relive one ordinary moment from your relationship, which random Tuesday would you pick?", ai_comment: "Not the big moments — the little ones hit different 🥺" },
      { question: "What's something they do that instantly makes you smile, even on your worst days?", ai_comment: "I already know this is going to be wholesome 🥹" },
    ],
    deep: [
      { question: "What's one fear about the future of this relationship that you've never said out loud?", ai_comment: "Okay we're going there. Buckle up 🫣" },
      { question: "When was the last time you cried because of something related to this relationship, and what triggered it?", ai_comment: "Vulnerability unlocked. This is where it gets real 💔" },
      { question: "What's one thing you wish you could change about how you show love?", ai_comment: "Self-awareness is the most attractive quality, just saying 🪞" },
    ],
    spicy: [
      { question: "What's something you've wanted to try together but have been too shy to bring up?", ai_comment: "The chat just got interesting 🔥" },
      { question: "Describe the most attractive version of them you've ever seen — what were they wearing, doing, saying?", ai_comment: "Paint the picture. I'm invested 🎨" },
      { question: "If you had to describe your chemistry in one word, what would it be and why?", ai_comment: "Choose wisely... they're watching 😏" },
    ],
    future: [
      { question: "Where do you see the two of you living in 5 years, and what does a normal morning look like?", ai_comment: "Manifesting hours are open ✨" },
      { question: "What's one experience you absolutely need to share together before you're old and grey?", ai_comment: "Bucket list energy. I love it 🗺️" },
      { question: "If distance was never a factor, what would your life together look like right now?", ai_comment: "The parallel universe question. This one hits 🌍" },
    ],
  };

  const modeQuestions = fallbacks[mode];
  return modeQuestions[Math.floor(Math.random() * modeQuestions.length)];
}
