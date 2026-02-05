import React from 'react'
import { useCredits } from '../../context/CreditsContext'
import './CreditsModals.css'

export default function ApplyCreditConfirmModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    castingTitle,
    creditCost = 1 
}) {
    const { balance } = useCredits()

    if (!isOpen) return null

    const handleConfirm = () => {
        onConfirm()
        onClose()
    }

    const newBalance = balance - creditCost

    return (
        <div className="credits-modal-overlay" onClick={onClose}>
            <div className="credits-modal" onClick={e => e.stopPropagation()}>
                <div className="credits-modal-header">
                    <h2 className="credits-modal-title">Подтверждение отклика</h2>
                </div>

                <div className="credits-modal-body">
                    <p>
                        Вы собираетесь откликнуться на кастинг:
                    </p>
                    
                    <div style={{ 
                        background: '#f3f4f6', 
                        padding: '12px', 
                        borderRadius: '8px', 
                        margin: '12px 0',
                        fontWeight: '500'
                    }}>
                        {castingTitle}
                    </div>

                    <div className="confirmation-info">
                        <div className="confirmation-info-row">
                            <span className="confirmation-info-label">Стоимость отклика:</span>
                            <span className="confirmation-info-value">{creditCost} кредит</span>
                        </div>
                        <div className="confirmation-info-row">
                            <span className="confirmation-info-label">Текущий баланс:</span>
                            <span className="confirmation-info-value">{balance} кредитов</span>
                        </div>
                        <div className="confirmation-info-row">
                            <span className="confirmation-info-label">Баланс после отклика:</span>
                            <span className="confirmation-info-value">{newBalance} кредитов</span>
                        </div>
                    </div>

                    <p style={{ 
                        fontSize: '0.875rem', 
                        color: '#6b7280',
                        lineHeight: '1.4'
                    }}>
                        После подтверждения с вашего баланса будет списано {creditCost} кредит. 
                        Отменить отклик после отправки будет невозможно.
                    </p>
                </div>

                <div className="credits-modal-footer">
                    <button 
                        className="btn btn-secondary" 
                        onClick={onClose}
                    >
                        Отмена
                    </button>
                    <button 
                        className="btn btn-primary" 
                        onClick={handleConfirm}
                    >
                        Подтвердить отклик
                    </button>
                </div>
            </div>
        </div>
    )
}
