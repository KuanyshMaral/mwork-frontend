import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import './Auth.css'
import './Register.css'

export default function Register() {
    const [step, setStep] = useState('role') // 'role', 'model', 'employer'
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: '',
        // Model fields
        first_name: '',
        city: '',
        // Employer fields
        company_name: '',
        contact_person: '',
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { register } = useAuth()
    const navigate = useNavigate()

    function handleChange(e) {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    function selectRole(role) {
        setFormData(prev => ({ ...prev, role }))
        setStep(role)
    }

    function goBack() {
        setStep('role')
        setFormData(prev => ({ ...prev, role: '' }))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')

        if (formData.password.length < 6) {
            setError('Пароль должен быть минимум 6 символов')
            return
        }

        setLoading(true)

        try {
            await register({
                email: formData.email,
                password: formData.password,
                role: formData.role,
            })
            navigate('/dashboard')
        } catch (err) {
            setError(err.message || 'Ошибка регистрации')
        } finally {
            setLoading(false)
        }
    }

    // Step 1: Role Selection
    if (step === 'role') {
        return (
            <div className="register-page">
                <div className="register-container role-select">
                    <h1 className="register-title">MWork</h1>
                    <p className="register-subtitle">
                        Платформа для взаимодействия моделей и работодателей в сфере
                        <br />
                        <span className="highlight">моды, рекламы, блогинга и искусства</span>
                    </p>

                    <div className="role-cards">
                        {/* Model Card */}
                        <div className="role-card" onClick={() => selectRole('model')}>
                            <div className="role-icon model-icon">
                                <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                </svg>
                            </div>
                            <h3>Я модель</h3>
                            <p className="role-description">
                                Найдите интересные кастинги, создайте
                                <br />
                                профессиональное портфолио и развивайте карьеру
                            </p>
                            <ul className="role-features">
                                <li>Создание профессионального профиля</li>
                                <li>Поиск кастингов и работы</li>
                                <li>Прямое общение с работодателями</li>
                                <li>Управление портфолио</li>
                            </ul>
                            <button className="btn btn-primary role-btn">Регистрация</button>
                            <Link to="/login" className="btn btn-outline role-btn-secondary">Вход</Link>
                        </div>

                        {/* Employer Card */}
                        <div className="role-card employer" onClick={() => selectRole('employer')}>
                            <div className="role-icon employer-icon">
                                <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                                    <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
                                </svg>
                            </div>
                            <h3>Я работодатель</h3>
                            <p className="role-description">
                                Найдите идеальных моделей для ваших проектов,
                                <br />
                                создавайте кастинги и управляйте командой
                            </p>
                            <ul className="role-features">
                                <li>Создание кастингов</li>
                                <li>Поиск моделей по параметрам</li>
                                <li>Управление откликами</li>
                                <li>Аналитика и отчеты</li>
                            </ul>
                            <button className="btn btn-primary role-btn">Регистрация</button>
                            <Link to="/login" className="btn btn-outline role-btn-secondary">Вход</Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Step 2: Model Registration Form
    if (step === 'model') {
        return (
            <div className="register-page">
                <div className="register-form-container">
                    <button className="back-btn" onClick={goBack}>
                        ← Назад
                    </button>

                    <div className="register-form-card">
                        <h2>Регистрация модели</h2>
                        <p className="form-subtitle">
                            Создайте профессиональный профиль и начните получать предложения
                        </p>

                        <form onSubmit={handleSubmit}>
                            {error && <div className="form-error">{error}</div>}

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-input"
                                        placeholder="your@email.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Пароль *</label>
                                    <input
                                        type="password"
                                        name="password"
                                        className="form-input"
                                        placeholder=""
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Имя *</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    className="form-input"
                                    placeholder="Ваше имя"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Город *</label>
                                <input
                                    type="text"
                                    name="city"
                                    className="form-input"
                                    placeholder="Алматы"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="info-box warning">
                                <strong>Быстрая регистрация!</strong> Заполните только основные данные. Остальную
                                информацию можно добавить позже в профиле.
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg submit-btn"
                                disabled={loading}
                            >
                                {loading ? 'Создание...' : 'Создать профиль'}
                            </button>
                        </form>

                        <div className="form-footer">
                            <p>
                                Уже есть аккаунт?{' '}
                                <Link to="/login">Войти</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Step 3: Employer Registration Form
    if (step === 'employer') {
        return (
            <div className="register-page">
                <div className="register-form-container">
                    <button className="back-btn" onClick={goBack}>
                        ← Назад
                    </button>

                    <div className="register-form-card">
                        <div className="form-header-icon">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
                            </svg>
                        </div>
                        <h2>Регистрация работодателя</h2>
                        <p className="form-subtitle">
                            Создайте корпоративный аккаунт для поиска моделей и создания кастингов
                        </p>

                        <form onSubmit={handleSubmit}>
                            {error && <div className="form-error">{error}</div>}

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-input"
                                        placeholder="company@email.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Пароль *</label>
                                    <input
                                        type="password"
                                        name="password"
                                        className="form-input"
                                        placeholder=""
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Название компании *</label>
                                <input
                                    type="text"
                                    name="company_name"
                                    className="form-input"
                                    placeholder='ООО "Модельное агентство"'
                                    value={formData.company_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Контактное лицо *</label>
                                    <input
                                        type="text"
                                        name="contact_person"
                                        className="form-input"
                                        placeholder="Иван Иванов"
                                        value={formData.contact_person}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Город *</label>
                                    <input
                                        type="text"
                                        name="city"
                                        className="form-input"
                                        placeholder="Алматы"
                                        value={formData.city}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="info-box warning">
                                <strong>Быстрая регистрация!</strong> Заполните только основные данные. Детальную
                                информацию о компании можно добавить позже в профиле.
                            </div>

                            <div className="info-box info">
                                <strong>Модерация:</strong> Аккаунты компаний проходят проверку в течение 24 часов.
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg submit-btn"
                                disabled={loading}
                            >
                                {loading ? 'Создание...' : 'Создать аккаунт компании'}
                            </button>
                        </form>

                        <div className="form-footer">
                            <p>
                                Уже есть аккаунт?{' '}
                                <Link to="/login">Войти</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return null
}
