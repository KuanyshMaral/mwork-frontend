import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useNotifications } from '../../context/NotificationContext'
import './NotificationBell.css'

const NOTIFICATION_ICONS = {
    new_response: '📩',
    response_accepted: '🎉',
    response_rejected: '❌',
    new_message: '💬',
    profile_viewed: '👁️',
    casting_expiring: '⏰'
}

function NotificationBell() {
    const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications()
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const formatTime = (dateStr) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diff = now - date

        if (diff < 60000) return 'сейчас'
        if (diff < 3600000) return `${Math.floor(diff / 60000)} мин`
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч`
        return date.toLocaleDateString('ru-RU')
    }

    const getNotificationLink = (notification) => {
        const data = notification.data || {}

        switch (notification.type) {
            case 'new_response':
            case 'response_accepted':
            case 'response_rejected':
                return data.casting_id ? `/castings/${data.casting_id}` : '/castings'
            case 'new_message':
                return '/messages'
            case 'profile_viewed':
                return '/profile'
            case 'casting_expiring':
                return data.casting_id ? `/castings/${data.casting_id}` : '/castings'
            default:
                return '/dashboard'
        }
    }

    const handleNotificationClick = (notification) => {
        if (!notification.is_read) {
            markAsRead(notification.id)
        }
        setIsOpen(false)
    }

    return (
        <div className="notification-bell" ref={dropdownRef}>
            <button
                className="notification-bell-btn"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Уведомления"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                    <span className="notification-badge">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <h3>Уведомления</h3>
                        {unreadCount > 0 && (
                            <button
                                className="notification-mark-all"
                                onClick={markAllAsRead}
                            >
                                Прочитать все
                            </button>
                        )}
                    </div>

                    <div className="notification-list">
                        {loading ? (
                            <div className="notification-loading">Загрузка...</div>
                        ) : notifications.length === 0 ? (
                            <div className="notification-empty">
                                <span>🔔</span>
                                <p>Нет уведомлений</p>
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <Link
                                    key={notification.id}
                                    to={getNotificationLink(notification)}
                                    className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <span className="notification-icon">
                                        {NOTIFICATION_ICONS[notification.type] || '🔔'}
                                    </span>
                                    <div className="notification-content">
                                        <p className="notification-title">{notification.title}</p>
                                        {notification.body && (
                                            <p className="notification-body">{notification.body}</p>
                                        )}
                                        <span className="notification-time">
                                            {formatTime(notification.created_at)}
                                        </span>
                                    </div>
                                    {!notification.is_read && (
                                        <span className="notification-dot" />
                                    )}
                                </Link>
                            ))
                        )}
                    </div>

                    <Link to="/settings/notifications" className="notification-footer">
                        Настройки уведомлений
                    </Link>
                </div>
            )}
        </div>
    )
}

export default NotificationBell
