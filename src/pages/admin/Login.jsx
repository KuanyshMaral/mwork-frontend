import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'
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
            const response = await api.post('/admin/auth/login', { email, password })

            // Store admin token
            localStorage.setItem('admin_token', response.data.token)
            localStorage.setItem('admin_user', JSON.stringify(response.data.admin))

            navigate('/admin')
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Ошибка авторизации')
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
                            placeholder="••••••••"
                            required
                        />
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
