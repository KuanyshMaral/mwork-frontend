import { Link } from 'react-router-dom'
import './UserTable.css'

const ROLE_LABELS = {
    model: { label: 'Модель', class: 'model' },
    employer: { label: 'Работодатель', class: 'employer' },
    admin: { label: 'Админ', class: 'admin' },
    super_admin: { label: 'Супер-админ', class: 'admin' },
    agency: { label: 'Агентство', class: 'agency' }
}

export default function UserTable({ 
    users, 
    onViewDetails, 
    onBan, 
    onUnban, 
    onVerify,
    loading = false 
}) {
    const formatDate = (dateStr) => {
        if (!dateStr) return '—'
        return new Date(dateStr).toLocaleDateString('ru-RU')
    }

    if (loading) {
        return (
            <div className="user-table-loading">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="skeleton-row">
                        <div className="skeleton-cell" style={{ width: '30%' }} />
                        <div className="skeleton-cell" style={{ width: '15%' }} />
                        <div className="skeleton-cell" style={{ width: '15%' }} />
                        <div className="skeleton-cell" style={{ width: '15%' }} />
                        <div className="skeleton-cell" style={{ width: '15%' }} />
                    </div>
                ))}
            </div>
        )
    }

    if (!users || users.length === 0) {
        return (
            <div className="user-table-empty">
                <span>👥</span>
                <p>Пользователи не найдены</p>
            </div>
        )
    }

    return (
        <div className="user-table-container">
            <table className="user-table">
                <thead>
                    <tr>
                        <th>Пользователь</th>
                        <th>Роль</th>
                        <th>Статус</th>
                        <th>Регистрация</th>
                        <th>Последний вход</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id} className={user.is_banned ? 'banned' : ''}>
                            <td>
                                <div className="user-cell">
                                    <div className="user-avatar">
                                        {user.avatar_url ? (
                                            <img src={user.avatar_url} alt="" />
                                        ) : (
                                            <span>{user.email?.[0]?.toUpperCase() || '?'}</span>
                                        )}
                                    </div>
                                    <div className="user-info">
                                        <span className="user-email">{user.email}</span>
                                        {user.name && <span className="user-name">{user.name}</span>}
                                        {!user.email_verified && (
                                            <span className="unverified-tag">не верифицирован</span>
                                        )}
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span className={`role-badge ${ROLE_LABELS[user.role]?.class || ''}`}>
                                    {ROLE_LABELS[user.role]?.label || user.role}
                                </span>
                            </td>
                            <td>
                                {user.is_banned ? (
                                    <span className="status-badge banned">🚫 Забанен</span>
                                ) : (
                                    <span className="status-badge active">✅ Активен</span>
                                )}
                            </td>
                            <td>{formatDate(user.created_at)}</td>
                            <td>{formatDate(user.last_login_at)}</td>
                            <td>
                                <div className="table-actions">
                                    <button
                                        className="action-btn view"
                                        onClick={() => onViewDetails?.(user)}
                                        title="Подробнее"
                                    >
                                        👁️
                                    </button>
                                    <Link
                                        to={`/profile/${user.id}`}
                                        className="action-btn"
                                        target="_blank"
                                        title="Профиль"
                                    >
                                        🔗
                                    </Link>
                                    {!user.email_verified && (
                                        <button
                                            className="action-btn verify"
                                            onClick={() => onVerify?.(user.id)}
                                            title="Верифицировать"
                                        >
                                            ✓
                                        </button>
                                    )}
                                    {user.is_banned ? (
                                        <button
                                            className="action-btn unban"
                                            onClick={() => onUnban?.(user.id)}
                                            title="Разбанить"
                                        >
                                            🔓
                                        </button>
                                    ) : (
                                        <button
                                            className="action-btn ban"
                                            onClick={() => onBan?.(user)}
                                            title="Забанить"
                                        >
                                            🚫
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
