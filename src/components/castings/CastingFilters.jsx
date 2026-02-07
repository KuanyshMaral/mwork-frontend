import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import './CastingFilters.css'

export default function CastingFilters() {
    const [searchParams, setSearchParams] = useSearchParams()
    const navigate = useNavigate()
    
    const [filters, setFilters] = useState({
        city: '',
        gender: '',
        age_min: '',
        age_max: '',
        pay_min: '',
        pay_max: '',
        q: '',
        sort: 'newest',
        status: 'active'
    })

    // Initialize filters from URL params
    useEffect(() => {
        const params = {}
        for (const [key, value] of searchParams.entries()) {
            params[key] = value
        }
        setFilters(prev => ({ ...prev, ...params }))
    }, [searchParams])

    const updateFilter = (key, value) => {
        const newFilters = { ...filters, [key]: value }
        setFilters(newFilters)
        
        // Update URL params
        const params = new URLSearchParams()
        Object.entries(newFilters).forEach(([k, v]) => {
            if (v && v !== '') {
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
            pay_min: '',
            pay_max: '',
            q: '',
            sort: 'newest',
            status: 'active'
        })
        setSearchParams({ status: 'active' })
    }

    const hasActiveFilters = Object.entries(filters).some(([key, value]) => 
        key !== 'sort' && value !== ''
    )

    return (
        <div className="casting-filters">
            <div className="filters-header">
                <h3>Фильтры</h3>
                <button className="reset-btn" onClick={resetFilters}>
                    Сбросить
                </button>
            </div>

            <div className="filters-grid">
                {/* Keyword Search */}
                <div className="filter-group">
                    <label>Поиск</label>
                    <input
                        type="text"
                        placeholder="Ключевые слова..."
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
                        <option value="any">Любой</option>
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

                {/* Pay Range */}
                <div className="filter-group">
                    <label>Оплата (₸)</label>
                    <div className="range-inputs">
                        <input
                            type="number"
                            placeholder="От"
                            value={filters.pay_min}
                            onChange={(e) => updateFilter('pay_min', e.target.value)}
                            className="filter-input small"
                            min="0"
                        />
                        <span className="range-separator">-</span>
                        <input
                            type="number"
                            placeholder="До"
                            value={filters.pay_max}
                            onChange={(e) => updateFilter('pay_max', e.target.value)}
                            className="filter-input small"
                            min="0"
                        />
                    </div>
                </div>

                {/* Status */}
                <div className="filter-group">
                    <label>Статус</label>
                    <select
                        value={filters.status}
                        onChange={(e) => updateFilter('status', e.target.value)}
                        className="filter-select"
                    >
                        <option value="active">Активные</option>
                        <option value="all">Все</option>
                        <option value="closed">Закрытые</option>
                    </select>
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
                        <option value="pay_desc">По оплате (высокая)</option>
                        <option value="pay_asc">По оплате (низкая)</option>
                        <option value="popular">Популярные</option>
                        <option value="urgent">Срочные</option>
                    </select>
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
                                Пол: {filters.gender === 'male' ? 'Мужской' : filters.gender === 'female' ? 'Женский' : 'Любой'}
                                <button onClick={() => updateFilter('gender', '')}>×</button>
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
                        {filters.pay_min && (
                            <span className="active-filter-tag">
                                Оплата от: ₸{parseInt(filters.pay_min).toLocaleString()}
                                <button onClick={() => updateFilter('pay_min', '')}>×</button>
                            </span>
                        )}
                        {filters.pay_max && (
                            <span className="active-filter-tag">
                                Оплата до: ₸{parseInt(filters.pay_max).toLocaleString()}
                                <button onClick={() => updateFilter('pay_max', '')}>×</button>
                            </span>
                        )}
                        {filters.q && (
                            <span className="active-filter-tag">
                                Поиск: {filters.q}
                                <button onClick={() => updateFilter('q', '')}>×</button>
                            </span>
                        )}
                        {filters.status && filters.status !== 'active' && (
                            <span className="active-filter-tag">
                                Статус: {filters.status === 'all' ? 'Все' : filters.status === 'closed' ? 'Закрытые' : 'Активные'}
                                <button onClick={() => updateFilter('status', 'active')}>×</button>
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
