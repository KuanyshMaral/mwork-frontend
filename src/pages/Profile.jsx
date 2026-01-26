import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { profileApi, reviewApi } from '../api/client'
import { useAuth } from '../hooks/useAuth.jsx'
import './Profile.css'

export default function Profile() {
    const { id } = useParams()
    const { profile: myProfile, user } = useAuth()

    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [reviewsSummary, setReviewsSummary] = useState(null)

    const isOwn = !id || (myProfile && id === myProfile.id)
    const profileId = isOwn ? myProfile?.id : id

    useEffect(() => {
        if (profileId) {
            loadProfile()
        } else if (isOwn && !myProfile) {
            setLoading(false)
        }
    }, [profileId, myProfile])

    async function loadProfile() {
        try {
            const data = isOwn
                ? myProfile
                : await profileApi.getById(profileId)
            setProfile(data)

            // Load reviews summary
            try {
                const reviews = await reviewApi.getSummary(profileId)
                setReviewsSummary(reviews)
            } catch (e) { }
        } catch (err) {
            console.error('Failed to load profile:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="loading">Загрузка...</div>
    }

    if (!profile) {
        return (
            <div className="profile-page animate-fadeIn">
                <div className="no-profile">
                    <h2>Профиль не создан</h2>
                    <p>Создайте профиль, чтобы начать получать предложения</p>
                    <Link to="/profile/edit" className="btn btn-primary">
                        Создать профиль
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="profile-page animate-fadeIn">
            <div className="page-header flex-between">
                <div>
                    <h1>
                        {isOwn ? 'Мой профиль' : `${profile.first_name} ${profile.last_name}`}
                    </h1>
                    <p>{profile.city}</p>
                </div>
                {isOwn && (
                    <Link to="/profile/edit" className="btn btn-secondary">
                        ✏️ Редактировать
                    </Link>
                )}
            </div>

            <div className="profile-content">
                {/* Main Info */}
                <div className="profile-main">
                    <div className="card profile-card">
                        <div className="profile-header">
                            <div className="profile-avatar">
                                {profile.avatar_url ? (
                                    <img src={profile.avatar_url} alt={profile.first_name} />
                                ) : (
                                    <span>{profile.first_name?.charAt(0)}</span>
                                )}
                            </div>

                            <div className="profile-info">
                                <h2>{profile.first_name} {profile.last_name}</h2>
                                <div className="profile-meta">
                                    <span className="badge badge-primary">{profile.type}</span>
                                    {profile.is_verified && (
                                        <span className="badge badge-success">✓ Верифицирован</span>
                                    )}
                                </div>

                                {reviewsSummary && (
                                    <div className="profile-rating">
                                        <span className="rating-stars">⭐ {reviewsSummary.average_rating?.toFixed(1)}</span>
                                        <span className="rating-count">({reviewsSummary.total_reviews} отзывов)</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {profile.bio && (
                            <div className="profile-bio">
                                <h4>О себе</h4>
                                <p>{profile.bio}</p>
                            </div>
                        )}
                    </div>

                    {/* Parameters */}
                    <div className="card mt-3">
                        <h4>Параметры</h4>
                        <div className="params-grid">
                            {profile.height_cm && (
                                <div className="param-item">
                                    <span className="param-label">Рост</span>
                                    <span className="param-value">{profile.height_cm} см</span>
                                </div>
                            )}
                            {profile.weight_kg && (
                                <div className="param-item">
                                    <span className="param-label">Вес</span>
                                    <span className="param-value">{profile.weight_kg} кг</span>
                                </div>
                            )}
                            {profile.bust_cm && (
                                <div className="param-item">
                                    <span className="param-label">Параметры</span>
                                    <span className="param-value">
                                        {profile.bust_cm}/{profile.waist_cm}/{profile.hips_cm}
                                    </span>
                                </div>
                            )}
                            {profile.hair_color && (
                                <div className="param-item">
                                    <span className="param-label">Волосы</span>
                                    <span className="param-value">{profile.hair_color}</span>
                                </div>
                            )}
                            {profile.eye_color && (
                                <div className="param-item">
                                    <span className="param-label">Глаза</span>
                                    <span className="param-value">{profile.eye_color}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="profile-sidebar">
                    <div className="card stats-card">
                        <h4>Статистика</h4>
                        <div className="stats-list">
                            <div className="stat-row">
                                <span>Просмотров</span>
                                <span className="stat-value">{profile.view_count || 0}</span>
                            </div>
                            <div className="stat-row">
                                <span>Завершено работ</span>
                                <span className="stat-value">{profile.completed_jobs || 0}</span>
                            </div>
                            <div className="stat-row">
                                <span>Заработано</span>
                                <span className="stat-value">₸{(profile.total_earnings || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
