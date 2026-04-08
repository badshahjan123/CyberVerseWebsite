require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const check = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cyberverse_local';
    console.log(`Connecting to ${uri}...`);
    await mongoose.connect(uri);
    const userEmail = 'testuser_xezjzl0u@github.com';
    const users = await User.find({ email: userEmail });
    if (users.length === 0) {
      console.log('No users with the specified email found.');
    } else {
      console.log(JSON.stringify(users.map(u => ({ 
        id: u._id,
        name: u.name,
        email: u.email,
        roomProgress: u.roomProgress.map(p => ({
          roomId: p.roomId,
          joined: p.joined,
          completed: p.completed
        }))
      })), null, 2));
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

check();
