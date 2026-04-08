require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('../models/Room');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════════
// 🔄 CYBERVERSE ROOM MIGRATION ROLLBACK SCRIPT
// ═══════════════════════════════════════════════════════════════════════════
// Purpose: Restore rooms and user progress from backup
// Use this if the migration causes critical issues
// ═══════════════════════════════════════════════════════════════════════════

async function restoreFromBackup(backupFilePath) {
  try {
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║         🔄 CYBERVERSE ROLLBACK SCRIPT                        ║');
    console.log('║         Restoring from backup                                ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Read backup file
    console.log('📂 Reading backup file...\n');
    const backupPath = path.isAbsolute(backupFilePath) 
      ? backupFilePath 
      : path.join(__dirname, backupFilePath);

    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup file not found: ${backupPath}`);
    }

    const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    console.log(`✅ Backup loaded: ${backup.timestamp}`);
    console.log(`   Rooms in backup: ${backup.rooms.length}`);
    console.log(`   Users in backup: ${backup.userProgress.length}\n`);

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 1: Delete current rooms
    // ═══════════════════════════════════════════════════════════════════════
    console.log('🗑️  STEP 1: Removing current rooms...\n');
    
    const roomSlugs = backup.rooms.map(r => r.slug);
    for (const slug of roomSlugs) {
      const result = await Room.deleteOne({ slug });
      if (result.deletedCount > 0) {
        console.log(`✅ Deleted current room: ${slug}`);
      }
    }
    console.log('');

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 2: Restore rooms from backup
    // ═══════════════════════════════════════════════════════════════════════
    console.log('📦 STEP 2: Restoring rooms from backup...\n');
    
    for (const roomData of backup.rooms) {
      // Remove MongoDB-specific fields
      delete roomData._id;
      delete roomData.__v;
      delete roomData.createdAt;
      delete roomData.updatedAt;

      const room = new Room(roomData);
      await room.save();
      console.log(`✅ Restored room: ${room.title}`);
    }
    console.log('');

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 3: Restore user progress
    // ═══════════════════════════════════════════════════════════════════════
    console.log('👥 STEP 3: Restoring user progress...\n');
    
    for (const userBackup of backup.userProgress) {
      const user = await User.findById(userBackup.userId);
      if (user) {
        // Remove existing progress for these rooms
        user.roomProgress = user.roomProgress.filter(rp => 
          !roomSlugs.includes(rp.roomId)
        );

        // Add back the backed up progress
        user.roomProgress.push(...userBackup.progress);
        await user.save();
        console.log(`✅ Restored progress for: ${user.name}`);
      } else {
        console.log(`⚠️  User not found: ${userBackup.name} (${userBackup.userId})`);
      }
    }
    console.log('');

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 4: Verify restoration
    // ═══════════════════════════════════════════════════════════════════════
    console.log('🔍 STEP 4: Verifying restoration...\n');
    
    for (const slug of roomSlugs) {
      const room = await Room.findOne({ slug });
      if (room) {
        console.log(`✅ Room verified: ${room.title}`);
        console.log(`   - Exercises: ${room.exercises.length}`);
        console.log(`   - Quizzes: ${room.quizzes.length}`);
      } else {
        console.log(`❌ Room NOT found: ${slug}`);
      }
    }

    const usersWithProgress = await User.countDocuments({
      'roomProgress.roomId': { $in: roomSlugs }
    });
    console.log(`\n✅ Users with restored progress: ${usersWithProgress}`);

    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║         ✅ ROLLBACK COMPLETED SUCCESSFULLY                   ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');

    console.log('⚠️  IMPORTANT NOTES:');
    console.log('   1. The old architecture has been restored');
    console.log('   2. Real-time update issues will return');
    console.log('   3. Fix the root cause before re-running migration');
    console.log('   4. Restart the backend server');
    console.log('   5. Test the rooms to ensure they work\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ ROLLBACK FAILED:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('\n❌ ERROR: Backup file path required\n');
  console.log('Usage: node restore-backup.js <backup-file-path>\n');
  console.log('Example:');
  console.log('  node restore-backup.js backups/room-migration-backup-1234567890.json\n');
  
  // List available backups
  const backupDir = path.join(__dirname, 'backups');
  if (fs.existsSync(backupDir)) {
    const backups = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('room-migration-backup-') && f.endsWith('.json'))
      .sort()
      .reverse();
    
    if (backups.length > 0) {
      console.log('Available backups:');
      backups.forEach((backup, i) => {
        const stats = fs.statSync(path.join(backupDir, backup));
        console.log(`  ${i + 1}. ${backup} (${stats.size} bytes, ${stats.mtime.toLocaleString()})`);
      });
      console.log('');
    }
  }
  
  process.exit(1);
}

const backupFile = args[0];
restoreFromBackup(backupFile);
