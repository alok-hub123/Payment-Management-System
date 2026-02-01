import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AddTransaction from './pages/AddTransaction'
import TransactionHistory from './pages/TransactionHistory'
import Reports from './pages/Reports'
import './App.css'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth()

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loader"></div>
                <p>Loading...</p>
            </div>
        )
    }

    return isAuthenticated ? children : <Navigate to="/login" replace />
}

function App() {
    const { isAuthenticated } = useAuth()

    return (
        <div className="app">
            {isAuthenticated && <Navbar />}
            <main className={isAuthenticated ? 'main-content' : 'auth-content'}>
                <Routes>
                    <Route path="/login" element={
                        isAuthenticated ? <Navigate to="/" replace /> : <Login />
                    } />
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/add-transaction" element={
                        <ProtectedRoute>
                            <AddTransaction />
                        </ProtectedRoute>
                    } />
                    <Route path="/transactions" element={
                        <ProtectedRoute>
                            <TransactionHistory />
                        </ProtectedRoute>
                    } />
                    <Route path="/reports" element={
                        <ProtectedRoute>
                            <Reports />
                        </ProtectedRoute>
                    } />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </div>
    )
}

export default App
