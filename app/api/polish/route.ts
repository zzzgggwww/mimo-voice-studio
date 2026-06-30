import { NextRequest, NextResponse } from 'next/server';
import { polishText } from '@/lib/mimo';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: '请提供文案内容' }, { status: 400 });
    }

    const polishedText = await polishText(text);

    return NextResponse.json({ text: polishedText });
  } catch (error: any) {
    console.error('Polish error:', error);
    return NextResponse.json(
      { error: error.message || '润色失败' },
      { status: 500 }
    );
  }
}
