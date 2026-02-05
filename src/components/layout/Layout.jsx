import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useChat } from '../../context/ChatContext.jsx'
import { useNotifications } from '../../context/NotificationContext.jsx'
import BalanceWidget from '../balance/BalanceWidget.jsx'
import './Layout.css'

export default function Layout() {
    const { user, profile, logout } = useAuth()
    const { unreadCount: chatUnread } = useChat()
    const { unreadCount: notifUnread } = useNotifications()
    const location = useLocation()
    const navigate = useNavigate()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    async function handleLogout() {
        await logout()
        navigate('/login')
    }

    const isActive = (path) => location.pathname === path ? 'active' : ''

    return (
        <div className="layout">
            {/* Mobile Menu Button */}
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <span></span>
                <span></span>
                <span></span>
            </button>

            {/* Overlay */}
            <div
                className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
                onClick={() => setSidebarOpen(false)}
            ></div>

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                {/* Logo */}
                <div className="sidebar-header">
                    <Link to="/dashboard" className="sidebar-logo">
                        <div className="logo-icon">M</div>
                        <span className="logo-text">MWork</span>
                    </Link>
                </div>

                {/* User Profile */}
                <div className="sidebar-profile">
                    <div className="profile-avatar">
                        {profile?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="profile-info">
                        <p className="profile-name">{profile?.first_name || user?.email?.split('@')[0] || 'Пользователь'}</p>
                        <p className="profile-plan">
                            <span className="plan-label">{user?.role === 'model' ? 'Модель' : 'Работодатель'}</span>
                            <span className="plan-badge">Free</span>
                        </p>
                        <div className="profile-balance">
                            <BalanceWidget />
                        </div>
                    </div>
                </div>

                {/* Main Navigation */}
                <nav className="sidebar-nav">
                    <ul className="nav-list">
                        <li className="nav-item">
                            <Link to="/dashboard" className={isActive('/dashboard')}>
                                <span className="nav-icon">🏠</span>
                                <span>Главная</span>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/castings" className={isActive('/castings')}>
                                <span className="nav-icon">🎬</span>
                                <span>Кастинги</span>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/photostudios" className={isActive('/photostudios')}>
                                <span className="nav-icon">📷</span>
                                <span>Фотостудии</span>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/advertising" className={isActive('/advertising')}>
                                <span className="nav-icon">📢</span>
                                <span>Реклама</span>
                            </Link>
                        </li>

                        <li className="nav-divider"></li>

                        <li className="nav-item">
                            <Link to="/profile" className={isActive('/profile')}>
                                <span className="nav-icon">👤</span>
                                <span>Профиль</span>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/profile/edit" className={isActive('/profile/edit')}>
                                <span className="nav-icon">✏️</span>
                                <span>Редактировать</span>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/subscriptions" className={isActive('/subscriptions')}>
                                <span className="nav-icon">⭐</span>
                                <span>Подписка</span>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/credits" className={isActive('/credits')}>
                                <span className="nav-icon">💰</span>
                                <span>Кредиты</span>
                            </Link>
                        </li>
                    </ul>
                </nav>

                {/* Footer */}
                <div className="sidebar-footer">
                    <div className="footer-item">
                        <Link to="/messages" className={`footer-link ${isActive('/messages')}`}>
                            <span className="nav-icon">💬</span>
                            <span>Сообщения</span>
                            {chatUnread > 0 && <span className="badge-count">{chatUnread}</span>}
                        </Link>
                    </div>
                    <div className="footer-item">
                        <Link to="/settings/notifications" className={`footer-link ${isActive('/settings/notifications')}`}>
                            <span className="nav-icon">🔔</span>
                            <span>Уведомления</span>
                            {notifUnread > 0 && <span className="badge-count">{notifUnread}</span>}
                        </Link>
                    </div>
                    <div className="footer-item">
                        <button onClick={handleLogout} className="logout-btn">
                            <span className="nav-icon">🚪</span>
                            <span>Выйти</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <div className="page-content">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
