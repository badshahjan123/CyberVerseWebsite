import { Link } from "react-router-dom"
import { useApp } from "../contexts/app-context"
import { useRealtime } from "../contexts/realtime-context"
import { useActivity } from "../contexts/activity-context"
import { useBookmarks } from "../contexts/bookmark-context"
import { ProtectedRoute } from "../components/protected-route"
import { Trophy, Target, Zap, Clock, CheckCircle2, ArrowRight, Flame, BookOpen, Star, Activity, Radar, Award, Shield, Lock, Network, Search, Code2, Eye, TrendingUp, Play, Bookmark, ChevronRight } from "lucide-react"
import { memo, useMemo, useState, useEffect } from "react"
import { getCompletedRooms } from "../services/progress"

const Dashboard = memo(() => {
  const { user } = useApp()
  const { userStats, refreshUserStats, lastUpdate } = useRealtime()
  const { recentRooms } = useActivity()
  const { getBookmarksByType } = useBookmarks()

  // Active Tab State for "My Learning" Hub
  const [activeTab, setActiveTab] = useState('current')

  // Trigger refresh when user completes activities
  useEffect(() => {
    if (user && !userStats.points) {
      refreshUserStats()
    }
  }, [user])

  // Listen for completion events and refresh stats
  useEffect(() => {
    const handleRoomCompletion = () => {
      refreshUserStats()
      // Refresh completed rooms list
      if (user) {
        getCompletedRooms().then(setCompletedRooms).catch(console.error)
      }
    }

    // Listen for custom events from room completion
    window.addEventListener('roomCompleted', handleRoomCompletion)
    window.addEventListener('labCompleted', handleRoomCompletion)
    
    return () => {
      window.removeEventListener('roomCompleted', handleRoomCompletion)
      window.removeEventListener('labCompleted', handleRoomCompletion)
    }
  }, [user, refreshUserStats])

  const currentUser = userStats || user

  const userData = useMemo(() => currentUser || {
    name: 'User',
    level: 1,
    points: 0,
    rank: 999,
    completedLabs: 0,
    completedRooms: 0,
    currentStreak: 0,
    longestStreak: 0
  }, [currentUser])

  // Skill Matrix Data (calculated from user activity - empty until backend integration)
  const skills = useMemo(() => [
    { name: 'Web Exploitation', level: 0, color: 'bg-primary', icon: Code2 },
    { name: 'Network Security', level: 0, color: 'bg-accent', icon: Network },
    { name: 'Privilege Escalation', level: 0, color: 'bg-warning', icon: Shield },
    { name: 'OSINT', level: 0, color: 'bg-info', icon: Search },
    { name: 'Forensics', level: 0, color: 'bg-success', icon: Eye }
  ], [])

  // Weekly Missions (generated from user activity)
  const weeklyMissions = useMemo(() => [
    { id: 1, title: 'Complete 3 Rooms', current: userData.completedRooms || 0, target: 3, completed: (userData.completedRooms || 0) >= 3 },
    { id: 2, title: 'Maintain 7-day streak', current: userData.currentStreak || user?.currentStreak || 0, target: 7, completed: (userData.currentStreak || user?.currentStreak || 0) >= 7 },
    { id: 3, title: 'Gain 500 points', current: userData.points || 0, target: 500, completed: (userData.points || 0) >= 500 }
  ], [userData])

  // State for joined rooms from backend
  const [joinedRooms, setJoinedRooms] = useState([])
  const [loadingJoined, setLoadingJoined] = useState(false)

  // Fetch joined rooms from user progress if ActivityContext is empty
  useEffect(() => {
    const fetchJoinedRooms = async () => {
      if (!user || recentRooms.length > 0) return
      
      // Skip fetching joined rooms since endpoint doesn't exist
      // Use recentRooms from ActivityContext instead
      setLoadingJoined(false)
    }

    fetchJoinedRooms()
  }, [user, recentRooms.length])

  // Get joined rooms from user's roomProgress
  const currentRooms = useMemo(() => {
    if (!user?.roomProgress) return []
    
    // Get rooms that are joined but not completed
    return user.roomProgress
      .filter(rp => rp.joined && !(rp.completed && rp.quizCompleted))
      .map(rp => {
        const progressPercent = rp.completedLectures ? 
          Math.round((rp.completedLectures.length / (rp.totalTasks || 5)) * 100) : 0
        
        return {
          id: rp.roomId,
          title: rp.roomTitle || rp.roomId,
          pathway: 'Unknown',
          difficulty: 'Medium',
          progress: progressPercent,
          points: 500,
          icon: '🎯',
          completed: rp.completed || false,
          quizCompleted: rp.quizCompleted || false
        }
      })
  }, [user?.roomProgress])

  // These will be populated from API calls  
  const [pathways, setPathways] = useState([])
  const [completedRooms, setCompletedRooms] = useState([])
  
  // Get bookmarked items from context
  const bookmarkedRooms = getBookmarksByType('room')
  const bookmarkedLabs = getBookmarksByType('lab')
  const [newRooms, setNewRooms] = useState([])
  const [loadingCompleted, setLoadingCompleted] = useState(false)

  // Get truly completed rooms from user progress
  const actuallyCompletedRooms = useMemo(() => {
    if (!user?.roomProgress) return []
    
    return user.roomProgress
      .filter(rp => rp.completed && rp.quizCompleted)
      .map(rp => {
        // Fix score - if finalScore is a timestamp, use quizScore percentage instead
        let actualScore = rp.finalScore
        if (actualScore && actualScore > 1000000000000) {
          actualScore = rp.quizScore?.percentage || 100
        }
        
        return {
          id: rp.roomId,
          slug: rp.roomId,
          title: rp.roomTitle || rp.roomId,
          category: 'Unknown',
          difficulty: 'Medium',
          finalScore: actualScore || rp.quizScore?.percentage || 100,
          completedAt: rp.completedAt,
          points: 500
        }
      })
  }, [user?.roomProgress])


  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-gradient-to-r from-success/20 to-success/10 text-success border-success/30'
      case 'Medium': return 'bg-gradient-to-r from-warning/20 to-warning/10 text-warning border-warning/30'
      case 'Hard': return 'bg-gradient-to-r from-orange-500/20 to-orange-600/10 text-orange-400 border-orange-500/30'
      case 'Insane': return 'bg-gradient-to-r from-danger/20 to-danger/10 text-danger border-danger/30'
      default: return 'bg-gradient-to-r from-gray-500/20 to-gray-600/10 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <ProtectedRoute>
      <div className="page-container bg-[rgb(8,12,16)] text-text min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-7xl">

          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-4xl font-bold">
              Welcome back, <span className="gradient-text">{userData.name}</span>!
            </h1>
            <p className="text-text-secondary text-lg">Ready to level up your cybersecurity skills?</p>
          </div>

          {/* 2-Column Layout: 70% Main Content + 30% Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">

            {/* LEFT COLUMN - Main Content (70%) */}
            <div className="lg:col-span-7 space-y-6">

              {/* My Learning Hub - Tabbed Interface */}
              <div className="card overflow-hidden">
                {/* Tabs Header */}
                <div className="border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
                  <div className="flex items-center gap-1 p-2">
                    {['current', 'pathways', 'bookmarks', 'completed'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-3 rounded-lg text-sm font-semibold transition-all capitalize ${activeTab === tab
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'text-muted hover:text-text hover:bg-white/5'
                          }`}
                      >
                        {tab === 'current' && <Play className="w-4 h-4 inline mr-2" />}
                        {tab === 'pathways' && <Target className="w-4 h-4 inline mr-2" />}
                        {tab === 'bookmarks' && <Bookmark className="w-4 h-4 inline mr-2" />}
                        {tab === 'completed' && <CheckCircle2 className="w-4 h-4 inline mr-2" />}
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === 'current' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">Continue Learning</h2>
                        <Link to="/rooms" className="text-primary hover:text-primary-hover flex items-center gap-1 text-sm font-semibold">
                          View All <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>

                      {currentRooms.length > 0 ? (
                        <>
                          {currentRooms.map((room) => (
                            <div key={room.id} className="card p-5 hover:border-primary/30 transition-all group">
                              <div className="flex items-start gap-4">
                                <div className="text-4xl">{room.icon}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-4 mb-3">
                                    <div className="flex-1">
                                      <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors mb-1">{room.title}</h3>
                                      <p className="text-sm text-muted flex items-center gap-2">
                                        <BookOpen className="w-3.5 h-3.5" />
                                        Part of <span className="text-accent font-medium">{room.pathway}</span> path
                                      </p>
                                    </div>
                                    <div className={`px-3 py-1 rounded-md text-xs font-semibold border ${getDifficultyColor(room.difficulty)}`}>
                                      {room.difficulty}
                                    </div>
                                  </div>

                                  {/* Progress Bar */}
                                  <div className="mb-4">
                                    <div className="flex items-center justify-between text-xs mb-1.5">
                                      <span className="text-muted font-medium">Progress</span>
                                      <span className="text-primary font-semibold">{room.progress}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(251,146,60,0.6)] animate-pulse"
                                        style={{ width: `${room.progress}%` }}
                                      />
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <Link
                                      to={room.progress > 0 ? `/rooms/${room.id}` : `/rooms/${room.id}`}
                                      className="btn-primary text-sm px-5 py-2 flex items-center gap-2"
                                    >
                                      <Play className="w-4 h-4" />
                                      {room.progress > 0 ? 'Resume Learning' : 'Start Room'}
                                    </Link>
                                    <div className="flex items-center gap-1.5 text-sm text-muted">
                                      <Trophy className="w-4 h-4 text-primary" />
                                      <span className="font-semibold text-primary">{room.points} pts</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </>
                      ) : actuallyCompletedRooms.length > 0 ? (
                        <>
                          <div className="mb-4 p-4 bg-success/10 border border-success/30 rounded-lg">
                            <p className="text-sm text-success font-medium">Great progress! You've completed {actuallyCompletedRooms.length} room{actuallyCompletedRooms.length !== 1 ? 's' : ''}. Ready for your next challenge?</p>
                          </div>
                          <div className="card p-8 text-center">
                            <Trophy className="w-16 h-16 text-success mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-text mb-2">Ready for More Challenges?</h3>
                            <p className="text-muted mb-4">You've completed rooms successfully. Continue your learning journey!</p>
                            <Link to="/rooms" className="btn-primary inline-flex items-center gap-2">
                              <Target className="w-4 h-4" />
                              Explore More Rooms
                            </Link>
                          </div>
                        </>
                      ) : (
                        <div className="card p-8 text-center">
                          <Target className="w-16 h-16 text-muted mx-auto mb-4" />
                          <h3 className="text-lg font-bold text-text mb-2">Start Your Learning Journey</h3>
                          <p className="text-muted mb-4">Join a room to start learning and track your progress</p>
                          <Link to="/rooms" className="btn-primary inline-flex items-center gap-2">
                            <Play className="w-4 h-4" />
                            Browse Rooms
                          </Link>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'pathways' && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-bold mb-4">Learning Pathways</h2>
                      {pathways.map((pathway) => (
                        <div key={pathway.id} className="card p-5 hover:border-primary/30 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="text-4xl">{pathway.icon}</div>
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-text mb-2">{pathway.title}</h3>
                              <div className="flex items-center gap-4 text-sm text-muted mb-3">
                                <span>{pathway.completed}/{pathway.rooms} rooms completed</span>
                              </div>
                              <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-accent to-accent-2 rounded-full"
                                  style={{ width: `${pathway.progress}%` }}
                                />
                              </div>
                            </div>
                            <Link to="/rooms" className="btn-ghost text-sm px-4 py-2">View Path</Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'bookmarks' && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-bold mb-4">Saved Items</h2>
                      
                      {bookmarkedRooms.length === 0 && bookmarkedLabs.length === 0 ? (
                        <div className="card p-8 text-center">
                          <Bookmark className="w-16 h-16 text-muted mx-auto mb-4" />
                          <h3 className="text-lg font-bold text-text mb-2">No Saved Items Yet</h3>
                          <p className="text-muted mb-4">Save rooms and labs to access them quickly later</p>
                          <Link to="/rooms" className="btn-primary inline-flex items-center gap-2">
                            <Play className="w-4 h-4" />
                            Browse Rooms
                          </Link>
                        </div>
                      ) : (
                        <>
                          {bookmarkedRooms.length > 0 && (
                            <>
                              <h3 className="text-lg font-semibold text-text mb-3">Saved Rooms</h3>
                              {bookmarkedRooms.map((room) => (
                                <div key={room.id} className="card p-5 hover:border-primary/30 transition-all group">
                                  <div className="flex items-center gap-4">
                                    <div className="text-3xl">{room.icon || '🎯'}</div>
                                    <div className="flex-1">
                                      <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors">{room.title}</h3>
                                      <p className="text-sm text-muted">{room.category}</p>
                                    </div>
                                    <div className={`px-3 py-1 rounded-md text-xs font-semibold border ${getDifficultyColor(room.difficulty)}`}>
                                      {room.difficulty}
                                    </div>
                                    <Link to={`/rooms/${room.slug || room.id}`} className="btn-primary text-sm px-4 py-2">Start</Link>
                                  </div>
                                </div>
                              ))}
                            </>
                          )}
                          
                          {bookmarkedLabs.length > 0 && (
                            <>
                              <h3 className="text-lg font-semibold text-text mb-3 mt-6">Saved Labs</h3>
                              {bookmarkedLabs.map((lab) => (
                                <div key={lab.id} className="card p-5 hover:border-primary/30 transition-all group">
                                  <div className="flex items-center gap-4">
                                    <div className="text-3xl">{lab.icon || '🧪'}</div>
                                    <div className="flex-1">
                                      <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors">{lab.title}</h3>
                                      <p className="text-sm text-muted">{lab.category}</p>
                                    </div>
                                    <div className={`px-3 py-1 rounded-md text-xs font-semibold border ${getDifficultyColor(lab.difficulty)}`}>
                                      {lab.difficulty}
                                    </div>
                                    <Link to={`/labs/${lab.slug || lab.id}`} className="btn-primary text-sm px-4 py-2">Start</Link>
                                  </div>
                                </div>
                              ))}
                            </>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {activeTab === 'completed' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">Completed Rooms</h2>
                        <span className="text-sm text-muted">{actuallyCompletedRooms.length} completed</span>
                      </div>
                      
                      {actuallyCompletedRooms.length === 0 ? (
                        <div className="card p-8 text-center">
                          <CheckCircle2 className="w-16 h-16 text-muted mx-auto mb-4" />
                          <h3 className="text-lg font-bold text-text mb-2">No Completed Rooms Yet</h3>
                          <p className="text-muted mb-4">Complete your first room to see it here</p>
                          <Link to="/rooms" className="btn-primary inline-flex items-center gap-2">
                            <Play className="w-4 h-4" />
                            Browse Rooms
                          </Link>
                        </div>
                      ) : (
                        actuallyCompletedRooms.map((room) => {
                          const completedDate = room.completedAt ? new Date(room.completedAt).toLocaleDateString() : 'Recently'
                          return (
                            <div key={room.id} className="card p-5 hover:border-success/30 transition-all group">
                              <div className="flex items-start gap-4">
                                <div className="text-3xl">✅</div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-4 mb-3">
                                    <div className="flex-1">
                                      <h3 className="text-lg font-bold text-text group-hover:text-success transition-colors mb-1">{room.title}</h3>
                                      <p className="text-sm text-muted flex items-center gap-2">
                                        <BookOpen className="w-3.5 h-3.5" />
                                        <span className="text-accent font-medium">{room.category}</span> • Completed {completedDate}
                                      </p>
                                    </div>
                                    <div className={`px-3 py-1 rounded-md text-xs font-semibold border ${getDifficultyColor(room.difficulty)}`}>
                                      {room.difficulty}
                                    </div>
                                  </div>

                                  <div className="mb-4">
                                    <div className="flex items-center justify-between text-xs mb-1.5">
                                      <span className="text-muted font-medium">Final Score</span>
                                      <span className="text-success font-semibold">{room.finalScore}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500 shadow-[0_0_6px_rgba(251,146,60,0.5)]"
                                        style={{ width: `${room.finalScore}%` }}
                                      />
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 px-3 py-1 bg-success/10 border border-success/30 text-success rounded-md text-sm font-semibold">
                                      <CheckCircle2 className="w-4 h-4" />
                                      Completed
                                    </div>
                                    <Link
                                      to={`/rooms/${room.slug}`}
                                      className="btn-ghost text-sm px-4 py-2 flex items-center gap-2"
                                    >
                                      <Eye className="w-4 h-4" />
                                      Review
                                    </Link>
                                    <div className="flex items-center gap-1.5 text-sm text-muted">
                                      <Trophy className="w-4 h-4 text-primary" />
                                      <span className="font-semibold text-primary">{room.points} pts</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* New Rooms Feed */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <TrendingUp className="w-6 h-6 text-primary" />
                      Just Released
                    </h2>
                    <p className="text-muted text-sm">Latest challenges to test your skills</p>
                  </div>
                  <Link to="/rooms" className="text-primary hover:text-primary-hover flex items-center gap-1 text-sm font-semibold">
                    View All <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {newRooms.map((room) => (
                    <div key={room.id} className="card p-4 hover:scale-[1.02] hover:border-primary/30 transition-all group">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="text-3xl">{room.icon}</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-text group-hover:text-primary transition-colors mb-1 line-clamp-1">{room.title}</h3>
                          <p className="text-xs text-muted">{room.releaseDate}</p>
                        </div>
                        {room.trending && (
                          <div className="px-2 py-0.5 bg-danger/10 border border-danger/30 text-danger rounded text-xs font-semibold flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            Hot
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className={`px-2.5 py-1 rounded text-xs font-semibold border ${getDifficultyColor(room.difficulty)}`}>
                          {room.difficulty}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Trophy className="w-4 h-4 text-primary" />
                          <span className="font-semibold text-primary">{room.points} pts</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - Sidebar (30%) */}
            <div className="lg:col-span-3 space-y-6">

              {/* Streak Card */}
              <div className="card p-6 bg-gradient-to-br from-orange-500/10 to-danger/10 border-orange-500/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Current Streak</h3>
                  <Flame className="w-8 h-8 text-orange-400" />
                </div>
                <div className="text-center mb-4">
                  <div className="text-5xl font-bold text-orange-400 mb-2">{userData.currentStreak || user?.currentStreak || 0}</div>
                  <p className="text-sm text-muted">day{(userData.currentStreak || user?.currentStreak || 0) !== 1 ? 's' : ''}</p>
                  {(userData.longestStreak || user?.longestStreak || 0) > 0 && (
                    <p className="text-xs text-orange-300 mt-1">Best: {userData.longestStreak || user?.longestStreak || 0} days</p>
                  )}
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-xs text-center text-muted">
                    {(userData.currentStreak || user?.currentStreak || 0) === 0
                      ? 'Complete a room or lab to start your streak! 🚀'
                      : (userData.currentStreak || user?.currentStreak || 0) < 7
                      ? `${7 - (userData.currentStreak || user?.currentStreak || 0)} days until 7-day badge 🏅`
                      : (userData.currentStreak || user?.currentStreak || 0) < 30
                      ? `${30 - (userData.currentStreak || user?.currentStreak || 0)} days until 30-day badge 🏆`
                      : 'Legendary streak! You\'re on fire! 🔥'
                    }
                  </p>
                </div>
              </div>

              {/* Skill Matrix */}
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Radar className="w-6 h-6 text-primary" />
                  <h3 className="text-lg font-bold">Skill Matrix</h3>
                </div>
                <div className="space-y-4">
                  {skills.map((skill) => {
                    const Icon = skill.icon
                    return (
                      <div key={skill.name}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-text">{skill.name}</span>
                          </div>
                          <span className="text-sm font-bold text-primary">{skill.level}%</span>
                        </div>
                        <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                          <div
                            className={`h-full ${skill.color} rounded-full transition-all duration-500 shadow-[0_0_6px_currentColor]`}
                            style={{ width: `${skill.level}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Weekly Missions */}
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Target className="w-6 h-6 text-accent" />
                  <h3 className="text-lg font-bold">Weekly Missions</h3>
                </div>
                <div className="space-y-4">
                  {weeklyMissions.map((mission) => (
                    <div key={mission.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm font-medium text-text flex-1">{mission.title}</p>
                        {mission.completed && <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted">
                        <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-accent to-accent-2 rounded-full"
                            style={{ width: `${Math.min((mission.current / mission.target) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="font-semibold">{mission.current}/{mission.target}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="card p-6">
                <h3 className="text-lg font-bold mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-warning" />
                      <span className="text-sm font-medium">Level</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-primary">{userData.level || 1}</span>
                      {userData.pointsToNextLevel && (
                        <p className="text-xs text-muted">{userData.pointsToNextLevel} to next</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium">Points</span>
                    </div>
                    <span className="text-lg font-bold text-primary">{(userData.points || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-accent" />
                      <span className="text-sm font-medium">Global Rank</span>
                    </div>
                    <span className="text-lg font-bold text-accent">#{userData.rank || '999+'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
})

Dashboard.displayName = 'Dashboard'
export default Dashboard