#!/bin/sh

# 启动后端 (后台运行) - JVM堆内存2G
echo "Starting backend with 2G heap..."
java -Xms512m -Xmx2048m -jar /app/app.jar &

# 等待后端启动
sleep 5

# 启动 nginx (前台运行)
echo "Starting nginx..."
nginx -g "daemon off;"
