// Utility helper functions for the Payment Management System

// Generate unique ID
const generateId = () => {
    return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Generate user ID
const generateUserId = () => {
    return `USR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Format currency to INR
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(amount);
};

// Format date to YYYY-MM-DD
const formatDate = (date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
};

// Get start and end of current week
const getCurrentWeekRange = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return {
        start: formatDate(startOfWeek),
        end: formatDate(endOfWeek)
    };
};

// Get start and end of current month
const getCurrentMonthRange = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return {
        start: formatDate(startOfMonth),
        end: formatDate(endOfMonth)
    };
};

// Validate transaction data
const validateTransaction = (data) => {
    const errors = [];

    if (!data.date) errors.push('Date is required');
    if (!data.type || !['income', 'expense'].includes(data.type)) {
        errors.push('Type must be either income or expense');
    }
    if (!data.category) errors.push('Category is required');
    if (!data.amount || isNaN(data.amount) || data.amount <= 0) {
        errors.push('Amount must be a positive number');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

module.exports = {
    generateId,
    generateUserId,
    formatCurrency,
    formatDate,
    getCurrentWeekRange,
    getCurrentMonthRange,
    validateTransaction
};
