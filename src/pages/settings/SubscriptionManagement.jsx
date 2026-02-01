import { useState, useEffect } from 'react'
import { subscriptionApi } from '../../api/client'
import { useAuth } from '../../hooks/useAuth.jsx'
import BillingHistory from '../subscription/BillingHistory'
import CancelSubscriptionModal from '../subscription/CancelSubscriptionModal'
import './SubscriptionManagement.css'

export default function SubscriptionManagement() {
    const { profile } = useAuth()
    const [currentSubscription, setCurrentSubscription] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [cancelling, setCancelling] = useState(false)

    useEffect(() => {
        loadCurrentSubscription()
    }, [])

    async function loadCurrentSubscription() {
        try {
            const data = await subscriptionApi.getCurrent()
            setCurrentSubscription(data)
        } catch (err) {
            console.error('Failed to load subscription:', err)
            // Set fallback data for development
            setCurrentSubscription({
                id: 'fallback-id',
                plan_id: 'free',
                plan: {
                    id: 'free',
                    name: 'Free',
                    price_monthly: 0,
                    max_photos: 3,
                    max_responses_month: 5,
                    can_chat: false,
                    can_see_viewers: false,
                    priority_search: false
                },
                status: 'active',
                started_at: new Date().toISOString(),
                billing_period: 'monthly',
                days_remaining: -1,
                auto_renew: false
            })
        } finally {
            setLoading(false)
        }
    }

    async function handleCancel(reason) {
        setCancelling(true)
        try {
            await subscriptionApi.cancel(reason)
            await loadCurrentSubscription()
            setShowCancelModal(false)
            alert('Подписка отменена')
        } catch (err) {
            alert(err.message || 'Ошибка при отмене подписки')
        } finally {
            setCancelling(false)
        }
    }

    function formatDate(dateStr) {
        if (!dateStr) return '—'
        return new Date(dateStr).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    function getStatusBadge(status) {
        const statusMap = {
            active: { text: 'Активна', class: 'badge-success' },
            cancelled: { text: 'Отменена', class: 'badge-danger' },
            expired: { text: 'Истекла', class: 'badge-secondary' },
            past_due: { text: 'Просрочена', class: 'badge-warning' }
        }
        
        const config = statusMap[status] || { text: status, class: 'badge-secondary' }
        return <span className={`badge ${config.class}`}>{config.text}</span>
    }

    if (loading) {
        return <div className="loading">Загрузка...</div>
    }

    if (!currentSubscription) {
        return (
            <div className="subscription-management">
                <div className="page-header">
                    <h1>Управление подпиской</h1>
                    <p>У вас нет активной подписки</p>
                </div>
                
                <div className="no-subscription">
                    <div className="no-subscription-icon">📦</div>
                    <h3>Нет активной подписки</h3>
                    <p>Выберите подходящий тарифный план</p>
                    <a href="/subscriptions" className="btn btn-primary">Выбрать план</a>
                </div>
            </div>
        )
    }

    const plan = currentSubscription.plan || currentSubscription

    return (
        <div className="subscription-management">
            <div className="page-header">
                <h1>Управление подпиской</h1>
                <p>Управляйте вашей текущей подпиской</p>
            </div>

            {/* Current Subscription Card */}
            <div className="subscription-overview card">
                <div className="subscription-header">
                    <div>
                        <h2>{plan.name || 'Free'}</h2>
                        {getStatusBadge(currentSubscription.status)}
                    </div>
                    <div className="subscription-price">
                        <span className="price-amount">
                            {plan.price_monthly === 0 
                                ? 'Бесплатно' 
                                : `₸${plan.price_monthly?.toLocaleString()}`
                            }
                        </span>
                        <span className="price-period">
                            {currentSubscription.billing_period === 'yearly' ? '/год' : '/месяц'}
                        </span>
                    </div>
                </div>

                <div className="subscription-details">
                    <div className="detail-row">
                        <span className="detail-label">Начало подписки:</span>
                        <span className="detail-value">{formatDate(currentSubscription.started_at)}</span>
                    </div>
                    {currentSubscription.expires_at && (
                        <div className="detail-row">
                            <span className="detail-label">Истекает:</span>
                            <span className="detail-value">{formatDate(currentSubscription.expires_at)}</span>
                        </div>
                    )}
                    <div className="detail-row">
                        <span className="detail-label">Способ оплаты:</span>
                        <span className="detail-value">Kaspi Pay</span>
                    </div>
                </div>

                {currentSubscription.status === 'active' && plan.id !== 'free' && (
                    <div className="subscription-actions">
                        <button 
                            className="btn btn-outline-danger"
                            onClick={() => setShowCancelModal(true)}
                        >
                            Отменить подписку
                        </button>
                        <a href="/subscriptions" className="btn btn-primary">
                            Изменить план
                        </a>
                    </div>
                )}
            </div>

            {/* Usage Limits */}
            <div className="usage-section">
                <h3>Использование лимитов</h3>
                <div className="usage-grid">
                    <div className="usage-item">
                        <span className="usage-label">Фотографии</span>
                        <span className="usage-count">
                            {currentSubscription.usage?.photos_used || 0} / {plan.max_photos || '∞'}
                        </span>
                    </div>
                    <div className="usage-item">
                        <span className="usage-label">Отклики</span>
                        <span className="usage-count">
                            {currentSubscription.usage?.responses_used || 0} / {plan.max_responses_month === -1 ? '∞' : plan.max_responses_month}
                        </span>
                    </div>
                    <div className="usage-item">
                        <span className="usage-label">Кастинги</span>
                        <span className="usage-count">
                            {currentSubscription.usage?.castings_used || 0} / 3
                        </span>
                    </div>
                </div>
            </div>

            {/* Billing History */}
            <BillingHistory />

            {/* Cancel Modal */}
            {showCancelModal && (
                <CancelSubscriptionModal
                    onClose={() => setShowCancelModal(false)}
                    onConfirm={handleCancel}
                    loading={cancelling}
                />
            )}
        </div>
    )
}
