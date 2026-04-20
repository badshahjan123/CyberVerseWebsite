import { createContext, useContext, useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { io } from 'socket.io-client'
import { getUserStats } from '../services/userStats'
import { getLeaderboard } from '../services/progress'
import { useToast } from './toast-context'
import { useApp } from './app-context'

const RealtimeContext = createContext()

export const useRealtime = () => {
  const context = useContext(RealtimeContext)
  if (!context) throw new Error('useRealtime must be used within RealtimeProvider')
  return context
}

// Level thresholds — same as backend & Dashboard
const LEVEL_THRESHOLDS = [0, 300, 700, 1200, 2000, 3000, 4500, 6500, 9000, 12000, 16000]

const calcLevel = (points) => {
  let level = 1
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (points >= LEVEL_THRESHOLDS[i]) level = i + 1
    else break
  }
  return level
}

const calcPointsToNext = (points) => {
  const level = calcLevel(points)
  if (level >= LEVEL_THRESHOLDS.length) return 0
  return Math.max(0, LEVEL_THRESHOLDS[level] - points)
}

export const RealtimeProvider = ({ children }) => {
  const { levelUp, achievement, success, info, premium } = useToast()
  const { isAuthenticated, user, refreshUser } = useApp()

  const isAdminRoute = typeof window !== 'undefined' &&
    (window.location.pathname.startsWith('/secure-admin') ||
     window.location.pathname.startsWith('/admin') ||
     window.DISABLE_WEBSOCKET === true)

  const [userStats, setUserStats] = useState({
    totalXP: user?.points || 0,
    points: user?.points || 0,
    level: calcLevel(user?.points || 0),
    rank: user?.rank || 999,
    streak: user?.currentStreak || 0,
    currentStreak: user?.currentStreak || 0,
    longestStreak: user?.longestStreak || 0,
    skills: user?.skills || {},
    skillMatrix: [],
    completedRooms: user?.completedRooms || 0,
    completedLabs: user?.completedLabs || 0,
    pointsToNextLevel: calcPointsToNext(user?.points || 0),
    isPremium: user?.isPremium || false
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [weeklyStats, setWeeklyStats] = useState({ labsCompleted: 0, pointsEarned: 0, timeSpent: '0h', rankChange: 0 })
  const [connected, setConnected] = useState(false)
  const [leaderboardData, setLeaderboardData] = useState([])

  const userStatsRef = useRef(userStats)
  const socketRef = useRef(null)
  const lastUpdateRef = useRef(Date.now())
  const isFetchingRef = useRef(false)
  const toastRef = useRef({ levelUp, achievement, success, info, premium })

  useEffect(() => { toastRef.current = { levelUp, achievement, success, info, premium } }, [levelUp, achievement, success, info, premium])
  useEffect(() => { userStatsRef.current = userStats }, [userStats])

  const transformSkills = useCallback((skills) => {
    if (!skills) return []
    const mapping = {
      web: 'Web Exploitation', network: 'Network Security', linux: 'Priv. Escalation',
      forensics: 'Forensics', osint: 'OSINT', exploit: 'Reverse Engineering', crypto: 'Cryptography'
    }
    return Object.entries(skills).map(([key, val]) => ({
      name: mapping[key] || key, category: mapping[key] || key, progress: Math.round(val)
    }))
  }, [])

  const fetchLeaderboardData = useCallback(async () => {
    try {
      const data = await getLeaderboard(50)
      if (data?.length > 0) setLeaderboardData(data)
    } catch (_) {}
  }, [])

  const refreshUserStats = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    if (isFetchingRef.current) return
    isFetchingRef.current = true
    try {
      const response = await getUserStats()
      const stats = response.user || response
      const points = stats.points ?? stats.totalXP ?? 0
      const level = calcLevel(points)

      // Level up toast
      const oldLevel = userStatsRef.current.level || 1
      if (level > oldLevel) toastRef.current.levelUp(level)

      setUserStats({
        totalXP:           points,
        points:            points,
        level,
        rank:              stats.rank           ?? 999,
        streak:            stats.currentStreak  ?? 0,
        currentStreak:     stats.currentStreak  ?? 0,
        longestStreak:     stats.longestStreak  ?? 0,
        skills:            stats.skills         || {},
        skillMatrix:       transformSkills(stats.skills),
        completedRooms:    stats.completedRooms ?? 0,
        completedLabs:     stats.completedLabs  ?? 0,
        pointsToNextLevel: calcPointsToNext(points),
        isPremium:         stats.isPremium      ?? false,
        name:              stats.name           || stats.username
      })

      if (response.weeklyStats) {
        const w = response.weeklyStats
        setWeeklyStats({
          labsCompleted:  w.labsCompleted  || 0,
          roomsCompleted: w.roomsCompleted || 0,
          pointsEarned:   Math.min(w.pointsEarned || 0, points), // never exceed total
          startRank:      w.startRank      || 0,
          currentRank:    w.currentRank    || 0,
          timeSpent:      w.timeSpent      || 0,
        })
      }

      lastUpdateRef.current = Date.now()
    } catch (error) {
      console.error('Failed to refresh user stats:', error)
    } finally {
      isFetchingRef.current = false
    }
  }, [transformSkills])

  const applyUpdate = useCallback((data) => {
    if (!data) return
    const stats = data.user || data
    const points = stats.points ?? stats.totalXP ?? userStatsRef.current.points ?? 0
    const level = calcLevel(points)

    const oldLevel = userStatsRef.current.level || 1
    if (level > oldLevel) toastRef.current.levelUp(level)

    if (typeof refreshUser === 'function') refreshUser()

    setUserStats(prev => ({
      ...prev,
      totalXP:           points,
      points:            points,
      level,
      rank:              stats.rank           ?? prev.rank,
      streak:            stats.currentStreak  ?? stats.streak     ?? prev.streak,
      currentStreak:     stats.currentStreak  ?? stats.streak     ?? prev.currentStreak,
      longestStreak:     stats.longestStreak  ?? prev.longestStreak,
      completedRooms:    stats.completedRooms ?? prev.completedRooms,
      completedLabs:     stats.completedLabs  ?? prev.completedLabs,
      pointsToNextLevel: calcPointsToNext(points),
      skillMatrix:       stats.skills ? transformSkills(stats.skills) : prev.skillMatrix,
      isPremium:         stats.isPremium      ?? prev.isPremium,
    }))
    lastUpdateRef.current = Date.now()
  }, [transformSkills, refreshUser])

  const connectSocket = useCallback(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    if (socketRef.current?.connected) return

    if (socketRef.current) {
      socketRef.current.removeAllListeners()
      socketRef.current.disconnect()
      socketRef.current = null
    }

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    const SOCKET_URL = API_URL.replace(/\/api\/?$/, '') || 'http://localhost:5000'

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    })

    socket.on('connect', () => {
      setConnected(true)
      socket.emit('refresh:stats')
      socket.emit('refresh:leaderboard')
    })
    socket.on('disconnect', () => setConnected(false))
    socket.on('connect_error', () => setConnected(false))

    socket.on('user:stats:update', (data) => applyUpdate(data))
    socket.on('leaderboard:update', (data) => { setLeaderboardData(data); lastUpdateRef.current = Date.now() })
    socket.on('room:progress:update', () => refreshUserStats())
    socket.on('badge:earned', (badge) => {
      const label = badge.badgeType === 'bonus' ? '⭐ Bonus Badge' : '🏅 Badge Unlocked'
      toastRef.current.achievement(`${label}: ${badge.name}`, badge.unlockReason || badge.description || '')
      window.dispatchEvent(new CustomEvent('badge:earned', { detail: badge }))
    })
    socket.on('notification:new', (data) => {
      if (data.type === 'achievement') toastRef.current.achievement(data.title, data.message)
      else if (data.type === 'level_up') toastRef.current.levelUp(data.title, data.message)
      else if (data.type === 'success') toastRef.current.success(data.title, data.message)
      else toastRef.current.info(data.title, data.message)
      window.dispatchEvent(new CustomEvent('notification:new', { detail: data }))
    })
    socket.on('premium:status:update', (data) => {
      if (data.isPremium) toastRef.current.premium(`Welcome to ${data.plan || 'Premium'}!`)
      setUserStats(prev => ({ ...prev, isPremium: data.isPremium }))
    })

    socketRef.current = socket
  }, [applyUpdate, refreshUserStats])

  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.removeAllListeners()
      socketRef.current.disconnect()
      socketRef.current = null
      setConnected(false)
    }
  }, [])

  const triggerUpdate = useCallback(() => {
    refreshUserStats()
    if (socketRef.current?.connected) {
      socketRef.current.emit('refresh:stats')
      socketRef.current.emit('refresh:leaderboard')
    }
  }, [refreshUserStats])

  const requestLeaderboardUpdate = useCallback(() => {
    if (socketRef.current?.connected) socketRef.current.emit('refresh:leaderboard')
    else fetchLeaderboardData()
  }, [fetchLeaderboardData])

  // Global sync triggers
  useEffect(() => {
    const onSync = () => {
      refreshUserStats()
      if (typeof refreshUser === 'function') refreshUser()
      requestLeaderboardUpdate()
    }
    window.addEventListener('roomCompleted', onSync)
    window.addEventListener('labCompleted', onSync)
    window.addEventListener('user:sync:request', onSync)
    return () => {
      window.removeEventListener('roomCompleted', onSync)
      window.removeEventListener('labCompleted', onSync)
      window.removeEventListener('user:sync:request', onSync)
    }
  }, [refreshUserStats, refreshUser, requestLeaderboardUpdate])

  // Init
  useEffect(() => {
    if (isAdminRoute) return
    window.triggerRealtimeUpdate = triggerUpdate
    window.applyRealtimeUpdate = applyUpdate
    fetchLeaderboardData()

    if (isAuthenticated) {
      refreshUserStats()
      connectSocket()
    }

    // Poll every 5s
    const interval = setInterval(() => {
      if (localStorage.getItem('token') && !isFetchingRef.current) {
        refreshUserStats()
      }
    }, 5000)

    return () => {
      clearInterval(interval)
      disconnectSocket()
      delete window.triggerRealtimeUpdate
    }
  }, [isAuthenticated, isAdminRoute]) // minimal deps — functions are stable refs

  const value = useMemo(() => {
    if (isAdminRoute) return {
      userStats: { totalXP: 0, points: 0, level: 1, rank: 999, streak: 0, skillMatrix: [], completedRooms: 0, completedLabs: 0 },
      recentActivity: [], weeklyStats: { labsCompleted: 0, pointsEarned: 0, timeSpent: '0h', rankChange: 0 },
      refreshUserStats: () => {}, triggerUpdate: () => {}, applyUpdate: () => {},
      connected: false, leaderboardData: [], requestLeaderboardUpdate: () => {},
      getLastUpdate: () => Date.now(), socket: null
    }
    return {
      userStats, recentActivity, weeklyStats, refreshUserStats, triggerUpdate, applyUpdate,
      connected, leaderboardData, fetchLeaderboardData, requestLeaderboardUpdate,
      getLastUpdate: () => lastUpdateRef.current, socket: socketRef.current
    }
  }, [userStats, recentActivity, weeklyStats, connected, leaderboardData, isAdminRoute,
      refreshUserStats, triggerUpdate, applyUpdate, requestLeaderboardUpdate, fetchLeaderboardData])

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>
}
