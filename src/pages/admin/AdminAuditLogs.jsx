import { useState, useEffect } from 'react'
import './AdminAuditLogs.css'

export default function AdminAuditLogs() {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState({
        action: '',
        user_type: '',
        date_from: '',
        date_to: '',
        page: 1,
        limit: 50
    })
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0
    })

    useEffect(() => {
        loadAuditLogs()
    }, [filters])

    async function loadAuditLogs() {
        setLoading(true)
        try {
            // In a real implementation, this would call the API
            // For now, we'll use mock data
            const mockLogs = [
                {
                    id: 1,
                    action: 'casting_created',
                    user_type: 'employer',
                    user_id: 123,
                    user_email: 'employer@example.com',
                    user_name: 'ООО "Модельное Агентство"',
                    target_type: 'casting',
                    target_id: 456,
                    description: 'Создан новый кастинг "Модель для рекламной кампании"',
                    ip_address: '192.168.1.100',
                    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    created_at: new Date(Date.now() - 3600000).toISOString()
                },
                {
                    id: 2,
                    action: 'casting_closed',
                    user_type: 'employer',
                    user_id: 123,
                    user_email: 'employer@example.com',
                    user_name: 'ООО "Модельное Агентство"',
                    target_type: 'casting',
                    target_id: 456,
                    description: 'Кастинг "Модель для рекламной кампании" закрыт после принятия модели',
                    ip_address: '192.168.1.100',
                    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    created_at: new Date(Date.now() - 7200000).toISOString()
                },
                {
                    id: 3,
                    action: 'profile_approved',
                    user_type: 'admin',
                    user_id: 1,
                    user_email: 'admin@mwork.kz',
                    user_name: 'Администратор',
                    target_type: 'user',
                    target_id: 789,
                    description: 'Профиль модели одобрен',
                    ip_address: '192.168.1.1',
                    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                    created_at: new Date(Date.now() - 10800000).toISOString()
                },
                {
                    id: 4,
                    action: 'user_blocked',
                    user_type: 'admin',
                    user_id: 1,
                    user_email: 'admin@mwork.kz',
                    user_name: 'Администратор',
                    target_type: 'user',
                    target_id: 101,
                    description: 'Пользователь заблокирован за нарушение правил',
                    ip_address: '192.168.1.1',
                    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                    created_at: new Date(Date.now() - 14400000).toISOString()
                },
                {
                    id: 5,
                    action: 'response_sent',
                    user_type: 'model',
                    user_id: 456,
                    user_email: 'model@example.com',
                    user_name: 'Анна Петрова',
                    target_type: 'casting',
                    target_id: 789,
                    description: 'Отправлен отклик на кастинг "Фотосессия для lookbook"',
                    ip_address: '192.168.1.200',
                    user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
                    created_at: new Date(Date.now() - 18000000).toISOString()
                }
            ]

            setLogs(mockLogs)
            setPagination({
                page: 1,
                limit: 50,
                total: mockLogs.length,
                totalPages: 1
            })
        } catch (error) {
            console.error('Failed to load audit logs:', error)
        } finally {
            setLoading(false)
        }
    }

    const updateFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
    }

    const getActionLabel = (action) => {
        const labels = {
            casting_created: 'Создание кастинга',
            casting_updated: 'Обновление кастинга',
            casting_closed: 'Закрытие кастинга',
            casting_deleted: 'Удаление кастинга',
            profile_created: 'Создание профиля',
            profile_updated: 'Обновление профиля',
            profile_approved: 'Одобрение профиля',
            profile_rejected: 'Отклонение профиля',
            user_registered: 'Регистрация пользователя',
            user_blocked: 'Блокировка пользователя',
            user_unblocked: 'Разблокировка пользователя',
            response_sent: 'Отправка отклика',
            response_accepted: 'Принятие отклика',
            response_rejected: 'Отклонение отклика',
            payment_completed: 'Завершение платежа',
            payment_failed: 'Ошибка платежа',
            login: 'Вход в систему',
            logout: 'Выход из системы'
        }
        return labels[action] || action
    }

    const getUserTypeLabel = (userType) => {
        const labels = {
            admin: 'Администратор',
            employer: 'Работодатель',
            model: 'Модель',
            agency: 'Агентство'
        }
        return labels[userType] || userType
    }

    const getActionColor = (action) => {
        if (action.includes('created')) return 'success'
        if (action.includes('updated')) return 'info'
        if (action.includes('closed') || action.includes('deleted') || action.includes('blocked') || action.includes('rejected')) return 'danger'
        if (action.includes('approved') || action.includes('accepted')) return 'success'
        if (action.includes('sent')) return 'info'
        return 'secondary'
    }

    const formatDate = (dateStr) => {
        const date = new Date(dateStr)
        return date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
    }

    return (
        <div className="admin-audit-logs">
            <div className="admin-section-header">
                <h1>Audit Logs</h1>
                <p>Журнал системных событий и действий пользователей</p>
            </div>

            {/* Filters */}
            <div className="admin-filters-card">
                <div className="filters-grid">
                    <div className="filter-group">
                        <label>Действие</label>
                        <select
                            value={filters.action}
                            onChange={(e) => updateFilter('action', e.target.value)}
                            className="filter-select"
                        >
                            <option value="">Все действия</option>
                            <option value="casting_created">Создание кастинга</option>
                            <option value="casting_closed">Закрытие кастинга</option>
                            <option value="profile_approved">Одобрение профиля</option>
                            <option value="profile_rejected">Отклонение профиля</option>
                            <option value="user_blocked">Блокировка пользователя</option>
                            <option value="response_sent">Отправка отклика</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Тип пользователя</label>
                        <select
                            value={filters.user_type}
                            onChange={(e) => updateFilter('user_type', e.target.value)}
                            className="filter-select"
                        >
                            <option value="">Все типы</option>
                            <option value="admin">Администратор</option>
                            <option value="employer">Работодатель</option>
                            <option value="model">Модель</option>
                            <option value="agency">Агентство</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Дата с</label>
                        <input
                            type="date"
                            value={filters.date_from}
                            onChange={(e) => updateFilter('date_from', e.target.value)}
                            className="filter-input"
                        />
                    </div>

                    <div className="filter-group">
                        <label>Дата по</label>
                        <input
                            type="date"
                            value={filters.date_to}
                            onChange={(e) => updateFilter('date_to', e.target.value)}
                            className="filter-input"
                        />
                    </div>
                </div>

                <div className="filters-actions">
                    <button 
                        className="btn btn-secondary"
                        onClick={() => setFilters({
                            action: '',
                            user_type: '',
                            date_from: '',
                            date_to: '',
                            page: 1,
                            limit: 50
                        })}
                    >
                        Сбросить фильтры
                    </button>
                </div>
            </div>

            {/* Logs Table */}
            <div className="admin-table-card">
                {loading ? (
                    <div className="loading">Загрузка...</div>
                ) : logs.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📋</div>
                        <h3>Записи не найдены</h3>
                        <p>Попробуйте изменить параметры фильтров</p>
                    </div>
                ) : (
                    <>
                        <div className="table-info">
                            <span>Всего записей: {pagination.total}</span>
                        </div>

                        <div className="admin-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Дата</th>
                                        <th>Действие</th>
                                        <th>Пользователь</th>
                                        <th>Тип</th>
                                        <th>Описание</th>
                                        <th>IP адрес</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map(log => (
                                        <tr key={log.id}>
                                            <td className="date-cell">
                                                {formatDate(log.created_at)}
                                            </td>
                                            <td>
                                                <span className={`action-badge ${getActionColor(log.action)}`}>
                                                    {getActionLabel(log.action)}
                                                </span>
                                            </td>
                                            <td className="user-cell">
                                                <div>
                                                    <div className="user-name">{log.user_name}</div>
                                                    <div className="user-email">{log.user_email}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="user-type-badge">
                                                    {getUserTypeLabel(log.user_type)}
                                                </span>
                                            </td>
                                            <td className="description-cell">
                                                {log.description}
                                            </td>
                                            <td className="ip-cell">
                                                {log.ip_address}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="admin-pagination">
                                <button
                                    className="btn btn-secondary"
                                    disabled={pagination.page <= 1}
                                    onClick={() => updateFilter('page', pagination.page - 1)}
                                >
                                    ← Назад
                                </button>
                                
                                <span className="pagination-info">
                                    Страница {pagination.page} из {pagination.totalPages}
                                </span>
                                
                                <button
                                    className="btn btn-secondary"
                                    disabled={pagination.page >= pagination.totalPages}
                                    onClick={() => updateFilter('page', pagination.page + 1)}
                                >
                                    Вперед →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
