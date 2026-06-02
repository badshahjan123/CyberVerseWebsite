const mongoose = require('mongoose');
const Lab = require('../models/Lab');
const User = require('../models/User');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../backend/.env') });
if (!process.env.MONGODB_URI) {
    require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
}

const seedLab = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const admin = await User.findOne({ role: 'admin' }) || await User.findOne();
        if (!admin) { console.error('No user found'); process.exit(1); }

        const labData = {
            title: 'Linux File Forensics: Hidden Secrets',
            slug: 'linux-forensics',
            dockerId: 'linux-forensics',
            dockerImage: 'cyberverseweb-main-linux-forensics-lab:latest',
            dockerPort: 8083,
            dockerInternalPort: 7681,
            description: 'Investigate a suspicious folder left behind by an unknown developer. Uncover hidden files, altered timestamps, and encrypted messages using Linux forensic techniques.',
            content: 'In this mission you are investigating a suspicious folder left behind by an unknown developer. The folder contains hidden files, altered timestamps, and encrypted messages. Your job is to uncover the truth by exploring the Linux filesystem and using simple forensic techniques.',
            difficulty: 'Beginner',
            category: 'Forensics',
            points: 200, // LAB_XP.Beginner — synced with utils/xpConfig.js
            isPremium: false,
            isActive: true,
            coverImage: '/images/labs/linux-forensics-cover.png',
            tags: ['linux', 'forensics', 'bash', 'investigation'],
            estimatedTime: 45,
            prerequisites: ['Basic Linux Commands'],
            learningObjectives: [
                'Understanding hidden files (ls -a)',
                'Reading metadata using stat',
                'Searching inside files using grep',
                'Identifying suspicious file types using file',
                'Recovering deleted data from history files',
            ],
            tasks: [
                {
                    id: 1,
                    title: 'Hidden File Discovery',
                    instructions: 'Navigate to the evidence directory and list all files including hidden ones.',
                    commands: ['cd /home/labuser/evidence', 'ls -a'],
                    question: 'What is the name of the hidden file you discovered?',
                    hint: 'Hidden files in Linux start with a dot (.)',
                    correctAnswer: '.secret_note',
                },
                {
                    id: 2,
                    title: 'File Content Examination',
                    instructions: 'Read the content of the hidden file you discovered.',
                    commands: ['cat .secret_note'],
                    question: 'What message is written inside the hidden file?',
                    hint: 'Use the cat command to read file contents',
                    correctAnswer: 'The password is hidden in the binary',
                },
                {
                    id: 3,
                    title: 'Binary File Investigation',
                    instructions: 'There is a file called mystery.bin. Check its file type and decode it.',
                    commands: ['file mystery.bin', 'base64 -d mystery.bin'],
                    question: 'What is the decoded message from mystery.bin?',
                    hint: 'The file is Base64 encoded. Use base64 -d to decode it',
                    correctAnswer: 'SECRET_KEY_12345',
                },
                {
                    id: 4,
                    title: 'Command History Analysis',
                    instructions: 'Examine the bash command history to find suspicious activity.',
                    commands: ['cat ~/.bash_history'],
                    question: 'What suspicious command appears in the history?',
                    hint: 'Look for commands involving flags or secrets',
                    correctAnswer: 'echo "FLAG" > /tmp/flag_storage',
                },
                {
                    id: 5,
                    title: 'Final Flag Extraction',
                    instructions: 'Search the entire home directory for files containing the word "FLAG".',
                    commands: ['grep -R "FLAG" /home/labuser 2>/dev/null', 'cat ~/.backup_flag.txt'],
                    question: 'What is the final flag?',
                    hint: 'The flag is stored in a hidden backup file',
                    correctAnswer: 'FLAG{FORENSIC_DISCOVERY_COMPLETE}',
                },
            ],
            createdBy: admin._id,
        };

        const existing = await Lab.findOne({ slug: labData.slug });
        if (existing) {
            await Lab.findByIdAndUpdate(existing._id, labData);
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
