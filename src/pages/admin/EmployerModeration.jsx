import React, { useState, useEffect } from 'react'
import { adminApi } from '../../api/client'
import './EmployerModeration.css'

export default function EmployerModeration() {
    const [employers, setEmployers] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedEmployer, setSelectedEmployer] = useState(null)
    const [processingId, setProcessingId] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [statusFilter, setStatusFilter] = useState('all')
    const [rejectionReason, setRejectionReason] = useState('')
    const [showRejectModal, setShowRejectModal] = useState(false)

    useEffect(() => {
        fetchEmployers()
    }, [statusFilter, currentPage])

    const fetchEmployers = async (page = 1, status = statusFilter) => {
        try {
            setLoading(true)
            
            // Используем существующий users API для получения работодателей
            const data = await adminApi.listUsers({ 
                page, 
                limit: 20, 
                role: 'employer'
            })
            
            const filteredEmployers = (data.users || []).filter(employer => {
                if (status === 'all') return true
                return employer.user_verification_status === status
            })
            
            console.log('All employers:', data.users)
            console.log('Filtered employers:', filteredEmployers)
            console.log('Current status filter:', status)
            
            if (page === 1) {
                setEmployers(filteredEmployers)
            } else {
                setEmployers(prev => [...prev, ...filteredEmployers])
            }
            
            setHasMore((data.users || []).length === 20)
        } catch (error) {
            console.error('Failed to fetch employers:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (employerId) => {
        if (!confirm('Вы уверены, что хотите одобрить этого работодателя?')) return
        
        try {
            setProcessingId(employerId)
            
            // Используем метод updateUserStatus для установки статуса verified
            await adminApi.updateUserStatus(employerId, 'verified')
            
            // Обновляем список работодателей
            await fetchEmployers(1, statusFilter)
            alert('Работодатель успешно одобрен!')
        } catch (error) {
            console.error('Failed to approve employer:', error)
            alert('Ошибка при одобрении: ' + (error.message || 'Unknown error'))
        } finally {
            setProcessingId(null)
        }
    }

    const handleReject = async (employerId) => {
        if (!rejectionReason.trim()) {
            alert('Пожалуйста, укажите причину отклонения')
            return
        }
        
        try {
            setProcessingId(employerId)
            
            // Используем метод updateUserStatus с причиной отклонения
            await adminApi.updateUserStatus(employerId, 'rejected', rejectionReason)
            
            // Обновляем список работодателей
            await fetchEmployers(1, statusFilter)
            setShowRejectModal(false)
            setRejectionReason('')
            setSelectedEmployer(null)
            alert('Работодатель отклонен!')
        } catch (error) {
            console.error('Failed to reject employer:', error)
            alert('Ошибка при отклонении: ' + (error.message || 'Unknown error'))
        } finally {
            setProcessingId(null)
        }
    }

    const openRejectModal = (employer) => {
        setSelectedEmployer(employer)
        setShowRejectModal(true)
    }

    const closeRejectModal = () => {
        setShowRejectModal(false)
        setSelectedEmployer(null)
        setRejectionReason('')
    }

    const loadMore = () => {
        if (!loading && hasMore) {
            setCurrentPage(prev => prev + 1)
        }
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            none: { label: 'Не верифицирован', class: 'pending' },
            pending: { label: 'На модерации', class: 'pending' },
            in_review: { label: 'На рассмотрении', class: 'pending' },
            verified: { label: 'Одобрен', class: 'approved' },
            rejected: { label: 'Отклонен', class: 'rejected' }
        }
        
        const config = statusConfig[status] || statusConfig.none
        return <span className={`status-badge ${config.class}`}>{config.label}</span>
    }

    if (loading && employers.length === 0) {
        return (
            <div className="employer-moderation">
                <div className="moderation-header">
                    <h1>Модерация работодателей</h1>
                </div>
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Загрузка...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="employer-moderation">
            <div className="moderation-header">
                <h1>Модерация работодателей</h1>
                
                <div className="moderation-filters">
                    <select 
                        value={statusFilter} 
                        onChange={(e) => {
                            setStatusFilter(e.target.value)
                            setCurrentPage(1)
                            setEmployers([])
                        }}
                        className="status-filter"
                    >
                        <option value="all">Все работодатели</option>
                        <option value="none">Не верифицированы</option>
                        <option value="pending">На модерации</option>
                        <option value="in_review">На рассмотрении</option>
                        <option value="verified">Одобренные</option>
                        <option value="rejected">Отклоненные</option>
                    </select>
                </div>
            </div>

            <div className="employers-list">
                {employers.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📋</div>
                        <h3>Нет заявок</h3>
                        <p>
                            {statusFilter === 'pending' && 'Нет заявок на модерации'}
                            {statusFilter === 'approved' && 'Нет одобренных работодателей'}
                            {statusFilter === 'rejected' && 'Нет отклоненных работодателей'}
                            {statusFilter === 'all' && 'Нет работодателей'}
                        </p>
                    </div>
                ) : (
                    employers.map(employer => (
                        <div key={employer.id} className="employer-card">
                            <div className="employer-header">
                                <div className="employer-info">
                                    <h3>{employer.email}</h3>
                                    <div className="employer-meta">
                                        <span className="email">ID: {employer.id}</span>
                                        {getStatusBadge(employer.user_verification_status || 'none')}
                                    </div>
                                    <div className="debug-info">
                                        <small>Статус: {employer.user_verification_status || 'none'}</small>
                                    </div>
                                </div>
                                <div className="employer-date">
                                    Создан: {new Date(employer.created_at).toLocaleDateString('ru-RU')}
                                </div>
                            </div>

                            <div className="employer-details">
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <label>� Email:</label>
                                        <span>{employer.email}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>👤 Роль:</label>
                                        <span>{employer.role}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>✉️ Email верифицирован:</label>
                                        <span>{employer.email_verified ? 'Да' : 'Нет'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>� Статус верификации:</label>
                                        <span>{employer.user_verification_status || 'none'}</span>
                                    </div>
                                </div>

                                {employer.verification_notes && (
                                    <div className="description-section">
                                        <label>📝 Заметки верификации:</label>
                                        <p>{employer.verification_notes}</p>
                                    </div>
                                )}

                                {employer.verification_rejection_reason && (
                                    <div className="rejection-reason">
                                        <label>❌ Причина отклонения:</label>
                                        <p>{employer.verification_rejection_reason}</p>
                                    </div>
                                )}
                            </div>

                            {(employer.user_verification_status !== 'verified') && (
                                <div className="employer-actions">
                                    <button
                                        onClick={() => handleApprove(employer.id)}
                                        disabled={processingId === employer.id}
                                        className="approve-btn"
                                    >
                                        {processingId === employer.id ? 'Обработка...' : '✓ Одобрить'}
                                    </button>
                                    <button
                                        onClick={() => openRejectModal(employer)}
                                        disabled={processingId === employer.id}
                                        className="reject-btn"
                                    >
                                        {processingId === employer.id ? 'Обработка...' : '✕ Отклонить'}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {hasMore && (
                <div className="load-more">
                    <button 
                        onClick={loadMore} 
                        disabled={loading}
                        className="load-more-btn"
                    >
                        {loading ? 'Загрузка...' : 'Загрузить еще'}
                    </button>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Отклонить работодателя</h3>
                            <button onClick={closeRejectModal} className="close-btn">×</button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="employer-summary">
                                <h4>{selectedEmployer?.company_name}</h4>
                                <p>{selectedEmployer?.email}</p>
                            </div>
                            
                            <div className="form-group">
                                <label>Причина отклонения *</label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Укажите причину отклонения заявки..."
                                    rows={4}
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="modal-actions">
                            <button 
                                onClick={() => handleReject(selectedEmployer.id)}
                                disabled={processingId === selectedEmployer?.id || !rejectionReason.trim()}
                                className="confirm-reject-btn"
                            >
                                {processingId === selectedEmployer?.id ? 'Обработка...' : 'Отклонить'}
                            </button>
                            <button 
                                onClick={closeRejectModal}
                                className="cancel-btn"
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
