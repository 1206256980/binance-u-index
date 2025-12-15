package com.binance.index.dto;

import java.util.List;

/**
 * 涨幅分布区间数据
 */
public class DistributionBucket {

    private String range; // 区间名称，如 "-10%~-5%"
    private int count; // 该区间币种数量
    private List<String> coins; // 该区间的币种列表（向后兼容）
    private List<CoinDetail> coinDetails; // 带涨跌幅的币种详情

    /**
     * 币种详情（包含涨跌幅）
     */
    public static class CoinDetail {
        private String symbol; // 币种名称
        private double changePercent; // 涨跌幅

        public CoinDetail() {
        }

        public CoinDetail(String symbol, double changePercent) {
            this.symbol = symbol;
            this.changePercent = changePercent;
        }

        public String getSymbol() {
            return symbol;
        }

        public void setSymbol(String symbol) {
            this.symbol = symbol;
        }

        public double getChangePercent() {
            return changePercent;
        }

        public void setChangePercent(double changePercent) {
            this.changePercent = changePercent;
        }
    }

    public DistributionBucket() {
    }

    public DistributionBucket(String range, int count, List<String> coins) {
        this.range = range;
        this.count = count;
        this.coins = coins;
    }

    public DistributionBucket(String range, int count, List<String> coins, List<CoinDetail> coinDetails) {
        this.range = range;
        this.count = count;
        this.coins = coins;
        this.coinDetails = coinDetails;
    }

    public String getRange() {
        return range;
    }

    public void setRange(String range) {
        this.range = range;
    }

    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }

    public List<String> getCoins() {
        return coins;
    }

    public void setCoins(List<String> coins) {
        this.coins = coins;
    }

    public List<CoinDetail> getCoinDetails() {
        return coinDetails;
    }

    public void setCoinDetails(List<CoinDetail> coinDetails) {
        this.coinDetails = coinDetails;
    }
}
