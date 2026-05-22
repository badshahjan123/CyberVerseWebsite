const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Room = require('../models/Room');
const Track = require('../models/Track');
const Certificate = require('../models/Certificate');
const { checkAndIssueTrackCertificate } = require('../services/certificate.service');

async function testPipeline() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for testing.");

    // 1. Find a test user or create one
    let user = await User.findOne({ email: "testuser@cyberverse.io" });
    if (!user) {
      user = new User({
        name: "Test Hacker",
        email: "testuser@cyberverse.io",
        password: "Password123!",
        authProvider: "local",
        points: 500,
        roomProgress: []
      });
      await user.save();
      console.log("Created test user: testuser@cyberverse.io");
    }

    // 2. Clear existing certificates for test user to allow fresh runs
    const deleteCount = await Certificate.deleteMany({ userId: user._id });
    console.log(`Cleaned up ${deleteCount.deletedCount} existing test certificates.`);

    // 3. Let's select a track, e.g., "threat-intelligence-operator"
    const track = await Track.findOne({ slug: "threat-intelligence-operator" });
    if (!track) {
      console.error("Track not found. Did you run seedTracks.js first?");
      process.exit(1);
    }
    console.log(`Testing track: ${track.name} with rooms: ${track.rooms.join(', ')}`);

    // Fetch the rooms of this track to get their slugs
    const trackRooms = await Room.find({ _id: { $in: track.rooms } });
    const slugs = trackRooms.map(r => r.slug);
    console.log(`Track room slugs: ${slugs.join(', ')}`);

    // 4. Mark all except the last room as completed in user's roomProgress
    user.roomProgress = [];
    for (let i = 0; i < slugs.length - 1; i++) {
      user.roomProgress.push({
        roomId: slugs[i],
        joined: true,
        completed: true,
        completedAt: new Date()
      });
    }
    await user.save();
    console.log(`Completed ${slugs.length - 1}/${slugs.length} rooms for user.`);

    // 5. Complete the final room and trigger checkAndIssueTrackCertificate
    const finalRoomSlug = slugs[slugs.length - 1];
    console.log(`Now completing final room: ${finalRoomSlug}`);

    user.roomProgress.push({
      roomId: finalRoomSlug,
      joined: true,
      completed: true,
      completedAt: new Date()
    });
    await user.save();

    console.log("Triggering checkAndIssueTrackCertificate...");
    const result = await checkAndIssueTrackCertificate(user._id, finalRoomSlug);
    console.log("Result of checkAndIssueTrackCertificate:", result);

    // 6. Double check that a certificate is stored in DB
    const certs = await Certificate.find({ userId: user._id }).populate('trackId');
    console.log(`Verification: Found ${certs.length} certificates in DB for user.`);
    certs.forEach(c => {
      console.log(` - Credential ID: ${c.credentialId}, Track: ${c.trackId.name}, Verification Hash: ${c.verificationHash}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Test execution failed:", error);
    process.exit(1);
  }
}

testPipeline();
