import { createContext, useContext, useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { io } from 'socket.io-client'
import { getUserStats } from '../services/userStats'
import { getLeaderboard } from '../services/progress'
import { useToast } from './toast-context'
import { useApp } from './app-context'

const RealtimeContext = createContext()

export const useRealtime = () => {
  const context = useContext(RealtimeContext)
  if (!context) {
    throw new Error('useRealtime must be used within RealtimeProvider')
  }
  return context
}

export const RealtimeProvider = ({ children }) => {
  const { levelUp, achievement, success, info, premium } = useToast()
  const { isAuthenticated, user, refreshUser } = useApp()
  
  // Check if we're on admin routes - skip WebSocket for admin
  const isAdminRoute = typeof window !== 'undefined' && 
    (window.location.pathname.startsWith('/secure-admin') || 
     window.location.pathname.startsWith('/admin') ||
     window.DISABLE_WEBSOCKET === true)

  // Initial state from app context if available
  const [userStats, setUserStats] = useState({
    totalXP: user?.points || 0,
    level: user?.level || 1,
    rank: user?.rank || 999,
    streak: user?.currentStreak || 0,
    skills: user?.skills || { web: 0, network: 0, linux: 0, forensics: 0, osint: 0, exploit: 0, crypto: 0 },
    skillMatrix: [],
    completedRooms: user?.completedRooms || 0,
    completedLabs: user?.completedLabs || 0,
    pointsToNextLevel: user?.pointsToNextLevel || 1000,
    isPremium: user?.isPremium || false
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [weeklyStats, setWeeklyStats] = useState({
    labsCompleted: 0,
    pointsEarned: 0,
    timeSpent: '0h',
    rankChange: 0
  })
  const [connected, setConnected] = useState(false)
  const [leaderboardData, setLeaderboardData] = useState([])

  // Refs for values that don't need to trigger re-renders
  const userStatsRef = useRef(userStats)
  const socketRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const lastUpdateRef = useRef(Date.now())
  const isInitializedRef = useRef(false)
  const isFetchingRef = useRef(false)

  // Use refs for toast functions to avoid dependency loops
  const toastRef = useRef({ levelUp, achievement, success, info, premium })

  useEffect(() => {
    toastRef.current = { levelUp, achievement, success, info, premium }
  }, [levelUp, achievement, success, info, premium])

  // Keep ref in sync with state
  useEffect(() => {
    userStatsRef.current = userStats
  }, [userStats])

  const fetchLeaderboardData = useCallback(async () => {
    try {
      const data = await getLeaderboard(50)
      if (data && data.length > 0) {
        setLeaderboardData(data)
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard data:', error)
    }
  }, [])

  // Stable refresh function - no dependencies to prevent loops
  const transformSkills = useCallback((skills) => {
    if (!skills) return []
    const mapping = {
      web: "Web Exploitation",
      network: "Network Security",
      linux: "Priv. Escalation",
      forensics: "Forensics",
      osint: "OSINT",
      exploit: "Reverse Engineering",
      crypto: "Cryptography"
    }
    return Object.entries(skills).map(([key, val]) => ({
      name: mapping[key] || key,
      category: mapping[key] || key,
      progress: Math.round(val)
    }))
  }, [])

  const refreshUserStats = useCallback(async () => {
    // Check for token first
    const token = localStorage.getItem('token')
    if (!token) return

    // Prevent duplicate concurrent fetches
    if (isFetchingRef.current) return

    isFetchingRef.current = true
    try {
      const response = await getUserStats()
      const stats = response.user || response // Handle both new nested and old flat formats

      // Centralized transformation to ensure required fields
      const updatedStats = {
        totalXP: stats.points !== undefined ? stats.points : (stats.totalXP || 0),
        level: stats.level || 1,
        rank: stats.rank || 999,
        streak: stats.currentStreak !== undefined ? stats.currentStreak : (stats.streak || 0),
        skills: stats.skills || {},
        skillMatrix: stats.skillMatrix || transformSkills(stats.skills),
        completedRooms: stats.completedRooms || 0,
        completedLabs: stats.completedLabs || 0,
        pointsToNextLevel: stats.pointsToNextLevel || 1000,
        isPremium: stats.isPremium || false,
        name: stats.name || stats.username
      }

      setUserStats(updatedStats)

      if (response.recentActivity) setRecentActivity(response.recentActivity)
      if (response.weeklyStats) setWeeklyStats(response.weeklyStats)

      lastUpdateRef.current = Date.now()
    } catch (error) {
      console.error('Failed to refresh global user stats:', error)
    } finally {
      isFetchingRef.current = false
    }
  }, [])

  // Stable socket connection function - no dependencies to prevent reconnections
  const connectSocket = useCallback(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      console.log('⚠️ No token found, skipping socket connection')
      return
    }

    // Prevent duplicate connections
    if (socketRef.current?.connected) {
      console.log('✅ Socket already connected, skipping...')
      return
    }

    // Clean up any existing socket first
    if (socketRef.current) {
      console.log('🧹 Cleaning up existing socket...')
      socketRef.current.removeAllListeners()
      socketRef.current.disconnect()
      socketRef.current = null
    }

    // Get base URL without /api suffix for Socket.io
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    const SOCKET_URL = API_URL.replace(/\/api\/?$/, '') || 'http://localhost:5000'

    console.log('🔌 Connecting to Socket.io server at:', SOCKET_URL)

    const socket = io(SOCKET_URL, {
      auth: { token: token || 'guest' }, // Allow guest connection for platform-wide events
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    })

    // Connection events
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id)
      setConnected(true)

      // Request initial data only on first connect
      socket.emit('refresh:stats')
      socket.emit('refresh:leaderboard')
    })

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason)
      setConnected(false)
    })

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message)
      setConnected(false)
    })

    // Real-time event listeners
    socket.on('user:stats:update', (data) => {
      console.log('⚡ Realtime Stats Update:', data)
      applyUpdate(data)
    })

    socket.on('leaderboard:update', (data) => {
      setLeaderboardData(data)
      lastUpdateRef.current = Date.now()
    })

    socket.on('room:progress:update', (data) => {
      if (data.completed) {
        toastRef.current.achievement('Room Completed!', `You earned XP and updated your rank.`)
      }
      refreshUserStats()
    })

    // Badge earned — show toast immediately, independent of completion modal
    socket.on('badge:earned', (badge) => {
      const label = badge.badgeType === 'bonus' ? '⭐ Bonus Badge' : '🏅 Badge Unlocked'
      toastRef.current.achievement(
        `${label}: ${badge.name}`,
        badge.unlockReason || badge.description || 'Awarded for completing this room'
      )
      // Dispatch so any page-level listener can react (e.g. Badges page)
      window.dispatchEvent(new CustomEvent('badge:earned', { detail: badge }))
    })

    socket.on('notification:new', (data) => {
      if (data.type === 'achievement') toastRef.current.achievement(data.title, data.message)
      else if (data.type === 'level_up') toastRef.current.levelUp(data.title, data.message)
      else if (data.type === 'success') toastRef.current.success(data.title, data.message)
      else toastRef.current.info(data.title, data.message)

      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification(data.title, { body: data.message })
      }
      window.dispatchEvent(new CustomEvent('notification:new', { detail: data }))
    })

    socket.on('premium:status:update', (data) => {
      if (data.isPremium) toastRef.current.premium(`Welcome to ${data.plan || 'Premium'}!`)
      setUserStats(prev => ({ ...prev, isPremium: data.isPremium }))
    })


    socketRef.current = socket
  }, [refreshUserStats])

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

  const applyUpdate = useCallback((data) => {
    if (!data) return

    // Handle both new nested format { user, weeklyStats } and old flat format
    const stats = data.user || data;
    
    const oldLevel = userStatsRef.current.level || 1
    const newLevel = stats.level || (stats.points !== undefined ? (Math.floor(stats.points / 1000) + 1) : oldLevel);
    
    if (newLevel > oldLevel) {
      toastRef.current.levelUp(newLevel)
    }

    // Trigger full background refresh of user object (for roomProgress arrays etc)
    if (typeof refreshUser === 'function') {
      refreshUser();
    }

    setUserStats(prev => ({
      ...prev,
      ...stats,
      totalXP: stats.points !== undefined ? stats.points : (stats.totalXP !== undefined ? stats.totalXP : prev.totalXP),
      level: newLevel,
      rank: stats.rank || prev.rank,
      streak: stats.currentStreak !== undefined ? stats.currentStreak : (stats.streak !== undefined ? stats.streak : prev.streak),
      completedRooms: stats.completedRooms !== undefined ? stats.completedRooms : prev.completedRooms,
      completedLabs: stats.completedLabs !== undefined ? stats.completedLabs : prev.completedLabs,
      skillMatrix: stats.skills ? transformSkills(stats.skills) : (stats.skillMatrix || prev.skillMatrix),
      isPremium: stats.isPremium ?? prev.isPremium,
      pointsToNextLevel: stats.pointsToNextLevel || prev.pointsToNextLevel
    }))
    lastUpdateRef.current = Date.now()
  }, [transformSkills, refreshUser])

  // Handle global sync triggers (e.g. from completion events)
  useEffect(() => {
    const onSyncTrigger = async () => {
      console.log('🔄 Global state refresh triggered...');
      refreshUserStats();
      if (typeof refreshUser === 'function') refreshUser();
      // Also refresh leaderboard
      if (socketRef.current?.connected) {
        socketRef.current.emit('refresh:leaderboard');
      } else {
        fetchLeaderboardData();
      }
    };
    
    window.addEventListener('roomCompleted', onSyncTrigger);
    window.addEventListener('labCompleted', onSyncTrigger);
    window.addEventListener('user:sync:request', onSyncTrigger);
    
    return () => {
      window.removeEventListener('roomCompleted', onSyncTrigger);
      window.removeEventListener('labCompleted', onSyncTrigger);
      window.removeEventListener('user:sync:request', onSyncTrigger);
    };
  }, [refreshUserStats, refreshUser, fetchLeaderboardData]);

  const requestLeaderboardUpdate = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('refresh:leaderboard')
    }
  }, [])

  // Initialize context basic state and socket
  useEffect(() => {
    if (isAdminRoute) return
    
    // Always start trackers (for guests and members)
    isInitializedRef.current = true
    window.triggerRealtimeUpdate = triggerUpdate
    window.applyRealtimeUpdate = applyUpdate

    // Basic data fetches (No Auth Required)
    fetchLeaderboardData()

    // Auth-only initializations
    if (isAuthenticated) {
      refreshUserStats()
      connectSocket()
    }

    // 🔄 Auto Refresh Rule: Every 30 seconds for non-websocket fallbacks
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem('token')
      if (currentToken && !isFetchingRef.current) {
        refreshUserStats()
      }
    }, 30000)

    return () => {
      clearInterval(interval)
      disconnectSocket()
      delete window.triggerRealtimeUpdate
      isInitializedRef.current = false
    }
  }, [isAuthenticated, isAdminRoute, triggerUpdate, refreshUserStats, connectSocket, disconnectSocket])

  const value = useMemo(() => {
    if (isAdminRoute) {
      return {
        userStats: { totalXP: 0, level: 1, rank: 999, streak: 0, skillMatrix: [], completedRooms: 0, completedLabs: 0 },
        recentActivity: [],
        weeklyStats: { labsCompleted: 0, pointsEarned: 0, timeSpent: '0h', rankChange: 0 },
        refreshUserStats: () => {},
        triggerUpdate: () => {},
        connected: false,
        leaderboardData: [],
        requestLeaderboardUpdate: () => {},
        getLastUpdate: () => Date.now(),
        socket: null
      }
    }
    
    return {
      userStats,
      recentActivity,
      weeklyStats,
      refreshUserStats,
      triggerUpdate,
      applyUpdate,
      connected,
      leaderboardData,
      fetchLeaderboardData,
      requestLeaderboardUpdate,
      getLastUpdate: () => lastUpdateRef.current,
      socket: socketRef.current
    }
  }, [userStats, recentActivity, weeklyStats, connected, leaderboardData, isAdminRoute, refreshUserStats, triggerUpdate, applyUpdate, requestLeaderboardUpdate])

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  )
}