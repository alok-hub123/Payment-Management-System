import { useState } from 'react'
import { getCategories, getTodayDate } from '../utils/formatters'
import './TransactionForm.css'

const TransactionForm = ({ onSubmit, initialData = null, loading = false }) => {
    const [formData, setFormData] = useState({
        date: initialData?.date || getTodayDate(),
        type: initialData?.type || 'expense',
        category: initialData?.category || '',
        description: initialData?.description || '',
        amount: initialData?.amount || ''
    })
    const [errors, setErrors] = useState({})

    const categories = getCategories(formData.type)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'type' ? { category: '' } : {})
        }))

        // Clear error when field is changed
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const validate = () => {
        const newErrors = {}

        if (!formData.date) {
            newErrors.date = 'Date is required'
        }
        if (!formData.type) {
            newErrors.type = 'Type is required'
        }
        if (!formData.category) {
            newErrors.category = 'Category is required'
        }
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Please enter a valid amount'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        if (validate()) {
            onSubmit({
                ...formData,
                amount: parseFloat(formData.amount)
            })
        }
    }

    return (
        <form className="transaction-form" onSubmit={handleSubmit}>
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Date *</label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className={`form-input ${errors.date ? 'error' : ''}`}
                    />
                    {errors.date && <span className="form-error">{errors.date}</span>}
                </div>

                <div className="form-group">
                    <label className="form-label">Type *</label>
                    <div className="type-toggle">
                        <button
                            type="button"
                            className={`type-btn ${formData.type === 'income' ? 'active income' : ''}`}
                            onClick={() => handleChange({ target: { name: 'type', value: 'income' } })}
                        >
                            <span>📈</span> Income
                        </button>
                        <button
                            type="button"
                            className={`type-btn ${formData.type === 'expense' ? 'active expense' : ''}`}
                            onClick={() => handleChange({ target: { name: 'type', value: 'expense' } })}
                        >
                            <span>📉</span> Expense
                        </button>
                    </div>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className={`form-select ${errors.category ? 'error' : ''}`}
                    >
                        <option value="">Select category</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    {errors.category && <span className="form-error">{errors.category}</span>}
                </div>

                <div className="form-group">
                    <label className="form-label">Amount (₹) *</label>
                    <div className="amount-input-wrapper">
                        <span className="currency-symbol">₹</span>
                        <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            className={`form-input amount-input ${errors.amount ? 'error' : ''}`}
                        />
                    </div>
                    {errors.amount && <span className="form-error">{errors.amount}</span>}
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter a brief description..."
                    rows="3"
                    className="form-textarea"
                ></textarea>
            </div>

            <div className="form-actions">
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                    {loading ? (
                        <>
                            <span className="btn-loader"></span>
                            Saving...
                        </>
                    ) : (
                        <>
                            {initialData ? 'Update Transaction' : 'Add Transaction'}
                        </>
                    )}
                </button>
            </div>
        </form>
    )
}

export default TransactionForm
