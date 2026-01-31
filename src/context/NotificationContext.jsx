import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
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
    CASTING_EXPIRING: 'casting_expiring',
    NEW_FOLLOWER: 'new_follower'
}

// Polling interval (30 seconds)
const POLL_INTERVAL = 30000

// LocalStorage keys
const PREFS_STORAGE_KEY = 'mwork_notification_prefs'
const LAST_SEEN_KEY = 'mwork_last_notification_id'

export function NotificationProvider({ children }) {
    const { user } = useAuth()
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [toast, setToast] = useState(null)
    const [preferences, setPreferences] = useState(() => {
        try {
            const saved = localStorage.getItem(PREFS_STORAGE_KEY)
            return saved ? JSON.parse(saved) : null
        } catch {
            return null
        }
    })
    const pollIntervalRef = useRef(null)
    const lastSeenIdRef = useRef(() => {
        try {
            return localStorage.getItem(LAST_SEEN_KEY) || null
        } catch {
            return null
        }
    })

    // Fetch notifications
    const fetchNotifications = useCallback(async (showNewToast = false) => {
        if (!user) return

        try {
            setLoading(true)
            const response = await api.get('/notifications?limit=20')
            const items = response?.items || response?.data?.items || []
            
            // Check for new notifications to show toast
            if (showNewToast && items.length > 0 && lastSeenIdRef.current) {
                const newNotifications = items.filter(n => 
                    !n.is_read && n.id !== lastSeenIdRef.current
                )
                if (newNotifications.length > 0) {
                    const shouldShowToast = checkToastPreference(newNotifications[0].type)
                    if (shouldShowToast) {
                        showToast(newNotifications[0])
                    }
                }
            }

            // Update last seen
            if (items.length > 0) {
                lastSeenIdRef.current = items[0].id
                try {
                    localStorage.setItem(LAST_SEEN_KEY, items[0].id)
                } catch {}
            }

            setNotifications(items)
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
            const count = response?.count || response?.data?.count || 0
            setUnreadCount(count)
        } catch (err) {
            console.error('Failed to fetch unread count:', err)
        }
    }, [user])

    // Check if toast should be shown based on preferences
    const checkToastPreference = useCallback((notificationType) => {
        if (!preferences) return true // Default to showing
        if (!preferences.in_app_enabled) return false
        
        const channelKey = `${notificationType}_channels`
        const channels = preferences[channelKey]
        if (channels && channels.in_app === false) return false
        
        return true
    }, [preferences])

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

    // Save preferences to localStorage
    const savePreferences = useCallback((prefs) => {
        setPreferences(prefs)
        try {
            localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs))
        } catch (err) {
            console.error('Failed to save preferences:', err)
        }
    }, [])

    // Start polling for new notifications
    const startPolling = useCallback(() => {
        if (pollIntervalRef.current) return
        
        pollIntervalRef.current = setInterval(() => {
            fetchNotifications(true) // true = show toast for new notifications
            fetchUnreadCount()
        }, POLL_INTERVAL)
    }, [fetchNotifications, fetchUnreadCount])

    // Stop polling
    const stopPolling = useCallback(() => {
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current)
            pollIntervalRef.current = null
        }
    }, [])

    // Initial fetch and polling setup
    useEffect(() => {
        if (user) {
            fetchNotifications()
            fetchUnreadCount()
            startPolling()
        } else {
            stopPolling()
            setNotifications([])
            setUnreadCount(0)
        }

        return () => stopPolling()
    }, [user, fetchNotifications, fetchUnreadCount, startPolling, stopPolling])

    // Expose handleWSNotification for WebSocket integration
    useEffect(() => {
        window.__notificationHandler = handleWSNotification
        return () => {
            delete window.__notificationHandler
        }
    }, [handleWSNotification])

    // Trigger a manual notification (for testing or local events)
    const triggerNotification = useCallback((notification) => {
        const newNotification = {
            id: `local_${Date.now()}`,
            ...notification,
            is_read: false,
            created_at: new Date().toISOString()
        }

        setNotifications(prev => [newNotification, ...prev])
        setUnreadCount(prev => prev + 1)

        if (checkToastPreference(notification.type)) {
            showToast(newNotification)
        }
    }, [checkToastPreference, showToast])

    const value = {
        notifications,
        unreadCount,
        loading,
        toast,
        preferences,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        hideToast,
        handleWSNotification,
        savePreferences,
        triggerNotification
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
