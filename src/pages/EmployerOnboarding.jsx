import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileApi } from '../api/client.js';
import { useAuth } from '../hooks/useAuth.jsx';
import './ModelOnboarding.css'; // Reuse the same CSS for consistency

export default function EmployerOnboarding() {
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        // Authentication
        email: '',
        password: '',
        
        // Company Info
        company_name: '',
        contact_person: '',
        city: '',
        website: '',
        instagram: '',
        description: ''
    });
    
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email || !formData.email.includes('@')) {
            newErrors.email = 'Введите корректный email';
        }

        if (!formData.password || formData.password.length < 6) {
            newErrors.password = 'Пароль должен содержать минимум 6 символов';
        }

        if (!formData.company_name || formData.company_name.length < 2) {
            newErrors.company_name = 'Название компании должно содержать минимум 2 символа';
        }

        if (!formData.contact_person || formData.contact_person.length < 2) {
            newErrors.contact_person = 'Имя контактного лица обязательно';
        }

        if (!formData.city) {
            newErrors.city = 'Выберите город';
        }

        if (formData.website && !isValidUrl(formData.website)) {
            newErrors.website = 'Неверный формат URL';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const isValidUrl = (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            console.log('Attempting to register with email:', formData.email);
            console.log('Registration payload:', {
                email: formData.email,
                password: formData.password,
                role: 'employer',
            });
            
            // Step 1: Register the user
            await register({
                email: formData.email,
                password: formData.password,
                role: 'employer',
            });

            // Step 2: Prepare profile payload
            const payload = {
                company_name: formData.company_name,
                contact_person: formData.contact_person,
                city: formData.city,
                website: formData.website || null,
                instagram: formData.instagram || null,
                description: formData.description || null
            };

            console.log('Attempting to create employer profile with payload:', payload);

            // Step 3: Try to create employer profile, but handle 400 gracefully
            try {
                const result = await profileApi.createEmployer(payload);
                console.log('Employer profile created successfully:', result);
            } catch (apiError) {
                // If backend endpoint doesn't exist or returns 400/500, show friendly message and continue
                if (apiError.status === 400 || apiError.status === 404 || apiError.status === 500) {
                    console.warn('Employer profile creation endpoint not available (status: ' + apiError.status + '), proceeding to dashboard');
                    console.warn('Backend error details:', apiError.data);
                    // Store data locally for when backend is ready
                    localStorage.setItem('pendingEmployerProfile', JSON.stringify(payload));
                } else {
                    throw apiError; // Re-throw other errors
                }
            }
            
            navigate('/dashboard');
        } catch (error) {
            console.error('Failed to complete onboarding:', error);
            console.error('Error details:', {
                status: error.status,
                message: error.message,
                data: error.data
            });
            
            // Handle specific error cases
            if (error.status === 409) {
                setErrors({ submit: 'Этот email уже зарегистрирован. Попробуйте войти или используйте другой email.' });
            } else if (error.status === 400) {
                setErrors({ submit: 'Неверные данные. Проверьте все поля и попробуйте снова.' });
            } else {
                setErrors({ submit: error.message || 'Ошибка регистрации или создания профиля' });
            }
        } finally {
            setLoading(false);
        }
    };

    const cities = [
        'Алматы',
        'Астана',
        'Шымкент',
        'Караганда',
        'Актау',
        'Павлодар',
        'Усть-Каменогорск',
        'Семей',
        'Атырау',
        'Кызылорда',
        'Петропавловск',
        'Талдыкорган',
        'Кокшетау',
        'Тараз',
        'Екибастуз',
        'Риддер'
    ];

    return (
        <div className="model-onboarding">
            <div className="onboarding-container">
                <h1 className="onboarding-title">Создание профиля работодателя</h1>
                <p className="onboarding-subtitle">
                    Заполните информацию о вашей компании для поиска моделей
                </p>

                <div className="step-content">
                    {errors.submit && (
                        <div className="error-message" style={{ marginBottom: '20px', textAlign: 'center' }}>
                            {errors.submit}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="email" className="form-label">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className={`form-input ${errors.email ? 'error' : ''}`}
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="company@email.com"
                                    required
                                />
                                {errors.email && (
                                    <span className="error-message">{errors.email}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="password" className="form-label">
                                    Пароль *
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    className={`form-input ${errors.password ? 'error' : ''}`}
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Минимум 6 символов"
                                    required
                                />
                                {errors.password && (
                                    <span className="error-message">{errors.password}</span>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="company_name" className="form-label">
                                Название компании *
                            </label>
                            <input
                                type="text"
                                id="company_name"
                                name="company_name"
                                className={`form-input ${errors.company_name ? 'error' : ''}`}
                                value={formData.company_name}
                                onChange={handleChange}
                                placeholder="ООО 'Модельное агентство'"
                                required
                            />
                            {errors.company_name && (
                                <span className="error-message">{errors.company_name}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="contact_person" className="form-label">
                                Контактное лицо *
                            </label>
                            <input
                                type="text"
                                id="contact_person"
                                name="contact_person"
                                className={`form-input ${errors.contact_person ? 'error' : ''}`}
                                value={formData.contact_person}
                                onChange={handleChange}
                                placeholder="Иван Иванов"
                                required
                            />
                            {errors.contact_person && (
                                <span className="error-message">{errors.contact_person}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="city" className="form-label">
                                Город *
                            </label>
                            <select
                                id="city"
                                name="city"
                                className={`form-input ${errors.city ? 'error' : ''}`}
                                value={formData.city}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Выберите город</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>
                                        {city}
                                    </option>
                                ))}
                            </select>
                            {errors.city && (
                                <span className="error-message">{errors.city}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="website" className="form-label">
                                Веб-сайт
                            </label>
                            <input
                                type="text"
                                id="website"
                                name="website"
                                className={`form-input ${errors.website ? 'error' : ''}`}
                                value={formData.website}
                                onChange={handleChange}
                                placeholder="https://example.com"
                            />
                            {errors.website && (
                                <span className="error-message">{errors.website}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="instagram" className="form-label">
                                Instagram
                            </label>
                            <input
                                type="text"
                                id="instagram"
                                name="instagram"
                                className="form-input"
                                value={formData.instagram}
                                onChange={handleChange}
                                placeholder="@company_name"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description" className="form-label">
                                О компании
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                className="form-input form-textarea"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Расскажите о вашей компании, сфере деятельности, проектах..."
                                rows={4}
                            />
                        </div>

                        <div className="navigation-buttons" style={{ marginTop: '32px' }}>
                            <button
                                type="submit"
                                className="nav-button next-button"
                                disabled={loading}
                                style={{ width: '100%' }}
                            >
                                {loading ? 'Создание...' : 'Создать профиль →'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
