import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/client'
import { useAuth } from '../hooks/useAuth'

const NotificationContext = createContext(null)

// Notification types
export const NOTIFICATION_TYPES = {
    NEW_RESPONSE: 'new_response',
    RESPONSE_ACCEPTED: 'response_accepted',
    RESPONSE_REJECTED: 'response_rejected',
    NEW_MESSAGE: 'new_message',
    PROFILE_VIEWED: 'profile_viewed',
    CASTING_EXPIRING: 'casting_expiring'
}

export function NotificationProvider({ children }) {
    const { user } = useAuth()
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [toast, setToast] = useState(null)

    // Fetch notifications
    const fetchNotifications = useCallback(async () => {
        if (!user) return

        try {
            setLoading(true)
            const response = await api.get('/notifications', { params: { limit: 20 } })
            setNotifications(response.data?.items || [])
        } catch (err) {
            console.error('Failed to fetch notifications:', err)
        } finally {
            setLoading(false)
        }
    }, [user])

    // Fetch unread count
    const fetchUnreadCount = useCallback(async () => {
        if (!user) return

        try {
            const response = await api.get('/notifications/unread')
            setUnreadCount(response.data?.count || 0)
        } catch (err) {
            console.error('Failed to fetch unread count:', err)
        }
    }, [user])

    // Mark as read
    const markAsRead = useCallback(async (id) => {
        try {
            await api.post(`/notifications/${id}/read`)
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            )
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (err) {
            console.error('Failed to mark as read:', err)
        }
    }, [])

    // Mark all as read
    const markAllAsRead = useCallback(async () => {
        try {
            await api.post('/notifications/read-all')
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
            setUnreadCount(0)
        } catch (err) {
            console.error('Failed to mark all as read:', err)
        }
    }, [])

    // Handle WebSocket notification
    const handleWSNotification = useCallback((data) => {
        if (data.type === 'notification') {
            const notification = data.notification

            // Add to list
            setNotifications(prev => [notification, ...prev])
            setUnreadCount(prev => prev + 1)

            // Show toast
            showToast(notification)
        }
    }, [])

    // Show toast notification
    const showToast = useCallback((notification) => {
        setToast(notification)

        // Auto-hide after 5 seconds
        setTimeout(() => {
            setToast(null)
        }, 5000)
    }, [])

    // Hide toast
    const hideToast = useCallback(() => {
        setToast(null)
    }, [])

    // Initial fetch
    useEffect(() => {
        if (user) {
            fetchNotifications()
            fetchUnreadCount()
        }
    }, [user, fetchNotifications, fetchUnreadCount])

    // Expose handleWSNotification for WebSocket integration
    useEffect(() => {
        window.__notificationHandler = handleWSNotification
        return () => {
            delete window.__notificationHandler
        }
    }, [handleWSNotification])

    const value = {
        notifications,
        unreadCount,
        loading,
        toast,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        hideToast,
        handleWSNotification
    }

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    )
}

export function useNotifications() {
    const context = useContext(NotificationContext)
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider')
    }
    return context
}
