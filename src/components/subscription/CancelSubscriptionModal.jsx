import { useState } from 'react'
import './CancelSubscriptionModal.css'

export default function CancelSubscriptionModal({ onClose, onConfirm, loading }) {
    const [selectedReason, setSelectedReason] = useState('')
    const [customReason, setCustomReason] = useState('')
    const [step, setStep] = useState(1) // 1: reason, 2: confirmation

    const reasons = [
        'Слишком дорого',
        'Не использую все функции',
        'Временные финансовые трудности',
        'Нашел(а) альтернативу',
        'Технические проблемы',
        'Другое'
    ]

    function handleSubmit() {
        if (step === 1) {
            if (!selectedReason) return
            if (selectedReason === 'Другое' && !customReason.trim()) return
            setStep(2)
        } else {
            const reason = selectedReason === 'Другое' ? customReason : selectedReason
            onConfirm(reason)
        }
    }

    function getFinalReason() {
        return selectedReason === 'Другое' ? customReason : selectedReason
    }

    return (
        <div className="modal-overlay">
            <div className="cancel-subscription-modal">
                <div className="modal-header">
                    <h3>Отмена подписки</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {step === 1 ? (
                        <>
                            <div className="cancel-warning">
                                <div className="warning-icon">⚠️</div>
                                <p>Вы уверены, что хотите отменить подписку?</p>
                                <small>
                                    После отмены вы сможете пользоваться преимуществами до конца оплаченного периода,
                                    затем аккаунт перейдет на бесплатный тариф.
                                </small>
                            </div>

                            <div className="reason-section">
                                <h4>Почему вы отменяете подписку?</h4>
                                <div className="reason-options">
                                    {reasons.map(reason => (
                                        <label key={reason} className="reason-option">
                                            <input
                                                type="radio"
                                                name="reason"
                                                value={reason}
                                                checked={selectedReason === reason}
                                                onChange={(e) => setSelectedReason(e.target.value)}
                                            />
                                            <span className="reason-text">{reason}</span>
                                        </label>
                                    ))}
                                </div>

                                {selectedReason === 'Другое' && (
                                    <div className="custom-reason">
                                        <textarea
                                            placeholder="Опишите причину отмены..."
                                            value={customReason}
                                            onChange={(e) => setCustomReason(e.target.value)}
                                            rows={3}
                                        />
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="confirmation-section">
                            <div className="confirmation-warning">
                                <div className="warning-icon">🚨</div>
                                <h4>Подтвердите отмену подписки</h4>
                                <p>Причина: <strong>{getFinalReason()}</strong></p>
                                <ul>
                                    <li>Доступ к платным функциям прекратится в конце текущего периода</li>
                                    <li>Данные вашего профиля сохранятся</li>
                                    <li>Вы сможете возобновить подписку в любой момент</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button 
                        className="btn btn-secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        {step === 1 ? 'Отмена' : 'Назад'}
                    </button>
                    
                    <button
                        className="btn btn-danger"
                        onClick={handleSubmit}
                        disabled={loading || (step === 1 && (!selectedReason || (selectedReason === 'Другое' && !customReason.trim())))}
                    >
                        {loading ? 'Отмена...' : step === 1 ? 'Далее' : 'Отменить подписку'}
                    </button>
                </div>
            </div>
        </div>
    )
}
