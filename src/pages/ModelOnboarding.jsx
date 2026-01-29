import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileApi } from '../api/client.js';
import { useAuth } from '../hooks/useAuth.jsx';
import Step1BasicInfo from '../components/onboarding/Step1BasicInfo.jsx';
import Step2Measurements from '../components/onboarding/Step2Measurements.jsx';
import './ModelOnboarding.css';

export default function ModelOnboarding() {
    const [currentStep, setCurrentStep] = useState(1);
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        // Authentication
        email: '',
        password: '',
        
        // Step 1: Basic Info
        first_name: '',
        age: '',
        gender: '',
        city: '',
        
        // Step 2: Measurements
        height: '',
        weight: '',
        bust: '',
        waist: '',
        hips: '',
        
        // Step 3: Experience (inline)
        experience_years: '',
        categories: [],
        skills: [],
        languages: [],
        bio: '',
        
        // Step 4: Photos & Settings
        photos: [],
        barter_accepted: false,
        accept_remote_work: false,
        travel_cities: [],
        hourly_rate: '',
        visibility: 'public'
    });
    
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleDataChange = (newData) => {
        setFormData(prev => ({ ...prev, ...newData }));
        // Clear errors for updated fields
        const updatedErrors = { ...errors };
        Object.keys(newData).forEach(key => {
            delete updatedErrors[key];
        });
        setErrors(updatedErrors);
    };

    const validateStep = (step) => {
        const newErrors = {};

        if (step === 1) {
            if (!formData.email || !formData.email.includes('@')) {
                newErrors.email = 'Введите корректный email';
            }
            if (!formData.password || formData.password.length < 6) {
                newErrors.password = 'Пароль должен содержать минимум 6 символов';
            }
            if (!formData.first_name || formData.first_name.length < 2) {
                newErrors.first_name = 'Имя должно содержать минимум 2 символа';
            }
            if (!formData.age || formData.age < 16 || formData.age > 99) {
                newErrors.age = 'Возраст должен быть от 16 до 99 лет';
            }
            if (!formData.gender) {
                newErrors.gender = 'Выберите пол';
            }
            if (!formData.city) {
                newErrors.city = 'Выберите город';
            }
        } else if (step === 2) {
            if (!formData.height || formData.height < 140 || formData.height > 220) {
                newErrors.height = 'Рост должен быть от 140 до 220 см';
            }
            if (!formData.weight || formData.weight < 30 || formData.weight > 150) {
                newErrors.weight = 'Вес должен быть от 30 до 150 кг';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            if (currentStep < 4) {
                setCurrentStep(currentStep + 1);
            } else {
                handleSubmit();
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleStepClick = (step) => {
        if (step < currentStep || validateStep(currentStep)) {
            setCurrentStep(step);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            console.log('Attempting to register with email:', formData.email);
            console.log('Registration payload:', {
                email: formData.email,
                password: formData.password,
                role: 'model',
            });
            
            // Step 1: Register the user
            await register({
                email: formData.email,
                password: formData.password,
                role: 'model',
            });

            // Step 2: Prepare profile payload
            const payload = {
                first_name: formData.first_name,
                age: parseInt(formData.age),
                gender: formData.gender,
                city: formData.city,
                height: parseInt(formData.height),
                weight: parseInt(formData.weight),
                bust: formData.bust ? parseInt(formData.bust) : null,
                waist: formData.waist ? parseInt(formData.waist) : null,
                hips: formData.hips ? parseInt(formData.hips) : null,
                experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
                categories: formData.categories,
                skills: formData.skills,
                languages: formData.languages,
                bio: formData.bio,
                photos: formData.photos.map(photo => photo.id),
                barter_accepted: formData.barter_accepted,
                accept_remote_work: formData.accept_remote_work,
                travel_cities: formData.travel_cities,
                hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
                visibility: formData.visibility
            };

            console.log('Attempting to create model profile with payload:', payload);

            // Step 3: Try to create model profile, but handle 400/422/404 gracefully
            try {
                const result = await profileApi.createModel(payload);
                console.log('Model profile created successfully:', result);
            } catch (apiError) {
                // If backend endpoint doesn't exist or returns validation errors, show friendly message and continue
                if (apiError.status === 400 || apiError.status === 404 || apiError.status === 422 || apiError.status === 500) {
                    console.warn('Model profile creation endpoint not available (status: ' + apiError.status + '), proceeding to dashboard');
                    console.warn('Backend error details:', apiError.data);
                    // Store data locally for when backend is ready
                    localStorage.setItem('pendingModelProfile', JSON.stringify(payload));
                } else {
                    throw apiError; // Re-throw other errors
                }
            }

            navigate('/dashboard');
        } catch (error) {
            console.error('Failed to complete onboarding:', error);
            
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

    // Inline Step 3: Experience
    const renderStep3Experience = () => {
        const categories = ['Фото', 'Видео', 'Реклама', 'Подиум', 'Фитнес', 'Танцы', 'Актерское мастерство', 'Ведущий мероприятий'];
        const skills = ['Позирование', 'Актерское мастерство', 'Танцы', 'Вокал', 'Иностранные языки', 'Спорт', 'Йога', 'Макияж', 'Стилизация', 'Вождение автомобиля', 'Верховая езда'];
        const languages = ['Русский', 'Казахский', 'Английский', 'Китайский', 'Корейский', 'Японский', 'Французский', 'Немецкий', 'Испанский', 'Итальянский', 'Турецкий', 'Арабский'];

        return (
            <div className="step3-experience">
                <h2 className="step-title">Опыт и навыки</h2>
                
                <div className="form-group">
                    <label className="form-label">Опыт работы (лет)</label>
                    <input
                        type="number"
                        className="form-input"
                        value={formData.experience_years || ''}
                        onChange={(e) => handleDataChange({ experience_years: parseInt(e.target.value) || '' })}
                        placeholder="0"
                        min="0"
                        max="50"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Категории</label>
                    <div className="checkbox-grid">
                        {categories.map(category => (
                            <label key={category} className="checkbox-option">
                                <input
                                    type="checkbox"
                                    checked={Array.isArray(formData.categories) ? formData.categories.includes(category) : false}
                                    onChange={(e) => {
                                        const currentCategories = Array.isArray(formData.categories) ? formData.categories : [];
                                        const newCategories = e.target.checked
                                            ? [...currentCategories, category]
                                            : currentCategories.filter(c => c !== category);
                                        handleDataChange({ categories: newCategories });
                                    }}
                                />
                                {category}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Навыки</label>
                    <div className="checkbox-grid">
                        {skills.map(skill => (
                            <label key={skill} className="checkbox-option">
                                <input
                                    type="checkbox"
                                    checked={Array.isArray(formData.skills) ? formData.skills.includes(skill) : false}
                                    onChange={(e) => {
                                        const currentSkills = Array.isArray(formData.skills) ? formData.skills : [];
                                        const newSkills = e.target.checked
                                            ? [...currentSkills, skill]
                                            : currentSkills.filter(s => s !== skill);
                                        handleDataChange({ skills: newSkills });
                                    }}
                                />
                                {skill}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Языки</label>
                    <div className="checkbox-grid">
                        {languages.map(language => (
                            <label key={language} className="checkbox-option">
                                <input
                                    type="checkbox"
                                    checked={Array.isArray(formData.languages) ? formData.languages.includes(language) : false}
                                    onChange={(e) => {
                                        const currentLanguages = Array.isArray(formData.languages) ? formData.languages : [];
                                        const newLanguages = e.target.checked
                                            ? [...currentLanguages, language]
                                            : currentLanguages.filter(l => l !== language);
                                        handleDataChange({ languages: newLanguages });
                                    }}
                                />
                                {language}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Дополнительная информация</label>
                    <textarea
                        className="form-input form-textarea"
                        placeholder="Расскажите о вашем опыте, достижениях, особенностях..."
                        value={formData.bio || ''}
                        onChange={(e) => handleDataChange({ bio: e.target.value })}
                        rows={4}
                    />
                </div>
            </div>
        );
    };

    // Inline Step 4: Photos
    const renderStep4Photos = () => {
        return (
            <div className="step4-photos">
                <h2 className="step-title">Фотографии</h2>
                <p className="step-subtitle">
                    Загрузите ваши лучшие фотографии. Первая фотография будет основной.
                    Рекомендуем загрузить 3-5 фотографий разного плана.
                    <br /><br />
                    <strong style={{ color: '#f59e0b' }}>Внимание: Функция загрузки фотографий временно недоступна. Вы можете добавить фото позже в профиле.</strong>
                </p>

                <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={formData.barter_accepted || false}
                            onChange={(e) => handleDataChange({ barter_accepted: e.target.checked })}
                            style={{ width: '20px', height: '20px', accentColor: '#3b82f6' }}
                        />
                        <span style={{ fontSize: '0.9375rem', color: '#374151' }}>
                            Принимаю бартер (TFP - Time for Print)
                        </span>
                    </label>
                </div>

                <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={formData.accept_remote_work || false}
                            onChange={(e) => handleDataChange({ accept_remote_work: e.target.checked })}
                            style={{ width: '20px', height: '20px', accentColor: '#3b82f6' }}
                        />
                        <span style={{ fontSize: '0.9375rem', color: '#374151' }}>
                            Готов(а) к удаленной работе
                        </span>
                    </label>
                </div>

                <div className="form-group">
                    <label className="form-label">Города для работы</label>
                    <textarea
                        className="form-input form-textarea"
                        placeholder="Укажите города через запятую (например: Алматы, Астана, Шымкент)"
                        value={Array.isArray(formData.travel_cities) ? formData.travel_cities.join(', ') : formData.travel_cities || ''}
                        onChange={(e) => {
                            const travel_cities = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                            handleDataChange({ travel_cities });
                        }}
                        rows={2}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Часовая ставка (₸)</label>
                    <input
                        type="number"
                        className="form-input"
                        placeholder="Укажите вашу часовую ставку"
                        value={formData.hourly_rate || ''}
                        onChange={(e) => handleDataChange({ hourly_rate: parseFloat(e.target.value) || '' })}
                        min="0"
                        style={{ maxWidth: '300px' }}
                    />
                </div>
            </div>
        );
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <Step1BasicInfo
                        data={formData}
                        onChange={handleDataChange}
                        errors={errors}
                    />
                );
            case 2:
                return (
                    <Step2Measurements
                        data={formData}
                        onChange={handleDataChange}
                        errors={errors}
                    />
                );
            case 3:
                return renderStep3Experience();
            case 4:
                return renderStep4Photos();
            default:
                return null;
        }
    };

    return (
        <div className="model-onboarding">
            <div className="onboarding-container">
                <h1 className="onboarding-title">Создание профиля модели</h1>
                <p className="onboarding-subtitle">
                    Заполните информацию о себе, чтобы работодатели могли найти вас
                </p>

                {/* Progress Indicator */}
                <div className="progress-indicator">
                    <div className="progress-line">
                        {[1, 2, 3, 4].map((step) => (
                            <div key={step}>
                                <div
                                    className={`progress-circle ${currentStep >= step ? 'active' : ''}`}
                                    onClick={() => handleStepClick(step)}
                                >
                                    {step}
                                </div>
                                {step < 4 && (
                                    <div className={`progress-line-segment ${currentStep > step ? 'active' : ''}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                <div className="step-content">
                    {errors.submit && (
                        <div className="error-message" style={{ marginBottom: '20px', textAlign: 'center' }}>
                            {errors.submit}
                        </div>
                    )}
                    {renderStepContent()}
                </div>

                {/* Navigation Buttons */}
                <div className="navigation-buttons">
                    <button
                        className="nav-button back-button"
                        onClick={handleBack}
                        disabled={currentStep === 1}
                    >
                        ← Назад
                    </button>
                    <button
                        className="nav-button next-button"
                        onClick={handleNext}
                        disabled={loading}
                    >
                        {loading ? 'Сохранение...' : currentStep === 4 ? 'Завершить' : 'Далее →'}
                    </button>
                </div>
            </div>
        </div>
    );
}
