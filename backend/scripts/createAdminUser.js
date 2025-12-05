const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

async function createAdminUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'admin@cyberverse.com';
    const adminPassword = 'admin123';

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    const adminUser = new User({
      name: 'Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      isVerified: true
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createAdminUser();