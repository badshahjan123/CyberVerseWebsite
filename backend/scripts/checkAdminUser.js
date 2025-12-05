const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

async function checkAdminUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminUsers = await User.find({ role: 'admin' });
    
    if (adminUsers.length === 0) {
      console.log('❌ No admin users found');
    } else {
      console.log(`✅ Found ${adminUsers.length} admin user(s):`);
      adminUsers.forEach(user => {
        console.log(`- ${user.name} (${user.email})`);
      });
    }
    
  } catch (error) {
    console.error('Error checking admin users:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkAdminUser();