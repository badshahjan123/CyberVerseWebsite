import { useState, useEffect } from 'react'
import { getLeaderboard } from '../services/progress'
import { useRealtime } from '../contexts/realtime-context'

export const useRealTimeLeaderboard = (refreshInterval = 300000) => { // 5 minutes
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { leaderboardData, connected, requestLeaderboardUpdate } = useRealtime()

  const fetchLeaderboard = async () => {
    try {
      const data = await getLeaderboard(50)
      setLeaderboard(data)
      setError(null)
    } catch (err) {
      setError('Failed to load leaderboard')
      console.error('Leaderboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Initial fetch on component mount
    fetchLeaderboard()

    // Enable automatic refresh as fallback (every 5 minutes)
    const interval = setInterval(fetchLeaderboard, refreshInterval)

    return () => clearInterval(interval)
  }, [refreshInterval])

  // Update from real-time socket data
  useEffect(() => {
    if (leaderboardData && leaderboardData.length > 0) {
      setLeaderboard(leaderboardData)
      setLoading(false)
      setError(null)
    }
  }, [leaderboardData])

  return {
    leaderboard,
    loading,
    error,
    refresh: fetchLeaderboard,
    connected,
    requestUpdate: requestLeaderboardUpdate
  }
}