const { initializeGoogleSheets, SPREADSHEET_ID, SHEETS } = require('../config/googleSheets');

class SheetsService {
    constructor() {
        this.sheets = null;
    }

    async init() {
        if (!this.sheets) {
            this.sheets = await initializeGoogleSheets();
        }
        return this.sheets;
    }

    // ==================== USER OPERATIONS ====================

    async getUsers() {
        const sheets = await this.init();
        try {
            console.log('Fetching users from sheet:', SHEETS.USERS);
            console.log('Spreadsheet ID:', SPREADSHEET_ID);
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: `${SHEETS.USERS}!A:D`,
            });

            const rows = response.data.values || [];
            if (rows.length <= 1) return []; // Only header or empty

            // Skip header row and map to objects
            return rows.slice(1).map(row => ({
                id: row[0],
                email: row[1],
                password: row[2],
                name: row[3]
            }));
        } catch (error) {
            console.error('Error fetching users:', error.message);
            console.error('Response data:', JSON.stringify(error.response?.data || {}, null, 2));
            throw error;
        }
    }

    async getUserByEmail(email) {
        const users = await this.getUsers();
        return users.find(user => user.email === email);
    }

    async addUser(user) {
        const sheets = await this.init();
        const { id, email, password, name } = user;

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEETS.USERS}!A:D`,
            valueInputOption: 'RAW',
            resource: {
                values: [[id, email, password, name]]
            }
        });

        return user;
    }

    // ==================== TRANSACTION OPERATIONS ====================

    async getTransactions() {
        const sheets = await this.init();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEETS.TRANSACTIONS}!A:G`,
        });

        const rows = response.data.values || [];
        if (rows.length <= 1) return []; // Only header or empty

        // Skip header row and map to objects
        return rows.slice(1).map((row, index) => ({
            id: row[0],
            date: row[1],
            type: row[2],
            category: row[3],
            description: row[4],
            amount: parseFloat(row[5]) || 0,
            createdBy: row[6],
            rowIndex: index + 2 // +2 because of 0-index and header row
        }));
    }

    async getTransactionById(id) {
        const transactions = await this.getTransactions();
        return transactions.find(t => t.id === id);
    }

    async addTransaction(transaction) {
        const sheets = await this.init();
        const { id, date, type, category, description, amount, createdBy } = transaction;

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEETS.TRANSACTIONS}!A:G`,
            valueInputOption: 'RAW',
            resource: {
                values: [[id, date, type, category, description, amount, createdBy]]
            }
        });

        return transaction;
    }

    async updateTransaction(id, updates) {
        const sheets = await this.init();
        const transaction = await this.getTransactionById(id);

        if (!transaction) {
            throw new Error('Transaction not found');
        }

        const updatedTransaction = { ...transaction, ...updates };
        const { date, type, category, description, amount, createdBy } = updatedTransaction;

        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEETS.TRANSACTIONS}!A${transaction.rowIndex}:G${transaction.rowIndex}`,
            valueInputOption: 'RAW',
            resource: {
                values: [[id, date, type, category, description, amount, createdBy]]
            }
        });

        return updatedTransaction;
    }

    async deleteTransaction(id) {
        const sheets = await this.init();
        const transaction = await this.getTransactionById(id);

        if (!transaction) {
            throw new Error('Transaction not found');
        }

        // Clear the row (we can't truly delete rows easily, so we clear it)
        await sheets.spreadsheets.values.clear({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEETS.TRANSACTIONS}!A${transaction.rowIndex}:G${transaction.rowIndex}`,
        });

        return true;
    }

    // ==================== REPORT OPERATIONS ====================

    async getTransactionsByDateRange(startDate, endDate) {
        const transactions = await this.getTransactions();
        return transactions.filter(t => {
            const txDate = new Date(t.date);
            return txDate >= new Date(startDate) && txDate <= new Date(endDate);
        });
    }

    async calculateBalance() {
        const transactions = await this.getTransactions();
        let income = 0;
        let expense = 0;

        transactions.forEach(t => {
            if (t.type === 'income') {
                income += t.amount;
            } else if (t.type === 'expense') {
                expense += t.amount;
            }
        });

        return {
            totalIncome: income,
            totalExpense: expense,
            balance: income - expense
        };
    }
}

module.exports = new SheetsService();
