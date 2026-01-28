import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/client';
import './Dashboard.css';

/**
 * AdminDashboard - Admin overview with key metrics
 */
export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await adminApi.getStats();
                setStats(data);
            } catch (err) {
                setError(err.message || 'Не удалось загрузить статистику');
            } finally {
                setLoading(false);
            }
        };
        
        fetchStats();
        
        // Auto refresh every 60 seconds
        const interval = setInterval(fetchStats, 60000);
        return () => clearInterval(interval);
    }, []);
    
    if (loading) {
        return (
            <div className="admin-dashboard">
                <div className="admin-dashboard__title">Панель управления</div>
                <div className="admin-dashboard__grid">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="admin-dashboard__skeleton">
                            <div className="admin-dashboard__skeleton-icon"></div>
                            <div className="admin-dashboard__skeleton-number"></div>
                            <div className="admin-dashboard__skeleton-label"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="admin-dashboard">
                <div className="admin-dashboard__title">Панель управления</div>
                <div className="admin-dashboard__error">
                    {error}
                </div>
            </div>
        );
    }
    
    return (
        <div className="admin-dashboard">
            <h1 className="admin-dashboard__title">Панель управления</h1>
            
            <div className="admin-dashboard__grid">
                {/* Total Users Card */}
                <div className="admin-dashboard__card">
                    <div className="admin-dashboard__icon">👥</div>
                    <div className="admin-dashboard__number">
                        {stats?.total_users?.toLocaleString('ru-KZ') || '0'}
                    </div>
                    <div className="admin-dashboard__label">Пользователей</div>
                </div>
                
                {/* Total Castings Card */}
                <div className="admin-dashboard__card">
                    <div className="admin-dashboard__icon">🎬</div>
                    <div className="admin-dashboard__number">
                        {stats?.total_castings?.toLocaleString('ru-KZ') || '0'}
                    </div>
                    <div className="admin-dashboard__label">Кастингов</div>
                </div>
                
                {/* Active Subscriptions Card */}
                <div className="admin-dashboard__card">
                    <div className="admin-dashboard__icon">�</div>
                    <div className="admin-dashboard__number">
                        {stats?.active_subscriptions?.toLocaleString('ru-KZ') || '0'}
                    </div>
                    <div className="admin-dashboard__label">Подписок</div>
                </div>
                
                {/* Pending Reports Card */}
                <div className="admin-dashboard__card">
                    <div className="admin-dashboard__icon">⚠️</div>
                    <div className="admin-dashboard__number">
                        {stats?.pending_reports?.toLocaleString('ru-KZ') || '0'}
                    </div>
                    <div className="admin-dashboard__label">Жалоб</div>
                </div>
            </div>
        </div>
    );
}
