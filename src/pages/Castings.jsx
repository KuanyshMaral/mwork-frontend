import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { castingApi } from '../api/client'
import CastingFilters from '../components/castings/CastingFilters'
import './Castings.css'

export default function Castings() {
    const [searchParams] = useSearchParams()
    const [castings, setCastings] = useState([])
    const [loading, setLoading] = useState(true)
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
            } else {
                params[key] = value
            }
        }
        return params
    }

    useEffect(() => {
        loadCastings()
    }, [searchParams])

    async function loadCastings() {
        setLoading(true)
        try {
            const filters = getFiltersFromParams()
            const result = await castingApi.list(filters)
            setCastings(result.data || result || [])
            
            // Handle pagination metadata
            if (result.meta) {
                setPagination({
                    page: result.meta.current_page || 1,
                    limit: result.meta.per_page || 20,
                    total: result.meta.total || 0
                })
                setTotal(result.meta.total || 0)
            } else {
                setTotal(result.length || 0)
            }
        } catch (err) {
            console.error('Failed to load castings:', err)
            setCastings([])
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
                    <p className="results-count">Найдено: {total} {total === 1 ? 'кастинг' : total < 5 ? 'кастинга' : 'кастингов'}</p>
                )}
            </div>

            {/* Filters Component */}
            <CastingFilters />

            {/* Castings Grid */}
            {loading ? (
                <div className="loading">Загрузка...</div>
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
