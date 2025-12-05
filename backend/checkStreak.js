const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkUserStreak() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cyberverse');

        const user = await User.findOne({ email: 'streaktest@example.com' });

        if (!user) {
            console.log('User not found');
            return;
        }

        console.log('=== USER STREAK DATA ===');
        console.log('Name:', user.name);
        console.log('Email:', user.email);
        console.log('Current Streak:', user.currentStreak);
        console.log('Longest Streak:', user.longestStreak);
        console.log('Last Streak Date:', user.lastStreakDate);
        console.log('Completed Rooms:', user.completedRooms);
        console.log('\n=== ROOM PROGRESS ===');
        user.roomProgress.forEach((rp, idx) => {
            console.log(`\nRoom ${idx + 1}:`);
            console.log('  Room ID:', rp.roomId);
            console.log('  Completed:', rp.completed);
            console.log('  Quiz Completed:', rp.quizCompleted);
            console.log('  Completed At:', rp.completedAt);
        });

        console.log('\n=== STREAK ACTIVITIES ===');
        if (user.streakActivities && user.streakActivities.length > 0) {
            user.streakActivities.forEach((activity, idx) => {
                console.log(`Activity ${idx + 1}:`, activity.activityType, activity.itemId, activity.date);
            });
        } else {
            console.log('No streak activities recorded');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkUserStreak();
