import { Link } from "react-router-dom"
import { useApp } from "../contexts/app-context"
import { useRealtime } from "../contexts/realtime-context"
import { useActivity } from "../contexts/activity-context"
import { useBookmarks } from "../contexts/bookmark-context"
import { ProtectedRoute } from "../components/protected-route"
import {
  Trophy, Target, Zap, Clock, CheckCircle2, ArrowRight, Flame,
  BookOpen, Activity, Radar, Award, Shield, Lock, Network, Search,
  Code2, Eye, TrendingUp, Play, Bookmark, ChevronRight, Star,
  Terminal, Crown, Sword, Cpu
} from "lucide-react"
import { memo, useMemo, useState, useEffect, useCallback, useRef } from "react"
import { apiCall } from "../config/api"

/* ──────────── helpers ──────────── */
const LEVEL_NAMES = [
  "Script Kiddie", "Cyber Apprentice", "Code Breaker", "Net Stalker",
  "Exploit Dev", "Zero-Day Hunter", "Red Teamer", "Cyber Phantom",
  "Ghost Operator", "Elite Hacker", "Legend"
]

const getLevelName = (level) => LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)] || "Legend"

const getDifficultyMeta = (d) => {
  const map = {
    Easy:   { color: "#39FF14", bg: "rgba(57,255,20,0.1)",   border: "rgba(57,255,20,0.25)"  },
    Medium: { color: "#FACC15", bg: "rgba(250,204,21,0.1)",  border: "rgba(250,204,21,0.25)" },
    Hard:   { color: "#F97316", bg: "rgba(249,115,22,0.1)",  border: "rgba(249,115,22,0.25)" },
    Insane: { color: "#FF3D71", bg: "rgba(255,61,113,0.1)",  border: "rgba(255,61,113,0.25)" },
  }
  return map[d] || { color: "#94A3B8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.2)" }
}

/* Animated number counter (fires once on mount) */
const AnimatedCounter = memo(({ target, duration = 1200, suffix = "" }) => {
  const [count, setCount] = useState(0)
  const prevTarget = useRef(target)
 
  useEffect(() => {
    let start = count;
    const end = target;
    const range = end - start;
    if (range === 0) return;

    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const nextCount = Math.floor(start + (range * progress));
      setCount(nextCount);
 
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };
 
    requestAnimationFrame(animate);
    prevTarget.current = target;
  }, [target, duration]);
 
  return <>{count.toLocaleString()}{suffix}</>
})
AnimatedCounter.displayName = "AnimatedCounter"

/* Circular streak ring (pure CSS) */
const StreakRing = memo(({ streak, best }) => {
  const maxStreak = Math.max(best || 30, 30)
  const pct = Math.min((streak / maxStreak) * 100, 100)
  const r = 50, c = 2 * Math.PI * r
  const dash = (pct / 100) * c

  return (
    <div className="db-streak-ring-wrap">
      <svg width="130" height="130" viewBox="0 0 120 120" className="db-streak-svg">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={r} fill="none"
          stroke={streak > 0 ? "#FF6B35" : "#334155"}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          strokeDashoffset={c * 0.25}
          style={{ transition: "stroke-dasharray 1.2s ease", filter: streak > 0 ? "drop-shadow(0 0 6px rgba(255,107,53,0.6))" : "none" }}
        />
        <text x="60" y="55" textAnchor="middle" fill={streak > 0 ? "#FF6B35" : "#475569"}
          fontSize="26" fontWeight="800" fontFamily="Orbitron, sans-serif">{streak}</text>
        <text x="60" y="72" textAnchor="middle" fill="#64748B" fontSize="10" fontFamily="Inter, sans-serif">days</text>
      </svg>
    </div>
  )
})
StreakRing.displayName = "StreakRing"

/* XP Progress bar */
const XPBar = memo(({ points, pointsToNext, level }) => {
  const total = (pointsToNext || 1000)
  const progress = Math.min(100, 100 - ((pointsToNext / total) * 100))

  return (
    <div className="db-xp-bar-wrap">
      <div className="db-xp-bar-labels">
        <span className="db-xp-label">
          <Zap size={11} style={{ color: "#FACC15" }} />
          Level {level} — {getLevelName(level)}
        </span>
        <span className="db-xp-label db-xp-label--right">{(points || 0).toLocaleString()} XP</span>
      </div>
      <div className="db-xp-track">
        <div className="db-xp-fill" style={{ width: `${progress}%` }} />
      </div>
      <p className="db-xp-hint">{(pointsToNext || 1000).toLocaleString()} XP to Level {(level || 1) + 1}</p>
    </div>
  )
})
XPBar.displayName = "XPBar"

/* SkillBar */
const SkillBar = memo(({ name, Icon, pct, color }) => (
  <div className="db-skill-row">
    <div className="db-skill-info">
      <div className="db-skill-icon-wrap" style={{ background: `${color}18`, border: `1px solid ${color}35` }}>
        <Icon size={13} style={{ color }} />
      </div>
      <span className="db-skill-name">{name}</span>
    </div>
    <div className="db-skill-track">
      <div className="db-skill-fill" style={{
        width: `${pct}%`,
        background: `linear-gradient(90deg, ${color}, ${color}aa)`,
        boxShadow: pct > 50 ? `0 0 8px ${color}44` : "none"
      }} />
    </div>
    <span className="db-skill-pct" style={{ color }}>{pct}%</span>
  </div>
))
SkillBar.displayName = "SkillBar"

/* Weekly mission pill */
const MissionPill = memo(({ title, current, target, completed }) => {
  const pct = Math.min((current / target) * 100, 100)
  return (
    <div className={`db-mission ${completed ? "db-mission--done" : ""}`}>
      <div className="db-mission-head">
        <span className="db-mission-title">{title}</span>
        {completed && <CheckCircle2 size={14} style={{ color: "#39FF14", flexShrink: 0 }} />}
      </div>
      <div className="db-mission-track">
        <div className="db-mission-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="db-mission-count">{current}/{target}</span>
    </div>
  )
})
MissionPill.displayName = "MissionPill"

/* Mini leaderboard row */
const LeaderRow = memo(({ rank, username, points, level, isCurrentUser }) => {
  const gold = rank === 1
  return (
    <div className={`db-leader-row ${gold ? "db-leader-row--gold" : ""} ${isCurrentUser ? "db-leader-row--me" : ""}`}>
      <div className={`db-leader-rank ${gold ? "db-leader-rank--gold" : ""}`}>
        {gold ? <Crown size={13} /> : `#${rank}`}
      </div>
      <div className="db-leader-info">
        <span className="db-leader-name">{username}{isCurrentUser ? " (You)" : ""}</span>
        <span className="db-leader-level">Lvl {level}</span>
      </div>
      <span className="db-leader-pts">{(points || 0).toLocaleString()} XP</span>
    </div>
  )
})
LeaderRow.displayName = "LeaderRow"

/* ──────────── Main Dashboard ──────────── */
const Dashboard = memo(() => {
  const { user, refreshUser } = useApp()
  const { userStats, refreshUserStats, leaderboardData, weeklyStats, requestLeaderboardUpdate } = useRealtime()
  const { recentRooms } = useActivity()
  const { getBookmarksByType } = useBookmarks()

  const [activeTab, setActiveTab]           = useState("current")
  const [miniLeaderboard, setMiniLeaderboard] = useState([])
  const [newRooms, setNewRooms]             = useState([])

  // Bootstrap stats + leaderboard
  useEffect(() => {
    if (user && !userStats.points) refreshUserStats()
    requestLeaderboardUpdate()
    // Fetch newest rooms for "Just Released"
    apiCall("/rooms?limit=4&sort=createdAt")
      .then(res => setNewRooms(res.data || []))
      .catch(() => {})
    // Fallback leaderboard fetch if socket hasn't populated it
    apiCall("/users/leaderboard?limit=5")
      .then(res => setMiniLeaderboard(res.leaderboard || []))
      .catch(() => {})
  }, [user])

  // Room-completion event listener
  useEffect(() => {
    const onComplete = async () => {
      console.log("📈 Dashboard Sync Triggered...");
      refreshUserStats();
      if (typeof refreshUser === 'function') {
        await refreshUser();
      }
    };
    window.addEventListener("roomCompleted", onComplete)
    window.addEventListener("labCompleted", onComplete)
    return () => {
      window.removeEventListener("roomCompleted", onComplete)
      window.removeEventListener("labCompleted", onComplete)
    }
  }, [refreshUserStats, refreshUser])

  // Merge userStats (socket) with user (auth/me)
  const ud = useMemo(() => ({
    name: userStats?.name || user?.name || "Hacker",
    level: userStats?.level || user?.level || 1,
    points: userStats?.totalXP || user?.points || 0,
    rank: userStats?.rank || user?.rank || 999,
    completedLabs: userStats?.completedLabs || user?.completedLabs || 0,
    completedRooms: userStats?.completedRooms || user?.completedRooms || 0,
    currentStreak: userStats?.streak || user?.currentStreak || 0,
    longestStreak: userStats?.longestStreak || user?.longestStreak || 0,
    pointsToNextLevel: userStats?.pointsToNextLevel || user?.pointsToNextLevel || 1000,
    isPremium: userStats?.isPremium ?? user?.isPremium ?? false,
    avatar: user?.avatar || null,
  }), [userStats, user])

  // In-progress rooms from roomProgress
  const currentRooms = useMemo(() => {
    if (!user?.roomProgress) return []
    return user.roomProgress
      .filter(rp => rp.joined && !rp.completed)
      .map(rp => ({
        id: rp.roomId,
        title: rp.roomTitle || rp.roomId,
        difficulty: rp.difficulty || "Medium",
        progress: rp.completedLectures
          ? Math.round((rp.completedLectures.length / (rp.totalTasks || 5)) * 100) : 0,
        points: 500
      }))
  }, [user?.roomProgress])

  // Completed rooms
  const completedRooms = useMemo(() => {
    if (!user?.roomProgress) return []
    return user.roomProgress
      .filter(rp => rp.completed)
      .map(rp => {
        let score = rp.finalScore
        if (score && score > 1_000_000_000_000) score = rp.quizScore?.percentage || 100
        return {
          id: rp.roomId, title: rp.roomTitle || rp.roomId,
          difficulty: "Medium", finalScore: score || 100,
          completedAt: rp.completedAt, points: 500
        }
      })
  }, [user?.roomProgress])

  // Skills derived from real skillMatrix if available, else derive from activity
  const skills = useMemo(() => {
    if (userStats?.skillMatrix?.length > 0) {
      const iconMap = {
        "Web Exploitation": Code2,
        "Network Security": Network,
        "Priv. Escalation": Shield,
        "OSINT": Search,
        "Forensics": Eye
      };
      const colorMap = {
        "Web Exploitation": "#00F5FF",
        "Network Security": "#8B5CF6",
        "Priv. Escalation": "#FACC15",
        "OSINT": "#39FF14",
        "Forensics": "#F97316"
      };
      
      return userStats.skillMatrix.map(s => ({
        name: s.category || s.name,
        Icon: iconMap[s.category || s.name] || Radar,
        pct: s.progress || s.percentage || 0,
        color: colorMap[s.category || s.name] || "#94A3B8"
      }));
    }

    return [
      { name: "Web Exploitation",   Icon: Code2,   pct: Math.min(ud.completedRooms * 8, 100), color: "#00F5FF" },
      { name: "Network Security",   Icon: Network, pct: Math.min(ud.completedLabs  * 10, 100), color: "#8B5CF6" },
      { name: "Priv. Escalation",   Icon: Shield,  pct: Math.min(ud.completedRooms * 5, 100), color: "#FACC15" },
      { name: "OSINT",              Icon: Search,  pct: Math.min(ud.points / 50 | 0, 100),    color: "#39FF14" },
      { name: "Forensics",          Icon: Eye,     pct: Math.min(ud.completedLabs  * 7, 100), color: "#F97316" },
    ];
  }, [ud, userStats.skillMatrix])

  const weeklyMissions = useMemo(() => [
    { id: 1, title: "Complete 3 Rooms",      current: ud.completedRooms, target: 3,   completed: ud.completedRooms >= 3 },
    { id: 2, title: "Maintain 7-day streak", current: ud.currentStreak,  target: 7,   completed: ud.currentStreak  >= 7 },
    { id: 3, title: "Gain 500 XP",           current: ud.points,         target: 500, completed: ud.points >= 500 },
  ], [ud])

  const bookmarkedRooms = getBookmarksByType("room")
  const bookmarkedLabs  = getBookmarksByType("lab")

  // Use socket leaderboard if available, else REST fallback
  const leaders = (leaderboardData?.length ? leaderboardData : miniLeaderboard).slice(0, 5)

  return (
    <ProtectedRoute>
      <div className="db-root">
        {/* Background glow */}
        <div className="db-bg-glow db-bg-glow--top"    aria-hidden="true" />
        <div className="db-bg-glow db-bg-glow--right"  aria-hidden="true" />
        <div className="db-grid-overlay"               aria-hidden="true" />

        <div className="db-container">

          {/* ════ WELCOME HEADER ════ */}
          <header className="db-header">
            <div className="db-header-left">
              <div className="db-header-name-row">
                <p className="db-header-greeting">Welcome back,</p>
                <h1 className="db-header-name">
                  <span className="db-header-name-accent">{ud.name}</span> 👋
                </h1>
              </div>
              <div className="db-header-badges">
                {ud.isPremium && (
                  <span className="db-badge db-badge--premium"><Crown size={11} /> Premium</span>
                )}
                <span className="db-badge db-badge--level">
                  <Zap size={11} /> Level {ud.level} — {getLevelName(ud.level)}
                </span>
                <span className="db-badge db-badge--rank">
                  <Trophy size={11} /> Rank #{ud.rank}
                </span>
              </div>
              <XPBar points={ud.points} pointsToNext={ud.pointsToNextLevel} level={ud.level} />
            </div>
            <div className="db-header-actions">
              <Link to="/labs"        className="db-action-btn db-action-btn--cyan"><Terminal size={15} /> Enter Lab</Link>
              <Link to="/rooms"       className="db-action-btn db-action-btn--purple"><Sword size={15} /> Browse Rooms</Link>
              <Link to="/leaderboard" className="db-action-btn db-action-btn--ghost"><Trophy size={15} /> Leaderboard</Link>
            </div>
          </header>

          {/* ════ STATS STRIP ════ */}
          <div className="db-stats-strip">
            {[
              { label: "Total XP",       val: ud.points,         suffix: "",  Icon: Zap,     color: "#FACC15" },
              { label: "Rooms Done",     val: ud.completedRooms, suffix: "",  Icon: Target,  color: "#00F5FF" },
              { label: "Labs Done",      val: ud.completedLabs,  suffix: "",  Icon: Terminal,color: "#8B5CF6" },
              { label: "Current Streak", val: ud.currentStreak,  suffix: "d", Icon: Flame,   color: "#FF6B35" },
            ].map(({ label, val, suffix, Icon, color }) => (
              <div key={label} className="db-stat-card">
                <div className="db-stat-icon-wrap" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div>
                  <div className="db-stat-val" style={{ color }}>
                    <AnimatedCounter target={val} suffix={suffix} />
                  </div>
                  <div className="db-stat-label">{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ════ 2-COL LAYOUT ════ */}
          <div className="db-cols">

            {/* ── LEFT (70%) ── */}
            <div className="db-left">

              {/* My Learning Hub */}
              <div className="db-card db-card--tabs">
                {/* Tab bar */}
                <div className="db-tab-bar">
                  {[
                    { key: "current",   Icon: Play,         label: "Current"   },
                    { key: "bookmarks", Icon: Bookmark,     label: "Saved"     },
                    { key: "completed", Icon: CheckCircle2, label: "Completed" },
                  ].map(({ key, Icon, label }) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`db-tab ${activeTab === key ? "db-tab--active" : ""}`}
                    >
                      <Icon size={14} /> {label}
                    </button>
                  ))}
                  <Link to="/rooms" className="db-tab-viewall">View All <ChevronRight size={13} /></Link>
                </div>

                {/* Tab: Current */}
                {activeTab === "current" && (
                  <div className="db-tab-content">
                    <h2 className="db-section-title">
                      <Activity size={16} style={{ color: "#00F5FF" }} /> Active Missions
                    </h2>
                    {currentRooms.length > 0 ? currentRooms.map(room => {
                      const dm = getDifficultyMeta(room.difficulty)
                      return (
                        <div key={room.id} className="db-mission-card">
                          <div className="db-mission-card-tag">Active Mission</div>
                          <div className="db-mission-card-body">
                            <div className="db-mission-card-info">
                              <h3 className="db-mission-card-title">{room.title}</h3>
                              <span className="db-difficulty-badge" style={{ color: dm.color, background: dm.bg, border: `1px solid ${dm.border}` }}>{room.difficulty}</span>
                            </div>
                            <div className="db-progress-wrap">
                              <div className="db-progress-labels">
                                <span>Progress</span>
                                <span style={{ color: "#00F5FF" }}>{room.progress}%</span>
                              </div>
                              <div className="db-progress-track">
                                <div className="db-progress-fill db-progress-fill--cyan" style={{ width: `${room.progress}%` }} />
                              </div>
                            </div>
                            <div className="db-mission-card-footer">
                              <Link to={`/rooms/${room.id}`} className="db-resume-btn">
                                <Play size={14} /> {room.progress > 0 ? "Resume" : "Start"} Mission
                              </Link>
                              <span className="db-xp-reward"><Trophy size={13} style={{ color: "#FACC15" }} /> {room.points} XP</span>
                            </div>
                          </div>
                        </div>
                      )
                    }) : completedRooms.length > 0 ? (
                      <div className="db-empty-state">
                        <Trophy size={40} style={{ color: "#39FF14" }} />
                        <h3>All caught up! Ready for more?</h3>
                        <p>You've completed {completedRooms.length} room{completedRooms.length !== 1 ? "s" : ""}. Challenge yourself further.</p>
                        <Link to="/rooms" className="db-action-btn db-action-btn--cyan"><Target size={14} /> Browse Rooms</Link>
                      </div>
                    ) : (
                      <div className="db-empty-state">
                        <Target size={40} style={{ color: "#475569" }} />
                        <h3>Start Your First Mission</h3>
                        <p>Join a room and begin your hacking journey.</p>
                        <Link to="/rooms" className="db-action-btn db-action-btn--cyan"><Play size={14} /> Browse Rooms</Link>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: Saved */}
                {activeTab === "bookmarks" && (
                  <div className="db-tab-content">
                    <h2 className="db-section-title"><Bookmark size={16} style={{ color: "#8B5CF6" }} /> Saved Items</h2>
                    {bookmarkedRooms.length === 0 && bookmarkedLabs.length === 0 ? (
                      <div className="db-empty-state">
                        <Bookmark size={40} style={{ color: "#475569" }} />
                        <h3>No Saved Items</h3>
                        <p>Bookmark rooms and labs for quick access.</p>
                        <Link to="/rooms" className="db-action-btn db-action-btn--purple"><Play size={14} /> Browse Rooms</Link>
                      </div>
                    ) : (
                      <>
                        {bookmarkedRooms.map(room => {
                          const dm = getDifficultyMeta(room.difficulty)
                          return (
                            <div key={room.id} className="db-list-item">
                              <div className="db-list-item-icon">🎯</div>
                              <div className="db-list-item-info">
                                <span className="db-list-item-title">{room.title}</span>
                                <span className="db-list-item-sub">{room.category}</span>
                              </div>
                              <span className="db-difficulty-badge" style={{ color: dm.color, background: dm.bg, border: `1px solid ${dm.border}` }}>{room.difficulty}</span>
                              <Link to={`/rooms/${room.slug || room.id}`} className="db-mini-btn">Start</Link>
                            </div>
                          )
                        })}
                        {bookmarkedLabs.map(lab => {
                          const dm = getDifficultyMeta(lab.difficulty)
                          return (
                            <div key={lab.id} className="db-list-item">
                              <div className="db-list-item-icon">🧪</div>
                              <div className="db-list-item-info">
                                <span className="db-list-item-title">{lab.title}</span>
                                <span className="db-list-item-sub">{lab.category}</span>
                              </div>
                              <span className="db-difficulty-badge" style={{ color: dm.color, background: dm.bg, border: `1px solid ${dm.border}` }}>{lab.difficulty}</span>
                              <Link to={`/labs/${lab.slug || lab.id}`} className="db-mini-btn">Start</Link>
                            </div>
                          )
                        })}
                      </>
                    )}
                  </div>
                )}

                {/* Tab: Completed */}
                {activeTab === "completed" && (
                  <div className="db-tab-content">
                    <h2 className="db-section-title"><CheckCircle2 size={16} style={{ color: "#39FF14" }} /> Completed Rooms</h2>
                    {completedRooms.length === 0 ? (
                      <div className="db-empty-state">
                        <CheckCircle2 size={40} style={{ color: "#475569" }} />
                        <h3>No Completed Rooms Yet</h3>
                        <p>Finish a room to see it here.</p>
                        <Link to="/rooms" className="db-action-btn db-action-btn--cyan"><Play size={14} /> Browse Rooms</Link>
                      </div>
                    ) : completedRooms.map(room => {
                      const dm = getDifficultyMeta(room.difficulty)
                      return (
                        <div key={room.id} className="db-mission-card db-mission-card--done">
                          <div className="db-mission-card-body">
                            <div className="db-mission-card-info">
                              <h3 className="db-mission-card-title">{room.title}</h3>
                              <span className="db-difficulty-badge" style={{ color: dm.color, background: dm.bg, border: `1px solid ${dm.border}` }}>{room.difficulty}</span>
                            </div>
                            <div className="db-progress-wrap">
                              <div className="db-progress-labels">
                                <span>Final Score</span>
                                <span style={{ color: "#39FF14" }}>{room.finalScore}%</span>
                              </div>
                              <div className="db-progress-track">
                                <div className="db-progress-fill db-progress-fill--green" style={{ width: `${room.finalScore}%` }} />
                              </div>
                            </div>
                            <div className="db-mission-card-footer">
                              <span className="db-done-badge"><CheckCircle2 size={13} /> Completed{room.completedAt ? ` · ${new Date(room.completedAt).toLocaleDateString()}` : ""}</span>
                              <Link to={`/rooms/${room.id}`} className="db-ghost-btn"><Eye size={13} /> Review</Link>
                              <span className="db-xp-reward"><Trophy size={13} style={{ color: "#FACC15" }} /> {room.points} XP</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Just Released */}
              <div className="db-card">
                <div className="db-card-header">
                  <h2 className="db-section-title"><TrendingUp size={16} style={{ color: "#00F5FF" }} /> Just Released</h2>
                  <Link to="/rooms" className="db-viewall-link">View All <ChevronRight size={13} /></Link>
                </div>
                {newRooms.length > 0 ? (
                  <div className="db-new-rooms-grid">
                    {newRooms.slice(0, 4).map(room => {
                      const dm = getDifficultyMeta(room.difficulty)
                      return (
                        <Link to={`/rooms/${room.slug || room._id}`} key={room._id || room.id} className="db-new-room-card">
                          <div className="db-new-room-top">
                            <span className="db-new-room-icon">{room.icon || "🎯"}</span>
                            <span className="db-difficulty-badge" style={{ color: dm.color, background: dm.bg, border: `1px solid ${dm.border}` }}>{room.difficulty}</span>
                          </div>
                          <h3 className="db-new-room-title">{room.title}</h3>
                          <div className="db-new-room-meta">
                            <span className="db-xp-reward"><Trophy size={11} style={{ color: "#FACC15" }} /> {room.points || 500} XP</span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  <div className="db-empty-state db-empty-state--sm">
                    <p>No new rooms yet — check back soon!</p>
                    <Link to="/rooms" className="db-mini-btn">Browse All</Link>
                  </div>
                )}
              </div>

              {/* Weekly Stats from realtime */}
              <div className="db-card">
                <div className="db-card-header">
                  <h2 className="db-section-title"><Activity size={16} style={{ color: "#8B5CF6" }} /> This Week</h2>
                </div>
                <div className="db-weekly-grid">
                  {[
                    { label: "Labs Done",    val: weeklyStats?.labsCompleted || 0, Icon: Terminal, color: "#8B5CF6" },
                    { label: "XP Earned",    val: weeklyStats?.pointsEarned || 0,  Icon: Zap,      color: "#FACC15" },
                    { label: "Time Spent",   val: weeklyStats?.timeSpent || "0h",  Icon: Clock,    color: "#00F5FF", isStr: true },
                    { label: "Rank Change",  val: weeklyStats?.rankChange || 0,    Icon: TrendingUp,color: weeklyStats?.rankChange >= 0 ? "#39FF14" : "#FF3D71", prefix: weeklyStats?.rankChange >= 0 ? "↑" : "↓" },
                  ].map(({ label, val, Icon, color, isStr, prefix }) => (
                    <div key={label} className="db-weekly-item">
                      <Icon size={16} style={{ color }} />
                      <span className="db-weekly-val" style={{ color }}>
                        {prefix}{isStr ? val : <AnimatedCounter target={val} />}
                      </span>
                      <span className="db-weekly-label">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── RIGHT SIDEBAR (30%) ── */}
            <div className="db-right">

              {/* Streak Ring */}
              <div className="db-card db-card--streak">
                <div className="db-card-header">
                  <h3 className="db-section-title">
                    <Flame size={15} style={{ color: "#FF6B35" }} /> Daily Streak
                  </h3>
                  {ud.currentStreak > 0 && <span className="db-streak-active-badge">🔥 Active</span>}
                </div>
                <StreakRing streak={ud.currentStreak} best={ud.longestStreak} />
                <p className="db-streak-best">Best: <strong style={{ color: "#FACC15" }}>{ud.longestStreak}d</strong></p>
                <div className="db-streak-hint">
                  {ud.currentStreak === 0
                    ? "Complete a room or lab to start your streak!"
                    : ud.currentStreak < 7
                    ? `${7 - ud.currentStreak} more days to earn 7-day badge 🏅`
                    : ud.currentStreak < 30
                    ? `${30 - ud.currentStreak} days until 30-day badge 🏆`
                    : "Legendary streak! You're on fire! 🔥"}
                </div>
              </div>

              {/* Skill Matrix */}
              <div className="db-card">
                <div className="db-card-header">
                  <h3 className="db-section-title"><Radar size={15} style={{ color: "#8B5CF6" }} /> Skill Matrix</h3>
                </div>
                <div className="db-skills-list">
                  {skills.map(s => <SkillBar key={s.name} {...s} />)}
                </div>
                <p className="db-skills-note">Skills grow as you complete rooms & labs</p>
              </div>

              {/* Weekly Missions */}
              <div className="db-card">
                <div className="db-card-header">
                  <h3 className="db-section-title"><Target size={15} style={{ color: "#00F5FF" }} /> Weekly Missions</h3>
                </div>
                <div className="db-missions-list">
                  {weeklyMissions.map(m => <MissionPill key={m.id} {...m} />)}
                </div>
              </div>

              {/* Mini Leaderboard */}
              <div className="db-card">
                <div className="db-card-header">
                  <h3 className="db-section-title"><Trophy size={15} style={{ color: "#FACC15" }} /> Top Hackers</h3>
                  <Link to="/leaderboard" className="db-viewall-link">Full Board <ChevronRight size={12} /></Link>
                </div>
                <div className="db-leaders-list">
                  {leaders.length > 0 ? leaders.map(l => (
                    <LeaderRow key={l.rank} {...l} isCurrentUser={l.username === ud.name} />
                  )) : (
                    <p className="db-leaders-empty">Loading leaderboard...</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
})

Dashboard.displayName = "Dashboard"
export default Dashboard