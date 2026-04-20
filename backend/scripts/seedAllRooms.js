const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const ADMIN_ID = '68ea889ba106726082503cde';

const rooms = [
  {
    slug: 'networking-fundamentals',
    title: 'Networking Fundamentals',
    category: 'Networking',
    difficulty: 'Beginner',
    description: 'Master the OSI model, TCP/IP, DNS, and routing fundamentals.',
    points: 100,
    estimatedTime: 60,
    tags: ['networking', 'osi-model', 'tcp-ip', 'routing', 'dns'],
  },
  {
    slug: 'web-app-pentesting',
    title: 'Web App Pentesting Mastery',
    category: 'Web Security',
    difficulty: 'Advanced',
    description: 'Learn how real hackers identify, analyze, and exploit vulnerabilities in web applications.',
    points: 250,
    estimatedTime: 90,
    tags: ['web-security', 'pentesting', 'owasp', 'xss'],
  },
  {
    slug: 'rest-api-mastery',
    title: 'Introduction to RESTful APIs',
    category: 'Development',
    difficulty: 'Beginner',
    description: 'Learn REST API fundamentals, HTTP methods, JSON, and build your first endpoint.',
    points: 100,
    estimatedTime: 40,
    tags: ['api', 'rest', 'backend', 'http'],
  },
  {
    slug: 'sql-injection-fundamentals',
    title: 'SQL Injection Fundamentals',
    category: 'Web Security',
    difficulty: 'Beginner',
    description: 'Learn how SQL Injection works and how attackers bypass authentication.',
    points: 100,
    estimatedTime: 50,
    tags: ['sqli', 'database', 'web-security', 'injection'],
  },
  {
    slug: 'linux-fundamentals',
    title: 'Linux Fundamentals',
    category: 'System',
    difficulty: 'Intermediate',
    description: 'Master the Linux command line, manage file systems, and control user permissions.',
    points: 175,
    estimatedTime: 60,
    tags: ['linux', 'terminal', 'sysadmin', 'system-security'],
  },
  {
    slug: 'authentication-session-attacks',
    title: 'Authentication & Session Attacks',
    category: 'Web Security',
    difficulty: 'Advanced',
    description: 'Master session hijacking, JWT manipulation, OAuth flaws, and MFA bypass.',
    points: 250,
    estimatedTime: 90,
    tags: ['auth', 'sessions', 'jwt', 'oauth', 'mfa-bypass'],
  },
  {
    slug: 'osint-investigation',
    title: 'OSINT Investigation',
    category: 'Recon',
    difficulty: 'Advanced',
    description: 'Master Open Source Intelligence, Google dorking, and infrastructure analysis.',
    points: 250,
    estimatedTime: 90,
    tags: ['osint', 'recon', 'investigation', 'intelligence'],
  },
  {
    slug: 'python-pickle-deserialization',
    title: 'Python Pickle Exploitation',
    category: 'Advanced Exploitation',
    difficulty: 'Advanced',
    description: 'Learn how insecure deserialization using Python Pickle leads to RCE.',
    points: 250,
    estimatedTime: 70,
    tags: ['pickle', 'deserialization', 'python', 'rce'],
  },
  {
    slug: 'cryptography-basics',
    title: 'Cryptography & Hashing',
    category: 'Cryptography',
    difficulty: 'Intermediate',
    description: 'Master encryption, hashing, and the core differences between symmetric and asymmetric protocols.',
    points: 175,
    estimatedTime: 60,
    tags: ['crypto', 'hashing', 'encryption', 'ctf'],
  },
  {
    slug: 'reverse-engineering-basics',
    title: 'Reverse Engineering Basics',
    category: 'Reverse Engineering',
    difficulty: 'Advanced',
    description: 'Disassemble binaries, analyze machine instructions, and uncover hidden program logic.',
    points: 250,
    estimatedTime: 75,
    tags: ['reverse', 'binary', 'analysis', 'malware', 'assembly'],
  },
];

const roomSchema = new mongoose.Schema({
  slug: { type: String, unique: true },
  title: String,
  category: String,
  difficulty: String,
  description: String,
  points: Number,
  estimatedTime: Number,
  tags: [String],
  isActive: { type: Boolean, default: true },
  createdBy: mongoose.Schema.Types.ObjectId,
  completedBy: { type: Array, default: [] },
}, { strict: false, timestamps: true });

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Room = mongoose.models.Room || mongoose.model('Room', roomSchema);

    let upserted = 0;
    for (const room of rooms) {
      await Room.findOneAndUpdate(
        { slug: room.slug },
        { $set: { ...room, createdBy: new mongoose.Types.ObjectId(ADMIN_ID) } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      upserted++;
    }
    console.log(`✅ ${upserted} rooms seeded to Atlas successfully!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seed();
