import { NextRequest, NextResponse } from 'next/server';
import { cloneVoice } from '@/lib/mimo';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const text = formData.get('text') as string;
    const style = formData.get('style') as string;

    if (!audioFile || !text) {
      return NextResponse.json({ error: '请提供音频文件和文案内容' }, { status: 400 });
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBase64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = audioFile.type || 'audio/wav';

    const audioBuffer = await cloneVoice(audioBase64, mimeType, text, style);

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Disposition': 'attachment; filename="cloned_audio.wav"',
      },
    });
  } catch (error: any) {
    console.error('Clone error:', error);
    return NextResponse.json(
      { error: error.message || '声音克隆失败' },
      { status: 500 }
    );
  }
}
