const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Lab = require('../models/Lab');
const User = require('../models/User');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const seedContainerBreakout = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const admin = await User.findOne({ role: 'admin' }) || await User.findOne();
        if (!admin) {
            console.error('No user found for createdBy field');
            process.exit(1);
        }

        const labData = {
            title: 'Container Breakout: The Escape',
            slug: 'container-breakout',
            dockerId: 'container-breakout',

            dockerImage: 'badshahjan/lab1:latest',
            dockerPort: 8089,
            dockerInternalPort: 80,

            description:
                'You have been dropped into what appears to be a restricted shell environment. Use advanced reconnaissance to determine your boundaries, enumerate capabilities, and ultimately achieve a full container escape to compromise the underlying host.',

            content:
                '## Operation Briefing\nContainers are isolated environments, but misconfigurations can allow attackers to break out and compromise the host system. In this expert-level scenario, you must identify that you are inside a container, abuse excessive capabilities (`CAP_SYS_ADMIN`), and pivot your access to the host filesystem.\n\n## Technical Parameters\n- The environment restricts your lateral movement.\n- You will need to inspect the environment variables and mount points.\n- Exploit misconfigured capabilities to mount the host filesystem and retrieve the final flags.',

            difficulty: 'Expert',
            category: 'Cloud Security',
            createdBy: admin._id,

            points: 500, 

            isPremium: false,
            isActive: true,

            coverImage:
                'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=1000',

            tags: [
                'docker',
                'container-escape',
                'privilege-escalation',
                'kubernetes',
                'cloud-security'
            ],

            resources: [
                {
                    title: 'Advanced Docker Escapes Video Walkthrough',
                    url: 'https://youtu.be/B-QLZwSrAWA?si=WhTwggSx-_kcfQSu',
                    type: 'video'
                }
            ],

            estimatedTime: 60,

            learningObjectives: [
                'Identify containerized environments through file system artifacts.',
                'Enumerate Linux capabilities using capsh.',
                'Exploit CAP_SYS_ADMIN to mount host file systems.',
                'Read sensitive host files from within a compromised container.'
            ],

            tasks: [
                {
                    id: 1,
                    title: 'Environment Reconnaissance',
                    instructions:
                        'Determine if you are running inside a containerized environment. Check for the existence of `.dockerenv` in the home directory or root.',
                    commands: ['ls -la /', 'ls -la /home/labuser', 'cat /home/labuser/docker-recon/recon_flag.txt'],
                    question: 'What is the flag found after confirming the docker environment?',
                    hint: 'Look in /home/labuser/docker-recon/',
                    correctAnswer: 'FLAG{DOCKER_ENV_DETECTED}'
                },
                {
                    id: 2,
                    title: 'Capability Enumeration',
                    instructions:
                        'You need to check the privileges granted to this container. The container was run in privileged mode. Find the flag associated with the exploited capabilities mount.',
                    commands: ['capsh --print', 'cat /mnt/host_fs/host_flag.txt'],
                    question: 'What is the capability exploitation flag?',
                    hint: 'A successful exploit mount was placed in /mnt/host_fs. Read the flag there.',
                    correctAnswer: 'FLAG{CAP_SYS_ADMIN_EXPLOITED}'
                },
                {
                    id: 3,
                    title: 'Host File Exfiltration',
                    instructions:
                        'Now that you have access to the host file system via a mount, extract the flag from the shadow directory mock.',
                    commands: ['ls -la /host_etc', 'cat /host_etc/shadow_flag.txt'],
                    question: 'What is the shadow file flag?',
                    hint: 'Look inside /host_etc/',
                    correctAnswer: 'FLAG{SHADOW_FILE_READ}'
                },
                {
                    id: 4,
                    title: 'Full Container Escape',
                    instructions:
                        'You have completely bypassed the container boundaries. Find the final master flag located in the root directory.',
                    commands: ['cat /root/master_escape_flag.txt'],
                    question: 'What is the master escape flag?',
                    hint: 'Look in the /root/ directory.',
                    correctAnswer: 'FLAG{FULL_CONTAINER_ESCAPE}'
                },
                {
                    id: 5,
                    title: 'Environment Variable Secrets',
                    instructions:
                        'Containers are frequently misconfigured by passing sensitive credentials directly through environment variables. Inspect the current environment to locate a leaked cloud credential flag.',
                    commands: ['printenv | grep FLAG', 'env'],
                    question: 'What is the leaked environment variable flag?',
                    hint: 'Use the `env` or `printenv` command to list all environment variables.',
                    correctAnswer: 'FLAG{ENV_VAR_SECRET_LEAKED}'
                },
                {
                    id: 6,
                    title: 'Docker Socket Abuse',
                    instructions:
                        'Sometimes administrators expose the Docker daemon socket inside the container for CI/CD purposes. Check if `/var/run/docker.sock` exists and inspect it to retrieve the next flag.',
                    commands: ['ls -la /var/run/', 'cat /var/run/docker.sock'],
                    question: 'What flag is found inside the exposed Docker socket?',
                    hint: 'The socket is located at /var/run/docker.sock. Normally you would use the docker client to interact with it, but for this simulation, you can just read it.',
                    correctAnswer: 'FLAG{DOCKER_SOCK_ABUSED}'
                }
            ],
            prerequisites: [
                'Strong understanding of Linux command line.',
                'Knowledge of Docker container architecture.',
                'Familiarity with Linux Capabilities and mount namespaces.'
            ]
        };

        const existingLab = await Lab.findOne({ slug: labData.slug });

        if (existingLab) {
            await Lab.updateOne({ slug: labData.slug }, labData);
            console.log('Container Breakout Lab updated successfully');
        } else {
            await Lab.create(labData);
            console.log('Container Breakout Lab created successfully');
        }

    } catch (error) {
        console.error('Error seeding lab:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    }
};

seedContainerBreakout();
