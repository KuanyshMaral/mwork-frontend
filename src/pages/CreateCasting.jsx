import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { castingApi, uploadApi } from '../api/client'
import './CreateCasting.css'

export default function CreateCasting() {
    const navigate = useNavigate()
    const { id } = useParams()
    const isEdit = Boolean(id)

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        city: '',
        pay_min: '',
        pay_max: '',
        gender: '',
        age_min: '',
        age_max: '',
        cover_image_url: '',
    })

    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')
    const [errors, setErrors] = useState({})

    useEffect(() => {
        if (isEdit) {
            loadCasting()
        }
    }, [id])

    async function loadCasting() {
        setLoading(true)
        try {
            const casting = await castingApi.getById(id)
            setFormData({
                title: casting.title || '',
                description: casting.description || '',
                city: casting.city || '',
                pay_min: casting.pay_min || '',
                pay_max: casting.pay_max || '',
                gender: casting.gender || '',
                age_min: casting.age_min || '',
                age_max: casting.age_max || '',
                cover_image_url: casting.cover_image_url || '',
            })
        } catch (err) {
            setError('Не удалось загрузить кастинг')
        } finally {
            setLoading(false)
        }
    }

    function handleChange(e) {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    async function handleImageUpload(e) {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const initData = await uploadApi.init({
                file_name: file.name,
                content_type: file.type,
                file_size: file.size,
            })

            await fetch(initData.upload_url, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type },
            })

            const confirmed = await uploadApi.confirm({ upload_id: initData.upload_id })
            setFormData(prev => ({ ...prev, cover_image_url: confirmed.url }))
        } catch (err) {
            setError('Ошибка загрузки изображения')
        } finally {
            setUploading(false)
        }
    }

    function validate() {
        const newErrors = {}
        if (!formData.title.trim()) {
            newErrors.title = 'Введите название'
        } else if (formData.title.length < 5) {
            newErrors.title = 'Минимум 5 символов'
        }
        if (!formData.description.trim()) {
            newErrors.description = 'Введите описание'
        } else if (formData.description.length < 20) {
            newErrors.description = 'Минимум 20 символов'
        }
        if (!formData.city) {
            newErrors.city = 'Выберите город'
        }
        if (formData.pay_min && formData.pay_max && Number(formData.pay_min) > Number(formData.pay_max)) {
            newErrors.pay_max = 'Максимум не может быть меньше минимума'
        }
        if (formData.age_min && formData.age_max && Number(formData.age_min) > Number(formData.age_max)) {
            newErrors.age_max = 'Максимум не может быть меньше минимума'
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (!validate()) return

        setLoading(true)
        setError('')

        try {
            const data = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                city: formData.city,
                pay_min: formData.pay_min ? Number(formData.pay_min) : null,
                pay_max: formData.pay_max ? Number(formData.pay_max) : null,
                gender: formData.gender || null,
                age_min: formData.age_min ? Number(formData.age_min) : null,
                age_max: formData.age_max ? Number(formData.age_max) : null,
                cover_image_url: formData.cover_image_url || null,
            }

            if (isEdit) {
                await castingApi.update(id, data)
            } else {
                await castingApi.create(data)
            }
            navigate('/castings/my')
        } catch (err) {
            setError(err.message || 'Ошибка сохранения')
        } finally {
            setLoading(false)
        }
    }

    if (loading && isEdit) {
        return <div className="loading">Загрузка...</div>
    }

    return (
        <div className="create-casting animate-fadeIn">
            <div className="page-header">
                <h1>{isEdit ? 'Редактировать кастинг' : 'Создать кастинг'}</h1>
                <p>{isEdit ? 'Измените данные кастинга' : 'Заполните информацию о кастинге'}</p>
            </div>

            <form onSubmit={handleSubmit} className="create-casting-form">
                {error && <div className="form-error">{error}</div>}

                <div className="card form-section">
                    <h3>Основная информация</h3>

                    <div className="form-group">
                        <label className="form-label">Название кастинга *</label>
                        <input
                            type="text"
                            name="title"
                            className={`form-input ${errors.title ? 'error' : ''}`}
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Например: Съемка для каталога одежды"
                        />
                        {errors.title && <span className="error-message">{errors.title}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Описание *</label>
                        <textarea
                            name="description"
                            className={`form-input form-textarea ${errors.description ? 'error' : ''}`}
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Подробно опишите что требуется, условия работы..."
                            rows={5}
                        />
                        {errors.description && <span className="error-message">{errors.description}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Город *</label>
                        <select
                            name="city"
                            className={`form-input ${errors.city ? 'error' : ''}`}
                            value={formData.city}
                            onChange={handleChange}
                        >
                            <option value="">Выберите город</option>
                            <option value="Алматы">Алматы</option>
                            <option value="Астана">Астана</option>
                            <option value="Шымкент">Шымкент</option>
                            <option value="Караганда">Караганда</option>
                            <option value="Актобе">Актобе</option>
                            <option value="Тараз">Тараз</option>
                            <option value="Павлодар">Павлодар</option>
                            <option value="Усть-Каменогорск">Усть-Каменогорск</option>
                        </select>
                        {errors.city && <span className="error-message">{errors.city}</span>}
                    </div>
                </div>

                <div className="card form-section">
                    <h3>Оплата</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Минимум (₸)</label>
                            <input
                                type="number"
                                name="pay_min"
                                className="form-input"
                                value={formData.pay_min}
                                onChange={handleChange}
                                placeholder="10000"
                                min="0"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Максимум (₸)</label>
                            <input
                                type="number"
                                name="pay_max"
                                className={`form-input ${errors.pay_max ? 'error' : ''}`}
                                value={formData.pay_max}
                                onChange={handleChange}
                                placeholder="50000"
                                min="0"
                            />
                            {errors.pay_max && <span className="error-message">{errors.pay_max}</span>}
                        </div>
                    </div>
                </div>

                <div className="card form-section">
                    <h3>Требования (опционально)</h3>

                    <div className="form-group">
                        <label className="form-label">Пол</label>
                        <select
                            name="gender"
                            className="form-input"
                            value={formData.gender}
                            onChange={handleChange}
                        >
                            <option value="">Любой</option>
                            <option value="female">Женский</option>
                            <option value="male">Мужской</option>
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Возраст от</label>
                            <input
                                type="number"
                                name="age_min"
                                className="form-input"
                                value={formData.age_min}
                                onChange={handleChange}
                                placeholder="18"
                                min="16"
                                max="99"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Возраст до</label>
                            <input
                                type="number"
                                name="age_max"
                                className={`form-input ${errors.age_max ? 'error' : ''}`}
                                value={formData.age_max}
                                onChange={handleChange}
                                placeholder="35"
                                min="16"
                                max="99"
                            />
                            {errors.age_max && <span className="error-message">{errors.age_max}</span>}
                        </div>
                    </div>
                </div>

                <div className="card form-section">
                    <h3>Обложка (опционально)</h3>
                    <div className="form-group">
                        <div className="cover-upload">
                            {formData.cover_image_url ? (
                                <div className="cover-preview">
                                    <img src={formData.cover_image_url} alt="Cover" />
                                    <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => setFormData(prev => ({ ...prev, cover_image_url: '' }))}
                                    >
                                        Удалить
                                    </button>
                                </div>
                            ) : (
                                <label className="upload-area">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                        hidden
                                    />
                                    <div className="upload-placeholder">
                                        {uploading ? (
                                            <span>Загрузка...</span>
                                        ) : (
                                            <>
                                                <span className="upload-icon">📷</span>
                                                <span>Нажмите для загрузки</span>
                                            </>
                                        )}
                                    </div>
                                </label>
                            )}
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate(-1)}
                    >
                        Отмена
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Сохранение...' : isEdit ? 'Сохранить' : 'Создать кастинг'}
                    </button>
                </div>
            </form>
        </div>
    )
}
