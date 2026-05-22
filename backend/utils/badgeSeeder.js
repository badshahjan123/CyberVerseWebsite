const Badge = require('../models/Badge');

/**
 * Badge Registry
 *
 * Structure:
 *   Room badges  → category:'room',      badgeType:'primary'|'bonus', roomId set
 *   Milestones   → category:'milestone', badgeType:'milestone',        roomId null
 *   Streak       → category:'streak',    badgeType:'milestone',        roomId null
 *
 * Each room gets EXACTLY:
 *   1 primary badge  (awarded on completion)
 *   1 bonus badge    (awarded only on perfect_score OR no_hints)
 */
const BADGE_REGISTRY = [

  // ─────────────────────────────────────────────
  // ROOM: networking-fundamentals
  // ─────────────────────────────────────────────
  {
    name: 'Packet Architect',
    description: 'Demonstrated mastery of OSI layers, IP addressing, TCP/UDP, and routing fundamentals.',
    unlockReason: 'Complete the Networking Fundamentals room',
    category: 'room',
    badgeType: 'primary',
    roomId: 'networking-fundamentals',
    bonusCondition: null,
    difficulty: 'common',
    xpReward: 0,
    icon: 'network'
  },
  {
    name: 'Flawless Packet',
    description: 'Answered every question correctly without using a single hint. Networking mastery confirmed.',
    unlockReason: 'Complete Networking Fundamentals with 100% accuracy and no hints',
    category: 'room',
    badgeType: 'bonus',
    roomId: 'networking-fundamentals',
    bonusCondition: 'perfect_no_hints',
    difficulty: 'rare',
    xpReward: 200,
    icon: 'shield-check'
  },

  // ─────────────────────────────────────────────
  // ROOM: rest-api-mastery
  // ─────────────────────────────────────────────
  {
    name: 'API Craftsman',
    description: 'Proved command of REST principles, HTTP methods, status codes, and JSON structure.',
    unlockReason: 'Complete the Introduction to RESTful APIs room',
    category: 'room',
    badgeType: 'primary',
    roomId: 'rest-api-mastery',
    bonusCondition: null,
    difficulty: 'common',
    xpReward: 0,
    icon: 'code-xml'
  },
  {
    name: 'Zero-Error Endpoint',
    description: 'Navigated every API concept without a single wrong answer or hint request.',
    unlockReason: 'Complete RESTful APIs room with 100% accuracy and no hints',
    category: 'room',
    badgeType: 'bonus',
    roomId: 'rest-api-mastery',
    bonusCondition: 'perfect_no_hints',
    difficulty: 'rare',
    xpReward: 200,
    icon: 'zap'
  },

  // ─────────────────────────────────────────────
  // ROOM: web-app-pentesting
  // ─────────────────────────────────────────────
  {
    name: 'Web Infiltrator',
    description: 'Completed a full web application penetration testing simulation — recon to defense.',
    unlockReason: 'Complete the Web App Pentesting Mastery room',
    category: 'room',
    badgeType: 'primary',
    roomId: 'web-app-pentesting',
    bonusCondition: null,
    difficulty: 'uncommon',
    xpReward: 0,
    icon: 'target-lock'
  },
  {
    name: 'Ghost Operator',
    description: 'Executed a flawless pentest simulation — no hints, no mistakes. Elite-level precision.',
    unlockReason: 'Complete Web App Pentesting with 100% accuracy and no hints',
    category: 'room',
    badgeType: 'bonus',
    roomId: 'web-app-pentesting',
    bonusCondition: 'perfect_no_hints',
    difficulty: 'legendary',
    xpReward: 500,
    icon: 'brain-circuit'
  },

  // ─────────────────────────────────────────────
  // ROOM: governance-and-regulations
  // ─────────────────────────────────────────────
  {
    name: 'GRC Initiate',
    description: 'Demonstrated initial understanding of cybersecurity governance, risk management, and compliance frameworks.',
    unlockReason: 'Complete the Governance & Regulations room',
    category: 'room',
    badgeType: 'primary',
    roomId: 'governance-and-regulations',
    bonusCondition: null,
    difficulty: 'common',
    xpReward: 0,
    icon: 'shield'
  },
  {
    name: 'Compliance Officer',
    description: 'Completed the Governance & Regulations room with 100% accuracy and zero hints.',
    unlockReason: 'Complete Governance & Regulations with 100% accuracy and no hints',
    category: 'room',
    badgeType: 'bonus',
    roomId: 'governance-and-regulations',
    bonusCondition: 'perfect_no_hints',
    difficulty: 'rare',
    xpReward: 200,
    icon: 'user-lock'
  },

  // ─────────────────────────────────────────────
  // GLOBAL MILESTONE BADGES
  // ─────────────────────────────────────────────
  {
    name: 'First Breach',
    description: 'Completed your first room. The perimeter has been crossed.',
    unlockReason: 'Complete 1 room',
    category: 'milestone',
    badgeType: 'milestone',
    roomId: null,
    bonusCondition: null,
    difficulty: 'common',
    xpReward: 100,
    icon: 'target-lock'
  },
  {
    name: 'Shadow Operative',
    description: 'Five rooms down. You are no longer a beginner.',
    unlockReason: 'Complete 5 rooms',
    category: 'milestone',
    badgeType: 'milestone',
    roomId: null,
    bonusCondition: null,
    difficulty: 'uncommon',
    xpReward: 500,
    icon: 'footprints'
  },
  {
    name: 'Elite Operative',
    description: 'Fifteen rooms completed. System-wide authority established.',
    unlockReason: 'Complete 15 rooms',
    category: 'milestone',
    badgeType: 'milestone',
    roomId: null,
    bonusCondition: null,
    difficulty: 'rare',
    xpReward: 2000,
    icon: 'shield-check'
  },

  // ─────────────────────────────────────────────
  // STREAK BADGES
  // ─────────────────────────────────────────────
  {
    name: 'Persistent Signal',
    description: 'Maintained an active presence for 7 consecutive days.',
    unlockReason: 'Maintain a 7-day activity streak',
    category: 'streak',
    badgeType: 'milestone',
    roomId: null,
    bonusCondition: null,
    difficulty: 'uncommon',
    xpReward: 300,
    icon: 'timer'
  },
  {
    name: 'Unbreakable',
    description: '30 days of continuous operation. Legendary commitment.',
    unlockReason: 'Maintain a 30-day activity streak',
    category: 'streak',
    badgeType: 'milestone',
    roomId: null,
    bonusCondition: null,
    difficulty: 'legendary',
    xpReward: 1500,
    icon: 'crown'
  }
];

const seedBadges = async () => {
  try {
    for (const badge of BADGE_REGISTRY) {
      await Badge.updateOne(
        { name: badge.name },
        { $set: badge },
        { upsert: true }
      );
    }
    console.log(`✅ Badge registry seeded — ${BADGE_REGISTRY.length} badges.`);
  } catch (error) {
    console.error('❌ Badge seeding error:', error);
  }
};

module.exports = { seedBadges, BADGE_REGISTRY };
