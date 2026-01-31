import { useState } from 'react'
import { Link } from 'react-router-dom'
import './ReportCard.css'

const REASON_LABELS = {
    spam: 'Спам',
    harassment: 'Оскорбления',
    inappropriate: 'Неприемлемый контент',
    fraud: 'Мошенничество',
    fake: 'Фейковый аккаунт',
    other: 'Другое'
}

export default function ReportCard({ report, onResolve, loading = false }) {
    const [showDetails, setShowDetails] = useState(false)

    const formatDate = (dateStr) => {
        if (!dateStr) return ''
        return new Date(dateStr).toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className={`report-card ${report.status}`}>
            <div className="report-header">
                <div className="report-type">
                    <span className="report-icon">⚠️</span>
                    <span className="report-reason">
                        {REASON_LABELS[report.reason] || report.reason}
                    </span>
                </div>
                <span className={`report-status ${report.status}`}>
                    {report.status === 'pending' ? 'Ожидает' : 
                     report.status === 'resolved' ? 'Решено' : report.status}
                </span>
            </div>

            <div className="report-users">
                <div className="user-info">
                    <span className="label">От:</span>
                    <Link to={`/profile/${report.reporter_id}`} className="user-link">
                        {report.reporter_email || `user_${report.reporter_id}`}
                    </Link>
                </div>
                <span className="arrow">→</span>
                <div className="user-info">
                    <span className="label">На:</span>
                    <Link to={`/profile/${report.reported_user_id}`} className="user-link reported">
                        {report.reported_username || `user_${report.reported_user_id}`}
                    </Link>
                </div>
            </div>

            {report.description && (
                <div className="report-description">
                    <p>"{report.description}"</p>
                </div>
            )}

            <div className="report-meta">
                <span className="report-date">{formatDate(report.created_at)}</span>
                <button 
                    className="details-toggle"
                    onClick={() => setShowDetails(!showDetails)}
                >
                    {showDetails ? 'Скрыть детали' : 'Показать детали'}
                </button>
            </div>

            {showDetails && (
                <div className="report-details">
                    <div className="detail-row">
                        <span className="detail-label">ID жалобы:</span>
                        <span className="detail-value">{report.id}</span>
                    </div>
                    {report.content_type && (
                        <div className="detail-row">
                            <span className="detail-label">Тип контента:</span>
                            <span className="detail-value">{report.content_type}</span>
                        </div>
                    )}
                    {report.content_id && (
                        <div className="detail-row">
                            <span className="detail-label">ID контента:</span>
                            <span className="detail-value">{report.content_id}</span>
                        </div>
                    )}
                </div>
            )}

            {report.status === 'pending' && (
                <div className="report-actions">
                    <button
                        className="action-btn warn"
                        onClick={() => onResolve?.(report.id, 'warn')}
                        disabled={loading}
                    >
                        ⚠️ Предупредить
                    </button>
                    <button
                        className="action-btn suspend"
                        onClick={() => onResolve?.(report.id, 'suspend')}
                        disabled={loading}
                    >
                        🚫 Заблокировать
                    </button>
                    <button
                        className="action-btn delete"
                        onClick={() => onResolve?.(report.id, 'delete')}
                        disabled={loading}
                    >
                        🗑️ Удалить контент
                    </button>
                    <button
                        className="action-btn dismiss"
                        onClick={() => onResolve?.(report.id, 'dismiss')}
                        disabled={loading}
                    >
                        ✕ Отклонить
                    </button>
                </div>
            )}

            {report.status === 'resolved' && report.resolution && (
                <div className="report-resolution">
                    <span className="resolution-label">Решение:</span>
                    <span className="resolution-action">{report.resolution.action}</span>
                    {report.resolution.notes && (
                        <p className="resolution-notes">{report.resolution.notes}</p>
                    )}
                </div>
            )}
        </div>
    )
}
