const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function fixUserStreak() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cyberverse');

        const user = await User.findOne({ email: 'streaktest@example.com' });

        if (!user) {
            console.log('User not found');
            return;
        }

        console.log('=== BEFORE FIX ===');
        console.log('Current Streak:', user.currentStreak);
        console.log('Longest Streak:', user.longestStreak);
        console.log('Streak Activities:', user.streakActivities?.length || 0);

        // Find completed rooms
        const completedRooms = user.roomProgress.filter(rp => rp.completed && rp.quizCompleted);

        console.log('\n=== COMPLETED ROOMS ===');
        console.log('Total completed rooms:', completedRooms.length);

        // Update streak for each completed room
        for (const room of completedRooms) {
            console.log(`\nUpdating streak for room: ${room.roomId}`);
            console.log(`Completed at: ${room.completedAt}`);

            // Use the updateStreak method with the completion date
            user.updateStreak('room', room.roomId);
        }

        // Save the user
        await user.save();

        console.log('\n=== AFTER FIX ===');
        console.log('Current Streak:', user.currentStreak);
        console.log('Longest Streak:', user.longestStreak);
        console.log('Last Streak Date:', user.lastStreakDate);
        console.log('Streak Activities:', user.streakActivities?.length || 0);

        console.log('\n✅ Streak updated successfully!');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

fixUserStreak();
