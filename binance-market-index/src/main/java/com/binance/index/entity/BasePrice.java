package com.binance.index.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * 基准价格持久化存储
 * 用于保存每个币种的基准价格，确保重启后不会重新计算
 */
@Entity
@Table(name = "base_price")
public class BasePrice {

    @Id
    @Column(length = 20)
    private String symbol; // 交易对，如 SOLUSDT

    @Column(nullable = false)
    private Double price; // 基准价格

    @Column(nullable = false)
    private LocalDateTime createdAt; // 创建时间

    public BasePrice() {
    }

    public BasePrice(String symbol, Double price) {
        this.symbol = symbol;
        this.price = price;
        this.createdAt = LocalDateTime.now();
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
