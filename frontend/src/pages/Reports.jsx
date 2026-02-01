import { useState, useEffect } from 'react'
import { IncomeExpenseChart, CategoryPieChart, ReportSummary } from '../components/Charts'
import TransactionTable from '../components/TransactionTable'
import { reportsAPI } from '../services/api'
import './Reports.css'

// Helper to format date as YYYY-MM-DD
const formatDate = (date) => {
    return date.toISOString().split('T')[0]
}

// Helper to get date ranges for presets
const getDateRange = (preset) => {
    const today = new Date()
    const todayStr = formatDate(today)

    switch (preset) {
        case 'today': {
            return { startDate: todayStr, endDate: todayStr, label: 'Today' }
        }
        case 'yesterday': {
            const yesterday = new Date(today)
            yesterday.setDate(yesterday.getDate() - 1)
            const yesterdayStr = formatDate(yesterday)
            return { startDate: yesterdayStr, endDate: yesterdayStr, label: 'Yesterday' }
        }
        case 'week': {
            const startOfWeek = new Date(today)
            const dayOfWeek = startOfWeek.getDay()
            const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
            startOfWeek.setDate(diff)
            return { startDate: formatDate(startOfWeek), endDate: todayStr, label: 'This Week' }
        }
        case 'month': {
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
            return { startDate: formatDate(startOfMonth), endDate: todayStr, label: 'This Month' }
        }
        case 'year': {
            const startOfYear = new Date(today.getFullYear(), 0, 1)
            return { startDate: formatDate(startOfYear), endDate: todayStr, label: 'This Year' }
        }
        default:
            return { startDate: todayStr, endDate: todayStr, label: 'Custom' }
    }
}

const Reports = () => {
    const [activePreset, setActivePreset] = useState('month')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [reportData, setReportData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showCustomPicker, setShowCustomPicker] = useState(false)

    // Initialize with current month
    useEffect(() => {
        const range = getDateRange('month')
        setStartDate(range.startDate)
        setEndDate(range.endDate)
    }, [])

    // Fetch report when dates change
    useEffect(() => {
        if (startDate && endDate) {
            fetchReport()
        }
    }, [startDate, endDate])

    const fetchReport = async () => {
        setLoading(true)
        setError('')

        try {
            const response = await reportsAPI.getByDateRange(startDate, endDate)

            if (response.data.success) {
                setReportData(response.data.data)
            }
        } catch (err) {
            console.error('Fetch report error:', err)
            setError('Failed to load report data')
        } finally {
            setLoading(false)
        }
    }

    const handlePresetClick = (preset) => {
        setActivePreset(preset)
        setShowCustomPicker(false)
        const range = getDateRange(preset)
        setStartDate(range.startDate)
        setEndDate(range.endDate)
    }

    const handleCustomClick = () => {
        setActivePreset('custom')
        setShowCustomPicker(true)
    }

    const handleCustomDateChange = (type, value) => {
        if (type === 'start') {
            setStartDate(value)
        } else {
            setEndDate(value)
        }
        setActivePreset('custom')
    }

    const getActiveLabel = () => {
        if (activePreset === 'custom') {
            return `${new Date(startDate).toLocaleDateString('en-IN')} - ${new Date(endDate).toLocaleDateString('en-IN')}`
        }
        return getDateRange(activePreset).label
    }

    const presets = [
        { id: 'today', label: 'Today', icon: '📅' },
        { id: 'yesterday', label: 'Yesterday', icon: '⏮️' },
        { id: 'week', label: 'This Week', icon: '📊' },
        { id: 'month', label: 'This Month', icon: '🗓️' },
        { id: 'year', label: 'This Year', icon: '📆' }
    ]

    return (
        <div className="reports container">
            <div className="page-header">
                <div className="header-content">
                    <h1 className="page-title">Reports</h1>
                    <p className="page-subtitle">
                        {reportData?.startDate && reportData?.endDate
                            ? `${new Date(reportData.startDate).toLocaleDateString('en-IN')} - ${new Date(reportData.endDate).toLocaleDateString('en-IN')}`
                            : 'Financial analysis and insights'
                        }
                    </p>
                </div>
            </div>

            {/* Date Selection Controls */}
            <div className="date-controls">
                <div className="preset-chips">
                    {presets.map((preset) => (
                        <button
                            key={preset.id}
                            className={`preset-chip ${activePreset === preset.id ? 'active' : ''}`}
                            onClick={() => handlePresetClick(preset.id)}
                        >
                            <span className="preset-icon">{preset.icon}</span>
                            <span className="preset-label">{preset.label}</span>
                        </button>
                    ))}
                    <button
                        className={`preset-chip custom ${activePreset === 'custom' ? 'active' : ''}`}
                        onClick={handleCustomClick}
                    >
                        <span className="preset-icon">📐</span>
                        <span className="preset-label">Custom</span>
                    </button>
                </div>

                {/* Custom Date Picker */}
                {showCustomPicker && (
                    <div className="custom-date-picker">
                        <div className="date-input-group">
                            <label htmlFor="start-date">From</label>
                            <input
                                type="date"
                                id="start-date"
                                value={startDate}
                                onChange={(e) => handleCustomDateChange('start', e.target.value)}
                                max={endDate || formatDate(new Date())}
                                className="date-input"
                            />
                        </div>
                        <div className="date-input-group">
                            <label htmlFor="end-date">To</label>
                            <input
                                type="date"
                                id="end-date"
                                value={endDate}
                                onChange={(e) => handleCustomDateChange('end', e.target.value)}
                                min={startDate}
                                max={formatDate(new Date())}
                                className="date-input"
                            />
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="alert alert-error">
                    {error}
                    <button className="btn btn-sm btn-secondary" onClick={fetchReport}>
                        Retry
                    </button>
                </div>
            )}

            {loading ? (
                <div className="loading-container">
                    <div className="loader"></div>
                    <p>Loading report data...</p>
                </div>
            ) : (
                <>
                    <ReportSummary data={reportData} />

                    <div className="charts-grid">
                        <div className="chart-wrapper">
                            <IncomeExpenseChart
                                data={reportData}
                                title={`${getActiveLabel()} - Income vs Expenses`}
                            />
                        </div>
                        <div className="chart-wrapper">
                            <CategoryPieChart
                                data={reportData?.categoryBreakdown || {}}
                                title="Expense by Category"
                            />
                        </div>
                    </div>

                    <div className="transactions-section">
                        <h2 className="section-title">
                            Transactions ({reportData?.transactions?.length || 0})
                        </h2>
                        <TransactionTable
                            transactions={reportData?.transactions || []}
                            showActions={false}
                        />
                    </div>
                </>
            )}
        </div>
    )
}

export default Reports
