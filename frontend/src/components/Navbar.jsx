import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

const Navbar = () => {
    const { user, logout } = useAuth()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const location = useLocation()

    const navItems = [
        { path: '/', label: 'Dashboard', icon: '📊' },
        { path: '/add-transaction', label: 'Add Transaction', icon: '➕' },
        { path: '/transactions', label: 'Transactions', icon: '📋' },
        { path: '/reports', label: 'Reports', icon: '📈' }
    ]

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen)
    }

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false)
    }

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="logo">
                        <span className="logo-icon">
                            <img src="./logo.jpg" alt="Aimers Logo" />
                        </span>
                        <div className="logo-text">
                            <span className="logo-title">Aimers</span>
                            <span className="logo-subtitle">PMS</span>
                        </div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `nav-link ${isActive ? 'active' : ''}`
                            }
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="user-details">
                            <span className="user-name">{user?.name || 'User'}</span>
                            <span className="user-email">{user?.email || ''}</span>
                        </div>
                    </div>
                    <button className="logout-btn" onClick={logout}>
                        <span>←</span>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="mobile-header">
                <button className="menu-toggle" onClick={toggleMobileMenu}>
                    <span className="hamburger"></span>
                </button>
                <div className="mobile-header-logo">
                    <span className="logo-icon">
                        <img src="./logo.jpg" alt="Aimers Logo" />
                    </span>
                    <span className="logo-title">Aimers PMS</span>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="mobile-overlay" onClick={closeMobileMenu}></div>
            )}

            {/* Mobile Menu */}
            <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="mobile-menu-header">
                    <span className="logo-icon">
                        <img src="./logo.jpg" alt="Aimers Logo" />
                    </span>
                    <div className="logo-text">
                        <span className="logo-title">Aimers</span>
                        <span className="logo-subtitle">PMS</span>
                    </div>
                    <button className="close-menu" onClick={closeMobileMenu}>✕</button>
                </div>

                <nav className="mobile-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `mobile-nav-link ${isActive ? 'active' : ''}`
                            }
                            onClick={closeMobileMenu}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="mobile-menu-footer">
                    <div className="user-info">
                        <div className="user-avatar">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span className='user-name'>{user?.name || 'User'}</span>
                    </div>
                    <button className="logout-btn" onClick={() => { logout(); closeMobileMenu(); }}>
                        <span>←</span>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </>
    )
}

export default Navbar
