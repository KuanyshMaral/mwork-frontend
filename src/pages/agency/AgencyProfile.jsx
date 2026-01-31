import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { agencyApi } from '../../api/client'
import './Agency.css'

export default function AgencyProfile() {
    const navigate = useNavigate()
    const [agency, setAgency] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        website: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        specializations: []
    })

    const specializationOptions = [
        'Фэшн', 'Коммерческая', 'Фитнес', 'Детская', 'Plus-size', 'Runway', 'Реклама'
    ]

    useEffect(() => {
        loadAgency()
    }, [])

    async function loadAgency() {
        try {
            const data = await agencyApi.getMyAgency()
            setAgency(data)
            setFormData({
                name: data.name || '',
                description: data.description || '',
                website: data.website || '',
                phone: data.phone || '',
                email: data.email || '',
                address: data.address || '',
                city: data.city || '',
                specializations: data.specializations || []
            })
        } catch (err) {
            console.error('Failed to load agency:', err)
            setFormData({
                name: 'Моё агентство',
                description: '',
                website: '',
                phone: '',
                email: '',
                address: '',
                city: 'Алматы',
                specializations: []
            })
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const toggleSpecialization = (spec) => {
        setFormData(prev => ({
            ...prev,
            specializations: prev.specializations.includes(spec)
                ? prev.specializations.filter(s => s !== spec)
                : [...prev.specializations, spec]
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            await agencyApi.update(formData)
            alert('Профиль агентства обновлён')
        } catch (err) {
            console.error('Failed to update agency:', err)
            alert('Ошибка при сохранении')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div className="loading">Загрузка...</div>
    }

    return (
        <div className="agency-profile-page">
            <div className="page-header">
                <button className="back-btn" onClick={() => navigate('/agency')}>
                    ← Назад
                </button>
                <h1>Профиль агентства</h1>
            </div>

            <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-section">
                    <h2>Основная информация</h2>

                    <div className="logo-upload">
                        <div className="logo-preview">
                            {agency?.logo_url ? (
                                <img src={agency.logo_url} alt="Logo" />
                            ) : (
                                <span>🏢</span>
                            )}
                        </div>
                        <button type="button" className="upload-btn">
                            Загрузить логотип
                        </button>
                    </div>

                    <div className="form-group">
                        <label>Название агентства *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Описание</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Расскажите о вашем агентстве..."
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h2>Контакты</h2>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Телефон</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Веб-сайт</label>
                        <input
                            type="url"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            placeholder="https://"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Город</label>
                            <select name="city" value={formData.city} onChange={handleChange}>
                                <option value="">Выберите город</option>
                                <option value="Алматы">Алматы</option>
                                <option value="Астана">Астана</option>
                                <option value="Шымкент">Шымкент</option>
                                <option value="Караганда">Караганда</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Адрес</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h2>Специализация</h2>
                    <div className="specializations-grid">
                        {specializationOptions.map(spec => (
                            <button
                                key={spec}
                                type="button"
                                className={`spec-btn ${formData.specializations.includes(spec) ? 'active' : ''}`}
                                onClick={() => toggleSpecialization(spec)}
                            >
                                {spec}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => navigate('/agency')}
                    >
                        Отмена
                    </button>
                    <button type="submit" className="save-btn" disabled={saving}>
                        {saving ? 'Сохранение...' : 'Сохранить изменения'}
                    </button>
                </div>
            </form>
        </div>
    )
}
