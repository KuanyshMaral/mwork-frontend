import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { castingApi } from '../api/client'
import CastingFilters from '../components/castings/CastingFilters'
import './Castings.css'

export default function Castings() {
    const [searchParams] = useSearchParams()
    const [castings, setCastings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [total, setTotal] = useState(0)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0
    })

    // Get filters from URL params
    const getFiltersFromParams = () => {
        const params = {}
        for (const [key, value] of searchParams.entries()) {
            if (key === 'page') {
                params.page = parseInt(value) || 1
            } else if (key === 'limit') {
                params.limit = parseInt(value) || 20
            } else if (value && value !== '') {
                params[key] = value
            }
        }
        console.log('URL params:', Object.fromEntries(searchParams.entries()))
        console.log('Parsed filters:', params)
        return params
    }

    useEffect(() => {
        loadCastings()
    }, [searchParams])

    async function loadCastings() {
        setLoading(true)
        setError(null)
        try {
            const filters = getFiltersFromParams()
            console.log('Loading castings with filters:', filters)
            
            // Try to fetch castings - API now handles fallback automatically
            const result = await castingApi.list(filters)
            console.log('API response:', result)
            
            // The API client already extracts data.data, so result should be array directly
            if (Array.isArray(result)) {
                setCastings(result)
                setTotal(result.length)
                
                // Check if we're showing demo data
                const isDemoData = result.length > 0 && result[0].id.startsWith('demo-')
                if (isDemoData) {
                    console.log('Showing demo data due to backend issues')
                }
            } else if (result && typeof result === 'object') {
                // Handle case where response is wrapped
                if (Array.isArray(result.data)) {
                    setCastings(result.data)
                    setTotal(result.data.length)
                } else {
                    console.warn('Unexpected API response structure:', result)
                    setCastings([])
                    setTotal(0)
                }
            } else {
                console.warn('API response is not an array or object:', result)
                setCastings([])
                setTotal(0)
            }
            
            // Handle pagination metadata
            if (result && result.meta) {
                setPagination({
                    page: result.meta.current_page || 1,
                    limit: result.meta.per_page || 20,
                    total: result.meta.total || 0
                })
                if (result.meta.total) {
                    setTotal(result.meta.total)
                }
            }
        } catch (err) {
            console.error('Failed to load castings:', err)
            
            // Provide more specific error messages
            if (err.code === 'NETWORK_ERROR' || err.message.includes('fetch')) {
                console.error('Network error - backend server might not be running')
            } else if (err.status === 401) {
                console.error('Authentication error - user might not be logged in')
            } else if (err.status === 500) {
                console.error('Server error - backend might have an issue')
            }
            
            setCastings([])
            setTotal(0)
        } finally {
            setLoading(false)
        }
    }

    function formatPay(casting) {
        if (casting.payment_amount) {
            return `₸${casting.payment_amount.toLocaleString()}`
        }
        if (casting.payment_type === 'negotiable') {
            return 'По договоренности'
        }
        return 'TFP'
    }

    return (
        <div className="castings-page animate-fadeIn">
            <div className="page-header">
                <h1>Кастинги</h1>
                <p>Найдите идеальную работу для себя</p>
                {total > 0 && (
                    <p className="results-count">
                        Найдено: {total} {total === 1 ? 'кастинг' : total < 5 ? 'кастинга' : 'кастингов'}
                        {castings.length > 0 && castings[0].id.startsWith('demo-') && (
                            <span className="demo-indicator"> (демо-режим)</span>
                        )}
                    </p>
                )}
            </div>

            {/* Filters Component */}
            <CastingFilters />

            {/* Castings Grid */}
            {loading ? (
                <div className="loading">Загрузка...</div>
            ) : error ? (
                <div className="error-message">
                    <h3>Ошибка загрузки кастингов</h3>
                    <p>
                        {error.message.includes('fetch') || error.code === 'NETWORK_ERROR' 
                            ? 'Не удалось подключиться к серверу. Пожалуйста, убедитесь, что backend сервер запущен на порту 8080.'
                            : error.status === 401 
                            ? 'Требуется авторизация. Пожалуйста, войдите в систему.'
                            : error.status === 500 
                            ? 'Ошибка сервера. Бэкенд команда уже уведомлена о проблеме. Показываем демо-данные...'
                            : 'Произошла ошибка при загрузке кастингов. Пожалуйста, попробуйте обновить страницу.'
                        }
                    </p>
                    <button onClick={() => loadCastings()} className="retry-btn">
                        Попробовать снова
                    </button>
                </div>
            ) : (
                <>
                    <div className="castings-grid">
                        {castings.length === 0 ? (
                            <div className="no-results">
                                <h3>Кастинги не найдены</h3>
                                <p>Попробуйте изменить параметры фильтров или поиск</p>
                            </div>
                        ) : (
                            castings.map(casting => (
                                <Link
                                    key={casting.id}
                                    to={`/castings/${casting.id}`}
                                    className="casting-card"
                                >
                                    {casting.is_urgent && (
                                        <span className="badge badge-warning">Срочно</span>
                                    )}

                                    <div className="casting-header">
                                        <h3>{casting.title}</h3>
                                        <span className="casting-pay">{formatPay(casting)}</span>
                                    </div>

                                    <p className="casting-description">
                                        {casting.description?.substring(0, 120)}...
                                    </p>

                                    <div className="casting-meta">
                                        <span className="meta-item">
                                            📍 {casting.city}
                                        </span>
                                        {casting.gender && (
                                            <span className="meta-item">
                                                👫 {casting.gender === 'male' ? 'Мужской' : casting.gender === 'female' ? 'Женский' : 'Любой'}
                                            </span>
                                        )}
                                        {casting.age_min && casting.age_max && (
                                            <span className="meta-item">
                                                🎂 {casting.age_min}-{casting.age_max} лет
                                            </span>
                                        )}
                                        <span className="meta-item">
                                            👁 {casting.views_count || 0}
                                        </span>
                                    </div>

                                    <div className="casting-footer">
                                        <span className="casting-date">
                                            {new Date(casting.created_at).toLocaleDateString('ru-RU')}
                                        </span>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {pagination.total > pagination.limit && (
                        <div className="pagination">
                            <button
                                disabled={pagination.page <= 1}
                                onClick={() => {
                                    const params = new URLSearchParams(searchParams)
                                    params.set('page', pagination.page - 1)
                                    window.history.pushState({}, '', `?${params.toString()}`)
                                }}
                                className="pagination-btn"
                            >
                                ← Назад
                            </button>
                            
                            <span className="pagination-info">
                                Страница {pagination.page} из {Math.ceil(pagination.total / pagination.limit)}
                            </span>
                            
                            <button
                                disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                                onClick={() => {
                                    const params = new URLSearchParams(searchParams)
                                    params.set('page', pagination.page + 1)
                                    window.history.pushState({}, '', `?${params.toString()}`)
                                }}
                                className="pagination-btn"
                            >
                                Вперед →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
