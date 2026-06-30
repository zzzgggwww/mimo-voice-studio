# 配音工坊 - AI语音合成应用

基于小米MiMo的AI配音应用，支持文案润色、语音合成、声音克隆和声音设计。

## 功能特性

- **文案润色**: AI智能优化文案，使其更加流畅、生动
- **预置音色**: 8种精选音色（4中文+4英文）
- **声音克隆**: 上传音频样本，克隆任意声音
- **声音设计**: 通过文字描述，生成定制音色
- **风格控制**: 支持情绪、语速、方言等多种风格

## 环境变量配置

在运行项目前，需要创建 `.env.local` 文件并填入 API 密钥：

```bash
# 创建环境变量文件
cp .env.example .env.local
```

编辑 `.env.local`，填入你的 MiMo API Key：

```
MIMO_API_KEY=your-api-key-here
MIMO_BASE_URL=https://token-plan-cn.xiaomimimo.com/v1
```

> **注意**: `.env.local` 包含敏感信息，已被 `.gitignore` 排除，不会提交到 Git 仓库。

## 快速开始

### 启动服务器

```bash
cd voice-app
python3 server.py
```

服务器将在 http://localhost:8080 启动

### 使用方法

1. 打开浏览器访问 http://localhost:8080
2. 输入要配音的文案
3. （可选）点击"AI润色"优化文案
4. 选择配音模式：
   - **预置音色**: 从8种精选音色中选择
   - **声音克隆**: 上传音频样本克隆声音
   - **声音设计**: 描述想要的音色风格
5. （可选）设置风格控制参数
6. 点击"生成配音"
7. 播放或下载生成的音频

## 预置音色列表

| 音色名 | 语言 | 性别 |
|--------|------|------|
| 冰糖 | 中文 | 女性 |
| 茉莉 | 中文 | 女性 |
| 苏打 | 中文 | 男性 |
| 白桦 | 中文 | 男性 |
| Mia | 英文 | 女性 |
| Chloe | 英文 | 女性 |
| Milo | 英文 | 男性 |
| Dean | 英文 | 男性 |

## 风格控制示例

- 情绪: 开心、悲伤、愤怒、激动、平静
- 语速: 快速、慢速、适中
- 方言: 东北话、四川话、粤语
- 角色扮演: 新闻主播、讲故事、解说员

## 技术栈

- **后端**: Python 3 + http.server
- **前端**: HTML5 + CSS3 + JavaScript
- **AI服务**: 小米MiMo TTS API (Token Plan)

## API接口

- `POST /api/polish` - 文案润色
- `POST /api/tts` - 预置音色语音合成
- `POST /api/clone` - 声音克隆
- `POST /api/design` - 声音设计

## 注意事项

- 音频格式支持: MP3、WAV（用于声音克隆）
- 声音克隆音频大小限制: 10MB
- 生成的音频格式: WAV (16-bit, 24kHz, mono)

## 许可证

MIT License
