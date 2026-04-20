const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: true, credentials: true },
    transports: ["websocket", "polling"],
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      // Allow guest connections for public events
      if (!token || token === 'guest') {
        socket.userId = 'guest';
        return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        socket.userId = 'guest'; // Fallback to guest if user deleted
        return next();
      }

      socket.user = user;
      socket.userId = user._id.toString();
      next();
    } catch (error) {
      // Don't kill the socket, just treat as guest
      socket.userId = 'guest';
      next();
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.userId}`);
    socket.on("disconnect", () => {});
  });

  // Global platform heartbeat (Every 30 seconds)
  setInterval(async () => {
    try {
      const User = require('../models/User');
      const Lab = require('../models/Lab');
      const Room = require('../models/Room');
      const totalUsers = await User.countDocuments({});
      const activeLabs = await Lab.countDocuments({ isActive: true });
      const totalRooms = await Room.countDocuments({ isActive: true });
      const challengesResult = await User.aggregate([
        { $group: { _id: null, total: { $sum: '$completedRooms' } } }
      ]);
      const totalChallenges = challengesResult[0]?.total || 0;
      io.emit('platform:stats', { totalUsers, activeLabs, totalRooms, totalChallenges });
    } catch (err) {
      console.error('Heartbeat error:', err);
    }
  }, 30000);

  global.io = io;
  return io;
};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};

module.exports = { initSocket, getIO };
