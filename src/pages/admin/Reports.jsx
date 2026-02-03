import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/client';
import './Reports.css';

/**
 * AdminReports - List of user reports with moderation actions
 */
export default function AdminReports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const [resolvingId, setResolvingId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [statusFilter, setStatusFilter] = useState('pending');

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async (page = 1, status = statusFilter) => {
        try {
            setLoading(true);
            const data = await adminApi.listReports({ page, status });
            
            if (page === 1) {
                setReports(data.reports || []);
            } else {
                setReports(prev => [...prev, ...(data.reports || [])]);
            }
            
            setHasMore(data.reports && data.reports.length > 0);
            setCurrentPage(page);
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleResolveReport = async (reportId, action) => {
        if (action === 'suspend') {
            const confirmed = window.confirm('Вы уверены, что хотите заблокировать пользователя?');
            if (!confirmed) return;
        }

        try {
            setResolvingId(reportId);
            await adminApi.updateReportStatus(reportId, { 
                status: action === 'dismiss' ? 'dismissed' : 
                       action === 'warn' ? 'warned' : 
                       action === 'suspend' ? 'suspended' : 'resolved'
            });
            
            setReports(prev => prev.filter(report => report.id !== reportId));
            
            const actionMessages = {
                warn: 'Пользователю отправлено предупреждение',
                suspend: 'Пользователь заблокирован',
                dismiss: 'Жалоба отклонена'
            };
            
            showToast(actionMessages[action] || 'Действие выполнено');
        } catch (error) {
            console.error('Failed to resolve report:', error);
            showToast('Ошибка при выполнении действия', 'error');
        } finally {
            setResolvingId(null);
        }
    };

    const showToast = (message, type = 'success') => {
        // Simple toast implementation - in real app would use proper toast library
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'error' ? '#ef4444' : '#10b981'};
            color: white;
            border-radius: 6px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 3000);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderSkeleton = () => (
        <div className="report-card skeleton">
            <div className="skeleton-header">
                <div className="skeleton-icon"></div>
                <div className="skeleton-title"></div>
            </div>
            <div className="skeleton-details"></div>
            <div className="skeleton-timestamp"></div>
            <div className="skeleton-actions"></div>
        </div>
    );

    if (loading && reports.length === 0) {
        return (
            <div className="admin-reports">
                <h1 className="page-heading">Жалобы и репорты</h1>
                <div className="filters">
                    <select className="filter-select">
                        <option>Все</option>
                    </select>
                    <button className="filter-button">Фильтр по статусу</button>
                </div>
                {[1, 2, 3].map(i => renderSkeleton())}
            </div>
        );
    }

    return (
        <div className="admin-reports">
            <h1 className="page-heading">Жалобы и репорты</h1>
            
            <div className="filters">
                <select 
                    className="filter-select"
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value);
                        fetchReports(1, e.target.value);
                    }}
                >
                    <option value="pending">Ожидающие</option>
                    <option value="resolved">Решенные</option>
                    <option value="all">Все</option>
                </select>
                <button className="filter-button">Фильтр по статусу</button>
            </div>

            {reports.length === 0 && !loading ? (
                <div className="empty-state">
                    <p>Нет жалоб</p>
                </div>
            ) : (
                <>
                    {reports.map(report => (
                        <div key={report.id} className="report-card">
                            <div className="report-header">
                                <span className="report-icon">⚠️</span>
                                <h3 className="report-title">{report.reason}</h3>
                            </div>
                            
                            <div className="report-details">
                                <p>
                                    От: {report.reporter_email || `user_${report.reporter_id}`} → @{report.reported_username || `user_${report.reported_user_id}`}
                                </p>
                                {report.description && (
                                    <p className="report-description">Причина: "{report.description}"</p>
                                )}
                            </div>
                            
                            <div className="report-timestamp">
                                {formatDate(report.created_at)}
                            </div>
                            
                            <div className="report-actions">
                                <button
                                    className="action-button warn"
                                    onClick={() => handleResolveReport(report.id, 'warn')}
                                    disabled={resolvingId === report.id}
                                >
                                    {resolvingId === report.id ? 'Загрузка...' : 'Предупредить'}
                                </button>
                                <button
                                    className="action-button suspend"
                                    onClick={() => handleResolveReport(report.id, 'suspend')}
                                    disabled={resolvingId === report.id}
                                >
                                    {resolvingId === report.id ? 'Загрузка...' : 'Заблокировать'}
                                </button>
                                <button
                                    className="action-button dismiss"
                                    onClick={() => handleResolveReport(report.id, 'dismiss')}
                                    disabled={resolvingId === report.id}
                                >
                                    {resolvingId === report.id ? 'Загрузка...' : 'Отклонить'}
                                </button>
                            </div>
                        </div>
                    ))}
                    
                    {hasMore && (
                        <button 
                            className="load-more"
                            onClick={() => fetchReports(currentPage + 1)}
                            disabled={loading}
                        >
                            {loading ? 'Загрузка...' : 'Загрузить еще'}
                        </button>
                    )}
                </>
            )}
        </div>
    );
}
