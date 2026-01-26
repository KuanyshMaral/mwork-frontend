import { useState, useEffect } from 'react'
import api from '../../api/client'
import './Admin.css'

const ENTITY_TYPES = {
    profile: { label: 'Профили', icon: '👤' },
    photo: { label: 'Фото', icon: '📸' },
    casting: { label: 'Кастинги', icon: '🎬' },
    review: { label: 'Отзывы', icon: '⭐' }
}

function AdminModeration() {
    const [activeTab, setActiveTab] = useState('photo')
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ profile: 0, photo: 0, casting: 0, review: 0 })

    useEffect(() => {
        fetchQueue()
    }, [activeTab])

    const fetchQueue = async () => {
        setLoading(true)
        try {
            const response = await api.get(`/admin/moderation/queue?type=${activeTab}`)
            setItems(response.data?.items || [])
            setStats(response.data?.stats || { profile: 0, photo: 0, casting: 0, review: 0 })
        } catch (err) {
            console.error('Failed to fetch moderation queue:', err)
            // Mock data for development
            setItems([
                {
                    id: '1',
                    type: 'photo',
                    user_id: 'user-1',
                    user_name: 'Мария Иванова',
                    url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300',
                    created_at: new Date().toISOString()
                },
                {
                    id: '2',
                    type: 'photo',
                    user_id: 'user-2',
                    user_name: 'Алексей Петров',
                    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
                    created_at: new Date(Date.now() - 3600000).toISOString()
                }
            ])
            setStats({ profile: 3, photo: 8, casting: 2, review: 1 })
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (id) => {
        try {
            await api.post(`/admin/moderation/${activeTab}/${id}/approve`)
            setItems(items.filter(item => item.id !== id))
            setStats(prev => ({ ...prev, [activeTab]: prev[activeTab] - 1 }))
        } catch (err) {
            console.error('Failed to approve:', err)
            alert('Ошибка при одобрении')
        }
    }

    const handleReject = async (id, reason = '') => {
        const rejectReason = reason || prompt('Причина отклонения:')
        if (!rejectReason) return

        try {
            await api.post(`/admin/moderation/${activeTab}/${id}/reject`, { reason: rejectReason })
            setItems(items.filter(item => item.id !== id))
            setStats(prev => ({ ...prev, [activeTab]: prev[activeTab] - 1 }))
        } catch (err) {
            console.error('Failed to reject:', err)
            alert('Ошибка при отклонении')
        }
    }

    const handleBulkApprove = async () => {
        if (!confirm(`Одобрить все ${items.length} элементов?`)) return

        for (const item of items) {
            try {
                await api.post(`/admin/moderation/${activeTab}/${item.id}/approve`)
            } catch (err) {
                console.error(`Failed to approve ${item.id}:`, err)
            }
        }
        fetchQueue()
    }

    const totalPending = Object.values(stats).reduce((a, b) => a + b, 0)

    return (
        <div className="admin-moderation">
            <div className="admin-page-header">
                <div>
                    <h1>🔍 Модерация</h1>
                    <p className="admin-subtitle">
                        {totalPending} элементов ожидают проверки
                    </p>
                </div>
                {items.length > 0 && (
                    <button className="admin-btn success" onClick={handleBulkApprove}>
                        ✅ Одобрить все ({items.length})
                    </button>
                )}
            </div>

            {/* Type Tabs */}
            <div className="admin-tabs">
                {Object.entries(ENTITY_TYPES).map(([type, { label, icon }]) => (
                    <button
                        key={type}
                        className={`admin-tab ${activeTab === type ? 'active' : ''}`}
                        onClick={() => setActiveTab(type)}
                    >
                        {icon} {label} ({stats[type] || 0})
                    </button>
                ))}
            </div>

            {/* Queue */}
            {loading ? (
                <div className="admin-page-loading">Загрузка...</div>
            ) : items.length === 0 ? (
                <div className="admin-empty">
                    <p>✨ Очередь пуста</p>
                </div>
            ) : (
                <div className="moderation-grid">
                    {items.map(item => (
                        <div key={item.id} className="moderation-card">
                            {/* Photo preview */}
                            {activeTab === 'photo' && item.url && (
                                <div className="moderation-image">
                                    <img src={item.url} alt="Preview" />
                                </div>
                            )}

                            {/* Profile preview */}
                            {activeTab === 'profile' && (
                                <div className="moderation-profile">
                                    <div className="moderation-avatar">
                                        {item.avatar_url ? (
                                            <img src={item.avatar_url} alt="" />
                                        ) : (
                                            <span>👤</span>
                                        )}
                                    </div>
                                    <h4>{item.name || 'Без имени'}</h4>
                                </div>
                            )}

                            {/* Casting preview */}
                            {activeTab === 'casting' && (
                                <div className="moderation-casting">
                                    <h4>{item.title}</h4>
                                    <p>{item.description?.slice(0, 100)}...</p>
                                </div>
                            )}

                            {/* Review preview */}
                            {activeTab === 'review' && (
                                <div className="moderation-review">
                                    <div className="moderation-rating">
                                        {'⭐'.repeat(item.rating || 5)}
                                    </div>
                                    <p>{item.text?.slice(0, 150)}...</p>
                                </div>
                            )}

                            {/* Meta */}
                            <div className="moderation-meta">
                                <span>👤 {item.user_name || 'Пользователь'}</span>
                                <span>{new Date(item.created_at).toLocaleDateString('ru-RU')}</span>
                            </div>

                            {/* Actions */}
                            <div className="moderation-actions">
                                <button
                                    className="admin-btn success"
                                    onClick={() => handleApprove(item.id)}
                                >
                                    ✅ Одобрить
                                </button>
                                <button
                                    className="admin-btn danger"
                                    onClick={() => handleReject(item.id)}
                                >
                                    ❌ Отклонить
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default AdminModeration
