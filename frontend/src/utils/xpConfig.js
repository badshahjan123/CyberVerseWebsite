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
