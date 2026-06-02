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

module.exports = {
  ROOM_XP,
  LAB_XP,
  getRoomXP,
  getLabXP,
  getTaskXP,
  getTaskXPAtIndex,
};
