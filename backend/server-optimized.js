const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

// Import utilities and constants
const logger = require('./utils/logger');
const { RATE_LIMIT, HTTP_STATUS, MESSAGES } = require('./config/constants');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const userApiRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const adminAuthRoutes = require('./routes/adminAuth');
const paymentRoutes = require('./routes/payment');
const roomRoutes = require('./routes/rooms');

// Import models
const User = require('./models/User');
const Room = require('./models/Room');
const Lab = require('./models/Lab');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
    cors: {
        origin: true,
        credentials: true
    },
    transports: ['websocket', 'polling']
});

// Make io accessible to routes
app.set('io', io);
global.io = io;

// ========================================
// SOCKET.IO CONFIGURATION
// ========================================

/**
 * Socket.IO Authentication Middleware
 * Verifies JWT token before allowing socket connection
 */
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return next(new Error('User not found'));
        }

        socket.user = user;
        socket.userId = user._id.toString();
        next();
    } catch (error) {
        logger.error('Socket authentication error:', error);
        next(new Error('Invalid token'));
    }
});

/**
 * Socket.IO Connection Handler
 * Manages WebSocket connections for real-time features
 */
io.on('connection', (socket) => {
    logger.socket('connection', `User connected: ${socket.user.name} (${socket.userId})`);

    // Join user-specific room for targeted broadcasts
    socket.join(`user:${socket.userId}`);

    // Handle disconnection
    socket.on('disconnect', () => {
        logger.socket('disconnect', `User disconnected: ${socket.user.name}`);
    });

    // Client requests manual stats refresh
    socket.on('refresh:stats', async () => {
        try {
            const user = await User.findById(socket.userId).select(
                'name points level completedLabs completedRooms currentStreak longestStreak'
            );
            const rank = await user.calculateRank();
            const totalUsers = await User.countDocuments({ isActive: true });

            socket.emit('user:stats:update', {
                ...user.toObject(),
                rank,
                totalUsers
            });
            logger.socket('refresh:stats', 'Stats sent to user');
        } catch (error) {
            logger.error('Stats refresh error:', error);
        }
    });

    // Client requests leaderboard refresh
    socket.on('refresh:leaderboard', async () => {
        try {
            const leaderboard = await User.find({ isActive: true })
                .select('name points level completedLabs completedRooms avatar')
                .sort({ points: -1, completedLabs: -1, completedRooms: -1 })
                .limit(50);

            const leaderboardWithRank = leaderboard.map((user, index) => ({
                ...user.toObject(),
                rank: index + 1
            }));

            socket.emit('leaderboard:update', leaderboardWithRank);
            logger.socket('refresh:leaderboard', 'Leaderboard sent to user');
        } catch (error) {
            logger.error('Leaderboard refresh error:', error);
        }
    });
});

/**
 * Global Broadcast Functions
 * Used by routes to broadcast events to all connected clients
 */
global.broadcastAdminActivity = (activity) => {
    io.emit('admin_activity', { type: 'admin_activity', activity });
    logger.socket('broadcast', 'Admin activity broadcasted');
};

global.broadcastStatsUpdate = (stats) => {
    io.emit('stats_update', { type: 'stats_update', stats });
    logger.socket('broadcast', 'Stats update broadcasted');
};

// ========================================
// MIDDLEWARE CONFIGURATION
// ========================================

// Security headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
    origin: true,
    credentials: true
}));

// Cookie parser
app.use(cookieParser());

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: RATE_LIMIT.WINDOW_MS,
    max: RATE_LIMIT.MAX_REQUESTS,
    message: { message: RATE_LIMIT.MESSAGE },
    standardHeaders: true,
    legacyHeaders: false
});
app.use(limiter);

// Request logging middleware (development only)
app.use(logger.requestMiddleware);

// Serve static files for avatars
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ========================================
// DATABASE CONNECTION
// ========================================

/**
 * Connect to MongoDB with Cloud/Local Fallback
 * Tries cloud MongoDB first, falls back to local if unavailable
 */
const connectDB = async () => {
    try {
        // Try cloud MongoDB first
        await mongoose.connect(process.env.MONGODB_URI);
        logger.success('MongoDB Connected (Cloud)');
    } catch (error) {
        logger.warn('Cloud MongoDB failed, trying local...');
        try {
            // Fallback to local MongoDB
            await mongoose.connect('mongodb://127.0.0.1:27017/cyberverse_local');
            logger.success('MongoDB Connected (Local)');
        } catch (localError) {
            logger.error('Both cloud and local MongoDB failed');
            logger.error('Cloud error:', error.message);
            logger.error('Local error:', localError.message);
            process.exit(1);
        }
    }
    createDefaultAdmin();
};

connectDB();

/**
 * Create Default Admin User
 * Creates an admin account if one doesn't exist
 */
const createDefaultAdmin = async () => {
    try {
        const adminExists = await User.findOne({ role: 'admin' });
        if (!adminExists) {
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(12);
            const hashedPassword = await bcrypt.hash(
                process.env.DEFAULT_ADMIN_PASSWORD || 'Badshah@123',
                salt
            );

            const admin = new User({
                name: 'Badshah Khan',
                email: process.env.DEFAULT_ADMIN_EMAIL || 'badshahkha656@gmail.com',
                password: hashedPassword,
                role: 'admin',
                isPremium: true
            });
            await admin.save();
            logger.success('Default admin created: badshahkha656@gmail.com / Badshah@123');

            // Create sample data
            await createSampleData(admin._id);
        }
    } catch (error) {
        logger.error('Error creating default admin:', error);
    }
};

/**
 * Create Sample Data for Testing
 * Populates database with sample rooms and labs
 */
const createSampleData = async (adminId) => {
    try {
        const roomCount = await Room.countDocuments();
        const labCount = await Lab.countDocuments();

        if (roomCount === 0) {
            const sampleRooms = [
                {
                    name: 'Web Application Security Basics',
                    description: 'Learn the fundamentals of web application security including common vulnerabilities.',
                    difficulty: 'Beginner',
                    category: 'Web Security',
                    points: 100,
                    estimatedTime: 45,
                    tags: ['web', 'security', 'basics'],
                    createdBy: adminId
                },
                {
                    name: 'SQL Injection Challenge',
                    description: 'Master SQL injection techniques and learn how to prevent them.',
                    difficulty: 'Intermediate',
                    category: 'Web Security',
                    points: 200,
                    estimatedTime: 60,
                    isPremium: true,
                    tags: ['sql', 'injection', 'database'],
                    createdBy: adminId
                }
            ];

            await Room.insertMany(sampleRooms);
            logger.success('Sample rooms created');
        }

        if (labCount === 0) {
            const sampleLabs = [
                {
                    title: 'Introduction to Cryptography',
                    description: 'Learn the basics of cryptography and encryption techniques.',
                    content: 'This lab covers fundamental cryptographic concepts including symmetric and asymmetric encryption, hashing, and digital signatures.',
                    difficulty: 'Beginner',
                    category: 'Cryptography',
                    points: 150,
                    estimatedTime: 90,
                    tags: ['crypto', 'encryption', 'basics'],
                    prerequisites: ['Basic mathematics'],
                    learningObjectives: ['Understand encryption basics', 'Learn about hashing'],
                    createdBy: adminId
                },
                {
                    title: 'Network Security Fundamentals',
                    description: 'Explore network security concepts and common attack vectors.',
                    content: 'This comprehensive lab covers network protocols, firewalls, intrusion detection systems, and common network attacks.',
                    difficulty: 'Intermediate',
                    category: 'Network Security',
                    points: 250,
                    estimatedTime: 120,
                    isPremium: true,
                    tags: ['network', 'security', 'protocols'],
                    prerequisites: ['Basic networking knowledge'],
                    learningObjectives: ['Understand network protocols', 'Learn about network attacks'],
                    createdBy: adminId
                }
            ];

            await Lab.insertMany(sampleLabs);
            logger.success('Sample labs created');
        }
    } catch (error) {
        logger.error('Error creating sample data:', error);
    }
};

// ========================================
// API ROUTES
// ========================================

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/user', userApiRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/progress', require('./routes/progress'));
app.use('/api/room-progress', require('./routes/roomProgress'));
app.use('/api/2fa', require('./routes/twoFactor'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/test-notifications', require('./routes/testNotifications'));
app.use('/api/search', require('./routes/search'));
app.use('/api/labs', require('./routes/labs'));
app.use('/api/admin/streaks', require('./routes/adminStreaks'));
app.use('/api/streak-fix', require('./routes/streakFix'));


// ========================================
// UTILITY ENDPOINTS
// ========================================

/**
 * Health Check Endpoint
 * Returns server status and uptime
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'CyberVerse API is running',
        timestamp: new Date().toISOString(),
        websocket: 'enabled',
        environment: process.env.NODE_ENV
    });
});

/**
 * Search Endpoint (Temporary - will be replaced by dedicated search service)
 */
app.get('/api/search', async (req, res) => {
    try {
        const { q, limit = 10 } = req.query;

        if (!q || q.trim().length < 2) {
            return res.json({ results: [] });
        }

        const searchQuery = q.trim();
        const searchLimit = Math.min(parseInt(limit), 20);
        const results = [];

        // Search rooms
        const rooms = await Room.find({
            $or: [
                { name: { $regex: searchQuery, $options: 'i' } },
                { title: { $regex: searchQuery, $options: 'i' } },
                { description: { $regex: searchQuery, $options: 'i' } }
            ]
        })
            .select('name title description difficulty category points isPremium')
            .limit(searchLimit);

        rooms.forEach(room => {
            results.push({
                type: 'room',
                id: room._id,
                title: room.name || room.title,
                description: room.description,
                path: `/rooms/${room._id}`,
                difficulty: room.difficulty,
                category: room.category,
                points: room.points,
                isPremium: room.isPremium
            });
        });

        // Search labs
        const labs = await Lab.find({
            $or: [
                { title: { $regex: searchQuery, $options: 'i' } },
                { description: { $regex: searchQuery, $options: 'i' } }
            ]
        })
            .select('title description difficulty category points isPremium')
            .limit(searchLimit);

        labs.forEach(lab => {
            results.push({
                type: 'lab',
                id: lab._id,
                title: lab.title,
                description: lab.description,
                path: `/labs/${lab._id}`,
                difficulty: lab.difficulty,
                category: lab.category,
                points: lab.points,
                isPremium: lab.isPremium
            });
        });

        res.json({
            results: results.slice(0, searchLimit),
            query: searchQuery,
            total: results.length
        });
    } catch (error) {
        logger.error('Search error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            message: MESSAGES.SERVER_ERROR
        });
    }
});

// ========================================
// ERROR HANDLING MIDDLEWARE
// ========================================

// Import error handling utilities
const { errorConverter, errorHandler, notFound } = require('./middleware/errorHandler');

/**
 * Error Logging Middleware (from logger utility)
 */
app.use(logger.errorMiddleware);

/**
 * 404 Handler - Route Not Found
 * Must come BEFORE error handlers
 */
app.use(notFound);

/**
 * Error Converter
 * Converts non-ApiError errors to ApiError format
 */
app.use(errorConverter);

/**
 * Global Error Handler
 * Catches all errors and sends appropriate response
 * MUST be the last middleware
 */
app.use(errorHandler);

// ========================================
// SERVER STARTUP
// ========================================

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Local: http://localhost:${PORT}`);
    logger.info(`Network: http://192.168.2.109:${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.success('WebSocket enabled');
    logger.separator();
});

module.exports = app;
