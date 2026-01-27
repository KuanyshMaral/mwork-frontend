import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './AgencyOnboarding.css';

/**
 * AgencyOnboarding - Form for agency-specific registration data
 * @param {Object} props
 * @param {Function} props.onSubmit - Callback with form data
 */
export default function AgencyOnboarding({ onSubmit }) {
    const [formData, setFormData] = useState({
        company_name: '',
        website: '',
        contact_person: '',
        instagram: '',
    });
    
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateField = (name, value) => {
        const newErrors = { ...errors };
        delete newErrors[name];

        switch (name) {
            case 'company_name':
                if (!value.trim()) {
                    newErrors[name] = 'Название компании обязательно';
                } else if (value.trim().length < 2) {
                    newErrors[name] = 'Минимум 2 символа';
                }
                break;
            case 'contact_person':
                if (!value.trim()) {
                    newErrors[name] = 'Контактное лицо обязательно';
                } else if (value.trim().length < 2) {
                    newErrors[name] = 'Минимум 2 символа';
                }
                break;
            case 'website':
                if (value && !isValidUrl(value)) {
                    newErrors[name] = 'Неверный формат URL';
                }
                break;
        }

        setErrors(newErrors);
        return !newErrors[name];
    };

    const isValidUrl = (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        validateField(name, value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Validate all fields
        let isValid = true;
        const newErrors = {};

        if (!formData.company_name.trim()) {
            newErrors.company_name = 'Название компании обязательно';
            isValid = false;
        } else if (formData.company_name.trim().length < 2) {
            newErrors.company_name = 'Минимум 2 символа';
            isValid = false;
        }

        if (!formData.contact_person.trim()) {
            newErrors.contact_person = 'Контактное лицо обязательно';
            isValid = false;
        } else if (formData.contact_person.trim().length < 2) {
            newErrors.contact_person = 'Минимум 2 символа';
            isValid = false;
        }

        if (formData.website && !isValidUrl(formData.website)) {
            newErrors.website = 'Неверный формат URL';
            isValid = false;
        }

        setErrors(newErrors);

        if (isValid) {
            await onSubmit(formData);
        }

        setIsSubmitting(false);
    };

    return (
        <div className="agency-onboarding">
            <h2 className="agency-onboarding__title">Информация об агентстве</h2>
            
            <form onSubmit={handleSubmit} className="agency-onboarding__form">
                <div className="form-group">
                    <label htmlFor="company_name" className="form-label">
                        Название компании <span className="required">*</span>
                    </label>
                    <input
                        type="text"
                        id="company_name"
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="ООО 'Модельное агентство'"
                        className={`form-input ${errors.company_name ? 'error' : ''}`}
                        disabled={isSubmitting}
                    />
                    {errors.company_name && (
                        <span className="error-message">{errors.company_name}</span>
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
                        value={formData.website}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="https://example.com"
                        className={`form-input ${errors.website ? 'error' : ''}`}
                        disabled={isSubmitting}
                    />
                    {errors.website && (
                        <span className="error-message">{errors.website}</span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="contact_person" className="form-label">
                        Контактное лицо <span className="required">*</span>
                    </label>
                    <input
                        type="text"
                        id="contact_person"
                        name="contact_person"
                        value={formData.contact_person}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="Иван Иванов"
                        className={`form-input ${errors.contact_person ? 'error' : ''}`}
                        disabled={isSubmitting}
                    />
                    {errors.contact_person && (
                        <span className="error-message">{errors.contact_person}</span>
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
                        value={formData.instagram}
                        onChange={handleInputChange}
                        placeholder="@agency_name"
                        className="form-input"
                        disabled={isSubmitting}
                    />
                </div>

                <button
                    type="submit"
                    className="submit-button"
                    disabled={isSubmitting}
                >
                    Продолжить →
                </button>
            </form>
        </div>
    );
}

AgencyOnboarding.propTypes = {
    onSubmit: PropTypes.func.isRequired,
};
