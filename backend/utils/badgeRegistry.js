const badgeRegistry = [
  // ── Beginner Badges ──
  {
    name: 'First Blood',
    description: 'Completed your first room or lab. The perimeter has been crossed.',
    unlockReason: 'Complete 1 challenge',
    category: 'milestone',
    badgeType: 'progress',
    difficulty: 'common',
    xpReward: 100,
    icon: 'target-lock',
    isHidden: false,
    evaluator: (user, context) => (user.completedRooms || 0) + (user.completedLabs || 0) >= 1
  },
  {
    name: 'Explorer',
    description: 'Began your journey by initiating multiple room connections.',
    unlockReason: 'Join at least 3 rooms',
    category: 'milestone',
    badgeType: 'progress',
    difficulty: 'common',
    xpReward: 50,
    icon: 'footprints',
    isHidden: false,
    evaluator: (user, context) => (user.roomProgress || []).filter(rp => rp.joined).length >= 3
  },

  // ── Progress Badges ──
  {
    name: 'Rookie Hacker',
    description: 'Successfully cracked 5 challenges. You are building momentum.',
    unlockReason: 'Complete 5 challenges',
    category: 'milestone',
    badgeType: 'progress',
    difficulty: 'uncommon',
    xpReward: 200,
    icon: 'code-xml',
    isHidden: false,
    evaluator: (user, context) => (user.completedRooms || 0) + (user.completedLabs || 0) >= 5
  },
  {
    name: 'Cyber Warrior',
    description: '25 challenges completed. You have proven yourself in the field.',
    unlockReason: 'Complete 25 challenges',
    category: 'milestone',
    badgeType: 'progress',
    difficulty: 'rare',
    xpReward: 500,
    icon: 'shield-check',
    isHidden: false,
    evaluator: (user, context) => (user.completedRooms || 0) + (user.completedLabs || 0) >= 25
  },
  {
    name: 'Elite Hacker',
    description: '100 challenges cleared. A true master of the CyberVerse.',
    unlockReason: 'Complete 100 challenges',
    category: 'milestone',
    badgeType: 'progress',
    difficulty: 'legendary',
    xpReward: 2000,
    icon: 'crown',
    isHidden: false,
    evaluator: (user, context) => (user.completedRooms || 0) + (user.completedLabs || 0) >= 100
  },

  // ── Skill Badges ──
  {
    name: 'Network Ninja',
    description: 'Mastery over packets, routing, and network protocols.',
    unlockReason: 'Reach 80 points in Network Security',
    category: 'skill',
    badgeType: 'skill',
    difficulty: 'rare',
    xpReward: 300,
    icon: 'network',
    isHidden: false,
    evaluator: (user, context) => {
      const val = user.skills?.get('Network Security') || user.skills?.['Network Security'] || 0;
      return val >= 80;
    }
  },
  {
    name: 'API Hunter',
    description: 'Extensive knowledge in exploiting and defending API architectures.',
    unlockReason: 'Reach 80 points in Web Exploitation',
    category: 'skill',
    badgeType: 'skill',
    difficulty: 'rare',
    xpReward: 300,
    icon: 'code-xml',
    isHidden: false,
    evaluator: (user, context) => {
      const val = user.skills?.get('Web Exploitation') || user.skills?.get('Web Security') || user.skills?.['Web Exploitation'] || 0;
      return val >= 80;
    }
  },

  // ── Consistency Badges ──
  {
    name: 'Daily Grinder',
    description: 'Three days of persistent effort.',
    unlockReason: 'Maintain a 3-day activity streak',
    category: 'streak',
    badgeType: 'streak',
    difficulty: 'common',
    xpReward: 100,
    icon: 'timer',
    isHidden: false,
    evaluator: (user, context) => (user.currentStreak || 0) >= 3
  },
  {
    name: 'Unstoppable',
    description: 'A full week of non-stop learning.',
    unlockReason: 'Maintain a 7-day activity streak',
    category: 'streak',
    badgeType: 'streak',
    difficulty: 'uncommon',
    xpReward: 300,
    icon: 'timer',
    isHidden: false,
    evaluator: (user, context) => (user.currentStreak || 0) >= 7
  },
  {
    name: 'The Immortal',
    description: 'Legendary consistency. 30 days unbroken.',
    unlockReason: 'Maintain a 30-day streak',
    category: 'streak',
    badgeType: 'streak',
    difficulty: 'legendary',
    xpReward: 1500,
    icon: 'brain-circuit',
    isHidden: false,
    evaluator: (user, context) => (user.currentStreak || 0) >= 30
  },

  // ── Special / Hidden Badges ──
  {
    name: 'Top 10',
    description: 'Secured a position in the elite global top 10.',
    unlockReason: 'Reach Top 10 in Leaderboard',
    category: 'special',
    badgeType: 'special',
    difficulty: 'legendary',
    xpReward: 1000,
    icon: 'crown',
    isHidden: true, // Won't show details until unlocked
    evaluator: (user, context) => (context.rank && context.rank <= 10)
  },
  {
    name: 'Speed Runner',
    description: 'Completed a full room evaluation in record time.',
    unlockReason: 'Solve a room under 10 minutes',
    category: 'special',
    badgeType: 'special',
    difficulty: 'legendary',
    xpReward: 500,
    icon: 'zap',
    isHidden: true,
    evaluator: (user, context) => {
      if (context.type === 'room_completion' && context.durationMs) {
        return context.durationMs < 600000; // 10 mins
      }
      return false;
    }
  },
  {
    name: 'Ghost Protocol',
    description: 'Operated entirely under the radar. Solved without a single hint.',
    unlockReason: 'Complete a room with 0 hints used',
    category: 'special',
    badgeType: 'special',
    difficulty: 'rare',
    xpReward: 300,
    icon: 'target',
    isHidden: true,
    evaluator: (user, context) => {
       if (context.type === 'room_completion') {
           return context.noHintsUsed === true;
       }
       return false;
    }
  }
];

module.exports = badgeRegistry;
