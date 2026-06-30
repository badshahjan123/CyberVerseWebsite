/**
 * ═══════════════════════════════════════════════════════════════
 *  CyberVerse — Centralized XP Configuration
 *  Single source of truth for all XP calculations platform-wide.
 * ═══════════════════════════════════════════════════════════════
 */

// Room XP by difficulty
const ROOM_XP = {
  Beginner:     100,
  Intermediate: 200,
  Advanced:     300,
  Expert:       400,
};

// Lab XP by difficulty (labs award more XP due to hands-on nature)
const LAB_XP = {
  Beginner:     200,
  Intermediate: 300,
  Advanced:     400,
  Expert:       500,
};

/**
 * Get total XP for a room based on difficulty.
 * Falls back to 100 if difficulty is unknown.
 */
function getRoomXP(difficulty) {
  return ROOM_XP[difficulty] || 100;
}

/**
 * Get total XP for a lab based on difficulty.
 * Falls back to 200 if difficulty is unknown.
 */
function getLabXP(difficulty) {
  return LAB_XP[difficulty] || 200;
}

/**
 * Divide total XP equally among N tasks.
 * Any remainder is added to the last task so the sum is exact.
 * @param {number} totalXP  - Total XP for the room/lab
 * @param {number} taskCount - Number of tasks
 * @returns {number[]} Array of per-task XP values
 */
function getTaskXP(totalXP, taskCount) {
  if (!taskCount || taskCount <= 0) return [];
  const base = Math.floor(totalXP / taskCount);
  const remainder = totalXP - base * taskCount;
  const arr = Array(taskCount).fill(base);
  // Distribute remainder across the last task(s)
  for (let i = 0; i < remainder; i++) {
    arr[taskCount - 1 - i] += 1;
  }
  return arr;
}

/**
 * Get per-task XP for a specific task index.
 * @param {number} totalXP   - Total XP for the room/lab
 * @param {number} taskCount - Number of tasks
 * @param {number} taskIndex - 0-based task index
 * @returns {number} XP for this specific task
 */
function getTaskXPAtIndex(totalXP, taskCount, taskIndex) {
  const arr = getTaskXP(totalXP, taskCount);
  return arr[taskIndex] ?? 0;
}

const TITLES = [
  { level: 1,   title: "Cyber Rookie",      color: "#94A3B8" }, // Slate
  { level: 5,   title: "Cyber Explorer",    color: "#38BDF8" }, // Sky
  { level: 10,  title: "Security Apprentice", color: "#4ADE80" }, // Green
  { level: 20,  title: "Cyber Operator",    color: "#FBBF24" }, // Amber
  { level: 35,  title: "Security Analyst",  color: "#F472B6" }, // Pink
  { level: 50,  title: "Cyber Specialist",  color: "#A78BFA" }, // Purple
  { level: 75,  title: "Elite Hacker",      color: "#EF4444" }, // Red
  { level: 100, title: "Cyber Legend",      color: "#FACC15" }  // Gold
];

function getLevelFromXP(xp) {
  let level = 1;
  while (true) {
    const xpRequired = getXPRequiredForLevel(level + 1);
    if (xp >= xpRequired) {
      level++;
      if (level >= 100) return 100;
    } else {
      break;
    }
  }
  return level;
}

function getXPRequiredForLevel(targetLevel) {
  if (targetLevel <= 1) return 0;
  return Math.floor(150 * Math.pow(targetLevel, 1.8)); 
}

function getLevelProgressInfo(xp) {
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

module.exports = {
  ROOM_XP,
  LAB_XP,
  getRoomXP,
  getLabXP,
  getTaskXP,
  getTaskXPAtIndex,
  TITLES,
  getLevelFromXP,
  getXPRequiredForLevel,
  getLevelProgressInfo,
};
