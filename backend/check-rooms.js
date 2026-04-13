require("dotenv").config();
const mongoose = require("mongoose");

async function checkRooms() {
  try {
    console.log("🔍 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const Room = require("./models/Room");
    const rooms = await Room.find();

    console.log(`\n✅ Found ${rooms.length} rooms in database\n`);

    if (rooms.length > 0) {
      rooms.forEach((room, idx) => {
        console.log(`${idx + 1}. Title: ${room.title}`);
        console.log(`   Slug: ${room.slug}`);
        console.log(`   Active: ${room.isActive}`);
        console.log(`   Topics: ${room.topics?.length || 0}`);
        console.log("");
      });
    } else {
      console.log("❌ No rooms found in database");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkRooms();
