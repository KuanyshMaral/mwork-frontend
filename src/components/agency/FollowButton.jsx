import { useState } from 'react'
import { agencyApi } from '../../api/client'
import './FollowButton.css'

export default function FollowButton({ agencyId, initialFollowing = false, onFollowChange }) {
    const [isFollowing, setIsFollowing] = useState(initialFollowing)
    const [loading, setLoading] = useState(false)

    const handleClick = async () => {
        setLoading(true)
        try {
            if (isFollowing) {
                await agencyApi.unfollow(agencyId)
                setIsFollowing(false)
                onFollowChange?.(false)
            } else {
                await agencyApi.follow(agencyId)
                setIsFollowing(true)
                onFollowChange?.(true)
            }
        } catch (err) {
            console.error('Follow action failed:', err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            className={`follow-button ${isFollowing ? 'following' : ''}`}
            onClick={handleClick}
            disabled={loading}
        >
            {loading ? (
                <span className="loading-spinner" />
            ) : isFollowing ? (
                <>
                    <span className="icon">✓</span>
                    <span className="text">Вы подписаны</span>
                    <span className="hover-text">Отписаться</span>
                </>
            ) : (
                <>
                    <span className="icon">+</span>
                    <span className="text">Подписаться</span>
                </>
            )}
        </button>
    )
}
