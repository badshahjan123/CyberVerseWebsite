const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Room = require('../models/Room');
const Lab = require('../models/Lab');

// Use local MongoDB
const MONGODB_URI = 'mongodb://127.0.0.1:27017/cyberverse_local';

async function setupLocalDatabase() {
  try {
    console.log('🔄 Setting up local database...');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to local MongoDB');

    // Create admin user
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const admin = new User({
        name: 'Admin',
        email: 'admin@cyberverse.com',
        password: hashedPassword,
        role: 'admin',
        isVerified: true
      });
      
      await admin.save();
      console.log('✅ Admin user created: admin@cyberverse.com / admin123');
    }

    // Create sample data
    const roomCount = await Room.countDocuments();
    if (roomCount === 0) {
      const sampleRoom = new Room({
        name: 'Local Test Room',
        description: 'A test room for local development',
        difficulty: 'Beginner',
        category: 'Web Security',
        points: 100,
        estimatedTime: 30,
        tags: ['test', 'local'],
        createdBy: (await User.findOne({ role: 'admin' }))._id
      });
      await sampleRoom.save();
      console.log('✅ Sample room created');
    }

    console.log('🎉 Local database setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setupLocalDatabase();