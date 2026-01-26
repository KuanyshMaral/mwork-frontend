import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './PaymentSuccess.css';

/**
 * PaymentSuccess - Confirms successful payment and redirects to subscriptions
 */
export default function PaymentSuccess() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [timeLeft, setTimeLeft] = useState(5);
    const paymentId = searchParams.get('payment_id');

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    navigate('/subscriptions');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate]);

    const handleGoToDashboard = () => {
        navigate('/subscriptions');
    };

    return (
        <div className="payment-success">
            <div className="payment-success__container">
                <div className="payment-success__icon">
                    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="40" cy="40" r="40" fill="#10b981"/>
                        <path d="M25 40L35 50L55 30" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                
                <h1 className="payment-success__title">
                    Оплата прошла успешно!
                </h1>
                
                <p className="payment-success__subtitle">
                    Ваша подписка активирована.
                </p>
                
                {paymentId && (
                    <p className="payment-success__payment-id">
                        ID платежа: {paymentId}
                    </p>
                )}
                
                <button 
                    className="payment-success__button"
                    onClick={handleGoToDashboard}
                >
                    Перейти в личный кабинет
                </button>
                
                <p className="payment-success__auto-redirect">
                    Автоматический переход через {timeLeft} секунд
                </p>
            </div>
        </div>
    );
}
