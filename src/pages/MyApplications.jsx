import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { responseApi } from '../api/client'
import './MyApplications.css'

export default function MyApplications() {
    const [applications, setApplications] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)

    useEffect(() => {
        loadApplications()
    }, [page])

    async function loadApplications() {
        try {
            const data = await responseApi.getMyApplications(page)
            const items = Array.isArray(data) ? data : data.applications || data.responses || []
            
            if (page === 1) {
                setApplications(items)
            } else {
                setApplications(prev => [...prev, ...items])
            }
            
            setHasMore(items.length >= 20)
        } catch (err) {
            setError('Не удалось загрузить отклики')
        } finally {
            setLoading(false)
        }
    }

    function getStatusInfo(status) {
        const statusMap = {
            pending: { 
                label: 'На рассмотрении', 
                class: 'status-pending',
                icon: '⏳',
                description: 'Работодатель рассматривает ваш отклик'
            },
            approved: { 
                label: 'Одобрен', 
                class: 'status-approved',
                icon: '✅',
                description: 'Поздравляем! Ваш отклик одобрен'
            },
            rejected: { 
                label: 'Отклонен', 
                class: 'status-rejected',
                icon: '❌',
                description: 'К сожалению, ваш отклик отклонен'
            },
        }
        return statusMap[status] || { 
            label: status, 
            class: 'status-pending', 
            icon: '❓',
            description: ''
        }
    }

    function formatDate(dateStr) {
        if (!dateStr) return ''
        const date = new Date(dateStr)
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    if (loading && page === 1) {
        return <div className="loading">Загрузка...</div>
    }

    return (
        <div className="my-applications animate-fadeIn">
            <div className="page-header">
                <h1>Мои отклики</h1>
                <p>История ваших откликов на кастинги</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="applications-list">
                {applications.length === 0 ? (
                    <div className="empty-state card">
                        <div className="empty-icon">📝</div>
                        <h3>У вас пока нет откликов</h3>
                        <p>Найдите подходящий кастинг и откликнитесь на него</p>
                        <Link to="/castings" className="btn btn-primary">
                            Смотреть кастинги
                        </Link>
                    </div>
                ) : (
                    <>
                        {applications.map(app => {
                            const status = getStatusInfo(app.status)
                            return (
                                <div key={app.id} className="application-card card">
                                    <div className="application-header">
                                        <div className="application-info">
                                            <Link to={`/castings/${app.casting_id}`} className="application-title">
                                                {app.casting_title || 'Кастинг'}
                                            </Link>
                                            <div className="application-meta">
                                                <span>📍 {app.casting_city || 'Город не указан'}</span>
                                                <span>📅 {formatDate(app.created_at)}</span>
                                            </div>
                                        </div>
                                        <div className={`status-badge ${status.class}`}>
                                            <span className="status-icon">{status.icon}</span>
                                            <span>{status.label}</span>
                                        </div>
                                    </div>

                                    {app.cover_letter && (
                                        <div className="application-letter">
                                            <strong>Ваше сопроводительное письмо:</strong>
                                            <p>{app.cover_letter}</p>
                                        </div>
                                    )}

                                    <div className="application-footer">
                                        <p className="status-description">{status.description}</p>
                                        <div className="application-actions">
                                            <Link 
                                                to={`/castings/${app.casting_id}`} 
                                                className="btn btn-secondary btn-sm"
                                            >
                                                Подробнее
                                            </Link>
                                            {app.status === 'approved' && app.chat_enabled && (
                                                <Link 
                                                    to="/messages" 
                                                    className="btn btn-primary btn-sm"
                                                >
                                                    💬 Написать
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}

                        {hasMore && (
                            <div className="load-more">
                                <button 
                                    className="btn btn-secondary"
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={loading}
                                >
                                    {loading ? 'Загрузка...' : 'Загрузить еще'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
