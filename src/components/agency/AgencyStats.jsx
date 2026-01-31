import './AgencyStats.css'

export default function AgencyStats({ stats = {} }) {
    const defaultStats = {
        total_models: stats.total_models || 0,
        active_castings: stats.active_castings || 0,
        total_bookings: stats.total_bookings || 0,
        followers_count: stats.followers_count || 0,
        total_revenue: stats.total_revenue || 0,
        avg_rating: stats.avg_rating || 0
    }

    return (
        <div className="agency-stats">
            <div className="stat-item">
                <span className="stat-icon">👥</span>
                <div className="stat-content">
                    <span className="stat-value">{defaultStats.total_models}</span>
                    <span className="stat-label">Моделей</span>
                </div>
            </div>
            <div className="stat-item">
                <span className="stat-icon">📋</span>
                <div className="stat-content">
                    <span className="stat-value">{defaultStats.active_castings}</span>
                    <span className="stat-label">Активных кастингов</span>
                </div>
            </div>
            <div className="stat-item">
                <span className="stat-icon">📅</span>
                <div className="stat-content">
                    <span className="stat-value">{defaultStats.total_bookings}</span>
                    <span className="stat-label">Бронирований</span>
                </div>
            </div>
            <div className="stat-item">
                <span className="stat-icon">❤️</span>
                <div className="stat-content">
                    <span className="stat-value">{defaultStats.followers_count}</span>
                    <span className="stat-label">Подписчиков</span>
                </div>
            </div>
            <div className="stat-item">
                <span className="stat-icon">💰</span>
                <div className="stat-content">
                    <span className="stat-value">₸{defaultStats.total_revenue.toLocaleString()}</span>
                    <span className="stat-label">Доход</span>
                </div>
            </div>
            <div className="stat-item">
                <span className="stat-icon">⭐</span>
                <div className="stat-content">
                    <span className="stat-value">{defaultStats.avg_rating.toFixed(1)}</span>
                    <span className="stat-label">Рейтинг</span>
                </div>
            </div>
        </div>
    )
}
