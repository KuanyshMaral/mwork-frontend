import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './Step1BasicInfo.css';

/**
 * Step1BasicInfo - Basic profile information form
 * @param {Object} props
 * @param {Object} props.data - Current form data
 * @param {Function} props.onChange - Update form data callback
 * @param {Object} props.errors - Validation errors
 */
export default function Step1BasicInfo({ data, onChange, errors }) {
    const [touched, setTouched] = useState({});

    const handleInputChange = (field, value) => {
        onChange({ [field]: value });
    };

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const cities = [
        { value: 'almaty', label: 'Алматы' },
        { value: 'astana', label: 'Астана' },
        { value: 'shymkent', label: 'Шымкент' },
        { value: 'other', label: 'Другой' }
    ];

    return (
        <div className="step1-basic-info">
            <h2 className="step-title">Основная информация</h2>
            
            <div className="form-group">
                <label htmlFor="first_name" className="form-label">
                    Имя*
                </label>
                <input
                    type="text"
                    id="first_name"
                    className={`form-input ${errors.first_name && touched.first_name ? 'error' : ''}`}
                    value={data.first_name || ''}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    onBlur={() => handleBlur('first_name')}
                    placeholder="Введите ваше имя"
                />
                {errors.first_name && touched.first_name && (
                    <span className="error-message">{errors.first_name}</span>
                )}
            </div>

            <div className="form-group">
                <label htmlFor="age" className="form-label">
                    Возраст*
                </label>
                <input
                    type="number"
                    id="age"
                    className={`form-input ${errors.age && touched.age ? 'error' : ''}`}
                    value={data.age || ''}
                    onChange={(e) => handleInputChange('age', parseInt(e.target.value) || '')}
                    onBlur={() => handleBlur('age')}
                    placeholder="Введите ваш возраст"
                    min="16"
                    max="99"
                />
                {errors.age && touched.age && (
                    <span className="error-message">{errors.age}</span>
                )}
            </div>

            <div className="form-group">
                <label className="form-label">
                    Пол*
                </label>
                <div className="radio-group">
                    <label className="radio-option">
                        <input
                            type="radio"
                            name="gender"
                            value="female"
                            checked={data.gender === 'female'}
                            onChange={(e) => handleInputChange('gender', e.target.value)}
                            onBlur={() => handleBlur('gender')}
                        />
                        <span className="radio-custom"></span>
                        Женский
                    </label>
                    <label className="radio-option">
                        <input
                            type="radio"
                            name="gender"
                            value="male"
                            checked={data.gender === 'male'}
                            onChange={(e) => handleInputChange('gender', e.target.value)}
                            onBlur={() => handleBlur('gender')}
                        />
                        <span className="radio-custom"></span>
                        Мужской
                    </label>
                </div>
                {errors.gender && touched.gender && (
                    <span className="error-message">{errors.gender}</span>
                )}
            </div>

            <div className="form-group">
                <label htmlFor="city" className="form-label">
                    Город*
                </label>
                <select
                    id="city"
                    className={`form-input ${errors.city && touched.city ? 'error' : ''}`}
                    value={data.city || ''}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    onBlur={() => handleBlur('city')}
                >
                    <option value="">Выберите город</option>
                    {cities.map(city => (
                        <option key={city.value} value={city.value}>
                            {city.label}
                        </option>
                    ))}
                </select>
                {errors.city && touched.city && (
                    <span className="error-message">{errors.city}</span>
                )}
            </div>
        </div>
    );
}

Step1BasicInfo.propTypes = {
    data: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    errors: PropTypes.object,
};
