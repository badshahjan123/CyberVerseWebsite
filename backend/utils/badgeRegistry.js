/**
 * Badge Registry - Complete List of 27 Dynamic Badges
 * Badges are awarded automatically based on user actions and milestones
 */

const badgeRegistry = [
  // ════════════════════════════════════════════════════════════════
  // BEGINNER BADGES (3)
  // ════════════════════════════════════════════════════════════════

  {
    name: "First Blood",
    description: "You completed your first challenge. Welcome to the arena.",
    unlockReason: "Complete your first room",
    category: "milestone",
    badgeType: "progress",
    difficulty: "common",
    xpReward: 100,
    icon: "target-lock",
    isHidden: false,
    evaluator: (user, context) => (user.completedRooms || 0) >= 1,
  },

  {
    name: "Explorer",
    description:
      "Began your journey by joining multiple rooms. The world is vast.",
    unlockReason: "Join at least 3 rooms",
    category: "milestone",
    badgeType: "progress",
    difficulty: "common",
    xpReward: 50,
    icon: "compass",
    isHidden: false,
    evaluator: (user, context) =>
      (user.roomProgress || []).filter((rp) => rp.joined).length >= 3,
  },

  {
    name: "Lab Starter",
    description: "You completed your first lab. Advanced training begins now.",
    unlockReason: "Complete your first lab",
    category: "milestone",
    badgeType: "progress",
    difficulty: "common",
    xpReward: 150,
    icon: "flask",
    isHidden: false,
    evaluator: (user, context) => (user.completedLabs || 0) >= 1,
  },

  // ════════════════════════════════════════════════════════════════
  // PROGRESS BADGES (6)
  // ════════════════════════════════════════════════════════════════

  {
    name: "Rookie",
    description: "5 challenges conquered. You are learning the ropes.",
    unlockReason: "Complete 5 challenges total",
    category: "milestone",
    badgeType: "progress",
    difficulty: "uncommon",
    xpReward: 200,
    icon: "code",
    isHidden: false,
    evaluator: (user, context) =>
      (user.completedRooms || 0) + (user.completedLabs || 0) >= 5,
  },

  {
    name: "Cyber Warrior",
    description: "10 challenges completed. Your skills are sharpening.",
    unlockReason: "Complete 10 challenges total",
    category: "milestone",
    badgeType: "progress",
    difficulty: "uncommon",
    xpReward: 300,
    icon: "shield",
    isHidden: false,
    evaluator: (user, context) =>
      (user.completedRooms || 0) + (user.completedLabs || 0) >= 10,
  },

  {
    name: "Operative",
    description: "25 challenges defeated. You are becoming formidable.",
    unlockReason: "Complete 25 challenges total",
    category: "milestone",
    badgeType: "progress",
    difficulty: "rare",
    xpReward: 500,
    icon: "briefcase",
    isHidden: false,
    evaluator: (user, context) =>
      (user.completedRooms || 0) + (user.completedLabs || 0) >= 25,
  },

  {
    name: "Elite Operative",
    description: "50 challenges mastered. Power coursing through you.",
    unlockReason: "Complete 50 challenges total",
    category: "milestone",
    badgeType: "progress",
    difficulty: "rare",
    xpReward: 1000,
    icon: "badge-check",
    isHidden: false,
    evaluator: (user, context) =>
      (user.completedRooms || 0) + (user.completedLabs || 0) >= 50,
  },

  {
    name: "Master of Cyber",
    description: "75 challenges destroyed. Legendary status approaching.",
    unlockReason: "Complete 75 challenges total",
    category: "milestone",
    badgeType: "progress",
    difficulty: "legendary",
    xpReward: 1500,
    icon: "award",
    isHidden: false,
    evaluator: (user, context) =>
      (user.completedRooms || 0) + (user.completedLabs || 0) >= 75,
  },

  {
    name: "Legendary Hacker",
    description: "100+ challenges conquered. A true master of CyberVerse.",
    unlockReason: "Complete 100+ challenges",
    category: "milestone",
    badgeType: "progress",
    difficulty: "legendary",
    xpReward: 2500,
    icon: "crown",
    isHidden: false,
    evaluator: (user, context) =>
      (user.completedRooms || 0) + (user.completedLabs || 0) >= 100,
  },

  // ════════════════════════════════════════════════════════════════
  // SKILL BADGES (6)
  // ════════════════════════════════════════════════════════════════

  {
    name: "Network Ninja",
    description: "Mastered the flow of packets and protocols.",
    unlockReason: "Reach 80 points in Network skill",
    category: "skill",
    badgeType: "skill",
    difficulty: "rare",
    xpReward: 300,
    icon: "network",
    isHidden: false,
    evaluator: (user, context) => (user.skills?.network || 0) >= 80,
  },

  {
    name: "Web Warrior",
    description: "Supreme power over web technologies and vulnerabilities.",
    unlockReason: "Reach 80 points in Web skill",
    category: "skill",
    badgeType: "skill",
    difficulty: "rare",
    xpReward: 300,
    icon: "globe",
    isHidden: false,
    evaluator: (user, context) => (user.skills?.web || 0) >= 80,
  },

  {
    name: "Linux Legend",
    description: "Fluent in the language of open-source systems.",
    unlockReason: "Reach 80 points in Linux skill",
    category: "skill",
    badgeType: "skill",
    difficulty: "rare",
    xpReward: 300,
    icon: "terminal",
    isHidden: false,
    evaluator: (user, context) => (user.skills?.linux || 0) >= 80,
  },

  {
    name: "Crypto Master",
    description: "Unbreakable ciphers are mere puzzles to you.",
    unlockReason: "Reach 80 points in Crypto skill",
    category: "skill",
    badgeType: "skill",
    difficulty: "rare",
    xpReward: 300,
    icon: "lock",
    isHidden: false,
    evaluator: (user, context) => (user.skills?.crypto || 0) >= 80,
  },

  {
    name: "Forensics Pro",
    description: "No digital trace escapes your analysis.",
    unlockReason: "Reach 80 points in Forensics skill",
    category: "skill",
    badgeType: "skill",
    difficulty: "rare",
    xpReward: 300,
    icon: "search",
    isHidden: false,
    evaluator: (user, context) => (user.skills?.forensics || 0) >= 80,
  },

  {
    name: "OSINT Specialist",
    description: "Master of gathering intelligence from open sources.",
    unlockReason: "Reach 80 points in OSINT skill",
    category: "skill",
    badgeType: "skill",
    difficulty: "rare",
    xpReward: 300,
    icon: "eye",
    isHidden: false,
    evaluator: (user, context) => (user.skills?.osint || 0) >= 80,
  },

  // ════════════════════════════════════════════════════════════════
  // STREAK BADGES (4)
  // ════════════════════════════════════════════════════════════════

  {
    name: "Daily Grinder",
    description: "3 consecutive days of determined learning.",
    unlockReason: "Maintain a 3-day activity streak",
    category: "streak",
    badgeType: "streak",
    difficulty: "common",
    xpReward: 100,
    icon: "flame",
    isHidden: false,
    evaluator: (user, context) => (user.currentStreak || 0) >= 3,
  },

  {
    name: "Unstoppable",
    description: "A full week of relentless dedication.",
    unlockReason: "Maintain a 7-day activity streak",
    category: "streak",
    badgeType: "streak",
    difficulty: "uncommon",
    xpReward: 300,
    icon: "zap",
    isHidden: false,
    evaluator: (user, context) => (user.currentStreak || 0) >= 7,
  },

  {
    name: "Persistent Signal",
    description: "14 consecutive days without defeat. Commitment unmatched.",
    unlockReason: "Maintain a 14-day activity streak",
    category: "streak",
    badgeType: "streak",
    difficulty: "rare",
    xpReward: 800,
    icon: "heart",
    isHidden: false,
    evaluator: (user, context) => (user.currentStreak || 0) >= 14,
  },

  {
    name: "The Immortal",
    description: "30 consecutive days of excellence. Legendary consistency.",
    unlockReason: "Maintain a 30-day activity streak",
    category: "streak",
    badgeType: "streak",
    difficulty: "legendary",
    xpReward: 2000,
    icon: "crown",
    isHidden: false,
    evaluator: (user, context) => (user.currentStreak || 0) >= 30,
  },

  // ════════════════════════════════════════════════════════════════
  // SPECIAL ACHIEVEMENTS (5)
  // ════════════════════════════════════════════════════════════════

  {
    name: "Speed Runner",
    description: "Completed a full room in under 10 minutes. Blinding speed.",
    unlockReason: "Complete a room in under 10 minutes",
    category: "special",
    badgeType: "special",
    difficulty: "legendary",
    xpReward: 500,
    icon: "zap",
    isHidden: true,
    evaluator: (user, context) => {
      if (context.type === "room_completion" && context.durationMs) {
        return context.durationMs < 600000; // 10 mins
      }
      return false;
    },
  },

  {
    name: "Ghost Protocol",
    description: "Solved a room without using a single hint. Pure mastery.",
    unlockReason: "Complete a room with zero hints",
    category: "special",
    badgeType: "special",
    difficulty: "rare",
    xpReward: 400,
    icon: "eye-off",
    isHidden: true,
    evaluator: (user, context) => {
      if (context.type === "room_completion") {
        return context.hintsUsed === 0;
      }
      return false;
    },
  },

  {
    name: "Top 10",
    description: "Secured a position in the elite global top 10.",
    unlockReason: "Reach Top 10 in the global leaderboard",
    category: "special",
    badgeType: "special",
    difficulty: "legendary",
    xpReward: 1000,
    icon: "award",
    isHidden: true,
    evaluator: (user, context) => context.rank && context.rank <= 10,
  },

  {
    name: "Perfect Score",
    description: "Achieved 100% on a quiz. Flawless execution.",
    unlockReason: "Complete a quiz with perfect score",
    category: "special",
    badgeType: "special",
    difficulty: "uncommon",
    xpReward: 250,
    icon: "star",
    isHidden: false,
    evaluator: (user, context) => {
      if (context.type === "quiz_completion") {
        return context.perfectScore === true;
      }
      return false;
    },
  },

  {
    name: "Completionist",
    description: "Finished all available challenges. The ultimate master.",
    unlockReason: "Complete all rooms and labs",
    category: "special",
    badgeType: "special",
    difficulty: "legendary",
    xpReward: 3000,
    icon: "checkmark-circle",
    isHidden: false,
    evaluator: (user, context) => {
      const totalRooms = context.totalRooms || 10;
      const totalLabs = context.totalLabs || 5;
      return (
        (user.completedRooms || 0) >= totalRooms &&
        (user.completedLabs || 0) >= totalLabs
      );
    },
  },

  // ════════════════════════════════════════════════════════════════
  // ROOM SPECIFIC & CATEGORY MILESTONES
  // ════════════════════════════════════════════════════════════════

  {
    name: "SQLi Specialist",
    description: "Mastered the art of database exploitation and defense.",
    unlockReason: "Complete SQL Injection Fundamentals",
    category: "milestone",
    badgeType: "progress",
    difficulty: "uncommon",
    xpReward: 300,
    icon: "database",
    isHidden: false,
    evaluator: (user, context) =>
      context.type === "room_completion" &&
      context.roomId === "sql-injection-fundamentals",
  },

  {
    name: "Linux Master",
    description: "The terminal is your second language. Systems submit to your will.",
    unlockReason: "Complete Linux Fundamentals",
    category: "milestone",
    badgeType: "progress",
    difficulty: "uncommon",
    xpReward: 300,
    icon: "terminal",
    isHidden: false,
    evaluator: (user, context) =>
      context.type === "room_completion" &&
      context.roomId === "linux-fundamentals",
  },

  {
    name: "Architect of Systems",
    description: "Demonstrated deep knowledge of operating systems and core infrastructure.",
    unlockReason: "Complete Linux Fundamentals",
    category: "milestone",
    badgeType: "progress",
    difficulty: "rare",
    xpReward: 500,
    icon: "server",
    isHidden: false,
    evaluator: (user, context) =>
      context.type === "room_completion" &&
      context.roomId === "linux-fundamentals",
  },
  {
    name: "Networking Initiate",
    description: "Mastered the basics of the OSI model and packet flow.",
    unlockReason: "Complete Networking Fundamentals",
    category: "milestone",
    badgeType: "progress",
    difficulty: "common",
    xpReward: 150,
    icon: "network",
    isHidden: false,
    evaluator: (user, context) =>
      context.type === "room_completion" &&
      context.roomId === "networking-fundamentals",
  },

  {
    name: "Web Security Pro",
    description: "You have shown exceptional skill in securing and breaking web applications.",
    unlockReason: "Complete 2 Web Security rooms",
    category: "milestone",
    badgeType: "progress",
    difficulty: "rare",
    xpReward: 500,
    icon: "shield",
    isHidden: false,
    evaluator: (user, context) => {
      const webSlugs = ['web-app-pentesting', 'sql-injection-fundamentals', 'authentication-session-attacks'];
      const completed = (user.roomProgress || []).filter(
        (rp) => rp.completed && webSlugs.includes(rp.roomId),
      ).length;
      return completed >= 2;
    },
  },
  {
    name: "Auth Architect",
    description: "You've mastered the complex landscape of digital identity and access control.",
    unlockReason: "Complete Authentication & Session Attacks",
    category: "milestone",
    badgeType: "progress",
    difficulty: "rare",
    xpReward: 400,
    icon: "user-lock",
    isHidden: false,
    evaluator: (user, context) =>
      context.type === "room_completion" &&
      context.roomId === "authentication-session-attacks",
  },
  {
    name: "Session Sovereign",
    description: "Cookies and tokens are yours to command. No identity is safe from your reach.",
    unlockReason: "Complete the Authentication room with a perfect score",
    category: "special",
    badgeType: "achievement",
    difficulty: "epic",
    xpReward: 600,
    icon: "cookie",
    isHidden: false,
    evaluator: (user, context) =>
      context.type === "room_completion" &&
      context.roomId === "authentication-session-attacks" &&
      context.perfectScore === true,
  },
  {
    name: "OSINT Expert",
    description: "You've proven that nothing stays hidden from your digital magnifying glass.",
    unlockReason: "Complete OSINT Investigation",
    category: "milestone",
    badgeType: "progress",
    difficulty: "rare",
    xpReward: 400,
    icon: "search-code",
    isHidden: false,
    evaluator: (user, context) =>
      context.type === "room_completion" &&
      context.roomId === "osint-investigation",
  },
  {
    name: "Shadow Tracker",
    description: "Achieved absolute perfection in intelligence gathering.",
    unlockReason: "Complete OSINT Investigation with a perfect score",
    category: "special",
    badgeType: "achievement",
    difficulty: "epic",
    xpReward: 600,
    icon: "eye",
    isHidden: false,
    evaluator: (user, context) =>
      context.type === "room_completion" &&
      context.roomId === "osint-investigation" &&
      context.perfectScore === true,
  },
  {
    name: "Pickle Specialist",
    description: "You've mastered the stack-based virtual machine of Python serialization.",
    unlockReason: "Complete Python Pickle Exploitation",
    category: "milestone",
    badgeType: "progress",
    difficulty: "rare",
    xpReward: 400,
    icon: "package",
    isHidden: false,
    evaluator: (user, context) =>
      context.type === "room_completion" &&
      context.roomId === "python-pickle-deserialization",
  },
  {
    name: "Unserialization Master",
    description: "Transformed a simple data load into a full system takeover.",
    unlockReason: "Complete Python Pickle Exploitation with a perfect score",
    category: "special",
    badgeType: "achievement",
    difficulty: "epic",
    xpReward: 600,
    icon: "zap",
    isHidden: false,
    evaluator: (user, context) =>
      context.type === "room_completion" &&
      context.roomId === "python-pickle-deserialization" &&
      context.perfectScore === true,
  },
  {
    name: "Cipher Wizard",
    description: "You've unlocked the secrets of data confidentiality and integrity.",
    unlockReason: "Complete Cryptography & Hashing",
    category: "milestone",
    badgeType: "progress",
    difficulty: "uncommon",
    xpReward: 300,
    icon: "lock",
    isHidden: false,
    evaluator: (user, context) =>
      context.type === "room_completion" &&
      context.roomId === "cryptography-basics",
  },
  {
    name: "Shadow Cracker",
    description: "Proved that even the strongest hashes can't stop you.",
    unlockReason: "Complete Cryptography & Hashing with a perfect score",
    category: "special",
    badgeType: "achievement",
    difficulty: "rare",
    xpReward: 500,
    icon: "unlock",
    isHidden: false,
    evaluator: (user, context) =>
      context.type === "room_completion" &&
      context.roomId === "cryptography-basics" &&
      context.perfectScore === true,
  },
  {
    name: "Binary Architect",
    description: "You've successfully deconstructed complex software into its atomic components.",
    unlockReason: "Complete Reverse Engineering Basics",
    category: "milestone",
    badgeType: "progress",
    difficulty: "rare",
    xpReward: 400,
    icon: "cpu",
    isHidden: false,
    evaluator: (user, context) =>
      context.type === "room_completion" &&
      context.roomId === "reverse-engineering-basics",
  },
  {
    name: "The Ghost in the Code",
    description: "Mastered the flow of binary execution and bypassed every gatekeeper.",
    unlockReason: "Complete Reverse Engineering Basics with a perfect score",
    category: "special",
    badgeType: "achievement",
    difficulty: "legendary",
    xpReward: 700,
    icon: "unlock",
    isHidden: false,
    evaluator: (user, context) =>
      context.type === "room_completion" &&
      context.roomId === "reverse-engineering-basics" &&
      context.perfectScore === true,
  },
  {
    name: "GRC Initiate",
    description: "You've taken your first steps into information security governance, risk, and compliance.",
    unlockReason: "Complete Governance & Regulations",
    category: "milestone",
    badgeType: "progress",
    difficulty: "common",
    xpReward: 150,
    icon: "shield",
    isHidden: false,
    evaluator: (user, context) =>
      context.type === "room_completion" &&
      context.roomId === "governance-and-regulations",
  },
  {
    name: "Compliance Officer",
    description: "Demonstrated flawless alignment with cybersecurity standards, policies, and regulations.",
    unlockReason: "Complete Governance & Regulations with a perfect score",
    category: "special",
    badgeType: "achievement",
    difficulty: "rare",
    xpReward: 400,
    icon: "user-lock",
    isHidden: false,
    evaluator: (user, context) =>
      context.type === "room_completion" &&
      context.roomId === "governance-and-regulations" &&
      context.perfectScore === true,
  },
];

module.exports = badgeRegistry;
