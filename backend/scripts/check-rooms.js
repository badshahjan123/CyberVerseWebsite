require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('../models/Room');

async function checkRooms() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const rooms = await Room.find({}).select('slug title category difficulty createdAt');
    
    console.log('\n📊 EXISTING ROOMS:\n');
    rooms.forEach((room, index) => {
      console.log(`${index + 1}. ${room.title}`);
      console.log(`   Slug: ${room.slug}`);
      console.log(`   Category: ${room.category}`);
      console.log(`   Difficulty: ${room.difficulty}`);
      console.log(`   Created: ${room.createdAt}`);
      console.log('');
    });

    console.log(`\nTotal Rooms: ${rooms.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkRooms();
