import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TransactionForm from '../components/TransactionForm'
import { transactionsAPI } from '../services/api'
import './AddTransaction.css'

const AddTransaction = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (formData) => {
        setLoading(true)
        setError('')
        setSuccess(false)

        try {
            const response = await transactionsAPI.create(formData)

            if (response.data.success) {
                setSuccess(true)
                setTimeout(() => {
                    navigate('/transactions')
                }, 1500)
            } else {
                setError(response.data.message || 'Failed to add transaction')
            }
        } catch (err) {
            console.error('Add transaction error:', err)
            setError(err.response?.data?.message || 'Failed to add transaction. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="add-transaction container">
            <div className="page-header">
                <h1 className="page-title">Add Transaction</h1>
                <p className="page-subtitle">Record a new income or expense entry</p>
            </div>

            <div className="form-card card">
                {success && (
                    <div className="alert alert-success">
                        ✓ Transaction added successfully! Redirecting...
                    </div>
                )}

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                <TransactionForm
                    onSubmit={handleSubmit}
                    loading={loading}
                />
            </div>
        </div>
    )
}

export default AddTransaction
