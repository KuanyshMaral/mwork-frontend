import { useState } from 'react'
import './CastingPerformanceChart.css'

export default function CastingPerformanceChart({ data = [] }) {
    const [period, setPeriod] = useState('week')

    const periodData = {
        week: data.slice(-7),
        month: data.slice(-30),
        year: data.slice(-12)
    }

    const chartData = periodData[period].length > 0 ? periodData[period] : [
        { label: 'Пн', views: 45, responses: 12 },
        { label: 'Вт', views: 52, responses: 18 },
        { label: 'Ср', views: 38, responses: 8 },
        { label: 'Чт', views: 65, responses: 22 },
        { label: 'Пт', views: 78, responses: 28 },
        { label: 'Сб', views: 42, responses: 15 },
        { label: 'Вс', views: 35, responses: 10 }
    ]

    const maxValue = Math.max(...chartData.map(d => Math.max(d.views || 0, d.responses || 0)), 1)

    return (
        <div className="casting-performance-chart">
            <div className="chart-header">
                <h3>Эффективность кастингов</h3>
                <div className="chart-period-selector">
                    <button
                        className={period === 'week' ? 'active' : ''}
                        onClick={() => setPeriod('week')}
                    >
                        Неделя
                    </button>
                    <button
                        className={period === 'month' ? 'active' : ''}
                        onClick={() => setPeriod('month')}
                    >
                        Месяц
                    </button>
                    <button
                        className={period === 'year' ? 'active' : ''}
                        onClick={() => setPeriod('year')}
                    >
                        Год
                    </button>
                </div>
            </div>

            <div className="chart-legend">
                <span className="legend-item views">
                    <span className="legend-dot"></span>
                    Просмотры
                </span>
                <span className="legend-item responses">
                    <span className="legend-dot"></span>
                    Отклики
                </span>
            </div>

            <div className="chart-container">
                <div className="chart-bars">
                    {chartData.map((item, index) => (
                        <div key={index} className="chart-bar-group">
                            <div className="bars">
                                <div
                                    className="bar views"
                                    style={{ height: `${((item.views || 0) / maxValue) * 100}%` }}
                                    title={`Просмотры: ${item.views || 0}`}
                                />
                                <div
                                    className="bar responses"
                                    style={{ height: `${((item.responses || 0) / maxValue) * 100}%` }}
                                    title={`Отклики: ${item.responses || 0}`}
                                />
                            </div>
                            <span className="bar-label">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="chart-summary">
                <div className="summary-item">
                    <span className="summary-value">
                        {chartData.reduce((sum, d) => sum + (d.views || 0), 0)}
                    </span>
                    <span className="summary-label">Всего просмотров</span>
                </div>
                <div className="summary-item">
                    <span className="summary-value">
                        {chartData.reduce((sum, d) => sum + (d.responses || 0), 0)}
                    </span>
                    <span className="summary-label">Всего откликов</span>
                </div>
                <div className="summary-item">
                    <span className="summary-value">
                        {(() => {
                            const views = chartData.reduce((sum, d) => sum + (d.views || 0), 0)
                            const responses = chartData.reduce((sum, d) => sum + (d.responses || 0), 0)
                            return views > 0 ? ((responses / views) * 100).toFixed(1) : '0'
                        })()}%
                    </span>
                    <span className="summary-label">Конверсия</span>
                </div>
            </div>
        </div>
    )
}
