# 币安 U本位市场指数

实时监控币安U本位合约整体市场走势，通过计算所有山寨币（不含BTC、ETH等）的简单平均涨跌幅，生成一个综合市场指数。

## 功能特性

- 📊 **实时市场指数** - 折线图展示市场走势
- 💰 **成交额走势** - 展示5分钟维度的市场成交额变化
- ⏰ **每5分钟自动采集** - 定时获取最新市场数据
- 📅 **多时间维度** - 支持6小时/12小时/1天/3天/7天/14天/21天/30天/60天/120天/180天
- 🚀 **自动历史回补** - 启动时自动回补7天历史数据
- 📈 **统计卡片** - 显示当前指数、24小时/3天/7天/30天变化及最高最低值
- 🎨 **现代暗色主题** - 美观的用户界面

---

## 核心逻辑说明

### 1. 指数计算原理

**基准价格**：以回补起始时间（默认7天前）各币种的开盘价作为基准价格。

**涨跌幅计算**：
```
涨跌幅 = (当前价格 - 基准价格) / 基准价格 × 100%
```

**市场指数**：所有有效币种涨跌幅的简单平均值。

```java
// 核心计算逻辑
double indexValue = totalChange / validCount;  // 简单平均
```

### 2. 数据采集方式

| 场景 | 数据来源 | 成交额类型 |
|------|---------|-----------|
| 历史回补 | K线接口 (串行) | 5分钟成交额 ✅ |
| 实时采集 | K线接口 (100并发) | 5分钟成交额 ✅ |

**并发获取K线**：实时采集时使用 `CompletableFuture` 并发获取所有币种的最新5分钟K线，避免使用24h ticker的成交额（那是24小时累计值，不是5分钟成交额）。

```java
// 并发获取所有币种的最新K线
List<CompletableFuture<KlineData>> futures = symbols.stream()
    .map(symbol -> CompletableFuture.supplyAsync(
        () -> binanceApiService.getLatestKline(symbol),
        executorService))
    .collect(Collectors.toList());
```

### 3. 新币种处理

当实时采集时发现某个币种没有基准价格（新上市的币种），自动将当前价格设为基准价格：

```java
if (basePrice == null || basePrice <= 0) {
    basePrices.put(symbol, kline.getClosePrice());
    log.info("新币种 {} 设置基准价格: {}", symbol, kline.getClosePrice());
    continue; // 第一次跳过，下次开始参与计算
}
```

### 4. 数据重叠防护

防止回补数据和实时采集数据重叠：

```java
// 采集前检查
if (marketIndexRepository.existsByTimestamp(alignedTime)) {
    log.debug("时间点 {} 已存在数据，跳过", alignedTime);
    return null;
}

// 采集后再次检查（双重保护）
if (marketIndexRepository.existsByTimestamp(alignedTime)) {
    log.debug("时间点 {} 已存在数据（并发写入），跳过", alignedTime);
    return null;
}
```

### 5. 部署建议

回补7天数据约需3分钟，建议在 `X:00` 或 `X:05` 整点部署，确保回补完成后能衔接下一个5分钟采集点。

---

## 快速开始

### Docker 部署（推荐）

```bash
# 拉取镜像
docker pull ghcr.io/你的用户名/仓库名:latest

# 运行
docker run -d \
  --name binance-index \
  -p 80:80 \
  -v binance-index-data:/app/data \
  ghcr.io/你的用户名/仓库名:latest
```

访问 `http://localhost` 即可。

### 本地开发

**后端：**
```bash
cd binance-market-index
mvn spring-boot:run
```

**前端：**
```bash
cd binance-index-frontend
npm install
npm run dev
```

---

## 项目结构

```
├── binance-market-index/           # 后端 (Spring Boot)
│   ├── src/main/java/com/binance/index/
│   │   ├── config/                 # 配置类
│   │   │   └── HttpClientConfig.java  # OkHttp + 线程池配置
│   │   ├── controller/             # API 控制器
│   │   │   └── IndexController.java   # REST API
│   │   ├── dto/                    # 数据传输对象
│   │   │   ├── KlineData.java         # K线数据
│   │   │   ├── TickerData.java        # 行情数据
│   │   │   └── IndexDataPoint.java    # 指数数据点
│   │   ├── entity/                 # JPA 实体
│   │   │   └── MarketIndex.java       # 市场指数实体
│   │   ├── repository/             # 数据访问层
│   │   │   └── MarketIndexRepository.java
│   │   ├── scheduler/              # 定时任务
│   │   │   └── DataCollectorScheduler.java  # 回补 + 采集调度
│   │   └── service/                # 业务逻辑
│   │       ├── BinanceApiService.java    # 币安 API 调用
│   │       └── IndexCalculatorService.java  # 指数计算核心
│   └── resources/
│       └── application.properties  # 配置文件
├── binance-index-frontend/         # 前端 (Vite + React)
│   ├── src/
│   │   ├── App.jsx                 # 主组件
│   │   ├── App.css                 # 样式
│   │   └── components/
│   │       ├── IndexChart.jsx      # 指数走势图
│   │       ├── VolumeChart.jsx     # 成交额走势图
│   │       ├── StatsCard.jsx       # 统计卡片
│   │       └── TimeRangeSelector.jsx  # 时间选择器
│   └── package.json
├── Dockerfile                      # 多阶段构建
├── nginx.conf                      # Nginx 反向代理
├── start.sh                        # 容器启动脚本
└── .github/workflows/              # CI/CD
```

---

## 配置说明

主要配置在 `binance-market-index/src/main/resources/application.properties`：

```properties
# 服务器端口
server.port=8080

# H2 数据库（文件模式，持久化）
spring.datasource.url=jdbc:h2:file:./data/market-index

# 币安 API 配置
binance.api.base-url=https://fapi.binance.com
binance.api.request-interval-ms=10          # 串行请求间隔（毫秒）
binance.api.concurrent-threads=100          # 并发线程数

# 指数计算配置
index.backfill.days=7                        # 历史回补天数
index.collect.interval-minutes=5             # 采集间隔（分钟）
index.exclude-symbols=BTCUSDT,ETHUSDT,PAXGUSDT,BNBUSDT  # 排除的币种
```

---

## 数据持久化

使用 Docker Volume 挂载 `/app/data` 目录可持久化数据：

```bash
docker run -v binance-index-data:/app/data ...
```

即使不挂载，每次启动也会自动回补7天历史数据。

---

## API 接口

| 接口 | 说明 | 参数 |
|------|------|------|
| `GET /api/index/current` | 获取当前指数 | - |
| `GET /api/index/history` | 获取历史数据 | `hours` (默认168) |
| `GET /api/index/stats` | 获取统计信息 | - |

### `/api/index/stats` 返回示例

```json
{
  "success": true,
  "stats": {
    "current": -3.42,
    "coinCount": 521,
    "lastUpdate": 1734170400000,
    "change24h": 0.52,
    "high24h": 2.50,
    "low24h": 1.80,
    "change3d": 1.23,
    "high3d": 3.00,
    "low3d": 0.50,
    "change7d": 2.35,
    "high7d": 4.20,
    "low7d": -0.30,
    "change30d": 5.67,
    "high30d": 8.00,
    "low30d": -2.00
  }
}
```

---

## 技术栈

| 层 | 技术 |
|---|------|
| 后端 | Spring Boot 3.2, Java 17, H2 Database, OkHttp |
| 前端 | React 18, Vite 5, ECharts, Axios |
| 部署 | Docker (多阶段构建), Nginx |

---

## License

MIT
