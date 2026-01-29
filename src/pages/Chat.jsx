import { useState, useEffect, useRef } from 'react'
import { useChat } from '../context/ChatContext.jsx'
import { chatApi } from '../api/client'
import ChatImageUpload from '../components/chat/ChatImageUpload'
import ReadReceipt from '../components/chat/ReadReceipt'
import './Chat.css'

export default function Chat() {
    const {
        rooms,
        activeRoom,
        setActiveRoom,
        messages,
        typingUsers,
        isConnected,
        loading,
        sendMessage,
        sendTyping,
    } = useChat()

    const [input, setInput] = useState('')
    const [showMobileSidebar, setShowMobileSidebar] = useState(true)
    const messagesEndRef = useRef(null)

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Hide mobile sidebar when room selected
    useEffect(() => {
        if (activeRoom) {
            setShowMobileSidebar(false)
        }
    }, [activeRoom])

    async function handleSend(e) {
        e.preventDefault()
        if (!input.trim()) return

        try {
            await sendMessage(input)
            setInput('')
        } catch (err) {
            console.error('Failed to send:', err)
        }
    }

    function handleInputChange(e) {
        setInput(e.target.value)
        sendTyping()
    }

    function formatTime(dateStr) {
        if (!dateStr) return ''
        const date = new Date(dateStr)
        return date.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })
    }

    function formatDate(dateStr) {
        if (!dateStr) return ''
        const date = new Date(dateStr)
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        if (date.toDateString() === today.toDateString()) {
            return 'Сегодня'
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Вчера'
        }
        return date.toLocaleDateString('ru', { day: 'numeric', month: 'long' })
    }

    return (
        <div className="chat-page">
            {/* Mobile back button */}
            {!showMobileSidebar && activeRoom && (
                <button className="chat-mobile-back" onClick={() => setShowMobileSidebar(true)}>
                    ← Назад
                </button>
            )}

            {/* Sidebar with rooms */}
            <aside className={`chat-sidebar ${showMobileSidebar ? '' : 'hidden-mobile'}`}>
                <div className="chat-sidebar-header">
                    <h2>Сообщения</h2>
                    <span className={`connection-status ${isConnected ? 'online' : 'offline'}`} title={isConnected ? 'Онлайн' : 'Офлайн'}>
                        {isConnected ? '●' : '○'}
                    </span>
                </div>

                <div className="chat-rooms">
                    {rooms.length === 0 ? (
                        <div className="no-rooms">
                            <div className="no-rooms-icon">💬</div>
                            <p>Нет сообщений</p>
                            <small>Чат появится после одобрения вашего отклика работодателем</small>
                        </div>
                    ) : (
                        rooms.map(room => (
                            <div
                                key={room.id}
                                className={`chat-room-item ${activeRoom?.id === room.id ? 'active' : ''}`}
                                onClick={() => setActiveRoom(room)}
                            >
                                <div className="room-avatar">
                                    {room.other_participant_name?.[0]?.toUpperCase() || '?'}
                                </div>
                                <div className="room-info">
                                    <div className="room-name">{room.other_participant_name || 'Пользователь'}</div>
                                    <div className="room-preview">
                                        {room.last_message || 'Нет сообщений'}
                                    </div>
                                </div>
                                {room.unread_count > 0 && (
                                    <span className="unread-badge">{room.unread_count}</span>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </aside>

            {/* Main chat area */}
            <main className={`chat-main ${!showMobileSidebar ? '' : 'hidden-mobile'}`}>
                {!activeRoom ? (
                    <div className="no-room-selected">
                        <div className="empty-icon">💬</div>
                        <h3>Выберите чат</h3>
                        <p>Выберите разговор из списка слева</p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="chat-header">
                            <div className="chat-header-avatar">
                                {activeRoom.other_participant_name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div className="chat-header-info">
                                <h3>{activeRoom.other_participant_name || 'Пользователь'}</h3>
                                {typingUsers.length > 0 && (
                                    <span className="typing-indicator">печатает...</span>
                                )}
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="chat-messages">
                            {loading ? (
                                <div className="chat-loading">Загрузка...</div>
                            ) : messages.length === 0 ? (
                                <div className="chat-empty">
                                    <p>Начните общение!</p>
                                    <small>Отправьте первое сообщение</small>
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const showDate = idx === 0 ||
                                        formatDate(msg.created_at) !== formatDate(messages[idx - 1]?.created_at)

                                    return (
                                        <div key={msg.id || idx}>
                                            {showDate && (
                                                <div className="message-date-divider">
                                                    <span>{formatDate(msg.created_at)}</span>
                                                </div>
                                            )}
                                            <div className={`message ${msg.is_own ? 'own' : 'other'}`}>
                                                <div className="message-content">
                                                    {msg.message_type === 'image' ? (
                                                        <img 
                                                            src={msg.content} 
                                                            alt="Изображение" 
                                                            className="message-image"
                                                            onClick={() => window.open(msg.content, '_blank')}
                                                        />
                                                    ) : (
                                                        msg.content
                                                    )}
                                                </div>
                                                <div className="message-meta">
                                                    <span className="message-time">{formatTime(msg.created_at)}</span>
                                                    <ReadReceipt isRead={msg.is_read} isOwn={msg.is_own} />
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form className="chat-input-form" onSubmit={handleSend}>
                            <ChatImageUpload roomId={activeRoom.id} onMessageSent={() => {}} />
                            <input
                                type="text"
                                value={input}
                                onChange={handleInputChange}
                                placeholder="Введите сообщение..."
                                className="chat-input"
                                autoComplete="off"
                            />
                            <button type="submit" className="chat-send-btn" disabled={!input.trim()}>
                                <span className="send-icon">➤</span>
                            </button>
                        </form>
                    </>
                )}
            </main>
        </div>
    )
}
