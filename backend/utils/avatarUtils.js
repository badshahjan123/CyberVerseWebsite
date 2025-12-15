const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkAvatar() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const user = await User.findOne({ email: 'badshahkha656@gmail.com' });

        if (!user) {
            console.log('User not found');
            return;
        }

        console.log('=== USER AVATAR DATA ===');
        console.log('Name:', user.name);
        console.log('Email:', user.email);
        console.log('Avatar:', user.avatar);
        console.log('Avatar starts with http:', user.avatar?.startsWith('http'));
        console.log('Avatar starts with /uploads:', user.avatar?.startsWith('/uploads'));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkAvatar();
