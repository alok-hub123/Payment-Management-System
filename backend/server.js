const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const reportRoutes = require('./routes/reports');
const userRoutes = require('./routes/users');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Payment Management System API is running',
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint to test Google Sheets connection
app.get('/api/debug/sheets', async (req, res) => {
  try {
    const { initializeGoogleSheets, SPREADSHEET_ID, SHEETS } = require('./config/googleSheets');
    const sheets = await initializeGoogleSheets();

    // Get spreadsheet metadata to see all sheet names
    const metadata = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const sheetNames = metadata.data.sheets.map(s => s.properties.title);

    res.json({
      success: true,
      spreadsheetId: SPREADSHEET_ID,
      spreadsheetTitle: metadata.data.properties.title,
      availableSheets: sheetNames,
      configuredSheets: SHEETS,
      message: 'Google Sheets connected successfully!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      code: error.code,
      details: error.response?.data?.error || null
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Payment Management System Backend`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📄 Spreadsheet ID: ${process.env.GOOGLE_SHEETS_ID}`);
});
