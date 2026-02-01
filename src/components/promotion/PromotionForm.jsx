import { useState } from 'react'
import BudgetSelector from './BudgetSelector'
import './PromotionForm.css'

export default function PromotionForm({ onSubmit, loading = false }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        target_audience: 'all',
        budget_type: 'daily',
        daily_budget: 100,
        total_budget: 1000,
        duration_days: 7,
        auto_activate: true
    })

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleBudgetChange = (budgetData) => {
        setFormData(prev => ({
            ...prev,
            ...budgetData
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        onSubmit(formData)
    }

    return (
        <form onSubmit={handleSubmit} className="promotion-form">
            <div className="form-section">
                <h3>Основная информация</h3>
                
                <div className="form-group">
                    <label htmlFor="title">Название кампании *</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        placeholder="Например: Продвижение профиля модели"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Описание</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Опишите вашу рекламную кампанию"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="target_audience">Целевая аудитория</label>
                    <select
                        id="target_audience"
                        name="target_audience"
                        value={formData.target_audience}
                        onChange={handleChange}
                    >
                        <option value="all">Все пользователи</option>
                        <option value="employers">Только работодатели</option>
                        <option value="agencies">Только агентства</option>
                        <option value="models">Только модели</option>
                    </select>
                </div>
            </div>

            <div className="form-section">
                <h3>Бюджет и длительность</h3>
                <BudgetSelector 
                    budgetType={formData.budget_type}
                    dailyBudget={formData.daily_budget}
                    totalBudget={formData.total_budget}
                    durationDays={formData.duration_days}
                    onChange={handleBudgetChange}
                />
            </div>

            <div className="form-section">
                <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            name="auto_activate"
                            checked={formData.auto_activate}
                            onChange={handleChange}
                        />
                        <span className="checkmark"></span>
                        Активировать кампанию сразу после создания
                    </label>
                </div>
            </div>

            <div className="form-actions">
                <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading || !formData.title.trim()}
                >
                    {loading ? 'Создание...' : 'Создать кампанию'}
                </button>
            </div>
        </form>
    )
}
