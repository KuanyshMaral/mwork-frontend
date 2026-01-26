import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './PaymentFailed.css';

/**
 * PaymentFailed - Shows payment error and retry option
 */
export default function PaymentFailed() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const error = searchParams.get('error');

    const handleRetry = () => {
        navigate('/subscriptions');
    };

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <div className="payment-failed">
            <div className="payment-failed__container">
                <div className="payment-failed__icon">
                    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="40" cy="40" r="40" fill="#ef4444"/>
                        <path d="M30 30L50 50M50 30L30 50" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                
                <h1 className="payment-failed__title">
                    Ошибка оплаты
                </h1>
                
                <p className="payment-failed__subtitle">
                    Платеж не был завершен.
                    <br />
                    Пожалуйста, попробуйте еще раз.
                </p>
                
                {error && (
                    <p className="payment-failed__error">
                        Причина: {error}
                    </p>
                )}
                
                <button 
                    className="payment-failed__button payment-failed__button--primary"
                    onClick={handleRetry}
                >
                    Попробовать снова
                </button>
                
                <button 
                    className="payment-failed__button payment-failed__button--secondary"
                    onClick={handleGoHome}
                >
                    Вернуться на главную
                </button>
            </div>
        </div>
    );
}
