#!/usr/bin/env python3
import http.server
import json
import urllib.request
import urllib.error
import base64
import os
import sys
from urllib.parse import parse_qs, urlparse

MIMO_API_KEY = "tp-cys0wx3iyga3aheyaanh2cov9k27xjuwx9gqw8m9gh44sz9d"
MIMO_BASE_URL = "https://token-plan-cn.xiaomimimo.com/v1"

class VoiceAppHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/' or self.path == '/index.html':
            self.path = '/index.html'
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

    def do_POST(self):
        if self.path == '/api/polish':
            self.handle_polish()
        elif self.path == '/api/tts':
            self.handle_tts()
        elif self.path == '/api/clone':
            self.handle_clone()
        elif self.path == '/api/design':
            self.handle_design()
        else:
            self.send_error(404, "Not Found")

    def handle_polish(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))

            text = data.get('text', '')
            if not text:
                self.send_json_error(400, "请提供文案内容")
                return

            result = self.call_mimo_llm(text)
            self.send_json_response({"text": result})
        except Exception as e:
            self.send_json_error(500, str(e))

    def handle_tts(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))

            text = data.get('text', '')
            voice = data.get('voice', '冰糖')
            style = data.get('style', '')

            if not text:
                self.send_json_error(400, "请提供文案内容")
                return

            audio_data = self.call_mimo_tts(text, voice, style)
            self.send_audio_response(audio_data)
        except Exception as e:
            self.send_json_error(500, str(e))

    def handle_clone(self):
        try:
            content_type = self.headers['Content-Type']
            if 'multipart/form-data' not in content_type:
                self.send_json_error(400, "需要multipart/form-data格式")
                return

            boundary = content_type.split('boundary=')[1]
            content_length = int(self.headers['Content-Length'])
            body = self.rfile.read(content_length)

            parts = body.split(('--' + boundary).encode())
            form_data = {}

            for part in parts:
                if b'Content-Disposition' in part:
                    headers, content = part.split(b'\r\n\r\n', 1)
                    content = content.rstrip(b'\r\n')

                    if b'name="audio"' in headers:
                        filename = headers.decode().split('filename="')[1].split('"')[0] if 'filename=' in headers.decode() else 'audio.wav'
                        mime_type = 'audio/wav' if filename.endswith('.wav') else 'audio/mpeg'
                        form_data['audio'] = {
                            'data': base64.b64encode(content).decode('utf-8'),
                            'mime': mime_type
                        }
                    elif b'name="text"' in headers:
                        form_data['text'] = content.decode('utf-8')
                    elif b'name="style"' in headers:
                        form_data['style'] = content.decode('utf-8')

            if 'audio' not in form_data or 'text' not in form_data:
                self.send_json_error(400, "请提供音频文件和文案内容")
                return

            audio_data = self.call_mimo_clone(
                form_data['audio']['data'],
                form_data['audio']['mime'],
                form_data['text'],
                form_data.get('style', '')
            )
            self.send_audio_response(audio_data)
        except Exception as e:
            self.send_json_error(500, str(e))

    def handle_design(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))

            voice_desc = data.get('voiceDescription', '')
            text = data.get('text', '')

            if not voice_desc or not text:
                self.send_json_error(400, "请提供音色描述和文案内容")
                return

            audio_data = self.call_mimo_design(voice_desc, text)
            self.send_audio_response(audio_data)
        except Exception as e:
            self.send_json_error(500, str(e))

    def call_mimo_llm(self, text):
        url = f"{MIMO_BASE_URL}/chat/completions"
        payload = {
            "model": "mimo-v2.5-pro",
            "messages": [
                {
                    "role": "system",
                    "content": "你是一位专业的文案润色专家。请帮助用户优化文案，使其更加流畅、生动、专业。保持原意的同时，提升文案的表达效果。只返回润色后的文案，不要添加解释。"
                },
                {
                    "role": "user",
                    "content": f"请润色以下文案：\n\n{text}"
                }
            ],
            "max_tokens": 2048,
            "temperature": 0.7
        }

        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers={
                'Content-Type': 'application/json',
                'api-key': MIMO_API_KEY
            }
        )

        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result['choices'][0]['message']['content']

    def call_mimo_tts(self, text, voice, style=''):
        url = f"{MIMO_BASE_URL}/chat/completions"
        messages = []

        if style:
            messages.append({"role": "user", "content": style})

        messages.append({"role": "assistant", "content": text})

        payload = {
            "model": "mimo-v2.5-tts",
            "messages": messages,
            "audio": {
                "format": "wav",
                "voice": voice
            }
        }

        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers={
                'Content-Type': 'application/json',
                'api-key': MIMO_API_KEY
            }
        )

        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            audio_b64 = result['choices'][0]['message']['audio']['data']
            return base64.b64decode(audio_b64)

    def call_mimo_clone(self, audio_b64, mime_type, text, style=''):
        url = f"{MIMO_BASE_URL}/chat/completions"
        messages = []

        if style:
            messages.append({"role": "user", "content": style})
        else:
            messages.append({"role": "user", "content": ""})

        messages.append({"role": "assistant", "content": text})

        payload = {
            "model": "mimo-v2.5-tts-voiceclone",
            "messages": messages,
            "audio": {
                "format": "wav",
                "voice": f"data:{mime_type};base64,{audio_b64}"
            }
        }

        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers={
                'Content-Type': 'application/json',
                'api-key': MIMO_API_KEY
            }
        )

        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            audio_b64 = result['choices'][0]['message']['audio']['data']
            return base64.b64decode(audio_b64)

    def call_mimo_design(self, voice_desc, text):
        url = f"{MIMO_BASE_URL}/chat/completions"
        payload = {
            "model": "mimo-v2.5-tts-voicedesign",
            "messages": [
                {"role": "user", "content": voice_desc},
                {"role": "assistant", "content": text}
            ],
            "audio": {
                "format": "wav",
                "optimize_text_preview": True
            }
        }

        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers={
                'Content-Type': 'application/json',
                'api-key': MIMO_API_KEY
            }
        )

        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            audio_b64 = result['choices'][0]['message']['audio']['data']
            return base64.b64decode(audio_b64)

    def send_json_response(self, data):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))

    def send_json_error(self, code, message):
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({"error": message}, ensure_ascii=False).encode('utf-8'))

    def send_audio_response(self, audio_data):
        self.send_response(200)
        self.send_header('Content-Type', 'audio/wav')
        self.send_header('Content-Disposition', 'attachment; filename="audio.wav"')
        self.send_header('Content-Length', str(len(audio_data)))
        self.end_headers()
        self.wfile.write(audio_data)

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    server = http.server.HTTPServer(('0.0.0.0', 8080), VoiceAppHandler)
    print("配音工坊启动在 http://localhost:8080")
    server.serve_forever()
