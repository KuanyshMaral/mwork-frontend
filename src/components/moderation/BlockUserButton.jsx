import { useState } from 'react'
import { moderationApi } from '../../api/client'
import './BlockUserButton.css'

export default function BlockUserButton({ userId, initialBlocked = false, onBlockChange }) {
    const [blocked, setBlocked] = useState(initialBlocked)
    const [loading, setLoading] = useState(false)

    async function handleToggle() {
        setLoading(true)
        try {
            if (blocked) {
                await moderationApi.unblock(userId)
                setBlocked(false)
                if (onBlockChange) onBlockChange(false)
            } else {
                await moderationApi.block(userId)
                setBlocked(true)
                if (onBlockChange) onBlockChange(true)
            }
        } catch (err) {
            console.error('Block/unblock failed:', err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            className={`block-user-btn ${blocked ? 'blocked' : ''}`}
            onClick={handleToggle}
            disabled={loading}
            title={blocked ? 'Разблокировать пользователя' : 'Заблокировать пользователя'}
        >
            {loading ? (
                '...'
            ) : blocked ? (
                <>🔓 Разблокировать</>
            ) : (
                <>🚫 Заблокировать</>
            )}
        </button>
    )
}
