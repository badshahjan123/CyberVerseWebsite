const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async (seedCallback) => {
  try {
    // Try cloud MongoDB first
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected (Cloud)");
  } catch (error) {
    console.log("⚠️  Cloud MongoDB failed, trying local...");
    try {
      // Fallback to local MongoDB
      await mongoose.connect("mongodb://127.0.0.1:27017/cyberverse_local");
      console.log("✅ MongoDB Connected (Local)");
    } catch (localError) {
      console.error("❌ Both cloud and local MongoDB failed:");
      process.exit(1);
    }
  }
  if (seedCallback) seedCallback();
};

module.exports = connectDB;
