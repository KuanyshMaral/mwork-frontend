import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { agencyApi } from '../../api/client'
import TeamMemberCard from '../../components/agency/TeamMemberCard'
import InviteMemberModal from '../../components/agency/InviteMemberModal'
import './Agency.css'

export default function TeamManagement() {
    const navigate = useNavigate()
    const [team, setTeam] = useState([])
    const [loading, setLoading] = useState(true)
    const [showInviteModal, setShowInviteModal] = useState(false)
    const [filter, setFilter] = useState('all')
    const [search, setSearch] = useState('')

    useEffect(() => {
        loadTeam()
    }, [])

    async function loadTeam() {
        try {
            const data = await agencyApi.getTeam()
            setTeam(data || [])
        } catch (err) {
            console.error('Failed to load team:', err)
            setTeam([
                {
                    id: '1',
                    user_id: 'u1',
                    name: 'Анна Смирнова',
                    email: 'anna@example.com',
                    avatar_url: null,
                    role: 'owner',
                    bookings_count: 15,
                    rating: 4.9,
                    joined_at: new Date(Date.now() - 86400000 * 365).toISOString()
                },
                {
                    id: '2',
                    user_id: 'u2',
                    name: 'Мария Иванова',
                    email: 'maria@example.com',
                    avatar_url: null,
                    role: 'model',
                    bookings_count: 8,
                    rating: 4.7,
                    joined_at: new Date(Date.now() - 86400000 * 90).toISOString()
                },
                {
                    id: '3',
                    user_id: 'u3',
                    name: 'Елена Петрова',
                    email: 'elena@example.com',
                    avatar_url: null,
                    role: 'manager',
                    bookings_count: 0,
                    rating: null,
                    joined_at: new Date(Date.now() - 86400000 * 30).toISOString()
                }
            ])
        } finally {
            setLoading(false)
        }
    }

    const handleInvite = async (data) => {
        await agencyApi.inviteMember(data)
        loadTeam()
    }

    const handleRemove = async (memberId) => {
        if (!confirm('Удалить участника из команды?')) return
        try {
            await agencyApi.removeMember(memberId)
            setTeam(team.filter(m => m.id !== memberId))
        } catch (err) {
            console.error('Failed to remove member:', err)
            alert('Ошибка при удалении')
        }
    }

    const handleRoleChange = async (memberId, newRole) => {
        try {
            await agencyApi.updateMemberRole(memberId, newRole)
            setTeam(team.map(m =>
                m.id === memberId ? { ...m, role: newRole } : m
            ))
        } catch (err) {
            console.error('Failed to update role:', err)
            alert('Ошибка при изменении роли')
        }
    }

    const filteredTeam = team.filter(member => {
        if (filter !== 'all' && member.role !== filter) return false
        if (search && !member.name.toLowerCase().includes(search.toLowerCase()) &&
            !member.email.toLowerCase().includes(search.toLowerCase())) return false
        return true
    })

    const stats = {
        total: team.length,
        models: team.filter(m => m.role === 'model').length,
        managers: team.filter(m => m.role === 'manager' || m.role === 'admin').length
    }

    if (loading) {
        return <div className="loading">Загрузка...</div>
    }

    return (
        <div className="team-management">
            <div className="page-header">
                <button className="back-btn" onClick={() => navigate('/agency')}>
                    ← Назад
                </button>
                <h1>Управление командой</h1>
            </div>

            <div className="team-stats">
                <div className="stat-box">
                    <span className="stat-value">{stats.total}</span>
                    <span className="stat-label">Всего участников</span>
                </div>
                <div className="stat-box">
                    <span className="stat-value">{stats.models}</span>
                    <span className="stat-label">Моделей</span>
                </div>
                <div className="stat-box">
                    <span className="stat-value">{stats.managers}</span>
                    <span className="stat-label">Менеджеров</span>
                </div>
            </div>

            <div className="team-controls">
                <div className="search-filter">
                    <input
                        type="text"
                        placeholder="Поиск по имени или email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="search-input"
                    />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">Все роли</option>
                        <option value="model">Модели</option>
                        <option value="manager">Менеджеры</option>
                        <option value="admin">Администраторы</option>
                    </select>
                </div>
                <button
                    className="invite-btn"
                    onClick={() => setShowInviteModal(true)}
                >
                    + Пригласить
                </button>
            </div>

            {filteredTeam.length === 0 ? (
                <div className="empty-state">
                    <span>👥</span>
                    <h3>Нет участников</h3>
                    <p>Пригласите моделей и менеджеров в вашу команду</p>
                    <button
                        className="invite-btn"
                        onClick={() => setShowInviteModal(true)}
                    >
                        Пригласить первого участника
                    </button>
                </div>
            ) : (
                <div className="team-list">
                    {filteredTeam.map(member => (
                        <TeamMemberCard
                            key={member.id}
                            member={member}
                            onRemove={handleRemove}
                            onRoleChange={handleRoleChange}
                            canManage={true}
                        />
                    ))}
                </div>
            )}

            <InviteMemberModal
                isOpen={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                onInvite={handleInvite}
            />
        </div>
    )
}
