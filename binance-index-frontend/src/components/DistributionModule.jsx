import { useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'
import ReactECharts from 'echarts-for-react'

// 时间选项配置
const TIME_OPTIONS = [
    { label: '15分钟', value: 0.25 },
    { label: '1小时', value: 1 },
    { label: '2小时', value: 2 },
    { label: '6小时', value: 6 },
    { label: '12小时', value: 12 },
    { label: '1天', value: 24 },
    { label: '3天', value: 72 },
    { label: '7天', value: 168 }
]

function DistributionModule() {
    const [timeBase, setTimeBase] = useState(168) // 默认7天
    const [distributionData, setDistributionData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [selectedBucket, setSelectedBucket] = useState(null) // 选中的区间
    const [copiedSymbol, setCopiedSymbol] = useState(null) // 复制提示
    const chartRef = useRef(null)

    // 获取分布数据
    const fetchDistribution = useCallback(async () => {
        setLoading(true)
        setSelectedBucket(null) // 切换时间时关闭面板
        try {
            const res = await axios.get(`/api/index/distribution?hours=${timeBase}`)
            if (res.data.success) {
                setDistributionData(res.data.data)
            }
        } catch (err) {
            console.error('获取分布数据失败:', err)
        }
        setLoading(false)
    }, [timeBase])

    useEffect(() => {
        fetchDistribution()
    }, [fetchDistribution])

    // 复制币种名称
    const handleCopySymbol = async (symbol) => {
        try {
            await navigator.clipboard.writeText(symbol)
            setCopiedSymbol(symbol)
            setTimeout(() => setCopiedSymbol(null), 1500)
        } catch (err) {
            console.error('复制失败:', err)
        }
    }

    // 关闭排行榜面板
    const closePanel = () => {
        setSelectedBucket(null)
    }

    // 图表点击事件
    const onChartClick = (params) => {
        if (!distributionData || !distributionData.distribution) return
        const bucket = distributionData.distribution[params.dataIndex]
        if (bucket && bucket.count > 0) {
            setSelectedBucket(bucket)
        }
    }

    // 直方图配置
    const getHistogramOption = () => {
        if (!distributionData || !distributionData.distribution) {
            return {}
        }

        const distribution = distributionData.distribution
        const ranges = distribution.map(d => d.range)
        const counts = distribution.map(d => d.count)

        // 根据区间设置颜色
        const colors = distribution.map(d => {
            const range = d.range
            if (range.includes('<') || (range.includes('-') && !range.startsWith('-5') && !range.startsWith('0'))) {
                // 负值区间用红色
                if (range.includes('-50') || range.includes('-45') || range.includes('-40') ||
                    range.includes('-35') || range.includes('-30') || range.includes('-25') ||
                    range.includes('-20') || range.includes('-15') || range.includes('-10') ||
                    range.includes('-5%~0%')) {
                    return '#ef4444'
                }
            }
            if (range.includes('>') || range.startsWith('0%~') || range.startsWith('5') ||
                range.startsWith('10') || range.startsWith('15') || range.startsWith('20') ||
                range.startsWith('25') || range.startsWith('30') || range.startsWith('35') ||
                range.startsWith('40') || range.startsWith('45')) {
                return '#10b981'
            }
            return '#64748b'
        })

        return {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(22, 27, 34, 0.95)',
                borderColor: 'rgba(99, 102, 241, 0.3)',
                textStyle: { color: '#f1f5f9' },
                confine: true,
                formatter: function (params) {
                    if (!params || params.length === 0) return ''
                    const param = params[0]
                    const bucket = distribution[param.dataIndex]
                    return `<div style="padding: 8px;">
                        <div style="font-weight: 600; margin-bottom: 4px;">${bucket.range}</div>
                        <div>币种数量: <span style="color: #6366f1; font-weight: 600;">${bucket.count}</span></div>
                        <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">点击查看详情</div>
                    </div>`
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                top: '10%',
                bottom: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: ranges,
                axisLabel: {
                    color: '#64748b',
                    rotate: 45,
                    fontSize: 10
                },
                axisLine: { lineStyle: { color: 'rgba(100, 116, 139, 0.2)' } }
            },
            yAxis: {
                type: 'value',
                name: '币种数',
                nameTextStyle: { color: '#64748b' },
                axisLabel: { color: '#64748b' },
                splitLine: { lineStyle: { color: 'rgba(100, 116, 139, 0.1)' } }
            },
            series: [{
                type: 'bar',
                data: counts.map((count, index) => ({
                    value: count,
                    itemStyle: {
                        color: colors[index],
                        cursor: count > 0 ? 'pointer' : 'default'
                    },
                    // 当柱子有值但太小时，显示一个标记
                    label: count > 0 && count <= Math.max(...counts) * 0.02 ? {
                        show: true,
                        position: 'top',
                        formatter: '{c}',
                        color: colors[index],
                        fontSize: 10,
                        fontWeight: 'bold'
                    } : { show: false }
                })),
                barWidth: '60%',
                barMinHeight: 4  // 最小柱子高度为4像素，确保小值也可见
            }]
        }
    }

    return (
        <div className="distribution-module">
            {/* 时间选择器 */}
            <div className="distribution-header">
                <div className="distribution-title">📊 涨幅分布分析</div>
                <div className="time-base-selector">
                    <span className="label">基准时间:</span>
                    {TIME_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            className={`time-btn ${timeBase === opt.value ? 'active' : ''}`}
                            onClick={() => setTimeBase(opt.value)}
                        >
                            {opt.label}
                        </button>
                    ))}
                    {loading && <span className="loading-text">加载中...</span>}
                </div>
            </div>

            {/* 涨跌统计 */}
            {distributionData && (
                <div className="distribution-stats">
                    <div className="stat-item up">
                        <span className="icon">📈</span>
                        <span className="label">上涨币种</span>
                        <span className="value">{distributionData.upCount}</span>
                        <span className="percent">({((distributionData.upCount / distributionData.totalCoins) * 100).toFixed(1)}%)</span>
                    </div>
                    <div className="stat-item down">
                        <span className="icon">📉</span>
                        <span className="label">下跌币种</span>
                        <span className="value">{distributionData.downCount}</span>
                        <span className="percent">({((distributionData.downCount / distributionData.totalCoins) * 100).toFixed(1)}%)</span>
                    </div>
                    <div className="stat-item total">
                        <span className="icon">🪙</span>
                        <span className="label">总币种</span>
                        <span className="value">{distributionData.totalCoins}</span>
                    </div>
                </div>
            )}

            {/* 直方图 + 排行榜面板 */}
            <div className="distribution-charts">
                <div className={`chart-section ${selectedBucket ? 'with-panel' : ''}`}>
                    <div className="section-title">涨幅分布直方图 <span style={{ fontSize: '12px', color: '#64748b' }}>(点击柱子查看详情)</span></div>
                    {distributionData ? (
                        <ReactECharts
                            ref={chartRef}
                            option={getHistogramOption()}
                            style={{ height: '300px', width: '100%' }}
                            opts={{ renderer: 'canvas' }}
                            onEvents={{ click: onChartClick }}
                        />
                    ) : (
                        <div className="chart-loading">加载中...</div>
                    )}
                </div>

                {/* 排行榜滑出面板 */}
                <div className={`ranking-panel ${selectedBucket ? 'open' : ''}`}>
                    {selectedBucket && (
                        <>
                            <div className="ranking-header">
                                <div className="ranking-title">
                                    <span className="range-badge">{selectedBucket.range}</span>
                                    <span className="coin-count">{selectedBucket.count} 个币种</span>
                                </div>
                                <button className="close-btn" onClick={closePanel}>✕</button>
                            </div>
                            <div className="ranking-list">
                                {(selectedBucket.coinDetails || []).map((coin, index) => (
                                    <div
                                        key={coin.symbol}
                                        className="ranking-item"
                                        onClick={() => handleCopySymbol(coin.symbol)}
                                        title="点击复制"
                                    >
                                        <span className="rank">{index + 1}</span>
                                        <span className="symbol">{coin.symbol.replace('USDT', '')}</span>
                                        <span className={`change ${coin.changePercent >= 0 ? 'positive' : 'negative'}`}>
                                            {coin.changePercent >= 0 ? '+' : ''}{coin.changePercent.toFixed(2)}%
                                        </span>
                                        {copiedSymbol === coin.symbol && (
                                            <span className="copied-tip">已复制!</span>
                                        )}
                                    </div>
                                ))}
                                {(!selectedBucket.coinDetails || selectedBucket.coinDetails.length === 0) && (
                                    <div className="no-data">暂无数据</div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default DistributionModule
