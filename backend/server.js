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

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const userApiRoutes = require('./routes/user'); // New user API routes
const adminRoutes = require('./routes/admin');
const adminAuthRoutes = require('./routes/adminAuth');
const paymentRoutes = require('./routes/payment');
const roomRoutes = require('./routes/rooms');
const User = require('./models/User');
const Room = require('./models/Room');
const Lab = require('./models/Lab');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Make io accessible to routes
app.set('io', io);

// Socket.io JWT authentication middleware
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
    console.error('Socket authentication error:', error);
    next(new Error('Invalid token'));
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.user.name} (${socket.userId})`);

  // Join user-specific room for targeted broadcasts
  socket.join(`user:${socket.userId}`);

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.user.name}`);
  });

  // Client can request manual refresh
  socket.on('refresh:stats', async () => {
    try {
      const user = await User.findById(socket.userId).select('name points level completedLabs completedRooms currentStreak longestStreak');
      const rank = await user.calculateRank();
      const totalUsers = await User.countDocuments({ isActive: true });

      socket.emit('user:stats:update', {
        ...user.toObject(),
        rank,
        totalUsers
      });
    } catch (error) {
      console.error('Stats refresh error:', error);
    }
  });

  // Client can request leaderboard refresh
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
    } catch (error) {
      console.error('Leaderboard refresh error:', error);
    }
  });
});

// Export io for use in routes
global.io = io;

// Admin activity broadcaster
global.broadcastAdminActivity = (activity) => {
  io.emit('admin_activity', { type: 'admin_activity', activity })
}

// Stats update broadcaster
global.broadcastStatsUpdate = (stats) => {
  io.emit('stats_update', { type: 'stats_update', stats })
}

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: true,
  credentials: true
}));

// Cookie parser middleware
app.use(cookieParser());

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // increased limit
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files for avatars with absolute path
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB with fallback
const connectDB = async () => {
  try {
    // Try cloud MongoDB first
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected (Cloud)');
  } catch (error) {
    console.log('⚠️  Cloud MongoDB failed, trying local...');
    try {
      // Fallback to local MongoDB
      await mongoose.connect('mongodb://127.0.0.1:27017/cyberverse_local');
      console.log('✅ MongoDB Connected (Local)');
    } catch (localError) {
      console.error('❌ Both cloud and local MongoDB failed:');
      console.error('Cloud:', error.message);
      console.error('Local:', localError.message);
      process.exit(1);
    }
  }
  createDefaultAdmin();
};

connectDB();

// Create default admin user and sample data
const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(process.env.DEFAULT_ADMIN_PASSWORD || 'Badshah@123', salt);

      const admin = new User({
        name: 'Badshah Khan',
        email: process.env.DEFAULT_ADMIN_EMAIL || 'badshahkha656@gmail.com',
        password: hashedPassword,
        role: 'admin',
        isPremium: true
      });
      await admin.save();
      console.log('🔑 Default admin created: badshahkha656@gmail.com / Badshah@123');

      // Create sample rooms and labs
      await createSampleData(admin._id);
    }
  } catch (error) {
    console.error('❌ Error creating default admin:', error);
  }
};

// Create sample data for testing
const createSampleData = async (adminId) => {
  try {
    // Check if sample data already exists
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
      console.log('📦 Sample rooms created');
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
      console.log('🧪 Sample labs created');
    }
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/user', userApiRoutes); // User profile features (streak, badges, saved)
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/progress', require('./routes/progress'));
app.use('/api/room-progress', require('./routes/roomProgress'));
app.use('/api/2fa', require('./routes/twoFactor')); // 2FA enabled
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/test-notifications', require('./routes/testNotifications'));
app.use('/api/search', require('./routes/search'));
app.use('/api/labs', require('./routes/labs')); // Lab container management
app.use('/api/admin/streaks', require('./routes/adminStreaks')); // Admin streak recalculation

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'CyberVerse API is running',
    timestamp: new Date().toISOString(),
    websocket: 'enabled'
  });
});

// Temporary search endpoint until server restart
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
    console.error('Search error:', error);
    res.status(500).json({ message: 'Search failed' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

app.get('/api/user-stats', async (req, res) => {
  try {
    // Abhi dummy data return karte hain, baad me DB logic daalenge
    res.json({
      user: { name: 'Badshah', email: 'badshahkha656@gmail.com' },
      recentActivity: [],
      weeklyStats: { labsCompleted: 0, pointsEarned: 0, timeSpent: '0h', rankChange: 0 }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch user stats' });
  }
});


// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔌 WebSocket enabled`);
});