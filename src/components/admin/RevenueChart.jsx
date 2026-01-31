import { useState } from 'react'
import './RevenueChart.css'

export default function RevenueChart({ data = [], period = 'month' }) {
    const [hoveredIndex, setHoveredIndex] = useState(null)

    const chartData = data.length > 0 ? data : [
        { label: 'Янв', revenue: 450000, subscriptions: 320000, promotions: 130000 },
        { label: 'Фев', revenue: 520000, subscriptions: 380000, promotions: 140000 },
        { label: 'Мар', revenue: 480000, subscriptions: 350000, promotions: 130000 },
        { label: 'Апр', revenue: 610000, subscriptions: 420000, promotions: 190000 },
        { label: 'Май', revenue: 580000, subscriptions: 400000, promotions: 180000 },
        { label: 'Июн', revenue: 720000, subscriptions: 500000, promotions: 220000 },
        { label: 'Июл', revenue: 680000, subscriptions: 480000, promotions: 200000 }
    ]

    const maxRevenue = Math.max(...chartData.map(d => d.revenue || 0), 1)

    const totalRevenue = chartData.reduce((sum, d) => sum + (d.revenue || 0), 0)
    const totalSubscriptions = chartData.reduce((sum, d) => sum + (d.subscriptions || 0), 0)
    const totalPromotions = chartData.reduce((sum, d) => sum + (d.promotions || 0), 0)

    return (
        <div className="revenue-chart">
            <div className="chart-header">
                <h3>Выручка</h3>
                <div className="chart-totals">
                    <span className="total-amount">₸{totalRevenue.toLocaleString()}</span>
                    <span className="total-label">за период</span>
                </div>
            </div>

            <div className="chart-legend">
                <div className="legend-item subscriptions">
                    <span className="legend-dot"></span>
                    <span>Подписки</span>
                    <span className="legend-value">₸{totalSubscriptions.toLocaleString()}</span>
                </div>
                <div className="legend-item promotions">
                    <span className="legend-dot"></span>
                    <span>Продвижение</span>
                    <span className="legend-value">₸{totalPromotions.toLocaleString()}</span>
                </div>
            </div>

            <div className="chart-container">
                <div className="chart-bars">
                    {chartData.map((item, index) => (
                        <div
                            key={index}
                            className="bar-group"
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <div className="stacked-bar">
                                <div
                                    className="bar-segment subscriptions"
                                    style={{ 
                                        height: `${((item.subscriptions || 0) / maxRevenue) * 100}%` 
                                    }}
                                />
                                <div
                                    className="bar-segment promotions"
                                    style={{ 
                                        height: `${((item.promotions || 0) / maxRevenue) * 100}%` 
                                    }}
                                />
                            </div>
                            <span className="bar-label">{item.label}</span>

                            {hoveredIndex === index && (
                                <div className="bar-tooltip">
                                    <div className="tooltip-row">
                                        <span>Всего:</span>
                                        <strong>₸{(item.revenue || 0).toLocaleString()}</strong>
                                    </div>
                                    <div className="tooltip-row">
                                        <span>Подписки:</span>
                                        <span>₸{(item.subscriptions || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="tooltip-row">
                                        <span>Продвижение:</span>
                                        <span>₸{(item.promotions || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
