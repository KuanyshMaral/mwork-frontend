import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { uploadApi } from '../../api/client';
import './VideoUpload.css';

/**
 * VideoUpload - 2-phase upload component for video files (init -> direct R2 upload -> confirm)
 * @param {Object} props
 * @param {Function} props.onUploadComplete - Callback with uploaded video data
 * @param {number} [props.maxSizeMB=100] - Maximum file size in MB
 */
export default function VideoUpload({ onUploadComplete, maxSizeMB = 100 }) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);
    const videoPreviewRef = useRef(null);

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
        setError('');

        // MIME validation: video/*
        if (!file.type.startsWith('video/')) {
            setError('Только видео файлы разрешены (MP4, MOV, AVI, WebM).');
            return;
        }

        // Size validation
        if (file.size > maxSizeMB * 1024 * 1024) {
            setError(`Размер файла не должен превышать ${maxSizeMB} МБ.`);
            return;
        }

        // Generate local preview
        const localUrl = URL.createObjectURL(file);
        setPreviewUrl(localUrl);

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
            const video = await uploadApi.confirm({ upload_id });

            onUploadComplete(video);
        } catch (err) {
            console.error('Video upload failed:', err);
            setError('Ошибка загрузки. Попробуйте ещё раз.');
            setPreviewUrl(null);
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
        if (!uploading) {
            fileInputRef.current.click();
        }
    };

    const clearPreview = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setError('');
    };

    return (
        <div className="video-upload-wrapper">
            <div
                className={`video-upload-container ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                <div className="upload-content">
                    <div className="upload-icon">🎬</div>
                    <div className="upload-label">
                        Нажмите для загрузки видео<br />или перетащите файл
                    </div>
                    <div className="upload-helper">
                        MP4, MOV, AVI, WebM до {maxSizeMB} МБ
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
                        accept="video/*"
                        onChange={handleChange}
                    />
                </div>
            </div>

            {error && (
                <div className="video-upload-error">{error}</div>
            )}

            {previewUrl && !uploading && (
                <div className="video-preview-container">
                    <video
                        ref={videoPreviewRef}
                        src={previewUrl}
                        controls
                        className="video-preview-player"
                    />
                    <button
                        type="button"
                        className="video-preview-remove"
                        onClick={(e) => {
                            e.stopPropagation();
                            clearPreview();
                        }}
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
}

VideoUpload.propTypes = {
    onUploadComplete: PropTypes.func.isRequired,
    maxSizeMB: PropTypes.number,
};
