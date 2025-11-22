const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
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

// Serve static files for avatars
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    createDefaultAdmin();
  })
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'CyberVerse API is running',
    timestamp: new Date().toISOString()
  });
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
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV}`);
});