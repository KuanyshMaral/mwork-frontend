import { createContext, useContext, useState, useEffect } from 'react'

const CreditsContext = createContext(null)

export function CreditsProvider({ children }) {
    const [balance, setBalance] = useState(0)
    const [loading, setLoading] = useState(true)

    // Load credits from localStorage on mount
    useEffect(() => {
        const savedBalance = localStorage.getItem('userCredits')
        if (savedBalance !== null) {
            setBalance(parseInt(savedBalance, 10))
        } else {
            // Set initial balance for testing
            const initialBalance = 3
            setBalance(initialBalance)
            localStorage.setItem('userCredits', initialBalance.toString())
        }
        setLoading(false)
    }, [])

    // Update balance and save to localStorage
    const updateBalance = (newBalance) => {
        const balanceNum = parseInt(newBalance, 10)
        setBalance(balanceNum)
        localStorage.setItem('userCredits', balanceNum.toString())
    }

    // Add credits
    const addCredits = (amount) => {
        updateBalance(balance + amount)
    }

    // Deduct credits
    const deductCredits = (amount) => {
        updateBalance(Math.max(0, balance - amount))
    }

    // Check if user has enough credits
    const hasEnoughCredits = (required) => {
        return balance >= required
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
        balance,
        loading,
        updateBalance,
        addCredits,
        deductCredits,
        hasEnoughCredits,
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
