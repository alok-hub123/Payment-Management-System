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
    const [editingTransaction, setEditingTransaction] = useState(null)
    const [showDeleteModal, setShowDeleteModal] = useState(null)

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

    const handleEdit = (transaction) => {
        // For now, redirect to a simple edit flow
        // A full implementation would open a modal
        setEditingTransaction(transaction)
    }

    const handleDelete = async (id) => {
        try {
            const response = await transactionsAPI.delete(id)

            if (response.data.success) {
                setTransactions(prev => prev.filter(t => t.id !== id))
                setShowDeleteModal(null)
            }
        } catch (err) {
            console.error('Delete error:', err)
            setError('Failed to delete transaction')
        }
    }

    const confirmDelete = (id) => {
        setShowDeleteModal(id)
    }

    const cancelDelete = () => {
        setShowDeleteModal(null)
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
                onEdit={handleEdit}
                onDelete={confirmDelete}
                showDescriptionOnMobile={true}
            />

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Confirm Delete</h3>
                        <p>Are you sure you want to delete this transaction? This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={cancelDelete}>
                                Cancel
                            </button>
                            <button className="btn btn-danger" onClick={() => handleDelete(showDeleteModal)}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default TransactionHistory
