import { Link } from 'react-router-dom'
import './TeamMemberCard.css'

const ROLE_LABELS = {
    owner: 'Владелец',
    admin: 'Администратор',
    manager: 'Менеджер',
    model: 'Модель'
}

export default function TeamMemberCard({ member, onRemove, onRoleChange, canManage = false }) {
    return (
        <div className="team-member-card">
            <div className="member-avatar">
                {member.avatar_url ? (
                    <img src={member.avatar_url} alt={member.name} />
                ) : (
                    <span>{member.name?.[0] || '👤'}</span>
                )}
            </div>

            <div className="member-info">
                <h4 className="member-name">
                    <Link to={`/profile/${member.user_id}`}>{member.name}</Link>
                </h4>
                <p className="member-email">{member.email}</p>
                <span className={`member-role ${member.role}`}>
                    {ROLE_LABELS[member.role] || member.role}
                </span>
            </div>

            <div className="member-stats">
                <div className="stat">
                    <span className="stat-value">{member.bookings_count || 0}</span>
                    <span className="stat-label">Бронирований</span>
                </div>
                <div className="stat">
                    <span className="stat-value">⭐ {member.rating?.toFixed(1) || '—'}</span>
                    <span className="stat-label">Рейтинг</span>
                </div>
            </div>

            {canManage && member.role !== 'owner' && (
                <div className="member-actions">
                    <select
                        value={member.role}
                        onChange={(e) => onRoleChange?.(member.id, e.target.value)}
                        className="role-select"
                    >
                        <option value="model">Модель</option>
                        <option value="manager">Менеджер</option>
                        <option value="admin">Администратор</option>
                    </select>
                    <button
                        className="remove-btn"
                        onClick={() => onRemove?.(member.id)}
                        title="Удалить из команды"
                    >
                        ✕
                    </button>
                </div>
            )}

            <div className="member-joined">
                Присоединился: {new Date(member.joined_at).toLocaleDateString('ru-RU')}
            </div>
        </div>
    )
}
