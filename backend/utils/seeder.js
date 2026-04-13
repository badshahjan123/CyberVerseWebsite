const User = require("../models/User");
const Room = require("../models/Room");
const Lab = require("../models/Lab");
const bcrypt = require("bcryptjs");

const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ $or: [{ role: "admin" }, { role: "super_admin" }] });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(process.env.DEFAULT_ADMIN_PASSWORD || "Badshah@123", salt);

      const admin = new User({
        name: "Badshah Khan",
        email: process.env.DEFAULT_ADMIN_EMAIL || "badshahkha656@gmail.com",
        password: hashedPassword,
        role: "super_admin",
        isPremium: true,
      });
      await admin.save();
      console.log("🔑 Default super admin created");
      await createSampleData(admin._id);
    }
  } catch (error) {
    console.error("❌ Error seeding admin:", error.message);
  }
};

const createSampleData = async (adminId) => {
    // Room and Lab sample creation logic...
    const roomCount = await Room.countDocuments();
    if (roomCount === 0) {
        await Room.insertMany([
            { name: "Web Application Security Basics", slug: "web-sec-1", description: "Basics", createdBy: adminId },
            { name: "SQL Injection Challenge", slug: "sql-inj-1", description: "Master SQLi", createdBy: adminId, isPremium: true }
        ]);
        console.log("📦 Sample rooms created");
    }
};

module.exports = { createDefaultAdmin };
