import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../../api/client'
import './Admin.css'

const STATUS_LABELS = {
    new: { label: 'Новая', class: 'new' },
    contacted: { label: 'В работе', class: 'contacted' },
    qualified: { label: 'Квалиф.', class: 'qualified' },
    converted: { label: 'Конверт.', class: 'converted' },
    rejected: { label: 'Отклонена', class: 'rejected' },
    lost: { label: 'Потеряна', class: 'lost' }
}

function AdminLeads() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [leads, setLeads] = useState([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ new: 0, contacted: 0, converted: 0, total: 0 })

    const statusFilter = searchParams.get('status') || 'all'

    useEffect(() => {
        fetchLeads()
    }, [statusFilter])

    const fetchLeads = async () => {
        setLoading(true)
        try {
            const params = statusFilter !== 'all' ? { status: statusFilter } : {}
            const response = await api.get('/admin/leads', { params })
            setLeads(response.data?.leads || [])
            setStats(response.data?.stats || { new: 0, contacted: 0, converted: 0, total: 0 })
        } catch (err) {
            console.error('Failed to fetch leads:', err)
            // Mock data
            setLeads([
                {
                    id: '1',
                    company_name: 'ТОО "МодельАгентство"',
                    contact_name: 'Айгуль Каримова',
                    contact_email: 'aigul@modelagency.kz',
                    contact_phone: '+7 777 123 4567',
                    bin_iin: '123456789012',
                    status: 'new',
                    priority: 3,
                    created_at: new Date().toISOString()
                },
                {
                    id: '2',
                    company_name: 'АО "КазМодель"',
                    contact_name: 'Тимур Сериков',
                    contact_email: 'timur@kazmodel.kz',
                    contact_phone: '+7 701 987 6543',
                    bin_iin: '987654321098',
                    status: 'contacted',
                    priority: 2,
                    created_at: new Date(Date.now() - 86400000).toISOString()
                }
            ])
            setStats({ new: 5, contacted: 3, converted: 12, total: 20 })
        } finally {
            setLoading(false)
        }
    }

    const handleStatusFilter = (status) => {
        if (status === 'all') {
            searchParams.delete('status')
        } else {
            searchParams.set('status', status)
        }
        setSearchParams(searchParams)
    }

    const formatDate = (dateStr) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diff = now - date

        if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч назад`
        return date.toLocaleDateString('ru-RU')
    }

    return (
        <div className="admin-leads">
            <div className="admin-page-header">
                <div>
                    <h1>Заявки от компаний</h1>
                    <p className="admin-subtitle">Управление лидами B2B</p>
                </div>
            </div>

            {/* Status Tabs */}
            <div className="admin-tabs">
                <button
                    className={`admin-tab ${statusFilter === 'all' ? 'active' : ''}`}
                    onClick={() => handleStatusFilter('all')}
                >
                    Все ({stats.total})
                </button>
                <button
                    className={`admin-tab ${statusFilter === 'new' ? 'active' : ''}`}
                    onClick={() => handleStatusFilter('new')}
                >
                    🔴 Новые ({stats.new})
                </button>
                <button
                    className={`admin-tab ${statusFilter === 'contacted' ? 'active' : ''}`}
                    onClick={() => handleStatusFilter('contacted')}
                >
                    🟡 В работе ({stats.contacted})
                </button>
                <button
                    className={`admin-tab ${statusFilter === 'converted' ? 'active' : ''}`}
                    onClick={() => handleStatusFilter('converted')}
                >
                    ✅ Конвертированы ({stats.converted})
                </button>
            </div>

            {/* Leads List */}
            {loading ? (
                <div className="admin-page-loading">Загрузка...</div>
            ) : leads.length === 0 ? (
                <div className="admin-empty">
                    <p>Нет заявок</p>
                </div>
            ) : (
                <div className="admin-leads-list">
                    {leads.map(lead => (
                        <div key={lead.id} className="admin-lead-card">
                            <div className="admin-lead-header">
                                <div className="admin-lead-company">
                                    <h3>🏢 {lead.company_name}</h3>
                                    <span className="admin-lead-bin">БИН: {lead.bin_iin}</span>
                                </div>
                                <div className="admin-lead-meta">
                                    <span className={`admin-status-badge ${STATUS_LABELS[lead.status]?.class}`}>
                                        {STATUS_LABELS[lead.status]?.label}
                                    </span>
                                    <span className="admin-lead-priority">
                                        {'⭐'.repeat(lead.priority || 1)}
                                    </span>
                                </div>
                            </div>

                            <div className="admin-lead-contact">
                                <span>👤 {lead.contact_name}</span>
                                <span>📧 {lead.contact_email}</span>
                                <span>📞 {lead.contact_phone}</span>
                            </div>

                            <div className="admin-lead-footer">
                                <span className="admin-lead-date">{formatDate(lead.created_at)}</span>
                                <div className="admin-lead-actions">
                                    <Link to={`/admin/leads/${lead.id}`} className="admin-btn secondary">
                                        👁️ Просмотр
                                    </Link>
                                    {lead.status === 'new' && (
                                        <>
                                            <button className="admin-btn success">✅ Одобрить</button>
                                            <button className="admin-btn danger">❌ Отклонить</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default AdminLeads
