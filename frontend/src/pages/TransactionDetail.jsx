import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { transactionsAPI } from '../services/api'
import { formatCurrency } from '../utils/formatters'
import './TransactionDetail.css'

const TransactionDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [transaction, setTransaction] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchTransaction()
    }, [id])

    const fetchTransaction = async () => {
        setLoading(true)
        setError('')
        try {
            const response = await transactionsAPI.getById(id)
            if (response.data.success) {
                setTransaction(response.data.data.transaction)
            } else {
                setError('Transaction not found.')
            }
        } catch (err) {
            console.error('Fetch transaction error:', err)
            setError('Failed to load transaction details.')
        } finally {
            setLoading(false)
        }
    }

    const formatFullDate = (dateStr) => {
        if (!dateStr) return '-'
        return new Date(dateStr).toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatDateTime = (dateStr) => {
        if (!dateStr) return '-'
        return new Date(dateStr).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <div className="transaction-detail">
                <div className="detail-skeleton">
                    <div className="skeleton skeleton-header"></div>
                    <div className="skeleton-body">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="skeleton-field">
                                <div className="skeleton skeleton-label"></div>
                                <div className="skeleton skeleton-value"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="transaction-detail container">
                <div className="detail-error">
                    <span className="error-icon">⚠️</span>
                    <h2>{error}</h2>
                    <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                        ← Go Back
                    </button>
                </div>
            </div>
        )
    }

    const isIncome = transaction?.type === 'income'

    return (
        <div className="transaction-detail container">

            {/* Page Header */}
            <div className="page-header">
                <div className="header-content">
                    <h1 className="page-title">Transaction Detail</h1>
                    <p className="page-subtitle">Full details of the selected transaction</p>
                </div>
            </div>

            {/* Detail Card */}
            <div className="detail-card">

                {/* Colored Header Banner */}
                <div className={`detail-header ${isIncome ? 'income' : 'expense'}`}>
                    <div className="detail-header-icon">
                        {isIncome ? '↑' : '↓'}
                    </div>
                    <div className="detail-header-info">
                        <span className="detail-type-label">{transaction.type}</span>
                        <span className="detail-amount">
                            {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
                        </span>
                    </div>
                    <div className={`detail-badge ${isIncome ? 'income' : 'expense'}`}>
                        {isIncome ? 'Income' : 'Expense'}
                    </div>
                </div>

                {/* Info Grid */}
                <div className="detail-body">
                    <div className="detail-grid">

                        <div className="detail-field">
                            <span className="detail-label">📅 Date</span>
                            <span className="detail-value">{formatFullDate(transaction.date)}</span>
                        </div>

                        <div className="detail-field">
                            <span className="detail-label">🏷️ Category</span>
                            <span className="detail-value category-tag">{transaction.category}</span>
                        </div>

                        <div className="detail-field full-width">
                            <span className="detail-label">📝 Description</span>
                            <span className="detail-value description-text">
                                {transaction.description || <span className="no-value">No description provided</span>}
                            </span>
                        </div>

                        <div className="detail-field">
                            <span className="detail-label">👤 Created By</span>
                            <div className="detail-value created-by-row">
                                <div className={`detail-avatar ${isIncome ? 'income' : 'expense'}`}>
                                    {(transaction.createdBy || 'U')[0].toUpperCase()}
                                </div>
                                <span>{transaction.createdBy || 'Unknown'}</span>
                            </div>
                        </div>

                        <div className="detail-field">
                            <span className="detail-label">🕐 Created At</span>
                            <span className="detail-value">{formatDateTime(transaction.createdAt)}</span>
                        </div>

                        {transaction.updatedAt && transaction.updatedAt !== transaction.createdAt && (
                            <div className="detail-field">
                                <span className="detail-label">✏️ Last Updated</span>
                                <span className="detail-value">{formatDateTime(transaction.updatedAt)}</span>
                            </div>
                        )}

                        <div className="detail-field">
                            <span className="detail-label">🔖 Transaction ID</span>
                            <span className="detail-value transaction-id">#{transaction.id}</span>
                        </div>

                    </div>
                </div>

                {/* Footer Actions */}
                <div className="detail-footer">
                    <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                        ← Back
                    </button>
                    <button
                        className="btn btn-outline"
                        onClick={() => navigate('/transactions')}
                    >
                        All Transactions
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TransactionDetail
