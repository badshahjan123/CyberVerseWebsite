const mongoose = require('mongoose');
const Lab = require('../models/Lab');
const User = require('../models/User');
const path = require('path');

require('dotenv').config({
    path: path.resolve(__dirname, '../../backend/.env')
});

if (!process.env.MONGODB_URI) {
    require('dotenv').config({
        path: path.resolve(__dirname, '../.env')
    });
}

const seedLab = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const admin =
            await User.findOne({ role: 'admin' }) ||
            await User.findOne();

        if (!admin) {
            console.error('No user found');
            process.exit(1);
        }

        const labData = {
            title: 'Active Directory Enumeration',
            slug: 'active-directory',
            dockerId: 'active-directory',

            dockerImage: 'badshahjan/lab1:latest',
            dockerPort: 8088,
            dockerInternalPort: 80,

            description:
                'Learn the fundamentals of Active Directory enumeration by discovering domain information, users, groups, and domain controllers inside a simulated enterprise environment.',

            content:
                'You have gained access to a workstation inside the CyberVerse corporate network. Your objective is to enumerate the Active Directory environment and identify important assets including users, groups, and the domain controller.',

            difficulty: 'Intermediate',
            category: 'Network Security',

            points: 300, // LAB_XP.Intermediate — synced with utils/xpConfig.js

            isPremium: false,
            isActive: true,

            coverImage:
                '/images/labs/active-directory-cover.png',

            tags: [
                'active-directory',
                'windows',
                'enumeration',
                'ad',
                'cybersecurity'
            ],
            
            resources: [
                {
                    title: 'Active Directory Exploitation Video Walkthrough',
                    url: 'https://youtu.be/-vjF3kgvWVg?si=DMSqAWnbyaKAsM7F',
                    type: 'video'
                }
            ],

            estimatedTime: 45,

            prerequisites: [
                'Basic Linux Commands',
                'Basic Networking'
            ],

            learningObjectives: [
                'Understand Active Directory structure',
                'Enumerate domain information',
                'Discover domain users',
                'Identify security groups',
                'Locate domain controllers'
            ],

            tasks: [
                {
                    id: 1,
                    title: 'Domain Discovery',
                    instructions:
                        'Navigate to the AD data directory and identify the domain name.',

                    commands: [
                        'cd /home/labuser/ad-data',
                        'cat domain.txt'
                    ],

                    question:
                        'What is the domain name?',

                    hint:
                        'Check the domain.txt file.',

                    correctAnswer:
                        'cyberverse.local'
                },

                {
                    id: 2,
                    title: 'User Enumeration',
                    instructions:
                        'Identify the domain users.',

                    commands: [
                        'cat users.txt'
                    ],

                    question:
                        'What is the name of the built-in administrator account?',

                    hint:
                        'Look at the first user in the list.',

                    correctAnswer:
                        'Administrator'
                },

                {
                    id: 3,
                    title: 'Group Enumeration',
                    instructions:
                        'Review the available groups.',

                    commands: [
                        'cat groups.txt'
                    ],

                    question:
                        'Which group contains domain administrators?',

                    hint:
                        'Look for the privileged administrative group.',

                    correctAnswer:
                        'Domain Admins'
                },

                {
                    id: 4,
                    title: 'Domain Controller Discovery',
                    instructions:
                        'Identify the domain controller.',

                    commands: [
                        'cat domain-controller.txt'
                    ],

                    question:
                        'What is the hostname of the domain controller?',

                    hint:
                        'Check the domain-controller file.',

                    correctAnswer:
                        'DC01'
                },

                {
                    id: 5,
                    title: 'Final Review',
                    instructions:
                        'Review all gathered information and confirm the environment.',

                    commands: [
                        'ls',
                        'cat domain.txt',
                        'cat users.txt',
                        'cat groups.txt'
                    ],

                    question:
                        'What is the Active Directory domain name?',

                    hint:
                        'You discovered it during Task 1.',

                    correctAnswer:
                        'cyberverse.local'
                }
            ],

            createdBy: admin._id
        };

        const existing = await Lab.findOne({
            slug: labData.slug
        });

        if (existing) {
            await Lab.findByIdAndUpdate(
                existing._id,
                labData
            );

            console.log(
                'Active Directory Lab updated successfully'
            );
        } else {
            await Lab.create(labData);

            console.log(
                'Active Directory Lab created successfully'
            );
        }
    } catch (error) {
        console.error(
            'Error seeding lab:',
            error
        );
    } finally {
        await mongoose.disconnect();

        console.log(
            'Disconnected from MongoDB'
        );
    }
};

seedLab();