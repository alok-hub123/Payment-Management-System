import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(localStorage.getItem('token'))
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                try {
                    const response = await api.get('/auth/me')
                    if (response.data.success) {
                        setUser(response.data.data.user)
                    }
                } catch (error) {
                    console.error('Auth check failed:', error)
                    logout()
                }
            }
            setLoading(false)
        }

        initAuth()
    }, [token])

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password })

            if (response.data.success) {
                const { token: newToken, user: userData } = response.data.data
                localStorage.setItem('token', newToken)
                setToken(newToken)
                setUser(userData)
                return { success: true }
            }

            return { success: false, message: response.data.message }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed. Please try again.'
            }
        }
    }

    const logout = () => {
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
    }

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        logout
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext
