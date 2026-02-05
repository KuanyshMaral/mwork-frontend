import { createContext, useContext, useState, useEffect } from 'react'
import { authApi, profileApi } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [creditBalance, setCreditBalance] = useState(0)
    const [loading, setLoading] = useState(true)

    // Check auth on mount
    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            loadUser()
        } else {
            setLoading(false)
        }
    }, [])

    async function loadUser() {
        try {
            const userData = await authApi.me()
            setUser(userData)
            // Set credit balance with fallback to 0 if not provided by backend
            setCreditBalance(userData.creditBalance ?? 0)

            // Also load profile
            try {
                const profileData = await profileApi.getMe()
                setProfile(profileData)
            } catch (e) {
                // Profile might not exist yet
                console.log('No profile found')
            }
        } catch (error) {
            // Token invalid
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            setCreditBalance(0)
        } finally {
            setLoading(false)
        }
    }

    async function login(email, password) {
        const result = await authApi.login({ email, password })

        // Backend returns: { user, tokens: { access_token, refresh_token } }
        const tokens = result.tokens || result
        localStorage.setItem('token', tokens.access_token)
        localStorage.setItem('refreshToken', tokens.refresh_token)

        setUser(result.user)
        // Set credit balance with fallback to 0
        setCreditBalance(result.user.creditBalance ?? 0)

        // Load profile
        try {
            const profileData = await profileApi.getMe()
            setProfile(profileData)
        } catch (e) {
            // Profile doesn't exist yet
        }

        return result
    }

    async function register(data) {
        const result = await authApi.register(data)

        // Backend returns: { user, tokens: { access_token, refresh_token } }
        const tokens = result.tokens || result
        localStorage.setItem('token', tokens.access_token)
        localStorage.setItem('refreshToken', tokens.refresh_token)

        setUser(result.user)
        // Set credit balance with fallback to 0
        setCreditBalance(result.user.creditBalance ?? 0)

        return result
    }

    async function logout() {
        const refreshToken = localStorage.getItem('refreshToken')

        try {
            await authApi.logout({ refresh_token: refreshToken })
        } catch (e) {
            // Ignore logout errors
        }

        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        setUser(null)
        setProfile(null)
        setCreditBalance(0)
    }

    function updateProfile(newProfile) {
        setProfile(newProfile)
    }

    // Balance management functions
    function setBalance(newBalance) {
        setCreditBalance(newBalance)
    }

    async function refreshBalance() {
        try {
            const userData = await authApi.me()
            setCreditBalance(userData.creditBalance ?? 0)
            return userData.creditBalance ?? 0
        } catch (error) {
            console.error('Failed to refresh balance:', error)
            return creditBalance
        }
    }

    function applyBalanceDelta(delta) {
        setCreditBalance(prev => Math.max(0, prev + delta))
    }

    const value = {
        user,
        profile,
        creditBalance,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        reloadUser: loadUser,
        setBalance,
        refreshBalance,
        applyBalanceDelta,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}
