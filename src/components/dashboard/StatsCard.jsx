import './StatsCard.css'

export default function StatsCard({ icon, label, value, subtext, trend, color = 'default' }) {
    return (
        <div className={`stats-card stats-card--${color}`}>
            <div className="stats-card__header">
                <span className="stats-card__label">{label}</span>
                <span className="stats-card__icon">{icon}</span>
            </div>
            <div className="stats-card__value">{value}</div>
            {trend !== undefined && (
                <div className={`stats-card__trend ${trend >= 0 ? 'positive' : 'negative'}`}>
                    {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
                </div>
            )}
            {subtext && <div className="stats-card__subtext">{subtext}</div>}
        </div>
    )
}
