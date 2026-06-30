const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Lab = require('../models/Lab');
const User = require('../models/User');

const seedHiddenData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const admin = await User.findOne({ role: 'admin' }) || await User.findOne();
        if (!admin) {
            console.error('No user found for createdBy field');
            process.exit(1);
        }

        const labData = {
            title: 'Hidden Data Discovery',
            slug: 'hidden-data-discovery',
            dockerId: 'hidden-data-discovery',

            dockerImage: 'badshahjan/lab1:latest',
            dockerPort: 8090,
            dockerInternalPort: 80,

            description:
                'A beginner-friendly introduction to finding hidden data on a Linux system. Learn how to uncover hidden files, extract readable text from binaries, decode base64 strings, and identify unknown file types.',

            content:
                '## Operation Briefing\nWelcome to your first forensics training mission. Data can be hidden in plain sight using simple encoding tricks, file renaming, or even embedded inside compiled programs.\n\nYour task is to utilize fundamental Linux commands such as `ls`, `strings`, `file`, and `base64` to track down four missing flags.',

            difficulty: 'Beginner',
            category: 'Forensics',
            createdBy: admin._id,

            points: 100, 

            isPremium: false,
            isActive: true,

            coverImage:
                'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=1000',

            tags: [
                'linux',
                'forensics',
                'base64',
                'strings'
            ],

            resources: [
                {
                    title: 'Basic Linux Forensics Tips',
                    url: 'https://youtu.be/Vg1_GQ-iQ9s?si=AXl0heRusGWXWRiB',
                    type: 'video'
                }
            ],

            estimatedTime: 20,

            learningObjectives: [
                'Understand how dotfiles are used to hide information in Linux.',
                'Learn to decode base64 encoded strings.',
                'Use the strings command to extract readable text from compiled binaries.',
                'Utilize the file command to determine the actual content type of an unknown file.'
            ],

            tasks: [
                {
                    id: 1,
                    title: 'The Hidden Dotfile',
                    instructions:
                        'In Linux, files that start with a dot (.) are hidden from standard directory listings. Navigate to the home directory and list all files, including hidden ones, to find the secret configuration file.',
                    commands: ['ls -la', 'cat .secret_config.txt'],
                    question: 'What is the flag found inside the hidden file?',
                    hint: 'Use `ls -la` to see hidden files, then use `cat` to read it.',
                    correctAnswer: 'FLAG{DOTFILES_ARE_SNEAKY}'
                },
                {
                    id: 2,
                    title: 'Base64 Decoding',
                    instructions:
                        'A suspicious encoded message was left in `/tmp/encoded_message.txt`. The string looks like random gibberish ending in "==". Use the base64 utility to decode it.',
                    commands: ['cat /tmp/encoded_message.txt', 'base64 -d /tmp/encoded_message.txt'],
                    question: 'What does the decoded message say?',
                    hint: 'Run `cat /tmp/encoded_message.txt | base64 -d` or `base64 -d /tmp/encoded_message.txt`.',
                    correctAnswer: 'FLAG{BALANCEDO64_DECODED}'
                },
                {
                    id: 3,
                    title: 'Strings Extraction',
                    instructions:
                        'There is a compiled binary located at `/opt/mystery/app_binary`. You cannot just read it with `cat` because it is a binary file. Use the `strings` command to extract the readable flag from it.',
                    commands: ['strings /opt/mystery/app_binary | grep FLAG'],
                    question: 'What is the flag embedded inside the binary?',
                    hint: 'Run `strings /opt/mystery/app_binary`. You can also pipe it to grep like `strings /opt/mystery/app_binary | grep FLAG`.',
                    correctAnswer: 'FLAG{STRINGS_EXTRACTOR_PRO}'
                },
                {
                    id: 4,
                    title: 'File Type Identification',
                    instructions:
                        'A file named `unknown_blob` exists in the home directory, but it has no file extension. Use the `file` command to determine what type of file it actually is, then read it.',
                    commands: ['file unknown_blob', 'cat unknown_blob'],
                    question: 'What is the secret_key value inside the blob?',
                    hint: 'The `file` command tells you it is JSON text. Read it with `cat` to see the JSON contents.',
                    correctAnswer: 'FLAG{JSON_FILE_RECOGNIZED}'
                }
            ],
            prerequisites: [
                'No prior experience required.',
                'A basic curiosity about how computers work.'
            ]
        };

        const existingLab = await Lab.findOne({ slug: labData.slug });

        if (existingLab) {
            await Lab.updateOne({ slug: labData.slug }, labData);
            console.log('Hidden Data Discovery Lab updated successfully');
        } else {
            await Lab.create(labData);
            console.log('Hidden Data Discovery Lab created successfully');
        }

    } catch (error) {
        console.error('Error seeding lab:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    }
};

seedHiddenData();
