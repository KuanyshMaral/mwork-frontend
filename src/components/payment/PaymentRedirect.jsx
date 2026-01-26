import React, { useEffect } from 'react';
import './PaymentRedirect.css';

/**
 * PaymentRedirect - Shows loading state and redirects to Kaspi payment
 * @param {Object} props
 * @param {string} props.paymentUrl - Kaspi payment URL
 * @param {number} props.amount - Payment amount for display
 */
export default function PaymentRedirect({ paymentUrl, amount }) {
    useEffect(() => {
        const redirectTimer = setTimeout(() => {
            window.location.href = paymentUrl;
        }, 2000);

        return () => clearTimeout(redirectTimer);
    }, [paymentUrl]);

    const formatAmount = (amount) => {
        if (!amount || amount === 0) return '—';
        return `₸ ${amount.toLocaleString('ru-KZ')}`;
    };

    return (
        <div className="payment-redirect">
            <div className="payment-redirect__spinner" />
            <div className="payment-redirect__text">
                Перенаправление на оплату...
            </div>
            <div className="payment-redirect__amount">
                Сумма: {formatAmount(amount)}
            </div>
            <div className="payment-redirect__helper">
                Автоматический переход через 2с
            </div>
        </div>
    );
}
