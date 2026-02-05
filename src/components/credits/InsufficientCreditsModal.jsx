import React, { useState } from 'react'
import { useCredits } from '../../context/CreditsContext'
import './CreditsModals.css'

export default function InsufficientCreditsModal({ 
    isOpen, 
    onClose, 
    creditCost = 1,
    onPurchase 
}) {
    const { balance } = useCredits()
    const [selectedPackage, setSelectedPackage] = useState(null)

    if (!isOpen) return null

    // Credit packages with pricing
    const creditPackages = [
        { 
            id: 5, 
            credits: 5, 
            price: 990, 
            bonus: null,
            recommended: creditCost <= 5 
        },
        { 
            id: 10, 
            credits: 10, 
            price: 1790, 
            bonus: '+1 бонус',
            recommended: creditCost > 5 && creditCost <= 10 
        },
        { 
            id: 25, 
            credits: 25, 
            price: 3990, 
            bonus: '+3 бонус',
            recommended: creditCost > 10 && creditCost <= 25 
        },
        { 
            id: 50, 
            credits: 50, 
            price: 6990, 
            bonus: '+8 бонус',
            recommended: creditCost > 25 
        }
    ]

    const handlePurchase = () => {
        if (selectedPackage && onPurchase) {
            onPurchase(selectedPackage)
        }
        onClose()
    }

    const creditsNeeded = Math.max(0, creditCost - balance)

    return (
        <div className="credits-modal-overlay" onClick={onClose}>
            <div className="credits-modal" onClick={e => e.stopPropagation()}>
                <div className="insufficient-header">
                    <div className="insufficient-icon">💰</div>
                    <h2 className="insufficient-title">Недостаточно кредитов</h2>
                    <p className="insufficient-description">
                        Для отклика на этот кастинг требуется больше кредитов, чем у вас есть на балансе
                    </p>
                </div>

                <div className="credits-modal-body">
                    <div className="balance-info">
                        <div className="balance-current">{balance} кредитов</div>
                        <div className="balance-needed">
                            Нужно еще: {creditsNeeded} кредит{creditsNeeded > 1 ? 'ов' : ''}
                        </div>
                    </div>

                    <div className="credit-packages">
                        <h3 className="packages-title">Выберите пакет кредитов</h3>
                        <div className="package-grid">
                            {creditPackages.map(pkg => (
                                <div
                                    key={pkg.id}
                                    className={`package-card ${selectedPackage?.id === pkg.id ? 'selected' : ''} ${pkg.recommended ? 'recommended' : ''}`}
                                    onClick={() => setSelectedPackage(pkg)}
                                >
                                    {pkg.recommended && (
                                        <div className="recommended-badge">Рекомендуем</div>
                                    )}
                                    <div className="package-header">
                                        <span className="package-credits">{pkg.credits} кредитов</span>
                                        <span className="package-price">₸{pkg.price.toLocaleString()}</span>
                                    </div>
                                    {pkg.bonus && (
                                        <div className="package-bonus">{pkg.bonus}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="credits-modal-footer">
                    <button 
                        className="btn btn-secondary" 
                        onClick={onClose}
                    >
                        Отмена
                    </button>
                    <button 
                        className={`btn ${selectedPackage ? 'btn-success' : 'btn-primary'}`}
                        onClick={handlePurchase}
                        disabled={!selectedPackage}
                    >
                        {selectedPackage ? (
                            <>Купить {selectedPackage.credits} кредитов за ₸{selectedPackage.price.toLocaleString()}</>
                        ) : (
                            'Выберите пакет'
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
