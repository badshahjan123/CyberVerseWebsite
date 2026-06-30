/**
 * ═══════════════════════════════════════════════════════════════
 *  CyberVerse — Centralized XP Configuration (Frontend Mirror)
 *  Must stay in sync with backend/utils/xpConfig.js
 * ═══════════════════════════════════════════════════════════════
 */

// Room XP by difficulty
export const ROOM_XP = {
  Beginner:     100,
  Intermediate: 200,
  Advanced:     300,
  Expert:       400,
};

// Lab XP by difficulty (labs award more XP due to hands-on nature)
export const LAB_XP = {
  Beginner:     200,
  Intermediate: 300,
  Advanced:     400,
  Expert:       500,
};

/**
 * Get total XP for a room based on difficulty.
 * Falls back to 100 if difficulty is unknown.
 */
export function getRoomXP(difficulty) {
  return ROOM_XP[difficulty] || 100;
}

/**
 * Get total XP for a lab based on difficulty.
 * Falls back to 200 if difficulty is unknown.
 */
export function getLabXP(difficulty) {
  return LAB_XP[difficulty] || 200;
}

/**
 * Divide total XP equally among N tasks.
 * Any remainder is added to the last task so the sum is exact.
 * @param {number} totalXP  - Total XP for the room/lab
 * @param {number} taskCount - Number of tasks
 * @returns {number[]} Array of per-task XP values
 */
export function getTaskXP(totalXP, taskCount) {
  if (!taskCount || taskCount <= 0) return [];
  const base = Math.floor(totalXP / taskCount);
  const remainder = totalXP - base * taskCount;
  const arr = Array(taskCount).fill(base);
  for (let i = 0; i < remainder; i++) {
    arr[taskCount - 1 - i] += 1;
  }
  return arr;
}

/**
 * ═══════════════════════════════════════════════════════════════
 *  LEVEL & TITLE PROGRESSION SYSTEM
 * ═══════════════════════════════════════════════════════════════
 */

// Title thresholds and rewards mapping
export const TITLES = [
  { level: 1,   title: "Cyber Rookie",      color: "#94A3B8" }, // Slate
  { level: 5,   title: "Cyber Explorer",    color: "#38BDF8" }, // Sky
  { level: 10,  title: "Security Apprentice", color: "#4ADE80" }, // Green
  { level: 20,  title: "Cyber Operator",    color: "#FBBF24" }, // Amber
  { level: 35,  title: "Security Analyst",  color: "#F472B6" }, // Pink
  { level: 50,  title: "Cyber Specialist",  color: "#A78BFA" }, // Purple
  { level: 75,  title: "Elite Hacker",      color: "#EF4444" }, // Red
  { level: 100, title: "Cyber Legend",      color: "#FACC15" }  // Gold
];

/**
 * Advanced MMO-style Level Scaling
 * Level N requires (N * 150) * (1.1 ^ (N/10)) total XP to reach.
 * This makes early levels fast (150 XP, 300 XP) and later levels much slower.
 */
export function getLevelFromXP(xp) {
  let level = 1;
  while (true) {
    const xpRequired = getXPRequiredForLevel(level + 1);
    if (xp >= xpRequired) {
      level++;
      if (level >= 100) return 100; // Max level cap
    } else {
      break;
    }
  }
  return level;
}

export function getXPRequiredForLevel(targetLevel) {
  if (targetLevel <= 1) return 0;
  // A curve that scales smoothly but gets exponentially harder
  return Math.floor(150 * Math.pow(targetLevel, 1.8)); 
}

export function getLevelProgressInfo(xp) {
  const currentLevel = getLevelFromXP(xp);
  
  if (currentLevel >= 100) {
    const currentTitleInfo = TITLES[TITLES.length - 1];
    return {
      currentLevel: 100,
      currentXP: xp,
      nextLevelXP: xp,
      xpProgress: 100,
      xpNeeded: 0,
      title: currentTitleInfo.title,
      color: currentTitleInfo.color,
      nextTitle: "Max Rank",
      nextTitleLevel: 100
    };
  }

  const nextLevel = currentLevel + 1;
  const currentLevelBaseXP = getXPRequiredForLevel(currentLevel);
  const nextLevelXP = getXPRequiredForLevel(nextLevel);
  
  const xpIntoLevel = xp - currentLevelBaseXP;
  const xpRequiredForNext = nextLevelXP - currentLevelBaseXP;
  
  const xpProgress = Math.max(0, Math.min(100, (xpIntoLevel / xpRequiredForNext) * 100));
  const xpNeeded = nextLevelXP - xp;

  // Determine current and next title
  let currentTitle = TITLES[0];
  let nextTitle = TITLES.find(t => t.level > currentLevel) || TITLES[TITLES.length - 1];

  for (let i = TITLES.length - 1; i >= 0; i--) {
    if (currentLevel >= TITLES[i].level) {
      currentTitle = TITLES[i];
      nextTitle = TITLES[i + 1] || TITLES[i];
      break;
    }
  }

  return {
    currentLevel,
    currentXP: xp,
    baseXP: currentLevelBaseXP,
    nextLevelXP,
    xpProgress,
    xpNeeded,
    title: currentTitle.title,
    color: currentTitle.color,
    nextTitle: nextTitle.title,
    nextTitleLevel: nextTitle.level
  };
}
