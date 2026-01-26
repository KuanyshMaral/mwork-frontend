import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import api from '../api/client'
import './Auth.css'

function ResetPassword() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        if (!token) {
            navigate('/forgot-password')
        }
    }, [token, navigate])

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (password.length < 6) {
            setError('Пароль должен быть не менее 6 символов')
            return
        }
        if (password !== confirmPassword) {
            setError('Пароли не совпадают')
            return
        }

        setLoading(true)
        setError('')
        try {
            await api.post('/auth/reset-password', {
                token,
                new_password: password
            })
            setSuccess(true)
        } catch (err) {
            setError('Ссылка недействительна или истекла')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="auth-page">
                <div className="auth-container">
                    <div className="auth-card">
                        <div className="auth-header">
                            <h1>✅ Пароль изменён</h1>
                            <p>Теперь вы можете войти с новым паролем</p>
                        </div>
                        <Link to="/login" className="auth-btn primary">
                            Войти
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <h1>🔐 Новый пароль</h1>
                        <p>Придумайте новый пароль для вашего аккаунта</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {error && <p className="auth-error">{error}</p>}

                        <div className="form-group">
                            <label>Новый пароль</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Минимум 6 символов"
                                required
                                minLength={6}
                            />
                        </div>

                        <div className="form-group">
                            <label>Подтвердите пароль</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Повторите пароль"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="auth-btn primary"
                            disabled={loading}
                        >
                            {loading ? 'Сохранение...' : 'Сохранить пароль'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <Link to="/login">Вернуться к входу</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ResetPassword
