import { useState, useEffect } from 'react'
import './BillingHistory.css'

export default function BillingHistory() {
    const [billingHistory, setBillingHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        loadBillingHistory()
    }, [])

    async function loadBillingHistory() {
        try {
            // TODO: Replace with actual API call when available
            // const data = await subscriptionApi.getBillingHistory()
            
            // Mock data for now
            const mockData = [
                {
                    id: 'pay_001',
                    date: '2024-01-15T10:30:00Z',
                    amount: 2990,
                    currency: 'KZT',
                    status: 'completed',
                    description: 'Подписка Start - Январь 2024',
                    payment_method: 'Kaspi Pay',
                    invoice_url: '#'
                },
                {
                    id: 'pay_002',
                    date: '2023-12-15T10:30:00Z',
                    amount: 2990,
                    currency: 'KZT',
                    status: 'completed',
                    description: 'Подписка Start - Декабрь 2023',
                    payment_method: 'Kaspi Pay',
                    invoice_url: '#'
                },
                {
                    id: 'pay_003',
                    date: '2023-11-15T10:30:00Z',
                    amount: 5990,
                    currency: 'KZT',
                    status: 'completed',
                    description: 'Подписка Pro - Ноябрь 2023',
                    payment_method: 'Kaspi Pay',
                    invoice_url: '#'
                }
            ]
            
            setBillingHistory(mockData)
        } catch (err) {
            setError(err.message || 'Ошибка при загрузке истории платежей')
        } finally {
            setLoading(false)
        }
    }

    function formatDate(dateStr) {
        return new Date(dateStr).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    function getStatusBadge(status) {
        const statusMap = {
            completed: { text: 'Оплачено', class: 'badge-success' },
            pending: { text: 'В обработке', class: 'badge-warning' },
            failed: { text: 'Ошибка', class: 'badge-danger' },
            refunded: { text: 'Возврат', class: 'badge-secondary' }
        }
        
        const config = statusMap[status] || { text: status, class: 'badge-secondary' }
        return <span className={`badge ${config.class}`}>{config.text}</span>
    }

    if (loading) {
        return (
            <div className="billing-history">
                <h3>История платежей</h3>
                <div className="billing-history__loading">
                    <div className="skeleton-item">
                        <div className="skeleton-line"></div>
                        <div className="skeleton-line short"></div>
                    </div>
                    <div className="skeleton-item">
                        <div className="skeleton-line"></div>
                        <div className="skeleton-line short"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="billing-history">
                <h3>История платежей</h3>
                <div className="billing-history__error">
                    ⚠️ {error}
                </div>
            </div>
        )
    }

    return (
        <div className="billing-history">
            <div className="billing-history__header">
                <h3>История платежей</h3>
                <span className="billing-history__count">
                    {billingHistory.length} платеж{billingHistory.length !== 1 ? 'ей' : ''}
                </span>
            </div>

            {billingHistory.length === 0 ? (
                <div className="billing-history__empty">
                    <div className="empty-icon">📄</div>
                    <p>Нет истории платежей</p>
                    <small>Здесь будут отображаться ваши платежи</small>
                </div>
            ) : (
                <div className="billing-history__list">
                    {billingHistory.map(payment => (
                        <div key={payment.id} className="billing-item">
                            <div className="billing-item__main">
                                <div className="billing-item__info">
                                    <h4 className="billing-item__description">
                                        {payment.description}
                                    </h4>
                                    <div className="billing-item__meta">
                                        <span className="billing-item__date">
                                            {formatDate(payment.date)}
                                        </span>
                                        <span className="billing-item__method">
                                            {payment.payment_method}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="billing-item__right">
                                    <div className="billing-item__amount">
                                        ₸{payment.amount.toLocaleString()}
                                    </div>
                                    {getStatusBadge(payment.status)}
                                </div>
                            </div>
                            
                            {payment.invoice_url && payment.status === 'completed' && (
                                <div className="billing-item__actions">
                                    <a 
                                        href={payment.invoice_url} 
                                        className="btn btn-outline-secondary btn-sm"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Скачать чек
                                    </a>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
