import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { creditsApi } from '../api/client'
import { useAuth } from '../hooks/useAuth.jsx'
import { formatBalance } from '../utils/balanceFormatter.js'
import './CreditTransactions.css'

const TRANSACTION_TYPES = {
    deduction: { label: 'Списание', icon: '📤', color: 'type-deduction' },
    refund: { label: 'Возврат', icon: '↩️', color: 'type-refund' },
    purchase: { label: 'Покупка', icon: '💳', color: 'type-purchase' },
    admin_grant: { label: 'Начисление', icon: '🎁', color: 'type-grant' },
}

export default function CreditTransactions() {
    const { creditBalance } = useAuth()
    const [searchParams, setSearchParams] = useSearchParams()
    const navigate = useNavigate()
    
    // State
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        total_pages: 0,
    })
    
    // Filters from URL
    const [filters, setFilters] = useState({
        type: searchParams.get('type') || '',
        date_from: searchParams.get('date_from') || '',
        date_to: searchParams.get('date_to') || '',
    })
    
    const currentPage = parseInt(searchParams.get('page')) || 1

    // Load transactions
    const loadTransactions = useCallback(async () => {
        setLoading(true)
        try {
            const params = {
                page: currentPage,
                limit: 10,
            }
            
            if (filters.type) params.type = filters.type
            if (filters.date_from) params.date_from = filters.date_from
            if (filters.date_to) params.date_to = filters.date_to
            
            const data = await creditsApi.getTransactions(params)
            setTransactions(data.transactions || [])
            setPagination({
                page: data.page,
                limit: data.limit,
                total: data.total,
                total_pages: data.total_pages,
            })
        } catch (err) {
            console.error('Failed to load transactions:', err)
        } finally {
            setLoading(false)
        }
    }, [currentPage, filters])

    useEffect(() => {
        loadTransactions()
    }, [loadTransactions])

    // Update URL when filters change
    const updateUrlParams = (newFilters, newPage = 1) => {
        const params = new URLSearchParams()
        if (newPage > 1) params.set('page', newPage.toString())
        if (newFilters.type) params.set('type', newFilters.type)
        if (newFilters.date_from) params.set('date_from', newFilters.date_from)
        if (newFilters.date_to) params.set('date_to', newFilters.date_to)
        setSearchParams(params)
    }

    // Handle filter change
    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value }
        setFilters(newFilters)
        updateUrlParams(newFilters, 1)
    }

    // Reset filters
    const handleResetFilters = () => {
        const emptyFilters = { type: '', date_from: '', date_to: '' }
        setFilters(emptyFilters)
        setSearchParams(new URLSearchParams())
    }

    // Pagination
    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > pagination.total_pages) return
        updateUrlParams(filters, newPage)
    }

    // Export CSV
    const handleExportCsv = async () => {
        try {
            const blob = await creditsApi.exportCsv(filters)
            
            if (blob) {
                // Server-side export worked
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)
            } else {
                // Client-side fallback
                exportCsvClientSide()
            }
        } catch (err) {
            console.error('Export failed:', err)
            exportCsvClientSide()
        }
    }

    // Client-side CSV generation fallback
    const exportCsvClientSide = () => {
        const headers = ['Дата', 'Тип', 'Сумма', 'Описание', 'Баланс']
        const rows = transactions.map(t => [
            formatDate(t.created_at),
            TRANSACTION_TYPES[t.type]?.label || t.type,
            t.amount > 0 ? `+${t.amount}` : t.amount,
            t.description,
            t.resulting_balance,
        ])
        
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n')
        
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
    }

    // Navigate to buy credits
    const handleBuyCredits = () => {
        navigate('/subscriptions')
    }

    // Format date
    const formatDate = (dateStr) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    // Check if filters are active
    const hasActiveFilters = filters.type || filters.date_from || filters.date_to

    return (
        <div className="credit-transactions-page animate-fadeIn">
            {/* Header */}
            <div className="page-header">
                <div className="header-content">
                    <div>
                        <h1>История транзакций</h1>
                        <p>Просмотр и экспорт истории кредитных операций</p>
                    </div>
                    <div className="header-actions">
                        <div className="balance-widget">
                            <span className="balance-label">Баланс:</span>
                            <span className="balance-value">
                                {formatBalance(creditBalance)}
                            </span>
                        </div>
                        <button className="btn btn-primary buy-credits-btn" onClick={handleBuyCredits}>
                            <span className="btn-icon">💳</span>
                            Купить кредиты
                        </button>
                    </div>
                </div>
            </div>

            {/* Type Legend */}
            <div className="type-legend">
                <span className="legend-title">Типы операций:</span>
                {Object.entries(TRANSACTION_TYPES).map(([key, { label, icon, color }]) => (
                    <span key={key} className={`legend-item ${color}`}>
                        <span className="legend-icon">{icon}</span>
                        {label}
                    </span>
                ))}
            </div>

            {/* Filters */}
            <div className="filters-section">
                <div className="filters-row">
                    <div className="filter-group">
                        <label htmlFor="type-filter">Тип</label>
                        <select
                            id="type-filter"
                            value={filters.type}
                            onChange={(e) => handleFilterChange('type', e.target.value)}
                            className="filter-select"
                        >
                            <option value="">Все типы</option>
                            {Object.entries(TRANSACTION_TYPES).map(([key, { label }]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label htmlFor="date-from">Дата от</label>
                        <input
                            type="date"
                            id="date-from"
                            value={filters.date_from}
                            onChange={(e) => handleFilterChange('date_from', e.target.value)}
                            className="filter-input"
                        />
                    </div>

                    <div className="filter-group">
                        <label htmlFor="date-to">Дата до</label>
                        <input
                            type="date"
                            id="date-to"
                            value={filters.date_to}
                            onChange={(e) => handleFilterChange('date_to', e.target.value)}
                            className="filter-input"
                        />
                    </div>

                    <div className="filter-actions">
                        {hasActiveFilters && (
                            <button className="btn btn-secondary btn-sm" onClick={handleResetFilters}>
                                Сбросить
                            </button>
                        )}
                        <button className="btn btn-outline btn-sm" onClick={handleExportCsv}>
                            <span className="btn-icon">📥</span>
                            Экспорт CSV
                        </button>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="transactions-container">
                {loading ? (
                    <div className="skeleton-container">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="skeleton-row">
                                <div className="skeleton skeleton-date"></div>
                                <div className="skeleton skeleton-type"></div>
                                <div className="skeleton skeleton-amount"></div>
                                <div className="skeleton skeleton-desc"></div>
                                <div className="skeleton skeleton-balance"></div>
                            </div>
                        ))}
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📋</div>
                        <h3>Нет транзакций</h3>
                        <p>
                            {hasActiveFilters 
                                ? 'Попробуйте изменить фильтры поиска'
                                : 'История операций пока пуста'}
                        </p>
                        {hasActiveFilters && (
                            <button className="btn btn-secondary" onClick={handleResetFilters}>
                                Сбросить фильтры
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <table className="transactions-table">
                            <thead>
                                <tr>
                                    <th>Дата</th>
                                    <th>Тип</th>
                                    <th>Сумма</th>
                                    <th>Описание</th>
                                    <th>Баланс</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((transaction) => {
                                    const typeInfo = TRANSACTION_TYPES[transaction.type] || {
                                        label: transaction.type,
                                        icon: '•',
                                        color: '',
                                    }
                                    const isPositive = transaction.amount > 0

                                    return (
                                        <tr key={transaction.id}>
                                            <td className="cell-date">
                                                {formatDate(transaction.created_at)}
                                            </td>
                                            <td className="cell-type">
                                                <span className={`type-badge ${typeInfo.color}`}>
                                                    <span className="type-icon">{typeInfo.icon}</span>
                                                    {typeInfo.label}
                                                </span>
                                            </td>
                                            <td className={`cell-amount ${isPositive ? 'positive' : 'negative'}`}>
                                                {isPositive ? '+' : ''}{transaction.amount}
                                            </td>
                                            <td className="cell-description">
                                                {transaction.description}
                                            </td>
                                            <td className="cell-balance">
                                                {transaction.resulting_balance.toLocaleString()}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {pagination.total_pages > 1 && (
                            <div className="pagination">
                                <button
                                    className="pagination-btn"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage <= 1}
                                >
                                    ←
                                </button>
                                
                                <div className="pagination-pages">
                                    {[...Array(pagination.total_pages)].map((_, i) => {
                                        const page = i + 1
                                        // Show first, last, current and neighbors
                                        if (
                                            page === 1 ||
                                            page === pagination.total_pages ||
                                            Math.abs(page - currentPage) <= 1
                                        ) {
                                            return (
                                                <button
                                                    key={page}
                                                    className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                                                    onClick={() => handlePageChange(page)}
                                                >
                                                    {page}
                                                </button>
                                            )
                                        } else if (
                                            (page === 2 && currentPage > 3) ||
                                            (page === pagination.total_pages - 1 && currentPage < pagination.total_pages - 2)
                                        ) {
                                            return <span key={page} className="pagination-ellipsis">...</span>
                                        }
                                        return null
                                    })}
                                </div>

                                <button
                                    className="pagination-btn"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage >= pagination.total_pages}
                                >
                                    →
                                </button>

                                <span className="pagination-info">
                                    Страница {currentPage} из {pagination.total_pages} ({pagination.total} записей)
                                </span>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Buy Credits CTA */}
            <div className="buy-credits-cta">
                <div className="cta-content">
                    <div className="cta-text">
                        <h3>Нужно больше кредитов?</h3>
                        <p>Пополните баланс для доступа ко всем возможностям платформы</p>
                    </div>
                    <button className="btn btn-primary btn-lg" onClick={handleBuyCredits}>
                        Купить кредиты
                    </button>
                </div>
            </div>
        </div>
    )
}
