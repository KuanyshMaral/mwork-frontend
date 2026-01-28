import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { subscriptionApi } from '../api/client';
import PaymentRedirect from '../components/payment/PaymentRedirect';
import './Checkout.css';

/**
 * Checkout - Subscription purchase page with Kaspi payment
 */
export default function Checkout() {
    const [searchParams] = useSearchParams();
    const [plan, setPlan] = useState(null);
    const [billingPeriod, setBillingPeriod] = useState('monthly');
    const [loading, setLoading] = useState(true);
    const [paymentUrl, setPaymentUrl] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    
    useEffect(() => {
        const planId = searchParams.get('plan');
        if (!planId) {
            setError('План подписки не указан');
            setLoading(false);
            return;
        }
        
        const fetchPlan = async () => {
            try {
                const planData = await subscriptionApi.getPlanById(planId);
                setPlan(planData);
            } catch (err) {
                // Mock data for testing
                setPlan({
                    id: planId,
                    name: 'PRO План',
                    monthly_price: 4990,
                    features: [
                        '50 фотографий',
                        'Безлимит откликов',
                        '10 активных кастингов'
                    ]
                });
                setError(null);
            } finally {
                setLoading(false);
            }
        };
        
        fetchPlan();
    }, [searchParams]);
    
    const calculatePrice = () => {
        if (!plan) return 0;
        return billingPeriod === 'yearly' 
            ? plan.monthly_price * 12 * 0.85 
            : plan.monthly_price;
    };
    
    const handlePayment = async () => {
        if (!plan) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await subscriptionApi.subscribe(plan.id, billingPeriod);
            setPaymentUrl(response.payment_url);
        } catch (err) {
            setError(err.message || 'Произошла ошибка при оформлении подписки');
            setLoading(false);
        }
    };
    
    if (paymentUrl) {
        return <PaymentRedirect paymentUrl={paymentUrl} amount={calculatePrice()} />;
    }
    
    if (error && !plan) {
        return (
            <div className="checkout">
                <div className="checkout__error">
                    {error}
                </div>
            </div>
        );
    }
    
    if (!plan) {
        return (
            <div className="checkout">
                <div className="checkout__loading">
                    <div className="checkout__spinner" />
                    <div>Загрузка...</div>
                </div>
            </div>
        );
    }
    
    const price = calculatePrice();
    const yearlyPrice = plan.monthly_price * 12 * 0.85;
    const discount = Math.round((1 - 0.85) * 100);
    
    return (
        <div className="checkout">
            <h1 className="checkout__title">Оформление подписки</h1>
            
            <div className="checkout__plan-card">
                <div className="checkout__plan-name">{plan.name}</div>
                <div className="checkout__price">
                    ₸ {price.toLocaleString('ru-KZ')} / {billingPeriod === 'yearly' ? 'год' : 'месяц'}
                </div>
                
                {plan.features && plan.features.map((feature, index) => (
                    <div key={index} className="checkout__feature">
                        <span className="checkout__checkmark">✓</span>
                        {feature}
                    </div>
                ))}
            </div>
            
            <div className="checkout__billing-period">
                <div className="checkout__billing-label">Период оплаты:</div>
                
                <label className="checkout__radio-label">
                    <input
                        type="radio"
                        name="billing"
                        value="monthly"
                        checked={billingPeriod === 'monthly'}
                        onChange={(e) => setBillingPeriod(e.target.value)}
                        className="checkout__radio"
                    />
                    <span className="checkout__radio-custom"></span>
                    <span className="checkout__radio-text">
                        Ежемесячно (₸ {plan.monthly_price.toLocaleString('ru-KZ')})
                    </span>
                </label>
                
                <label className="checkout__radio-label">
                    <input
                        type="radio"
                        name="billing"
                        value="yearly"
                        checked={billingPeriod === 'yearly'}
                        onChange={(e) => setBillingPeriod(e.target.value)}
                        className="checkout__radio"
                    />
                    <span className="checkout__radio-custom"></span>
                    <span className="checkout__radio-text">
                        Ежегодно (₸ {yearlyPrice.toLocaleString('ru-KZ')}) -{discount}%
                    </span>
                </label>
            </div>
            
            {error && (
                <div className="checkout__error">
                    {error}
                </div>
            )}
            
            <button
                onClick={handlePayment}
                disabled={loading}
                className="checkout__pay-button"
            >
                {loading ? (
                    <>
                        <div className="checkout__button-spinner" />
                        Обработка...
                    </>
                ) : (
                    'Оплатить через Kaspi →'
                )}
            </button>
        </div>
    );
}
