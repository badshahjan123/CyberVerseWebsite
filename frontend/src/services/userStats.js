import { apiCall } from '../config/api';

export const getUserStats = async () => {
  try {
    const response = await apiCall('/users/stats');
    return response.user;
  } catch (error) {
    // Fallback to auth/me endpoint if stats endpoint not available
    const fallbackResponse = await apiCall('/auth/me');
    const user = fallbackResponse.user;
    return {
      ...user,
      rank: 999,
      pointsToNextLevel: user.points ? 1000 - (user.points % 1000) : 1000,
      level: user.level || Math.floor((user.points || 0) / 1000) + 1
    };
  }
};

export const refreshUserStats = async () => {
  try {
    return await getUserStats();
  } catch (error) {
    console.error('Failed to refresh user stats:', error);
    return null;
  }
};