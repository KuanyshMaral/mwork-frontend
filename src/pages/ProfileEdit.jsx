import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { profileApi } from '../api/client'
import { useAuth } from '../hooks/useAuth.jsx'
import './ProfileEdit.css'

export default function ProfileEdit() {
    const { profile, updateProfile } = useAuth()
    const navigate = useNavigate()
    const [currentStep, setCurrentStep] = useState(1)
    const [errors, setErrors] = useState({})

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        age: '',
        gender: '',
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
        experience_years: '',
        specializations: [],
        languages: [],
        visibility: 'public',
        travel_cities: [],
        categories: [],
        skills: [],
        barter_accepted: false,
        accept_remote_work: false,
    })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (profile) {
            setFormData({
                first_name: profile.first_name || '',
                last_name: profile.last_name || '',
                age: profile.age || '',
                gender: profile.gender || '',
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
                experience_years: profile.experience_years || '',
                specializations: profile.specializations || [],
                languages: profile.languages || [],
                visibility: profile.visibility || 'public',
                travel_cities: profile.travel_cities || [],
                categories: profile.categories || [],
                skills: profile.skills || [],
                barter_accepted: profile.barter_accepted || false,
                accept_remote_work: profile.accept_remote_work || false,
            })
        }
    }, [profile])

    function handleChange(e) {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const validateStep = (step) => {
        const newErrors = {}

        if (step === 1) {
            if (!formData.first_name || formData.first_name.length < 2) {
                newErrors.first_name = 'Имя должно содержать минимум 2 символа'
            }
            if (formData.age && (formData.age < 16 || formData.age > 99)) {
                newErrors.age = 'Возраст должен быть от 16 до 99 лет'
            }
        } else if (step === 2) {
            if (formData.height_cm && (formData.height_cm < 140 || formData.height_cm > 220)) {
                newErrors.height_cm = 'Рост должен быть от 140 до 220 см'
            }
            if (formData.weight_kg && (formData.weight_kg < 30 || formData.weight_kg > 150)) {
                newErrors.weight_kg = 'Вес должен быть от 30 до 150 кг'
            }
            if (formData.bust_cm && (formData.bust_cm < 60 || formData.bust_cm > 150)) {
                newErrors.bust_cm = 'Обхват груди должен быть от 60 до 150 см'
            }
            if (formData.waist_cm && (formData.waist_cm < 40 || formData.waist_cm > 120)) {
                newErrors.waist_cm = 'Обхват талии должен быть от 40 до 120 см'
            }
            if (formData.hips_cm && (formData.hips_cm < 60 || formData.hips_cm > 150)) {
                newErrors.hips_cm = 'Обхват бедер должен быть от 60 до 150 см'
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleNext = () => {
        if (validateStep(currentStep)) {
            if (currentStep < 5) {
                setCurrentStep(currentStep + 1)
            } else {
                handleSubmit(new Event('submit'))
            }
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleStepClick = (step) => {
        if (step < currentStep || validateStep(currentStep)) {
            setCurrentStep(step)
        }
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
                visibility: formData.visibility,
                travel_cities: formData.travel_cities,
                categories: formData.categories,
                skills: formData.skills,
                barter_accepted: formData.barter_accepted,
                accept_remote_work: formData.accept_remote_work,
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

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="card form-section">
                        <h3>Основная информация</h3>
                        {error && <div className="auth-error">{error}</div>}

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Имя*</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    className={`form-input ${errors.first_name ? 'error' : ''}`}
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    required
                                />
                                {errors.first_name && <span className="error-message">{errors.first_name}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Фамилия</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    className="form-input"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Возраст</label>
                                <input
                                    type="number"
                                    name="age"
                                    className={`form-input ${errors.age ? 'error' : ''}`}
                                    value={formData.age}
                                    onChange={handleChange}
                                    min="16"
                                    max="99"
                                />
                                {errors.age && <span className="error-message">{errors.age}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Пол</label>
                                <select
                                    name="gender"
                                    className="form-input"
                                    value={formData.gender}
                                    onChange={handleChange}
                                >
                                    <option value="">Выберите пол</option>
                                    <option value="female">Женский</option>
                                    <option value="male">Мужской</option>
                                </select>
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
                )
            case 2:
                return (
                    <div className="card form-section">
                        <h3>Параметры</h3>
                        {error && <div className="auth-error">{error}</div>}

                        <div className="form-row form-row-4">
                            <div className="form-group">
                                <label className="form-label">Рост (см)</label>
                                <input
                                    type="number"
                                    name="height_cm"
                                    className={`form-input ${errors.height_cm ? 'error' : ''}`}
                                    value={formData.height_cm}
                                    onChange={handleChange}
                                />
                                {errors.height_cm && <span className="error-message">{errors.height_cm}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Вес (кг)</label>
                                <input
                                    type="number"
                                    name="weight_kg"
                                    className={`form-input ${errors.weight_kg ? 'error' : ''}`}
                                    value={formData.weight_kg}
                                    onChange={handleChange}
                                />
                                {errors.weight_kg && <span className="error-message">{errors.weight_kg}</span>}
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
                                    className={`form-input ${errors.bust_cm ? 'error' : ''}`}
                                    value={formData.bust_cm}
                                    onChange={handleChange}
                                />
                                {errors.bust_cm && <span className="error-message">{errors.bust_cm}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Талия (см)</label>
                                <input
                                    type="number"
                                    name="waist_cm"
                                    className={`form-input ${errors.waist_cm ? 'error' : ''}`}
                                    value={formData.waist_cm}
                                    onChange={handleChange}
                                />
                                {errors.waist_cm && <span className="error-message">{errors.waist_cm}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Бедра (см)</label>
                                <input
                                    type="number"
                                    name="hips_cm"
                                    className={`form-input ${errors.hips_cm ? 'error' : ''}`}
                                    value={formData.hips_cm}
                                    onChange={handleChange}
                                />
                                {errors.hips_cm && <span className="error-message">{errors.hips_cm}</span>}
                            </div>
                        </div>
                    </div>
                )
            case 3:
                return (
                    <div className="card form-section">
                        <h3>Опыт и навыки</h3>
                        {error && <div className="auth-error">{error}</div>}

                        <div className="form-group">
                            <label className="form-label">Опыт работы (лет)</label>
                            <input
                                type="number"
                                name="experience_years"
                                className="form-input"
                                value={formData.experience_years}
                                onChange={handleChange}
                                min="0"
                                max="50"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Специализации</label>
                            <textarea
                                name="specializations"
                                className="form-input form-textarea"
                                placeholder="Укажите ваши специализации через запятую"
                                value={Array.isArray(formData.specializations) ? formData.specializations.join(', ') : formData.specializations}
                                onChange={(e) => {
                                    const specializations = e.target.value.split(',').map(s => s.trim()).filter(s => s)
                                    setFormData(prev => ({ ...prev, specializations }))
                                }}
                                rows={3}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Языки</label>
                            <textarea
                                name="languages"
                                className="form-input form-textarea"
                                placeholder="Укажите языки которыми владеете"
                                value={Array.isArray(formData.languages) ? formData.languages.join(', ') : formData.languages}
                                onChange={(e) => {
                                    const languages = e.target.value.split(',').map(s => s.trim()).filter(s => s)
                                    setFormData(prev => ({ ...prev, languages }))
                                }}
                                rows={3}
                            />
                        </div>
                    </div>
                )
            case 4:
                return (
                    <div className="card form-section">
                        <h3>Тарифы</h3>
                        {error && <div className="auth-error">{error}</div>}

                        <div className="form-group" style={{ maxWidth: '300px' }}>
                            <label className="form-label">Ставка в час (₸)</label>
                            <input
                                type="number"
                                name="hourly_rate"
                                className="form-input"
                                value={formData.hourly_rate}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>
                    </div>
                )
            case 5:
                return (
                    <div className="card form-section">
                        <h3>Настройки профиля</h3>
                        {error && <div className="auth-error">{error}</div>}

                        <div className="form-group">
                            <label className="form-label">Видимость профиля</label>
                            <select
                                name="visibility"
                                className="form-input"
                                value={formData.visibility}
                                onChange={handleChange}
                            >
                                <option value="public">Публичный</option>
                                <option value="link_only">Только по ссылке</option>
                                <option value="hidden">Скрытый</option>
                            </select>
                            <small style={{ color: '#6b7280', marginTop: '4px', display: 'block' }}>
                                Публичный - виден всем, По ссылке - только у кого есть ссылка, Скрытый - никому не виден
                            </small>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Города для работы</label>
                            <textarea
                                name="travel_cities"
                                className="form-input form-textarea"
                                placeholder="Укажите города через запятую (например: Алматы, Астана, Шымкент)"
                                value={Array.isArray(formData.travel_cities) ? formData.travel_cities.join(', ') : formData.travel_cities}
                                onChange={(e) => {
                                    const travel_cities = e.target.value.split(',').map(s => s.trim()).filter(s => s)
                                    setFormData(prev => ({ ...prev, travel_cities }))
                                }}
                                rows={2}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Категории</label>
                            <textarea
                                name="categories"
                                className="form-input form-textarea"
                                placeholder="Укажите категории через запятую (например: Фото, Видео, Реклама)"
                                value={Array.isArray(formData.categories) ? formData.categories.join(', ') : formData.categories}
                                onChange={(e) => {
                                    const categories = e.target.value.split(',').map(s => s.trim()).filter(s => s)
                                    setFormData(prev => ({ ...prev, categories }))
                                }}
                                rows={2}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Навыки</label>
                            <textarea
                                name="skills"
                                className="form-input form-textarea"
                                placeholder="Укажите навыки через запятую (например: Позирование, Актерское мастерство)"
                                value={Array.isArray(formData.skills) ? formData.skills.join(', ') : formData.skills}
                                onChange={(e) => {
                                    const skills = e.target.value.split(',').map(s => s.trim()).filter(s => s)
                                    setFormData(prev => ({ ...prev, skills }))
                                }}
                                rows={2}
                            />
                        </div>

                        <div className="form-row" style={{ marginTop: '20px' }}>
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        name="barter_accepted"
                                        checked={formData.barter_accepted}
                                        onChange={(e) => setFormData(prev => ({ ...prev, barter_accepted: e.target.checked }))}
                                        style={{ width: '20px', height: '20px', accentColor: '#3b82f6' }}
                                    />
                                    <span style={{ fontSize: '0.9375rem', color: '#374151' }}>Принимаю бартер (TFP)</span>
                                </label>
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        name="accept_remote_work"
                                        checked={formData.accept_remote_work}
                                        onChange={(e) => setFormData(prev => ({ ...prev, accept_remote_work: e.target.checked }))}
                                        style={{ width: '20px', height: '20px', accentColor: '#3b82f6' }}
                                    />
                                    <span style={{ fontSize: '0.9375rem', color: '#374151' }}>Готов к удаленной работе</span>
                                </label>
                            </div>
                        </div>
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <div className="profile-edit animate-fadeIn">
            <div className="page-header">
                <h1>Редактирование профиля</h1>
                <p>Заполните информацию о себе</p>
            </div>

            <div style={{ marginTop: '32px' }}>
                {/* Progress Indicator */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px', padding: '20px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 0, position: 'relative' }}>
                        {[1, 2, 3, 4, 5].map((step) => (
                            <div key={step}>
                                <div
                                    style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '18px',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        position: 'relative',
                                        zIndex: 2,
                                        backgroundColor: currentStep >= step ? '#3b82f6' : '#ffffff',
                                        border: currentStep >= step ? '3px solid #3b82f6' : '2px solid #d1d5db',
                                        color: currentStep >= step ? 'white' : '#9ca3af'
                                    }}
                                    onClick={() => handleStepClick(step)}
                                >
                                    {step}
                                </div>
                                {step < 5 && (
                                    <div
                                        style={{
                                            width: '80px',
                                            height: '2px',
                                            backgroundColor: currentStep > step ? '#3b82f6' : '#d1d5db',
                                            transition: 'background-color 0.3s ease'
                                        }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    padding: '32px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    marginBottom: '24px'
                }}>
                    {renderStepContent()}
                </div>

                {/* Navigation Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                    <button
                        type="button"
                        style={{
                            padding: '14px 32px',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            border: 'none',
                            cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease',
                            minWidth: '120px',
                            backgroundColor: '#e5e7eb',
                            color: '#374151',
                            opacity: currentStep === 1 ? 0.5 : 1
                        }}
                        onClick={handleBack}
                        disabled={currentStep === 1}
                    >
                        ← Назад
                    </button>
                    <button
                        type="button"
                        style={{
                            padding: '14px 32px',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            border: 'none',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease',
                            minWidth: '120px',
                            backgroundColor: '#3b82f6',
                            color: '#ffffff',
                            opacity: saving ? 0.7 : 1
                        }}
                        onClick={handleNext}
                        disabled={saving}
                    >
                        {saving ? 'Сохранение...' : currentStep === 5 ? 'Сохранить' : 'Далее →'}
                    </button>
                </div>
            </div>
        </div>
    )
}
