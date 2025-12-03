import { apiCall } from '../config/api';

export const getStreakData = async () => {
  try {
    const response = await apiCall('/users/stats');
    return {
      currentStreak: response.user.currentStreak || 0,
      longestStreak: response.user.longestStreak || 0
    };
  } catch (error) {
    console.error('Failed to fetch streak data:', error);
    return { currentStreak: 0, longestStreak: 0 };
  }
};