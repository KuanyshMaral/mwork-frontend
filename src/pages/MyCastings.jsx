import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { castingApi, responseApi } from '../api/client'
import './MyCastings.css'

export default function MyCastings() {
    const navigate = useNavigate()
    const [castings, setCastings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [expandedResponses, setExpandedResponses] = useState({})
    const [chatToast, setChatToast] = useState(null)

    useEffect(() => {
        loadCastings()
    }, [])

    async function loadCastings() {
        try {
            const data = await castingApi.getMy()
            setCastings(Array.isArray(data) ? data : data.castings || [])
        } catch (err) {
            setError('Не удалось загрузить кастинги')
        } finally {
            setLoading(false)
        }
    }

    async function toggleResponses(castingId) {
        if (expandedResponses[castingId]) {
            setExpandedResponses(prev => ({ ...prev, [castingId]: null }))
            return
        }

        try {
            const data = await responseApi.getCastingResponses(castingId)
            setExpandedResponses(prev => ({
                ...prev,
                [castingId]: Array.isArray(data) ? data : data.responses || []
            }))
        } catch (err) {
            console.error('Failed to load responses:', err)
        }
    }

    async function updateResponseStatus(responseId, status, castingId) {
        try {
            const result = await responseApi.updateStatus(responseId, status)
            const data = await responseApi.getCastingResponses(castingId)
            setExpandedResponses(prev => ({
                ...prev,
                [castingId]: Array.isArray(data) ? data : data.responses || []
            }))

            if (status === 'approved' && result?.chat_room_id) {
                setChatToast({ roomId: result.chat_room_id })
                setTimeout(() => setChatToast(null), 8000)
            }
        } catch (err) {
            console.error('Failed to update status:', err)
        }
    }

    function getStatusBadge(status) {
        const statusMap = {
            pending: { label: 'Ожидает', class: 'badge-warning' },
            approved: { label: 'Одобрен', class: 'badge-success' },
            rejected: { label: 'Отклонен', class: 'badge-error' },
        }
        return statusMap[status] || { label: status, class: 'badge-secondary' }
    }

    if (loading) {
        return <div className="loading">Загрузка...</div>
    }

    return (
        <div className="my-castings animate-fadeIn">
            <div className="page-header flex-between">
                <div>
                    <h1>Мои кастинги</h1>
                    <p>Управляйте своими объявлениями</p>
                </div>
                <Link to="/castings/create" className="btn btn-primary">
                    + Создать кастинг
                </Link>
            </div>

            {error && <div className="error-message">{error}</div>}

            {chatToast && (
                <div style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    background: '#10b981',
                    color: '#fff',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    animation: 'fadeIn 0.3s ease'
                }}>
                    <span style={{ fontSize: '1.25rem' }}>💬</span>
                    <div>
                        <div style={{ fontWeight: 600, marginBottom: '4px' }}>Чат создан</div>
                        <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Вы можете написать модели</div>
                    </div>
                    <button
                        onClick={() => {
                            setChatToast(null)
                            navigate('/messages')
                        }}
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.3)',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        Перейти в чат →
                    </button>
                    <button
                        onClick={() => setChatToast(null)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'rgba(255,255,255,0.7)',
                            cursor: 'pointer',
                            fontSize: '1.1rem',
                            padding: '0 4px'
                        }}
                    >
                        ✕
                    </button>
                </div>
            )}

            <div className="castings-list">
                {castings.length === 0 ? (
                    <div className="empty-state card">
                        <div className="empty-icon">📋</div>
                        <h3>У вас пока нет кастингов</h3>
                        <p>Создайте первый кастинг, чтобы начать получать отклики</p>
                        <Link to="/castings/create" className="btn btn-primary">
                            Создать кастинг
                        </Link>
                    </div>
                ) : (
                    castings.map(casting => (
                        <div key={casting.id} className="casting-card card">
                            <div className="casting-card-header">
                                <div className="casting-info">
                                    <h3>{casting.title}</h3>
                                    <div className="casting-meta">
                                        <span>📍 {casting.city}</span>
                                        <span>👁 {casting.views_count || 0}</span>
                                        <span>📝 {casting.responses_count || 0} откликов</span>
                                    </div>
                                </div>
                                <div className="casting-pay">
                                    {casting.pay_min || casting.pay_max ? (
                                        <span className="pay-amount">
                                            ₸{(casting.pay_min || 0).toLocaleString()}
                                            {casting.pay_max && ` - ${casting.pay_max.toLocaleString()}`}
                                        </span>
                                    ) : (
                                        <span className="pay-negotiable">По договоренности</span>
                                    )}
                                </div>
                            </div>

                            <p className="casting-description">
                                {casting.description?.substring(0, 150)}
                                {casting.description?.length > 150 && '...'}
                            </p>

                            <div className="casting-actions">
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => navigate(`/castings/edit/${casting.id}`)}
                                >
                                    ✏️ Редактировать
                                </button>
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => toggleResponses(casting.id)}
                                >
                                    {expandedResponses[casting.id] ? '🔼 Скрыть отклики' : '🔽 Показать отклики'}
                                </button>
                                <Link
                                    to={`/castings/${casting.id}`}
                                    className="btn btn-secondary btn-sm"
                                >
                                    👁 Просмотр
                                </Link>
                            </div>

                            {expandedResponses[casting.id] && (
                                <div className="responses-section">
                                    <h4>Отклики ({expandedResponses[casting.id].length})</h4>
                                    {expandedResponses[casting.id].length === 0 ? (
                                        <p className="no-responses">Пока нет откликов</p>
                                    ) : (
                                        <div className="responses-list">
                                            {expandedResponses[casting.id].map(response => {
                                                const badge = getStatusBadge(response.status)
                                                return (
                                                    <div key={response.id} className="response-item">
                                                        <div className="response-user">
                                                            <div className="response-avatar">
                                                                {response.model_name?.[0]?.toUpperCase() || '?'}
                                                            </div>
                                                            <div className="response-info">
                                                                <Link to={`/profile/${response.model_id}`} className="response-name">
                                                                    {response.model_name || 'Модель'}
                                                                </Link>
                                                                <span className={`badge ${badge.class}`}>{badge.label}</span>
                                                            </div>
                                                        </div>
                                                        {response.cover_letter && (
                                                            <p className="response-letter">{response.cover_letter}</p>
                                                        )}
                                                        {response.status === 'pending' && (
                                                            <div className="response-actions">
                                                                <button
                                                                    className="btn btn-success btn-sm"
                                                                    onClick={() => updateResponseStatus(response.id, 'approved', casting.id)}
                                                                >
                                                                    ✓ Одобрить
                                                                </button>
                                                                <button
                                                                    className="btn btn-error btn-sm"
                                                                    onClick={() => updateResponseStatus(response.id, 'rejected', casting.id)}
                                                                >
                                                                    ✕ Отклонить
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
