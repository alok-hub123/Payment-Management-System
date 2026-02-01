const express = require('express');
const authMiddleware = require('../middleware/auth');
const sheetsService = require('../services/sheetsService');
const { generateId, validateTransaction, formatDate } = require('../utils/helpers');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET /api/transactions - Get all transactions
router.get('/', async (req, res) => {
    try {
        const { type, startDate, endDate, category } = req.query;

        let transactions = await sheetsService.getTransactions();

        // Filter by type if provided
        if (type && ['income', 'expense'].includes(type)) {
            transactions = transactions.filter(t => t.type === type);
        }

        // Filter by date range if provided
        if (startDate) {
            transactions = transactions.filter(t => new Date(t.date) >= new Date(startDate));
        }
        if (endDate) {
            transactions = transactions.filter(t => new Date(t.date) <= new Date(endDate));
        }

        // Filter by category if provided
        if (category) {
            transactions = transactions.filter(t => t.category.toLowerCase() === category.toLowerCase());
        }

        // Sort by date (newest first)
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json({
            success: true,
            data: {
                transactions,
                count: transactions.length
            }
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching transactions'
        });
    }
});

// GET /api/transactions/:id - Get single transaction
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await sheetsService.getTransactionById(id);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        res.json({
            success: true,
            data: { transaction }
        });
    } catch (error) {
        console.error('Get transaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching transaction'
        });
    }
});

// POST /api/transactions - Create new transaction
router.post('/', async (req, res) => {
    try {
        const { date, type, category, description, amount } = req.body;

        // Validate input
        const validation = validateTransaction({ date, type, category, amount });
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const transaction = {
            id: generateId(),
            date: formatDate(date),
            type,
            category,
            description: description || '',
            amount: parseFloat(amount),
            createdBy: req.user.name || req.user.email
        };

        await sheetsService.addTransaction(transaction);

        res.status(201).json({
            success: true,
            message: 'Transaction created successfully',
            data: { transaction }
        });
    } catch (error) {
        console.error('Create transaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating transaction'
        });
    }
});

// PUT /api/transactions/:id - Update transaction
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { date, type, category, description, amount } = req.body;

        // Check if transaction exists
        const existingTransaction = await sheetsService.getTransactionById(id);
        if (!existingTransaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        // Prepare updates
        const updates = {};
        if (date) updates.date = formatDate(date);
        if (type) updates.type = type;
        if (category) updates.category = category;
        if (description !== undefined) updates.description = description;
        if (amount) updates.amount = parseFloat(amount);

        const updatedTransaction = await sheetsService.updateTransaction(id, updates);

        res.json({
            success: true,
            message: 'Transaction updated successfully',
            data: { transaction: updatedTransaction }
        });
    } catch (error) {
        console.error('Update transaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating transaction'
        });
    }
});

// DELETE /api/transactions/:id - Delete transaction
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if transaction exists
        const existingTransaction = await sheetsService.getTransactionById(id);
        if (!existingTransaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        await sheetsService.deleteTransaction(id);

        res.json({
            success: true,
            message: 'Transaction deleted successfully'
        });
    } catch (error) {
        console.error('Delete transaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting transaction'
        });
    }
});

module.exports = router;
