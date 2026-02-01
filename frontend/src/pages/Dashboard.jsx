import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import SummaryCards from '../components/SummaryCards'
import TransactionTable from '../components/TransactionTable'
import { reportsAPI, transactionsAPI } from '../services/api'
import { formatCurrency } from '../utils/formatters'
import './Dashboard.css'

const Dashboard = () => {
    const [summaryData, setSummaryData] = useState({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0
    })
    const [recentTransactions, setRecentTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        setLoading(true)
        setError('')

        try {
            const [balanceRes, transactionsRes] = await Promise.all([
                reportsAPI.getBalance(),
                transactionsAPI.getAll()
            ])

            if (balanceRes.data.success) {
                setSummaryData(balanceRes.data.data)
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

    return (
        <div className="dashboard container">
            <div className="page-header">
                <div className="header-content">
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">Overview of your financial status</p>
                </div>
                <Link to="/add-transaction" className="btn btn-primary">
                    <span>➕</span> Add Transaction
                </Link>
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
