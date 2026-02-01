import { formatCurrency, truncateText } from '../utils/formatters'
import './TransactionTable.css'

const TransactionTable = ({
    transactions = [],
    loading = false,
    onEdit,
    onDelete,
    showActions = true,
    showCreatedBy = true
}) => {
    if (loading) {
        return (
            <div className="table-loading">
                <div className="table-skeleton">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="skeleton-row">
                            <div className="skeleton skeleton-cell"></div>
                            <div className="skeleton skeleton-cell"></div>
                            <div className="skeleton skeleton-cell"></div>
                            <div className="skeleton skeleton-cell"></div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (transactions.length === 0) {
        return (
            <div className="empty-state">
                <span className="empty-icon">📋</span>
                <h3>No transactions found</h3>
                <p>Start by adding your first transaction</p>
            </div>
        )
    }

    const formatDate = (dateStr) => {
        const date = new Date(dateStr)
        return {
            day: date.getDate(),
            month: date.toLocaleString('default', { month: 'short' }),
            year: date.getFullYear().toString().slice(-2)
        }
    }

    return (
        <div className="table-container">
            <table className="table transactions-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Category</th>
                        <th className="hide-mobile">Description</th>
                        <th className="text-right">Amount</th>
                        {showCreatedBy && <th className="hide-mobile">Created By</th>}
                        {showActions && <th className="text-center">Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((transaction, index) => {
                        const date = formatDate(transaction.date)
                        return (
                            <tr key={transaction.id} style={{ animationDelay: `${index * 0.05}s` }}>
                                <td>
                                    <div className="date-cell">
                                        <span className="date-day">{date.day}</span>
                                        <span className="date-month">{date.month} '{date.year}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className={`badge badge-${transaction.type}`}>
                                        {transaction.type === 'income' ? '↑' : '↓'} {transaction.type}
                                    </span>
                                </td>
                                <td>
                                    <span className="category-cell">{transaction.category}</span>
                                </td>
                                <td className="hide-mobile">
                                    <span className="description-cell" title={transaction.description}>
                                        {truncateText(transaction.description, 30) || '-'}
                                    </span>
                                </td>
                                <td className="text-right">
                                    <span className={`amount-cell ${transaction.type}`}>
                                        {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                                    </span>
                                </td>
                                {showCreatedBy && (
                                    <td className="hide-mobile">
                                        <div className="created-by-cell">
                                            <div className="user-avatar">
                                                {(transaction.createdBy || 'U')[0].toUpperCase()}
                                            </div>
                                            <span className="created-by-name">{transaction.createdBy || 'Unknown'}</span>
                                        </div>
                                    </td>
                                )}
                                {showActions && (
                                    <td className="text-center">
                                        <div className="action-buttons">
                                            <button
                                                className="action-btn edit-btn"
                                                onClick={() => onEdit && onEdit(transaction)}
                                                title="Edit"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="action-btn delete-btn"
                                                onClick={() => onDelete && onDelete(transaction.id)}
                                                title="Delete"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

export default TransactionTable
