package com.binance.index.dto;

import java.util.List;

/**
 * 单边上行涨幅分布响应数据
 */
public class UptrendData {

    private long timestamp;              // 时间戳
    private int totalCoins;              // 总币种数
    private double pullbackThreshold;    // 回调阈值（如5表示5%）
    private double avgUptrend;           // 平均单边涨幅
    private double maxUptrend;           // 最大单边涨幅
    private int ongoingCount;            // 进行中波段数量
    private List<UptrendBucket> distribution;     // 分布数据
    private List<CoinUptrend> allCoinsRanking;    // 全部币种排行

    /**
     * 单个币种的单边涨幅数据
     */
    public static class CoinUptrend {
        private String symbol;            // 币种
        private double uptrendPercent;    // 最大单边涨幅
        private boolean ongoing;          // 是否进行中
        private long waveStartTime;       // 波段起始时间戳
        private long waveEndTime;         // 波段到达最高点的时间戳
        private double startPrice;        // 起始价格
        private double peakPrice;         // 最高价格

        public CoinUptrend() {}

        public CoinUptrend(String symbol, double uptrendPercent, boolean ongoing, 
                          long waveStartTime, long waveEndTime, 
                          double startPrice, double peakPrice) {
            this.symbol = symbol;
            this.uptrendPercent = uptrendPercent;
            this.ongoing = ongoing;
            this.waveStartTime = waveStartTime;
            this.waveEndTime = waveEndTime;
            this.startPrice = startPrice;
            this.peakPrice = peakPrice;
        }

        public String getSymbol() { return symbol; }
        public void setSymbol(String symbol) { this.symbol = symbol; }

        public double getUptrendPercent() { return uptrendPercent; }
        public void setUptrendPercent(double uptrendPercent) { this.uptrendPercent = uptrendPercent; }

        public boolean isOngoing() { return ongoing; }
        public void setOngoing(boolean ongoing) { this.ongoing = ongoing; }

        public long getWaveStartTime() { return waveStartTime; }
        public void setWaveStartTime(long waveStartTime) { this.waveStartTime = waveStartTime; }

        public long getWaveEndTime() { return waveEndTime; }
        public void setWaveEndTime(long waveEndTime) { this.waveEndTime = waveEndTime; }

        public double getStartPrice() { return startPrice; }
        public void setStartPrice(double startPrice) { this.startPrice = startPrice; }

        public double getPeakPrice() { return peakPrice; }
        public void setPeakPrice(double peakPrice) { this.peakPrice = peakPrice; }
    }

    /**
     * 单边涨幅分布区间
     */
    public static class UptrendBucket {
        private String range;              // 区间名称，如 "5%~10%"
        private int count;                 // 该区间币种数量
        private int ongoingCount;          // 该区间进行中数量
        private List<CoinUptrend> coins;   // 该区间币种详情

        public UptrendBucket() {}

        public UptrendBucket(String range, int count, int ongoingCount, List<CoinUptrend> coins) {
            this.range = range;
            this.count = count;
            this.ongoingCount = ongoingCount;
            this.coins = coins;
        }

        public String getRange() { return range; }
        public void setRange(String range) { this.range = range; }

        public int getCount() { return count; }
        public void setCount(int count) { this.count = count; }

        public int getOngoingCount() { return ongoingCount; }
        public void setOngoingCount(int ongoingCount) { this.ongoingCount = ongoingCount; }

        public List<CoinUptrend> getCoins() { return coins; }
        public void setCoins(List<CoinUptrend> coins) { this.coins = coins; }
    }

    public UptrendData() {}

    public long getTimestamp() { return timestamp; }
    public void setTimestamp(long timestamp) { this.timestamp = timestamp; }

    public int getTotalCoins() { return totalCoins; }
    public void setTotalCoins(int totalCoins) { this.totalCoins = totalCoins; }

    public double getPullbackThreshold() { return pullbackThreshold; }
    public void setPullbackThreshold(double pullbackThreshold) { this.pullbackThreshold = pullbackThreshold; }

    public double getAvgUptrend() { return avgUptrend; }
    public void setAvgUptrend(double avgUptrend) { this.avgUptrend = avgUptrend; }

    public double getMaxUptrend() { return maxUptrend; }
    public void setMaxUptrend(double maxUptrend) { this.maxUptrend = maxUptrend; }

    public int getOngoingCount() { return ongoingCount; }
    public void setOngoingCount(int ongoingCount) { this.ongoingCount = ongoingCount; }

    public List<UptrendBucket> getDistribution() { return distribution; }
    public void setDistribution(List<UptrendBucket> distribution) { this.distribution = distribution; }

    public List<CoinUptrend> getAllCoinsRanking() { return allCoinsRanking; }
    public void setAllCoinsRanking(List<CoinUptrend> allCoinsRanking) { this.allCoinsRanking = allCoinsRanking; }
}
