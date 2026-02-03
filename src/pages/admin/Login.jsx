import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../../api/client'
import './AdminLogin.css'

function AdminLogin() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await authApi.adminLogin({ email, password })

            // Store admin token and user data
            localStorage.setItem('admin_token', response.Token || response.access_token || response.token)
            localStorage.setItem('admin_user', JSON.stringify(response.Admin || response.admin || response))

            navigate('/admin')
        } catch (err) {
            console.error('Admin login error:', err)
            if (err.message.includes('Invalid JSON response')) {
                setError('Сервер вернул некорректный ответ. Проверьте, запущен ли backend.')
            } else {
                setError(err.message || 'Ошибка авторизации')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="admin-login-page">
            <div className="admin-login-card">
                <div className="admin-login-header">
                    <h1>MWork</h1>
                    <span className="admin-badge">Admin</span>
                </div>

                <h2>Вход в панель управления</h2>

                {error && <div className="admin-login-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="admin-login-field">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="admin@mwork.kz"
                            required
                        />
                    </div>

                    <div className="admin-login-field">
                        <label>Пароль</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="admin123"
                            required
                        />
                    </div>

                    <div className="admin-login-hint">
                        <small>Демо доступ: admin@mwork.kz / admin123</small>
                    </div>

                    <button
                        type="submit"
                        className="admin-login-btn"
                        disabled={loading}
                    >
                        {loading ? 'Вход...' : 'Войти'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default AdminLogin
