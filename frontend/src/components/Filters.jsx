import { useState } from 'react'
import { getTodayDate } from '../utils/formatters'
import './Filters.css'

const Filters = ({ onFilter, initialFilters = {} }) => {
    const [filters, setFilters] = useState({
        type: initialFilters.type || '',
        startDate: initialFilters.startDate || '',
        endDate: initialFilters.endDate || ''
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFilters(prev => ({ ...prev, [name]: value }))
    }

    const handleApply = () => {
        onFilter(filters)
    }

    const handleReset = () => {
        const resetFilters = { type: '', startDate: '', endDate: '' }
        setFilters(resetFilters)
        onFilter(resetFilters)
    }

    return (
        <div className="filters">
            <div className="filters-row">
                <div className="filter-group">
                    <label className="filter-label">Type</label>
                    <select
                        name="type"
                        value={filters.type}
                        onChange={handleChange}
                        className="filter-select"
                    >
                        <option value="">All Types</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label className="filter-label">Start Date</label>
                    <input
                        type="date"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleChange}
                        className="filter-input"
                        max={filters.endDate || getTodayDate()}
                    />
                </div>

                <div className="filter-group">
                    <label className="filter-label">End Date</label>
                    <input
                        type="date"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleChange}
                        className="filter-input"
                        min={filters.startDate}
                        max={getTodayDate()}
                    />
                </div>

                <div className="filter-actions">
                    <button className="btn btn-primary" onClick={handleApply}>
                        Apply Filters
                    </button>
                    <button className="btn btn-secondary" onClick={handleReset}>
                        Reset
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Filters
