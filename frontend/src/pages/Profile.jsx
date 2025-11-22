import { useState, useEffect } from 'react'
import { Github, Twitter, Linkedin, MapPin, Calendar, Trophy, Target, Shield, Star, Award, Flame } from 'lucide-react'
import { useApp } from '../contexts/app-context'
import { useRealtime } from '../contexts/realtime-context'
import { apiCall } from '../config/api'

// Helper function to generate activity heatmap data for last 365 days
const generateHeatmapData = (roomProgress = []) => {
  const data = []
  const today = new Date()

  // Create a map of dates with completion counts
  const activityMap = new Map()

  roomProgress.forEach(room => {
    if (room.completedAt) {
      const date = new Date(room.completedAt).toISOString().split('T')[0]
      activityMap.set(date, (activityMap.get(date) || 0) + 1)
    }
  })

  for (let i = 364; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    const level = Math.min(activityMap.get(dateStr) || 0, 4)

    data.push({
      date: dateStr,
      level: level
    })
  }

  return data
}

const Profile = () => {
  const { user } = useApp()
  const { userStats } = useRealtime()
  const [heatmapData, setHeatmapData] = useState([])
  const [badges, setBadges] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [userRank, setUserRank] = useState(null)

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return

      try {
        const token = localStorage.getItem('token')

        // Fetch badges
        const badgesResponse = await apiCall('/user/badges')
        setBadges(badgesResponse.badges || [])

        // Fetch recent room completions
        const recentRooms = user.roomProgress
          ?.filter(rp => rp.completed)
          ?.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
          ?.slice(0, 3) || []
        setRecentActivity(recentRooms)

        // Generate heatmap from room progress
        setHeatmapData(generateHeatmapData(user.roomProgress || []))

        // Calculate user rank
        if (user.points) {
          const rank = await user.calculateRank?.() || null
          setUserRank(rank)
        }
      } catch (error) {
        console.error('Failed to fetch profile data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [user])

  const getRankPercentage = () => {
    if (!userRank || !userRank.totalUsers) return '0.00'
    return ((userRank.rank / userRank.totalUsers) * 100).toFixed(2)
  }

  const getRankBorder = () => {
    const percentage = parseFloat(getRankPercentage())
    if (percentage <= 1) return 'border-yellow-400 shadow-yellow-400/50'
    if (percentage <= 5) return 'border-gray-400 shadow-gray-400/50'
    if (percentage <= 10) return 'border-orange-600 shadow-orange-600/50'
    return 'border-primary/50 shadow-primary/30'
  }

  const getHeatmapColor = (level) => {
    if (level === 0) return 'bg-background/50 border border-border/20'
    if (level === 1) return 'bg-green-900/40 border border-green-700/20'
    if (level === 2) return 'bg-green-700/60 border border-green-500/20'
    if (level === 3) return 'bg-green-500/80 border border-green-400/20'
    return 'bg-green-400 border border-green-300/20'
  }

  // Group heatmap data by weeks
  const weeks = []
  for (let i = 0; i < heatmapData.length; i += 7) {
    weeks.push(heatmapData.slice(i, i + 7))
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="page-container bg-[rgb(8,12,16)] text-text min-h-screen pb-32">
      <div className="container mx-auto px-4 max-w-7xl py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Identity Card (Sticky) */}
          <div className="lg:col-span-4">
            <div className="sticky top-20 space-y-6">
              {/* Avatar & Basic Info */}
              <div className="glass-effect rounded-xl p-6 text-center border border-white/10">
                <div className="relative inline-block mb-4">
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                    alt={user.name}
                    className={`w-32 h-32 rounded-full border-4 ${getRankBorder()}`}
                  />
                  {user.isPremium && (
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center border-2 border-background shadow-lg">
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>

                <h2 className="text-2xl font-bold text-text mb-1">{user.name}</h2>
                <p className="text-muted text-sm mb-3">{user.email}</p>

                <div className="flex items-center justify-center gap-2 text-xs text-muted">
                  <Calendar className="w-4 h-4" />
                  <span>Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
              </div>

              {/* Rank Card */}
              {userRank && (
                <div className="glass-effect rounded-xl p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30 border">
                  <div className="text-center">
                    <div className="text-sm text-muted mb-2">Global Rank</div>
                    <div className="text-4xl font-bold gradient-text mb-1">#{userRank.rank}</div>
                    <div className="text-xs text-muted">
                      Top {getRankPercentage()}% of {userRank.totalUsers.toLocaleString()} users
                    </div>
                  </div>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-effect rounded-xl p-4 text-center border border-white/10 hover-lift">
                  <Target className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-text">{user.completedRooms || 0}</div>
                  <div className="text-xs text-muted">Rooms</div>
                </div>
                <div className="glass-effect rounded-xl p-4 text-center border border-white/10 hover-lift">
                  <Shield className="w-6 h-6 text-accent mx-auto mb-2" />
                  <div className="text-2xl font-bold text-text">{user.completedLabs || 0}</div>
                  <div className="text-xs text-muted">Labs</div>
                </div>
                <div className="glass-effect rounded-xl p-4 text-center border border-white/10 hover-lift">
                  <Trophy className="w-6 h-6 text-warning mx-auto mb-2" />
                  <div className="text-2xl font-bold text-text">{user.points?.toLocaleString() || 0}</div>
                  <div className="text-xs text-muted">Points</div>
                </div>
                <div className="glass-effect rounded-xl p-4 text-center border border-white/10 hover-lift">
                  <Flame className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-text">{user.streak || 0}</div>
                  <div className="text-xs text-muted">Day Streak</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Achievement Data */}
          <div className="lg:col-span-8 space-y-6">
            {/* Activity Heatmap */}
            <div className="glass-effect rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-text">Activity Overview</h3>
                  <p className="text-sm text-muted">Your learning activity over the past year</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span>Less</span>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map(level => (
                      <div key={level} className={`w-3 h-3 rounded-sm ${getHeatmapColor(level)}`} />
                    ))}
                  </div>
                  <span>More</span>
                </div>
              </div>

              {/* Heatmap Grid */}
              <div className="overflow-x-auto pb-2">
                <div className="flex gap-1" style={{ minWidth: 'fit-content' }}>
                  {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                      {week.map((day, dayIndex) => (
                        <div
                          key={dayIndex}
                          className={`w-3 h-3 rounded-sm ${getHeatmapColor(day.level)} hover:ring-2 hover:ring-primary transition-all cursor-pointer`}
                          title={`${day.date}: ${day.level} ${day.level === 1 ? 'activity' : 'activities'}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Badges Section */}
            {badges.length > 0 && (
              <div className="glass-effect rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-text mb-6">Earned Badges</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {badges.map(badge => (
                    <div
                      key={badge._id}
                      className="group relative p-6 rounded-lg glass-effect border border-white/10 hover:border-primary/50 transition-all cursor-pointer hover-lift"
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-2">{badge.icon || '🏆'}</div>
                        <div className="text-sm font-semibold text-text">{badge.name}</div>
                        {badge.description && (
                          <div className="text-xs text-muted mt-1">{badge.description}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="glass-effect rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-text mb-6">Recent Completions</h3>
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-muted mx-auto mb-3" />
                  <p className="text-muted">No completed rooms yet. Start your journey!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={activity.roomId || index}
                      className="flex items-center gap-4 p-4 rounded-lg glass-effect border border-white/10 hover:border-primary/30 transition-all group hover-lift"
                    >
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                        <Award className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-text group-hover:text-primary transition-colors truncate">
                          Room Completed
                        </h4>
                        <p className="text-sm text-muted">
                          {new Date(activity.completedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      {activity.finalScore && (
                        <div className="text-right flex-shrink-0">
                          <div className="text-lg font-bold text-primary">{activity.finalScore}</div>
                          <div className="text-xs text-muted">Score</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile