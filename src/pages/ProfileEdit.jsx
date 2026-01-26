import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { profileApi } from '../api/client'
import { useAuth } from '../hooks/useAuth.jsx'
import './ProfileEdit.css'

export default function ProfileEdit() {
    const { profile, updateProfile } = useAuth()
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        bio: '',
        city: '',
        phone: '',
        height_cm: '',
        weight_kg: '',
        bust_cm: '',
        waist_cm: '',
        hips_cm: '',
        hair_color: '',
        eye_color: '',
        hourly_rate: '',
    })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (profile) {
            setFormData({
                first_name: profile.first_name || '',
                last_name: profile.last_name || '',
                bio: profile.bio || '',
                city: profile.city || '',
                phone: profile.phone || '',
                height_cm: profile.height_cm || '',
                weight_kg: profile.weight_kg || '',
                bust_cm: profile.bust_cm || '',
                waist_cm: profile.waist_cm || '',
                hips_cm: profile.hips_cm || '',
                hair_color: profile.hair_color || '',
                eye_color: profile.eye_color || '',
                hourly_rate: profile.hourly_rate || '',
            })
        }
    }, [profile])

    function handleChange(e) {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setSaving(true)

        try {
            // Convert numeric fields
            const data = {
                ...formData,
                height_cm: formData.height_cm ? parseInt(formData.height_cm) : null,
                weight_kg: formData.weight_kg ? parseInt(formData.weight_kg) : null,
                bust_cm: formData.bust_cm ? parseInt(formData.bust_cm) : null,
                waist_cm: formData.waist_cm ? parseInt(formData.waist_cm) : null,
                hips_cm: formData.hips_cm ? parseInt(formData.hips_cm) : null,
                hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
            }

            const updated = await profileApi.update(profile.id, data)
            updateProfile(updated)
            navigate('/profile')
        } catch (err) {
            setError(err.message || 'Ошибка сохранения')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="profile-edit animate-fadeIn">
            <div className="page-header">
                <h1>Редактирование профиля</h1>
                <p>Заполните информацию о себе</p>
            </div>

            <form onSubmit={handleSubmit} className="edit-form">
                {error && <div className="auth-error">{error}</div>}

                {/* Basic Info */}
                <div className="card form-section">
                    <h3>Основная информация</h3>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Имя</label>
                            <input
                                type="text"
                                name="first_name"
                                className="form-input"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Фамилия</label>
                            <input
                                type="text"
                                name="last_name"
                                className="form-input"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Город</label>
                            <select
                                name="city"
                                className="form-input"
                                value={formData.city}
                                onChange={handleChange}
                            >
                                <option value="">Выберите город</option>
                                <option value="Алматы">Алматы</option>
                                <option value="Астана">Астана</option>
                                <option value="Шымкент">Шымкент</option>
                                <option value="Караганда">Караганда</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Телефон</label>
                            <input
                                type="tel"
                                name="phone"
                                className="form-input"
                                placeholder="+7 (___) ___-__-__"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">О себе</label>
                        <textarea
                            name="bio"
                            className="form-input form-textarea"
                            placeholder="Расскажите о себе, опыте, навыках..."
                            value={formData.bio}
                            onChange={handleChange}
                            rows={4}
                        />
                    </div>
                </div>

                {/* Parameters */}
                <div className="card form-section">
                    <h3>Параметры</h3>

                    <div className="form-row form-row-4">
                        <div className="form-group">
                            <label className="form-label">Рост (см)</label>
                            <input
                                type="number"
                                name="height_cm"
                                className="form-input"
                                value={formData.height_cm}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Вес (кг)</label>
                            <input
                                type="number"
                                name="weight_kg"
                                className="form-input"
                                value={formData.weight_kg}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Цвет волос</label>
                            <input
                                type="text"
                                name="hair_color"
                                className="form-input"
                                placeholder="Черный"
                                value={formData.hair_color}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Цвет глаз</label>
                            <input
                                type="text"
                                name="eye_color"
                                className="form-input"
                                placeholder="Карий"
                                value={formData.eye_color}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-row form-row-3">
                        <div className="form-group">
                            <label className="form-label">Грудь (см)</label>
                            <input
                                type="number"
                                name="bust_cm"
                                className="form-input"
                                value={formData.bust_cm}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Талия (см)</label>
                            <input
                                type="number"
                                name="waist_cm"
                                className="form-input"
                                value={formData.waist_cm}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Бедра (см)</label>
                            <input
                                type="number"
                                name="hips_cm"
                                className="form-input"
                                value={formData.hips_cm}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Rates */}
                <div className="card form-section">
                    <h3>Тарифы</h3>

                    <div className="form-group" style={{ maxWidth: '300px' }}>
                        <label className="form-label">Ставка в час (₸)</label>
                        <input
                            type="number"
                            name="hourly_rate"
                            className="form-input"
                            value={formData.hourly_rate}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate('/profile')}
                    >
                        Отмена
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={saving}
                    >
                        {saving ? 'Сохранение...' : 'Сохранить'}
                    </button>
                </div>
            </form>
        </div>
    )
}
