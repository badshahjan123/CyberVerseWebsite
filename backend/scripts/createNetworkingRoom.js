const mongoose = require('mongoose');
const Room = require('../models/Room');
require('dotenv').config();

const createNetworkingRoom = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cyberverse');
    
    // Check if room already exists
    const existingRoom = await Room.findOne({ slug: 'networking-fundamentals' });
    if (existingRoom) {
      console.log('Room already exists, updating...');
      await Room.deleteOne({ slug: 'networking-fundamentals' });
    }
    
    const networkingRoom = new Room({
      title: "Networking Fundamentals",
      slug: "networking-fundamentals",
      short_description: "Learn core networking concepts essential for cybersecurity and ethical hacking.",
      long_description_markdown: "Understanding networking is crucial, as all ethical hacking is done over networks (LANs/WANs). This room covers the OSI and TCP/IP models, IP addressing, common protocols, LAN fundamentals, network scanning with Nmap, service enumeration, and passive reconnaissance techniques.",
      difficulty: "Beginner",
      category: "Networking",
      estimated_time_minutes: 240,
      tags: ["networking", "nmap", "reconnaissance", "tcp-ip", "osi-model"],
      topics: [
        {
          id: 1,
          title: "What is Networking?",
          order: 1,
          estimated_time_minutes: 45,
          content_markdown: "Networking is the practice of connecting computers and other devices to share resources and communicate. In this lecture, we'll explore the OSI and TCP/IP models, which are fundamental frameworks for understanding how data travels across networks. The OSI model has 7 layers (Physical, Data Link, Network, Transport, Session, Presentation, Application), while TCP/IP has 4 layers. We'll also cover IP addressing, which assigns unique identifiers to devices, and common protocols like HTTP (web traffic), DNS (domain name resolution), and SMTP (email)."
        },
        {
          id: 2,
          title: "Introduction to LAN",
          order: 2,
          estimated_time_minutes: 40,
          content_markdown: "A Local Area Network (LAN) connects devices within a limited geographical area, such as a home, office, or building. LANs use technologies like Ethernet and Wi-Fi to enable high-speed communication between devices. Key components include switches (connect devices within the same network), routers (connect different networks), and access points (provide wireless connectivity). Understanding LAN topology, addressing schemes, and security considerations is essential for network design and cybersecurity."
        },
        {
          id: 3,
          title: "Nmap - Network Scanning",
          order: 3,
          estimated_time_minutes: 50,
          content_markdown: "Nmap (Network Mapper) is a powerful open-source tool used for network discovery and security auditing. It can discover hosts on a network, determine open ports and services, detect operating systems, and identify security vulnerabilities. Common Nmap scans include: TCP SYN scan (-sS), UDP scan (-sU), service version detection (-sV), and OS detection (-O). Nmap is essential for penetration testing and network security assessments, helping identify potential attack vectors."
        },
        {
          id: 4,
          title: "Network Services",
          order: 4,
          estimated_time_minutes: 45,
          content_markdown: "Network services are applications that run on networked devices to provide specific functionality. Common services include HTTP/HTTPS (web servers), SSH (secure remote access), FTP (file transfer), DNS (domain name resolution), SMTP (email), and SMB (file sharing). Service enumeration is a critical step in ethical hacking, involving the identification and analysis of running services to find potential vulnerabilities. Tools like Nmap, Netcat, and specialized scripts help enumerate services and gather information about their versions and configurations."
        },
        {
          id: 5,
          title: "Passive Reconnaissance",
          order: 5,
          estimated_time_minutes: 40,
          content_markdown: "Passive reconnaissance involves gathering information about a target without directly interacting with their systems, making it harder to detect. Key tools include: whois (domain registration information), nslookup (DNS queries), dig (detailed DNS information), and Google dorking (advanced search techniques). These tools help identify domain ownership, IP addresses, subdomains, email addresses, and technology stack information. Passive reconnaissance is often the first step in a penetration test, providing valuable intelligence while maintaining stealth."
        }
      ],
      exercises: [
        {
          id: 1,
          title: 'Basic Networking',
          description_markdown: 'What does LAN stand for?',
          hint: 'Think about local networks',
          points: 50,
          expected_flag: 'Local Area Network',
          answer: 'Local Area Network',
          caseSensitive: false
        },
        {
          id: 2,
          title: 'Network Tools',
          description_markdown: 'Complete the word: N___',
          hint: 'Popular network scanning tool mentioned in the content',
          points: 30,
          expected_flag: 'Nmap',
          answer: 'Nmap',
          caseSensitive: false
        },
        {
          id: 3,
          title: 'Web Protocol',
          description_markdown: 'What protocol is used for web browsing?',
          hint: 'Starts with H and mentioned in network services',
          points: 40,
          expected_flag: 'HTTP',
          answer: 'HTTP',
          caseSensitive: false
        },
        {
          id: 4,
          title: 'Network Device',
          description_markdown: 'What device connects different networks together?',
          hint: 'Mentioned in LAN components',
          points: 35,
          expected_flag: 'Router',
          answer: 'Router',
          caseSensitive: false
        },
        {
          id: 5,
          title: 'Passive Reconnaissance',
          description_markdown: 'What tool provides detailed DNS information?',
          hint: 'Mentioned in passive reconnaissance tools',
          points: 30,
          expected_flag: 'dig',
          answer: 'dig',
          caseSensitive: false
        }
      ],
      quizzes: [{
        id: 1,
        title: "Networking Fundamentals Quiz",
        order: 1,
        time_limit_seconds: 600,
        pass_percentage: 70,
        questions: [
          {
            id: 1,
            type: "single",
            question_text: "What does LAN stand for?",
            options: ["Large Area Network", "Local Area Network", "Long Area Network", "Limited Area Network"],
            correct_answer: "Local Area Network",
            points: 10,
            explanation: "LAN stands for Local Area Network, which connects devices in a limited area."
          },
          {
            id: 2,
            type: "single",
            question_text: "Which protocol is used for web browsing?",
            options: ["FTP", "SMTP", "HTTP", "DNS"],
            correct_answer: "HTTP",
            points: 10,
            explanation: "HTTP (HyperText Transfer Protocol) is used for web browsing."
          },
          {
            id: 3,
            type: "single",
            question_text: "What tool is commonly used for network scanning?",
            options: ["Notepad", "Nmap", "Word", "Excel"],
            correct_answer: "Nmap",
            points: 10,
            explanation: "Nmap (Network Mapper) is a popular network scanning tool."
          },
          {
            id: 4,
            type: "single",
            question_text: "Which device connects different networks?",
            options: ["Switch", "Hub", "Router", "Cable"],
            correct_answer: "Router",
            points: 10,
            explanation: "A router connects different networks together."
          },
          {
            id: 5,
            type: "single",
            question_text: "What does DNS stand for?",
            options: ["Data Name System", "Domain Name System", "Digital Name Service", "Direct Network Service"],
            correct_answer: "Domain Name System",
            points: 10,
            explanation: "DNS stands for Domain Name System, which resolves domain names to IP addresses."
          }
        ]
      }]
    });

    await networkingRoom.save();
    console.log('✅ Networking Fundamentals room created successfully!');
    console.log(`Room ID: ${networkingRoom._id}`);
    console.log(`Slug: ${networkingRoom.slug}`);
    
  } catch (error) {
    console.error('❌ Error creating networking room:', error);
  } finally {
    await mongoose.disconnect();
  }
};

// Run the script
createNetworkingRoom();