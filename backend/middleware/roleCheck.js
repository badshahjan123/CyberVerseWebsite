/**
 * Simple Role Check Middleware
 * Super Admin: badshahkha656@gmail.com (hardcoded for security)
 */

const SUPER_ADMIN_EMAIL = 'badshahkha656@gmail.com';

// Check if user is super admin (by email)
const isSuperAdmin = (req, res, next) => {
    if (req.user && req.user.email === SUPER_ADMIN_EMAIL) {
        return next();
    }
    return res.status(403).json({ message: 'Access denied. Super Admin only.' });
};

// Check if user is developer or higher
const isDeveloper = (req, res, next) => {
    if (req.user && (req.user.role === 'developer' || req.user.role === 'super_admin' || req.user.email === SUPER_ADMIN_EMAIL)) {
        return next();
    }
    return res.status(403).json({ message: 'Access denied. Developer access required.' });
};

// Check if user is admin or higher
const isAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin' || req.user.email === SUPER_ADMIN_EMAIL)) {
        return next();
    }
    return res.status(403).json({ message: 'Access denied. Admin access required.' });
};

module.exports = {
    isSuperAdmin,
    isDeveloper,
    isAdmin,
    SUPER_ADMIN_EMAIL
};
