import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { promotionApi } from '../api/client'
import PromotionCard from '../components/promotion/PromotionCard'
import './Advertising.css'

export default function Advertising() {
    const [promotions, setPromotions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        loadPromotions()
    }, [filter])

    const loadPromotions = async () => {
        setLoading(true)
        setError('')
        try {
            const params = filter !== 'all' ? { status: filter } : {}
            const data = await promotionApi.list(params)
            setPromotions(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error('Failed to load promotions:', err)
            setError(err.message || 'Failed to load promotions')
            setPromotions([])
        } finally {
            setLoading(false)
        }
    }

    const filteredPromotions = Array.isArray(promotions) ? promotions : []

    return (
        <div className="advertising-page">
            <div className="page-header">
                <h1>Рекламные кампании</h1>
                <p>Управляйте вашими рекламными кампаниями и отслеживайте результаты</p>
                <Link to="/advertising/create" className="btn btn-primary">
                    + Создать кампанию
                </Link>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="promotion-filters">
                <button 
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    Все ({promotions.length})
                </button>
                <button 
                    className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
                    onClick={() => setFilter('active')}
                >
                    Активные
                </button>
                <button 
                    className={`filter-btn ${filter === 'paused' ? 'active' : ''}`}
                    onClick={() => setFilter('paused')}
                >
                    На паузе
                </button>
                <button 
                    className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                    onClick={() => setFilter('completed')}
                >
                    Завершенные
                </button>
                <button 
                    className={`filter-btn ${filter === 'draft' ? 'active' : ''}`}
                    onClick={() => setFilter('draft')}
                >
                    Черновики
                </button>
            </div>

            {loading ? (
                <div className="loading">Загрузка кампаний...</div>
            ) : filteredPromotions.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📢</div>
                    <h3>Рекламных кампаний пока нет</h3>
                    <p>Создайте свою первую кампанию, чтобы начать продвижение</p>
                    <Link to="/advertising/create" className="btn btn-primary">
                        Создать кампанию
                    </Link>
                </div>
            ) : (
                <div className="promotions-list">
                    {filteredPromotions.map(promotion => (
                        <PromotionCard 
                            key={promotion.id} 
                            promotion={promotion}
                            onUpdate={loadPromotions}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
