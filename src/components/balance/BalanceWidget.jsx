import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { formatBalance, isLowBalance, getLowBalanceWarning } from '../../utils/balanceFormatter.js'
import './BalanceWidget.css'

export default function BalanceWidget() {
    const { creditBalance } = useAuth()
    const navigate = useNavigate()
    
    const isLow = isLowBalance(creditBalance)
    
    const handleClick = () => {
        // Navigate to transaction history page
        navigate('/credits/transactions')
    }
    
    return (
        <div 
            className={`balance-widget ${isLow ? 'balance-low' : ''}`}
            onClick={handleClick}
            title={isLow ? getLowBalanceWarning() : 'Перейти к истории транзакций'}
        >
            <div className="balance-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v12M8 10h8"/>
                </svg>
            </div>
            <div className="balance-amount">
                <span className="balance-value">{formatBalance(creditBalance)}</span>
                {isLow && (
                    <div className="balance-warning">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                            <line x1="12" y1="9" x2="12" y2="13"/>
                            <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                    </div>
                )}
            </div>
        </div>
    )
}
