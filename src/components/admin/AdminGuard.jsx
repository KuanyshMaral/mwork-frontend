import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

/**
 * AdminGuard - Protects admin routes
 * Checks if user is authenticated AND has admin role
 */
function AdminGuard({ children }) {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="spinner"></div>
                <p>Загрузка...</p>
            </div>
        )
    }

    // Not authenticated
    if (!user) {
        return <Navigate to="/admin/login" replace />
    }

    // Check admin role (admin, super_admin, moderator, support)
    const adminRoles = ['admin', 'super_admin', 'moderator', 'support']
    if (!adminRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />
    }

    return children
}

export default AdminGuard
