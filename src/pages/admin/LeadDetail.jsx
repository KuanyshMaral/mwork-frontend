import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/client'
import './Admin.css'

function AdminLeadDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [lead, setLead] = useState(null)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [showApproveModal, setShowApproveModal] = useState(false)
    const [showRejectModal, setShowRejectModal] = useState(false)
    const [rejectReason, setRejectReason] = useState('')

    useEffect(() => {
        fetchLead()
    }, [id])

    const fetchLead = async () => {
        try {
            const response = await api.get(`/admin/leads/${id}`)
            setLead(response.data)
        } catch (err) {
            console.error('Failed to fetch lead:', err)
            // Mock data
            setLead({
                id: id,
                company_name: 'ТОО "МодельАгентство"',
                contact_name: 'Айгуль Каримова',
                contact_email: 'aigul@modelagency.kz',
                contact_phone: '+7 777 123 4567',
                contact_position: 'Директор',
                bin_iin: '123456789012',
                org_type: 'too',
                website: 'modelagency.kz',
                industry: 'Модельное агентство',
                employees_count: '10-50',
                use_case: 'Поиск моделей для съёмок и мероприятий',
                expected_castings_per_month: 10,
                how_found_us: 'Instagram реклама',
                status: 'new',
                priority: 3,
                created_at: new Date().toISOString(),
                history: [
                    { action: 'created', date: new Date().toISOString(), note: 'Заявка создана' }
                ]
            })
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async () => {
        setActionLoading(true)
        try {
            await api.post(`/admin/leads/${id}/approve`)
            navigate('/admin/leads?status=converted')
        } catch (err) {
            console.error('Failed to approve lead:', err)
            alert('Ошибка при одобрении заявки')
        } finally {
            setActionLoading(false)
            setShowApproveModal(false)
        }
    }

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            alert('Укажите причину отклонения')
            return
        }
        setActionLoading(true)
        try {
            await api.post(`/admin/leads/${id}/reject`, { reason: rejectReason })
            navigate('/admin/leads')
        } catch (err) {
            console.error('Failed to reject lead:', err)
            alert('Ошибка при отклонении заявки')
        } finally {
            setActionLoading(false)
            setShowRejectModal(false)
        }
    }

    if (loading) {
        return <div className="admin-page-loading">Загрузка...</div>
    }

    if (!lead) {
        return <div className="admin-empty">Заявка не найдена</div>
    }

    return (
        <div className="admin-lead-detail">
            {/* Header */}
            <div className="admin-page-header">
                <button className="admin-btn secondary" onClick={() => navigate(-1)}>
                    ← Назад
                </button>
                <h1>{lead.company_name}</h1>
            </div>

            <div className="admin-lead-detail-grid">
                {/* Main Info */}
                <div className="admin-card">
                    <h2>📊 Информация о компании</h2>
                    <div className="admin-info-grid">
                        <div className="admin-info-item">
                            <label>БИН/ИИН</label>
                            <span>{lead.bin_iin}</span>
                        </div>
                        <div className="admin-info-item">
                            <label>Тип организации</label>
                            <span>{lead.org_type?.toUpperCase() || '—'}</span>
                        </div>
                        <div className="admin-info-item">
                            <label>Сфера деятельности</label>
                            <span>{lead.industry || '—'}</span>
                        </div>
                        <div className="admin-info-item">
                            <label>Кол-во сотрудников</label>
                            <span>{lead.employees_count || '—'}</span>
                        </div>
                        <div className="admin-info-item">
                            <label>Сайт</label>
                            <span>
                                {lead.website ? (
                                    <a href={`https://${lead.website}`} target="_blank" rel="noopener noreferrer">
                                        {lead.website}
                                    </a>
                                ) : '—'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Contact */}
                <div className="admin-card">
                    <h2>👤 Контактное лицо</h2>
                    <div className="admin-info-grid">
                        <div className="admin-info-item">
                            <label>Имя</label>
                            <span>{lead.contact_name}</span>
                        </div>
                        <div className="admin-info-item">
                            <label>Должность</label>
                            <span>{lead.contact_position || '—'}</span>
                        </div>
                        <div className="admin-info-item">
                            <label>Телефон</label>
                            <a href={`tel:${lead.contact_phone}`}>{lead.contact_phone}</a>
                        </div>
                        <div className="admin-info-item">
                            <label>Email</label>
                            <a href={`mailto:${lead.contact_email}`}>{lead.contact_email}</a>
                        </div>
                    </div>
                </div>

                {/* Application */}
                <div className="admin-card full-width">
                    <h2>📝 Детали заявки</h2>
                    <div className="admin-info-grid">
                        <div className="admin-info-item full-width">
                            <label>Для чего нужна платформа</label>
                            <span>{lead.use_case || '—'}</span>
                        </div>
                        <div className="admin-info-item">
                            <label>Ожидаемо кастингов/мес</label>
                            <span>{lead.expected_castings_per_month || '—'}</span>
                        </div>
                        <div className="admin-info-item">
                            <label>Откуда узнали</label>
                            <span>{lead.how_found_us || '—'}</span>
                        </div>
                    </div>
                </div>

                {/* History */}
                <div className="admin-card full-width">
                    <h2>📜 История</h2>
                    <div className="admin-history">
                        {lead.history?.map((item, idx) => (
                            <div key={idx} className="admin-history-item">
                                <span className="admin-history-date">
                                    {new Date(item.date).toLocaleString('ru-RU')}
                                </span>
                                <span className="admin-history-note">{item.note}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Actions */}
            {lead.status === 'new' && (
                <div className="admin-actions-bar">
                    <button
                        className="admin-btn success large"
                        onClick={() => setShowApproveModal(true)}
                    >
                        ✅ Одобрить и создать аккаунт
                    </button>
                    <button
                        className="admin-btn danger large"
                        onClick={() => setShowRejectModal(true)}
                    >
                        ❌ Отклонить
                    </button>
                </div>
            )}

            {/* Approve Modal */}
            {showApproveModal && (
                <div className="admin-modal-overlay" onClick={() => setShowApproveModal(false)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <h3>Подтверждение</h3>
                        <p>Будет создан аккаунт работодателя для компании <strong>{lead.company_name}</strong></p>
                        <p>Приглашение будет отправлено на: <strong>{lead.contact_email}</strong></p>
                        <div className="admin-modal-actions">
                            <button
                                className="admin-btn secondary"
                                onClick={() => setShowApproveModal(false)}
                            >
                                Отмена
                            </button>
                            <button
                                className="admin-btn success"
                                onClick={handleApprove}
                                disabled={actionLoading}
                            >
                                {actionLoading ? 'Создание...' : 'Подтвердить'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="admin-modal-overlay" onClick={() => setShowRejectModal(false)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <h3>Причина отклонения</h3>
                        <textarea
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            placeholder="Укажите причину отклонения заявки..."
                            rows={4}
                        />
                        <div className="admin-modal-actions">
                            <button
                                className="admin-btn secondary"
                                onClick={() => setShowRejectModal(false)}
                            >
                                Отмена
                            </button>
                            <button
                                className="admin-btn danger"
                                onClick={handleReject}
                                disabled={actionLoading}
                            >
                                {actionLoading ? 'Отклонение...' : 'Отклонить'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminLeadDetail
