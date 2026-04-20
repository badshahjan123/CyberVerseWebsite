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
import "./Dashboard.css"
import BadgeIcon from "../components/achievements/BadgeIcon"

/* ──────────── Design Tokens ──────────── */
const T = {
  bg:          "#081224",
  surface:     "rgba(13,22,35,0.95)",
  surfaceAlt:  "rgba(11,18,30,0.95)",
  surfaceSolid:"#0d1623",
  border:      "rgba(255,255,255,0.08)",
  borderHover: "rgba(0,209,255,0.3)",
  text:        "#E2E8F0",
  textMuted:   "#64748B",
  cyan:        "#00D1FF",
  green:       "#88E636",
  purple:      "#A855F7",
  amber:       "#FFB800",
  orange:      "#FF6B00",
  pink:        "#FF3D71",
  neonGreen:   "#39FF14",
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
const Card = ({ children, className = "", style = {} }) => (
  <div
    className={`rounded-xl p-3.5 transition-all duration-300 ${className}`}
    style={{
      background: 'rgba(11,18,32,0.70)',
      border: '1px solid rgba(255,255,255,0.1)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      boxShadow: '0 2px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04)',
      ...style,
    }}
  >
    {children}
  </div>
)

/* ── Section header ── */
const SectionHeader = ({ icon, title, actionTo, actionLabel }) => (
  <div className="flex items-center justify-between mb-4">
    <h3 className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase" style={{ color: '#CBD5E1' }}>
      {icon} {title}
    </h3>
    {actionTo && (
      <Link to={actionTo} className="flex items-center gap-1 text-xs font-semibold transition-colors" style={{ color: T.cyan }}>
        {actionLabel || "View All"} <ChevronRight size={13} />
      </Link>
    )}
  </div>
)

/* ── Streak Ring ── */
const StreakRing = memo(({ streak, best }) => {
  const maxStreak = Math.max(best || 30, 30)
  const pct = Math.min((streak / maxStreak) * 100, 100)
  const r = 46, c = 2 * Math.PI * r
  const dash = (pct / 100) * c

  return (
    <div className="flex flex-col items-center py-2">
      <svg width="100" height="100" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
        <circle
          cx="55" cy="55" r={r} fill="none"
          stroke={streak > 0 ? T.orange : "#1E293B"}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          strokeDashoffset={c * 0.25}
          style={{ transition: "stroke-dasharray 1.2s ease" }}
        />
        <text x="55" y="50" textAnchor="middle" fill={streak > 0 ? T.orange : "#475569"} fontSize="28" fontWeight="900">{streak}</text>
        <text x="55" y="68" textAnchor="middle" fill="#64748B" fontSize="10">DAYS</text>
      </svg>
    </div>
  )
})
StreakRing.displayName = "StreakRing"

const LEVEL_THRESHOLDS = [0, 300, 700, 1200, 2000, 3000, 4500, 6500, 9000, 12000, 16000]

// Calculate level from points — same as backend
const calcLevel = (points) => {
  let level = 1
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (points >= LEVEL_THRESHOLDS[i]) level = i + 1
    else break
  }
  return level
}

const XPBar = memo(({ points }) => {
  const level            = calcLevel(points)
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0
  const nextThreshold    = LEVEL_THRESHOLDS[level]     ?? null
  const isMaxLevel       = nextThreshold === null || nextThreshold === undefined
  const rangeSize        = isMaxLevel ? 1 : nextThreshold - currentThreshold
  const progress         = isMaxLevel ? 100 : Math.min(100, Math.max(0, ((points - currentThreshold) / rangeSize) * 100))
  const pointsToNext     = isMaxLevel ? 0 : Math.max(0, nextThreshold - points)
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-1.5 text-xs font-bold" style={{ color: T.green }}>
          <Zap size={12} /> Level {level} — {getLevelName(level)}
        </span>
        <span className="text-xs font-bold" style={{ color: '#ffffff' }}>{(points || 0).toLocaleString()} XP</span>
      </div>
      <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${T.green}, #a3e635)`, boxShadow: `0 0 10px rgba(136,230,54,0.5)` }} />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-xs font-medium" style={{ color: T.textMuted }}>
          {isMaxLevel ? 'MAX LEVEL' : `${pointsToNext.toLocaleString()} XP to Level ${level + 1}`}
        </span>
        <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>{getLevelName(level)}</span>
      </div>
    </div>
  )
})
XPBar.displayName = "XPBar"

const Dashboard = memo(() => {
  const { user, refreshUser } = useApp()
  const { userStats, refreshUserStats, leaderboardData, requestLeaderboardUpdate } = useRealtime()
  const { getBookmarksByType } = useBookmarks()

  const [miniLeaderboard, setMiniLeaderboard] = useState([])
  const [newRooms, setNewRooms] = useState([])
  const [earnedBadges, setEarnedBadges] = useState([])

  useEffect(() => {
    if (user && !userStats.points) refreshUserStats()
    requestLeaderboardUpdate()
    apiCall("/rooms?limit=4&sort=createdAt").then(res => setNewRooms(res.data || [])).catch(() => {})
    apiCall("/users/leaderboard?limit=5").then(res => setMiniLeaderboard(res.leaderboard || [])).catch(() => {})
    apiCall("/user/badges").then(res => setEarnedBadges((res.badges || []).filter(b => b.earned).slice(0, 5))).catch(() => {})
    const poll = setInterval(() => { refreshUserStats(); fetchActiveRooms(); }, 5000)
    return () => clearInterval(poll)
  }, [user])

  useEffect(() => {
    const onComplete = async () => {
      refreshUserStats()
      if (typeof refreshUser === 'function') await refreshUser()
      fetchActiveRooms()
      apiCall("/user/badges").then(res => setEarnedBadges((res.badges || []).filter(b => b.earned).slice(0, 5))).catch(() => {})
    }
    window.addEventListener('roomCompleted', onComplete)
    window.addEventListener('labCompleted', onComplete)
    window.addEventListener('badge:earned', onComplete)
    return () => {
      window.removeEventListener('roomCompleted', onComplete)
      window.removeEventListener('labCompleted', onComplete)
      window.removeEventListener('badge:earned', onComplete)
    }
  }, [refreshUserStats, refreshUser])

  const ud = useMemo(() => {
    // Always prefer userStats (realtime) over user (stale auth object)
    const points          = userStats?.totalXP  ?? userStats?.points  ?? user?.points            ?? 0
    const level           = userStats?.level                           ?? user?.level             ?? 1
    const rank            = userStats?.rank                            ?? user?.rank              ?? 999
    const completedLabs   = userStats?.completedLabs                   ?? user?.completedLabs     ?? 0
    const completedRooms  = userStats?.completedRooms                  ?? user?.completedRooms    ?? 0
    const currentStreak   = userStats?.streak   ?? userStats?.currentStreak ?? user?.currentStreak ?? 0
    const longestStreak   = userStats?.longestStreak                   ?? user?.longestStreak     ?? 0
    const pointsToNext    = userStats?.pointsToNextLevel               ?? user?.pointsToNextLevel ?? 1000
    return {
      name:              userStats?.name     || user?.name              || "Hacker",
      level, points, rank, completedLabs, completedRooms,
      currentStreak, longestStreak,
      pointsToNextLevel: pointsToNext,
      isPremium:         userStats?.isPremium ?? user?.isPremium ?? false,
      avatar:            user?.avatar || null,
    }
  }, [userStats, user])

  const [activeRooms, setActiveRooms] = useState([])

  const fetchActiveRooms = useCallback(async () => {
    try {
      const res = await apiCall('/room-progress/active')
      setActiveRooms(res.rooms || [])
    } catch { setActiveRooms([]) }
  }, [])

  useEffect(() => { fetchActiveRooms() }, [fetchActiveRooms])

  const skills = useMemo(() => {
    const colorMap = {
      "Web Exploitation":  "#00D1FF",
      "Network Security":  "#A855F7",
      "Priv. Escalation":  "#FFB800",
      "Forensics":         "#FF6B00",
      "OSINT":             "#39FF14",
      "Reverse Engineering":"#FF3D71",
      "Cryptography":      "#88E636",
    }
    if (userStats?.skillMatrix?.length > 0) {
      return userStats.skillMatrix.map(s => ({
        name:  s.category || s.name,
        pct:   Math.min(s.progress || s.percentage || 0, 100),
        color: colorMap[s.category || s.name] || "#94A3B8",
      }))
    }
    return [
      { name: "Web Exploitation", pct: Math.min(ud.completedRooms * 8, 100), color: "#00D1FF" },
      { name: "Network Security", pct: Math.min(ud.completedLabs  * 10, 100), color: "#A855F7" },
      { name: "Priv. Escalation", pct: Math.min(ud.completedRooms * 5, 100), color: "#FFB800" },
      { name: "Forensics",        pct: Math.min(ud.completedLabs  * 7, 100), color: "#FF6B00" },
    ]
  }, [userStats?.skillMatrix, ud.completedRooms, ud.completedLabs])

  const weeklyMissions = useMemo(() => [
    { id: 1, title: "Complete 3 Rooms",      current: Math.min(ud.completedRooms, 3), target: 3, completed: ud.completedRooms >= 3 },
    { id: 2, title: "Maintain 7-day streak", current: Math.min(ud.currentStreak, 7),  target: 7, completed: ud.currentStreak  >= 7 },
    { id: 3, title: "Earn 500 XP",           current: Math.min(ud.points, 500),        target: 500, completed: ud.points >= 500 },
  ], [ud])

  const leaders = (leaderboardData?.length ? leaderboardData : miniLeaderboard).slice(0, 5)

  return (
    <ProtectedRoute>
      <div className="min-h-screen text-white relative overflow-x-hidden" style={{
        background: `linear-gradient(to right, #081224 0%, #0b1f3a 45%, #0b1f3a 72%, rgba(255,106,0,0.08) 100%)`
      }}>
        {/* dot grid — same as home */}
        <div className="absolute inset-0 z-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        {/* dark overlay — reduced so right side stays visible */}
        <div className="absolute inset-0 z-0 pointer-events-none" style={{ background: 'rgba(0,0,0,0.18)' }} />

        <div className="relative z-10 pt-6 pb-12">
          <div className="max-w-[1300px] mx-auto px-4">
            
            {/* COMPACT HUD */}
            <div className="hud-container p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-6 border-l-[3px]"
              style={{ borderColor: 'rgba(0,209,255,0.4)', background: 'rgba(11,18,32,0.70)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderLeft: '3px solid rgba(0,209,255,0.4)', borderRadius: '20px', boxShadow: '0 2px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04)' }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/20 flex-shrink-0"
                     style={{ boxShadow: '0 0 12px rgba(0,209,255,0.2)' }}>
                  <img
                    src={
                      ud.avatar
                        ? ud.avatar.startsWith('http')
                          ? ud.avatar
                          : `http://localhost:5000${ud.avatar}?t=${Date.now()}`
                        : `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(ud.name)}`
                    }
                    alt={ud.name}
                    className="w-full h-full object-cover"
                    onError={e => { e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(ud.name)}` }}
                  />
                </div>
                <div>
                  <h1 className="text-xl font-black text-white uppercase db-orbitron tracking-tighter">{ud.name}</h1>
                  <div className="flex gap-2 mt-0.5">
                    <span className="text-[9px] font-black text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded border border-cyan-400/20">AGENT ACTIVE</span>
                    <span className="text-[9px] font-black text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded border border-orange-400/20">{getLevelName(ud.level)}</span>
                  </div>
                </div>
              </div>

              <div className="hidden lg:flex items-center gap-8">
                {[
                  { l: "XP", v: ud.points, c: T.amber, i: Zap },
                  { l: "ROOMS", v: ud.completedRooms, c: T.cyan, i: Target },
                  { l: "LABS", v: ud.completedLabs, c: T.purple, i: Terminal },
                  { l: "STREAK", v: ud.currentStreak, c: T.orange, i: Flame },
                ].map(s => (
                  <div key={s.l} className="flex flex-col items-center">
                    <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest mb-1">{s.l}</span>
                    <div className="flex items-center gap-1.5">
                      <s.i size={12} style={{ color: s.c }} />
                      <span className="text-sm font-black text-white db-orbitron"><AnimatedCounter target={s.v} /></span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <Link to="/labs" className="db-cta-btn px-4 py-2 rounded-lg text-[11px]" style={{ background: `linear-gradient(135deg, ${T.orange}, #cc4400)` }}>LAUNCH PORTAL</Link>
                <Link to="/rooms" className="db-cta-btn px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[11px]">MISSIONS</Link>
              </div>
            </div>

            <div className="mb-8 px-1">
               <XPBar points={ud.points} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Total XP",      val: ud.points,         color: T.amber,  Icon: Zap },
                { label: "Rooms Done",    val: ud.completedRooms, color: T.cyan,   Icon: Target },
                { label: "Labs Done",     val: ud.completedLabs,  color: T.purple, Icon: Terminal },
                { label: "Streak",        val: ud.currentStreak,  color: T.orange, Icon: Flame },
              ].map(({ label, val, color, Icon }) => (
                <div key={label} className="flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{ background: 'rgba(11,18,32,0.70)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(16px)', boxShadow: '0 2px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}18`, border: `1px solid ${color}35` }}>
                    <Icon size={14} style={{ color }} />
                  </div>
                  <div>
                    <div className="text-sm font-extrabold" style={{ color: '#ffffff' }}>
                      <AnimatedCounter target={typeof val === 'number' ? val : 0} />
                    </div>
                    <div className="text-[10px] font-medium uppercase tracking-tighter" style={{ color: T.textMuted }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <Card>
                     <SectionHeader icon={<Activity size={14} style={{ color: T.cyan }} />} title="Active Operations" />
                     <div className="space-y-2 mt-2">
                       {activeRooms.slice(0, 2).map(room => (
                         <div key={room.id} className="p-3 rounded-lg" style={{ background: 'rgba(3,7,15,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <div className="flex justify-between items-center mb-2">
                               <span className="text-xs font-bold text-white truncate flex-1 mr-2">{room.title}</span>
                               <span className="text-xs font-bold" style={{ color: T.cyan }}>{room.progress}%</span>
                            </div>
                            <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.08)' }}>
                              <div className="h-full rounded-full" style={{ width: room.progress+'%', background: `linear-gradient(90deg,${T.cyan},#0077aa)`, boxShadow: `0 0 8px rgba(0,209,255,0.4)` }} />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-medium" style={{ color: T.textMuted }}>
                                {room.totalTasks > 0 ? `${room.completedCount}/${room.totalTasks} tasks` : 'In progress'}
                              </span>
                              <Link
                                to={`/rooms/${room.id}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:brightness-110"
                                style={{ background: `linear-gradient(135deg, ${T.orange}, #cc4400)`, color: '#fff', boxShadow: `0 0 12px rgba(255,107,0,0.3)`, textShadow: '0 0 6px rgba(0,0,0,0.4)' }}
                              >
                                <Play size={11} /> {room.progress > 0 ? 'Resume' : 'Start'}
                              </Link>
                            </div>
                         </div>
                       ))}
                       {activeRooms.length === 0 && (
                         <div className="text-center py-6">
                           <p className="text-xs text-slate-400 mb-3">No active missions.</p>
                           <Link
                             to="/rooms"
                             className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-bold transition-all hover:brightness-110"
                             style={{ background: `linear-gradient(135deg, ${T.orange}, #cc4400)`, color: '#fff', boxShadow: `0 0 12px rgba(255,107,0,0.25)`, textShadow: '0 0 6px rgba(0,0,0,0.4)' }}
                           >
                             <Play size={11} /> Browse Rooms
                           </Link>
                         </div>
                       )}
                     </div>
                   </Card>
                   <Card>
                     <SectionHeader icon={<Award size={14} style={{ color: T.purple }} />} title="Recent Medals" actionTo="/badges" actionLabel="View All" />
                     {earnedBadges.length > 0 ? (
                       <div className="flex flex-wrap gap-3 py-1 justify-center">
                         {earnedBadges.map((badge) => (
                           <div key={badge.name} className="flex flex-col items-center gap-1.5" title={badge.name}>
                             <BadgeIcon
                               name={badge.name}
                               iconName={badge.icon}
                               difficulty={badge.difficulty || 'common'}
                               earned={true}
                               size={48}
                             />
                             <span className="text-[9px] font-bold text-center leading-tight w-12 truncate" style={{ color: '#94A3B8' }}>
                               {badge.name}
                             </span>
                           </div>
                         ))}
                       </div>
                     ) : (
                       <div className="flex flex-col items-center py-3 gap-2">
                         <div className="flex gap-2 justify-center">
                           {[1,2,3,4,5].map(i => (
                             <BadgeIcon key={i} name="" iconName="" difficulty="common" earned={false} size={40} />
                           ))}
                         </div>
                         <p className="text-[10px] mt-1" style={{ color: T.textMuted }}>Complete rooms to earn medals</p>
                       </div>
                     )}
                   </Card>
                </div>

                <Card>
                   <SectionHeader icon={<TrendingUp size={14} style={{ color: T.cyan }} />} title="Intel Feed" actionTo="/rooms" />
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                     {newRooms.slice(0, 4).map(room => (
                       <Link to={`/rooms/${room.slug || room._id}`} key={room.id}
                         className="p-3 rounded-lg transition-all"
                         style={{ background: 'rgba(3,7,15,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}
                         onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,209,255,0.3)'}
                         onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}>
                          <span className="text-xs font-bold text-white line-clamp-1 block">{room.title}</span>
                          <span className="text-[10px] font-semibold block mt-1" style={{ color: T.textMuted }}>{room.difficulty}</span>
                       </Link>
                     ))}
                   </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <Card>
                      <SectionHeader icon={<Target size={14} style={{ color: T.cyan }} />} title="Weekly Directives" />
                      <div className="space-y-2 mt-2">
                        {weeklyMissions.map(m => (
                          <div key={m.id} className="flex items-center justify-between text-xs p-2.5 rounded-lg" style={{ background: 'rgba(3,7,15,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
                             <span className="font-semibold" style={{ color: '#ffffff' }}>{m.title}</span>
                             <span className="font-bold" style={{ color: m.completed ? T.green : T.textMuted }}>{m.current}/{m.target}</span>
                          </div>
                        ))}
                      </div>
                   </Card>
                   <Card>
                      <SectionHeader icon={<BarChart3 size={14} style={{ color: T.purple }} />} title="Skill Assessment" />
                      <div className="space-y-3 mt-2">
                        {skills.map(s => (
                          <div key={s.name} className="flex items-center gap-3">
                             <span className="font-semibold" style={{ color: '#ffffff' }}>{s.name}</span>
                             <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                               <div className="h-full rounded-full" style={{ width: s.pct+'%', background: `linear-gradient(90deg,${s.color},${s.color}99)`, boxShadow: `0 0 8px ${s.color}50` }} />
                             </div>
                             <span className="text-xs font-bold w-8 text-right" style={{ color: s.color }}>{s.pct}%</span>
                          </div>
                        ))}
                      </div>
                   </Card>
                </div>
              </div>

              <div className="space-y-6">
                <Card className="text-center">
                   <SectionHeader icon={<Flame size={14} style={{ color: T.orange }} />} title="Streak Telemetry" />
                   <div className="transform scale-90"><StreakRing streak={ud.currentStreak} best={ud.longestStreak} /></div>
                   <div className="flex justify-between items-center px-4 -mt-2">
                      <div className="text-center"><span className="text-[9px] text-white/60 block tracking-widest uppercase">Current</span><span className="text-lg font-black text-orange-400 db-orbitron">{ud.currentStreak}</span></div>
                      <div className="text-center"><span className="text-[9px] text-white/60 block tracking-widest uppercase">Best</span><span className="text-lg font-black text-amber-400 db-orbitron">{ud.longestStreak}</span></div>
                   </div>
                </Card>
                <Card>
                   <SectionHeader icon={<Trophy size={14} style={{ color: T.amber }} />} title="Top Rankings" actionTo="/leaderboard" />
                   <div className="space-y-1">
                     {leaders.map(l => (
                       <div key={l.rank} className="flex items-center justify-between p-2.5 rounded-lg transition-all text-xs"
                         style={{ background: l.username === ud.name ? 'rgba(0,209,255,0.06)' : 'transparent', border: l.username === ud.name ? '1px solid rgba(0,209,255,0.15)' : '1px solid transparent' }}
                         onMouseEnter={e => { if(l.username !== ud.name) e.currentTarget.style.background='rgba(255,255,255,0.04)' }}
                         onMouseLeave={e => { if(l.username !== ud.name) e.currentTarget.style.background='transparent' }}>
                          <div className="flex items-center gap-2">
                            <span className="font-bold w-5" style={{ color: l.rank === 1 ? T.amber : T.textMuted }}>#{l.rank}</span>
                            <span className="font-semibold" style={{ color: l.username === ud.name ? T.cyan : '#E2E8F0' }}>{l.username}</span>
                          </div>
                          <span className="font-bold" style={{ color: T.amber }}>{(l.points||0).toLocaleString()}</span>
                       </div>
                     ))}
                   </div>
                </Card>
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