import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import SummaryCards from '../components/SummaryCards'
import TransactionTable from '../components/TransactionTable'
import { reportsAPI, transactionsAPI } from '../services/api'
import { formatCurrency } from '../utils/formatters'
import './Dashboard.css'

// Helper to format date as YYYY-MM-DD (using local time, not UTC)
const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
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

const Dashboard = () => {
    const [activePreset, setActivePreset] = useState('month')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [showCustomPicker, setShowCustomPicker] = useState(false)
    const [summaryData, setSummaryData] = useState({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0
    })
    const [recentTransactions, setRecentTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // Initialize with current month
    useEffect(() => {
        const range = getDateRange('month')
        setStartDate(range.startDate)
        setEndDate(range.endDate)
    }, [])

    // Fetch data when dates change
    useEffect(() => {
        if (startDate && endDate) {
            fetchDashboardData()
        }
    }, [startDate, endDate])

    const fetchDashboardData = async () => {
        setLoading(true)
        setError('')

        try {
            const [reportRes, transactionsRes] = await Promise.all([
                reportsAPI.getByDateRange(startDate, endDate),
                transactionsAPI.getAll()
            ])

            if (reportRes.data.success) {
                const summary = reportRes.data.data.summary || reportRes.data.data
                setSummaryData({
                    totalIncome: summary.totalIncome || 0,
                    totalExpense: summary.totalExpense || 0,
                    balance: summary.balance || (summary.totalIncome || 0) - (summary.totalExpense || 0)
                })
            }

            if (transactionsRes.data.success) {
                // Get last 5 transactions
                setRecentTransactions(transactionsRes.data.data.transactions.slice(0, 5))
            }
        } catch (err) {
            console.error('Dashboard fetch error:', err)
            setError('Failed to load dashboard data. Please try again.')
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
        <div className="dashboard container">
            <div className="page-header">
                <div className="header-content">
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">
                        {startDate && endDate
                            ? `${new Date(startDate).toLocaleDateString('en-IN')} - ${new Date(endDate).toLocaleDateString('en-IN')}`
                            : 'Overview of your financial status'
                        }
                    </p>
                </div>
                <Link to="/add-transaction" className="btn btn-primary">
                    <span>➕</span> Add Transaction
                </Link>
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
                    <button className="btn btn-sm btn-secondary" onClick={fetchDashboardData}>
                        Retry
                    </button>
                </div>
            )}

            <SummaryCards
                totalIncome={summaryData.totalIncome}
                totalExpense={summaryData.totalExpense}
                balance={summaryData.balance}
                loading={loading}
            />

            <div className="dashboard-grid">
                <div className="dashboard-section">
                    <div className="section-header">
                        <h2 className="section-title">Recent Transactions</h2>
                        <Link to="/transactions" className="btn btn-sm btn-outline">
                            View All →
                        </Link>
                    </div>
                    <TransactionTable
                        transactions={recentTransactions}
                        loading={loading}
                        showActions={false}
                    />
                </div>

                <div className="dashboard-section quick-actions">
                    <h2 className="section-title">Quick Actions</h2>
                    <div className="action-cards">
                        <Link to="/add-transaction" className="action-card income">
                            <span className="action-icon">📈</span>
                            <span className="action-label">Add Income</span>
                        </Link>
                        <Link to="/add-transaction" className="action-card expense">
                            <span className="action-icon">📉</span>
                            <span className="action-label">Add Expense</span>
                        </Link>
                        <Link to="/reports" className="action-card report">
                            <span className="action-icon">📊</span>
                            <span className="action-label">View Reports</span>
                        </Link>
                        <Link to="/transactions" className="action-card history">
                            <span className="action-icon">📋</span>
                            <span className="action-label">All Transactions</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard

