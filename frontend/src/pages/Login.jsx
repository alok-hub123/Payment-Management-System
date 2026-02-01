import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './Login.css'

const Login = () => {
    const { login } = useAuth()
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (error) setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!formData.email || !formData.password) {
            setError('Please enter both email and password')
            return
        }

        setLoading(true)
        const result = await login(formData.email, formData.password)

        if (!result.success) {
            setError(result.message)
        }
        setLoading(false)
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-logo">
                        <img src="./logo.jpg" alt="Aimers Logo" />
                    </div>
                    <h1 className="login-title">Welcome Back</h1>
                    <p className="login-subtitle">Aimers PMS</p>
                    <p className="login-org">Payment Management System</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    {error && (
                        <div className="alert alert-error">
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            className="form-input"
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            className="form-input"
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg login-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="btn-loader"></span>
                                Signing in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p>© 2026 Aimer's Academy</p>
                </div>
            </div>

            <div className="login-decoration">
                <div className="decoration-content">
                    <h2>Manage Your Finances</h2>
                    <p>Track income and expenses with ease. Generate reports, maintain records, and stay organized.</p>
                    <div className="features-list">
                        <div className="feature-item">
                            <span>✓</span> Real-time balance tracking
                        </div>
                        <div className="feature-item">
                            <span>✓</span> Weekly & monthly reports
                        </div>
                        <div className="feature-item">
                            <span>✓</span> Cloud sync with Google Sheets
                        </div>
                        <div className="feature-item">
                            <span>✓</span> Secure & reliable
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
