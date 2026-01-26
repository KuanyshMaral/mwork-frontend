import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { chatApi } from '../api/client'
import { useWebSocket } from '../hooks/useWebSocket.js'
import { useAuth } from '../hooks/useAuth.jsx'

const ChatContext = createContext(null)

export function ChatProvider({ children }) {
    const { user } = useAuth()
    const [rooms, setRooms] = useState([])
    const [activeRoom, setActiveRoom] = useState(null)
    const [messages, setMessages] = useState({}) // roomId -> messages[]
    const [unreadCount, setUnreadCount] = useState(0)
    const [typingUsers, setTypingUsers] = useState({}) // roomId -> userId[]
    const [loading, setLoading] = useState(false)

    // Store activeRoom in ref for WebSocket callback
    const activeRoomRef = useRef(activeRoom)
    useEffect(() => {
        activeRoomRef.current = activeRoom
    }, [activeRoom])

    // Handle incoming WebSocket messages
    const handleWSMessage = useCallback((event) => {
        switch (event.type) {
            case 'new_message':
                // Add message to room
                setMessages(prev => ({
                    ...prev,
                    [event.room_id]: [...(prev[event.room_id] || []), event.message],
                }))

                // Update room's last message
                setRooms(prev => prev.map(room =>
                    room.id === event.room_id
                        ? {
                            ...room,
                            last_message: event.message.content,
                            last_message_at: event.message.created_at,
                            unread_count: activeRoomRef.current?.id === event.room_id
                                ? 0
                                : (room.unread_count || 0) + 1
                        }
                        : room
                ))

                // Increment global unread if not active room
                if (activeRoomRef.current?.id !== event.room_id) {
                    setUnreadCount(prev => prev + 1)
                }
                break

            case 'typing':
                if (event.sender_id === user?.id) return // Ignore own typing

                // Show typing indicator
                setTypingUsers(prev => ({
                    ...prev,
                    [event.room_id]: [...new Set([...(prev[event.room_id] || []), event.sender_id])],
                }))

                // Clear after 3 seconds
                setTimeout(() => {
                    setTypingUsers(prev => ({
                        ...prev,
                        [event.room_id]: (prev[event.room_id] || []).filter(id => id !== event.sender_id),
                    }))
                }, 3000)
                break

            case 'read':
                // TODO: Update message read status
                break

            case 'online':
            case 'offline':
                // TODO: Handle presence updates
                break
        }
    }, [user?.id])

    const { isConnected, sendTyping, sendRead } = useWebSocket(handleWSMessage)

    // Load rooms on mount (only if logged in)
    useEffect(() => {
        if (!user) return

        async function loadRooms() {
            try {
                const data = await chatApi.getRooms()
                setRooms(data || [])
            } catch (e) {
                console.error('Failed to load rooms:', e)
            }
        }
        loadRooms()

        // Load unread count
        chatApi.getUnreadCount()
            .then(data => setUnreadCount(data?.unread_count || 0))
            .catch(() => { })
    }, [user])

    // Load messages when room changes
    useEffect(() => {
        if (!activeRoom) return

        async function loadMessages() {
            setLoading(true)
            try {
                const data = await chatApi.getMessages(activeRoom.id)
                setMessages(prev => ({ ...prev, [activeRoom.id]: data || [] }))

                // Mark as read
                await chatApi.markAsRead(activeRoom.id)
                sendRead(activeRoom.id)

                // Update local unread count
                setRooms(prev => prev.map(room =>
                    room.id === activeRoom.id ? { ...room, unread_count: 0 } : room
                ))

                // Recalculate global unread
                setUnreadCount(prev => {
                    const roomUnread = rooms.find(r => r.id === activeRoom.id)?.unread_count || 0
                    return Math.max(0, prev - roomUnread)
                })
            } catch (e) {
                console.error('Failed to load messages:', e)
            } finally {
                setLoading(false)
            }
        }
        loadMessages()
    }, [activeRoom?.id, sendRead])

    // Send message
    const sendMessage = async (content) => {
        if (!activeRoom || !content.trim()) return

        try {
            const msg = await chatApi.sendMessage(activeRoom.id, content.trim())
            // Message will arrive via WebSocket, but add optimistically
            setMessages(prev => ({
                ...prev,
                [activeRoom.id]: [...(prev[activeRoom.id] || []), { ...msg, is_own: true }],
            }))
            return msg
        } catch (e) {
            console.error('Failed to send message:', e)
            throw e
        }
    }

    // Start new chat with user
    const startChat = async (recipientId, initialMessage = '') => {
        try {
            const room = await chatApi.createRoom(recipientId, initialMessage)
            setRooms(prev => {
                const exists = prev.find(r => r.id === room.id)
                return exists ? prev : [room, ...prev]
            })
            setActiveRoom(room)
            return room
        } catch (e) {
            console.error('Failed to start chat:', e)
            throw e
        }
    }

    // Typing indicator with debounce
    const typingTimeoutRef = useRef(null)
    const handleTyping = useCallback(() => {
        if (!activeRoom) return

        // Debounce typing events
        if (typingTimeoutRef.current) return

        sendTyping(activeRoom.id)
        typingTimeoutRef.current = setTimeout(() => {
            typingTimeoutRef.current = null
        }, 2000)
    }, [activeRoom, sendTyping])

    // Refresh rooms
    const refreshRooms = async () => {
        try {
            const data = await chatApi.getRooms()
            setRooms(data || [])
        } catch (e) {
            console.error('Failed to refresh rooms:', e)
        }
    }

    const value = {
        // State
        rooms,
        activeRoom,
        messages: messages[activeRoom?.id] || [],
        unreadCount,
        typingUsers: typingUsers[activeRoom?.id] || [],
        isConnected,
        loading,

        // Actions
        setActiveRoom,
        sendMessage,
        sendTyping: handleTyping,
        startChat,
        refreshRooms,
    }

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}

export function useChat() {
    const context = useContext(ChatContext)
    if (!context) {
        // Return dummy values if not inside provider (e.g., public pages)
        return {
            rooms: [],
            activeRoom: null,
            messages: [],
            unreadCount: 0,
            typingUsers: [],
            isConnected: false,
            loading: false,
            setActiveRoom: () => { },
            sendMessage: async () => { },
            sendTyping: () => { },
            startChat: async () => { },
            refreshRooms: async () => { },
        }
    }
    return context
}
