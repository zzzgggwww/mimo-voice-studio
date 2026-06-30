import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '配音工坊 - AI语音合成',
  description: '基于小米MiMo的AI配音应用',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
