import { createContext, useContext, useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { io } from 'socket.io-client'
import { getUserStats } from '../services/userStats'
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
  const { isAuthenticated } = useApp()
  
  // Check if we're on admin routes - skip WebSocket for admin
  const isAdminRoute = typeof window !== 'undefined' && 
    (window.location.pathname.startsWith('/secure-admin') || 
     window.location.pathname.startsWith('/admin') ||
     window.DISABLE_WEBSOCKET === true)

  // Core state - only what needs to trigger re-renders
  const [userStats, setUserStats] = useState({
    currentStreak: 0,
    longestStreak: 0,
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

  // Stable refresh function - no dependencies to prevent loops
  const refreshUserStats = useCallback(async () => {
    // Check for token first
    const token = localStorage.getItem('token')
    if (!token) {
      return
    }

    // Prevent duplicate concurrent fetches
    if (isFetchingRef.current) {
      console.log('⏭️ Stats fetch already in progress, skipping...')
      return
    }

    isFetchingRef.current = true
    try {
      const stats = await getUserStats()

      // Single state update to prevent flickering
      setUserStats(prevStats => ({
        ...prevStats,
        ...stats,
        currentStreak: stats.currentStreak || prevStats.currentStreak || 0,
        longestStreak: stats.longestStreak || prevStats.longestStreak || 0,
      }))

      // Update recent activity if it exists in the stats
      if (stats.recentActivity) {
        setRecentActivity(stats.recentActivity)
      }
      // Update weekly stats
      if (stats.weeklyStats) {
        setWeeklyStats(stats.weeklyStats)
      }

      lastUpdateRef.current = Date.now()
    } catch (error) {
      console.error('Failed to refresh user stats:', error)
    } finally {
      isFetchingRef.current = false
    }
  }, []) // Empty dependencies - stable function

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
      auth: { token },
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
      console.log('📊 Received stats update:', data)

      // Check for level up using Ref to avoid dependency loop
      const oldLevel = userStatsRef.current.level || 1
      if (data.level && data.level > oldLevel) {
        toastRef.current.levelUp(data.level)
      }

      setUserStats(prev => ({
        ...prev,
        ...data
      }))
      lastUpdateRef.current = Date.now()
    })

    socket.on('leaderboard:update', (data) => {
      console.log('🏆 Received leaderboard update:', data.length, 'users')
      setLeaderboardData(data)
      lastUpdateRef.current = Date.now()
    })

    socket.on('room:progress:update', (data) => {
      console.log('🎯 Room progress updated:', data)

      // Show achievement toast
      if (data.completed) {
        toastRef.current.achievement('Room Completed!', `You earned ${data.points || 0} points`)
      }

      // Trigger stats refresh to get updated room count
      // Use a small delay to prevent race conditions
      setTimeout(() => {
        if (!isFetchingRef.current) {
          refreshUserStats()
        }
      }, 100)
    })

    socket.on('notification:new', (data) => {
      console.log('🔔 New notification:', data)

      // Show notification as toast
      if (data.type === 'achievement') {
        toastRef.current.achievement(data.title, data.message)
      } else if (data.type === 'level_up') {
        toastRef.current.levelUp(data.title, data.message)
      } else if (data.type === 'success') {
        toastRef.current.success(data.title, data.message)
      } else {
        toastRef.current.info(data.title, data.message)
      }

      // Show browser notification if permission granted
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification(data.title, {
          body: data.message,
          icon: '/favicon.ico',
          tag: data._id
        })
      }

      // Trigger custom event for notification dropdown
      window.dispatchEvent(new CustomEvent('notification:new', { detail: data }))
    })

    socket.on('settings:update', (data) => {
      console.log('⚙️ Settings updated:', data)
      // Settings sync handled by Settings page
    })

    socket.on('premium:status:update', (data) => {
      console.log('👑 Premium status updated:', data)

      // Show premium toast
      if (data.isPremium) {
        toastRef.current.premium(`Welcome to ${data.plan || 'Premium'}!`)
      }

      setUserStats(prev => ({
        ...prev,
        isPremium: data.isPremium
      }))
    })

    socketRef.current = socket
  }, []) // Empty dependencies - stable function

  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      console.log('🔌 Disconnecting socket...')
      socketRef.current.removeAllListeners()
      socketRef.current.disconnect()
      socketRef.current = null
      setConnected(false)
    }
  }, [])

  // Stable trigger update function
  const triggerUpdate = useCallback(() => {
    // Check for token first
    const token = localStorage.getItem('token')
    if (!token) {
      return
    }

    // Prevent duplicate calls
    if (isFetchingRef.current) {
      console.log('⏭️ Update already in progress, skipping...')
      return
    }

    refreshUserStats()

    // Also request via socket if connected (socket will handle the update)
    if (socketRef.current?.connected) {
      socketRef.current.emit('refresh:stats')
    }
  }, []) // Empty dependencies - uses refs

  const requestLeaderboardUpdate = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('refresh:leaderboard')
    }
  }, [])

  // Initialize when authenticated
  useEffect(() => {
    // Skip WebSocket initialization for admin routes
    if (isAdminRoute) {
      console.log('🔒 Admin route detected, skipping WebSocket initialization')
      return
    }
    
    // If not authenticated, ensure we are disconnected and return
    if (!isAuthenticated) {
      if (isInitializedRef.current) {
        console.log('🔒 User logged out, cleaning up RealtimeProvider...')
        disconnectSocket()
        delete window.triggerRealtimeUpdate
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
        }
        isInitializedRef.current = false
      }
      return
    }

    if (isInitializedRef.current) {
      return
    }

    // Double check token exists
    const token = localStorage.getItem('token')
    if (!token) {
      console.log('⚠️ Authenticated but no token found, skipping initialization')
      return
    }

    isInitializedRef.current = true
    console.log('🚀 Initializing RealtimeProvider for authenticated user...')

    // Request notification permission
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    // Make trigger function globally available
    window.triggerRealtimeUpdate = triggerUpdate

    // Initial stats fetch
    refreshUserStats()

    // Connect socket
    connectSocket()

    // Periodic fallback refresh (every 5 minutes as backup)
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem('token')
      if (currentToken && !isFetchingRef.current) {
        refreshUserStats()
      }
    }, 300000)

    return () => {
      console.log('🧹 Cleaning up RealtimeProvider effect...')
      clearInterval(interval)
      disconnectSocket()
      delete window.triggerRealtimeUpdate
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      isInitializedRef.current = false
    }
  }, [isAuthenticated, isAdminRoute]) // Re-run when authentication status or route type changes

  // Memoized context value - only re-renders when these specific values change
  // Removed lastUpdate to prevent unnecessary re-renders
  const value = useMemo(() => {
    // For admin routes, provide minimal context without WebSocket functionality
    if (isAdminRoute) {
      return {
        userStats: { currentStreak: 0, longestStreak: 0 },
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
      connected,
      leaderboardData,
      requestLeaderboardUpdate,
      // Provide a getter for lastUpdate if needed, but don't include in dependencies
      getLastUpdate: () => lastUpdateRef.current,
      socket: socketRef.current
    }
  }, [userStats, recentActivity, weeklyStats, connected, leaderboardData, isAdminRoute])

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  )
}