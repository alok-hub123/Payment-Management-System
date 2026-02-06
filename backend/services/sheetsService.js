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
                range: `${SHEETS.USERS}!A:E`,
            });

            const rows = response.data.values || [];
            if (rows.length <= 1) return []; // Only header or empty

            // Skip header row and map to objects
            return rows.slice(1).map(row => ({
                id: row[0],
                email: row[1],
                password: row[2],
                name: row[3],
                role: row[4] || 'user' // Default to 'user' if no role specified
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
        const { id, email, password, name, role = 'user' } = user;

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEETS.USERS}!A:E`,
            valueInputOption: 'RAW',
            resource: {
                values: [[id, email, password, name, role]]
            }
        });

        return { ...user, role };
    }

    async getUserById(id) {
        const sheets = await this.init();
        try {
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: `${SHEETS.USERS}!A:E`,
            });

            const rows = response.data.values || [];
            if (rows.length <= 1) return null;

            // Find user and their row index
            for (let i = 1; i < rows.length; i++) {
                if (rows[i][0] === id) {
                    return {
                        id: rows[i][0],
                        email: rows[i][1],
                        password: rows[i][2],
                        name: rows[i][3],
                        role: rows[i][4] || 'user',
                        rowIndex: i + 1 // 1-indexed for Sheets
                    };
                }
            }
            return null;
        } catch (error) {
            console.error('Error fetching user by ID:', error.message);
            throw error;
        }
    }

    async updateUser(id, updates) {
        const sheets = await this.init();
        const user = await this.getUserById(id);

        if (!user) {
            throw new Error('User not found');
        }

        const updatedUser = { ...user, ...updates };
        const { email, password, name, role } = updatedUser;

        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEETS.USERS}!A${user.rowIndex}:E${user.rowIndex}`,
            valueInputOption: 'RAW',
            resource: {
                values: [[id, email, password, name, role || 'user']]
            }
        });

        return { id, email, name, role: role || 'user' };
    }

    async deleteUser(id) {
        const sheets = await this.init();
        const user = await this.getUserById(id);

        if (!user) {
            throw new Error('User not found');
        }

        // Clear the row (including role column E)
        await sheets.spreadsheets.values.clear({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEETS.USERS}!A${user.rowIndex}:E${user.rowIndex}`,
        });

        return true;
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

        // Normalize dates to YYYY-MM-DD format for comparison (using local time)
        const normalizeDate = (dateStr) => {
            if (!dateStr) return null;
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return null;
            // Return YYYY-MM-DD format using local time (not UTC)
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const start = normalizeDate(startDate);
        const end = normalizeDate(endDate);

        if (!start || !end) {
            console.error('Invalid date range:', { startDate, endDate });
            return [];
        }

        return transactions.filter(t => {
            const txDate = normalizeDate(t.date);
            if (!txDate) {
                console.log('Invalid transaction date:', t.date, 'for transaction:', t.id);
                return false;
            }
            // String comparison works for YYYY-MM-DD format
            return txDate >= start && txDate <= end;
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
