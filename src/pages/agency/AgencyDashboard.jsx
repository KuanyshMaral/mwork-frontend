import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { agencyApi, castingApi } from '../../api/client'
import AgencyStats from '../../components/agency/AgencyStats'
import './Agency.css'

export default function AgencyDashboard() {
    const [agency, setAgency] = useState(null)
    const [stats, setStats] = useState(null)
    const [recentCastings, setRecentCastings] = useState([])
    const [recentActivity, setRecentActivity] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            const [agencyData, statsData, castingsData] = await Promise.all([
                agencyApi.getMyAgency().catch(() => null),
                agencyApi.getStats().catch(() => null),
                castingApi.getMy().catch(() => ({ items: [] }))
            ])

            if (agencyData) {
                setAgency(agencyData)
            } else {
                setAgency({
                    name: 'Моё агентство',
                    description: 'Модельное агентство',
                    logo_url: null
                })
            }

            setStats(statsData || {
                total_models: 12,
                active_castings: 5,
                total_bookings: 34,
                followers_count: 156,
                total_revenue: 450000,
                avg_rating: 4.7
            })

            const castings = castingsData?.items || castingsData || []
            setRecentCastings(castings.slice(0, 4))

            setRecentActivity([
                { id: 1, type: 'booking', message: 'Новое бронирование для Анна К.', time: '2ч назад' },
                { id: 2, type: 'follower', message: 'Новый подписчик: Fashion Studio', time: '5ч назад' },
                { id: 3, type: 'response', message: 'Отклик на кастинг "Фотосессия зима"', time: '1д назад' }
            ])
        } catch (err) {
            console.error('Failed to load agency dashboard:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="loading">Загрузка...</div>
    }

    return (
        <div className="agency-dashboard">
            <div className="agency-header">
                <div className="agency-info">
                    <div className="agency-logo">
                        {agency?.logo_url ? (
                            <img src={agency.logo_url} alt={agency.name} />
                        ) : (
                            <span>🏢</span>
                        )}
                    </div>
                    <div>
                        <h1>{agency?.name}</h1>
                        <p>{agency?.description}</p>
                    </div>
                </div>
                <div className="header-actions">
                    <Link to="/agency/profile" className="action-btn secondary">
                        Настройки
                    </Link>
                    <Link to="/castings/create" className="action-btn primary">
                        + Создать кастинг
                    </Link>
                </div>
            </div>

            <AgencyStats stats={stats} />

            <div className="dashboard-grid">
                <div className="dashboard-section">
                    <div className="section-header">
                        <h2>Активные кастинги</h2>
                        <Link to="/castings/my" className="view-all">Все кастинги →</Link>
                    </div>

                    {recentCastings.length === 0 ? (
                        <div className="empty-state">
                            <span>📋</span>
                            <p>Нет активных кастингов</p>
                            <Link to="/castings/create" className="create-btn">
                                Создать кастинг
                            </Link>
                        </div>
                    ) : (
                        <div className="castings-grid">
                            {recentCastings.map(casting => (
                                <Link
                                    key={casting.id}
                                    to={`/castings/${casting.id}`}
                                    className="casting-card"
                                >
                                    <h3>{casting.title}</h3>
                                    <p className="casting-meta">
                                        <span>📍 {casting.city}</span>
                                        <span>📩 {casting.responses_count || 0} откликов</span>
                                    </p>
                                    <span className={`status-badge ${casting.status}`}>
                                        {casting.status === 'active' ? 'Активный' : casting.status}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                <div className="dashboard-section">
                    <div className="section-header">
                        <h2>Последняя активность</h2>
                    </div>

                    <div className="activity-list">
                        {recentActivity.map(activity => (
                            <div key={activity.id} className="activity-item">
                                <span className="activity-icon">
                                    {activity.type === 'booking' && '📅'}
                                    {activity.type === 'follower' && '❤️'}
                                    {activity.type === 'response' && '📩'}
                                </span>
                                <div className="activity-content">
                                    <p>{activity.message}</p>
                                    <span className="activity-time">{activity.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="quick-links">
                <Link to="/agency/team" className="quick-link">
                    <span className="icon">👥</span>
                    <span className="label">Управление командой</span>
                </Link>
                <Link to="/models" className="quick-link">
                    <span className="icon">🔍</span>
                    <span className="label">Поиск моделей</span>
                </Link>
                <Link to="/messages" className="quick-link">
                    <span className="icon">💬</span>
                    <span className="label">Сообщения</span>
                </Link>
                <Link to="/subscriptions" className="quick-link">
                    <span className="icon">⭐</span>
                    <span className="label">Подписка</span>
                </Link>
            </div>
        </div>
    )
}
