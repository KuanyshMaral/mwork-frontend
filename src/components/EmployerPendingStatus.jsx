import { useState, useEffect } from 'react'
import { authApi } from '../api/client'
import './EmployerPendingStatus.css'

export default function EmployerPendingStatus() {
    const [userStatus, setUserStatus] = useState('pending')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        checkStatus()
        
        // Проверяем статус каждые 30 секунд
        const interval = setInterval(checkStatus, 30000)
        return () => clearInterval(interval)
    }, [])

    const checkStatus = async () => {
        try {
            const userData = await authApi.me()
            setUserStatus(userData.user_verification_status || 'none')
        } catch (error) {
            console.error('Failed to check status:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="employer-pending-container">
                <div className="employer-pending-card">
                    <div className="loading-spinner"></div>
                    <p>Загрузка...</p>
                </div>
            </div>
        )
    }

    if (userStatus === 'approved') {
        // Если статус изменился на approved, перезагружаем страницу или перенаправляем
        window.location.href = '/dashboard'
        return null
    }

    if (userStatus === 'rejected') {
        return (
            <div className="employer-pending-container">
                <div className="employer-pending-card rejected">
                    <div className="status-icon rejected">✕</div>
                    <h1>Заявка отклонена</h1>
                    <p>К сожалению, ваша заявка на регистрацию была отклонена.</p>
                    <p>Возможные причины:</p>
                    <ul>
                        <li>Некорректные данные компании</li>
                        <li>Недействительный БИН/ИНН</li>
                        <li>Подозрительная активность</li>
                    </ul>
                    <p>Вы можете подать новую заявку с корректными данными.</p>
                    <div className="pending-actions">
                        <button 
                            onClick={() => window.location.href = '/register-employer'}
                            className="retry-btn"
                        >
                            Подать новую заявку
                        </button>
                        <button 
                            onClick={() => window.location.href = '/login'}
                            className="back-btn"
                        >
                            На страницу входа
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // Default: pending status
    return (
        <div className="employer-pending-container">
            <div className="employer-pending-card">
                <div className="status-icon pending">
                    <div className="hourglass"></div>
                </div>
                
                <h1>Ваша заявка на рассмотрении</h1>
                
                <div className="pending-message">
                    <h2>📋 Статус: На модерации</h2>
                    <p>
                        Мы проверяем данные вашей компании. Это обычно занимает до 24 часов.
                    </p>
                    <p>
                        Вы получите уведомление на email когда ваша заявка будет рассмотрена.
                    </p>
                </div>

                <div className="pending-info">
                    <div className="info-item">
                        <span className="info-icon">📧</span>
                        <div>
                            <strong>Следите за email</strong>
                            <p>Мы отправим уведомление о решении на вашу почту</p>
                        </div>
                    </div>
                    
                    <div className="info-item">
                        <span className="info-icon">🔍</span>
                        <div>
                            <strong>Что мы проверяем</strong>
                            <p>Легальность компании по БИН/ИНН, контактные данные и соответствие требованиям</p>
                        </div>
                    </div>
                    
                    <div className="info-item">
                        <span className="info-icon">⏰</span>
                        <div>
                            <strong>Срок рассмотрения</strong>
                            <p>Обычно до 24 часов в рабочие дни</p>
                        </div>
                    </div>
                </div>

                <div className="pending-actions">
                    <button 
                        onClick={checkStatus}
                        className="refresh-btn"
                    >
                        Проверить статус
                    </button>
                    <button 
                        onClick={() => {
                            localStorage.removeItem('token')
                            localStorage.removeItem('refreshToken')
                            window.location.href = '/login'
                        }}
                        className="logout-btn"
                    >
                        Выйти
                    </button>
                </div>

                <div className="pending-help">
                    <h3>Нужна помощь?</h3>
                    <p>
                        Если у вас есть вопросы по статусу заявки, свяжитесь с нами:
                    </p>
                    <div className="help-contacts">
                        <a href="mailto:support@mwork.kz">support@mwork.kz</a>
                        <a href="tel:+77271234567">+7 727 123 45 67</a>
                    </div>
                </div>
            </div>
        </div>
    )
}
