import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'

const CreditsContext = createContext(null)

export function CreditsProvider({ children }) {
    const { creditBalance, setBalance, refreshBalance, applyBalanceDelta } = useAuth()
    const [loading, setLoading] = useState(true)

    // Initialize with auth balance
    useEffect(() => {
        setLoading(false)
    }, [])

    // Update balance using auth context
    const updateBalance = (newBalance) => {
        setBalance(newBalance)
    }

    // Add credits
    const addCredits = (amount) => {
        applyBalanceDelta(amount)
    }

    // Deduct credits
    const deductCredits = (amount) => {
        applyBalanceDelta(-amount)
    }

    // Refresh balance from server
    const refreshCredits = async () => {
        return await refreshBalance()
    }

    // Check if user has enough credits
    const hasEnoughCredits = (required) => {
        return creditBalance >= required
    }

    // Get prevention preference flag
    const getPreventionFlag = () => {
        return localStorage.getItem('creditsPreventionShown') === 'true'
    }

    // Set prevention preference flag
    const setPreventionFlag = () => {
        localStorage.setItem('creditsPreventionShown', 'true')
    }

    const value = {
        balance: creditBalance,
        loading,
        updateBalance,
        addCredits,
        deductCredits,
        hasEnoughCredits,
        refreshCredits,
        getPreventionFlag,
        setPreventionFlag,
    }

    return (
        <CreditsContext.Provider value={value}>
            {children}
        </CreditsContext.Provider>
    )
}

export function useCredits() {
    const context = useContext(CreditsContext)
    if (!context) {
        throw new Error('useCredits must be used within CreditsProvider')
    }
    return context
}
