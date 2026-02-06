import { useState, useEffect } from 'react'
import api from '../services/api'
import './UserManagement.css'

const UserManagement = () => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [editingUser, setEditingUser] = useState(null)
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' })
    const [formError, setFormError] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState(null)

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const response = await api.get('/users')
            if (response.data.success) {
                setUsers(response.data.data)
            }
        } catch (err) {
            setError('Failed to load users')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        setFormError('')
    }

    const resetForm = () => {
        setFormData({ name: '', email: '', password: '', role: 'user' })
        setFormError('')
    }

    const handleAddUser = async (e) => {
        e.preventDefault()
        setFormError('')

        // Validation
        if (!formData.name || !formData.email || !formData.password) {
            setFormError('All fields are required')
            return
        }

        if (formData.password.length < 6) {
            setFormError('Password must be at least 6 characters')
            return
        }

        try {
            setSubmitting(true)
            const response = await api.post('/users', formData)
            if (response.data.success) {
                setUsers(prev => [...prev, response.data.data])
                setShowAddModal(false)
                resetForm()
            }
        } catch (err) {
            setFormError(err.response?.data?.message || 'Failed to add user')
        } finally {
            setSubmitting(false)
        }
    }

    const openEditModal = (user) => {
        setEditingUser(user)
        setFormData({
            name: user.name,
            email: user.email,
            password: '', // Don't pre-fill password
            role: user.role || 'user'
        })
        setShowEditModal(true)
    }

    const handleEditUser = async (e) => {
        e.preventDefault()
        setFormError('')

        if (!formData.name || !formData.email) {
            setFormError('Name and email are required')
            return
        }

        if (formData.password && formData.password.length < 6) {
            setFormError('Password must be at least 6 characters')
            return
        }

        try {
            setSubmitting(true)
            const updateData = {
                name: formData.name,
                email: formData.email,
                role: formData.role
            }
            // Only include password if it was entered
            if (formData.password) {
                updateData.password = formData.password
            }

            const response = await api.put(`/users/${editingUser.id}`, updateData)
            if (response.data.success) {
                setUsers(prev => prev.map(u =>
                    u.id === editingUser.id ? response.data.data : u
                ))
                setShowEditModal(false)
                setEditingUser(null)
                resetForm()
            }
        } catch (err) {
            setFormError(err.response?.data?.message || 'Failed to update user')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeleteUser = async (id) => {
        try {
            const response = await api.delete(`/users/${id}`)
            if (response.data.success) {
                setUsers(prev => prev.filter(user => user.id !== id))
                setDeleteConfirm(null)
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete user')
            setDeleteConfirm(null)
        }
    }

    if (loading) {
        return (
            <div className="user-management">
                <div className="loading-container">
                    <div className="loader"></div>
                    <p>Loading users...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="user-management">
            <div className="page-header">
                <div className="header-content">
                    <h1>👥 Users</h1>
                    <p>Manage collaborators who can access the system</p>
                </div>
                <button
                    className="btn-add-user"
                    onClick={() => {
                        resetForm()
                        setShowAddModal(true)
                    }}
                >
                    <span>➕</span>
                    Add User
                </button>
            </div>

            {error && (
                <div className="error-message">
                    <span>⚠️</span>
                    {error}
                    <button onClick={() => setError('')}>✕</button>
                </div>
            )}

            <div className="users-grid">
                {users.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">👤</span>
                        <h3>No users found</h3>
                        <p>Add your first collaborator to get started</p>
                    </div>
                ) : (
                    users.map(user => (
                        <div key={user.id} className="user-card">
                            <div className='um-card-header'>
                                <span className={`um-role ${user.role?.toLowerCase() === 'admin' ? 'admin' : 'user'}`}>
                                    {user.role?.toLowerCase() === 'admin' ? '👑 Admin' : '👤 User'}
                                </span>
                                <div className="user-actions">
                                    <button
                                        className="btn-edit"
                                        onClick={() => openEditModal(user)}
                                        title="Edit user"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="btn-delete"
                                        onClick={() => setDeleteConfirm(user.id)}
                                        title="Delete user"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                            <div className="user-card-header">
                                <div className="user-card-main">
                                    <div className="um-avatar">
                                        {user.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div className="um-info">
                                        <h3 className="um-name">{user.name}</h3>
                                        <p className="um-email">{user.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div >

            {/* Add User Modal */}
            {
                showAddModal && (
                    <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Add New Collaborator</h2>
                                <button
                                    className="btn-close"
                                    onClick={() => setShowAddModal(false)}
                                >
                                    ✕
                                </button>
                            </div>
                            <form onSubmit={handleAddUser}>
                                <div className="form-group">
                                    <label htmlFor="name">Full Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter full name"
                                        autoComplete="off"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">Email Address</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Enter email address"
                                        autoComplete="off"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="password">Password</label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Enter password (min 6 characters)"
                                        autoComplete="new-password"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="role">Role</label>
                                    <select
                                        id="role"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                {formError && (
                                    <div className="form-error">
                                        <span>⚠️</span>
                                        {formError}
                                    </div>
                                )}
                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        className="btn-cancel"
                                        onClick={() => setShowAddModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-submit"
                                        disabled={submitting}
                                    >
                                        {submitting ? 'Adding...' : 'Add User'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Edit User Modal */}
            {
                showEditModal && (
                    <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Edit User</h2>
                                <button
                                    className="btn-close"
                                    onClick={() => setShowEditModal(false)}
                                >
                                    ✕
                                </button>
                            </div>
                            <form onSubmit={handleEditUser}>
                                <div className="form-group">
                                    <label htmlFor="edit-name">Full Name</label>
                                    <input
                                        type="text"
                                        id="edit-name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter full name"
                                        autoComplete="off"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="edit-email">Email Address</label>
                                    <input
                                        type="email"
                                        id="edit-email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Enter email address"
                                        autoComplete="off"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="edit-password">New Password (optional)</label>
                                    <input
                                        type="password"
                                        id="edit-password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Leave blank to keep current"
                                        autoComplete="new-password"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="edit-role">Role</label>
                                    <select
                                        id="edit-role"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                {formError && (
                                    <div className="form-error">
                                        <span>⚠️</span>
                                        {formError}
                                    </div>
                                )}
                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        className="btn-cancel"
                                        onClick={() => setShowEditModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-submit"
                                        disabled={submitting}
                                    >
                                        {submitting ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Delete Confirmation Modal */}
            {
                deleteConfirm && (
                    <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
                        <div className="modal modal-confirm" onClick={e => e.stopPropagation()}>
                            <div className="confirm-icon">⚠️</div>
                            <h2>Delete User?</h2>
                            <p>This action cannot be undone. The user will lose access to the system.</p>
                            <div className="modal-actions">
                                <button
                                    className="btn-cancel"
                                    onClick={() => setDeleteConfirm(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn-danger"
                                    onClick={() => handleDeleteUser(deleteConfirm)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    )
}

export default UserManagement
