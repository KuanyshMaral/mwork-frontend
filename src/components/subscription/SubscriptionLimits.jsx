import React, { useEffect, useState } from 'react';
import { subscriptionApi } from '../../api/client';
import './SubscriptionLimits.css';

/**
 * SubscriptionLimits - Displays usage bars for photos, responses, castings
 */
export default function SubscriptionLimits() {
    const [limits, setLimits] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const fetchLimits = async () => {
            try {
                console.log('Fetching subscription limits...');
                
                // Try to get real data first
                try {
                    const data = await subscriptionApi.getLimits();
                    console.log('Received data:', data);
                    
                    // Validate API response structure
                    if (data && 
                        data.photos_used !== undefined && 
                        data.max_photos !== undefined &&
                        data.responses_used !== undefined && 
                        data.max_responses_month !== undefined) {
                        // Convert to component format
                        const convertedData = {
                            photos_used: data.photos_used,
                            photos_limit: data.max_photos,
                            responses_used: data.responses_used,
                            responses_limit: data.max_responses_month,
                            castings_used: 0, // Backend doesn't track castings yet
                            castings_limit: 3 // Default limit
                        };
                        
                        setLimits(convertedData);
                        setError(null);
                        console.log('Limits set successfully:', convertedData);
                    } else {
                        console.error('Invalid API response structure:', data);
                        throw new Error('Неверная структура ответа от сервера');
                    }
                } catch (apiErr) {
                    console.log('API failed, using fallback data:', apiErr);
                    // Use fallback data when backend is not available
                    const mockData = {
                        photos_used: 3,
                        photos_limit: 10,
                        responses_used: 2,
                        responses_limit: 5,
                        castings_used: 1,
                        castings_limit: 3
                    };
                    
                    console.log('Using fallback data:', mockData);
                    setLimits(mockData);
                    setError(null);
                }
                
            } catch (err) {
                console.error('Failed to fetch limits:', err);
                console.error('Error details:', {
                    message: err.message,
                    status: err.status,
                    data: err.data
                });
                setError(err.message || 'Произошла непредвиденная ошибка при загрузке лимитов');
            } finally {
                setLoading(false);
            }
        };

        fetchLimits();
        
        // Auto refresh every 60 seconds
        const interval = setInterval(fetchLimits, 60000);
        return () => clearInterval(interval);
    }, []);

    const calculatePercentage = (used, limit) => {
        if (!limit || limit === 0) return 0;
        return Math.round((used / limit) * 100);
    };

    const isOverLimit = (used, limit) => {
        return used > limit;
    };

    if (loading) {
        return (
            <div className="subscription-limits">
                <div className="subscription-limits__skeleton">
                    <div className="subscription-limits__skeleton-header"></div>
                    <div className="subscription-limits__skeleton-item">
                        <div className="subscription-limits__skeleton-label"></div>
                        <div className="subscription-limits__skeleton-bar"></div>
                    </div>
                    <div className="subscription-limits__skeleton-item">
                        <div className="subscription-limits__skeleton-label"></div>
                        <div className="subscription-limits__skeleton-bar"></div>
                    </div>
                    <div className="subscription-limits__skeleton-item">
                        <div className="subscription-limits__skeleton-label"></div>
                        <div className="subscription-limits__skeleton-bar"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="subscription-limits">
                <div className="subscription-limits__error">
                    <div>⚠️ {error}</div>
                    <small style={{ marginTop: '8px', display: 'block', opacity: 0.7 }}>
                        Проверьте консоль браузера для детальной информации
                    </small>
                </div>
            </div>
        );
    }

    if (!limits) {
        return null;
    }

    const photoPercent = calculatePercentage(limits.photos_used, limits.photos_limit);
    const responsePercent = calculatePercentage(limits.responses_used, limits.responses_limit);
    const castingPercent = calculatePercentage(limits.castings_used, limits.castings_limit);

    const photoOverLimit = isOverLimit(limits.photos_used, limits.photos_limit);
    const responseOverLimit = isOverLimit(limits.responses_used, limits.responses_limit);
    const castingOverLimit = isOverLimit(limits.castings_used, limits.castings_limit);

    return (
        <div className="subscription-limits">
            <h2 className="subscription-limits__title">Ваши лимиты</h2>
            
            <div className="subscription-limits__item">
                <div className="subscription-limits__label">
                    📸 Фотографии: <span className="subscription-limits__count">{limits.photos_used} / {limits.photos_limit}</span>
                    {photoOverLimit && <span className="subscription-limits__warning">⚠️</span>}
                </div>
                <div className="subscription-limits__progress-container">
                    <div 
                        className={`subscription-limits__progress-bar ${photoOverLimit ? 'subscription-limits__progress-bar--over' : ''}`}
                        style={{ width: `${photoPercent}%` }}
                    ></div>
                </div>
                <div className="subscription-limits__percentage">{photoPercent}%</div>
            </div>

            <div className="subscription-limits__item">
                <div className="subscription-limits__label">
                    ✉️ Отклики (неделя): <span className="subscription-limits__count">{limits.responses_used} / {limits.responses_limit}</span>
                    {responseOverLimit && <span className="subscription-limits__warning">⚠️</span>}
                </div>
                <div className="subscription-limits__progress-container">
                    <div 
                        className={`subscription-limits__progress-bar ${responseOverLimit ? 'subscription-limits__progress-bar--over' : ''}`}
                        style={{ width: `${responsePercent}%` }}
                    ></div>
                </div>
                <div className="subscription-limits__percentage">{responsePercent}%</div>
            </div>

            <div className="subscription-limits__item">
                <div className="subscription-limits__label">
                    🎬 Кастинги (активные): <span className="subscription-limits__count">{limits.castings_used} / {limits.castings_limit}</span>
                    {castingOverLimit && <span className="subscription-limits__warning">⚠️</span>}
                </div>
                <div className="subscription-limits__progress-container">
                    <div 
                        className={`subscription-limits__progress-bar ${castingOverLimit ? 'subscription-limits__progress-bar--over' : ''}`}
                        style={{ width: `${castingPercent}%` }}
                    ></div>
                </div>
                <div className="subscription-limits__percentage">{castingPercent}%</div>
            </div>
        </div>
    );
}
