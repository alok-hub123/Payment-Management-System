const express = require('express');
const authMiddleware = require('../middleware/auth');
const sheetsService = require('../services/sheetsService');
const { getCurrentWeekRange, getCurrentMonthRange } = require('../utils/helpers');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET /api/reports/balance - Get current balance
router.get('/balance', async (req, res) => {
    try {
        const balance = await sheetsService.calculateBalance();

        res.json({
            success: true,
            data: balance
        });
    } catch (error) {
        console.error('Get balance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error calculating balance'
        });
    }
});

// GET /api/reports/weekly - Get weekly report
router.get('/weekly', async (req, res) => {
    try {
        const { start, end } = getCurrentWeekRange();
        const transactions = await sheetsService.getTransactionsByDateRange(start, end);

        let income = 0;
        let expense = 0;
        const categoryBreakdown = {};
        const dailyData = {};

        transactions.forEach(t => {
            // Track totals
            if (t.type === 'income') {
                income += t.amount;
            } else {
                expense += t.amount;
                // Track expense by category
                if (!categoryBreakdown[t.category]) {
                    categoryBreakdown[t.category] = 0;
                }
                categoryBreakdown[t.category] += t.amount;
            }

            // Track daily data for charts
            if (!dailyData[t.date]) {
                dailyData[t.date] = { income: 0, expense: 0 };
            }
            dailyData[t.date][t.type] += t.amount;
        });

        res.json({
            success: true,
            data: {
                period: 'weekly',
                startDate: start,
                endDate: end,
                summary: {
                    totalIncome: income,
                    totalExpense: expense,
                    balance: income - expense,
                    transactionCount: transactions.length
                },
                categoryBreakdown,
                dailyData,
                transactions
            }
        });
    } catch (error) {
        console.error('Get weekly report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating weekly report'
        });
    }
});

// GET /api/reports/monthly - Get monthly report
router.get('/monthly', async (req, res) => {
    try {
        const { month, year } = req.query;

        let startDate, endDate;

        if (month && year) {
            // Use provided month and year
            startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
            endDate = new Date(year, month, 0).toISOString().split('T')[0];
        } else {
            // Use current month
            const range = getCurrentMonthRange();
            startDate = range.start;
            endDate = range.end;
        }

        const transactions = await sheetsService.getTransactionsByDateRange(startDate, endDate);

        let income = 0;
        let expense = 0;
        const categoryBreakdown = {};
        const dailyData = {};

        transactions.forEach(t => {
            // Track totals
            if (t.type === 'income') {
                income += t.amount;
            } else {
                expense += t.amount;
                // Track expense by category
                if (!categoryBreakdown[t.category]) {
                    categoryBreakdown[t.category] = 0;
                }
                categoryBreakdown[t.category] += t.amount;
            }

            // Track daily data for charts
            if (!dailyData[t.date]) {
                dailyData[t.date] = { income: 0, expense: 0 };
            }
            dailyData[t.date][t.type] += t.amount;
        });

        res.json({
            success: true,
            data: {
                period: 'monthly',
                startDate,
                endDate,
                summary: {
                    totalIncome: income,
                    totalExpense: expense,
                    balance: income - expense,
                    transactionCount: transactions.length
                },
                categoryBreakdown,
                dailyData,
                transactions
            }
        });
    } catch (error) {
        console.error('Get monthly report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating monthly report'
        });
    }
});

// GET /api/reports/range - Get report for custom date range
router.get('/range', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Both startDate and endDate are required'
            });
        }

        const transactions = await sheetsService.getTransactionsByDateRange(startDate, endDate);

        let income = 0;
        let expense = 0;
        const categoryBreakdown = {};
        const dailyData = {};

        transactions.forEach(t => {
            // Track totals
            if (t.type === 'income') {
                income += t.amount;
            } else {
                expense += t.amount;
                // Track expense by category
                if (!categoryBreakdown[t.category]) {
                    categoryBreakdown[t.category] = 0;
                }
                categoryBreakdown[t.category] += t.amount;
            }

            // Track daily data for charts
            if (!dailyData[t.date]) {
                dailyData[t.date] = { income: 0, expense: 0 };
            }
            dailyData[t.date][t.type] += t.amount;
        });

        res.json({
            success: true,
            data: {
                period: 'custom',
                startDate,
                endDate,
                summary: {
                    totalIncome: income,
                    totalExpense: expense,
                    balance: income - expense,
                    transactionCount: transactions.length
                },
                categoryBreakdown,
                dailyData,
                transactions
            }
        });
    } catch (error) {
        console.error('Get custom range report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating custom range report'
        });
    }
});

// GET /api/reports/summary - Get overall summary
router.get('/summary', async (req, res) => {
    try {
        const transactions = await sheetsService.getTransactions();
        const balance = await sheetsService.calculateBalance();

        // Get recent transactions (last 5)
        const recentTransactions = [...transactions]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        // Category breakdown for all expenses
        const categoryBreakdown = {};
        transactions.forEach(t => {
            if (t.type === 'expense') {
                if (!categoryBreakdown[t.category]) {
                    categoryBreakdown[t.category] = 0;
                }
                categoryBreakdown[t.category] += t.amount;
            }
        });

        res.json({
            success: true,
            data: {
                ...balance,
                transactionCount: transactions.length,
                recentTransactions,
                categoryBreakdown
            }
        });
    } catch (error) {
        console.error('Get summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating summary'
        });
    }
});

module.exports = router;
