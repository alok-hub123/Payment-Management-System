# Payment Management System

A production-ready web application for Aimer's Academy to digitize income and expense tracking, replacing manual registers with a cloud-synced, secure system.

## 🚀 Features

- **Secure Authentication** - JWT-based login with bcrypt password hashing
- **Transaction Management** - Full CRUD operations for income and expenses
- **Real-time Balance** - Auto-calculated current balance in INR (₹)
- **Reports** - Weekly and monthly financial summaries with charts
- **Responsive Design** - Works seamlessly on mobile and desktop
- **Cloud Sync** - Data stored securely in Google Sheets

## 📦 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js + Vite |
| Styling | Custom CSS |
| Charts | Chart.js |
| Backend | Node.js + Express.js |
| Auth | JWT + bcrypt |
| Database | Google Sheets API |

## 📁 Project Structure

```
Payment Management System/
├── backend/
│   ├── config/           # Google Sheets configuration
│   ├── middleware/       # JWT auth middleware
│   ├── routes/           # API routes (auth, transactions, reports)
│   ├── services/         # Google Sheets service
│   ├── utils/            # Helper functions
│   ├── server.js         # Express server
│   └── .env              # Environment variables
│
└── frontend/
    └── src/
        ├── components/   # Reusable UI components
        ├── pages/        # Page components
        ├── services/     # API client
        ├── context/      # Auth context
        └── utils/        # Formatting utilities
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js v18 or higher
- Google Cloud account with Sheets API enabled
- A Google Sheet for data storage

### 1. Google Sheets Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable **Google Sheets API**
4. Create a **Service Account**:
   - Go to IAM & Admin → Service Accounts
   - Create new service account
   - Generate a JSON key file
5. Create a new Google Sheet with two sheets:
   - Sheet 1: `Users` (columns: id, email, password, name)
   - Sheet 2: `Transactions` (columns: id, date, type, category, description, amount, createdBy)
6. Share the Google Sheet with your service account email (give Editor access)

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
# Edit .env file with your Google Sheets credentials:
```

Edit `backend/.env`:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secure_jwt_secret_key
JWT_EXPIRES_IN=7d
GOOGLE_SHEETS_ID=your_google_sheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-sa@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour key here\n-----END PRIVATE KEY-----\n"
```

```bash
# Start the server
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Create First User

Since there's no public registration, create the first user by making a POST request:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@aimers.academy", "password": "securepassword", "name": "Admin"}'
```

Or use a tool like Postman to send the request.

## 🖥️ Usage

1. Open `http://localhost:5173` in your browser
2. Login with your credentials
3. Use the Dashboard to view overview and quick actions
4. Add transactions via the "Add Transaction" page
5. View history and filter transactions in "Transaction History"
6. Generate weekly/monthly reports in "Reports"

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (initial setup)
- `GET /api/auth/me` - Get current user info

### Transactions
- `GET /api/transactions` - List all transactions (with filters)
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Reports
- `GET /api/reports/balance` - Get current balance
- `GET /api/reports/weekly` - Weekly report
- `GET /api/reports/monthly` - Monthly report
- `GET /api/reports/summary` - Overall summary

## 🔐 Security

- Passwords are hashed using bcrypt
- JWT tokens expire after 7 days
- All API routes (except login/register) are protected
- CORS configured for frontend origin only

## 📱 Screenshots

The application includes:
- Professional login page with branding
- Dashboard with summary cards and quick actions
- Transaction form with type toggle and validation
- Filterable transaction history with edit/delete
- Reports page with bar and pie charts

## 📄 License

ISC License - Aimer's Academy

---

**Built with ❤️ for Aimer's Academy**
