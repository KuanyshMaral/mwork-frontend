import React from 'react'
import { Link } from 'react-router-dom'
import PromotedModelBadge from './PromotedModelBadge'
import './ModelCard.css'

export default function ModelCard({ model }) {
    const formatAge = (birthDate) => {
        if (!birthDate) return null
        const birth = new Date(birthDate)
        const today = new Date()
        let age = today.getFullYear() - birth.getFullYear()
        const monthDiff = today.getMonth() - birth.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--
        }
        return age
    }

    const formatHeight = (height) => {
        if (!height) return null
        return `${height} см`
    }

    const age = formatAge(model.birth_date)
    const height = formatHeight(model.height)

    return (
        <Link to={`/profile/${model.id}`} className="model-card">
            {/* Profile Image */}
            <div className="model-card-image">
                {model.profile_photo ? (
                    <img 
                        src={model.profile_photo} 
                        alt={`${model.first_name} ${model.last_name}`}
                        onError={(e) => {
                            e.target.src = '/api/placeholder/200/250'
                        }}
                    />
                ) : (
                    <div className="model-card-placeholder">
                        <div className="placeholder-avatar">
                            {model.first_name?.[0]}{model.last_name?.[0]}
                        </div>
                    </div>
                )}
                
                {/* Verification Badge */}
                {model.is_verified && (
                    <div className="verification-badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                            <path d="M10 17l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="white"/>
                        </svg>
                    </div>
                )}
                
                {/* Promoted Badge */}
                {model.is_promoted && (
                    <div className="promoted-model-badge">
                        <PromotedModelBadge size="small" />
                    </div>
                )}
            </div>

            {/* Model Info */}
            <div className="model-card-info">
                <div className="model-card-header">
                    <h3 className="model-name">
                        {model.first_name} {model.last_name}
                    </h3>
                    {model.is_premium && (
                        <span className="premium-badge">PRO</span>
                    )}
                </div>

                <div className="model-details">
                    {age && (
                        <span className="detail-item">
                            🎂 {age} лет
                        </span>
                    )}
                    {model.city && (
                        <span className="detail-item">
                            📍 {model.city}
                        </span>
                    )}
                    {height && (
                        <span className="detail-item">
                            📏 {height}
                        </span>
                    )}
                    {model.gender && (
                        <span className="detail-item">
                            👫 {model.gender === 'male' ? 'Мужской' : 'Женский'}
                        </span>
                    )}
                </div>

                {/* Specializations */}
                {model.specializations && model.specializations.length > 0 && (
                    <div className="model-specializations">
                        {model.specializations.slice(0, 3).map((spec, index) => (
                            <span key={index} className="specialization-tag">
                                {spec}
                            </span>
                        ))}
                        {model.specializations.length > 3 && (
                            <span className="specialization-more">
                                +{model.specializations.length - 3}
                            </span>
                        )}
                    </div>
                )}

                {/* Stats */}
                <div className="model-stats">
                    <span className="stat-item">
                        👁 {model.views_count || 0}
                    </span>
                    {model.rating && (
                        <span className="stat-item">
                            ⭐ {model.rating.toFixed(1)}
                        </span>
                    )}
                    {model.response_rate && (
                        <span className="stat-item">
                            💬 {model.response_rate}%
                        </span>
                    )}
                </div>

                {/* Availability */}
                {model.is_available && (
                    <div className="availability-badge">
                        ✅ Доступен для работы
                    </div>
                )}
            </div>
        </Link>
    )
}
