import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/client'
import './EmployerRegister.css'

export default function EmployerRegister() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        companyName: '',
        city: '',
        representativePhone: '',
        companyDescription: '',
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        // Валидация
        if (formData.password !== formData.confirmPassword) {
            setError('Пароли не совпадают')
            setLoading(false)
            return
        }

        if (formData.password.length < 8) {
            setError('Пароль должен содержать минимум 8 символов')
            setLoading(false)
            return
        }

        try {
            // Создаем пользователя с ролью employer
            const userData = {
                email: formData.email,
                password: formData.password,
                role: 'employer'
            }
            
            console.log('Creating employer user:', userData)
            await authApi.register(userData)
            console.log('Employer user created successfully')

            setSuccess(true)
        } catch (err) {
            console.error('Registration error:', err)
            setError(err.message || 'Ошибка при регистрации')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="employer-register-page">
                <div className="employer-register-card">
                    <div className="employer-register-header">
                        <h1>Заявка отправлена</h1>
                        <div className="success-icon">✓</div>
                    </div>
                    
                    <div className="success-message">
                        <h2>Ваша заявка принята!</h2>
                        <p>Мы проверяем данные вашей компании. Это занимает до 24 часов.</p>
                        <p>Вы получите уведомление на email когда ваша заявка будет рассмотрена.</p>
                    </div>

                    <div className="success-actions">
                        <button 
                            onClick={() => navigate('/login')}
                            className="back-to-login-btn"
                        >
                            На страницу входа
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="employer-register-page">
            <div className="employer-register-card">
                <div className="employer-register-header">
                    <h1>Регистрация работодателя</h1>
                    <p>Заполните данные вашей компании для проверки</p>
                </div>

                {error && (
                    <div className="employer-register-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="employer-register-form">
                    {/* Персональные данные */}
                    <div className="form-section">
                        <h3>👤 Личные данные</h3>
                        
                        <div className="form-row">
                            <div className="form-field">
                                <label>Имя *</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="Иван"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-field">
                                <label>Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="company@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-field">
                                <label>Пароль *</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Минимум 6 символов"
                                    required
                                />
                            </div>
                            <div className="form-field">
                                <label>Подтвердите пароль *</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Повторите пароль"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Данные компании */}
                    <div className="form-section">
                        <h3>🏢 Данные компании</h3>
                        
                        <div className="form-row">
                            <div className="form-field">
                                <label>Название компании *</label>
                                <input
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    placeholder="ООО 'Моя Компания'"
                                    required
                                />
                            </div>
                            <div className="form-field">
                                <label>Город *</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="Алматы"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-field">
                                <label>БИН/ИНН *</label>
                                <input
                                    type="text"
                                    name="taxId"
                                    value={formData.taxId}
                                    onChange={handleChange}
                                    placeholder="123456789012"
                                    required
                                />
                                <small>Для проверки легальности компании</small>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-field">
                                <label>Телефон представителя *</label>
                                <input
                                    type="tel"
                                    name="representativePhone"
                                    value={formData.representativePhone}
                                    onChange={handleChange}
                                    placeholder="+7 (701) 123-45-67"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-field">
                                <label>Telegram (опционально)</label>
                                <input
                                    type="text"
                                    name="representativeTelegram"
                                    value={formData.representativeTelegram}
                                    onChange={handleChange}
                                    placeholder="@company_telegram"
                                />
                            </div>
                            <div className="form-field">
                                <label>Сайт компании (опционально)</label>
                                <input
                                    type="url"
                                    name="companyWebsite"
                                    value={formData.companyWebsite}
                                    onChange={handleChange}
                                    placeholder="https://company-website.kz"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-field full-width">
                                <label>Описание компании *</label>
                                <textarea
                                    name="companyDescription"
                                    value={formData.companyDescription}
                                    onChange={handleChange}
                                    placeholder="Расскажите о вашей компании и сфере деятельности..."
                                    rows={4}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="employer-register-btn"
                        disabled={loading}
                    >
                        {loading ? 'Отправка...' : 'Отправить на модерацию'}
                    </button>
                </form>

                <div className="register-footer">
                    <p>Уже есть аккаунт? <a href="/login">Войдите</a></p>
                    <p><a href="/register">Регистрация для моделей</a></p>
                </div>
            </div>
        </div>
    )
}
