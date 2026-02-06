const express = require('express');
const bcrypt = require('bcryptjs');
const sheetsService = require('../services/sheetsService');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const { generateUserId } = require('../utils/helpers');

const router = express.Router();

// All routes require authentication AND admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// GET /api/users - Get all users (excluding passwords)
router.get('/', async (req, res) => {
    try {
        const users = await sheetsService.getUsers();

        // Remove passwords from response
        const safeUsers = users.map(({ password, ...user }) => user);

        res.json({
            success: true,
            data: safeUsers
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users'
        });
    }
});

// POST /api/users - Add a new user
router.post('/', async (req, res) => {
    try {
        const { email, password, name, role = 'user' } = req.body;

        // Validate input
        if (!email || !password || !name) {
            return res.status(400).json({
                success: false,
                message: 'Email, password, and name are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Check password length
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        // Validate role
        const userRole = role.toLowerCase();
        if (!['admin', 'user'].includes(userRole)) {
            return res.status(400).json({
                success: false,
                message: 'Role must be either "admin" or "user"'
            });
        }

        // Check if user already exists
        const existingUser = await sheetsService.getUserByEmail(email);

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = {
            id: generateUserId(),
            email,
            password: hashedPassword,
            name,
            role: userRole
        };

        await sheetsService.addUser(newUser);

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create user'
        });
    }
});

// PUT /api/users/:id - Update a user
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, role } = req.body;

        // Prevent modifying your own role
        if (id === req.user.id && role && role.toLowerCase() !== req.user.role?.toLowerCase()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot change your own role'
            });
        }

        // Build updates object
        const updates = {};
        if (name) updates.name = name;
        if (email) {
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email format'
                });
            }
            updates.email = email;
        }
        if (password) {
            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'Password must be at least 6 characters'
                });
            }
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(password, salt);
        }
        if (role) {
            if (!['admin', 'user'].includes(role.toLowerCase())) {
                return res.status(400).json({
                    success: false,
                    message: 'Role must be either "admin" or "user"'
                });
            }
            updates.role = role.toLowerCase();
        }

        const updatedUser = await sheetsService.updateUser(id, updates);

        res.json({
            success: true,
            message: 'User updated successfully',
            data: updatedUser
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update user'
        });
    }
});

// DELETE /api/users/:id - Delete a user
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent deleting yourself
        if (id === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own account'
            });
        }

        await sheetsService.deleteUser(id);

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete user'
        });
    }
});

module.exports = router;
