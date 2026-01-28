import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { photoApi } from '../../api/client';
import './PhotoEditModal.css';

/**
 * PhotoEditModal - Edit photo metadata
 * @param {Object} props
 * @param {Object} props.photo - Photo object to edit
 * @param {Function} props.onClose - Close modal callback
 * @param {Function} props.onSave - Save callback with updated photo
 */
export default function PhotoEditModal({ photo, onClose, onSave }) {
    const [formData, setFormData] = useState({
        caption: '',
        project_name: '',
        brand: '',
        year: '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (photo) {
            setFormData({
                caption: photo.caption || '',
                project_name: photo.project_name || '',
                brand: photo.brand || '',
                year: photo.year || '',
            });
        }
    }, [photo]);

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        setError(null);
        setIsSaving(true);
        try {
            // Validate (Simple example)
            if (formData.caption.length > 2000) throw new Error("Caption too long");
            
            // Assuming photoApi.update exists as per instructions, or similar update method
            const updatedPhoto = await photoApi.update(photo.id, formData);
            
            onSave(updatedPhoto);
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to save changes');
        } finally {
            setIsSaving(false);
        }
    };

    if (!photo) return null;

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-container">
                <div className="modal-header">
                    <span>Редактировать фото</span>
                    <span className="close-button" onClick={onClose}>✕</span>
                </div>

                <div className="modal-body">
                    <img 
                        src={photo.url || photo.image_url} // Fallback if url property differs
                        alt="Preview" 
                        className="image-preview" 
                    />

                    <div className="form-group">
                        <label className="input-label">Описание</label>
                        <textarea
                            name="caption"
                            value={formData.caption}
                            onChange={handleChange}
                            maxLength={2000}
                            placeholder="Описание фото"
                            className="modal-input"
                            rows={3}
                        />
                    </div>

                    <div className="form-group">
                        <label className="input-label">Проект</label>
                        <input
                            type="text"
                            name="project_name"
                            value={formData.project_name}
                            onChange={handleChange}
                            maxLength={200}
                            placeholder="Название проекта"
                            className="modal-input"
                        />
                    </div>

                    <div className="form-group">
                        <label className="input-label">Бренд</label>
                        <input
                            type="text"
                            name="brand"
                            value={formData.brand}
                            onChange={handleChange}
                            maxLength={200}
                            placeholder="Бренд"
                            className="modal-input"
                        />
                    </div>

                    <div className="form-group">
                        <label className="input-label">Год</label>
                        <input
                            type="number"
                            name="year"
                            value={formData.year}
                            onChange={handleChange}
                            min="1900"
                            max="2100"
                            placeholder="Год съемки"
                            className="modal-input"
                        />
                    </div>
                    
                    {error && <div className="error-message">{error}</div>}
                </div>

                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onClose} disabled={isSaving}>
                        Отмена
                    </button>
                    <button className="btn-save" onClick={handleSubmit} disabled={isSaving}>
                        {isSaving ? 'Сохранение...' : 'Сохранить →'}
                    </button>
                </div>
            </div>
        </div>
    );
}

PhotoEditModal.propTypes = {
    photo: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
};