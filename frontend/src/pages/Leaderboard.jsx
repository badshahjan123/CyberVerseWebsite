import { useEffect, useState, memo, useMemo, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useApp } from "../contexts/app-context"
import { useRealTimeLeaderboard } from "../hooks/useRealTimeLeaderboard"
import { useRealtime } from "../contexts/realtime-context"
import { Trophy, Medal, Award, TrendingUp, Crown, Star, Zap, Target, Search, ChevronUp, Globe } from "lucide-react"


const Leaderboard = memo(() => {
  const { isAuthenticated, loading, user } = useApp()
  const { lastUpdate } = useRealtime()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("global")
  const [searchQuery, setSearchQuery] = useState("")
  const [showLoadingSkeleton, setShowLoadingSkeleton] = useState(false)
  const { leaderboard, loading: leaderboardLoading, error: leaderboardError } = useRealTimeLeaderboard()
  const [userRank, setUserRank] = useState(null)

  // Process leaderboard data
  const leaderboardData = useMemo(() => {
    return leaderboard.map(player => ({
      ...player,
      username: player.name,
      trend: 'up'
    }))
  }, [leaderboard])

  // Filter leaderboard by search query
  const filteredLeaderboard = useMemo(() => {
    if (!searchQuery) return leaderboardData
    return leaderboardData.filter(player =>
      player.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [leaderboardData, searchQuery])

  // Split into top 3 (champions) and rest (challengers)
  const champions = filteredLeaderboard.slice(0, 3)
  const challengers = filteredLeaderboard.slice(3)

  useEffect(() => {
    if (user && leaderboardData.length > 0) {
      const userPosition = leaderboardData.findIndex(player => player.name === user.name)
      setUserRank(userPosition !== -1 ? userPosition + 1 : 999)
    }
  }, [user, leaderboardData])

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login")
    }
  }, [isAuthenticated, loading, navigate])

  const handleTabSwitch = (tab) => {
    setActiveTab(tab)
    setShowLoadingSkeleton(true)
    setTimeout(() => setShowLoadingSkeleton(false), 400)
  }

  // Calculate points to next rank
  const pointsToNextRank = useMemo(() => {
    if (!user || !userRank || userRank === 1) return null
    const nextPlayer = leaderboardData[userRank - 2]
    if (!nextPlayer) return null
    return nextPlayer.points - (user.points || 0)
  }, [user, userRank, leaderboardData])

  if (loading) {
    return null
  }

  return (
    <div className="page-container bg-[rgb(8,12,16)] text-text min-h-screen pb-32">
      <div className="container mx-auto px-4 max-w-7xl py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">Global Leaderboard</span>
          </h1>
          <p className="text-text-secondary text-lg">Compete with the best cybersecurity learners worldwide</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-8">
          {["global", "weekly", "monthly"].map(tab => (
            <button
              key={tab}
              onClick={() => handleTabSwitch(tab)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === tab
                ? "bg-primary/10 text-primary border border-primary/20"
                : "bg-white/5 text-muted hover:text-text hover:bg-white/10 border border-white/10"
                }`}
            >
              {tab === "global" ? "🌍 Global" : tab === "weekly" ? "📅 This Week" : "📆 This Month"}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="text"
              placeholder="Search by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-lg text-text placeholder-muted focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all"
            />
          </div>
        </div>

        {leaderboardLoading || showLoadingSkeleton ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted">Loading leaderboard data...</p>
          </div>
        ) : leaderboardError ? (
          <div className="text-center py-16">
            <p className="text-danger text-lg">{leaderboardError}</p>
          </div>
        ) : filteredLeaderboard.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted text-lg">No players found matching "{searchQuery}"</p>
          </div>
        ) : (
          <>
            {/* Champions Podium (Top 3) */}
            {champions.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Crown className="w-6 h-6 text-yellow-400" />
                  Champions Podium
                </h2>

                {/* Desktop Layout: 2, 1, 3 */}
                <div className="hidden md:flex items-end justify-center gap-6 mb-8">
                  {/* Rank #2 - Silver */}
                  {champions[1] && (
                    <div className="flex-1 max-w-xs">
                      <div className="card p-6 bg-gradient-to-br from-slate-700/30 to-slate-800/30 border-2 border-slate-400/50 hover:border-slate-400 transition-all">
                        <div className="text-center mb-4">
                          <Medal className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                          <div className="text-5xl font-bold text-slate-300">2</div>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="relative mb-3">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center border-4 border-slate-400/50">
                              <span className="text-white font-bold text-2xl">
                                {champions[1].username.slice(0, 2).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <h3 className="text-xl font-bold text-text mb-3">{champions[1].username}</h3>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-muted text-sm">Level {champions[1].level}</span>
                            <span className="text-xs text-slate-400">• {champions[1].completedRooms || 0} rooms</span>
                          </div>
                          <div className="px-4 py-2 bg-slate-400/20 border border-slate-400/30 rounded-lg">
                            <p className="text-2xl font-bold text-slate-300">{champions[1].points.toLocaleString()}</p>
                            <p className="text-xs text-muted">points</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rank #1 - Gold */}
                  {champions[0] && (
                    <div className="flex-1 max-w-sm">
                      <div className="card p-8 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50 hover:border-yellow-500 transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                        <div className="text-center mb-4">
                          <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-2" />
                          <div className="text-6xl font-bold text-yellow-400">1</div>
                          <span className="inline-block px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold rounded-full mt-2">
                            👑 KING OF THE HILL
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="relative mb-4">
                            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center border-4 border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.5)]">
                              <span className="text-white font-bold text-3xl">
                                {champions[0].username.slice(0, 2).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <h3 className="text-2xl font-bold text-text mb-3">{champions[0].username}</h3>
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-muted text-sm">Level {champions[0].level}</span>
                            <span className="text-xs text-yellow-300">• {champions[0].completedRooms || 0} rooms</span>
                          </div>
                          <div className="px-6 py-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                            <p className="text-3xl font-bold text-yellow-400">{champions[0].points.toLocaleString()}</p>
                            <p className="text-xs text-muted">points</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rank #3 - Bronze */}
                  {champions[2] && (
                    <div className="flex-1 max-w-xs">
                      <div className="card p-6 bg-gradient-to-br from-amber-700/30 to-amber-900/30 border-2 border-amber-700/50 hover:border-amber-700 transition-all">
                        <div className="text-center mb-4">
                          <Award className="w-12 h-12 text-amber-600 mx-auto mb-2" />
                          <div className="text-5xl font-bold text-amber-600">3</div>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="relative mb-3">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center border-4 border-amber-700/50">
                              <span className="text-white font-bold text-2xl">
                                {champions[2].username.slice(0, 2).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <h3 className="text-xl font-bold text-text mb-3">{champions[2].username}</h3>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-muted text-sm">Level {champions[2].level}</span>
                            <span className="text-xs text-amber-400">• {champions[2].completedRooms || 0} rooms</span>
                          </div>
                          <div className="px-4 py-2 bg-amber-600/20 border border-amber-700/30 rounded-lg">
                            <p className="text-2xl font-bold text-amber-600">{champions[2].points.toLocaleString()}</p>
                            <p className="text-xs text-muted">points</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile Layout: Stack vertically 1, 2, 3 */}
                <div className="md:hidden space-y-4">
                  {champions.map((champion, idx) => {
                    const borderColors = [
                      "border-yellow-500/50 hover:border-yellow-500 from-yellow-500/20 to-orange-500/20",
                      "border-slate-400/50 hover:border-slate-400 from-slate-700/30 to-slate-800/30",
                      "border-amber-700/50 hover:border-amber-700 from-amber-700/30 to-amber-900/30"
                    ]
                    const textColors = ["text-yellow-400", "text-slate-300", "text-amber-600"]
                    const icons = [
                      <Crown key="crown" className="w-12 h-12 text-yellow-400" />,
                      <Medal key="medal" className="w-10 h-10 text-slate-300" />,
                      <Award key="award" className="w-10 h-10 text-amber-600" />
                    ]

                    return (
                      <div key={champion.rank} className={`card p-6 bg-gradient-to-br ${borderColors[idx]} border-2 transition-all`}>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            {icons[idx]}
                            <div className={`text-4xl font-bold ${textColors[idx]} mt-1`}>{champion.rank}</div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-text mb-2">{champion.username}</h3>
                            <div className="flex items-center gap-3">
                              <span className="text-muted text-sm">Level {champion.level}</span>
                              <div className={`px-3 py-1 bg-white/10 border ${borderColors[idx].split(' ')[0]} rounded`}>
                                <p className={`text-lg font-bold ${textColors[idx]}`}>{champion.points.toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Challengers List (Rank 4+) */}
            {challengers.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Target className="w-6 h-6 text-primary" />
                  Challengers
                </h2>

                <div className="card overflow-hidden">
                  {/* Table Header */}
                  <div className="hidden md:grid md:grid-cols-10 gap-4 p-4 bg-white/5 border-b border-white/10 font-semibold text-sm text-muted">
                    <div className="col-span-1">Rank</div>
                    <div className="col-span-4">Player</div>
                    <div className="col-span-3">Level</div>
                    <div className="col-span-2 text-right">Points</div>
                  </div>

                  {/* Table Body */}
                  <div className="divide-y divide-white/10">
                    {challengers.map((player, idx) => (
                      <div
                        key={player.rank}
                        className={`grid grid-cols-1 md:grid-cols-10 gap-4 p-4 transition-all hover:bg-white/5 hover:border-l-4 hover:border-primary ${idx % 2 === 0 ? 'bg-slate-800/20' : 'bg-slate-800/10'
                          } ${(player.username === user?.username || player.name === user?.name)
                            ? "border-l-4 border-primary bg-primary/10"
                            : ""
                          }`}
                      >
                        {/* Rank */}
                        <div className="col-span-1 flex items-center">
                          <span className="text-2xl font-bold text-primary">#{player.rank}</span>
                        </div>

                        {/* Player Info */}
                        <div className="col-span-12 md:col-span-4 flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-semibold text-sm">
                              {player.username.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-text truncate">{player.username}</h4>
                            <p className="text-sm text-muted truncate">Level {player.level}</p>
                          </div>
                        </div>

                        {/* Level Progress */}
                        <div className="col-span-12 md:col-span-3 flex items-center">
                          <div className="w-full">
                            <div className="text-sm text-muted mb-2">Level {player.level}</div>
                            <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                                style={{ width: `${(player.level % 1) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Points */}
                        <div className="col-span-12 md:col-span-2 flex items-center justify-between md:justify-end gap-2">
                          <div className="text-right">
                            <p className="text-xl font-bold text-primary">
                              {player.points.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted">points</p>
                          </div>
                          {player.trend === "up" && <TrendingUp className="h-5 w-5 text-success flex-shrink-0" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Sticky "My Rank" Footer */}
      {user && userRank && (
        <div className="fixed bottom-0 left-0 right-0 backdrop-blur-lg bg-slate-900/90 border-t border-primary/30 shadow-[0_-4px_20px_rgba(155,255,0,0.2)] z-50">
          <div className="container mx-auto px-4 max-w-7xl py-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-white font-bold">
                    {user.name?.slice(0, 2).toUpperCase() || 'ME'}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-text">Your Rank</h4>
                  <p className="text-sm text-muted">See where you stand!</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-sm text-muted mb-1">Current Rank</p>
                  <p className="text-3xl font-bold text-primary">#{userRank}</p>
                </div>

                <div className="hidden sm:block w-px h-12 bg-white/20"></div>

                <div className="text-center">
                  <p className="text-sm text-muted mb-1">Total Points</p>
                  <p className="text-2xl font-bold text-accent">{(user.points || 0).toLocaleString()}</p>
                </div>

                {pointsToNextRank && pointsToNextRank > 0 && (
                  <>
                    <div className="hidden sm:block w-px h-12 bg-white/20"></div>

                    <div className="text-center">
                      <p className="text-sm text-muted mb-1">To Rank #{userRank - 1}</p>
                      <p className="text-lg font-bold text-warning flex items-center gap-1">
                        <ChevronUp className="w-4 h-4" />
                        {pointsToNextRank.toLocaleString()} pts
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

Leaderboard.displayName = 'Leaderboard'
export default Leaderboard