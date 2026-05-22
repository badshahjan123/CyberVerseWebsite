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
  Terminal, Crown, Sword, Cpu, BarChart3, Users, Server, Globe, Key, AlertTriangle
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

const LEVEL_NAMES = [
  "Script Kiddie", "Cyber Apprentice", "Code Breaker", "Net Stalker",
  "Exploit Dev", "Zero-Day Hunter", "Red Teamer", "Cyber Phantom",
  "Ghost Operator", "Elite Hacker", "Legend"
]

const getLevelName = (level) => LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)] || "Legend"

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

/* ── Card Shell ── */
const Card = ({ children, className = "", style = {} }) => (
  <div
    className={`rounded-xl p-5 transition-all duration-300 relative overflow-hidden corner-brackets ${className}`}
    style={{
      background: 'rgba(8,14,25,0.85)',
      border: '1px solid rgba(0,209,255,0.12)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      boxShadow: '0 10px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)',
      ...style,
    }}
  >
    <div className="absolute inset-0 bg-linear-scanlines pointer-events-none opacity-5" />
    {children}
  </div>
)

/* ── Section Header ── */
const SectionHeader = ({ icon, title, actionTo, actionLabel }) => (
  <div className="flex items-center justify-between mb-4 border-b border-white/[0.04] pb-2 relative z-10">
    <h3 className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase font-mono" style={{ color: '#00D1FF' }}>
      {icon} {title}
    </h3>
    {actionTo && (
      <Link to={actionTo} className="flex items-center gap-1 text-[10px] font-mono tracking-wider uppercase text-slate-500 hover:text-cyan-400 transition-colors">
        {actionLabel || "View All"} <ChevronRight size={12} />
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
    <div className="flex flex-col items-center py-2 relative">
      <svg width="100" height="100" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="6" />
        <circle
          cx="55" cy="55" r={r} fill="none"
          stroke={streak > 0 ? T.orange : "#1E293B"}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          strokeDashoffset={c * 0.25}
          style={{ transition: "stroke-dasharray 1.2s ease" }}
        />
        <text x="55" y="52" textAnchor="middle" fill={streak > 0 ? T.orange : "#475569"} fontSize="26" fontWeight="900" fontFamily="monospace">{streak}</text>
        <text x="55" y="68" textAnchor="middle" fill="#64748B" fontSize="8" fontWeight="bold" letterSpacing="0.1em" fontFamily="monospace">DAYS</text>
      </svg>
    </div>
  )
})
StreakRing.displayName = "StreakRing"

const LEVEL_THRESHOLDS = [0, 300, 700, 1200, 2000, 3000, 4500, 6500, 9000, 12000, 16000]

// Calculate level from points
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
    <div className="w-full font-mono">
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider" style={{ color: T.cyan }}>
          <Zap size={12} className="text-cyan-400" /> Level {level} — {getLevelName(level)}
        </span>
        <span className="text-xs font-black" style={{ color: '#ffffff' }}>{(points || 0).toLocaleString()} XP</span>
      </div>
      <div className="w-full h-2.5 rounded-full overflow-hidden bg-white/[0.04]">
        <div 
          className="h-full rounded-full transition-all duration-1000 segmented-progress-bar"
          style={{ width: `${progress}%` }} 
        />
      </div>
      <div className="flex justify-between mt-1.5 text-[9px] uppercase tracking-wider text-slate-500">
        <span>
          {isMaxLevel ? 'MAX LEVEL reached' : `${pointsToNext.toLocaleString()} XP to Level ${level + 1}`}
        </span>
        <span className="font-semibold text-slate-400">{getLevelName(level)}</span>
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

  // ── Realtime Mini Terminal Log Simulator ──
  const [terminalLines, setTerminalLines] = useState([
    "$ cyberverse-terminal v2.0 initialized.",
    "$ operator credentials validated.",
    "$ pipeline socket status: SECURE.",
  ])

  useEffect(() => {
    const logs = [
      "● container cluster replication healthy.",
      "✓ active sandboxes bound to NodePorts.",
      "● telemetry handshake completed with Kubernetes.",
      "★ Operator online counter synced.",
      "✓ certificate generation buffer cleared.",
      "● sandbox deploy queues parsed: 0 pending."
    ];

    const interval = setInterval(() => {
      const nextLog = logs[Math.floor(Math.random() * logs.length)];
      setTerminalLines(prev => [...prev.slice(-3), `$ ${nextLog}`]);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

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

  const dynamicTickerLogs = useMemo(() => {
    const list = leaderboardData?.length ? leaderboardData : [{ username: "ghost_sec" }, { username: "kernel_panic" }, { username: "rootx" }, { username: "cyph3r" }];
    const events = [
      "captured SQLi flag +250 XP",
      "deployed malware sandbox",
      "initialized K8s container sandbox",
      "earned certification",
      "escalated VM privileges +175 XP",
      "secured system matrix successfully",
    ];
    return Array.from({ length: 10 }).map((_, i) => {
      const player = list[i % list.length]?.username || "operator";
      const ev = events[i % events.length];
      return `${player} ${ev}`;
    });
  }, [leaderboardData]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen text-white relative overflow-x-hidden pb-12" style={{
        background: `linear-gradient(to right, #081224 0%, #0b1f3a 45%, #0b1f3a 72%, rgba(255,106,0,0.08) 100%)`
      }}>
        {/* Subtle dot grid overlay matching Labs page */}
        <div className="absolute inset-0 z-0 pointer-events-none"
          style={{ 
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', 
            backgroundSize: '60px 60px' 
          }} 
        />
        {/* Subtle dark overlay matching Labs page */}
        <div className="absolute inset-0 z-0 pointer-events-none" style={{ background: 'rgba(0,0,0,0.18)' }} />

        <div className="relative z-10 pt-6">
          <div className="max-w-[1300px] mx-auto px-4">
            
            {/* ══════════════════════════════════════════════
                OPERATOR COMMAND IDENTITY HUD
            ══════════════════════════════════════════════ */}
            <div className="hud-container p-6 mb-4 flex flex-col md:flex-row items-center justify-between gap-6 border-l-[3px] relative overflow-hidden"
              style={{ 
                borderColor: '#00D1FF', 
                background: 'linear-gradient(135deg, rgba(12,20,38,0.92) 0%, rgba(6,10,20,0.95) 100%)', 
                border: '1px solid rgba(0,209,255,0.15)', 
                borderLeft: '4px solid #00D1FF', 
                borderRadius: '16px', 
                boxShadow: '0 8px 32px rgba(0,209,255,0.06), inset 0 1px 0 rgba(255,255,255,0.03)' 
              }}
            >
              <div className="absolute inset-0 bg-linear-scanlines pointer-events-none opacity-[0.03]" />
              
              <div className="flex items-center gap-5 relative z-10">
                
                {/* Glowing Avatar */}
                <div className="relative w-16 h-16 rounded-xl border border-cyan-400/30 overflow-hidden shrink-0 flex items-center justify-center bg-[#070b16] shadow-[0_0_15px_rgba(0,209,255,0.15)]">
                  <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 to-transparent pointer-events-none" />
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
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-black text-white uppercase db-orbitron tracking-tight font-mono">{ud.name}</h1>
                    {ud.isPremium && <Crown className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1.5 font-mono text-[9px]">
                    <span className="flex items-center gap-1 text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20 font-black tracking-widest">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse mr-1" />
                      CLASSIFIED OPERATOR ACTIVE
                    </span>
                    <span className="text-[#88E636] bg-[#88E636]/10 px-2 py-0.5 rounded border border-[#88E636]/20 font-black tracking-widest">
                      {getLevelName(ud.level).toUpperCase()}
                    </span>
                  </div>
                </div>

              </div>

              {/* HUD Right Actions */}
              <div className="flex items-center gap-4 relative z-10 font-mono">
                <Link 
                  to="/labs" 
                  className="px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all hover:brightness-110 shadow-lg shadow-orange-500/10" 
                  style={{ background: `linear-gradient(135deg, ${T.orange}, #cc4400)`, border: '1px solid rgba(255,107,0,0.3)' }}
                >
                  Launch Sandbox
                </Link>
                <Link to="/rooms" className="px-6 py-3 rounded-lg bg-white/[0.02] border border-white/[0.08] text-[10px] font-black uppercase tracking-widest hover:bg-white/[0.05] transition-all">
                  Missions Control
                </Link>
              </div>

            </div>

            {/* ── Sleek Telemetry Ticker ── */}
            <div className="mb-6 py-2.5 px-4 rounded-lg bg-black/40 border border-white/[0.04] overflow-hidden flex items-center gap-4 font-mono text-[10px]">
              <span className="flex items-center gap-1.5 uppercase font-black text-cyan-400 shrink-0">
                <Activity size={12} className="animate-pulse" /> TELEMETRY FEED:
              </span>
              <div className="overflow-hidden flex-1 h-4 relative">
                <div className="dashboard-ticker-track">
                  {dynamicTickerLogs.map((item, index) => (
                    <span key={index} className="text-slate-400 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-cyan-400" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Level Progress Slider */}
            <div className="mb-8 px-1">
               <XPBar points={ud.points} />
            </div>

            {/* ══════════════════════════════════════════════
                STATISTICS INTERFACES (GLOW OVERLAYS)
            ══════════════════════════════════════════════ */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: "XP Assets",      val: ud.points,         color: T.amber,  Icon: Zap, chart: [10, 15, 8, 25, 20, 30] },
                { label: "Completed Rooms", val: ud.completedRooms, color: T.cyan,   Icon: Target, chart: [2, 5, 4, 8, 9, 12] },
                { label: "Active Sandboxes", val: ud.completedLabs,  color: T.purple, Icon: Terminal, chart: [5, 12, 10, 15, 18, 22] },
                { label: "Streak Log",      val: ud.currentStreak,  color: T.orange, Icon: Flame, chart: [1, 2, 3, 4, 6, 7] },
              ].map(({ label, val, color, Icon, chart }) => (
                <div key={label} className="flex items-center justify-between rounded-xl px-5 py-4 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden"
                  style={{ 
                    background: 'rgba(8,14,25,0.85)', 
                    border: '1px solid rgba(0,209,255,0.12)', 
                    backdropFilter: 'blur(16px)', 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.03)' 
                  }}
                >
                  <div className="flex items-center gap-3.5 relative z-10">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                      <Icon size={14} style={{ color }} />
                    </div>
                    <div>
                      <div className="text-base font-black font-mono text-white leading-none">
                        <AnimatedCounter target={typeof val === 'number' ? val : 0} />
                      </div>
                      <div className="text-[9px] font-black uppercase tracking-wider mt-1" style={{ color: T.textMuted }}>{label}</div>
                    </div>
                  </div>

                  {/* Micro Chart Path */}
                  <svg className="w-14 h-7 opacity-30 group-hover:opacity-100 transition-opacity" viewBox="0 0 100 30">
                    <path 
                      d={`M0 25 Q15 ${30 - chart[0]}, 30 ${30 - chart[1]} T60 ${30 - chart[3]} T90 ${30 - chart[5]}`} 
                      fill="none" 
                      stroke={color} 
                      strokeWidth="2.5" 
                    />
                  </svg>
                </div>
              ))}
            </div>

            {/* ══════════════════════════════════════════════
                MAIN COLUMNS (LEFT / RIGHT COMMAND PANELS)
            ══════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              {/* Left Column (Main Active operations) */}
              <div className="lg:col-span-3 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   
                   {/* Primary Active Operation Panel */}
                   <Card>
                     <SectionHeader icon={<Activity size={14} className="text-cyan-400" />} title="Operational Command Area" />
                     <div className="space-y-3 mt-2">
                       {activeRooms.slice(0, 1).map(room => (
                          <div key={room.id} className="p-4 rounded-xl relative overflow-hidden" style={{ background: 'rgba(4,6,12,0.8)', border: '1px solid rgba(0,209,255,0.15)' }}>
                            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-400/5 rounded-full blur-2xl pointer-events-none" />
                            
                            <div className="flex justify-between items-center mb-2.5">
                               <span className="text-xs font-black text-white truncate font-mono uppercase tracking-wide">{room.title}</span>
                               <span className="text-xs font-black text-cyan-400 font-mono">{room.progress}%</span>
                            </div>
                            
                            <div className="h-2 rounded-full overflow-hidden mb-4 bg-white/[0.04]">
                              <div className="h-full rounded-full segmented-progress-bar" style={{ width: room.progress+'%' }} />
                            </div>

                            {/* Sub sandbox detail logs */}
                            <div className="grid grid-cols-2 gap-4 p-3 bg-black/40 border border-white/[0.04] rounded-lg mb-4 font-mono text-[9px] text-slate-400">
                              <div className="flex flex-col gap-1">
                                <span className="text-slate-500 uppercase">OBJECTIVE TRACK</span>
                                <span className="text-white font-bold">{room.completedCount || 0} / {room.totalTasks || 3} COMPLETED</span>
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="text-slate-500 uppercase">ACTIVE TIMER</span>
                                <span className="text-orange-500 font-bold animate-pulse">01:42:12 REMAINING</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500">
                                {room.totalTasks > 0 ? `${room.completedCount}/${room.totalTasks} tasks finished` : 'Deploy active'}
                              </span>
                              <Link
                                to={`/rooms/${room.id}`}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all hover:brightness-110 font-mono"
                                style={{ background: `linear-gradient(135deg, ${T.orange}, #cc4400)`, color: '#fff', boxShadow: `0 0 12px rgba(255,107,0,0.3)` }}
                              >
                                <Play size={10} fill="white" /> Resume Target
                              </Link>
                            </div>
                          </div>
                       ))}
                       
                       {/* Tactical Empty State */}
                       {activeRooms.length === 0 && (
                          <div className="text-center py-8 font-mono border border-dashed border-white/[0.08] rounded-xl bg-black/20 p-5">
                            <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto mb-3 animate-pulse" />
                            <p className="text-xs text-white uppercase font-bold tracking-wider">No active operations detected</p>
                            <p className="text-[10px] text-slate-500 mt-1 max-w-[280px] mx-auto leading-normal">Your virtual pipelines are idle. Deploy a sandbox instance from course pathways to initialize telemetry streams.</p>
                            <Link
                              to="/rooms"
                              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all hover:brightness-110 mt-4"
                              style={{ background: `linear-gradient(135deg, ${T.orange}, #cc4400)`, color: '#fff', boxShadow: `0 0 12px rgba(255,107,0,0.2)` }}
                            >
                              <Play size={10} fill="white" /> Browse Mission Pathways
                            </Link>
                          </div>
                       )}
                     </div>
                   </Card>

                   {/* Recent Badges / Medals */}
                   <Card>
                     <SectionHeader icon={<Award size={14} className="text-purple-400" />} title="Recent Academic Medals" actionTo="/badges" actionLabel="View All" />
                     {earnedBadges.length > 0 ? (
                       <div className="flex flex-wrap gap-4 py-3 justify-center">
                         {earnedBadges.map((badge) => (
                           <div key={badge.name} className="flex flex-col items-center gap-1.5" title={badge.name}>
                             <div className="p-1 rounded-xl bg-gradient-to-b from-white/[0.02] to-transparent border border-white/[0.06] hover:border-cyan-400/20 transition-all duration-300">
                               <BadgeIcon
                                 name={badge.name}
                                 iconName={badge.icon}
                                 difficulty={badge.difficulty || 'common'}
                                 earned={true}
                                 size={44}
                               />
                             </div>
                             <span className="text-[9px] font-black text-center uppercase tracking-widest font-mono w-12 truncate mt-0.5" style={{ color: '#94A3B8' }}>
                               {badge.name}
                             </span>
                           </div>
                         ))}
                       </div>
                     ) : (
                       <div className="flex flex-col items-center py-5 gap-3">
                         <div className="flex gap-2.5 justify-center">
                           {[1,2,3,4,5].map(i => (
                             <BadgeIcon key={i} name="" iconName="" difficulty="common" earned={false} size={36} />
                           ))}
                         </div>
                         <p className="text-[9px] font-mono uppercase tracking-widest" style={{ color: T.textMuted }}>Settle room targets to earn operations awards</p>
                       </div>
                     )}
                   </Card>
                </div>

                {/* Intel Feed / Tactical Recommendations System */}
                <Card>
                   <SectionHeader icon={<TrendingUp size={14} className="text-cyan-400" />} title="Tactical Recommendations System" actionTo="/rooms" />
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                     {newRooms.slice(0, 4).map(room => (
                       <Link to={`/rooms/${room.slug || room._id}`} key={room.id}
                         className="p-3.5 rounded-lg transition-all border relative overflow-hidden group bg-black/40 border-white/[0.04] hover:border-cyan-400/30"
                       >
                         <span className="text-xs font-bold text-white line-clamp-1 block font-mono uppercase tracking-wider group-hover:text-cyan-400 transition-colors">{room.title}</span>
                         <span className="text-[9px] font-black font-mono uppercase block mt-1.5" style={{ color: T.textMuted }}>{room.difficulty || 'MEDIUM'} DIFFICULTY</span>
                         <div className="absolute bottom-0 right-0 w-8 h-8 bg-cyan-400/5 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                       </Link>
                     ))}
                   </div>
                </Card>

                {/* Weekly directives & Skill evaluation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <Card>
                      <SectionHeader icon={<Target size={14} className="text-cyan-400" />} title="Weekly Operations Directives" />
                      <div className="space-y-2.5 mt-2">
                        {weeklyMissions.map(m => (
                          <div key={m.id} className="flex flex-col gap-2 p-3 rounded-lg bg-black/30 border border-white/[0.04]">
                             <div className="flex justify-between items-center font-mono text-[10px]">
                               <span className="font-bold text-white uppercase">{m.title}</span>
                               <span className="font-bold" style={{ color: m.completed ? '#88E636' : T.textMuted }}>{m.current} / {m.target}</span>
                             </div>
                             <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                               <div className="h-full rounded-full bg-cyan-400/60" style={{ width: `${(m.current / m.target) * 100}%` }} />
                             </div>
                          </div>
                        ))}
                      </div>
                   </Card>

                   <Card>
                      <SectionHeader icon={<BarChart3 size={14} className="text-purple-400" />} title="Vulnerability Competence Matrix" />
                      <div className="space-y-3.5 mt-2 font-mono text-[9px]">
                        {skills.map(s => (
                          <div key={s.name} className="flex items-center gap-3">
                             <span className="font-bold text-white uppercase tracking-wider w-24 truncate">{s.name}</span>
                             <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                               <div className="h-full rounded-full" style={{ width: s.pct+'%', background: `linear-gradient(90deg,${s.color},${s.color}99)`, boxShadow: `0 0 6px ${s.color}40` }} />
                             </div>
                             <span className="font-bold w-8 text-right" style={{ color: s.color }}>{s.pct}%</span>
                          </div>
                        ))}
                      </div>
                   </Card>
                </div>

              </div>

              {/* Right Column (Streak, Live Leaders, Status Console) */}
              <div className="space-y-6">
                
                {/* Streak ring */}
                <Card className="text-center">
                   <SectionHeader icon={<Flame size={14} className="text-orange-500" />} title="Streak Telemetry" />
                   <div className="transform scale-90"><StreakRing streak={ud.currentStreak} best={ud.longestStreak} /></div>
                   <div className="flex justify-between items-center px-4 -mt-2 font-mono">
                      <div className="text-center"><span className="text-[8px] text-slate-500 block tracking-widest uppercase">Current</span><span className="text-base font-black text-orange-400 db-orbitron">{ud.currentStreak}</span></div>
                      <div className="text-center"><span className="text-[8px] text-slate-500 block tracking-widest uppercase">Best</span><span className="text-base font-black text-amber-400 db-orbitron">{ud.longestStreak}</span></div>
                   </div>
                </Card>

                {/* Live Leaderboard Standings */}
                <Card>
                   <SectionHeader icon={<Trophy size={14} className="text-yellow-400" />} title="Top Ranked Operators" actionTo="/leaderboard" />
                   <div className="space-y-1.5 font-mono text-[10px]">
                     {leaders.map(l => (
                       <div key={l.rank} className="flex items-center justify-between p-2.5 rounded-lg transition-all"
                         style={{ 
                           background: l.username === ud.name ? 'rgba(0,209,255,0.06)' : 'transparent', 
                           border: l.username === ud.name ? '1px solid rgba(0,209,255,0.15)' : '1px solid transparent' 
                         }}
                       >
                           <div className="flex items-center gap-2">
                             <span className="font-bold w-5 text-slate-500" style={{ color: l.rank === 1 ? T.amber : undefined }}>#{l.rank}</span>
                             <span className="font-bold uppercase tracking-wider" style={{ color: l.username === ud.name ? T.cyan : '#E2E8F0' }}>{l.username}</span>
                           </div>
                           <span className="font-bold" style={{ color: T.amber }}>{(l.points||0).toLocaleString()} XP</span>
                       </div>
                     ))}
                   </div>
                </Card>

                {/* Real-time Infrastructure status monitor */}
                <Card>
                   <SectionHeader icon={<Server size={14} className="text-cyan-400" />} title="System Infra Telemetry" />
                   
                   {/* Mini live logger */}
                   <div className="p-3 bg-black/60 border border-white/[0.04] rounded-lg font-mono text-[10px] text-green-400/90 leading-normal mb-4">
                     {terminalLines.map((line, idx) => (
                       <p key={idx} className="truncate">
                         {line}
                         {idx === terminalLines.length - 1 && <span className="inline-block w-1.5 h-3.5 ml-1 bg-[#22c55e] animate-pulse" />}
                       </p>
                     ))}
                   </div>

                   <div className="space-y-2 font-mono text-[9px] text-slate-400">
                     <div className="flex items-center justify-between p-2 rounded bg-white/[0.01] border border-white/[0.02]">
                       <span className="flex items-center gap-1.5">
                         <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                         <span>KUBERNETES STATUS</span>
                       </span>
                       <span className="text-green-400 font-bold">100% HEALTHY</span>
                     </div>
                     <div className="flex items-center justify-between p-2 rounded bg-white/[0.01] border border-white/[0.02]">
                       <span className="flex items-center gap-1.5">
                         <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                         <span>WEBSOCKET PIPELINE</span>
                       </span>
                       <span className="text-cyan-400 font-bold">STABLE CONNECTION</span>
                     </div>
                     <div className="flex items-center justify-between p-2 rounded bg-white/[0.01] border border-white/[0.02]">
                       <span className="flex items-center gap-1.5">
                         <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                         <span>SANDBOX INSTANCES</span>
                       </span>
                       <span className="text-orange-500 font-bold">12 LABS ACTIVE</span>
                     </div>
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