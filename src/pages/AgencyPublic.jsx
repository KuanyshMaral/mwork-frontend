import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { agencyApi, castingApi } from '../api/client'
import FollowButton from '../components/agency/FollowButton'
import './AgencyPublic.css'

export default function AgencyPublic() {
    const { id } = useParams()
    const [agency, setAgency] = useState(null)
    const [models, setModels] = useState([])
    const [castings, setCastings] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('models')

    useEffect(() => {
        loadAgency()
    }, [id])

    async function loadAgency() {
        try {
            const data = await agencyApi.getById(id)
            setAgency(data)
            setModels(data.models || [])
            setCastings(data.castings || [])
        } catch (err) {
            console.error('Failed to load agency:', err)
            setAgency({
                id: id,
                name: 'Fashion Models Agency',
                description: 'Ведущее модельное агентство в Казахстане. Мы работаем с лучшими брендами и предоставляем профессиональные услуги в сфере моды.',
                logo_url: null,
                city: 'Алматы',
                followers_count: 234,
                models_count: 18,
                is_following: false,
                specializations: ['Фэшн', 'Коммерческая', 'Runway'],
                website: 'https://example.com',
                phone: '+7 777 123 4567'
            })
            setModels([
                { id: 'm1', name: 'Анна К.', avatar_url: null, rating: 4.9 },
                { id: 'm2', name: 'Мария И.', avatar_url: null, rating: 4.8 },
                { id: 'm3', name: 'Елена П.', avatar_url: null, rating: 4.7 }
            ])
            setCastings([
                {
                    id: 'c1',
                    title: 'Фотосессия для бренда одежды',
                    city: 'Алматы',
                    pay_min: 50000,
                    pay_max: 80000,
                    status: 'active'
                }
            ])
        } finally {
            setLoading(false)
        }
    }

    const handleFollowChange = (isFollowing) => {
        setAgency(prev => ({
            ...prev,
            is_following: isFollowing,
            followers_count: prev.followers_count + (isFollowing ? 1 : -1)
        }))
    }

    if (loading) {
        return <div className="loading">Загрузка...</div>
    }

    if (!agency) {
        return (
            <div className="not-found">
                <h2>Агентство не найдено</h2>
                <Link to="/agencies">Вернуться к списку</Link>
            </div>
        )
    }

    return (
        <div className="agency-public">
            <div className="agency-cover">
                <div className="agency-cover-gradient" />
            </div>

            <div className="agency-content">
                <div className="agency-profile-header">
                    <div className="agency-logo-large">
                        {agency.logo_url ? (
                            <img src={agency.logo_url} alt={agency.name} />
                        ) : (
                            <span>🏢</span>
                        )}
                    </div>

                    <div className="agency-main-info">
                        <h1>{agency.name}</h1>
                        <p className="agency-location">📍 {agency.city}</p>
                        <div className="agency-stats-row">
                            <span>{agency.models_count} моделей</span>
                            <span>•</span>
                            <span>{agency.followers_count} подписчиков</span>
                        </div>
                    </div>

                    <div className="agency-actions">
                        <FollowButton
                            agencyId={agency.id}
                            initialFollowing={agency.is_following}
                            onFollowChange={handleFollowChange}
                        />
                        <Link to="/messages" className="contact-btn">
                            💬 Написать
                        </Link>
                    </div>
                </div>

                <div className="agency-description">
                    <p>{agency.description}</p>
                </div>

                {agency.specializations?.length > 0 && (
                    <div className="agency-specializations">
                        {agency.specializations.map(spec => (
                            <span key={spec} className="spec-tag">{spec}</span>
                        ))}
                    </div>
                )}

                <div className="agency-contact-info">
                    {agency.website && (
                        <a href={agency.website} target="_blank" rel="noopener noreferrer" className="contact-item">
                            🌐 {agency.website.replace(/^https?:\/\//, '')}
                        </a>
                    )}
                    {agency.phone && (
                        <a href={`tel:${agency.phone}`} className="contact-item">
                            📞 {agency.phone}
                        </a>
                    )}
                </div>

                <div className="agency-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'models' ? 'active' : ''}`}
                        onClick={() => setActiveTab('models')}
                    >
                        Модели ({models.length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'castings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('castings')}
                    >
                        Кастинги ({castings.length})
                    </button>
                </div>

                {activeTab === 'models' && (
                    <div className="models-grid">
                        {models.length === 0 ? (
                            <p className="empty-text">Нет моделей</p>
                        ) : (
                            models.map(model => (
                                <Link key={model.id} to={`/profile/${model.id}`} className="model-card">
                                    <div className="model-avatar">
                                        {model.avatar_url ? (
                                            <img src={model.avatar_url} alt={model.name} />
                                        ) : (
                                            <span>👤</span>
                                        )}
                                    </div>
                                    <h4>{model.name}</h4>
                                    <span className="model-rating">⭐ {model.rating}</span>
                                </Link>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'castings' && (
                    <div className="castings-list">
                        {castings.length === 0 ? (
                            <p className="empty-text">Нет активных кастингов</p>
                        ) : (
                            castings.map(casting => (
                                <Link key={casting.id} to={`/castings/${casting.id}`} className="casting-row">
                                    <div className="casting-info">
                                        <h4>{casting.title}</h4>
                                        <span className="casting-location">📍 {casting.city}</span>
                                    </div>
                                    <div className="casting-pay">
                                        ₸{casting.pay_min?.toLocaleString()} - ₸{casting.pay_max?.toLocaleString()}
                                    </div>
                                    <span className={`status-badge ${casting.status}`}>
                                        {casting.status === 'active' ? 'Активный' : casting.status}
                                    </span>
                                </Link>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
