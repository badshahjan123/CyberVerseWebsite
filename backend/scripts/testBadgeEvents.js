const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Room = require('../models/Room');
const { badgeEmitter, badgeService } = require('../services/badgeEventService');

async function runTests() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for testing Badge Event Emitter pipeline.");

    // 1. Setup / clean test user
    let user = await User.findOne({ email: "badge_tester@cyberverse.io" });
    if (user) {
      await User.deleteOne({ _id: user._id });
      console.log("Cleaned up existing badge tester user.");
    }

    user = new User({
      name: "Badge Tester",
      email: "badge_tester@cyberverse.io",
      password: "Password123!",
      authProvider: "local",
      points: 0,
      badges: [],
      roomProgress: []
    });
    await user.save();
    console.log("Created fresh test user.");

    // Helper to reload user from DB
    const reloadUser = async () => await User.findById(user._id);

    // Assert: User starts with 0 badges
    user = await reloadUser();
    console.log(`Initial badges count: ${user.badges.length}`);

    // --- TEST 1: USER_REGISTERED Event ---
    console.log("\n--- Emitting USER_REGISTERED event ---");
    badgeEmitter.emit('USER_REGISTERED', { userId: user._id });

    // Wait short time for event loop processing
    await new Promise(resolve => setTimeout(resolve, 500));

    user = await reloadUser();
    console.log(`Badges after USER_REGISTERED: ${user.badges.map(b => b.name).join(', ')}`);
    if (user.badges.some(b => b.name === "System Initialized")) {
      console.log("✅ USER_REGISTERED badge assignment successful!");
    } else {
      console.error("❌ USER_REGISTERED badge assignment failed.");
    }

    // --- TEST 2: TASK_SUBMITTED Event (Thresholds & Flawless Execution) ---
    console.log("\n--- Setting up 10 correct task submissions (Threshold check) ---");
    // Simulate room progress with 10 correct task flags
    user.roomProgress = [{
      roomId: "linux-fundamentals",
      joined: true,
      completed: true,
      completedAt: new Date(),
      exerciseAnswers: {
        "0": { answer: "FLAG{test}", correct: true },
        "1": { answer: "FLAG{test}", correct: true },
        "2": { answer: "FLAG{test}", correct: true },
        "3": { answer: "FLAG{test}", correct: true },
        "4": { answer: "FLAG{test}", correct: true },
        "5": { answer: "FLAG{test}", correct: true },
        "6": { answer: "FLAG{test}", correct: true },
        "7": { answer: "FLAG{test}", correct: true },
        "8": { answer: "FLAG{test}", correct: true },
        "9": { answer: "FLAG{test}", correct: true }
      },
      incorrectAttempts: {} // 0 incorrect attempts!
    }];
    await user.save();

    console.log("Emitting TASK_SUBMITTED event for 10th correct task flag...");
    badgeEmitter.emit('TASK_SUBMITTED', { userId: user._id, roomId: "linux-fundamentals" });
    await new Promise(resolve => setTimeout(resolve, 500));

    user = await reloadUser();
    console.log(`Badges now: ${user.badges.map(b => b.name).join(', ')}`);
    if (user.badges.some(b => b.name === "Validated Operator")) {
      console.log("✅ Threshold check (10 tasks -> Validated Operator) successful!");
    } else {
      console.error("❌ Threshold check (Validated Operator) failed.");
    }

    if (user.badges.some(b => b.name === "Flawless Execution")) {
      console.log("✅ Accuracy Check (zero incorrect attempts -> Flawless Execution) successful!");
    } else {
      console.error("❌ Accuracy Check (Flawless Execution) failed.");
    }

    // --- TEST 3: ROOM_COMPLETED Event (Category Specialization) ---
    console.log("\n--- Setting up 5 completed Forensics rooms (Category check) ---");
    
    // Seed 5 mock Forensics rooms in database
    const category = "Forensics";
    // Check if we already have Forensics rooms or need to upsert
    const existingForensicsRooms = await Room.find({ category });
    const missingRoomsCount = 5 - existingForensicsRooms.length;

    for (let i = 0; i < missingRoomsCount; i++) {
      const mockRoom = new Room({
        slug: `mock-forensics-room-${i}`,
        title: `Mock Forensics Room ${i}`,
        short_description: "A forensics room for testing.",
        long_description_markdown: "Mock",
        difficulty: "Beginner",
        category: "Misc", // Category is Misc but we'll use standard DB rooms
        estimated_time_minutes: 30
      });
      // We will override category or set it to Forensics
      mockRoom.category = 'DevOps'; // wait, category enum is ['Development', 'Networking', 'Web', 'DevOps', 'Misc']
      // Let's check category enum: ['Development', 'Networking', 'Web', 'DevOps', 'Misc']
      // Let's use 'Misc' for category since 'Forensics' might not be in the enum, or wait:
      // Let's check roomSchema category enum options.
      // Yes: ['Development', 'Networking', 'Web', 'DevOps', 'Misc']
      // Wait, is "Forensics" the tag or skill?
      // In the prompt, the user said:
      // "EVENT: 'ROOM_COMPLETED' - Find the category tag of the completed room (e.g., 'Forensics'). Check how many total rooms under the 'Forensics' tag this user has completed. If it equals 5, award the specialized 'Digital Detective' badge."
      // Ah! "Find the category tag of the completed room (e.g., 'Forensics')". In our Room schema, category is an enum, but rooms can have category/tags. 
      // Let's check if the category can be "Forensics".
      // Wait, let's see how our Room completed handler is written:
      // `const room = await Room.findOne({ slug: roomId });`
      // `const sameCategoryRooms = await Room.find({ category: room.category });`
      // So whatever the category is (e.g., if category is 'Misc' or 'Development' or whatever matches the room's category), we count how many rooms with that category the user completed!
      // Let's look at the database. Let's find one category that has rooms, or we can just use the completed room's category!
    }

    // Let's find a category with rooms in DB, or seed a temporary one
    const tempCategory = "Development";
    const devRooms = await Room.find({ category: tempCategory });
    console.log(`Found ${devRooms.length} existing rooms with category ${tempCategory}`);

    // Let's simulate user completing 5 rooms of this category
    user.roomProgress = [];
    const targetSlugs = [];
    
    // We will simulate 5 completed rooms under tempCategory
    for (let i = 0; i < 5; i++) {
      const slug = `dev-test-room-${i}`;
      targetSlugs.push(slug);
      
      // Ensure Room exists in DB with that slug and category
      await Room.findOneAndUpdate(
        { slug },
        {
          slug,
          title: `Dev Test Room ${i}`,
          short_description: "Dev Test Room",
          long_description_markdown: "Dev Test Room",
          difficulty: "Beginner",
          category: tempCategory,
          estimated_time_minutes: 10
        },
        { upsert: true, new: true }
      );

      user.roomProgress.push({
        roomId: slug,
        joined: true,
        completed: true,
        completedAt: new Date()
      });
    }
    await user.save();
    console.log(`Saved 5 completed rooms in user profile under category "${tempCategory}".`);

    console.log("Emitting ROOM_COMPLETED event...");
    badgeEmitter.emit('ROOM_COMPLETED', { userId: user._id, roomId: targetSlugs[4] });
    await new Promise(resolve => setTimeout(resolve, 500));

    user = await reloadUser();
    console.log(`Badges now: ${user.badges.map(b => b.name).join(', ')}`);
    if (user.badges.some(b => b.name === "Digital Detective")) {
      console.log("✅ Category Specialization check (5 completed rooms -> Digital Detective) successful!");
    } else {
      console.error("❌ Category Specialization check failed.");
    }

    // Clean up seeded database documents
    for (const slug of targetSlugs) {
      await Room.deleteOne({ slug });
    }
    await User.deleteOne({ _id: user._id });
    console.log("Database cleaned up successfully.");
    process.exit(0);

  } catch (error) {
    console.error("Test suite execution failed:", error);
    process.exit(1);
  }
}

runTests();
