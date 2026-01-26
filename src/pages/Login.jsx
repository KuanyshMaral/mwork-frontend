import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import './Auth.css'

export default function Login() {
    const [role, setRole] = useState('model')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { login } = useAuth()
    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await login(email, password)
            navigate('/dashboard')
        } catch (err) {
            setError(err.message || 'Ошибка входа')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <Link to="/register" className="back-btn">
                    ← Назад
                </Link>

                <div className="auth-card">
                    <div className="auth-header">
                        <h1>Вход в MWork</h1>
                        <p>Войдите в свой аккаунт для продолжения работы</p>
                    </div>

                    {/* Role Selector Tabs */}
                    <div className="role-tabs">
                        <button
                            className={`role-tab ${role === 'model' ? 'active' : ''}`}
                            onClick={() => setRole('model')}
                            type="button"
                        >
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                            Модель
                        </button>
                        <button
                            className={`role-tab ${role === 'employer' ? 'active' : ''}`}
                            onClick={() => setRole('employer')}
                            type="button"
                        >
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
                            </svg>
                            Работодатель
                        </button>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {error && <div className="auth-error">{error}</div>}

                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Пароль</label>
                            <input
                                type="password"
                                className="form-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="auth-submit"
                            disabled={loading}
                        >
                            {loading ? 'Вход...' : role === 'model' ? 'Войти как модель' : 'Войти как работодатель'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Нет аккаунта?{' '}
                            <Link to="/register">Зарегистрироваться</Link>
                        </p>
                        <p className="forgot-link">
                            <Link to="/forgot-password">Забыли пароль?</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
