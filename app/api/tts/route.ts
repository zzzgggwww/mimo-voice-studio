import { NextRequest, NextResponse } from 'next/server';
import { synthesizeSpeech } from '@/lib/mimo';

export async function POST(request: NextRequest) {
  try {
    const { text, voice, style } = await request.json();

    if (!text) {
      return NextResponse.json({ error: '请提供文案内容' }, { status: 400 });
    }

    const audioBuffer = await synthesizeSpeech({
      text,
      voice: voice || '冰糖',
      style,
      format: 'wav',
    });

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Disposition': 'attachment; filename="audio.wav"',
      },
    });
  } catch (error: any) {
    console.error('TTS error:', error);
    return NextResponse.json(
      { error: error.message || '语音合成失败' },
      { status: 500 }
    );
  }
}
