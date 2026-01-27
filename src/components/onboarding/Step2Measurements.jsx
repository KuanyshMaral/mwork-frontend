import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './Step2Measurements.css';

/**
 * Step2Measurements - Body measurements form
 * @param {Object} props
 * @param {Object} props.data - Current form data
 * @param {Function} props.onChange - Update callback
 * @param {Object} props.errors - Validation errors
 */
export default function Step2Measurements({ data, onChange, errors }) {
    const [touched, setTouched] = useState({});

    const handleInputChange = (field, value) => {
        onChange({ [field]: value });
    };

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const measurementFields = [
        {
            id: 'height',
            label: 'Рост (см)*',
            placeholder: 'Введите рост',
            min: 140,
            max: 220,
            required: true
        },
        {
            id: 'weight',
            label: 'Вес (кг)*',
            placeholder: 'Введите вес',
            min: 30,
            max: 150,
            required: true
        },
        {
            id: 'bust',
            label: 'Грудь (см)',
            placeholder: 'Введите обхват груди',
            min: 60,
            max: 150,
            required: false
        },
        {
            id: 'waist',
            label: 'Талия (см)',
            placeholder: 'Введите обхват талии',
            min: 40,
            max: 120,
            required: false
        },
        {
            id: 'hips',
            label: 'Бедра (см)',
            placeholder: 'Введите обхват бедер',
            min: 60,
            max: 150,
            required: false
        }
    ];

    return (
        <div className="step2-measurements">
            <h2 className="step-title">Параметры</h2>
            
            <div className="measurements-grid">
                {measurementFields.map((field) => (
                    <div key={field.id} className="form-group">
                        <label htmlFor={field.id} className="form-label">
                            {field.label}
                        </label>
                        <input
                            type="number"
                            id={field.id}
                            className={`form-input ${errors[field.id] && touched[field.id] ? 'error' : ''}`}
                            value={data[field.id] || ''}
                            onChange={(e) => handleInputChange(field.id, parseInt(e.target.value) || '')}
                            onBlur={() => handleBlur(field.id)}
                            placeholder={field.placeholder}
                            min={field.min}
                            max={field.max}
                            required={field.required}
                        />
                        {errors[field.id] && touched[field.id] && (
                            <span className="error-message">{errors[field.id]}</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

Step2Measurements.propTypes = {
    data: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    errors: PropTypes.object,
};
