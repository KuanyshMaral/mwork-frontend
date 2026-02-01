import React from 'react'
import './PromotedModelBadge.css'

export default function PromotedModelBadge({ size = 'medium' }) {
    return (
        <div className={`promoted-badge ${size}`}>
            <span className="badge-icon">⭐</span>
            <span className="badge-text">Promoted</span>
        </div>
    )
}
