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
  Terminal, Crown, Sword, Cpu, BarChart3, Users
} from "lucide-react"
import { memo, useMemo, useState, useEffect, useCallback, useRef } from "react"
import { apiCall } from "../config/api"

/* ──────────── Design Tokens ──────────── */
const T = {
  bg: "#0a1128",
  surface: "#111a2e",
  surfaceAlt: "#162236",
  border: "rgba(255,255,255,0.06)",
  borderHover: "rgba(0,242,255,0.2)",
  text: "#E2E8F0",
  textMuted: "#64748B",
  cyan: "#00F2FF",
  green: "#88E636",
  purple: "#A855F7",
  amber: "#FFB800",
  orange: "#FF6B35",
  pink: "#FF3D71",
  neonGreen: "#39FF14",
}

/* ──────────── helpers ──────────── */
const LEVEL_NAMES = [
  "Script Kiddie", "Cyber Apprentice", "Code Breaker", "Net Stalker",
  "Exploit Dev", "Zero-Day Hunter", "Red Teamer", "Cyber Phantom",
  "Ghost Operator", "Elite Hacker", "Legend"
]

const getLevelName = (level) => LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)] || "Legend"

const getDifficultyMeta = (d) => {
  const map = {
    Easy:   { color: "#88E636", bg: "rgba(136,230,54,0.1)",  border: "rgba(136,230,54,0.25)" },
    Medium: { color: "#F5A623", bg: "rgba(245,166,35,0.1)",  border: "rgba(245,166,35,0.25)" },
    Hard:   { color: "#F97316", bg: "rgba(249,115,22,0.1)",  border: "rgba(249,115,22,0.25)" },
    Insane: { color: "#FF3D71", bg: "rgba(255,61,113,0.1)",  border: "rgba(255,61,113,0.25)" },
  }
  return map[d] || { color: "#94A3B8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.2)" }
}

/* Animated number counter */
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

/* ── Card shell ── */
const Card = ({ children, className = "", glow, style = {} }) => (
  <div
    className={`rounded-2xl p-5 transition-all duration-300 ${className}`}
    style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      boxShadow: glow ? `0 0 30px ${glow}15, 0 0 0 1px ${glow}20 inset` : undefined,
      ...style,
    }}
  >
    {children}
  </div>
)

/* ── Section header ── */
const SectionHeader = ({ icon, title, actionTo, actionLabel }) => (
  <div className="flex items-center justify-between mb-4">
    <h3 className="flex items-center gap-2 text-sm font-bold text-white">
      {icon} {title}
    </h3>
    {actionTo && (
      <Link to={actionTo} className="flex items-center gap-1 text-xs font-semibold transition-colors" style={{ color: T.cyan }}>
        {actionLabel || "View All"} <ChevronRight size={13} />
      </Link>
    )}
  </div>
)

/* ── Stat Card (HTB-style) ── */
const StatCard = memo(({ label, val, suffix = "", Icon, color }) => (
  <div
    className="flex items-center gap-4 rounded-xl p-4 transition-all duration-300 hover:-translate-y-0.5"
    style={{
      background: T.surfaceAlt,
      border: `1px solid ${T.border}`,
    }}
  >
    <div
      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: `${color}12`, border: `1px solid ${color}25` }}
    >
      <Icon size={20} style={{ color }} />
    </div>
    <div>
      <div className="text-2xl font-extrabold text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
        <AnimatedCounter target={val} suffix={suffix} />
      </div>
      <div className="text-xs text-slate-400 mt-0.5">{label}</div>
    </div>
  </div>
))
StatCard.displayName = "StatCard"

/* ── Streak Ring (THM-style) ── */
const StreakRing = memo(({ streak, best }) => {
  const maxStreak = Math.max(best || 30, 30)
  const pct = Math.min((streak / maxStreak) * 100, 100)
  const r = 46, c = 2 * Math.PI * r
  const dash = (pct / 100) * c

  return (
    <div className="flex flex-col items-center py-3">
      <svg width="120" height="120" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
        <circle
          cx="55" cy="55" r={r} fill="none"
          stroke={streak > 0 ? T.orange : "#1E293B"}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          strokeDashoffset={c * 0.25}
          style={{
            transition: "stroke-dasharray 1.2s ease",
            filter: streak > 0 ? "drop-shadow(0 0 8px rgba(255,107,53,0.5))" : "none",
          }}
        />
        <text x="55" y="50" textAnchor="middle" fill={streak > 0 ? T.orange : "#475569"}
          fontSize="28" fontWeight="800" fontFamily="'Inter', sans-serif">{streak}</text>
        <text x="55" y="68" textAnchor="middle" fill="#64748B" fontSize="10" fontFamily="'Inter', sans-serif">days</text>
      </svg>
    </div>
  )
})
StreakRing.displayName = "StreakRing"

/* ── XP Progress Bar (HTB level bar) ── */
const XPBar = memo(({ points, pointsToNext, level }) => {
  const total = 1000;
  const progress = Math.max(0, Math.min(100, 100 - (pointsToNext / total * 100)));

  return (
    <div className="w-full mt-4">
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: T.green }}>
          <Zap size={12} /> Level {level} — {getLevelName(level)}
        </span>
        <span className="text-xs font-bold text-white">{(points || 0).toLocaleString()} XP</span>
      </div>
      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${T.green}, #6BCB21)`,
            boxShadow: `0 0 12px ${T.green}40`,
          }}
        />
      </div>
      <p className="text-[11px] mt-1.5" style={{ color: T.textMuted }}>
        {(pointsToNext || 1000).toLocaleString()} XP to Level {(level || 1) + 1}
      </p>
    </div>
  )
})
XPBar.displayName = "XPBar"

/* ── Skill Bar ── */
const SkillBar = memo(({ name, Icon, pct, color }) => (
  <div className="flex items-center gap-3 py-2">
    <div className="flex items-center gap-2 w-32 flex-shrink-0">
      <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
        <Icon size={12} style={{ color }} />
      </div>
      <span className="text-xs font-medium text-slate-300 truncate">{name}</span>
    </div>
    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
      <div className="h-full rounded-full transition-all duration-700" style={{
        width: `${pct}%`,
        background: `linear-gradient(90deg, ${color}, ${color}88)`,
        boxShadow: pct > 0 ? `0 0 8px ${color}30` : "none",
      }} />
    </div>
    <span className="text-xs font-semibold w-8 text-right" style={{ color }}>{pct}%</span>
  </div>
))
SkillBar.displayName = "SkillBar"

/* ── Weekly Mission ── */
const MissionPill = memo(({ title, current, target, completed }) => {
  const pct = Math.min((current / target) * 100, 100)
  return (
    <div
      className="rounded-xl p-3.5 transition-all"
      style={{
        background: completed ? "rgba(16,185,129,0.06)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${completed ? "rgba(16,185,129,0.2)" : T.border}`,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-200">{title}</span>
        {completed && <CheckCircle2 size={14} className="text-emerald-400" />}
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div className={`h-full rounded-full transition-all ${completed ? "bg-emerald-500" : ""}`}
          style={{ width: `${pct}%`, background: completed ? undefined : T.cyan, boxShadow: `0 0 6px ${completed ? "rgba(16,185,129,0.3)" : "rgba(0,242,255,0.2)"}` }}
        />
      </div>
      <span className="text-xs mt-1.5 block" style={{ color: T.textMuted }}>{current}/{target}</span>
    </div>
  )
})
MissionPill.displayName = "MissionPill"

/* ── Mini leaderboard row ── */
const LeaderRow = memo(({ rank, username, points, level, isCurrentUser }) => {
  const gold = rank === 1
  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all"
      style={{
        background: isCurrentUser ? "rgba(0,242,255,0.05)" : gold ? "rgba(255,184,0,0.04)" : "transparent",
        border: isCurrentUser ? "1px solid rgba(0,242,255,0.15)" : "1px solid transparent",
      }}
    >
      <div className="w-6 text-center font-bold text-sm" style={{ color: gold ? T.amber : T.textMuted }}>
        {gold ? <Crown size={14} style={{ color: T.amber }} /> : `#${rank}`}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-semibold text-white truncate flex items-center gap-1.5">
          {username}
          {isCurrentUser && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(0,242,255,0.12)", color: T.cyan }}>You</span>
          )}
        </span>
        <span className="text-xs block" style={{ color: T.textMuted }}>Lv {level}</span>
      </div>
      <span className="text-sm font-bold text-slate-300">{(points || 0).toLocaleString()}</span>
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
        points: rp.totalPointsEarned || 0
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
          completedAt: rp.completedAt, points: rp.totalPointsEarned || 0
        }
      })
  }, [user?.roomProgress])

  // Skills
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
        "Web Exploitation": "#00F2FF",
        "Network Security": "#7000FF",
        "Priv. Escalation": "#FFB800",
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
      { name: "Web Exploitation",   Icon: Code2,   pct: Math.min(ud.completedRooms * 8, 100), color: "#00F2FF" },
      { name: "Network Security",   Icon: Network, pct: Math.min(ud.completedLabs  * 10, 100), color: "#7000FF" },
      { name: "Priv. Escalation",   Icon: Shield,  pct: Math.min(ud.completedRooms * 5, 100), color: "#FFB800" },
      { name: "OSINT",              Icon: Search,  pct: Math.min(ud.points / 50 | 0, 100),    color: "#39FF14" },
      { name: "Forensics",          Icon: Eye,     pct: Math.min(ud.completedLabs  * 7, 100), color: "#F97316" },
    ];
  }, [ud, userStats?.skillMatrix])

  const weeklyMissions = useMemo(() => [
    { id: 1, title: "Complete 3 Rooms",      current: ud.completedRooms, target: 3,   completed: ud.completedRooms >= 3 },
    { id: 2, title: "Maintain 7-day streak", current: ud.currentStreak,  target: 7,   completed: ud.currentStreak  >= 7 },
    { id: 3, title: "Gain 500 XP",           current: ud.points,         target: 500, completed: ud.points >= 500 },
  ], [ud])

  const bookmarkedRooms = getBookmarksByType("room")
  const bookmarkedLabs  = getBookmarksByType("lab")
  const leaders = (leaderboardData?.length ? leaderboardData : miniLeaderboard).slice(0, 5)

  // Tab data for learning hub
  const tabDefs = [
    { key: "current",   Icon: Play,         label: "Active"    },
    { key: "bookmarks", Icon: Bookmark,     label: "Saved"     },
    { key: "completed", Icon: CheckCircle2, label: "Completed" },
  ]

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ background: T.bg }}>

        {/* ── Subtle background effects ── */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.025]"
            style={{ background: "radial-gradient(circle, #00F2FF, transparent 70%)", filter: "blur(100px)" }} />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-[0.02]"
            style={{ background: "radial-gradient(circle, #A855F7, transparent 70%)", filter: "blur(100px)" }} />
          <div className="absolute inset-0 opacity-[0.015]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "56px 56px" }} />
        </div>

        {/* ══════════ HERO HEADER ══════════ */}
        <div className="relative z-10" style={{ background: "linear-gradient(135deg, #0a1128 0%, #12203d 100%)" }}>
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              {/* Left: welcome + XP */}
              <div className="flex-1">
                <p className="text-sm text-slate-400 mb-1">Welcome back,</p>
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {ud.name}
                  </h1>
                  <span className="text-2xl">👋</span>
                </div>
                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {ud.isPremium && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold"
                      style={{ background: "rgba(255,184,0,0.12)", color: T.amber, border: "1px solid rgba(255,184,0,0.25)" }}>
                      <Crown size={11} /> Premium
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold"
                    style={{ background: "rgba(136,230,54,0.1)", color: T.green, border: "1px solid rgba(136,230,54,0.2)" }}>
                    <Zap size={11} /> Level {ud.level}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold"
                    style={{ background: "rgba(0,242,255,0.08)", color: T.cyan, border: "1px solid rgba(0,242,255,0.15)" }}>
                    <Trophy size={11} /> Rank #{ud.rank}
                  </span>
                </div>
                <XPBar points={ud.points} pointsToNext={ud.pointsToNextLevel} level={ud.level} />
              </div>

              {/* Right: Quick action buttons */}
              <div className="flex flex-col gap-2 lg:pt-4">
                <Link to="/labs" className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all hover:brightness-110" style={{ background: 'linear-gradient(135deg, #00D4FF, #0099CC)', color: '#0a1128', fontSize: 13 }}>
                  <Terminal size={15} /> Enter Lab
                </Link>
                <Link to="/rooms" className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all hover:brightness-110" style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)', color: '#fff', fontSize: 13 }}>
                  <Sword size={15} /> Browse Rooms
                </Link>
                <Link to="/leaderboard" className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all hover:brightness-110" style={{ background: 'rgba(255,255,255,0.04)', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.1)', fontSize: 13 }}>
                  <Trophy size={15} /> Leaderboard
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════ STATS STRIP (HTB-style) ══════════ */}
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 -mt-1">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 py-5">
            <StatCard label="Total XP"       val={ud.points}         Icon={Zap}      color={T.amber}  />
            <StatCard label="Rooms Done"     val={ud.completedRooms} Icon={Target}   color={T.cyan}   />
            <StatCard label="Labs Done"      val={ud.completedLabs}  Icon={Terminal}  color={T.purple} />
            <StatCard label="Current Streak" val={ud.currentStreak}  suffix="d" Icon={Flame} color={T.orange} />
          </div>
        </div>

        {/* ══════════ MAIN 2-COL LAYOUT ══════════ */}
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">

            {/* ──── LEFT COLUMN ──── */}
            <div className="space-y-5">

              {/* Learning Hub (tabbed) */}
              <Card>
                {/* Tab bar */}
                <div className="flex items-center gap-0 mb-5 pb-px overflow-x-auto" style={{ borderBottom: `1px solid ${T.border}` }}>
                  {tabDefs.map(({ key, Icon, label }) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className="relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold transition-colors whitespace-nowrap"
                      style={{ color: activeTab === key ? T.green : T.textMuted }}
                    >
                      <Icon size={14} /> {label}
                      {activeTab === key && (
                        <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: T.green }} />
                      )}
                    </button>
                  ))}
                  <Link to="/rooms" className="ml-auto flex items-center gap-1 text-xs font-semibold whitespace-nowrap px-3" style={{ color: T.cyan }}>
                    View All <ChevronRight size={13} />
                  </Link>
                </div>

                {/* Tab: Current */}
                {activeTab === "current" && (
                  <div className="space-y-3">
                    <h2 className="flex items-center gap-2 text-sm font-bold text-white">
                      <Activity size={15} style={{ color: T.cyan }} /> Active Missions
                    </h2>
                    {currentRooms.length > 0 ? currentRooms.map(room => {
                      const dm = getDifficultyMeta(room.difficulty)
                      return (
                        <div key={room.id} className="rounded-xl p-4 transition-all hover:border-opacity-50"
                          style={{ background: T.surfaceAlt, border: `1px solid ${T.border}` }}>
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: T.cyan }}>Active Mission</span>
                              <h3 className="text-sm font-bold text-white mt-1">{room.title}</h3>
                            </div>
                            <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ color: dm.color, background: dm.bg, border: `1px solid ${dm.border}` }}>
                              {room.difficulty}
                            </span>
                          </div>
                          <div className="mb-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span style={{ color: T.textMuted }}>Progress</span>
                              <span style={{ color: T.cyan }} className="font-semibold">{room.progress}%</span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                              <div className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${room.progress}%`, background: `linear-gradient(90deg, ${T.cyan}, #0099CC)`, boxShadow: `0 0 8px rgba(0,242,255,0.2)` }} />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <Link to={`/rooms/${room.id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:brightness-110" style={{ background: 'linear-gradient(135deg, #00D4FF, #0099CC)', color: '#0a1128' }}>
                              <Play size={13} /> {room.progress > 0 ? "Resume" : "Start"}
                            </Link>
                            <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: T.amber }}>
                              <Trophy size={12} /> {room.points} XP
                            </span>
                          </div>
                        </div>
                      )
                    }) : completedRooms.length > 0 ? (
                      <div className="text-center py-8">
                        <Trophy size={36} style={{ color: T.neonGreen }} className="mx-auto mb-3" />
                        <h3 className="text-base font-bold text-white mb-1">All caught up!</h3>
                        <p className="text-sm text-slate-400 mb-4">You've completed {completedRooms.length} room{completedRooms.length !== 1 ? "s" : ""}.</p>
                        <Link to="/rooms" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:brightness-110" style={{ background: 'linear-gradient(135deg, #00D4FF, #0099CC)', color: '#0a1128' }}><Target size={14} /> Browse Rooms</Link>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Target size={36} style={{ color: T.textMuted }} className="mx-auto mb-3" />
                        <h3 className="text-base font-bold text-white mb-1">Start Your First Mission</h3>
                        <p className="text-sm text-slate-400 mb-4">Join a room and begin your hacking journey.</p>
                        <Link to="/rooms" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:brightness-110" style={{ background: 'linear-gradient(135deg, #00D4FF, #0099CC)', color: '#0a1128' }}><Play size={14} /> Browse Rooms</Link>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: Saved */}
                {activeTab === "bookmarks" && (
                  <div className="space-y-3">
                    <h2 className="flex items-center gap-2 text-sm font-bold text-white">
                      <Bookmark size={15} style={{ color: T.purple }} /> Saved Items
                    </h2>
                    {bookmarkedRooms.length === 0 && bookmarkedLabs.length === 0 ? (
                      <div className="text-center py-8">
                        <Bookmark size={36} style={{ color: T.textMuted }} className="mx-auto mb-3" />
                        <h3 className="text-base font-bold text-white mb-1">No Saved Items</h3>
                        <p className="text-sm text-slate-400 mb-4">Bookmark rooms and labs for quick access.</p>
                        <Link to="/rooms" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:brightness-110" style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)', color: '#fff' }}><Play size={14} /> Browse Rooms</Link>
                      </div>
                    ) : (
                      <>
                        {bookmarkedRooms.map(room => {
                          const dm = getDifficultyMeta(room.difficulty)
                          return (
                            <div key={room.id} className="flex items-center gap-3 p-3 rounded-xl transition-all"
                              style={{ background: T.surfaceAlt, border: `1px solid ${T.border}` }}>
                              <span className="text-lg">🎯</span>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-semibold text-white truncate block">{room.title}</span>
                                <span className="text-xs" style={{ color: T.textMuted }}>{room.category}</span>
                              </div>
                              <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ color: dm.color, background: dm.bg, border: `1px solid ${dm.border}` }}>{room.difficulty}</span>
                              <Link to={`/rooms/${room.slug || room.id}`} className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold transition-all hover:brightness-110" style={{ background: '#88E636', color: '#0a1128' }}>Start</Link>
                            </div>
                          )
                        })}
                        {bookmarkedLabs.map(lab => {
                          const dm = getDifficultyMeta(lab.difficulty)
                          return (
                            <div key={lab.id} className="flex items-center gap-3 p-3 rounded-xl transition-all"
                              style={{ background: T.surfaceAlt, border: `1px solid ${T.border}` }}>
                              <span className="text-lg">🧪</span>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-semibold text-white truncate block">{lab.title}</span>
                                <span className="text-xs" style={{ color: T.textMuted }}>{lab.category}</span>
                              </div>
                              <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ color: dm.color, background: dm.bg, border: `1px solid ${dm.border}` }}>{lab.difficulty}</span>
                              <Link to={`/labs/${lab.slug || lab.id}`} className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold transition-all hover:brightness-110" style={{ background: '#88E636', color: '#0a1128' }}>Start</Link>
                            </div>
                          )
                        })}
                      </>
                    )}
                  </div>
                )}

                {/* Tab: Completed */}
                {activeTab === "completed" && (
                  <div className="space-y-3">
                    <h2 className="flex items-center gap-2 text-sm font-bold text-white">
                      <CheckCircle2 size={15} className="text-emerald-400" /> Completed Rooms
                    </h2>
                    {completedRooms.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle2 size={36} style={{ color: T.textMuted }} className="mx-auto mb-3" />
                        <h3 className="text-base font-bold text-white mb-1">No Completed Rooms Yet</h3>
                        <p className="text-sm text-slate-400 mb-4">Finish a room to see it here.</p>
                        <Link to="/rooms" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:brightness-110" style={{ background: 'linear-gradient(135deg, #00D4FF, #0099CC)', color: '#0a1128' }}><Play size={14} /> Browse Rooms</Link>
                      </div>
                    ) : completedRooms.map(room => {
                      const dm = getDifficultyMeta(room.difficulty)
                      return (
                        <div key={room.id} className="rounded-xl p-4 transition-all"
                          style={{ background: T.surfaceAlt, border: `1px solid rgba(16,185,129,0.12)` }}>
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                              <h3 className="text-sm font-bold text-white">{room.title}</h3>
                            </div>
                            <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ color: dm.color, background: dm.bg, border: `1px solid ${dm.border}` }}>
                              {room.difficulty}
                            </span>
                          </div>
                          <div className="mb-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span style={{ color: T.textMuted }}>Final Score</span>
                              <span className="font-semibold text-emerald-400">{room.finalScore}%</span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${room.finalScore}%`, boxShadow: "0 0 8px rgba(16,185,129,0.3)" }} />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                              <CheckCircle2 size={12} /> Completed{room.completedAt ? ` · ${new Date(room.completedAt).toLocaleDateString()}` : ""}
                            </span>
                            <div className="flex items-center gap-2">
                              <Link to={`/rooms/${room.id}`} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all" style={{ background: 'rgba(255,255,255,0.04)', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.1)', fontSize: 11 }}>
                                <Eye size={12} /> Review
                              </Link>
                              <span className="flex items-center gap-1 text-xs font-bold" style={{ color: T.amber }}>
                                <Trophy size={12} /> {room.points} XP
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </Card>

              {/* Just Released */}
              <Card>
                <SectionHeader icon={<TrendingUp size={15} style={{ color: T.cyan }} />} title="Just Released" actionTo="/rooms" />
                {newRooms.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {newRooms.slice(0, 4).map(room => {
                      const dm = getDifficultyMeta(room.difficulty)
                      return (
                        <Link to={`/rooms/${room.slug || room._id}`} key={room._id || room.id}
                          className="group rounded-xl p-4 transition-all duration-300 hover:-translate-y-0.5"
                          style={{ background: T.surfaceAlt, border: `1px solid ${T.border}` }}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-lg">{room.icon || "🎯"}</span>
                            <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ color: dm.color, background: dm.bg, border: `1px solid ${dm.border}` }}>
                              {room.difficulty}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1 mb-2">{room.title}</h3>
                          <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: T.amber }}>
                            <Trophy size={11} /> {room.points || 500} XP
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-slate-400 mb-3">No new rooms yet — check back soon!</p>
                    <Link to="/rooms" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all" style={{ background: 'rgba(255,255,255,0.04)', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.1)' }}>Browse All</Link>
                  </div>
                )}
              </Card>

              {/* This Week Stats */}
              <Card>
                <SectionHeader icon={<Activity size={15} style={{ color: T.purple }} />} title="This Week" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Labs Done",   val: weeklyStats?.labsCompleted || 0, Icon: Terminal,    color: T.purple },
                    { label: "XP Earned",   val: weeklyStats?.pointsEarned || 0,  Icon: Zap,         color: T.amber  },
                    { label: "Time Spent",  val: weeklyStats?.timeSpent || "0h",  Icon: Clock,       color: T.cyan,   isStr: true },
                    { label: "Rank Change", val: weeklyStats?.rankChange || 0,    Icon: TrendingUp,  color: (weeklyStats?.rankChange || 0) >= 0 ? T.neonGreen : T.pink, prefix: (weeklyStats?.rankChange || 0) >= 0 ? "↑" : "↓" },
                  ].map(({ label, val, Icon, color, isStr, prefix }) => (
                    <div key={label} className="rounded-xl p-4 text-center" style={{ background: `${color}08`, border: `1px solid ${color}18` }}>
                      <Icon size={16} style={{ color }} className="mx-auto mb-1" />
                      <span className="block text-lg font-extrabold" style={{ color }}>
                        {prefix}{isStr ? val : <AnimatedCounter target={val} />}
                      </span>
                      <span className="text-xs block mt-0.5" style={{ color: T.textMuted }}>{label}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* ──── RIGHT SIDEBAR ──── */}
            <div className="space-y-5">

              {/* Streak Ring */}
              <Card glow={ud.currentStreak > 0 ? T.orange : undefined}>
                <SectionHeader icon={<Flame size={15} style={{ color: T.orange }} />} title="Daily Streak" />
                {ud.currentStreak > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold mb-2"
                    style={{ background: "rgba(255,107,53,0.12)", color: T.orange }}>🔥 Active</span>
                )}
                <StreakRing streak={ud.currentStreak} best={ud.longestStreak} />
                <p className="text-center text-xs text-slate-400 mb-2">
                  Best: <strong style={{ color: T.amber }}>{ud.longestStreak}d</strong>
                </p>
                <p className="text-center text-xs" style={{ color: T.textMuted }}>
                  {ud.currentStreak === 0
                    ? "Complete a room or lab to start your streak!"
                    : ud.currentStreak < 7
                    ? `${7 - ud.currentStreak} more days to earn 7-day badge 🏅`
                    : ud.currentStreak < 30
                    ? `${30 - ud.currentStreak} days until 30-day badge 🏆`
                    : "Legendary streak! You're on fire! 🔥"}
                </p>
              </Card>

              {/* Skill Matrix */}
              <Card>
                <SectionHeader icon={<Radar size={15} style={{ color: T.purple }} />} title="Skill Matrix" />
                <div className="space-y-1">
                  {skills.map(s => <SkillBar key={s.name} {...s} />)}
                </div>
                <p className="text-[11px] mt-3" style={{ color: T.textMuted }}>Skills grow as you complete rooms & labs</p>
              </Card>

              {/* Weekly Missions */}
              <Card>
                <SectionHeader icon={<Target size={15} style={{ color: T.cyan }} />} title="Weekly Missions" />
                <div className="space-y-2">
                  {weeklyMissions.map(m => <MissionPill key={m.id} {...m} />)}
                </div>
              </Card>

              {/* Mini Leaderboard */}
              <Card>
                <SectionHeader icon={<Trophy size={15} style={{ color: T.amber }} />} title="Top Hackers" actionTo="/leaderboard" actionLabel="Full Board" />
                <div className="space-y-0.5">
                  {leaders.length > 0 ? leaders.map(l => (
                    <LeaderRow key={l.rank} {...l} isCurrentUser={l.username === ud.name} />
                  )) : (
                    <p className="text-sm text-center py-4" style={{ color: T.textMuted }}>Loading leaderboard...</p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
})

Dashboard.displayName = "Dashboard"
export default Dashboard