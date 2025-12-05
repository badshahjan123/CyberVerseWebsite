const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const userApiRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const adminAuthRoutes = require('./routes/adminAuth');
const paymentRoutes = require('./routes/payment');
const roomRoutes = require('./routes/rooms');

const app = express();
const server = http.createServer(app);

// Mock database for offline mode
const mockDB = {
  users: [
    {
      _id: '507f1f77bcf86cd799439011',
      name: 'Admin',
      email: 'admin@cyberverse.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uDfm', // admin123
      role: 'admin',
      isVerified: true,
      createdAt: new Date()
    }
  ],
  rooms: [],
  labs: []
};

// Initialize Socket.io
const io = new Server(server, {
  cors: { origin: true, credentials: true },
  transports: ['websocket', 'polling']
});

app.set('io', io);
global.io = io;
global.mockDB = mockDB;

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { message: 'Too many requests, please try again later.' }
});
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/user', userApiRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/rooms', roomRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'CyberVerse API (Offline Mode)',
    timestamp: new Date().toISOString(),
    mode: 'offline'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} (OFFLINE MODE)`);
  console.log(`📱 Environment: offline`);
  console.log(`🔌 WebSocket enabled`);
  console.log(`👤 Admin: admin@cyberverse.com / admin123`);
});