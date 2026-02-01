import { useState, useEffect } from 'react'
import { subscriptionApi } from '../api/client'
import { useAuth } from '../hooks/useAuth.jsx'
import './Subscriptions.css'

export default function Subscriptions() {
    const { profile } = useAuth()
    const [plans, setPlans] = useState([])
    const [currentPlan, setCurrentPlan] = useState(null)
    const [loading, setLoading] = useState(false)
    const [plansLoading, setPlansLoading] = useState(true)
    const [successMessage, setSuccessMessage] = useState('')

    // Auto-hide success message after 5 seconds
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage('')
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [successMessage])

    useEffect(() => {
        loadPlans()
        loadCurrentPlan()
    }, [])

    async function loadPlans() {
        try {
            const data = await subscriptionApi.getPlans()
            setPlans(data || [])
        } catch (err) {
            console.error('Failed to load plans:', err)
            // Fallback to hardcoded plans if API fails
            setPlans([
                {
                    id: 'free',
                    name: 'Free',
                    description: 'Базовый бесплатный план',
                    price_monthly: 0,
                    max_photos: 3,
                    max_responses_month: 5,
                    can_chat: false,
                    can_see_viewers: false,
                    priority_search: false,
                    max_team_members: 0,
                    features: ['3 фотографии', '5 откликов в месяц', 'Базовый профиль']
                },
                {
                    id: 'pro',
                    name: 'Pro',
                    description: 'Профессиональный план для моделей',
                    price_monthly: 3990,
                    max_photos: 100,
                    max_responses_month: -1,
                    can_chat: true,
                    can_see_viewers: true,
                    priority_search: true,
                    max_team_members: 0,
                    features: ['100+ фотографий', 'Безлимитные отклики', 'Чат с работодателями', 'Приоритет в поиске']
                },
                {
                    id: 'agency',
                    name: 'Agency',
                    description: 'План для модельных агентств',
                    price_monthly: 14990,
                    max_photos: 100,
                    max_responses_month: -1,
                    can_chat: true,
                    can_see_viewers: true,
                    priority_search: true,
                    max_team_members: 5,
                    features: ['Управление командой', 'Безлимитные отклики', 'Расширенная аналитика', 'Приоритетная поддержка']
                }
            ])
        } finally {
            setPlansLoading(false)
        }
    }

    async function loadCurrentPlan() {
        try {
            const data = await subscriptionApi.getCurrent()
            if (data?.plan) {
                setCurrentPlan(data.plan)
            }
        } catch (err) {
            console.error('Failed to load current plan:', err)
            // Set fallback for development
            setCurrentPlan({
                id: 'free',
                name: 'Free'
            })
        }
    }

    async function handleSubscribe(planId, billingPeriod = 'monthly') {
        if (planId === 'free' || (currentPlan && currentPlan.id === planId)) return

        setLoading(true)
        setSuccessMessage('')
        try {
            const result = await subscriptionApi.subscribe(planId, billingPeriod)
            
            // Show success message based on result
            if (result.success) {
                const message = planId === 'free' 
                    ? 'Подписка Free успешно оформлена!' 
                    : `Подписка ${planId} успешно оформлена! (В разработке: здесь будет редирект на оплату Kaspi)`
                
                setSuccessMessage(message)
                alert(message) // Also show alert for immediate feedback
                
                // Debug: Log current state
                console.log('Subscribed to plan:', planId)
                console.log('Available plans:', plans)
                console.log('Current plan before update:', currentPlan)
                
                // Immediately update current plan for better UX
                const newPlan = plans.find(p => p.id === planId)
                console.log('Found new plan:', newPlan)
                
                if (newPlan) {
                    setCurrentPlan(newPlan)
                    console.log('Updated current plan to:', newPlan)
                } else {
                    console.error('Plan not found in plans array for ID:', planId)
                }
            }
            
            // Also reload current plan to sync with backend
            await loadCurrentPlan()
        } catch (err) {
            alert(err.message || 'Ошибка при оформлении подписки')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="subscriptions-page animate-fadeIn">
            <div className="page-header">
                <h1>Тарифные планы</h1>
                <p>Выберите план, который подходит именно вам</p>
            </div>

            {currentPlan && (
                <div className="current-plan-badge">
                    <span className="badge badge-primary">
                        Текущий план: {currentPlan.name || 'Free'}
                    </span>
                </div>
            )}

            {successMessage && (
                <div className="success-message" style={{
                    background: '#dcfce7',
                    border: '1px solid #86efac',
                    color: '#166534',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '20px'
                }}>
                    ✅ {successMessage}
                </div>
            )}

            {plansLoading ? (
                <div className="loading">Загрузка планов...</div>
            ) : (
                <div className="plans-grid">
                    {plans.map(plan => (
                        <div
                            key={plan.id}
                            className={`plan-card ${plan.id === 'pro' ? 'popular' : ''} ${currentPlan?.id === plan.id ? 'current' : ''}`}
                        >
                            {plan.id === 'pro' && (
                                <span className="popular-badge">Популярный</span>
                            )}

                            <h3 className="plan-name">{plan.name}</h3>
                            <p className="plan-description">{plan.description}</p>

                            <div className="plan-price">
                                <span className="price-amount">
                                    {plan.price_monthly === 0 ? 'Бесплатно' : `₸${plan.price_monthly.toLocaleString()}`}
                                </span>
                                <span className="price-period">/месяц</span>
                            </div>

                            <ul className="plan-features">
                                {plan.features?.map((feature, i) => (
                                    <li key={i} className="feature-item included">
                                        <span className="feature-icon">✓</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                className={`btn ${currentPlan?.id === plan.id ? 'btn-secondary' : 'btn-primary'} plan-btn`}
                                onClick={() => {
                                    console.log('Button clicked for plan:', plan.id, 'Current plan:', currentPlan?.id)
                                    console.log('Is current plan?', currentPlan?.id === plan.id)
                                    handleSubscribe(plan.id)
                                }}
                                disabled={loading || currentPlan?.id === plan.id}
                            >
                                {currentPlan?.id === plan.id ? 'Текущий план' : 'Выбрать'}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* FAQ */}
            <div className="faq-section">
                <h2>Часто задаваемые вопросы</h2>

                <div className="faq-list">
                    <div className="faq-item">
                        <h4>Можно ли изменить тариф?</h4>
                        <p>Да, вы можете перейти на другой тариф в любое время. При переходе на более дорогой тариф разница будет рассчитана пропорционально.</p>
                    </div>

                    <div className="faq-item">
                        <h4>Какие способы оплаты доступны?</h4>
                        <p>Мы принимаем Kaspi Pay, банковские карты Visa/MasterCard. Годовая подписка — скидка 17%.</p>
                    </div>

                    <div className="faq-item">
                        <h4>Что будет при отмене подписки?</h4>
                        <p>Вы сможете пользоваться преимуществами до конца оплаченного периода, затем аккаунт перейдет на бесплатный тариф.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
