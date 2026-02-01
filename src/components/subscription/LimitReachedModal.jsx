import { useState } from 'react'
import { subscriptionApi } from '../../api/client'
import './LimitReachedModal.css'

export default function LimitReachedModal({ 
    onClose, 
    limitType, 
    currentUsage, 
    limit, 
    upgradeTo, 
    planInfo 
}) {
    const [loading, setLoading] = useState(false)

    async function handleUpgrade(planId, billingPeriod = 'monthly') {
        setLoading(true)
        try {
            await subscriptionApi.subscribe(planId, billingPeriod)
            onClose()
            alert('Подписка успешно оформлена!')
            window.location.reload() // Reload to update limits
        } catch (err) {
            alert(err.message || 'Ошибка при оформлении подписки')
        } finally {
            setLoading(false)
        }
    }

    function getLimitMessage() {
        const messages = {
            responses: {
                title: 'Лимит откликов исчерпан',
                description: 'Вы достигли лимита откликов на этой неделе. Обновите подписку для продолжения.',
                icon: '📤'
            },
            castings: {
                title: 'Лимит кастингов исчерпан',
                description: 'Вы достигли лимита активных кастингов. Обновите подписку для создания новых.',
                icon: '🎬'
            },
            photos: {
                title: 'Лимит фотографий исчерпан',
                description: 'Вы достигли лимита фотографий в профиле. Обновите подписку для загрузки новых.',
                icon: '📸'
            }
        }
        
        return messages[limitType] || messages.responses
    }

    const message = getLimitMessage()

    return (
        <div className="modal-overlay">
            <div className="limit-reached-modal">
                <div className="modal-header">
                    <div className="limit-icon">{message.icon}</div>
                    <h3>{message.title}</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="limit-info">
                        <p>{message.description}</p>
                        
                        <div className="usage-bar">
                            <div className="usage-label">
                                Текущее использование: <strong>{currentUsage} / {limit}</strong>
                            </div>
                            <div className="progress-container">
                                <div 
                                    className="progress-bar over-limit" 
                                    style={{ width: '100%' }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {upgradeTo && planInfo && (
                        <div className="upgrade-section">
                            <h4>Обновите до {planInfo.name}</h4>
                            <div className="plan-preview">
                                <div className="plan-price">
                                    <span className="price-amount">
                                        {planInfo.price === 0 ? 'Бесплатно' : `₸${planInfo.price?.toLocaleString()}`}
                                    </span>
                                    <span className="price-period">
                                        {planInfo.billing_period === 'yearly' ? '/год' : '/месяц'}
                                    </span>
                                </div>
                                
                                {planInfo.features && (
                                    <ul className="plan-features">
                                        {planInfo.features.slice(0, 3).map((feature, i) => (
                                            <li key={i} className="feature-item">
                                                <span className="feature-icon">✓</span>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="benefits-section">
                        <h4>Что вы получите:</h4>
                        <ul className="benefits-list">
                            <li>Увеличенные лимиты на все функции</li>
                            <li>Приоритетная поддержка</li>
                            <li>Доступ к эксклюзивным функциям</li>
                            <li>Отмена в любой момент</li>
                        </ul>
                    </div>
                </div>

                <div className="modal-footer">
                    <button 
                        className="btn btn-secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Позже
                    </button>
                    
                    {upgradeTo && planInfo && (
                        <button
                            className="btn btn-primary"
                            onClick={() => handleUpgrade(upgradeTo, planInfo.billing_period)}
                            disabled={loading}
                        >
                            {loading ? 'Обработка...' : `Обновить до ${planInfo.name}`}
                        </button>
                    )}
                    
                    {!upgradeTo && (
                        <a href="/subscriptions" className="btn btn-primary">
                            Выбрать план
                        </a>
                    )}
                </div>
            </div>
        </div>
    )
}
