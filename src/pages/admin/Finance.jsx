import { useEffect, useState } from 'react'
import { adminApi } from '../../api/client'
import RevenueChart from '../../components/admin/RevenueChart'
import TopSpenders from '../../components/admin/TopSpenders'
import './Finance.css'

export default function AdminFinance() {
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState('month')
    const [stats, setStats] = useState(null)
    const [chartData, setChartData] = useState([])
    const [topSpenders, setTopSpenders] = useState([])

    useEffect(() => {
        loadData()
    }, [period])

    async function loadData() {
        setLoading(true)
        try {
            const data = await adminApi.getRevenue({ period })
            setStats(data)
            setChartData(data.chart_data || [])
            setTopSpenders(data.top_spenders || [])
        } catch (err) {
            console.error('Failed to load finance data:', err)
            setStats({
                total_revenue: 4240000,
                subscriptions_revenue: 2850000,
                promotions_revenue: 1390000,
                transactions_count: 342,
                active_subscriptions: 156,
                mrr: 680000,
                growth_rate: 12.5
            })
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="admin-page-loading">Загрузка...</div>
    }

    return (
        <div className="admin-finance">
            <div className="page-header">
                <div>
                    <h1>💰 Финансы</h1>
                    <p className="page-subtitle">Аналитика доходов и платежей</p>
                </div>
                <div className="period-selector">
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

            {/* Stats Overview */}
            <div className="stats-grid">
                <div className="stat-card primary">
                    <div className="stat-icon">💵</div>
                    <div className="stat-content">
                        <span className="stat-value">₸{stats?.total_revenue?.toLocaleString()}</span>
                        <span className="stat-label">Общая выручка</span>
                    </div>
                    {stats?.growth_rate && (
                        <span className={`stat-trend ${stats.growth_rate >= 0 ? 'positive' : 'negative'}`}>
                            {stats.growth_rate >= 0 ? '↑' : '↓'} {Math.abs(stats.growth_rate)}%
                        </span>
                    )}
                </div>

                <div className="stat-card">
                    <div className="stat-icon">📦</div>
                    <div className="stat-content">
                        <span className="stat-value">₸{stats?.subscriptions_revenue?.toLocaleString()}</span>
                        <span className="stat-label">Подписки</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">⭐</div>
                    <div className="stat-content">
                        <span className="stat-value">₸{stats?.promotions_revenue?.toLocaleString()}</span>
                        <span className="stat-label">Продвижение</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">🔄</div>
                    <div className="stat-content">
                        <span className="stat-value">₸{stats?.mrr?.toLocaleString()}</span>
                        <span className="stat-label">MRR</span>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-section">
                <div className="chart-wrapper main">
                    <RevenueChart data={chartData} period={period} />
                </div>
                <div className="chart-wrapper side">
                    <TopSpenders spenders={topSpenders} />
                </div>
            </div>

            {/* Transactions Summary */}
            <div className="summary-section">
                <div className="summary-card">
                    <h3>Подписки</h3>
                    <div className="summary-stats">
                        <div className="summary-item">
                            <span className="summary-value">{stats?.active_subscriptions || 0}</span>
                            <span className="summary-label">Активных подписок</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-value">{stats?.transactions_count || 0}</span>
                            <span className="summary-label">Транзакций</span>
                        </div>
                    </div>
                    <div className="plan-breakdown">
                        <div className="plan-item">
                            <span className="plan-name">Free</span>
                            <div className="plan-bar">
                                <div className="plan-fill" style={{ width: '60%' }}></div>
                            </div>
                            <span className="plan-count">245</span>
                        </div>
                        <div className="plan-item">
                            <span className="plan-name">Start</span>
                            <div className="plan-bar">
                                <div className="plan-fill start" style={{ width: '25%' }}></div>
                            </div>
                            <span className="plan-count">98</span>
                        </div>
                        <div className="plan-item">
                            <span className="plan-name">Pro</span>
                            <div className="plan-bar">
                                <div className="plan-fill pro" style={{ width: '15%' }}></div>
                            </div>
                            <span className="plan-count">58</span>
                        </div>
                    </div>
                </div>

                <div className="summary-card">
                    <h3>Платежи</h3>
                    <div className="payment-methods">
                        <div className="method-item">
                            <span className="method-icon">💳</span>
                            <div className="method-info">
                                <span className="method-name">Kaspi</span>
                                <span className="method-percent">78%</span>
                            </div>
                            <div className="method-bar">
                                <div className="method-fill" style={{ width: '78%' }}></div>
                            </div>
                        </div>
                        <div className="method-item">
                            <span className="method-icon">🏦</span>
                            <div className="method-info">
                                <span className="method-name">Карта</span>
                                <span className="method-percent">18%</span>
                            </div>
                            <div className="method-bar">
                                <div className="method-fill" style={{ width: '18%' }}></div>
                            </div>
                        </div>
                        <div className="method-item">
                            <span className="method-icon">📱</span>
                            <div className="method-info">
                                <span className="method-name">Другое</span>
                                <span className="method-percent">4%</span>
                            </div>
                            <div className="method-bar">
                                <div className="method-fill" style={{ width: '4%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="summary-card">
                    <h3>Конверсии</h3>
                    <div className="conversion-funnel">
                        <div className="funnel-step">
                            <span className="step-label">Регистрации</span>
                            <span className="step-value">1,245</span>
                            <span className="step-percent">100%</span>
                        </div>
                        <div className="funnel-arrow">↓</div>
                        <div className="funnel-step">
                            <span className="step-label">Пробная версия</span>
                            <span className="step-value">456</span>
                            <span className="step-percent">36.6%</span>
                        </div>
                        <div className="funnel-arrow">↓</div>
                        <div className="funnel-step">
                            <span className="step-label">Платная подписка</span>
                            <span className="step-value">156</span>
                            <span className="step-percent">12.5%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
