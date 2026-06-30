#!/bin/bash
echo "正在启动配音工坊..."
echo ""

# 检查是否已有服务器在运行
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "警告: 端口 8080 已被占用"
    echo "正在停止现有进程..."
    pkill -f "python3 server.py" 2>/dev/null
    sleep 1
fi

# 启动服务器
echo "启动服务器..."
python3 server.py &
SERVER_PID=$!

sleep 2

# 检查服务器是否启动成功
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 | grep -q "200"; then
    echo ""
    echo "=========================================="
    echo "  配音工坊启动成功！"
    echo "=========================================="
    echo ""
    echo "  访问地址: http://localhost:8080"
    echo ""
    echo "  功能说明:"
    echo "  - 文案润色: AI智能优化文案"
    echo "  - 预置音色: 8种精选音色"
    echo "  - 声音克隆: 上传音频克隆声音"
    echo "  - 声音设计: 描述生成定制音色"
    echo ""
    echo "  按 Ctrl+C 停止服务器"
    echo "=========================================="
    echo ""
    
    # 等待用户中断
    wait $SERVER_PID
else
    echo "错误: 服务器启动失败"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi
