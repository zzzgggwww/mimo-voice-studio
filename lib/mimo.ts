import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.MIMO_API_KEY,
  baseURL: process.env.MIMO_BASE_URL || 'https://token-plan-cn.xiaomimimo.com/v1',
});

export interface TTSOptions {
  text: string;
  style?: string;
  voice?: string;
  format?: 'wav' | 'pcm16';
}

export async function polishText(text: string): Promise<string> {
  const completion = await client.chat.completions.create({
    model: 'mimo-v2.5-pro',
    messages: [
      {
        role: 'system',
        content: '你是一位专业的文案润色专家。请帮助用户优化文案，使其更加流畅、生动、专业。保持原意的同时，提升文案的表达效果。'
      },
      {
        role: 'user',
        content: `请润色以下文案：\n\n${text}`
      }
    ],
    max_tokens: 2048,
    temperature: 0.7,
  });

  return completion.choices[0]?.message?.content || text;
}

export async function synthesizeSpeech(options: TTSOptions): Promise<Buffer> {
  const { text, style, voice = '冰糖', format = 'wav' } = options;

  const messages: any[] = [];

  if (style) {
    messages.push({
      role: 'user',
      content: style
    });
  }

  messages.push({
    role: 'assistant',
    content: text
  });

  const completion = await client.chat.completions.create({
    model: 'mimo-v2.5-tts',
    messages,
    audio: {
      format,
      voice,
    },
  });

  const message = completion.choices[0]?.message;
  if (!message?.audio?.data) {
    throw new Error('No audio data received');
  }

  return Buffer.from(message.audio.data, 'base64');
}

export async function cloneVoice(audioBase64: string, mimeType: string, text: string, style?: string): Promise<Buffer> {
  const messages: any[] = [];

  if (style) {
    messages.push({
      role: 'user',
      content: style
    });
  } else {
    messages.push({
      role: 'user',
      content: ''
    });
  }

  messages.push({
    role: 'assistant',
    content: text
  });

  const completion = await client.chat.completions.create({
    model: 'mimo-v2.5-tts-voiceclone',
    messages,
    audio: {
      format: 'wav',
      voice: `data:${mimeType};base64,${audioBase64}`,
    },
  });

  const message = completion.choices[0]?.message;
  if (!message?.audio?.data) {
    throw new Error('No audio data received');
  }

  return Buffer.from(message.audio.data, 'base64');
}

export async function designVoice(voiceDescription: string, text: string): Promise<Buffer> {
  const completion = await client.chat.completions.create({
    model: 'mimo-v2.5-tts-voicedesign',
    messages: [
      {
        role: 'user',
        content: voiceDescription
      },
      {
        role: 'assistant',
        content: text
      }
    ],
    audio: {
      format: 'wav',
      optimize_text_preview: true,
    },
  });

  const message = completion.choices[0]?.message;
  if (!message?.audio?.data) {
    throw new Error('No audio data received');
  }

  return Buffer.from(message.audio.data, 'base64');
}

export const PRESET_VOICES = [
  { id: '冰糖', name: '冰糖', language: '中文', gender: '女性' },
  { id: '茉莉', name: '茉莉', language: '中文', gender: '女性' },
  { id: '苏打', name: '苏打', language: '中文', gender: '男性' },
  { id: '白桦', name: '白桦', language: '中文', gender: '男性' },
  { id: 'Mia', name: 'Mia', language: '英文', gender: '女性' },
  { id: 'Chloe', name: 'Chloe', language: '英文', gender: '女性' },
  { id: 'Milo', name: 'Milo', language: '英文', gender: '男性' },
  { id: 'Dean', name: 'Dean', language: '英文', gender: '男性' },
];
