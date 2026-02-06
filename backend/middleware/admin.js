const jwt = require('jsonwebtoken');

// Admin middleware - checks if user has admin role
const adminMiddleware = (req, res, next) => {
    try {
        // Check if user is already decoded from auth middleware
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Authentication required.'
            });
        }

        // Check if user has admin role (case-insensitive)
        if (req.user.role?.toLowerCase() !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error during authorization.'
        });
    }
};

module.exports = adminMiddleware;
