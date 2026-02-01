import { Bar, Pie, Doughnut } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js'
import { formatCurrency } from '../utils/formatters'
import './Charts.css'

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
)

// Bar Chart for Income vs Expenses over time
export const IncomeExpenseChart = ({ data = {}, title = 'Income vs Expenses' }) => {
    const dailyData = data.dailyData || {}
    const labels = Object.keys(dailyData).sort()

    const chartData = {
        labels: labels.map(date => new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })),
        datasets: [
            {
                label: 'Income',
                data: labels.map(date => dailyData[date]?.income || 0),
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                borderColor: 'rgb(16, 185, 129)',
                borderWidth: 1,
                borderRadius: 4
            },
            {
                label: 'Expenses',
                data: labels.map(date => dailyData[date]?.expense || 0),
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                borderColor: 'rgb(239, 68, 68)',
                borderWidth: 1,
                borderRadius: 4
            }
        ]
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 20
                }
            },
            title: {
                display: true,
                text: title,
                font: { size: 16, weight: '600' },
                padding: { bottom: 20 }
            },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value) => formatCurrency(value)
                }
            }
        }
    }

    if (labels.length === 0) {
        return (
            <div className="chart-empty">
                <span>📊</span>
                <p>No data available for chart</p>
            </div>
        )
    }

    return (
        <div className="chart-container bar-chart">
            <Bar data={chartData} options={options} />
        </div>
    )
}

// Pie Chart for Category Breakdown
export const CategoryPieChart = ({ data = {}, title = 'Expense Categories' }) => {
    const categories = Object.keys(data)
    const values = Object.values(data)

    const colors = [
        'rgba(59, 130, 246, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(6, 182, 212, 0.8)',
        'rgba(249, 115, 22, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(168, 85, 247, 0.8)'
    ]

    const chartData = {
        labels: categories,
        datasets: [
            {
                data: values,
                backgroundColor: colors.slice(0, categories.length),
                borderColor: colors.slice(0, categories.length).map(c => c.replace('0.8', '1')),
                borderWidth: 2
            }
        ]
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    font: { size: 12 }
                }
            },
            title: {
                display: true,
                text: title,
                font: { size: 16, weight: '600' },
                padding: { bottom: 10 }
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0)
                        const percentage = ((context.parsed / total) * 100).toFixed(1)
                        return `${context.label}: ${formatCurrency(context.parsed)} (${percentage}%)`
                    }
                }
            }
        }
    }

    if (categories.length === 0) {
        return (
            <div className="chart-empty">
                <span>🥧</span>
                <p>No category data available</p>
            </div>
        )
    }

    return (
        <div className="chart-container pie-chart">
            <Doughnut data={chartData} options={options} />
        </div>
    )
}

// Summary Stats Card for Reports
export const ReportSummary = ({ data = {} }) => {
    const { summary = {} } = data

    return (
        <div className="report-summary">
            <div className="report-stat income">
                <span className="stat-icon">📈</span>
                <div className="stat-content">
                    <span className="stat-label">Total Income</span>
                    <span className="stat-value">{formatCurrency(summary.totalIncome || 0)}</span>
                </div>
            </div>
            <div className="report-stat expense">
                <span className="stat-icon">📉</span>
                <div className="stat-content">
                    <span className="stat-label">Total Expenses</span>
                    <span className="stat-value">{formatCurrency(summary.totalExpense || 0)}</span>
                </div>
            </div>
            <div className="report-stat balance">
                <span className="stat-icon">💰</span>
                <div className="stat-content">
                    <span className="stat-label">Net Balance</span>
                    <span className="stat-value">{formatCurrency(summary.balance || 0)}</span>
                </div>
            </div>
            <div className="report-stat count">
                <span className="stat-icon">📋</span>
                <div className="stat-content">
                    <span className="stat-label">Transactions</span>
                    <span className="stat-value">{summary.transactionCount || 0}</span>
                </div>
            </div>
        </div>
    )
}

export default { IncomeExpenseChart, CategoryPieChart, ReportSummary }
