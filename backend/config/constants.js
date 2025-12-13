/**
 * Application Constants
 * Central location for all magic numbers and configuration values
 */

// Authentication Constants
const AUTH = {
    BCRYPT_SALT_ROUNDS: 12,
    JWT_EXPIRY: '7d',
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    PASSWORD_MIN_LENGTH: 6,
    EMAIL_OTP_EXPIRY: 10 * 60 * 1000, // 10 minutes
    EMAIL_OTP_MAX_ATTEMPTS: 3,
    DEVICE_TRUST_DURATION: 30 * 24 * 60 * 60 * 1000, // 30 days
};

// Rate Limiting Constants
const RATE_LIMIT = {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 1000,
    MESSAGE: 'Too many requests, please try again later.',
};

// User Level System
const LEVELS = {
    POINTS_PER_LEVEL: 1000,
    STARTING_LEVEL: 1,
    MAX_LEVEL: 100,
};

// Points System
const POINTS = {
    WELCOME_BONUS: 100,
    LAB_COMPLETION_MIN: 50,
    LAB_COMPLETION_MAX: 500,
    ROOM_COMPLETION_MIN: 100,
    ROOM_COMPLETION_MAX: 1000,
    QUIZ_CORRECT_ANSWER: 10,
    TASK_COMPLETION: 50,
    DAILY_LOGIN_BONUS: 10,
    STREAK_BONUS_PER_DAY: 5,
};

// Streak System
const STREAKS = {
    GRACE_PERIOD_HOURS: 24, // Hours before streak breaks
    MAX_STREAK_DAYS: 365,
};

// Pagination Constants
const PAGINATION = {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
    LEADERBOARD_LIMIT: 50,
};

// File Upload Constants
const UPLOAD = {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB in bytes
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    AVATAR_FOLDER: 'uploads/avatars',
};

// Difficulty Levels
const DIFFICULTY_LEVELS = {
    BEGINNER: 'Beginner',
    INTERMEDIATE: 'Intermediate',
    ADVANCED: 'Advanced',
    EXPERT: 'Expert',
};

// User Roles
const ROLES = {
    USER: 'user',
    ADMIN: 'admin',
    DEVELOPER: 'developer', // Future use
};

// Subscription Plans
const SUBSCRIPTION_PLANS = {
    FREE: {
        name: 'Free',
        price: 0,
        features: ['Basic labs', 'Community forums', 'Limited rooms'],
    },
    PREMIUM: {
        name: 'Premium',
        price: 9.99,
        features: ['All labs', 'Premium rooms', 'Priority support', 'Certificates'],
    },
};

// Room Categories
const ROOM_CATEGORIES = {
    WEB_SECURITY: 'Web Security',
    NETWORK_SECURITY: 'Network Security',
    CRYPTOGRAPHY: 'Cryptography',
    MALWARE_ANALYSIS: 'Malware Analysis',
    FORENSICS: 'Forensics',
    PENETRATION_TESTING: 'Penetration Testing',
};

// Lab Categories
const LAB_CATEGORIES = {
    PROGRAMMING: 'Programming',
    WEB_DEVELOPMENT: 'Web Development',
    DATA_SCIENCE: 'Data Science',
    SYSTEM_ADMIN: 'System Administration',
    DIGITAL_SKILLS: 'Digital Skills',
    CYBERSECURITY: 'Cybersecurity',
};

// Notification Types
const NOTIFICATION_TYPES = {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error',
    ACHIEVEMENT: 'achievement',
};

// Activity Types (for streak tracking)
const ACTIVITY_TYPES = {
    ROOM: 'room',
    LAB: 'lab',
};

// HTTP Status Codes (for consistency)
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
};

// Response Messages
const MESSAGES = {
    // Success Messages
    LOGIN_SUCCESS: 'Login successful',
    REGISTER_SUCCESS: 'Registration successful',
    LOGOUT_SUCCESS: 'Logged out successfully',
    UPDATE_SUCCESS: 'Update successful',
    DELETE_SUCCESS: 'Deleted successfully',

    // Error Messages
    INVALID_CREDENTIALS: 'Invalid email or password',
    EMAIL_EXISTS: 'Email already registered',
    USER_NOT_FOUND: 'User not found',
    UNAUTHORIZED: 'Authentication required',
    FORBIDDEN: 'Access denied',
    VALIDATION_ERROR: 'Validation failed',
    SERVER_ERROR: 'Something went wrong',

    // 2FA Messages
    TWO_FA_REQUIRED: '2FA verification required',
    TWO_FA_INVALID: 'Invalid verification code',
    TWO_FA_ENABLED: '2FA enabled successfully',
    TWO_FA_DISABLED: '2FA disabled successfully',
};

// Regex Patterns
const REGEX = {
    EMAIL: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    PASSWORD: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
    ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
    USERNAME: /^[a-zA-Z0-9_-]{3,20}$/,
};

// Environment
const ENV = {
    DEVELOPMENT: 'development',
    PRODUCTION: 'production',
    TEST: 'test',
};

module.exports = {
    AUTH,
    RATE_LIMIT,
    LEVELS,
    POINTS,
    STREAKS,
    PAGINATION,
    UPLOAD,
    DIFFICULTY_LEVELS,
    ROLES,
    SUBSCRIPTION_PLANS,
    ROOM_CATEGORIES,
    LAB_CATEGORIES,
    NOTIFICATION_TYPES,
    ACTIVITY_TYPES,
    HTTP_STATUS,
    MESSAGES,
    REGEX,
    ENV,
};
