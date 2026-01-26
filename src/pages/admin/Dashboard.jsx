import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client'
import './Admin.css'

function AdminDashboard() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/dashboard/stats')
            setStats(response.data)
        } catch (err) {
            console.error('Failed to fetch stats:', err)
            // Mock data for development
            setStats({
                users: { total: 245, models: 180, employers: 65, new_today: 12 },
                leads: { total: 45, new: 8, converted: 28, pending: 9 },
                castings: { total: 89, active: 34, pending_moderation: 5 },
                revenue: { this_month: 450000, last_month: 380000 }
            })
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="admin-page-loading">Загрузка...</div>
    }

    return (
        <div className="admin-dashboard">
            <div className="admin-dashboard-header">
                <h1>Дашборд</h1>
                <p className="admin-subtitle">Обзор ключевых метрик</p>
            </div>

            {/* Stats Grid */}
            <div className="admin-stats-grid">
                {/* Users */}
                <div className="admin-stat-card">
                    <div className="admin-stat-icon">👥</div>
                    <div className="admin-stat-content">
                        <h3>Пользователи</h3>
                        <div className="admin-stat-value">{stats?.users?.total || 0}</div>
                        <div className="admin-stat-details">
                            <span>Модели: {stats?.users?.models || 0}</span>
                            <span>Работодатели: {stats?.users?.employers || 0}</span>
                        </div>
                        <div className="admin-stat-badge positive">
                            +{stats?.users?.new_today || 0} сегодня
                        </div>
                    </div>
                </div>

                {/* Leads */}
                <div className="admin-stat-card highlight">
                    <div className="admin-stat-icon">📋</div>
                    <div className="admin-stat-content">
                        <h3>Заявки</h3>
                        <div className="admin-stat-value">{stats?.leads?.new || 0}</div>
                        <div className="admin-stat-details">
                            <span>Новых ожидает</span>
                        </div>
                        <Link to="/admin/leads" className="admin-stat-link">
                            Обработать →
                        </Link>
                    </div>
                </div>

                {/* Castings */}
                <div className="admin-stat-card">
                    <div className="admin-stat-icon">🎬</div>
                    <div className="admin-stat-content">
                        <h3>Кастинги</h3>
                        <div className="admin-stat-value">{stats?.castings?.active || 0}</div>
                        <div className="admin-stat-details">
                            <span>Активных</span>
                        </div>
                        {stats?.castings?.pending_moderation > 0 && (
                            <div className="admin-stat-badge warning">
                                {stats?.castings?.pending_moderation} на модерации
                            </div>
                        )}
                    </div>
                </div>

                {/* Revenue */}
                <div className="admin-stat-card">
                    <div className="admin-stat-icon">💰</div>
                    <div className="admin-stat-content">
                        <h3>Выручка</h3>
                        <div className="admin-stat-value">
                            {(stats?.revenue?.this_month || 0).toLocaleString()} ₸
                        </div>
                        <div className="admin-stat-details">
                            <span>За этот месяц</span>
                        </div>
                        {stats?.revenue?.this_month > stats?.revenue?.last_month && (
                            <div className="admin-stat-badge positive">
                                ↑ {Math.round((stats?.revenue?.this_month - stats?.revenue?.last_month) / stats?.revenue?.last_month * 100)}%
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="admin-section">
                <h2>Быстрые действия</h2>
                <div className="admin-quick-actions">
                    <Link to="/admin/leads?status=new" className="admin-action-btn">
                        📋 Новые заявки ({stats?.leads?.new || 0})
                    </Link>
                    <Link to="/admin/moderation" className="admin-action-btn">
                        🔍 Модерация ({stats?.castings?.pending_moderation || 0})
                    </Link>
                    <Link to="/admin/users" className="admin-action-btn">
                        👥 Пользователи
                    </Link>
                    <Link to="/admin/payments" className="admin-action-btn">
                        💳 Платежи
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard
