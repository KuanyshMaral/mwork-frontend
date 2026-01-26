import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../api/client'
import './Auth.css'

function VerifyEmail() {
    const { user, refreshUser } = useAuth()
    const navigate = useNavigate()
    const [code, setCode] = useState(['', '', '', '', '', ''])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(false)

    useEffect(() => {
        // If already verified, redirect
        if (user?.email_verified) {
            navigate('/dashboard')
        }
    }, [user, navigate])

    const handleCodeChange = (index, value) => {
        if (!/^\d*$/.test(value)) return

        const newCode = [...code]
        newCode[index] = value.slice(-1)
        setCode(newCode)

        // Auto-focus next input
        if (value && index < 5) {
            document.getElementById(`code-${index + 1}`)?.focus()
        }
    }

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            document.getElementById(`code-${index - 1}`)?.focus()
        }
    }

    const handlePaste = (e) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
        const newCode = [...code]
        pasted.split('').forEach((digit, i) => {
            if (i < 6) newCode[i] = digit
        })
        setCode(newCode)
    }

    const sendCode = async () => {
        setSending(true)
        setError('')
        try {
            await api.post('/auth/send-verification')
            setSent(true)
        } catch (err) {
            setError('Ошибка отправки кода')
        } finally {
            setSending(false)
        }
    }

    const verifyCode = async () => {
        const fullCode = code.join('')
        if (fullCode.length !== 6) {
            setError('Введите 6-значный код')
            return
        }

        setLoading(true)
        setError('')
        try {
            await api.post('/auth/verify-email', { code: fullCode })
            await refreshUser()
            navigate('/dashboard')
        } catch (err) {
            setError('Неверный или просроченный код')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card verify-card">
                    <div className="auth-header">
                        <h1>📧 Подтвердите email</h1>
                        <p>Мы отправим вам 6-значный код подтверждения</p>
                    </div>

                    {!sent ? (
                        <div className="verify-send">
                            <p className="verify-email">{user?.email}</p>
                            <button
                                className="auth-btn primary"
                                onClick={sendCode}
                                disabled={sending}
                            >
                                {sending ? 'Отправка...' : 'Отправить код'}
                            </button>
                        </div>
                    ) : (
                        <div className="verify-code">
                            <p className="verify-sent">Код отправлен на {user?.email}</p>

                            <div className="code-inputs" onPaste={handlePaste}>
                                {code.map((digit, i) => (
                                    <input
                                        key={i}
                                        id={`code-${i}`}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleCodeChange(i, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(i, e)}
                                        className="code-input"
                                    />
                                ))}
                            </div>

                            {error && <p className="auth-error">{error}</p>}

                            <button
                                className="auth-btn primary"
                                onClick={verifyCode}
                                disabled={loading || code.some(d => !d)}
                            >
                                {loading ? 'Проверка...' : 'Подтвердить'}
                            </button>

                            <button
                                className="auth-link"
                                onClick={sendCode}
                                disabled={sending}
                            >
                                {sending ? 'Отправка...' : 'Отправить код повторно'}
                            </button>
                        </div>
                    )}

                    <button
                        className="auth-link"
                        onClick={() => navigate('/dashboard')}
                    >
                        Пропустить (можно подтвердить позже)
                    </button>
                </div>
            </div>
        </div>
    )
}

export default VerifyEmail
