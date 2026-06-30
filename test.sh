#!/bin/bash
echo "测试配音工坊API..."
echo ""

# 测试首页
echo "1. 测试首页..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080)
if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✓ 首页正常 (HTTP 200)"
else
    echo "   ✗ 首页异常 (HTTP $HTTP_CODE)"
    exit 1
fi

# 测试文案润色
echo "2. 测试文案润色..."
RESULT=$(curl -s -X POST http://localhost:8080/api/polish \
    -H "Content-Type: application/json" \
    -d '{"text": "测试文案"}')
if echo "$RESULT" | grep -q "text"; then
    echo "   ✓ 文案润色正常"
else
    echo "   ✗ 文案润色失败"
    echo "   错误: $RESULT"
fi

# 测试预置音色
echo "3. 测试预置音色..."
curl -s -X POST http://localhost:8080/api/tts \
    -H "Content-Type: application/json" \
    -d '{"text": "测试", "voice": "冰糖"}' \
    -o /tmp/test_tts.wav 2>/dev/null
if [ -f /tmp/test_tts.wav ] && [ -s /tmp/test_tts.wav ]; then
    echo "   ✓ 预置音色正常"
    rm /tmp/test_tts.wav
else
    echo "   ✗ 预置音色失败"
fi

# 测试声音设计
echo "4. 测试声音设计..."
curl -s -X POST http://localhost:8080/api/design \
    -H "Content-Type: application/json" \
    -d '{"voiceDescription": "年轻女性", "text": "测试"}' \
    -o /tmp/test_design.wav 2>/dev/null
if [ -f /tmp/test_design.wav ] && [ -s /tmp/test_design.wav ]; then
    echo "   ✓ 声音设计正常"
    rm /tmp/test_design.wav
else
    echo "   ✗ 声音设计失败"
fi

echo ""
echo "测试完成！"
