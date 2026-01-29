import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import './ModelFilters.css'

export default function ModelFilters() {
    const [searchParams, setSearchParams] = useSearchParams()
    
    const [filters, setFilters] = useState({
        city: '',
        gender: '',
        age_min: '',
        age_max: '',
        height_min: '',
        height_max: '',
        q: '',
        sort: 'newest',
        specialization: '',
        is_verified: false,
        is_available: false
    })

    // Initialize filters from URL params
    useEffect(() => {
        const params = {}
        for (const [key, value] of searchParams.entries()) {
            if (key === 'is_verified' || key === 'is_available') {
                params[key] = value === 'true'
            } else {
                params[key] = value
            }
        }
        setFilters(prev => ({ ...prev, ...params }))
    }, [searchParams])

    const updateFilter = (key, value) => {
        const newFilters = { ...filters, [key]: value }
        setFilters(newFilters)
        
        // Update URL params
        const params = new URLSearchParams()
        Object.entries(newFilters).forEach(([k, v]) => {
            if (v !== '' && v !== false && v !== null && v !== undefined) {
                params.set(k, v)
            }
        })
        
        setSearchParams(params)
    }

    const resetFilters = () => {
        setFilters({
            city: '',
            gender: '',
            age_min: '',
            age_max: '',
            height_min: '',
            height_max: '',
            q: '',
            sort: 'newest',
            specialization: '',
            is_verified: false,
            is_available: false
        })
        setSearchParams({})
    }

    const hasActiveFilters = Object.entries(filters).some(([key, value]) => 
        key !== 'sort' && value !== '' && value !== false
    )

    const specializations = [
        'Фотомодель', 'Подиум', 'Реклама', 'Кино', 'ТВ', 
        'Музыкальные клипы', 'Показы', 'Event', 'Нарядная модель',
        'Спортивная модель', 'Коммерческая модель', 'Арт-модель'
    ]

    return (
        <div className="model-filters">
            <div className="filters-header">
                <h3>Фильтры моделей</h3>
                {hasActiveFilters && (
                    <button className="reset-btn" onClick={resetFilters}>
                        Сбросить
                    </button>
                )}
            </div>

            <div className="filters-grid">
                {/* Keyword Search */}
                <div className="filter-group">
                    <label>Поиск</label>
                    <input
                        type="text"
                        placeholder="Имя, описание..."
                        value={filters.q}
                        onChange={(e) => updateFilter('q', e.target.value)}
                        className="filter-input"
                    />
                </div>

                {/* City */}
                <div className="filter-group">
                    <label>Город</label>
                    <select
                        value={filters.city}
                        onChange={(e) => updateFilter('city', e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Все города</option>
                        <option value="Алматы">Алматы</option>
                        <option value="Астана">Астана</option>
                        <option value="Шымкент">Шымкент</option>
                        <option value="Караганда">Караганда</option>
                        <option value="Актау">Актау</option>
                        <option value="Павлодар">Павлодар</option>
                    </select>
                </div>

                {/* Gender */}
                <div className="filter-group">
                    <label>Пол</label>
                    <select
                        value={filters.gender}
                        onChange={(e) => updateFilter('gender', e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Любой</option>
                        <option value="male">Мужской</option>
                        <option value="female">Женский</option>
                    </select>
                </div>

                {/* Specialization */}
                <div className="filter-group">
                    <label>Специализация</label>
                    <select
                        value={filters.specialization}
                        onChange={(e) => updateFilter('specialization', e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Все специализации</option>
                        {specializations.map(spec => (
                            <option key={spec} value={spec}>{spec}</option>
                        ))}
                    </select>
                </div>

                {/* Age Range */}
                <div className="filter-group">
                    <label>Возраст</label>
                    <div className="range-inputs">
                        <input
                            type="number"
                            placeholder="От"
                            value={filters.age_min}
                            onChange={(e) => updateFilter('age_min', e.target.value)}
                            className="filter-input small"
                            min="14"
                            max="100"
                        />
                        <span className="range-separator">-</span>
                        <input
                            type="number"
                            placeholder="До"
                            value={filters.age_max}
                            onChange={(e) => updateFilter('age_max', e.target.value)}
                            className="filter-input small"
                            min="14"
                            max="100"
                        />
                    </div>
                </div>

                {/* Height Range */}
                <div className="filter-group">
                    <label>Рост (см)</label>
                    <div className="range-inputs">
                        <input
                            type="number"
                            placeholder="От"
                            value={filters.height_min}
                            onChange={(e) => updateFilter('height_min', e.target.value)}
                            className="filter-input small"
                            min="140"
                            max="220"
                        />
                        <span className="range-separator">-</span>
                        <input
                            type="number"
                            placeholder="До"
                            value={filters.height_max}
                            onChange={(e) => updateFilter('height_max', e.target.value)}
                            className="filter-input small"
                            min="140"
                            max="220"
                        />
                    </div>
                </div>

                {/* Sort */}
                <div className="filter-group">
                    <label>Сортировка</label>
                    <select
                        value={filters.sort}
                        onChange={(e) => updateFilter('sort', e.target.value)}
                        className="filter-select"
                    >
                        <option value="newest">Сначала новые</option>
                        <option value="rating">По рейтингу</option>
                        <option value="popular">Популярные</option>
                        <option value="views">По просмотрам</option>
                        <option value="name">По имени</option>
                    </select>
                </div>

                {/* Checkboxes */}
                <div className="filter-group checkbox-group">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={filters.is_verified}
                            onChange={(e) => updateFilter('is_verified', e.target.checked)}
                            className="filter-checkbox"
                        />
                        Только проверенные
                    </label>
                    
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={filters.is_available}
                            onChange={(e) => updateFilter('is_available', e.target.checked)}
                            className="filter-checkbox"
                        />
                        Доступны для работы
                    </label>
                </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
                <div className="active-filters">
                    <span className="active-filters-label">Активные фильтры:</span>
                    <div className="active-filters-list">
                        {filters.city && (
                            <span className="active-filter-tag">
                                Город: {filters.city}
                                <button onClick={() => updateFilter('city', '')}>×</button>
                            </span>
                        )}
                        {filters.gender && (
                            <span className="active-filter-tag">
                                Пол: {filters.gender === 'male' ? 'Мужской' : 'Женский'}
                                <button onClick={() => updateFilter('gender', '')}>×</button>
                            </span>
                        )}
                        {filters.specialization && (
                            <span className="active-filter-tag">
                                Специализация: {filters.specialization}
                                <button onClick={() => updateFilter('specialization', '')}>×</button>
                            </span>
                        )}
                        {filters.age_min && (
                            <span className="active-filter-tag">
                                Возраст от: {filters.age_min}
                                <button onClick={() => updateFilter('age_min', '')}>×</button>
                            </span>
                        )}
                        {filters.age_max && (
                            <span className="active-filter-tag">
                                Возраст до: {filters.age_max}
                                <button onClick={() => updateFilter('age_max', '')}>×</button>
                            </span>
                        )}
                        {filters.height_min && (
                            <span className="active-filter-tag">
                                Рост от: {filters.height_min} см
                                <button onClick={() => updateFilter('height_min', '')}>×</button>
                            </span>
                        )}
                        {filters.height_max && (
                            <span className="active-filter-tag">
                                Рост до: {filters.height_max} см
                                <button onClick={() => updateFilter('height_max', '')}>×</button>
                            </span>
                        )}
                        {filters.q && (
                            <span className="active-filter-tag">
                                Поиск: {filters.q}
                                <button onClick={() => updateFilter('q', '')}>×</button>
                            </span>
                        )}
                        {filters.is_verified && (
                            <span className="active-filter-tag">
                                Проверенные
                                <button onClick={() => updateFilter('is_verified', false)}>×</button>
                            </span>
                        )}
                        {filters.is_available && (
                            <span className="active-filter-tag">
                                Доступны
                                <button onClick={() => updateFilter('is_available', false)}>×</button>
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
