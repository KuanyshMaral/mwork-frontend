import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './Step3Experience.css';

/**
 * Step3Experience - Experience and skills form for model onboarding
 * @param {Object} props
 * @param {Object} props.data - Current form data
 * @param {Function} props.onChange - Update form data callback
 * @param {Object} props.errors - Validation errors
 */
export default function Step3Experience({ data, onChange, errors }) {
    const [touched, setTouched] = useState({});

    const handleInputChange = (field, value) => {
        onChange({ [field]: value });
    };

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const handleArrayChange = (field, value) => {
        const arrayValue = value.split(',').map(item => item.trim()).filter(item => item);
        onChange({ [field]: arrayValue });
    };

    const categories = [
        'Фото', 'Видео', 'Реклама', 'Подиум', 'Фитнес', 
        'Танцы', 'Актерское мастерство', 'Ведущий мероприятий'
    ];

    const skills = [
        'Позирование', 'Актерское мастерство', 'Танцы', 'Вокал',
        'Иностранные языки', 'Спорт', 'Йога', 'Макияж',
        'Стилизация', 'Вождение автомобиля', 'Верховая езда'
    ];

    const languages = [
        'Русский', 'Казахский', 'Английский', 'Китайский',
        'Корейский', 'Японский', 'Французский', 'Немецкий',
        'Испанский', 'Итальянский', 'Турецкий', 'Арабский'
    ];

    return (
        <div className="step3-experience">
            <h2 className="step-title">Опыт и навыки</h2>
            
            <div className="form-group">
                <label htmlFor="experience_years" className="form-label">
                    Опыт работы (лет)
                </label>
                <input
                    type="number"
                    id="experience_years"
                    className={`form-input ${errors.experience_years && touched.experience_years ? 'error' : ''}`}
                    value={data.experience_years || ''}
                    onChange={(e) => handleInputChange('experience_years', parseInt(e.target.value) || '')}
                    onBlur={() => handleBlur('experience_years')}
                    placeholder="0"
                    min="0"
                    max="50"
                />
                {errors.experience_years && touched.experience_years && (
                    <span className="error-message">{errors.experience_years}</span>
                )}
            </div>

            <div className="form-group">
                <label className="form-label">Категории</label>
                <div className="checkbox-grid">
                    {categories.map(category => (
                        <label key={category} className="checkbox-option">
                            <input
                                type="checkbox"
                                checked={Array.isArray(data.categories) ? data.categories.includes(category) : false}
                                onChange={(e) => {
                                    const currentCategories = Array.isArray(data.categories) ? data.categories : [];
                                    const newCategories = e.target.checked
                                        ? [...currentCategories, category]
                                        : currentCategories.filter(c => c !== category);
                                    handleInputChange('categories', newCategories);
                                }}
                            />
                            <span className="checkmark"></span>
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
                                checked={Array.isArray(data.skills) ? data.skills.includes(skill) : false}
                                onChange={(e) => {
                                    const currentSkills = Array.isArray(data.skills) ? data.skills : [];
                                    const newSkills = e.target.checked
                                        ? [...currentSkills, skill]
                                        : currentSkills.filter(s => s !== skill);
                                    handleInputChange('skills', newSkills);
                                }}
                            />
                            <span className="checkmark"></span>
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
                                checked={Array.isArray(data.languages) ? data.languages.includes(language) : false}
                                onChange={(e) => {
                                    const currentLanguages = Array.isArray(data.languages) ? data.languages : [];
                                    const newLanguages = e.target.checked
                                        ? [...currentLanguages, language]
                                        : currentLanguages.filter(l => l !== language);
                                    handleInputChange('languages', newLanguages);
                                }}
                            />
                            <span className="checkmark"></span>
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
                    value={data.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                />
            </div>
        </div>
    );
}

Step3Experience.propTypes = {
    data: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    errors: PropTypes.object,
};
