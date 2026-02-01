import { useState, useEffect } from 'react'
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
    const [editingTransaction, setEditingTransaction] = useState(null)
    const [showDeleteModal, setShowDeleteModal] = useState(null)

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
                        {loading ? 'Loading...' : `${transactions.length} transactions found`}
                    </p>
                </div>
                <Link to="/add-transaction" className="btn btn-primary">
                    <span>➕</span> Add New
                </Link>
            </div>

            <Filters onFilter={handleFilter} initialFilters={filters} />

            {error && (
                <div className="alert alert-error">
                    {error}
                    <button className="btn btn-sm btn-secondary" onClick={fetchTransactions}>
                        Retry
                    </button>
                </div>
            )}

            <TransactionTable
                transactions={transactions}
                loading={loading}
                onEdit={handleEdit}
                onDelete={confirmDelete}
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
