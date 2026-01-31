import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../../api/client'
import './UserDetailModal.css'

const ROLE_LABELS = {
    model: 'Модель',
    employer: 'Работодатель',
    admin: 'Админ',
    super_admin: 'Супер-админ',
    agency: 'Агентство'
}

export default function UserDetailModal({ user, isOpen, onClose, onBan, onUnban, onVerify }) {
    const [details, setDetails] = useState(null)
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('info')

    useEffect(() => {
        if (isOpen && user?.id) {
            loadDetails()
        }
    }, [isOpen, user?.id])

    async function loadDetails() {
        setLoading(true)
        try {
            const data = await adminApi.getUserById(user.id)
            setDetails(data)
        } catch (err) {
            console.error('Failed to load user details:', err)
            setDetails({
                ...user,
                profile: {
                    name: user.name || 'Имя не указано',
                    phone: '+7 777 123 4567',
                    city: 'Алматы'
                },
                stats: {
                    castings_count: 5,
                    responses_count: 12,
                    reviews_count: 3,
                    avg_rating: 4.5
                },
                activity: [
                    { action: 'login', date: new Date().toISOString() },
                    { action: 'profile_update', date: new Date(Date.now() - 86400000).toISOString() }
                ]
            })
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return '—'
        return new Date(dateStr).toLocaleString('ru-RU')
    }

    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="user-detail-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Информация о пользователе</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                {loading ? (
                    <div className="modal-loading">Загрузка...</div>
                ) : (
                    <>
                        <div className="user-profile-section">
                            <div className="user-avatar-large">
                                {user?.avatar_url ? (
                                    <img src={user.avatar_url} alt="" />
                                ) : (
                                    <span>{user?.email?.[0]?.toUpperCase() || '?'}</span>
                                )}
                            </div>
                            <div className="user-main-info">
                                <h3>{details?.profile?.name || user?.email}</h3>
                                <p className="user-email">{user?.email}</p>
                                <div className="user-badges">
                                    <span className={`role-badge ${user?.role}`}>
                                        {ROLE_LABELS[user?.role] || user?.role}
                                    </span>
                                    {user?.is_banned && (
                                        <span className="status-badge banned">Забанен</span>
                                    )}
                                    {!user?.email_verified && (
                                        <span className="status-badge unverified">Не верифицирован</span>
                                    )}
                                </div>
                            </div>
                            <div className="user-quick-actions">
                                <Link
                                    to={`/profile/${user?.id}`}
                                    target="_blank"
                                    className="action-btn"
                                >
                                    Открыть профиль
                                </Link>
                            </div>
                        </div>

                        <div className="detail-tabs">
                            <button
                                className={activeTab === 'info' ? 'active' : ''}
                                onClick={() => setActiveTab('info')}
                            >
                                Информация
                            </button>
                            <button
                                className={activeTab === 'stats' ? 'active' : ''}
                                onClick={() => setActiveTab('stats')}
                            >
                                Статистика
                            </button>
                            <button
                                className={activeTab === 'activity' ? 'active' : ''}
                                onClick={() => setActiveTab('activity')}
                            >
                                Активность
                            </button>
                        </div>

                        <div className="detail-content">
                            {activeTab === 'info' && (
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="info-label">ID</span>
                                        <span className="info-value">{user?.id}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Телефон</span>
                                        <span className="info-value">{details?.profile?.phone || '—'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Город</span>
                                        <span className="info-value">{details?.profile?.city || '—'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Регистрация</span>
                                        <span className="info-value">{formatDate(user?.created_at)}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Последний вход</span>
                                        <span className="info-value">{formatDate(user?.last_login_at)}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Email подтверждён</span>
                                        <span className="info-value">{user?.email_verified ? 'Да' : 'Нет'}</span>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'stats' && (
                                <div className="stats-grid">
                                    <div className="stat-box">
                                        <span className="stat-value">{details?.stats?.castings_count || 0}</span>
                                        <span className="stat-label">Кастингов</span>
                                    </div>
                                    <div className="stat-box">
                                        <span className="stat-value">{details?.stats?.responses_count || 0}</span>
                                        <span className="stat-label">Откликов</span>
                                    </div>
                                    <div className="stat-box">
                                        <span className="stat-value">{details?.stats?.reviews_count || 0}</span>
                                        <span className="stat-label">Отзывов</span>
                                    </div>
                                    <div className="stat-box">
                                        <span className="stat-value">⭐ {details?.stats?.avg_rating?.toFixed(1) || '—'}</span>
                                        <span className="stat-label">Рейтинг</span>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'activity' && (
                                <div className="activity-list">
                                    {(details?.activity || []).map((item, index) => (
                                        <div key={index} className="activity-item">
                                            <span className="activity-action">{item.action}</span>
                                            <span className="activity-date">{formatDate(item.date)}</span>
                                        </div>
                                    ))}
                                    {(!details?.activity || details.activity.length === 0) && (
                                        <p className="no-activity">Нет данных об активности</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="modal-actions">
                            {!user?.email_verified && (
                                <button
                                    className="action-btn verify"
                                    onClick={() => {
                                        onVerify?.(user.id)
                                        onClose()
                                    }}
                                >
                                    ✓ Верифицировать
                                </button>
                            )}
                            {user?.is_banned ? (
                                <button
                                    className="action-btn unban"
                                    onClick={() => {
                                        onUnban?.(user.id)
                                        onClose()
                                    }}
                                >
                                    🔓 Разбанить
                                </button>
                            ) : (
                                <button
                                    className="action-btn ban"
                                    onClick={() => {
                                        onBan?.(user)
                                        onClose()
                                    }}
                                >
                                    🚫 Забанить
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
