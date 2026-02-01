import { useState } from 'react'
import './BudgetSelector.css'

export default function BudgetSelector({ 
    budgetType = 'daily', 
    dailyBudget = 100, 
    totalBudget = 1000, 
    durationDays = 7, 
    onChange 
}) {
    const [localData, setLocalData] = useState({
        budgetType,
        dailyBudget,
        totalBudget,
        durationDays
    })

    const handleChange = (field, value) => {
        const newData = { ...localData, [field]: value }
        setLocalData(newData)
        onChange(newData)
    }

    const calculateTotal = () => {
        if (localData.budgetType === 'daily') {
            return localData.dailyBudget * localData.durationDays
        }
        return localData.totalBudget
    }

    const calculateDaily = () => {
        if (localData.budgetType === 'total') {
            return Math.ceil(localData.totalBudget / localData.durationDays)
        }
        return localData.dailyBudget
    }

    const presetBudgets = [50, 100, 200, 500, 1000, 2000]
    const presetDurations = [3, 7, 14, 30]

    return (
        <div className="budget-selector">
            <div className="budget-type-selector">
                <label className="radio-label">
                    <input
                        type="radio"
                        name="budget_type"
                        value="daily"
                        checked={localData.budgetType === 'daily'}
                        onChange={(e) => handleChange('budgetType', e.target.value)}
                    />
                    <span className="radio-text">Дневной бюджет</span>
                </label>
                <label className="radio-label">
                    <input
                        type="radio"
                        name="budget_type"
                        value="total"
                        checked={localData.budgetType === 'total'}
                        onChange={(e) => handleChange('budgetType', e.target.value)}
                    />
                    <span className="radio-text">Общий бюджет</span>
                </label>
            </div>

            <div className="budget-inputs">
                {localData.budgetType === 'daily' ? (
                    <div className="form-group">
                        <label htmlFor="daily_budget">Дневной бюджет (₸)</label>
                        <div className="budget-input-with-presets">
                            <input
                                type="number"
                                id="daily_budget"
                                value={localData.dailyBudget}
                                onChange={(e) => handleChange('dailyBudget', parseInt(e.target.value) || 0)}
                                min="50"
                                max="10000"
                                step="50"
                            />
                            <div className="preset-buttons">
                                {presetBudgets.map(amount => (
                                    <button
                                        key={amount}
                                        type="button"
                                        className="preset-btn"
                                        onClick={() => handleChange('dailyBudget', amount)}
                                    >
                                        {amount}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="form-group">
                        <label htmlFor="total_budget">Общий бюджет (₸)</label>
                        <div className="budget-input-with-presets">
                            <input
                                type="number"
                                id="total_budget"
                                value={localData.totalBudget}
                                onChange={(e) => handleChange('totalBudget', parseInt(e.target.value) || 0)}
                                min="100"
                                max="50000"
                                step="100"
                            />
                            <div className="preset-buttons">
                                {presetBudgets.map(amount => (
                                    <button
                                        key={amount}
                                        type="button"
                                        className="preset-btn"
                                        onClick={() => handleChange('totalBudget', amount)}
                                    >
                                        {amount}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="duration_days">Длительность (дней)</label>
                    <div className="duration-input-with-presets">
                        <input
                            type="number"
                            id="duration_days"
                            value={localData.durationDays}
                            onChange={(e) => handleChange('durationDays', parseInt(e.target.value) || 1)}
                            min="1"
                            max="90"
                        />
                        <div className="preset-buttons">
                            {presetDurations.map(days => (
                                <button
                                    key={days}
                                    type="button"
                                    className="preset-btn"
                                    onClick={() => handleChange('durationDays', days)}
                                >
                                    {days}д
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="budget-summary">
                <div className="summary-item">
                    <span className="summary-label">
                        {localData.budgetType === 'daily' ? 'Общий бюджет:' : 'Дневной бюджет:'}
                    </span>
                    <span className="summary-value">
                        ₸{localData.budgetType === 'daily' ? calculateTotal() : calculateDaily()}
                    </span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">Период:</span>
                    <span className="summary-value">{localData.durationDays} дней</span>
                </div>
                <div className="summary-item total">
                    <span className="summary-label">Итого к оплате:</span>
                    <span className="summary-value">₸{calculateTotal()}</span>
                </div>
            </div>
        </div>
    )
}
