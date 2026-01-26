import { createContext, useContext, useState, useEffect } from 'react'
import { authApi, profileApi } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
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
    }

    function updateProfile(newProfile) {
        setProfile(newProfile)
    }

    const value = {
        user,
        profile,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        reloadUser: loadUser,
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
