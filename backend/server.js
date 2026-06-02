const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const http = require("http");
const path = require("path");
require("dotenv").config(); // Load environment variables

// Configs
const connectDB = require("./config/db");
const { initSocket } = require("./config/socket");
const { seedBadges } = require("./utils/badgeSeeder");
const { createDefaultAdmin } = require("./utils/seeder");

// Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const roomRoutes = require("./routes/rooms");
const labRoutes = require("./routes/labs");

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Security & Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { message: "Too many requests" },
});
app.use(limiter);

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Database & Seeders
connectDB(() => {
    createDefaultAdmin();
    seedBadges();
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/labs", labRoutes);
app.use("/api/progress", require("./routes/progress"));
app.use("/api/room-progress", require("./routes/roomProgress"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/search", require("./routes/search"));
app.use("/api/stats", require("./routes/stats"));
app.use("/api/admin", require("./routes/admin/index"));
app.use("/api/user", require("./routes/user"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/two-factor", require("./routes/twoFactor"));
app.use("/api/attempts", require("./routes/attempts"));

// Health check
app.get("/api/health", (req, res) => res.json({ status: "OK", timestamp: new Date() }));

// 404 handler
app.use("*", (req, res) => res.status(404).json({ message: "Route not found" }));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
