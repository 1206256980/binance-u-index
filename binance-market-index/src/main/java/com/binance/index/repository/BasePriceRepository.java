package com.binance.index.repository;

import com.binance.index.entity.BasePrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * 基准价格数据访问层
 */
@Repository
public interface BasePriceRepository extends JpaRepository<BasePrice, String> {
    // 使用默认方法：findAll(), saveAll(), existsById(), count()
    
    /**
     * 按币种删除基准价格（用于清理下架币种）
     */
    void deleteBySymbol(String symbol);
}
