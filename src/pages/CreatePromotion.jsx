import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { promotionApi } from '../api/client'
import PromotionForm from '../components/promotion/PromotionForm'
import './CreatePromotion.css'

export default function CreatePromotion() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (formData) => {
        setLoading(true)
        setError('')
        
        try {
            const promotion = await promotionApi.create(formData)
            setSuccess(true)
            
            // Auto-activate promotion if requested
            if (formData.auto_activate) {
                await promotionApi.activate(promotion.id)
            }
            
            setTimeout(() => {
                navigate('/advertising')
            }, 2000)
            
        } catch (err) {
            console.error('Failed to create promotion:', err)
            setError(err.message || 'Failed to create promotion')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="success-message">
                <h2>✅ Продвижение успешно создано!</h2>
                <p>Перенаправляем на страницу рекламных кампаний...</p>
            </div>
        )
    }

    return (
        <div className="create-promotion-page">
            <div className="page-header">
                <h1>Создать рекламную кампанию</h1>
                <p>Продвигайте свой профиль и привлекайте больше клиентов</p>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <PromotionForm 
                onSubmit={handleSubmit}
                loading={loading}
            />
        </div>
    )
}
