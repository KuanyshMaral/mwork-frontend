import React, { useState } from 'react';
import PropTypes from 'prop-types';
import PhotoUpload from '../photos/PhotoUpload.jsx';
import './Step4Photos.css';

/**
 * Step4Photos - Photo upload step for model onboarding
 * @param {Object} props
 * @param {Object} props.data - Current form data
 * @param {Function} props.onChange - Update form data callback
 * @param {Object} props.errors - Validation errors
 */
export default function Step4Photos({ data, onChange, errors }) {
    const [uploading, setUploading] = useState(false);

    const handlePhotoUpload = async (photo) => {
        try {
            const currentPhotos = Array.isArray(data.photos) ? data.photos : [];
            const newPhotos = [...currentPhotos, photo];
            onChange({ photos: newPhotos });
        } catch (error) {
            console.error('Upload failed:', error);
            // Show user-friendly error message
            alert('Функция загрузки фотографий временно недоступна. Вы можете завершить регистрацию и добавить фото позже в профиле.');
        }
    };

    const removePhoto = (index) => {
        const currentPhotos = Array.isArray(data.photos) ? data.photos : [];
        const newPhotos = currentPhotos.filter((_, i) => i !== index);
        onChange({ photos: newPhotos });
    };

    const setMainPhoto = (index) => {
        const currentPhotos = Array.isArray(data.photos) ? data.photos : [];
        if (currentPhotos.length > 0) {
            const newPhotos = [currentPhotos[index], ...currentPhotos.filter((_, i) => i !== index)];
            onChange({ photos: newPhotos });
        }
    };

    const photos = Array.isArray(data.photos) ? data.photos : [];

    return (
        <div className="step4-photos">
            <h2 className="step-title">Фотографии</h2>
            <p className="step-subtitle">
                Загрузите ваши лучшие фотографии. Первая фотография будет основной.
                Рекомендуем загрузить 3-5 фотографий разного плана.
                <br /><br />
                <strong style={{ color: '#f59e0b' }}>Внимание: Функция загрузки фотографий временно недоступна. Вы можете добавить фото позже в профиле.</strong>
            </p>

            <div className="photos-grid">
                {photos.map((photo, index) => (
                    <div key={photo.id || index} className="photo-item">
                        <img 
                            src={photo.url} 
                            alt={`Фото ${index + 1}`}
                            className="photo-preview"
                        />
                        <div className="photo-controls">
                            <button
                                type="button"
                                className={`photo-btn ${index === 0 ? 'main' : ''}`}
                                onClick={() => setMainPhoto(index)}
                                disabled={index === 0}
                            >
                                {index === 0 ? 'Основное' : 'Сделать основным'}
                            </button>
                            <button
                                type="button"
                                className="photo-btn remove"
                                onClick={() => removePhoto(index)}
                            >
                                Удалить
                            </button>
                        </div>
                    </div>
                ))}

                {/* Temporarily disable photo upload */}
                <div className="photo-upload-item" style={{ 
                    opacity: 0.5, 
                    pointerEvents: 'none',
                    position: 'relative'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255,255,255,0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        textAlign: 'center',
                        padding: '16px'
                    }}>
                        Загрузка временно недоступна
                    </div>
                    <PhotoUpload onUploadComplete={handlePhotoUpload} />
                </div>
            </div>

            {photos.length === 0 && (
                <div className="upload-hint">
                    <strong>Рекомендации:</strong>
                    <ul>
                        <li>Загрузите хотя бы 1 фотографию</li>
                        <li>Используйте качественные фото без фильтров</li>
                        <li>Включите фото разного плана: портрет, в полный рост, деловой стиль</li>
                        <li>Первая фотография будет основной в вашем профиле</li>
                    </ul>
                </div>
            )}

            {errors.photos && (
                <div className="error-message">{errors.photos}</div>
            )}

            <div className="form-group" style={{ marginTop: '32px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={data.barter_accepted || false}
                        onChange={(e) => onChange({ barter_accepted: e.target.checked })}
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
                        checked={data.accept_remote_work || false}
                        onChange={(e) => onChange({ accept_remote_work: e.target.checked })}
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
                    value={Array.isArray(data.travel_cities) ? data.travel_cities.join(', ') : data.travel_cities || ''}
                    onChange={(e) => {
                        const travel_cities = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                        onChange({ travel_cities });
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
                    value={data.hourly_rate || ''}
                    onChange={(e) => handleInputChange('hourly_rate', parseFloat(e.target.value) || '')}
                    min="0"
                    style={{ maxWidth: '300px' }}
                />
            </div>
        </div>
    );
}

Step4Photos.propTypes = {
    data: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    errors: PropTypes.object,
};
