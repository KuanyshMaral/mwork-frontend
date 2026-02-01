import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { profileApi } from '../api/client'
import ModelFilters from '../components/models/ModelFilters'
import ModelCard from '../components/models/ModelCard'
import PromotedModelBadge from '../components/models/PromotedModelBadge'
import './Models.css'

export default function Models() {
    const [searchParams] = useSearchParams()
    const [models, setModels] = useState([])
    const [promotedModels, setPromotedModels] = useState([])
    const [loading, setLoading] = useState(true)
    const [promotedLoading, setPromotedLoading] = useState(true)
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
            } else if (key === 'is_verified' || key === 'is_available') {
                params[key] = value === 'true'
            } else {
                params[key] = value
            }
        }
        return params
    }

    useEffect(() => {
        loadPromotedModels()
        loadModels()
    }, [searchParams])

    async function loadPromotedModels() {
        setPromotedLoading(true)
        try {
            const result = await profileApi.getPromotedModels()
            setPromotedModels(Array.isArray(result) ? result : (Array.isArray(result?.data) ? result.data : []))
        } catch (err) {
            console.error('Failed to load promoted models:', err)
            // Don't show error for promoted models - just fail silently
            setPromotedModels([])
        } finally {
            setPromotedLoading(false)
        }
    }

    async function loadModels() {
        setLoading(true)
        try {
            const filters = getFiltersFromParams()
            const result = await profileApi.listModels(filters)
            const modelsData = Array.isArray(result) ? result : (Array.isArray(result?.data) ? result.data : [])
            setModels(modelsData)
            
            // Handle pagination metadata
            if (result?.meta) {
                setPagination({
                    page: result.meta.current_page || 1,
                    limit: result.meta.per_page || 20,
                    total: result.meta.total || 0
                })
                setTotal(result.meta.total || 0)
            } else {
                setTotal(modelsData.length || 0)
            }
        } catch (err) {
            console.error('Failed to load models:', err)
            setModels([])
        } finally {
            setLoading(false)
        }
    }

    const allModels = [...promotedModels.map(model => ({ ...model, is_promoted: true })), ...models]
    const displayTotal = total + promotedModels.length

    return (
        <div className="models-page animate-fadeIn">
            <div className="page-header">
                <h1>Модели</h1>
                <p>Найдите идеальную модель для вашего проекта</p>
                {displayTotal > 0 && (
                    <p className="results-count">Найдено: {displayTotal} {displayTotal === 1 ? 'модель' : displayTotal < 5 ? 'модели' : 'моделей'}</p>
                )}
            </div>

            {/* Filters Component */}
            <ModelFilters />

            {/* Models Grid */}
            {loading || promotedLoading ? (
                <div className="loading">Загрузка...</div>
            ) : (
                <>
                    <div className="models-grid">
                        {allModels.length === 0 ? (
                            <div className="no-results">
                                <h3>Модели не найдены</h3>
                                <p>Попробуйте изменить параметры фильтров или поиск</p>
                            </div>
                        ) : (
                            allModels.map(model => (
                                <ModelCard key={`promoted-${model.id}`} model={model} />
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
