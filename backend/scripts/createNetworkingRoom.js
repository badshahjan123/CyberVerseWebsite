const mongoose = require('mongoose');
const Room = require('../models/Room');
require('dotenv').config();

const createNetworkingRoom = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cyberverse');

    const networkingRoomData = {
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
            question_text: "How many layers does the OSI model have?",
            options: ["4 layers", "5 layers", "7 layers", "9 layers"],
            correct_answer: "7 layers",
            points: 10,
            explanation: "The OSI model has 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, and Application."
          },
          {
            id: 2,
            type: "single",
            question_text: "What is the default port number for SSH (Secure Shell)?",
            options: ["21", "22", "80", "443"],
            correct_answer: "22",
            points: 10,
            explanation: "SSH uses port 22 by default for secure remote access to systems."
          },
          {
            id: 3,
            type: "single",
            question_text: "Which Nmap scan type is known as a 'stealth scan'?",
            options: ["UDP scan", "TCP Connect scan", "TCP SYN scan", "Ping scan"],
            correct_answer: "TCP SYN scan",
            points: 10,
            explanation: "TCP SYN scan (-sS) is considered stealthy because it doesn't complete the TCP handshake."
          },
          {
            id: 4,
            type: "single",
            question_text: "Which passive reconnaissance tool provides domain registration information?",
            options: ["nslookup", "whois", "ping", "traceroute"],
            correct_answer: "whois",
            points: 10,
            explanation: "whois retrieves domain registration details including owner information, registrar, and registration dates."
          },
          {
            id: 5,
            type: "single",
            question_text: "What does SMB stand for in network services?",
            options: ["Simple Mail Block", "Server Message Block", "Secure Mail Box", "System Memory Buffer"],
            correct_answer: "Server Message Block",
            points: 10,
            explanation: "SMB (Server Message Block) is a protocol used for file sharing in Windows networks."
          }
        ]
      }]
    };

    // Use findOneAndUpdate with upsert to ensure reliable updates
    const networkingRoom = await Room.findOneAndUpdate(
      { slug: 'networking-fundamentals' },
      networkingRoomData,
      { upsert: true, new: true, overwrite: true }
    );

    console.log('✅ Networking Fundamentals room created/updated successfully!');
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