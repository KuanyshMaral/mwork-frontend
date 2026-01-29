import { useState, useRef } from 'react'
import { uploadApi, chatApi } from '../../api/client'
import './ChatImageUpload.css'

export default function ChatImageUpload({ roomId, onMessageSent }) {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')
    const fileInputRef = useRef(null)

    async function handleFileSelect(e) {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            setError('Только изображения')
            return
        }

        if (file.size > 10 * 1024 * 1024) {
            setError('Максимум 10MB')
            return
        }

        setUploading(true)
        setError('')

        try {
            const initData = await uploadApi.init({
                file_name: file.name,
                content_type: file.type,
                file_size: file.size,
            })

            await fetch(initData.upload_url, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type },
            })

            const confirmed = await uploadApi.confirm({ upload_id: initData.upload_id })

            await chatApi.sendMessage(roomId, confirmed.url, 'image')
            
            if (onMessageSent) {
                onMessageSent()
            }
        } catch (err) {
            console.error('Image upload failed:', err)
            setError('Ошибка загрузки')
        } finally {
            setUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    function handleClick() {
        fileInputRef.current?.click()
    }

    return (
        <div className="chat-image-upload">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                hidden
            />
            <button
                type="button"
                className="upload-btn"
                onClick={handleClick}
                disabled={uploading}
                title="Отправить изображение"
            >
                {uploading ? (
                    <span className="upload-spinner">⏳</span>
                ) : (
                    <span className="upload-icon">📷</span>
                )}
            </button>
            {error && <span className="upload-error">{error}</span>}
        </div>
    )
}
