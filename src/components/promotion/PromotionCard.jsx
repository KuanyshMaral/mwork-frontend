import { useState } from 'react'
import { promotionApi } from '../../api/client'
import PromotionStats from './PromotionStats'
import './PromotionCard.css'

export default function PromotionCard({ promotion, onUpdate }) {
    const [showStats, setShowStats] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleActivate = async () => {
        setLoading(true)
        try {
            await promotionApi.activate(promotion.id)
            onUpdate?.()
        } catch (err) {
            console.error('Failed to activate promotion:', err)
        } finally {
            setLoading(false)
        }
    }

    const handlePause = async () => {
        setLoading(true)
        try {
            await promotionApi.pause(promotion.id)
            onUpdate?.()
        } catch (err) {
            console.error('Failed to pause promotion:', err)
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = () => {
        switch (promotion.status) {
            case 'active':
                return <span className="status-badge active">Активна</span>
            case 'paused':
                return <span className="status-badge paused">На паузе</span>
            case 'completed':
                return <span className="status-badge completed">Завершена</span>
            case 'draft':
                return <span className="status-badge draft">Черновик</span>
            default:
                return <span className="status-badge">Неизвестно</span>
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ru-RU')
    }

    const getProgressPercentage = () => {
        if (!promotion.start_date || !promotion.end_date) return 0
        const start = new Date(promotion.start_date)
        const end = new Date(promotion.end_date)
        const now = new Date()
        const total = end - start
        const elapsed = now - start
        return Math.min(Math.max((elapsed / total) * 100, 0), 100)
    }

    return (
        <div className="promotion-card">
            <div className="promotion-header">
                <div className="promotion-info">
                    <h3>{promotion.title}</h3>
                    {getStatusBadge()}
                </div>
                <div className="promotion-actions">
                    {promotion.status === 'draft' && (
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={handleActivate}
                            disabled={loading}
                        >
                            {loading ? 'Активация...' : 'Активировать'}
                        </button>
                    )}
                    {promotion.status === 'active' && (
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={handlePause}
                            disabled={loading}
                        >
                            {loading ? 'Пауза...' : 'Пауза'}
                        </button>
                    )}
                    <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setShowStats(!showStats)}
                    >
                        {showStats ? 'Скрыть' : 'Статистика'}
                    </button>
                </div>
            </div>

            {promotion.description && (
                <p className="promotion-description">{promotion.description}</p>
            )}

            <div className="promotion-details">
                <div className="detail-item">
                    <span className="detail-label">Бюджет:</span>
                    <span className="detail-value">
                        ₸{promotion.daily_budget || promotion.total_budget}
                        {promotion.budget_type === 'daily' ? '/день' : ' всего'}
                    </span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Период:</span>
                    <span className="detail-value">
                        {formatDate(promotion.start_date)} - {formatDate(promotion.end_date)}
                    </span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Целевая аудитория:</span>
                    <span className="detail-value">
                        {promotion.target_audience === 'all' ? 'Все пользователи' :
                         promotion.target_audience === 'employers' ? 'Работодатели' :
                         promotion.target_audience === 'agencies' ? 'Агентства' : 'Модели'}
                    </span>
                </div>
            </div>

            {promotion.status === 'active' && (
                <div className="promotion-progress">
                    <div className="progress-bar">
                        <div 
                            className="progress-fill" 
                            style={{ width: `${getProgressPercentage()}%` }}
                        ></div>
                    </div>
                    <span className="progress-text">
                        {Math.round(getProgressPercentage())}% завершено
                    </span>
                </div>
            )}

            {showStats && (
                <div className="promotion-stats-section">
                    <PromotionStats promotionId={promotion.id} />
                </div>
            )}
        </div>
    )
}
