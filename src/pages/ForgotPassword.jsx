import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import './Auth.css'

function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!email) {
            setError('Введите email')
            return
        }

        setLoading(true)
        setError('')
        try {
            await api.post('/auth/forgot-password', { email })
            setSent(true)
        } catch (err) {
            // Don't reveal if email exists
            setSent(true)
        } finally {
            setLoading(false)
        }
    }

    if (sent) {
        return (
            <div className="auth-page">
                <div className="auth-container">
                    <div className="auth-card">
                        <div className="auth-header">
                            <h1>✉️ Проверьте почту</h1>
                            <p>Если аккаунт с email {email} существует, мы отправили ссылку для сброса пароля.</p>
                        </div>
                        <Link to="/login" className="auth-btn primary">
                            Вернуться к входу
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
                        <h1>🔐 Забыли пароль?</h1>
                        <p>Введите email и мы отправим ссылку для сброса пароля</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {error && <p className="auth-error">{error}</p>}

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="auth-btn primary"
                            disabled={loading}
                        >
                            {loading ? 'Отправка...' : 'Отправить ссылку'}
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

export default ForgotPassword
