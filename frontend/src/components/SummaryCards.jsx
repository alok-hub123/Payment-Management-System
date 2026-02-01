import { formatCurrency } from '../utils/formatters'
import './SummaryCards.css'

const SummaryCards = ({ totalIncome = 0, totalExpense = 0, balance = 0, loading = false }) => {
    const cards = [
        {
            title: 'Total Income',
            value: totalIncome,
            icon: '📈',
            className: 'income',
            trend: '+12.5%'
        },
        {
            title: 'Total Expenses',
            value: totalExpense,
            icon: '📉',
            className: 'expense',
            trend: '-8.3%'
        },
        {
            title: 'Current Balance',
            value: balance,
            icon: '💰',
            className: balance >= 0 ? 'positive' : 'negative',
            trend: balance >= 0 ? 'Healthy' : 'Low'
        }
    ]

    if (loading) {
        return (
            <div className="summary-cards">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="summary-card loading">
                        <div className="skeleton skeleton-icon"></div>
                        <div className="skeleton skeleton-text"></div>
                        <div className="skeleton skeleton-value"></div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="summary-cards">
            {cards.map((card, index) => (
                <div key={index} className={`summary-card ${card.className}`}>
                    <div className="card-header">
                        <span className="card-icon">{card.icon}</span>
                        <span className="card-trend">{card.trend}</span>
                    </div>
                    <div className="card-content">
                        <h3 className="card-title">{card.title}</h3>
                        <p className="card-value">{formatCurrency(card.value)}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default SummaryCards
