import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { dashboardApi, castingApi, responseApi, chatApi } from '../api/client'
import './Dashboard.css'

export default function Dashboard() {
    const { profile, user } = useAuth()
    const navigate = useNavigate()
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('castings')

    // Real data states
    const [featuredCastings, setFeaturedCastings] = useState([])
    const [recentCastings, setRecentCastings] = useState([])
    const [myResponses, setMyResponses] = useState([])
    const [responsesLoading, setResponsesLoading] = useState(false)
    const [chatRooms, setChatRooms] = useState([])

    useEffect(() => {
        loadData()
    }, [])

    // Load responses when tab changes
    useEffect(() => {
        if (activeTab === 'responses') {
            loadResponses()
        } else if (activeTab === 'messages') {
            loadChatRooms()
        }
    }, [activeTab])

    async function loadData() {
        try {
            // Load stats
            const statsData = await dashboardApi.getModelStats()
            setStats(statsData)
        } catch (err) {
            console.error('Failed to load stats:', err)
            setStats({
                profile_views: 0,
                responses_used: 0,
                responses_limit: 20,
                rating: 0.0,
                total_earnings: 0,
                current_plan: 'free',
            })
        }

        // Load castings (featured + recent)
        try {
            const castingsData = await castingApi.list({ limit: 6 })
            const items = castingsData?.items || castingsData || []
            // First 3 for featured carousel
            setFeaturedCastings(items.slice(0, 3))
            // All 6 for recent list
            setRecentCastings(items)
        } catch (err) {
            console.error('Failed to load castings:', err)
        }

        setLoading(false)
    }

    async function loadResponses() {
        setResponsesLoading(true)
        try {
            const data = await responseApi.getMyApplications()
            setMyResponses(data?.items || data || [])
        } catch (err) {
            console.error('Failed to load responses:', err)
        } finally {
            setResponsesLoading(false)
        }
    }

    async function loadChatRooms() {
        try {
            const data = await chatApi.getRooms()
            setChatRooms(data || [])
        } catch (err) {
            console.error('Failed to load chat rooms:', err)
        }
    }

    // Helper: format pay range
    function formatPayRange(casting) {
        if (!casting.pay_min && !casting.pay_max) {
            return casting.pay_type === 'free' ? 'TFP (бесплатно)' : 'По договоренности'
        }
        if (casting.pay_min === casting.pay_max) {
            return `₸${casting.pay_min?.toLocaleString()}`
        }
        return `₸${casting.pay_min?.toLocaleString() || 0} - ${casting.pay_max?.toLocaleString() || 0}`
    }

    // Helper: format date
    function formatDate(dateStr) {
        if (!dateStr) return ''
        const date = new Date(dateStr)
        return date.toLocaleDateString('ru', { day: 'numeric', month: 'long' })
    }

    // Render content based on active tab
    function renderTabContent() {
        switch (activeTab) {
            case 'castings':
                return <CastingsTab
                    castings={recentCastings}
                    formatPayRange={formatPayRange}
                    formatDate={formatDate}
                    navigate={navigate}
                />
            case 'responses':
                return <ResponsesTab responses={myResponses} loading={responsesLoading} />
            case 'messages':
                return <MessagesTab rooms={chatRooms} />
            case 'analytics':
                return <AnalyticsTab stats={stats} />
            default:
                return <CastingsTab
                    castings={recentCastings}
                    formatPayRange={formatPayRange}
                    formatDate={formatDate}
                    navigate={navigate}
                />
        }
    }

    if (loading) {
        return <div className="loading">Загрузка...</div>
    }

    return (
        <div className="dashboard">
            {/* Search Bar */}
            <div className="search-bar">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Поиск кастингов..."
                />
                <div className="search-filters">
                    <button className="filter-btn">🏙 Город</button>
                    <button className="filter-btn">🎭 Категории</button>
                    <button className="filter-btn">💰 Оплата</button>
                    <button className="search-btn" onClick={() => navigate('/castings')}>Найти</button>
                </div>
            </div>

            {/* Featured Castings Carousel */}
            <section className="section">
                <h2>Рекомендуемые кастинги</h2>
                {featuredCastings.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🎬</div>
                        <h3>Нет кастингов</h3>
                        <p>Кастинги пока не созданы</p>
                    </div>
                ) : (
                    <div className="featured-carousel">
                        {featuredCastings.map((casting, index) => (
                            <div
                                key={casting.id}
                                className={`featured-card ${index === 0 ? 'urgent' : 'casting'}`}
                                onClick={() => navigate(`/castings/${casting.id}`)}
                                style={{ cursor: 'pointer' }}
                            >
                                <span className="featured-label">
                                    {casting.pay_type === 'free' ? 'TFP' : 'КАСТИНГ'}
                                </span>
                                <h3>{casting.title}</h3>
                                <p className="featured-company">{casting.creator_name || 'Работодатель'}</p>
                                <p className="featured-desc">
                                    {casting.description?.substring(0, 80)}...
                                </p>
                                <div className="featured-meta">
                                    <span>📍 {casting.city}</span>
                                    <span>{formatPayRange(casting)}</span>
                                </div>
                                <button className="featured-btn">
                                    Откликнуться
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Responses Alert */}
            <div className="responses-alert">
                <div className="alert-icon">💬</div>
                <div className="alert-content">
                    <p><strong>Вы использовали {stats?.responses_used || 0} из {stats?.responses_limit || 20} откликов в этом месяце</strong></p>
                    <p className="alert-sub">Обновите план для неограниченных откликов</p>
                </div>
                <Link to="/subscriptions" className="alert-btn">Обновить план</Link>
            </div>

            {/* Stats Row */}
            <div className="stats-row">
                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-label">Просмотры профиля</span>
                        <span className="stat-icon">👁</span>
                    </div>
                    <div className="stat-value">{stats?.profile_views?.toLocaleString() || 0}</div>
                    <div className="stat-sub">+продвижение в Start</div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-label">Отклики в месяце</span>
                        <span className="stat-icon">💬</span>
                    </div>
                    <div className="stat-value">
                        {stats?.responses_used || 0}<span className="stat-total">/{stats?.responses_limit || 20}</span>
                    </div>
                    <div className="stat-sub">Неограниченно в Pro</div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-label">Рейтинг</span>
                        <span className="stat-icon star">⭐</span>
                    </div>
                    <div className="stat-value">{stats?.rating?.toFixed(1) || '0.0'}</div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-label">Заработано</span>
                        <span className="stat-icon earnings">📈</span>
                    </div>
                    <div className="stat-value earnings">₸{(stats?.total_earnings || 0).toLocaleString()}</div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="content-tabs">
                <button
                    className={`tab-btn ${activeTab === 'castings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('castings')}
                >
                    Новые кастинги
                </button>
                <button
                    className={`tab-btn ${activeTab === 'responses' ? 'active' : ''}`}
                    onClick={() => setActiveTab('responses')}
                >
                    Мои отклики
                </button>
                <button
                    className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
                    onClick={() => setActiveTab('messages')}
                >
                    Сообщения
                </button>
                <button
                    className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
                    onClick={() => setActiveTab('analytics')}
                >
                    Аналитика
                </button>
            </div>

            {/* Tab Content */}
            {renderTabContent()}

            {/* Profile Promotion */}
            <section className="promotion-section">
                <div className="promotion-icon">⭐</div>
                <h3>Продвижение профиля</h3>
                <p>Ваш профиль будет показан в приоритете и получит больше просмотров</p>
                <div className="promotion-badges">
                    <span className="badge-lock">🔒 Доступно в плане</span>
                    <span className="badge-plan">MWork Start</span>
                </div>
                <Link to="/subscriptions" className="promotion-btn">
                    ⭐ Обновить план
                </Link>
            </section>
        </div>
    )
}

// Tab Components
function CastingsTab({ castings, formatPayRange, formatDate, navigate }) {
    if (!castings || castings.length === 0) {
        return (
            <section className="section">
                <div className="section-header">
                    <h2>Рекомендованные кастинги</h2>
                    <Link to="/castings" className="view-all">Смотреть все</Link>
                </div>
                <div className="empty-state">
                    <div className="empty-icon">🎬</div>
                    <h3>Нет кастингов</h3>
                    <p>Попробуйте зайти позже или создайте свой кастинг</p>
                </div>
            </section>
        )
    }

    return (
        <section className="section">
            <div className="section-header">
                <h2>Рекомендованные кастинги</h2>
                <Link to="/castings" className="view-all">Смотреть все</Link>
            </div>

            <div className="castings-list">
                {castings.map(casting => (
                    <div
                        key={casting.id}
                        className="casting-item"
                        onClick={() => navigate(`/castings/${casting.id}`)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="casting-info">
                            <div className="casting-title-row">
                                <h3>{casting.title}</h3>
                                {casting.pay_type === 'free' && <span className="urgent-badge">TFP</span>}
                            </div>
                            <p className="casting-company">{casting.creator_name || 'Работодатель'}</p>
                            <div className="casting-meta">
                                <span>📍 {casting.city}</span>
                                <span>📅 {formatDate(casting.date_from)}</span>
                                <span>💰 {formatPayRange(casting)}</span>
                            </div>
                        </div>
                        <div className="casting-actions" onClick={e => e.stopPropagation()}>
                            <button className="save-btn">♡ Сохранить</button>
                            <button
                                className="apply-btn"
                                onClick={() => navigate(`/castings/${casting.id}`)}
                            >
                                Откликнуться
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}

function ResponsesTab({ responses, loading }) {
    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'На рассмотрении'
            case 'viewed': return 'Просмотрено'
            case 'accepted': return 'Принято'
            case 'rejected': return 'Отклонено'
            case 'withdrawn': return 'Отозвано'
            default: return status
        }
    }

    if (loading) {
        return (
            <section className="section">
                <div className="section-header">
                    <h2>Мои отклики</h2>
                </div>
                <div className="loading-state">Загрузка откликов...</div>
            </section>
        )
    }

    return (
        <section className="section">
            <div className="section-header">
                <h2>Мои отклики</h2>
            </div>

            {(!responses || responses.length === 0) ? (
                <div className="empty-state">
                    <div className="empty-icon">📝</div>
                    <h3>Пока нет откликов</h3>
                    <p>Откликайтесь на интересные кастинги, и они появятся здесь</p>
                    <Link to="/castings" className="empty-btn">Найти кастинги</Link>
                </div>
            ) : (
                <div className="responses-list">
                    {responses.map(response => (
                        <div key={response.id} className="response-item">
                            <div className="response-info">
                                <h3>{response.casting?.title || 'Кастинг'}</h3>
                                <p className="response-company">{response.casting?.company || ''}</p>
                                <div className="response-meta">
                                    <span>📍 {response.casting?.city || ''}</span>
                                </div>
                            </div>
                            <div className="response-status">
                                <span className={`status-badge ${response.status}`}>
                                    {getStatusText(response.status)}
                                </span>
                                <p className="response-date">
                                    Отклик от {new Date(response.created_at).toLocaleDateString('ru')}
                                </p>
                                {response.status === 'accepted' && (
                                    <Link to="/messages" className="chat-link">💬 Написать</Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}

function MessagesTab({ rooms }) {
    return (
        <section className="section">
            <div className="section-header">
                <h2>Сообщения</h2>
            </div>

            {(!rooms || rooms.length === 0) ? (
                <div className="empty-state">
                    <div className="empty-icon">💬</div>
                    <h3>Нет сообщений</h3>
                    <p>Здесь будут ваши переписки с работодателями</p>
                    <div className="empty-note">
                        💡 Чат доступен после одобрения вашего отклика
                    </div>
                </div>
            ) : (
                <div className="chat-list">
                    {rooms.map(room => (
                        <Link key={room.id} to="/messages" className="chat-item">
                            <div className="chat-avatar">
                                {room.other_participant_name?.[0] || '👤'}
                            </div>
                            <div className="chat-info">
                                <h4>{room.other_participant_name || 'Работодатель'}</h4>
                                <p className="chat-preview">{room.last_message || 'Начните переписку'}</p>
                            </div>
                            {room.unread_count > 0 && (
                                <span className="unread-badge">{room.unread_count}</span>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </section>
    )
}

function AnalyticsTab({ stats }) {
    return (
        <section className="section">
            <div className="section-header">
                <h2>Аналитика профиля</h2>
            </div>

            <div className="analytics-grid">
                <div className="analytics-card">
                    <h4>Просмотры за месяц</h4>
                    <div className="analytics-value">{stats?.profile_views || 0}</div>
                    <div className="analytics-chart">
                        <div className="chart-bar" style={{ height: '60%' }}></div>
                        <div className="chart-bar" style={{ height: '40%' }}></div>
                        <div className="chart-bar" style={{ height: '80%' }}></div>
                        <div className="chart-bar" style={{ height: '20%' }}></div>
                        <div className="chart-bar" style={{ height: '50%' }}></div>
                        <div className="chart-bar" style={{ height: '70%' }}></div>
                        <div className="chart-bar active" style={{ height: '100%' }}></div>
                    </div>
                    <p className="analytics-period">Последние 7 дней</p>
                </div>

                <div className="analytics-card">
                    <h4>Откликов отправлено</h4>
                    <div className="analytics-value">{stats?.responses_used || 0}</div>
                    <div className="analytics-progress">
                        <div
                            className="progress-bar"
                            style={{ width: `${((stats?.responses_used || 0) / (stats?.responses_limit || 20)) * 100}%` }}
                        ></div>
                    </div>
                    <p className="analytics-sub">Лимит: {stats?.responses_limit || 20} в месяц</p>
                </div>

                <div className="analytics-card">
                    <h4>Средний рейтинг</h4>
                    <div className="analytics-value star">⭐ {stats?.rating?.toFixed(1) || '0.0'}</div>
                    <p className="analytics-sub">На основе отзывов работодателей</p>
                </div>

                <div className="analytics-card">
                    <h4>Общий заработок</h4>
                    <div className="analytics-value earnings">₸{(stats?.total_earnings || 0).toLocaleString()}</div>
                    <p className="analytics-sub">За всё время</p>
                </div>
            </div>

            <div className="analytics-tip">
                <span className="tip-icon">💡</span>
                <p><strong>Совет:</strong> Заполните профиль на 100% для лучших результатов поиска</p>
            </div>
        </section>
    )
}
