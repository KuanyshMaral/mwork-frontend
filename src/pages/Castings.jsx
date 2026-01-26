import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { castingApi } from '../api/client'
import './Castings.css'

export default function Castings() {
    const [castings, setCastings] = useState([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState({
        city: '',
        sort: 'newest',
        page: 1,
    })
    const [total, setTotal] = useState(0)

    useEffect(() => {
        loadCastings()
    }, [filters])

    async function loadCastings() {
        setLoading(true)
        try {
            const result = await castingApi.list(filters)
            setCastings(result || [])
            // setTotal from meta if available
        } catch (err) {
            console.error('Failed to load castings:', err)
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
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <input
                    type="text"
                    className="form-input search-input"
                    placeholder="Поиск по названию..."
                />

                <select
                    className="form-input filter-select"
                    value={filters.city}
                    onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                >
                    <option value="">Все города</option>
                    <option value="Алматы">Алматы</option>
                    <option value="Астана">Астана</option>
                    <option value="Шымкент">Шымкент</option>
                </select>

                <select
                    className="form-input filter-select"
                    value={filters.sort}
                    onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
                >
                    <option value="newest">Сначала новые</option>
                    <option value="pay_desc">По оплате</option>
                    <option value="popular">Популярные</option>
                </select>
            </div>

            {/* Castings Grid */}
            {loading ? (
                <div className="loading">Загрузка...</div>
            ) : (
                <div className="castings-grid">
                    {castings.length === 0 ? (
                        <div className="no-results">
                            <p>Кастинги не найдены</p>
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
            )}
        </div>
    )
}
