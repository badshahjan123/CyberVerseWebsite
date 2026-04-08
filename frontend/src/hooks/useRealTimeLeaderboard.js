import { useRealtime } from '../contexts/realtime-context'

export const useRealTimeLeaderboard = () => {
  const { 
    leaderboardData, 
    fetchLeaderboardData, 
    connected, 
    requestLeaderboardUpdate 
  } = useRealtime()

  return {
    leaderboard: leaderboardData || [],
    loading: !leaderboardData || leaderboardData.length === 0,
    error: null,
    refresh: fetchLeaderboardData,
    connected,
    requestUpdate: requestLeaderboardUpdate
  }
}