import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { castingApi, responseApi, subscriptionApi } from '../api/client'
import { useAuth } from '../hooks/useAuth.jsx'
import { useCredits } from '../context/CreditsContext'
import LimitReachedModal from '../components/subscription/LimitReachedModal'
import ApplyCreditConfirmModal from '../components/credits/ApplyCreditConfirmModal'
import InsufficientCreditsModal from '../components/credits/InsufficientCreditsModal'
import './CastingDetail.css'

export default function CastingDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user, profile } = useAuth()
    const { balance, hasEnoughCredits, deductCredits, getPreventionFlag, setPreventionFlag } = useCredits()

    const [casting, setCasting] = useState(null)
    const [loading, setLoading] = useState(true)
    const [applying, setApplying] = useState(false)
    const [applied, setApplied] = useState(false)
    const [applyError, setApplyError] = useState(null)
    const [showLimitModal, setShowLimitModal] = useState(false)
    const [limitModalData, setLimitModalData] = useState({})
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [showInsufficientModal, setShowInsufficientModal] = useState(false)
    const [successMessage, setSuccessMessage] = useState(null)
    const [geoWarningDismissed, setGeoWarningDismissed] = useState(false)
    
    const CREDIT_COST = 1

    const isEventDateClose = (dateStr) => {
        if (!dateStr) return false
        const eventDate = new Date(dateStr)
        const now = new Date()
        const diffDays = (eventDate - now) / (1000 * 60 * 60 * 24)
        return diffDays >= 0 && diffDays <= 3
    }

    const userCity = profile?.city || user?.city || ''
    const castingCity = casting?.city || ''
    const citiesMismatch = userCity && castingCity && userCity.toLowerCase() !== castingCity.toLowerCase()
    const isUrgentOrClose = casting?.is_urgent || isEventDateClose(casting?.event_date)
    const showGeoWarning = citiesMismatch && isUrgentOrClose && !geoWarningDismissed && !applied

    function getCompetitionLevel(count) {
        if (count === 0 || count === undefined) return { level: 'low', color: '#10b981', label: 'Низкая' }
        if (count <= 5) return { level: 'low', color: '#10b981', label: 'Низкая' }
        if (count <= 15) return { level: 'medium', color: '#f59e0b', label: 'Средняя' }
        if (count <= 30) return { level: 'high', color: '#ef4444', label: 'Высокая' }
        return { level: 'very_high', color: '#dc2626', label: 'Очень высокая' }
    }

    useEffect(() => {
        loadCasting()
    }, [id])

    async function loadCasting() {
        try {
            // For demo castings, use demo data
            if (id.startsWith('demo-')) {
                console.log('Loading demo casting:', id)
                const demoCasting = {
                    id: id,
                    title: id === 'demo-1' ? 'Модель для рекламной кампании' :
                           id === 'demo-2' ? 'Фотосессия для lookbook' :
                           'Съемки для музыкального клипа',
                    description: id === 'demo-1' ? 'Ищем модель для съемок в рекламной кампании известного бренда. Опыт приветствуется.' :
                               id === 'demo-2' ? 'Нужны модели для создания lookbook нового сезона одежды. Уникальная возможность!' :
                               'Требуются актеры и модели для съемок в музыкальном клипе. Интересный проект!',
                    city: id === 'demo-1' ? 'Алматы' :
                          id === 'demo-2' ? 'Астана' :
                          'Алматы',
                    payment_amount: id === 'demo-1' ? 150000 :
                                   id === 'demo-2' ? 75000 :
                                   50000,
                    payment_type: id === 'demo-1' ? 'fixed' :
                                  id === 'demo-2' ? 'fixed' :
                                  'negotiable',
                    gender: id === 'demo-1' ? 'female' :
                           id === 'demo-2' ? 'any' :
                           'male',
                    age_min: id === 'demo-1' ? 18 :
                               id === 'demo-2' ? 16 :
                               20,
                    age_max: id === 'demo-1' ? 25 :
                               id === 'demo-2' ? 30 :
                               35,
                    views_count: id === 'demo-1' ? 245 :
                                  id === 'demo-2' ? 189 :
                                  156,
                    responses_count: id === 'demo-1' ? 12 :
                                     id === 'demo-2' ? 8 :
                                     23,
                    created_at: id === 'demo-1' ? new Date().toISOString() :
                                 id === 'demo-2' ? new Date(Date.now() - 86400000).toISOString() :
                                 new Date(Date.now() - 172800000).toISOString(),
                    is_urgent: id === 'demo-1'
                }
                setCasting(demoCasting)
                setLoading(false)
                return
            }
            
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

        // Pre-apply balance check
        if (!hasEnoughCredits(CREDIT_COST)) {
            setShowInsufficientModal(true)
            return
        }

        // Show prevention warning if user has seen insufficient modal before
        if (getPreventionFlag() && balance < CREDIT_COST * 2) {
            setShowInsufficientModal(true)
            return
        }

        // Show confirmation modal
        setShowConfirmModal(true)
    }

    async function confirmApply() {
        setApplying(true)
        setApplyError(null)
        setSuccessMessage(null)
        
        try {
            // Optimistic update: increment applicant count immediately
            const currentCount = casting.responses_count || casting.applicants_count || 0
            setCasting(prev => ({
                ...prev,
                responses_count: currentCount + 1,
                applicants_count: currentCount + 1
            }))
            
            // For demo castings, simulate successful application
            if (id.startsWith('demo-')) {
                console.log('Simulating application for demo casting')
                
                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 1000))
                
                // Deduct credits on successful application
                deductCredits(CREDIT_COST)
                
                setApplied(true)
                setSuccessMessage(`Отклик отправлен! Осталось кредитов: ${balance - CREDIT_COST}`)
                
                // Clear success message after 5 seconds
                setTimeout(() => setSuccessMessage(null), 5000)
                return
            }
            
            await responseApi.apply(id)
            
            // Deduct credits on successful application
            deductCredits(CREDIT_COST)
            
            setApplied(true)
            setSuccessMessage(`Отклик отправлен! Осталось кредитов: ${balance - CREDIT_COST}`)
            
            // Clear success message after 5 seconds
            setTimeout(() => setSuccessMessage(null), 5000)
            
        } catch (err) {
            console.error('Apply error:', err)
            
            // Revert optimistic update on error
            const currentCount = casting.responses_count || casting.applicants_count || 0
            setCasting(prev => ({
                ...prev,
                responses_count: Math.max(0, currentCount - 1),
                applicants_count: Math.max(0, currentCount - 1)
            }))
            
            // Handle typed errors
            if (err.type === 'INSUFFICIENT_CREDITS') {
                setShowInsufficientModal(true)
                setPreventionFlag()
                return
            }
            
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
            if (err.type === 'ALREADY_APPLIED' || err.message?.includes('already applied')) {
                setApplied(true)
            } else if (err.type === 'PROFILE_REQUIRED' || err.message?.includes('profile')) {
                setApplyError('Сначала создайте профиль')
            } else if (err.message?.includes('model')) {
                setApplyError('Только модели могут откликаться')
            } else if (err.type === 'CASTING_CLOSED' || err.message?.includes('not active')) {
                setApplyError('Кастинг закрыт')
            } else {
                setApplyError(err.message || 'Ошибка при отклике')
            }
        } finally {
            setApplying(false)
        }
    }

    function handlePurchase(packageData) {
        // Redirect to purchase flow or handle purchase logic
        // This would integrate with your payment system
        console.log('Purchase package:', packageData)
        // For now, just show a message
        alert(`Покупка ${packageData.credits} кредитов за ₸${packageData.price} будет доступна скоро`)
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
                        {casting.status === 'closed' && (
                            <span className="badge badge-danger">Закрыт</span>
                        )}

                        <h1>{casting.title}</h1>

                        <div className="casting-meta">
                            <span>📍 {casting.city}</span>
                            <span>👁 {casting.views_count || 0} просмотров</span>
                            <span 
                                style={{ color: getCompetitionLevel(casting.responses_count || casting.applicants_count || 0).color }}
                                title={`Конкуренция: ${getCompetitionLevel(casting.responses_count || casting.applicants_count || 0).label}`}
                            >
                                🙋‍♀️ {casting.responses_count || casting.applicants_count || 0} {(casting.responses_count || casting.applicants_count || 0) === 1 ? 'отклик' : (casting.responses_count || casting.applicants_count || 0) < 5 ? 'отклика' : 'откликов'}
                            </span>
                            <span>📅 {new Date(casting.created_at).toLocaleDateString('ru-RU')}</span>
                            {casting.status === 'closed' && casting.closed_at && (
                                <span>🔒 Закрыт: {new Date(casting.closed_at).toLocaleDateString('ru-RU')}</span>
                            )}
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

                        {/* Credits balance indicator */}
                        <div style={{ 
                            background: '#f3f4f6', 
                            padding: '12px', 
                            borderRadius: '8px', 
                            marginBottom: '16px',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px' }}>
                                Ваш баланс
                            </div>
                            <div style={{ 
                                fontSize: '1.25rem', 
                                fontWeight: '700', 
                                color: hasEnoughCredits(CREDIT_COST) ? '#10b981' : '#ef4444' 
                            }}>
                                {balance} кредит{balance !== 1 ? 'ов' : ''}
                            </div>
                        </div>

                        {showGeoWarning && (
                            <div style={{
                                padding: '12px 16px',
                                background: '#fef3c7',
                                border: '1px solid #f59e0b',
                                borderRadius: '8px',
                                marginBottom: '12px',
                                fontSize: '0.85rem',
                                color: '#92400e'
                            }}>
                                <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                                    ⚠️ Города не совпадают
                                </div>
                                <div>
                                    Ваш город: <strong>{userCity}</strong>, кастинг: <strong>{castingCity}</strong>.
                                    {casting.is_urgent && ' Это срочный кастинг.'}
                                    {' '}Отклик может быть отклонён, если вы не сможете прибыть вовремя.
                                </div>
                                <button
                                    style={{
                                        marginTop: '8px',
                                        padding: '4px 12px',
                                        fontSize: '0.8rem',
                                        background: '#f59e0b',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => setGeoWarningDismissed(true)}
                                >
                                    Понятно, продолжить
                                </button>
                            </div>
                        )}

                        {citiesMismatch && !isUrgentOrClose && !applied && (
                            <div style={{
                                padding: '8px 12px',
                                background: '#f0f9ff',
                                border: '1px solid #93c5fd',
                                borderRadius: '8px',
                                marginBottom: '12px',
                                fontSize: '0.8rem',
                                color: '#1e40af'
                            }}>
                                ℹ️ Ваш город ({userCity}) отличается от города кастинга ({castingCity}).
                            </div>
                        )}

                        {applied ? (
                            <button className="btn btn-success btn-lg" disabled>
                                ✓ Вы откликнулись
                            </button>
                        ) : casting.status === 'closed' ? (
                            <button className="btn btn-secondary btn-lg" disabled>
                                🔒 Кастинг закрыт
                            </button>
                        ) : (
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={handleApply}
                                disabled={applying || !hasEnoughCredits(CREDIT_COST)}
                            >
                                {applying ? (
                                    <>
                                        <span className="loading-spinner" style={{ marginRight: '8px' }}></span>
                                        Отправка...
                                    </>
                                ) : (
                                    `Откликнуться (${CREDIT_COST} кредит)`
                                )}
                            </button>
                        )}

                        {successMessage && (
                            <div style={{
                                marginTop: '12px',
                                padding: '10px 12px',
                                background: '#f0fdf4',
                                border: '1px solid #86efac',
                                borderRadius: '8px',
                                color: '#166534',
                                fontSize: '0.875rem'
                            }}>
                                ✓ {successMessage}
                            </div>
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
                        {casting.status === 'closed' && (
                            <p className="apply-note">
                                Этот кастинг закрыт. Закрыт после принятия модели или по решению работодателя.
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

            {/* Apply Confirmation Modal */}
            <ApplyCreditConfirmModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={confirmApply}
                castingTitle={casting?.title || ''}
                creditCost={CREDIT_COST}
            />

            {/* Insufficient Credits Modal */}
            <InsufficientCreditsModal
                isOpen={showInsufficientModal}
                onClose={() => setShowInsufficientModal(false)}
                creditCost={CREDIT_COST}
                onPurchase={handlePurchase}
            />
        </div>
    )
}
