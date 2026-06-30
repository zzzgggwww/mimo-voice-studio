'use client';

import { useState, useRef } from 'react';

type Mode = 'preset' | 'clone' | 'design';

export default function Home() {
  const [text, setText] = useState('');
  const [polishedText, setPolishedText] = useState('');
  const [mode, setMode] = useState<Mode>('preset');
  const [voice, setVoice] = useState('冰糖');
  const [style, setStyle] = useState('');
  const [voiceDescription, setVoiceDescription] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [polishing, setPolishing] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const presetVoices = [
    { id: '冰糖', name: '冰糖', language: '中文', gender: '女性' },
    { id: '茉莉', name: '茉莉', language: '中文', gender: '女性' },
    { id: '苏打', name: '苏打', language: '中文', gender: '男性' },
    { id: '白桦', name: '白桦', language: '中文', gender: '男性' },
    { id: 'Mia', name: 'Mia', language: '英文', gender: '女性' },
    { id: 'Chloe', name: 'Chloe', language: '英文', gender: '女性' },
    { id: 'Milo', name: 'Milo', language: '英文', gender: '男性' },
    { id: 'Dean', name: 'Dean', language: '英文', gender: '男性' },
  ];

  const handlePolish = async () => {
    if (!text.trim()) return;
    setPolishing(true);
    try {
      const response = await fetch('/api/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      if (data.error) {
        alert(data.error);
      } else {
        setPolishedText(data.text);
      }
    } catch (error) {
      alert('润色失败');
    } finally {
      setPolishing(false);
    }
  };

  const handleGenerate = async () => {
    const finalText = polishedText || text;
    if (!finalText.trim()) {
      alert('请先输入文案');
      return;
    }

    setLoading(true);
    try {
      let response;

      if (mode === 'preset') {
        response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: finalText, voice, style }),
        });
      } else if (mode === 'clone') {
        if (!audioFile) {
          alert('请上传音频文件');
          return;
        }
        const formData = new FormData();
        formData.append('audio', audioFile);
        formData.append('text', finalText);
        if (style) formData.append('style', style);
        response = await fetch('/api/clone', {
          method: 'POST',
          body: formData,
        });
      } else {
        if (!voiceDescription.trim()) {
          alert('请描述音色');
          return;
        }
        response = await fetch('/api/design', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ voiceDescription, text: finalText }),
        });
      }

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || '生成失败');
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (error) {
      alert('生成失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = '配音.wav';
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-indigo-900 mb-2">
          配音工坊
        </h1>
        <p className="text-center text-gray-600 mb-8">
          基于小米MiMo的AI配音应用
        </p>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">输入文案</h2>
          <textarea
            className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            placeholder="请输入要配音的文案..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="flex gap-2 mt-4">
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              onClick={handlePolish}
              disabled={polishing || !text.trim()}
            >
              {polishing ? '润色中...' : 'AI润色'}
            </button>
          </div>

          {polishedText && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">润色结果：</h3>
              <p className="text-gray-700">{polishedText}</p>
              <button
                className="mt-2 text-sm text-green-600 hover:text-green-800"
                onClick={() => setText(polishedText)}
              >
                使用此文案
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">选择配音模式</h2>
          <div className="flex gap-4 mb-6">
            <button
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
                mode === 'preset'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setMode('preset')}
            >
              预置音色
            </button>
            <button
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
                mode === 'clone'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setMode('clone')}
            >
              声音克隆
            </button>
            <button
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
                mode === 'design'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setMode('design')}
            >
              声音设计
            </button>
          </div>

          {mode === 'preset' && (
            <div>
              <h3 className="font-medium mb-3">选择音色</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {presetVoices.map((v) => (
                  <button
                    key={v.id}
                    className={`p-3 rounded-lg border-2 transition ${
                      voice === v.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setVoice(v.id)}
                  >
                    <div className="font-medium">{v.name}</div>
                    <div className="text-sm text-gray-500">
                      {v.language} · {v.gender}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === 'clone' && (
            <div>
              <h3 className="font-medium mb-3">上传音频样本</h3>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition cursor-pointer"
                onClick={() => document.getElementById('audioInput')?.click()}
              >
                <input
                  id="audioInput"
                  type="file"
                  accept="audio/mp3,audio/wav"
                  className="hidden"
                  onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                />
                {audioFile ? (
                  <div>
                    <p className="text-green-600 font-medium">{audioFile.name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      点击重新选择
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-500">
                      点击或拖拽上传音频文件
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      支持 MP3、WAV 格式，最大 10MB
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {mode === 'design' && (
            <div>
              <h3 className="font-medium mb-3">描述音色</h3>
              <textarea
                className="w-full h-24 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                placeholder="例如：年轻女性，温柔甜美，语速适中，像邻家小姐姐一样亲切"
                value={voiceDescription}
                onChange={(e) => setVoiceDescription(e.target.value)}
              />
            </div>
          )}

          <div className="mt-4">
            <h3 className="font-medium mb-2">风格控制（可选）</h3>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="例如：开心、悲伤、激动、东北话、粤语..."
              value={style}
              onChange={(e) => setStyle(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex gap-4">
            <button
              className="flex-1 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? '生成中...' : '生成配音'}
            </button>
          </div>

          {audioUrl && (
            <div className="mt-6">
              <audio ref={audioRef} src={audioUrl} controls className="w-full mb-4" />
              <button
                className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
                onClick={handleDownload}
              >
                下载音频
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
