import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { agencyApi } from '../../api/client'
import { useAuth } from '../../hooks/useAuth.jsx'
import './Agency.css'

export default function AcceptInvite() {
    const { token } = useParams()
    const navigate = useNavigate()
    const { user, loading: authLoading } = useAuth()

    const [status, setStatus] = useState('loading') // loading | success | error | auth_required
    const [error, setError] = useState('')
    const [agencyName, setAgencyName] = useState('')

    useEffect(() => {
        if (authLoading) return

        if (!user) {
            setStatus('auth_required')
            return
        }

        acceptInvite()
    }, [token, user, authLoading])

    async function acceptInvite() {
        try {
            setStatus('loading')
            const result = await agencyApi.acceptInvite(token)
            setAgencyName(result?.agency_name || '')
            setStatus('success')
        } catch (err) {
            console.error('Failed to accept invite:', err)
            if (err.status === 404 || err.message?.includes('not found') || err.message?.includes('expired')) {
                setError('Приглашение не найдено или истекло.')
            } else if (err.status === 409 || err.message?.includes('already')) {
                setError('Вы уже являетесь участником этой команды.')
                setStatus('success')
                return
            } else {
                setError(err.message || 'Не удалось принять приглашение. Попробуйте позже.')
            }
            setStatus('error')
        }
    }

    if (authLoading || status === 'loading') {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                gap: '16px'
            }}>
                <div className="loading-spinner" style={{
                    width: '48px',
                    height: '48px',
                    border: '4px solid rgba(255,255,255,0.1)',
                    borderTopColor: '#3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                }} />
                <p style={{ color: '#9ca3af', fontSize: '1rem' }}>Принимаем приглашение...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        )
    }

    if (status === 'auth_required') {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                gap: '20px',
                padding: '24px'
            }}>
                <div style={{ fontSize: '3rem' }}>🔑</div>
                <h2 style={{ color: '#fff', margin: 0 }}>Требуется авторизация</h2>
                <p style={{ color: '#9ca3af', textAlign: 'center', maxWidth: '400px' }}>
                    Войдите или зарегистрируйтесь, чтобы принять приглашение в команду агентства.
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Link
                        to={`/login?redirect=/agency/invite/${token}`}
                        style={{
                            padding: '10px 24px',
                            background: '#3b82f6',
                            color: '#fff',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: 600
                        }}
                    >
                        Войти
                    </Link>
                    <Link
                        to={`/register?redirect=/agency/invite/${token}`}
                        style={{
                            padding: '10px 24px',
                            background: 'rgba(255,255,255,0.1)',
                            color: '#fff',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: 600,
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}
                    >
                        Регистрация
                    </Link>
                </div>
            </div>
        )
    }

    if (status === 'error') {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                gap: '20px',
                padding: '24px'
            }}>
                <div style={{ fontSize: '3rem' }}>❌</div>
                <h2 style={{ color: '#fff', margin: 0 }}>Ошибка</h2>
                <p style={{ color: '#ef4444', textAlign: 'center', maxWidth: '400px' }}>
                    {error}
                </p>
                <Link
                    to="/dashboard"
                    style={{
                        padding: '10px 24px',
                        background: '#3b82f6',
                        color: '#fff',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: 600
                    }}
                >
                    На главную
                </Link>
            </div>
        )
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            gap: '20px',
            padding: '24px'
        }}>
            <div style={{ fontSize: '3rem' }}>🎉</div>
            <h2 style={{ color: '#fff', margin: 0 }}>Приглашение принято!</h2>
            <p style={{ color: '#9ca3af', textAlign: 'center', maxWidth: '400px' }}>
                Вы успешно присоединились к команде{agencyName ? ` «${agencyName}»` : ''}.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
                <button
                    onClick={() => navigate('/agency')}
                    style={{
                        padding: '10px 24px',
                        background: '#3b82f6',
                        color: '#fff',
                        borderRadius: '8px',
                        border: 'none',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    Перейти в агентство
                </button>
                <button
                    onClick={() => navigate('/dashboard')}
                    style={{
                        padding: '10px 24px',
                        background: 'rgba(255,255,255,0.1)',
                        color: '#fff',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    На главную
                </button>
            </div>
        </div>
    )
}
