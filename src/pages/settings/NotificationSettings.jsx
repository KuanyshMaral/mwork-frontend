import { useState, useEffect } from 'react'
import api from '../../api/client'
import './NotificationSettings.css'

const NOTIFICATION_TYPES = [
    {
        key: 'new_response',
        label: 'Новые отклики на кастинги',
        description: 'Когда модель откликается на ваш кастинг',
        forRoles: ['employer']
    },
    {
        key: 'response_accepted',
        label: 'Принятие заявки',
        description: 'Когда вашу заявку принимают на кастинг',
        forRoles: ['model']
    },
    {
        key: 'response_rejected',
        label: 'Отклонение заявки',
        description: 'Когда вашу заявку отклоняют',
        forRoles: ['model']
    },
    {
        key: 'new_message',
        label: 'Новые сообщения',
        description: 'Когда вам пишут в чате',
        forRoles: ['model', 'employer']
    },
    {
        key: 'profile_viewed',
        label: 'Просмотры профиля',
        description: 'Когда работодатель смотрит ваш профиль (Pro)',
        forRoles: ['model']
    },
    {
        key: 'casting_expiring',
        label: 'Истечение кастинга',
        description: 'Напоминание о скором завершении кастинга',
        forRoles: ['employer']
    }
]

function NotificationSettings() {
    const [preferences, setPreferences] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [userRole] = useState(() => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}')
            return user.role || 'model'
        } catch {
            return 'model'
        }
    })

    useEffect(() => {
        fetchPreferences()
    }, [])

    const fetchPreferences = async () => {
        try {
            const response = await api.get('/notifications/preferences')
            setPreferences(response.data)
        } catch (err) {
            console.error('Failed to fetch preferences:', err)
            // Set defaults
            setPreferences({
                email_enabled: true,
                push_enabled: true,
                in_app_enabled: true,
                new_response_channels: { in_app: true, email: true, push: true },
                response_accepted_channels: { in_app: true, email: true, push: true },
                response_rejected_channels: { in_app: true, email: true, push: false },
                new_message_channels: { in_app: true, email: false, push: true },
                profile_viewed_channels: { in_app: true, email: false, push: false },
                casting_expiring_channels: { in_app: true, email: true, push: false },
                digest_enabled: true,
                digest_frequency: 'weekly'
            })
        } finally {
            setLoading(false)
        }
    }

    const updatePreferences = async (updates) => {
        setSaving(true)
        try {
            await api.put('/notifications/preferences', updates)
            setPreferences(prev => ({ ...prev, ...updates }))
        } catch (err) {
            console.error('Failed to update preferences:', err)
            alert('Ошибка сохранения настроек')
        } finally {
            setSaving(false)
        }
    }

    const handleGlobalToggle = (channel) => {
        const key = `${channel}_enabled`
        updatePreferences({ [key]: !preferences[key] })
    }

    const handleTypeChannelToggle = (type, channel) => {
        const key = `${type}_channels`
        const current = preferences[key] || {}
        updatePreferences({
            [key]: { ...current, [channel]: !current[channel] }
        })
    }

    const handleDigestToggle = () => {
        updatePreferences({ digest_enabled: !preferences.digest_enabled })
    }

    const handleDigestFrequency = (freq) => {
        updatePreferences({ digest_frequency: freq })
    }

    if (loading) {
        return <div className="settings-loading">Загрузка...</div>
    }

    const relevantTypes = NOTIFICATION_TYPES.filter(t =>
        t.forRoles.includes(userRole)
    )

    return (
        <div className="notification-settings">
            <div className="settings-header">
                <h1>🔔 Настройки уведомлений</h1>
                <p>Выберите, как и когда получать уведомления</p>
            </div>

            {/* Global toggles */}
            <div className="settings-section">
                <h2>Каналы доставки</h2>
                <div className="global-toggles">
                    <label className="toggle-row">
                        <div className="toggle-info">
                            <span className="toggle-icon">📱</span>
                            <div>
                                <span className="toggle-label">В приложении</span>
                                <span className="toggle-desc">Уведомления внутри сайта</span>
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            checked={preferences.in_app_enabled}
                            onChange={() => handleGlobalToggle('in_app')}
                            disabled={saving}
                        />
                    </label>

                    <label className="toggle-row">
                        <div className="toggle-info">
                            <span className="toggle-icon">📧</span>
                            <div>
                                <span className="toggle-label">Email</span>
                                <span className="toggle-desc">На вашу почту</span>
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            checked={preferences.email_enabled}
                            onChange={() => handleGlobalToggle('email')}
                            disabled={saving}
                        />
                    </label>

                    <label className="toggle-row">
                        <div className="toggle-info">
                            <span className="toggle-icon">🔔</span>
                            <div>
                                <span className="toggle-label">Push-уведомления</span>
                                <span className="toggle-desc">В браузере и на телефоне</span>
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            checked={preferences.push_enabled}
                            onChange={() => handleGlobalToggle('push')}
                            disabled={saving}
                        />
                    </label>
                </div>
            </div>

            {/* Per-type settings */}
            <div className="settings-section">
                <h2>Типы уведомлений</h2>
                <div className="type-settings">
                    {relevantTypes.map(type => {
                        const channels = preferences[`${type.key}_channels`] || {}
                        return (
                            <div key={type.key} className="type-row">
                                <div className="type-info">
                                    <span className="type-label">{type.label}</span>
                                    <span className="type-desc">{type.description}</span>
                                </div>
                                <div className="type-channels">
                                    <label className="channel-toggle" title="В приложении">
                                        <input
                                            type="checkbox"
                                            checked={channels.in_app !== false}
                                            onChange={() => handleTypeChannelToggle(type.key, 'in_app')}
                                            disabled={saving || !preferences.in_app_enabled}
                                        />
                                        <span>📱</span>
                                    </label>
                                    <label className="channel-toggle" title="Email">
                                        <input
                                            type="checkbox"
                                            checked={channels.email === true}
                                            onChange={() => handleTypeChannelToggle(type.key, 'email')}
                                            disabled={saving || !preferences.email_enabled}
                                        />
                                        <span>📧</span>
                                    </label>
                                    <label className="channel-toggle" title="Push">
                                        <input
                                            type="checkbox"
                                            checked={channels.push === true}
                                            onChange={() => handleTypeChannelToggle(type.key, 'push')}
                                            disabled={saving || !preferences.push_enabled}
                                        />
                                        <span>🔔</span>
                                    </label>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Digest settings */}
            <div className="settings-section">
                <h2>Дайджест</h2>
                <div className="digest-settings">
                    <label className="toggle-row">
                        <div className="toggle-info">
                            <span className="toggle-icon">📊</span>
                            <div>
                                <span className="toggle-label">Получать сводку</span>
                                <span className="toggle-desc">Итоги активности за период</span>
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            checked={preferences.digest_enabled}
                            onChange={handleDigestToggle}
                            disabled={saving}
                        />
                    </label>

                    {preferences.digest_enabled && (
                        <div className="digest-frequency">
                            <span>Частота:</span>
                            <div className="frequency-options">
                                <button
                                    className={preferences.digest_frequency === 'daily' ? 'active' : ''}
                                    onClick={() => handleDigestFrequency('daily')}
                                    disabled={saving}
                                >
                                    Ежедневно
                                </button>
                                <button
                                    className={preferences.digest_frequency === 'weekly' ? 'active' : ''}
                                    onClick={() => handleDigestFrequency('weekly')}
                                    disabled={saving}
                                >
                                    Еженедельно
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {saving && <div className="saving-indicator">Сохранение...</div>}
        </div>
    )
}

export default NotificationSettings
