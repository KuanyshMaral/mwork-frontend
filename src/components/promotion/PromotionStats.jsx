import { useState, useEffect } from 'react'
import { promotionApi } from '../../api/client'
import './PromotionStats.css'

export default function PromotionStats({ promotionId }) {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        loadStats()
    }, [promotionId])

    const loadStats = async () => {
        setLoading(true)
        try {
            const data = await promotionApi.getStats(promotionId)
            setStats(data)
        } catch (err) {
            setError(err.message || 'Failed to load stats')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="promotion-stats loading">
                <div className="loading-spinner"></div>
                <p>Загрузка статистики...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="promotion-stats error">
                <p>Ошибка загрузки статистики: {error}</p>
                <button onClick={loadStats} className="btn btn-sm btn-outline">
                    Попробовать снова
                </button>
            </div>
        )
    }

    if (!stats) {
        return (
            <div className="promotion-stats empty">
                <p>Статистика пока недоступна</p>
            </div>
        )
    }

    const renderChart = () => {
        if (!stats.daily_stats || stats.daily_stats.length === 0) {
            return (
                <div className="chart-placeholder">
                    <p>Нет данных для отображения графика</p>
                </div>
            )
        }

        const maxValue = Math.max(...stats.daily_stats.map(day => day.views || 0))
        const chartHeight = 200
        const chartWidth = stats.daily_stats.length * 40

        return (
            <div className="stats-chart">
                <svg width={chartWidth} height={chartHeight} className="chart-svg">
                    {stats.daily_stats.map((day, index) => {
                        const barHeight = maxValue > 0 ? (day.views / maxValue) * (chartHeight - 40) : 0
                        const x = index * 40 + 10
                        const y = chartHeight - barHeight - 20
                        
                        return (
                            <g key={index}>
                                <rect
                                    x={x}
                                    y={y}
                                    width={30}
                                    height={barHeight}
                                    className="chart-bar"
                                    fill="#4f46e5"
                                    rx="4"
                                />
                                <text
                                    x={x + 15}
                                    y={chartHeight - 5}
                                    textAnchor="middle"
                                    className="chart-label"
                                    fontSize="10"
                                >
                                    {new Date(day.date).getDate()}
                                </text>
                                {barHeight > 20 && (
                                    <text
                                        x={x + 15}
                                        y={y - 5}
                                        textAnchor="middle"
                                        className="chart-value"
                                        fontSize="10"
                                        fill="#666"
                                    >
                                        {day.views}
                                    </text>
                                )}
                            </g>
                        )
                    })}
                </svg>
            </div>
        )
    }

    return (
        <div className="promotion-stats">
            <h4>Статистика кампании</h4>
            
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">👁</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.total_views || 0}</div>
                        <div className="stat-label">Просмотры</div>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon">👆</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.total_clicks || 0}</div>
                        <div className="stat-label">Клики</div>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                        <div className="stat-value">
                            {stats.total_clicks > 0 ? 
                                ((stats.total_clicks / stats.total_views) * 100).toFixed(1) : 0}%
                        </div>
                        <div className="stat-label">CTR</div>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-content">
                        <div className="stat-value">₸{stats.spent_budget || 0}</div>
                        <div className="stat-label">Потрачено</div>
                    </div>
                </div>
            </div>

            <div className="stats-section">
                <h5>Просмотры по дням</h5>
                <div className="chart-container">
                    {renderChart()}
                </div>
            </div>

            {stats.top_performing_days && stats.top_performing_days.length > 0 && (
                <div className="stats-section">
                    <h5>Лучшие дни</h5>
                    <div className="top-days-list">
                        {stats.top_performing_days.slice(0, 3).map((day, index) => (
                            <div key={index} className="top-day-item">
                                <span className="day-date">
                                    {new Date(day.date).toLocaleDateString('ru-RU')}
                                </span>
                                <span className="day-views">{day.views} просмотров</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
