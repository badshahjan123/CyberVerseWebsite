const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Track = require('../models/Track');
const Room = require('../models/Room');

const tracksData = [
  {
    name: "Red Team Specialist",
    slug: "red-team-specialist",
    description: "System Intrusion & Privilege Escalation",
    roomSlugs: ["linux-fundamentals", "web-app-pentesting", "python-pickle-deserialization"]
  },
  {
    name: "Advanced Malware Analyst",
    slug: "advanced-malware-analyst",
    description: "Reverse Engineering & Malware Containment",
    roomSlugs: ["reverse-engineering-basics", "cryptography-basics"]
  },
  {
    name: "Threat Intelligence Operator",
    slug: "threat-intelligence-operator",
    description: "OSINT & Digital Forensics",
    roomSlugs: ["osint-investigation", "networking-fundamentals"]
  }
];

async function seedTracks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB successfully for track seeding.");

    for (const trackData of tracksData) {
      // Find Room ObjectIds by slugs
      const rooms = await Room.find({ slug: { $in: trackData.roomSlugs } });
      const roomIds = rooms.map(r => r._id);

      if (roomIds.length === 0) {
        console.warn(`[Seeder] Warning: No rooms found for track ${trackData.name} slugs ${trackData.roomSlugs}`);
      }

      await Track.findOneAndUpdate(
        { slug: trackData.slug },
        {
          name: trackData.name,
          slug: trackData.slug,
          description: trackData.description,
          rooms: roomIds
        },
        { upsert: true, new: true }
      );
      console.log(`Seeded track: ${trackData.name} with ${roomIds.length} rooms.`);
    }

    console.log("Track seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Track seeding failed:", error);
    process.exit(1);
  }
}

seedTracks();
