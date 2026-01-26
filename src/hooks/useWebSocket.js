import { useEffect, useRef, useCallback, useState } from 'react'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws'
const RECONNECT_INTERVAL = 3000
const MAX_RECONNECT_ATTEMPTS = 5

/**
 * WebSocket hook with auto-reconnect for real-time chat
 */
export function useWebSocket(onMessage) {
    const wsRef = useRef(null)
    const reconnectAttempts = useRef(0)
    const reconnectTimeout = useRef(null)
    const [isConnected, setIsConnected] = useState(false)

    const connect = useCallback(() => {
        // Clear any pending reconnect
        if (reconnectTimeout.current) {
            clearTimeout(reconnectTimeout.current)
        }

        const token = localStorage.getItem('token')
        if (!token) {
            console.log('WebSocket: No token, skipping connection')
            return
        }

        // Close existing connection
        if (wsRef.current) {
            wsRef.current.close()
        }

        try {
            const ws = new WebSocket(`${WS_URL}?token=${token}`)

            ws.onopen = () => {
                console.log('WebSocket connected')
                setIsConnected(true)
                reconnectAttempts.current = 0
            }

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data)
                    onMessage?.(data)
                } catch (e) {
                    console.error('Failed to parse WS message:', e)
                }
            }

            ws.onclose = (event) => {
                console.log('WebSocket disconnected:', event.code, event.reason)
                setIsConnected(false)
                wsRef.current = null

                // Auto-reconnect if not intentional close
                if (event.code !== 1000 && reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
                    reconnectAttempts.current++
                    console.log(`WebSocket reconnecting... (attempt ${reconnectAttempts.current})`)
                    reconnectTimeout.current = setTimeout(connect, RECONNECT_INTERVAL)
                }
            }

            ws.onerror = (error) => {
                console.error('WebSocket error:', error)
            }

            wsRef.current = ws
        } catch (e) {
            console.error('WebSocket connection failed:', e)
        }
    }, [onMessage])

    // Connect on mount
    useEffect(() => {
        connect()

        return () => {
            if (reconnectTimeout.current) {
                clearTimeout(reconnectTimeout.current)
            }
            if (wsRef.current) {
                wsRef.current.close(1000, 'Component unmounted')
            }
        }
    }, [connect])

    // Send message helper
    const send = useCallback((type, roomId, data = {}) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type,
                room_id: roomId,
                data,
            }))
            return true
        }
        return false
    }, [])

    // Typed helpers
    const sendTyping = useCallback((roomId) => {
        return send('typing', roomId)
    }, [send])

    const sendRead = useCallback((roomId) => {
        return send('read', roomId)
    }, [send])

    // Manual reconnect
    const reconnect = useCallback(() => {
        reconnectAttempts.current = 0
        connect()
    }, [connect])

    return {
        isConnected,
        send,
        sendTyping,
        sendRead,
        reconnect,
    }
}
