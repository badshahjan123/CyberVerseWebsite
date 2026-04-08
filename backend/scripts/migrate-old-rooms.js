require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('../models/Room');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 CYBERVERSE ROOM MIGRATION SCRIPT
// ═══════════════════════════════════════════════════════════════════════════
// Purpose: Migrate old rooms (Networking & REST API) to new architecture
// Old rooms have outdated backend logic causing real-time update failures
// New architecture: Frontend-only interactive rooms (like Web App Pentesting)
// ═══════════════════════════════════════════════════════════════════════════

const OLD_ROOM_SLUGS = ['networking-fundamentals', 'rest-api-mastery'];

// ═══════════════════════════════════════════════════════════════════════════
// STEP 1: BACKUP EXISTING DATA
// ═══════════════════════════════════════════════════════════════════════════
async function backupOldRooms() {
  console.log('\n📦 STEP 1: BACKING UP OLD ROOMS...\n');
  
  const backup = {
    timestamp: new Date().toISOString(),
    rooms: [],
    userProgress: []
  };

  // Backup room data
  for (const slug of OLD_ROOM_SLUGS) {
    const room = await Room.findOne({ slug });
    if (room) {
      backup.rooms.push(room.toObject());
      console.log(`✅ Backed up room: ${room.title}`);
    } else {
      console.log(`⚠️  Room not found: ${slug}`);
    }
  }

  // Backup user progress for these rooms
  const users = await User.find({
    'roomProgress.roomId': { $in: OLD_ROOM_SLUGS }
  }).select('_id name email roomProgress');

  users.forEach(user => {
    const relevantProgress = user.roomProgress.filter(rp => 
      OLD_ROOM_SLUGS.includes(rp.roomId)
    );
    if (relevantProgress.length > 0) {
      backup.userProgress.push({
        userId: user._id,
        name: user.name,
        email: user.email,
        progress: relevantProgress
      });
    }
  });

  console.log(`\n📊 Backup Summary:`);
  console.log(`   Rooms backed up: ${backup.rooms.length}`);
  console.log(`   Users with progress: ${backup.userProgress.length}`);

  // Save backup to file
  const backupDir = path.join(__dirname, 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupFile = path.join(backupDir, `room-migration-backup-${Date.now()}.json`);
  fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
  console.log(`\n💾 Backup saved to: ${backupFile}\n`);

  return backup;
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 2: DELETE OLD ROOMS
// ═══════════════════════════════════════════════════════════════════════════
async function deleteOldRooms() {
  console.log('\n🗑️  STEP 2: DELETING OLD ROOMS FROM DATABASE...\n');

  for (const slug of OLD_ROOM_SLUGS) {
    const result = await Room.deleteOne({ slug });
    if (result.deletedCount > 0) {
      console.log(`✅ Deleted room: ${slug}`);
    } else {
      console.log(`⚠️  Room not found: ${slug}`);
    }
  }

  console.log('\n✅ Old rooms deleted successfully\n');
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 3: CLEAN USER PROGRESS (Remove old room references)
// ═══════════════════════════════════════════════════════════════════════════
async function cleanUserProgress() {
  console.log('\n🧹 STEP 3: CLEANING USER PROGRESS...\n');

  const users = await User.find({
    'roomProgress.roomId': { $in: OLD_ROOM_SLUGS }
  });

  let cleanedCount = 0;
  for (const user of users) {
    // Remove old room progress entries
    user.roomProgress = user.roomProgress.filter(rp => 
      !OLD_ROOM_SLUGS.includes(rp.roomId)
    );
    await user.save();
    cleanedCount++;
  }

  console.log(`✅ Cleaned progress for ${cleanedCount} users\n`);
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 4: RECREATE ROOMS WITH NEW ARCHITECTURE
// ═══════════════════════════════════════════════════════════════════════════
async function recreateRooms() {
  console.log('\n🏗️  STEP 4: RECREATING ROOMS WITH NEW ARCHITECTURE...\n');

  // ─────────────────────────────────────────────────────────────────────────
  // NETWORKING FUNDAMENTALS ROOM
  // ─────────────────────────────────────────────────────────────────────────
  const networkingRoom = new Room({
    slug: 'networking-fundamentals',
    title: 'Networking Fundamentals',
    short_description: 'Master the OSI model, TCP/IP, DNS, and routing fundamentals',
    long_description_markdown: `# Networking Fundamentals

Learn the core concepts of computer networking from the ground up. This room covers:

- **OSI Model**: Understand the 7 layers of network communication
- **IP Addressing**: Master IPv4, subnetting, and addressing schemes
- **Protocols**: Deep dive into TCP vs UDP
- **DNS & DHCP**: Learn how domain names resolve and IPs are assigned
- **Routing & Switching**: Understand how data moves across networks

Perfect for beginners looking to build a solid foundation in networking.`,
    difficulty: 'Beginner',
    category: 'Networking',
    tags: ['networking', 'osi-model', 'tcp-ip', 'routing', 'dns'],
    cover_image_url: '/images/rooms/networking-cover.png',
    creator: 'CyberVerse Team',
    estimated_time_minutes: 60,
    prerequisites: [],
    learning_objectives: [
      'Understand the OSI model and its 7 layers',
      'Master IP addressing and subnetting',
      'Differentiate between TCP and UDP protocols',
      'Explain DNS and DHCP functionality',
      'Understand routing and switching concepts'
    ],
    topics: [
      {
        id: 1,
        title: 'The OSI Model',
        order: 1,
        estimated_time_minutes: 12,
        content_markdown: 'Interactive content handled by frontend'
      },
      {
        id: 2,
        title: 'IP Addressing & Subnetting',
        order: 2,
        estimated_time_minutes: 12,
        content_markdown: 'Interactive content handled by frontend'
      },
      {
        id: 3,
        title: 'Protocols: TCP vs UDP',
        order: 3,
        estimated_time_minutes: 12,
        content_markdown: 'Interactive content handled by frontend'
      },
      {
        id: 4,
        title: 'DNS & DHCP',
        order: 4,
        estimated_time_minutes: 12,
        content_markdown: 'Interactive content handled by frontend'
      },
      {
        id: 5,
        title: 'Routing & Switching',
        order: 5,
        estimated_time_minutes: 12,
        content_markdown: 'Interactive content handled by frontend'
      }
    ],
    exercises: [],
    quizzes: [],
    isActive: true
  });

  await networkingRoom.save();
  console.log('✅ Created: Networking Fundamentals');

  // ─────────────────────────────────────────────────────────────────────────
  // REST API MASTERY ROOM
  // ─────────────────────────────────────────────────────────────────────────
  const restApiRoom = new Room({
    slug: 'rest-api-mastery',
    title: 'Introduction to RESTful APIs (Backend Development Basics)',
    short_description: 'Learn REST API fundamentals, HTTP methods, JSON, and build your first endpoint',
    long_description_markdown: `# Introduction to RESTful APIs

Master the fundamentals of REST API development and backend communication. This room covers:

- **API Basics**: Understand what APIs are and why they matter
- **HTTP Methods**: Master GET, POST, PUT, DELETE
- **Request & Response**: Learn status codes and data flow
- **JSON**: The universal language of APIs
- **Authentication**: Secure your endpoints with headers and tokens
- **Building APIs**: Create your first Express.js endpoint

Perfect for aspiring backend developers and full-stack engineers.`,
    difficulty: 'Beginner',
    category: 'Development',
    tags: ['api', 'rest', 'backend', 'http', 'express'],
    cover_image_url: '/images/rooms/api-cover.png',
    creator: 'CyberVerse Team',
    estimated_time_minutes: 40,
    prerequisites: [],
    learning_objectives: [
      'Understand REST API principles',
      'Master HTTP methods and status codes',
      'Work with JSON data format',
      'Implement API authentication',
      'Build a basic Express.js endpoint'
    ],
    topics: [
      {
        id: 1,
        title: 'What is an API?',
        order: 1,
        estimated_time_minutes: 8,
        content_markdown: 'Interactive content handled by frontend'
      },
      {
        id: 2,
        title: 'Request & Response',
        order: 2,
        estimated_time_minutes: 8,
        content_markdown: 'Interactive content handled by frontend'
      },
      {
        id: 3,
        title: 'JSON: The Language of APIs',
        order: 3,
        estimated_time_minutes: 8,
        content_markdown: 'Interactive content handled by frontend'
      },
      {
        id: 4,
        title: 'Headers & Auth',
        order: 4,
        estimated_time_minutes: 8,
        content_markdown: 'Interactive content handled by frontend'
      },
      {
        id: 5,
        title: 'Building your First Endpoint',
        order: 5,
        estimated_time_minutes: 8,
        content_markdown: 'Interactive content handled by frontend'
      }
    ],
    exercises: [],
    quizzes: [],
    isActive: true
  });

  await restApiRoom.save();
  console.log('✅ Created: REST API Mastery');

  console.log('\n✅ All rooms recreated successfully\n');
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 5: VERIFY MIGRATION
// ═══════════════════════════════════════════════════════════════════════════
async function verifyMigration() {
  console.log('\n🔍 STEP 5: VERIFYING MIGRATION...\n');

  for (const slug of OLD_ROOM_SLUGS) {
    const room = await Room.findOne({ slug });
    if (room) {
      console.log(`✅ Room exists: ${room.title}`);
      console.log(`   - Slug: ${room.slug}`);
      console.log(`   - Category: ${room.category}`);
      console.log(`   - Topics: ${room.topics.length}`);
      console.log(`   - Active: ${room.isActive}`);
    } else {
      console.log(`❌ Room NOT found: ${slug}`);
    }
  }

  // Check for any remaining user progress
  const usersWithOldProgress = await User.countDocuments({
    'roomProgress.roomId': { $in: OLD_ROOM_SLUGS }
  });

  console.log(`\n📊 Users with old progress: ${usersWithOldProgress}`);
  
  if (usersWithOldProgress === 0) {
    console.log('✅ All user progress cleaned successfully');
  } else {
    console.log('⚠️  Some users still have old progress references');
  }

  console.log('\n✅ Migration verification complete\n');
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN MIGRATION FUNCTION
// ═══════════════════════════════════════════════════════════════════════════
async function runMigration() {
  try {
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║         🚀 CYBERVERSE ROOM MIGRATION SCRIPT                  ║');
    console.log('║         Migrating old rooms to new architecture              ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Run migration steps
    await backupOldRooms();
    await deleteOldRooms();
    await cleanUserProgress();
    await recreateRooms();
    await verifyMigration();

    console.log('╔═══════════════════════════════════════════════════════════════╗');
    console.log('║         ✅ MIGRATION COMPLETED SUCCESSFULLY                   ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');

    console.log('📋 NEXT STEPS:');
    console.log('   1. Frontend components already exist (NetworkingFundamentalsRoom.jsx, RestApiRoom.jsx)');
    console.log('   2. Test both rooms in the browser');
    console.log('   3. Complete a room and verify:');
    console.log('      ✓ XP updates in real-time');
    console.log('      ✓ Dashboard updates');
    console.log('      ✓ Navbar updates');
    console.log('      ✓ Leaderboard updates');
    console.log('      ✓ Badge unlocks');
    console.log('      ✓ Room completion status\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ MIGRATION FAILED:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run migration
runMigration();
