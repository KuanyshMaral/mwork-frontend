import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { castingApi, responseApi, subscriptionApi } from '../api/client'
import { useAuth } from '../hooks/useAuth.jsx'
import LimitReachedModal from '../components/subscription/LimitReachedModal'
import './CastingDetail.css'

export default function CastingDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [casting, setCasting] = useState(null)
    const [loading, setLoading] = useState(true)
    const [applying, setApplying] = useState(false)
    const [applied, setApplied] = useState(false)
    const [applyError, setApplyError] = useState(null)
    const [showLimitModal, setShowLimitModal] = useState(false)
    const [limitModalData, setLimitModalData] = useState({})

    useEffect(() => {
        loadCasting()
    }, [id])

    async function loadCasting() {
        try {
            const data = await castingApi.getById(id)
            setCasting(data)
        } catch (err) {
            console.error('Failed to load casting:', err)
        } finally {
            setLoading(false)
        }
    }

    async function handleApply() {
        if (!user) {
            navigate('/login')
            return
        }

        setApplying(true)
        setApplyError(null)
        try {
            await responseApi.apply(id)
            setApplied(true)
        } catch (err) {
            console.error('Apply error:', err)
            
            // Handle 429 Too Many Requests (limit reached)
            if (err.status === 429) {
                const limitData = err.data || {}
                setLimitModalData({
                    limitType: 'responses',
                    currentUsage: limitData.current_usage || 0,
                    limit: limitData.limit || 0,
                    upgradeTo: limitData.upgrade_to_plan_id,
                    planInfo: limitData.recommended_plan
                })
                setShowLimitModal(true)
                return
            }
            
            // Handle specific errors
            if (err.message?.includes('already applied')) {
                setApplied(true)
            } else if (err.message?.includes('profile')) {
                setApplyError('Сначала создайте профиль')
            } else if (err.message?.includes('model')) {
                setApplyError('Только модели могут откликаться')
            } else if (err.message?.includes('not active')) {
                setApplyError('Кастинг закрыт')
            } else {
                setApplyError(err.message || 'Ошибка при отклике')
            }
        } finally {
            setApplying(false)
        }
    }

    if (loading) {
        return <div className="loading">Загрузка...</div>
    }

    if (!casting) {
        return (
            <div className="not-found">
                <h2>Кастинг не найден</h2>
                <Link to="/castings" className="btn btn-secondary">Вернуться к списку</Link>
            </div>
        )
    }

    return (
        <div className="casting-detail animate-fadeIn">
            <div className="page-header">
                <Link to="/castings" className="back-link">← Назад к кастингам</Link>
            </div>

            <div className="casting-content">
                <div className="casting-main">
                    {/* Header */}
                    <div className="casting-header-card card">
                        {casting.is_urgent && (
                            <span className="badge badge-warning">Срочно</span>
                        )}

                        <h1>{casting.title}</h1>

                        <div className="casting-meta">
                            <span>📍 {casting.city}</span>
                            <span>👁 {casting.views_count || 0} просмотров</span>
                            <span>📅 {new Date(casting.created_at).toLocaleDateString('ru-RU')}</span>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="card mt-3">
                        <h3>Описание</h3>
                        <p className="description-text">{casting.description}</p>
                    </div>

                    {/* Requirements */}
                    {casting.requirements && (
                        <div className="card mt-3">
                            <h3>Требования</h3>
                            <div className="requirements-grid">
                                {casting.required_gender && (
                                    <div className="req-item">
                                        <span className="req-label">Пол</span>
                                        <span className="req-value">{casting.required_gender}</span>
                                    </div>
                                )}
                                {casting.min_age && (
                                    <div className="req-item">
                                        <span className="req-label">Возраст</span>
                                        <span className="req-value">{casting.min_age}-{casting.max_age} лет</span>
                                    </div>
                                )}
                                {casting.min_height && (
                                    <div className="req-item">
                                        <span className="req-label">Рост</span>
                                        <span className="req-value">{casting.min_height}-{casting.max_height} см</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="casting-sidebar">
                    <div className="card apply-card">
                        <div className="pay-info">
                            <span className="pay-label">Оплата</span>
                            <span className="pay-amount">
                                {casting.payment_amount
                                    ? `₸${casting.payment_amount.toLocaleString()}`
                                    : casting.payment_type === 'negotiable'
                                        ? 'По договоренности'
                                        : 'TFP'
                                }
                            </span>
                        </div>

                        {applied ? (
                            <button className="btn btn-success btn-lg" disabled>
                                ✓ Вы откликнулись
                            </button>
                        ) : (
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={handleApply}
                                disabled={applying}
                            >
                                {applying ? 'Отправка...' : 'Откликнуться'}
                            </button>
                        )}

                        {applyError && (
                            <div className="apply-error">
                                ⚠️ {applyError}
                            </div>
                        )}

                        {applied && (
                            <p className="apply-note">
                                Ожидайте ответа от работодателя. После одобрения вы сможете начать чат.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Limit Reached Modal */}
            {showLimitModal && (
                <LimitReachedModal
                    onClose={() => setShowLimitModal(false)}
                    limitType={limitModalData.limitType}
                    currentUsage={limitModalData.currentUsage}
                    limit={limitModalData.limit}
                    upgradeTo={limitModalData.upgradeTo}
                    planInfo={limitModalData.planInfo}
                />
            )}
        </div>
    )
}
