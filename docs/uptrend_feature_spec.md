# 单边上行涨幅分布功能

## 功能目标
用于马丁做空策略参考，统计币种的单边上涨波段分布，帮助判断市场上涨力度。

## 核心算法：位置比率法 + 横盘检测

### 波段结束条件（满足任一即结束）
1. **位置比率 < keepRatio（默认75%）**
   - 位置比率 = (当前收盘价 - 波段起点) / (波段最高价 - 波段起点)
   - 低于75%表示涨幅回吐超过25%
   
2. **横盘检测：连续 N 根K线未创新高（默认6根）**
   - 说明涨势已停滞

### 波段起点判定
- 使用 `closePrice` 判断创新低，新低重置波段起点
- 波段结束后，回溯找 `wavePeakTime` 之后的最低点作为新波段起点

### 重要细节
- **创新高的K线不检查位置比率**：因为上影线会导致收盘价 < 最高价，这是正常现象，不应触发结束
- 波段涨幅 < `minUptrend`（默认4%）的小波段被过滤
- 时间自动对齐到5分钟边界（向下取整）

## API 接口
```
GET /api/index/uptrend-distribution
参数：
- hours: 相对时间范围（默认168小时=7天）
- start/end: 自定义时间范围（格式：yyyy-MM-dd HH:mm）
- keepRatio: 保留比率阈值（默认0.75）
- noNewHighCandles: 横盘检测K线数（默认6）
- minUptrend: 最小涨幅过滤（默认4%）
```

## 前端功能
- 时间范围选择（预设/自定义）
- 直方图展示涨幅分布
- 排行榜按涨幅排序
- 点击📊查看单个币种所有历史波段
- 返回按钮回到全部排行

## 关键代码位置
- 后端算法：`IndexCalculatorService.calculateSymbolAllWaves()`
- API控制器：`IndexController.getUptrendDistribution()`
- 前端组件：`UptrendModule.jsx`
