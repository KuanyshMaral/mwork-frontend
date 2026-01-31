import { useState } from 'react'
import './InviteMemberModal.css'

export default function InviteMemberModal({ isOpen, onClose, onInvite }) {
    const [email, setEmail] = useState('')
    const [role, setRole] = useState('model')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!email.trim()) {
            setError('Введите email')
            return
        }

        if (!email.includes('@')) {
            setError('Некорректный email')
            return
        }

        setLoading(true)
        try {
            await onInvite({ email: email.trim(), role })
            setEmail('')
            setRole('model')
            onClose()
        } catch (err) {
            setError(err.message || 'Ошибка при отправке приглашения')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="invite-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Пригласить в команду</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="invite-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@example.com"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="role">Роль</label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            disabled={loading}
                        >
                            <option value="model">Модель</option>
                            <option value="manager">Менеджер</option>
                            <option value="admin">Администратор</option>
                        </select>
                    </div>

                    <div className="role-description">
                        {role === 'model' && (
                            <p>💡 Модель может просматривать кастинги и получать приглашения от агентства.</p>
                        )}
                        {role === 'manager' && (
                            <p>💡 Менеджер может управлять кастингами и бронированиями моделей.</p>
                        )}
                        {role === 'admin' && (
                            <p>💡 Администратор имеет полный доступ к управлению агентством.</p>
                        )}
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            className="invite-btn"
                            disabled={loading}
                        >
                            {loading ? 'Отправка...' : 'Отправить приглашение'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
