import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client'
import './Admin.css'

const ROLE_LABELS = {
    model: { label: 'Модель', class: 'model' },
    employer: { label: 'Работодатель', class: 'employer' },
    admin: { label: 'Админ', class: 'admin' },
    super_admin: { label: 'Супер-админ', class: 'admin' }
}

function AdminUsers() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState('all')
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 })
    const [selectedUser, setSelectedUser] = useState(null)
    const [showBanModal, setShowBanModal] = useState(false)
    const [banReason, setBanReason] = useState('')

    useEffect(() => {
        fetchUsers()
    }, [roleFilter, pagination.page])

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const params = {
                limit: pagination.limit,
                offset: (pagination.page - 1) * pagination.limit,
                ...(roleFilter !== 'all' && { role: roleFilter }),
                ...(search && { search })
            }
            const response = await api.get('/admin/users', { params })
            setUsers(response.data?.users || [])
            setPagination(prev => ({ ...prev, total: response.data?.total || 0 }))
        } catch (err) {
            console.error('Failed to fetch users:', err)
            // Mock data
            setUsers([
                {
                    id: '1',
                    email: 'maria@example.com',
                    role: 'model',
                    email_verified: true,
                    is_banned: false,
                    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
                    last_login_at: new Date().toISOString()
                },
                {
                    id: '2',
                    email: 'company@example.com',
                    role: 'employer',
                    email_verified: true,
                    is_banned: false,
                    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
                    last_login_at: new Date(Date.now() - 3600000).toISOString()
                },
                {
                    id: '3',
                    email: 'spammer@bad.com',
                    role: 'model',
                    email_verified: false,
                    is_banned: true,
                    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
                    last_login_at: null
                }
            ])
            setPagination(prev => ({ ...prev, total: 3 }))
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        fetchUsers()
    }

    const handleBan = async () => {
        if (!selectedUser || !banReason.trim()) return

        try {
            await api.post(`/admin/users/${selectedUser.id}/ban`, { reason: banReason })
            setUsers(users.map(u =>
                u.id === selectedUser.id ? { ...u, is_banned: true } : u
            ))
            setShowBanModal(false)
            setBanReason('')
            setSelectedUser(null)
        } catch (err) {
            console.error('Failed to ban user:', err)
            alert('Ошибка при бане пользователя')
        }
    }

    const handleUnban = async (userId) => {
        if (!confirm('Разбанить пользователя?')) return

        try {
            await api.post(`/admin/users/${userId}/unban`)
            setUsers(users.map(u =>
                u.id === userId ? { ...u, is_banned: false } : u
            ))
        } catch (err) {
            console.error('Failed to unban user:', err)
            alert('Ошибка при разбане')
        }
    }

    const handleVerify = async (userId) => {
        try {
            await api.post(`/admin/users/${userId}/verify`)
            setUsers(users.map(u =>
                u.id === userId ? { ...u, email_verified: true } : u
            ))
        } catch (err) {
            console.error('Failed to verify user:', err)
            alert('Ошибка при верификации')
        }
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return '—'
        return new Date(dateStr).toLocaleDateString('ru-RU')
    }

    const totalPages = Math.ceil(pagination.total / pagination.limit)

    return (
        <div className="admin-users">
            <div className="admin-page-header">
                <div>
                    <h1>👥 Пользователи</h1>
                    <p className="admin-subtitle">
                        Всего: {pagination.total}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="admin-filters">
                <form onSubmit={handleSearch} className="admin-search">
                    <input
                        type="text"
                        placeholder="Поиск по email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <button type="submit" className="admin-btn secondary">
                        🔍
                    </button>
                </form>

                <div className="admin-filter-group">
                    <select
                        value={roleFilter}
                        onChange={e => setRoleFilter(e.target.value)}
                        className="admin-select"
                    >
                        <option value="all">Все роли</option>
                        <option value="model">Модели</option>
                        <option value="employer">Работодатели</option>
                        <option value="admin">Админы</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            {loading ? (
                <div className="admin-page-loading">Загрузка...</div>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Email</th>
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
                                        <div className="user-email">
                                            {user.email}
                                            {!user.email_verified && (
                                                <span className="unverified-badge">не верифицирован</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`role-badge ${ROLE_LABELS[user.role]?.class}`}>
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
                                            <Link
                                                to={`/profile/${user.id}`}
                                                className="admin-btn secondary small"
                                                target="_blank"
                                            >
                                                👁️
                                            </Link>
                                            {!user.email_verified && (
                                                <button
                                                    className="admin-btn secondary small"
                                                    onClick={() => handleVerify(user.id)}
                                                    title="Верифицировать"
                                                >
                                                    ✓
                                                </button>
                                            )}
                                            {user.is_banned ? (
                                                <button
                                                    className="admin-btn success small"
                                                    onClick={() => handleUnban(user.id)}
                                                >
                                                    Разбанить
                                                </button>
                                            ) : (
                                                <button
                                                    className="admin-btn danger small"
                                                    onClick={() => {
                                                        setSelectedUser(user)
                                                        setShowBanModal(true)
                                                    }}
                                                >
                                                    Бан
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="admin-pagination">
                    <button
                        className="admin-btn secondary"
                        disabled={pagination.page <= 1}
                        onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                    >
                        ← Назад
                    </button>
                    <span>Страница {pagination.page} из {totalPages}</span>
                    <button
                        className="admin-btn secondary"
                        disabled={pagination.page >= totalPages}
                        onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                    >
                        Вперёд →
                    </button>
                </div>
            )}

            {/* Ban Modal */}
            {showBanModal && (
                <div className="admin-modal-overlay" onClick={() => setShowBanModal(false)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <h3>Забанить пользователя</h3>
                        <p>Email: <strong>{selectedUser?.email}</strong></p>
                        <textarea
                            value={banReason}
                            onChange={e => setBanReason(e.target.value)}
                            placeholder="Причина бана..."
                            rows={3}
                        />
                        <div className="admin-modal-actions">
                            <button
                                className="admin-btn secondary"
                                onClick={() => setShowBanModal(false)}
                            >
                                Отмена
                            </button>
                            <button
                                className="admin-btn danger"
                                onClick={handleBan}
                                disabled={!banReason.trim()}
                            >
                                Забанить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminUsers
