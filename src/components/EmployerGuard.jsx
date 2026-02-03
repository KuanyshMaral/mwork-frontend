import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { authApi } from '../api/client'
import EmployerPendingStatus from './EmployerPendingStatus'

function EmployerGuard({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        checkUserStatus()
    }, [])

    const checkUserStatus = async () => {
        try {
            const userData = await authApi.me()
            setUser(userData)
        } catch (error) {
            console.error('Failed to check user status:', error)
            // If token is invalid, redirect to login
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            window.location.href = '/login'
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="loading">Загрузка...</div>
    }

    // If user is not logged in
    if (!user) {
        return <Navigate to="/login" replace />
    }

    // If user is employer with pending status, show pending screen
    if (user.role === 'employer' && user.status === 'pending') {
        return <EmployerPendingStatus />
    }

    // If user is employer with rejected status, show rejection screen
    if (user.role === 'employer' && user.status === 'rejected') {
        return <EmployerPendingStatus />
    }

    // Otherwise, allow access
    return children
}

export default EmployerGuard
