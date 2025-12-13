const User = require('../models/User');
const { ApiError } = require('./errorHandler');
const { HTTP_STATUS, MESSAGES } = require('../config/constants');
const asyncHandler = require('./asyncHandler');

// Fetches user and attaches to request
// Saves us from repeating User.findById in every route
const attachUser = asyncHandler(async (req, res, next) => {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, MESSAGES.UNAUTHORIZED);
    }

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, MESSAGES.USER_NOT_FOUND);
    }

    req.userDoc = user;
    next();
});

// Same as attachUser but can select specific fields
const attachUserWithFields = (fields = []) => {
    return asyncHandler(async (req, res, next) => {
        const userId = req.user?.id || req.user?._id;

        if (!userId) {
            throw new ApiError(HTTP_STATUS.UNAUTHORIZED, MESSAGES.UNAUTHORIZED);
        }

        const user = await User.findById(userId).select(fields.join(' '));

        if (!user) {
            throw new ApiError(HTTP_STATUS.NOT_FOUND, MESSAGES.USER_NOT_FOUND);
        }

        req.userDoc = user;
        next();
    });
};

// Checks if user has premium subscription
const requirePremium = (req, res, next) => {
    if (!req.userDoc) {
        throw new ApiError(
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            'attachUser middleware must be called before requirePremium'
        );
    }

    if (!req.userDoc.isPremium) {
        throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Premium subscription required');
    }

    next();
};

// Checks if user is admin
const requireAdmin = (req, res, next) => {
    if (!req.userDoc) {
        throw new ApiError(
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            'attachUser middleware must be called before requireAdmin'
        );
    }

    if (req.userDoc.role !== 'admin') {
        throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Admin access required');
    }

    next();
};

module.exports = {
    attachUser,
    attachUserWithFields,
    requirePremium,
    requireAdmin
};
