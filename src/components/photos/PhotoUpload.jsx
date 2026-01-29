import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { uploadApi } from '../../api/client';
import './PhotoUpload.css';

/**
 * PhotoUpload - 2-phase upload component (init -> direct R2 upload -> confirm)
 * @param {Object} props
 * @param {Function} props.onUploadComplete - Callback with uploaded photo data
 */
export default function PhotoUpload({ onUploadComplete }) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const uploadToR2 = (url, file, onProgress) => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    onProgress(Math.round((e.loaded / e.total) * 100));
                }
            };
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve();
                } else {
                    reject(new Error('Upload failed'));
                }
            };
            xhr.onerror = () => reject(new Error('Upload failed'));
            xhr.open('PUT', url);
            xhr.setRequestHeader('Content-Type', file.type);
            xhr.send(file);
        });
    };

    const handleFileSelect = async (file) => {
        if (!file) return;

        // Validation (basic check based on text, more can be added)
        const validTypes = ['image/jpeg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            alert('Only JPG and PNG files are allowed.');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB.');
            return;
        }

        try {
            setUploading(true);
            setProgress(0);

            // Phase 1: Init upload
            const { upload_id, upload_url } = await uploadApi.init({
                file_name: file.name,
                content_type: file.type,
                file_size: file.size,
            });

            // Phase 2: Direct upload to R2
            await uploadToR2(upload_url, file, (percent) => {
                setProgress(percent);
            });

            // Phase 3: Confirm upload
            const photo = await uploadApi.confirm({ upload_id });

            onUploadComplete(photo);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
            setProgress(0);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const handleClick = () => {
        fileInputRef.current.click();
    };

    return (
        <div 
            className={`photo-upload-container ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={handleClick}
        >
            <div className="upload-content">
                <div className="upload-icon">📷</div>
                <div className="upload-label">
                    Нажмите для загрузки<br />или перетащите файл
                </div>
                <div className="upload-helper">
                    JPG, PNG до 10 МБ
                </div>

                {uploading && (
                    <div className="progress-container" onClick={(e) => e.stopPropagation()}>
                        <div className="progress-bar">
                            <div 
                                className="progress-fill" 
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <div className="progress-text">{progress}%</div>
                    </div>
                )}
                
                <input 
                    ref={fileInputRef}
                    type="file" 
                    hidden 
                    accept="image/jpeg,image/png"
                    onChange={handleChange}
                />
            </div>
        </div>
    );
}

PhotoUpload.propTypes = {
    onUploadComplete: PropTypes.func.isRequired,
};