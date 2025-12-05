const mongoose = require('mongoose');
const Lab = require('../models/Lab');
const User = require('../models/User');
require('dotenv').config({ path: '../.env' });

const seedLab = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find an admin user to be the creator
        const admin = await User.findOne({ role: 'admin' }) || await User.findOne();

        if (!admin) {
            console.error('No user found to assign as creator');
            process.exit(1);
        }

        const labData = {
            title: 'Linux File Forensics: Hidden Secrets',
            slug: 'linux-forensics',
            description: 'Investigate a suspicious folder left behind by an unknown developer. Uncover hidden files, altered timestamps, and encrypted messages using Linux forensic techniques.',
            content: 'In this mission, you’re investigating a suspicious folder left behind by an unknown developer. The folder contains hidden files, altered timestamps, and encrypted messages. Your job is to uncover the truth by exploring the Linux filesystem and using simple forensic techniques.',
            difficulty: 'Beginner',
            category: 'Forensics',
            points: 100,
            isPremium: false,
            isActive: true,
            tags: ['linux', 'forensics', 'bash', 'investigation'],
            estimatedTime: 45,
            prerequisites: ['Basic Linux Commands'],
            learningObjectives: [
                'Understanding hidden files (ls -a)',
                'Reading metadata using stat',
                'Searching inside files using grep',
                'Identifying suspicious file types using file',
                'Recovering deleted data from history files'
            ],
            createdBy: admin._id
        };

        // Check if lab already exists
        const existingLab = await Lab.findOne({ title: labData.title });

        if (existingLab) {
            console.log('Lab already exists, updating...');
            await Lab.findByIdAndUpdate(existingLab._id, labData);
            console.log('Lab updated successfully');
        } else {
            await Lab.create(labData);
            console.log('Lab created successfully');
        }

    } catch (error) {
        console.error('Error seeding lab:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

seedLab();
