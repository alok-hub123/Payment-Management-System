// Format number to INR currency
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount)
}

// Format date to readable format
export const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).format(date)
}

// Format date for input field (YYYY-MM-DD)
export const formatDateForInput = (dateString) => {
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
}

// Get today's date in YYYY-MM-DD format
export const getTodayDate = () => {
    return new Date().toISOString().split('T')[0]
}

// Category options
export const incomeCategories = [
    'Fees',
    'Admission',
    'Donation',
    'Event',
    'Other Income'
]

export const expenseCategories = [
    'Salary',
    'Rent',
    'Utilities',
    'Supplies',
    'Maintenance',
    'Transportation',
    'Food',
    'Marketing',
    'Equipment',
    'Other Expense'
]

// Get categories based on type
export const getCategories = (type) => {
    return type === 'income' ? incomeCategories : expenseCategories
}

// Truncate text
export const truncateText = (text, maxLength = 50) => {
    if (!text) return ''
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}
