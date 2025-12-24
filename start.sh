#!/bin/sh

# 启动后端 (后台运行) - JVM堆内存6G
echo "Starting backend with 6G heap..."
java -Xms2g -Xmx6g -jar /app/app.jar &

# 等待后端启动
sleep 5

# 启动 nginx (前台运行)
echo "Starting nginx..."
nginx -g "daemon off;"
