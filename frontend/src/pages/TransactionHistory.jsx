import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import TransactionTable from '../components/TransactionTable'
import Filters from '../components/Filters'
import { transactionsAPI } from '../services/api'
import './TransactionHistory.css'

const TransactionHistory = () => {
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [filters, setFilters] = useState({})
    const [searchQuery, setSearchQuery] = useState('')

    // Client-side instant search across description, category, type, amount
    const filteredTransactions = useMemo(() => {
        const q = searchQuery.trim().toLowerCase()
        if (!q) return transactions
        return transactions.filter(t =>
            (t.description || '').toLowerCase().includes(q) ||
            (t.category || '').toLowerCase().includes(q) ||
            (t.type || '').toLowerCase().includes(q) ||
            String(t.amount || '').includes(q)
        )
    }, [transactions, searchQuery])

    useEffect(() => {
        fetchTransactions()
    }, [filters])

    const fetchTransactions = async () => {
        setLoading(true)
        setError('')

        try {
            const response = await transactionsAPI.getAll(filters)

            if (response.data.success) {
                setTransactions(response.data.data.transactions)
            }
        } catch (err) {
            console.error('Fetch transactions error:', err)
            setError('Failed to load transactions')
        } finally {
            setLoading(false)
        }
    }

    const handleFilter = (newFilters) => {
        setFilters(newFilters)
        setSearchQuery('') // reset search when backend filters change
    }

    return (
        <div className="transaction-history container">
            <div className="page-header">
                <div className="header-content">
                    <h1 className="page-title">Transaction History</h1>
                    <p className="page-subtitle">
                        {loading
                            ? 'Loading...'
                            : searchQuery
                                ? `${filteredTransactions.length} of ${transactions.length} transactions`
                                : `${transactions.length} transactions found`
                        }
                    </p>
                </div>
                <Link to="/add-transaction" className="btn btn-primary">
                    <span>➕</span> Add New
                </Link>
            </div>

            <Filters onFilter={handleFilter} initialFilters={filters} />

            {/* Search Bar */}
            <div className="search-bar-wrapper">
                <div className="search-bar">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by description, category, type or amount..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className="search-clear" onClick={() => setSearchQuery('')} title="Clear search">
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="alert alert-error">
                    {error}
                    <button className="btn btn-sm btn-secondary" onClick={fetchTransactions}>
                        Retry
                    </button>
                </div>
            )}

            <TransactionTable
                transactions={filteredTransactions}
                loading={loading}
                showDescriptionOnMobile={true}
            />
        </div>
    )
}

export default TransactionHistory
