const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// Initialize Google Sheets API
const initializeGoogleSheets = async () => {
    try {
        const keyFilePath = path.join(__dirname, '..', 'credentials.json');
        let credentials;

        if (fs.existsSync(keyFilePath)) {
            // Load from credentials.json file (local development)
            credentials = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));
            console.log('📁 Using credentials.json file');
        } else if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
            // Use environment variables (production/Render)
            // Handle escaped newlines in the private key
            const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
            credentials = {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: privateKey,
            };
            console.log('🌐 Using environment variables');
        } else {
            throw new Error('No credentials found. Provide credentials.json or set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY environment variables.');
        }

        console.log('📧 Service account:', credentials.client_email);
        console.log('🔑 Private key starts with:', credentials.private_key?.substring(0, 50));

        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: credentials.client_email,
                private_key: credentials.private_key,
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        console.log('✅ Google Sheets initialized');
        return sheets;
    } catch (error) {
        console.error('❌ Error initializing Google Sheets:', error.message);
        throw error;
    }
};

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;

// Sheet names (must match exactly with your Google Sheet tab names)
const SHEETS = {
    USERS: 'Users',
    TRANSACTIONS: 'Transections'
};

module.exports = {
    initializeGoogleSheets,
    SPREADSHEET_ID,
    SHEETS
};
