import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import './AdminLayout.css'

function AdminLayout() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/admin/login')
    }

    const menuItems = [
        { path: '/admin', label: 'Дашборд', icon: '📊', exact: true },
        { path: '/admin/leads', label: 'Заявки', icon: '📋' },
        { path: '/admin/users', label: 'Пользователи', icon: '👥' },
        { path: '/admin/employers', label: 'Работодатели', icon: '🏢' },
        { path: '/admin/moderation', label: 'Модерация', icon: '🔍' },
        { path: '/admin/castings', label: 'Кастинги', icon: '🎬' },
        { path: '/admin/payments', label: 'Платежи', icon: '💳' },
        { path: '/admin/audit-logs', label: 'Audit Logs', icon: '📜' },
        { path: '/admin/settings', label: 'Настройки', icon: '⚙️' },
    ]

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-logo">
                    <h1>MWork</h1>
                    <span className="admin-badge">Admin</span>
                </div>

                <nav className="admin-nav">
                    {menuItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.exact}
                            className={({ isActive }) =>
                                `admin-nav-item ${isActive ? 'active' : ''}`
                            }
                        >
                            <span className="admin-nav-icon">{item.icon}</span>
                            <span className="admin-nav-label">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="admin-sidebar-footer">
                    <NavLink to="/dashboard" className="admin-nav-item">
                        <span className="admin-nav-icon">🌐</span>
                        <span className="admin-nav-label">На сайт</span>
                    </NavLink>
                </div>
            </aside>

            {/* Main content */}
            <div className="admin-main">
                {/* Header */}
                <header className="admin-header">
                    <div className="admin-header-left">
                        <h2 className="admin-page-title">Панель управления</h2>
                    </div>
                    <div className="admin-header-right">
                        <div className="admin-user-info">
                            <span className="admin-user-name">{user?.email}</span>
                            <span className="admin-user-role">{user?.role}</span>
                        </div>
                        <button className="admin-logout-btn" onClick={handleLogout}>
                            Выйти
                        </button>
                    </div>
                </header>

                {/* Page content */}
                <main className="admin-content">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default AdminLayout
