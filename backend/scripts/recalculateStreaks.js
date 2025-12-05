/**
 * Recalculate Streaks Script
 * This script recalculates currentStreak and longestStreak for all users
 * based on their existing room and lab completion history
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Room = require('../models/Room');
const Lab = require('../models/Lab');

async function recalculateUserStreaks() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const users = await User.find();
        console.log(`📊 Found ${users.length} users to process`);

        for (const user of users) {
            console.log(`\n👤 Processing user: ${user.name} (${user.email})`);

            // Collect all completion activities with dates
            const activities = [];

            // Add room completions
            if (user.roomProgress && user.roomProgress.length > 0) {
                for (const progress of user.roomProgress) {
                    if (progress.completed && progress.completedAt) {
                        activities.push({
                            date: new Date(progress.completedAt),
                            type: 'room',
                            id: progress.roomId
                        });
                    }
                }
            }

            // Add lab completions by checking Labs collection
            const completedLabs = await Lab.find({
                'completedBy.userId': user._id
            }).select('title completedBy');

            for (const lab of completedLabs) {
                const completion = lab.completedBy.find(c => c.userId.toString() === user._id.toString());
                if (completion && completion.completedAt) {
                    activities.push({
                        date: new Date(completion.completedAt),
                        type: 'lab',
                        id: lab._id,
                        title: lab.title
                    });
                }
            }

            if (activities.length === 0) {
                console.log('   ⚠️  No completed activities found');
                continue;
            }

            // Sort activities by date (oldest first)
            activities.sort((a, b) => a.date - b.date);

            console.log(`   📅 Found ${activities.length} completed activities`);

            // Calculate streaks
            const activityDates = new Map(); // Map of date string -> activities

            // Group activities by date (ignore time)
            for (const activity of activities) {
                const dateKey = activity.date.toISOString().split('T')[0];
                if (!activityDates.has(dateKey)) {
                    activityDates.set(dateKey, []);
                }
                activityDates.get(dateKey).push(activity);
            }

            const uniqueDates = Array.from(activityDates.keys()).sort();

            let currentStreak = 0;
            let longestStreak = 0;
            let lastDate = null;

            for (const dateStr of uniqueDates) {
                const currentDate = new Date(dateStr);

                if (!lastDate) {
                    // First activity
                    currentStreak = 1;
                } else {
                    const daysDiff = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));

                    if (daysDiff === 1) {
                        // Consecutive day
                        currentStreak++;
                    } else {
                        // Gap - streak resets
                        currentStreak = 1;
                    }
                }

                if (currentStreak > longestStreak) {
                    longestStreak = currentStreak;
                }

                lastDate = currentDate;
            }

            // Check if the streak is still active (last activity was today or yesterday)
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const lastActivityDate = new Date(uniqueDates[uniqueDates.length - 1]);
            const daysSinceLastActivity = Math.floor((today - lastActivityDate) / (1000 * 60 * 60 * 24));

            let finalCurrentStreak = currentStreak;
            if (daysSinceLastActivity > 1) {
                // Streak is broken
                finalCurrentStreak = 0;
            }

            // Update user
            user.currentStreak = finalCurrentStreak;
            user.longestStreak = longestStreak;
            user.lastStreakDate = lastActivityDate;

            // Build streakActivities array
            user.streakActivities = activities.map(a => ({
                date: a.date,
                activityType: a.type,
                description: a.type === 'room'
                    ? `Completed room: ${a.id}`
                    : `Completed lab: ${a.title || a.id}`
            }));

            await user.save();

            console.log(`   ✅ Updated streaks:`);
            console.log(`      Current Streak: ${finalCurrentStreak} days`);
            console.log(`      Longest Streak: ${longestStreak} days`);
            console.log(`      Last Activity: ${lastActivityDate.toLocaleDateString()}`);
            console.log(`      Total Activity Days: ${uniqueDates.length}`);
        }

        console.log('\n🎉 All users processed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// Run the script
recalculateUserStreaks();
