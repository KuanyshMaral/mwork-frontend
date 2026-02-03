import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../api/client'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
    const [adminUser, setAdminUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // Check admin auth on mount
    useEffect(() => {
        const adminToken = localStorage.getItem('admin_token')
        const storedAdminUser = localStorage.getItem('admin_user')
        
        if (adminToken && storedAdminUser) {
            try {
                const admin = JSON.parse(storedAdminUser)
                setAdminUser(admin)
                
                // Verify admin session with backend
                authApi.adminMe().then(userData => {
                    setAdminUser(userData)
                    localStorage.setItem('admin_user', JSON.stringify(userData))
                }).catch(() => {
                    // Token invalid, clear admin session
                    localStorage.removeItem('admin_token')
                    localStorage.removeItem('admin_user')
                    setAdminUser(null)
                })
            } catch (error) {
                // Invalid stored data, clear it
                localStorage.removeItem('admin_token')
                localStorage.removeItem('admin_user')
            }
        }
        
        setLoading(false)
    }, [])

    async function adminLogin(email, password) {
        const result = await authApi.adminLogin({ email, password })
        
        localStorage.setItem('admin_token', result.Token)
        localStorage.setItem('admin_user', JSON.stringify(result.Admin))
        setAdminUser(result.Admin)
        
        return result
    }

    async function adminLogout() {
        try {
            await authApi.adminLogout()
        } catch (e) {
            // Ignore logout errors
        }

        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
        setAdminUser(null)
    }

    const value = {
        adminUser,
        loading,
        isAuthenticated: !!adminUser,
        adminLogin,
        adminLogout,
    }

    return (
        <AdminAuthContext.Provider value={value}>
            {children}
        </AdminAuthContext.Provider>
    )
}

export function useAdminAuth() {
    const context = useContext(AdminAuthContext)
    if (!context) {
        throw new Error('useAdminAuth must be used within AdminAuthProvider')
    }
    return context
}
