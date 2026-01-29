import { useState } from 'react'
import { moderationApi } from '../../api/client'
import './ReportUserModal.css'

const REPORT_REASONS = [
    { value: 'spam', label: 'Спам' },
    { value: 'fake', label: 'Фейковый профиль' },
    { value: 'harassment', label: 'Оскорбления / домогательства' },
    { value: 'inappropriate', label: 'Неприемлемый контент' },
    { value: 'scam', label: 'Мошенничество' },
    { value: 'other', label: 'Другое' },
]

export default function ReportUserModal({ userId, userName, isOpen, onClose }) {
    const [reason, setReason] = useState('')
    const [details, setDetails] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(e) {
        e.preventDefault()
        if (!reason) {
            setError('Выберите причину')
            return
        }

        setLoading(true)
        setError('')

        try {
            await moderationApi.report({
                reported_user_id: userId,
                reason,
                details: details.trim() || null,
            })
            setSuccess(true)
            setTimeout(() => {
                onClose()
                setSuccess(false)
                setReason('')
                setDetails('')
            }, 2000)
        } catch (err) {
            setError(err.message || 'Ошибка отправки жалобы')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Пожаловаться на пользователя</h3>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>

                {success ? (
                    <div className="report-success">
                        <span className="success-icon">✅</span>
                        <p>Жалоба отправлена</p>
                        <small>Мы рассмотрим её в ближайшее время</small>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <p className="report-user-name">
                            На пользователя: <strong>{userName || 'Пользователь'}</strong>
                        </p>

                        <div className="form-group">
                            <label className="form-label">Причина жалобы *</label>
                            <div className="reason-options">
                                {REPORT_REASONS.map(r => (
                                    <label key={r.value} className="reason-option">
                                        <input
                                            type="radio"
                                            name="reason"
                                            value={r.value}
                                            checked={reason === r.value}
                                            onChange={e => setReason(e.target.value)}
                                        />
                                        <span>{r.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Подробности (опционально)</label>
                            <textarea
                                className="form-input form-textarea"
                                value={details}
                                onChange={e => setDetails(e.target.value)}
                                placeholder="Опишите ситуацию подробнее..."
                                rows={3}
                            />
                        </div>

                        {error && <div className="form-error">{error}</div>}

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                className="btn btn-danger"
                                disabled={loading}
                            >
                                {loading ? 'Отправка...' : 'Отправить жалобу'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
