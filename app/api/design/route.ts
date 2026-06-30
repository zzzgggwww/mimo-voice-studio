import { NextRequest, NextResponse } from 'next/server';
import { designVoice } from '@/lib/mimo';

export async function POST(request: NextRequest) {
  try {
    const { voiceDescription, text } = await request.json();

    if (!voiceDescription || !text) {
      return NextResponse.json({ error: '请提供音色描述和文案内容' }, { status: 400 });
    }

    const audioBuffer = await designVoice(voiceDescription, text);

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Disposition': 'attachment; filename="designed_audio.wav"',
      },
    });
  } catch (error: any) {
    console.error('Design error:', error);
    return NextResponse.json(
      { error: error.message || '声音设计失败' },
      { status: 500 }
    );
  }
}
