import { useState, useEffect } from 'react'
import { subscriptionApi } from '../api/client'
import { useAuth } from '../hooks/useAuth.jsx'
import './Subscriptions.css'

const PLANS = [
    {
        id: 'free',
        name: 'Free',
        price: 0,
        period: 'месяц',
        features: [
            '20 откликов в месяц',
            'Базовый профиль',
            'Поиск кастингов',
        ],
        notIncluded: [
            'Приоритет в поиске',
            'Верификация',
            'Статистика',
        ]
    },
    {
        id: 'start',
        name: 'Start',
        price: 2990,
        period: 'месяц',
        popular: true,
        features: [
            '100 откликов в месяц',
            'Приоритет в поиске',
            'Верификация профиля',
            'Расширенная статистика',
        ],
        notIncluded: [
            'Безлимитные отклики',
            'Продвижение профиля',
        ]
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 5990,
        period: 'месяц',
        features: [
            'Безлимитные отклики',
            'Топ в поиске',
            'Верификация + значок Pro',
            'Полная статистика',
            'Продвижение профиля',
            'Приоритетная поддержка',
        ],
        notIncluded: []
    }
]

export default function Subscriptions() {
    const { profile } = useAuth()
    const [currentPlan, setCurrentPlan] = useState('free')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        loadCurrentPlan()
    }, [])

    async function loadCurrentPlan() {
        try {
            const data = await subscriptionApi.getCurrent()
            if (data?.plan) {
                setCurrentPlan(data.plan)
            }
        } catch (err) {
            // No subscription
        }
    }

    async function handleSubscribe(planId) {
        if (planId === 'free' || planId === currentPlan) return

        setLoading(true)
        try {
            await subscriptionApi.subscribe({ plan: planId })
            setCurrentPlan(planId)
            alert('Подписка успешно оформлена!')
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

            <div className="plans-grid">
                {PLANS.map(plan => (
                    <div
                        key={plan.id}
                        className={`plan-card ${plan.popular ? 'popular' : ''} ${currentPlan === plan.id ? 'current' : ''}`}
                    >
                        {plan.popular && (
                            <span className="popular-badge">Популярный</span>
                        )}

                        <h3 className="plan-name">{plan.name}</h3>

                        <div className="plan-price">
                            <span className="price-amount">
                                {plan.price === 0 ? 'Бесплатно' : `₸${plan.price.toLocaleString()}`}
                            </span>
                            {plan.price > 0 && (
                                <span className="price-period">/{plan.period}</span>
                            )}
                        </div>

                        <ul className="plan-features">
                            {plan.features.map((feature, i) => (
                                <li key={i} className="feature-item included">
                                    <span className="feature-icon">✓</span>
                                    {feature}
                                </li>
                            ))}
                            {plan.notIncluded.map((feature, i) => (
                                <li key={i} className="feature-item not-included">
                                    <span className="feature-icon">✕</span>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <button
                            className={`btn ${currentPlan === plan.id ? 'btn-secondary' : 'btn-primary'} plan-btn`}
                            onClick={() => handleSubscribe(plan.id)}
                            disabled={loading || currentPlan === plan.id}
                        >
                            {currentPlan === plan.id ? 'Текущий план' : 'Выбрать'}
                        </button>
                    </div>
                ))}
            </div>

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
