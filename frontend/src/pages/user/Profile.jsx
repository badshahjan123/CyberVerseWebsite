import { useState, useEffect, useMemo, useCallback, memo } from "react";
import {
  Github, Twitter, Linkedin, MapPin, Calendar,
  Trophy, Target, Shield, Award, Zap, Star,
  CheckCircle, Clock, TrendingUp, Crown, Activity,
  Compass, FlaskConical, Code, Briefcase, BadgeCheck, Crown as CrownIcon,
  Globe as GlobeIcon, Terminal, Heart, Zap as ZapIcon, EyeOff, CheckCircle2,
  Database, Network, Search, Eye, Flame, Map as MapIcon, Server, Mail, ExternalLink,
  ChevronRight
} from "lucide-react";
import { useApp } from "../../contexts/app-context";
import { useRealtime } from "../../contexts/realtime-context";
import { apiCall } from "../../config/api";
import "./Profile.css";

const generateHeatmapData = (roomProgress = []) => {
  const activityMap = new Map();
  roomProgress.forEach((room) => {
    if (room.completedAt) {
      const date = new Date(room.completedAt).toISOString().split("T")[0];
      activityMap.set(date, (activityMap.get(date) || 0) + 1);
    }
  });
  const data = [];
  const today = new Date();
  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    data.push({ date: dateStr, level: Math.min(activityMap.get(dateStr) || 0, 4) });
  }
  return data;
};

/* ── Badge Icon Mapper ── */
const BadgeIcon = ({ name, size = 18 }) => {
  const iconMap = {
    "target-lock": <Target size={size} />,
    "compass": <Compass size={size} />,
    "flask": <FlaskConical size={size} />,
    "code": <Code size={size} />,
    "shield": <Shield size={size} />,
    "briefcase": <Briefcase size={size} />,
    "badge-check": <BadgeCheck size={size} />,
    "award": <Award size={size} />,
    "crown": <CrownIcon size={size} />,
    "network": <Network size={size} />,
    "globe": <GlobeIcon size={size} />,
    "terminal": <Terminal size={size} />,
    "lock": <Shield size={size} />,
    "search": <Search size={size} />,
    "eye": <Eye size={size} />,
    "flame": <Flame size={size} />,
    "zap": <ZapIcon size={size} />,
    "heart": <Heart size={size} />,
    "eye-off": <EyeOff size={size} />,
    "star": <Star size={size} />,
    "checkmark-circle": <CheckCircle2 size={size} />,
    "database": <Database size={size} />,
    "server": <Server size={size} />,
    "map": <MapIcon size={size} />
  };
  if (name && name.length <= 2 && /\p{Emoji}/u.test(name)) return <span className="text-xl">{name}</span>;
  return iconMap[name] || <Award size={size} />;
};

const Profile = memo(() => {
  const { user, refreshUser } = useApp();
  const { userStats } = useRealtime();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  const ud = useMemo(() => ({
    ...user,
    ...userStats,
    points: userStats?.totalXP || user?.points || 0,
    streak: userStats?.streak || user?.currentStreak || 0,
    longestStreak: userStats?.longestStreak || user?.longestStreak || 0,
    rank: userStats?.rank || user?.rank || 999,
    completedRooms: userStats?.completedRooms || user?.completedRooms || 0,
    completedLabs: userStats?.completedLabs || user?.completedLabs || 0,
  }), [user, userStats]);

  const heatmapData = useMemo(() => generateHeatmapData(user?.roomProgress || []), [user?.roomProgress]);

  const fetchProfileData = useCallback(async (bypassLoading = false) => {
    if (!user) return;
    if (!bypassLoading) setLoading(true);
    try {
      const res = await apiCall("/user/badges");
      setBadges((res.badges || []).filter(b => b.earned));
    } catch (e) {
      console.error("Profile fetch error:", e);
    } finally {
      if (!bypassLoading) setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchProfileData(); }, [fetchProfileData]);

  useEffect(() => {
    const handleSync = async () => { await refreshUser(); fetchProfileData(true); };
    window.addEventListener("roomCompleted", handleSync);
    window.addEventListener("labCompleted", handleSync);
    return () => {
      window.removeEventListener("roomCompleted", handleSync);
      window.removeEventListener("labCompleted", handleSync);
    };
  }, [refreshUser, fetchProfileData]);

  const weeks = useMemo(() => {
    const w = [];
    for (let i = 0; i < heatmapData.length; i += 7) w.push(heatmapData.slice(i, i + 7));
    return w;
  }, [heatmapData]);

  const heatmapColors = [
    "prof-hmap--0", "prof-hmap--1", "prof-hmap--2", "prof-hmap--3", "prof-hmap--4"
  ];

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "Member";

  if (loading || !user) return (
    <div className="prof-page min-h-screen flex items-center justify-center">
      <div className="prof-spinner" />
    </div>
  );

  return (
    <div className="prof-page min-h-screen relative overflow-x-hidden text-white">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none prof-page__grid" />
      <div className="absolute inset-0 z-0 pointer-events-none prof-page__overlay" />

      <div className="relative z-10 pt-16">
        {/* ═══ HERO BANNER ═══ */}
        <div className="prof-hero relative">
          <div className="prof-hero__glow-cyan" />
          <div className="prof-hero__glow-orange" />
          
          <div className="max-w-6xl mx-auto px-6">
            <div className="prof-banner-card overflow-hidden rounded-3xl relative">
              {/* Background of the actual profile card */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#0b1f3a]/80 to-[#081224]/90 backdrop-blur-3xl" />
              <div className="prof-banner-mask" />
              
              <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-center md:items-end gap-8">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="prof-avatar-wrap">
                    <img 
                      src={user.avatar?.startsWith("http") ? user.avatar : `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                      alt={user.name} 
                      className="prof-avatar-img"
                    />
                  </div>
                  {ud.isPremium && (
                    <div className="prof-premium-chip">
                      <Crown size={14} className="text-white" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-3">
                    <h1 className="text-3xl font-black tracking-tight text-white">{user.name}</h1>
                    {ud.isPremium && (
                      <span className="prof-badge-premium">Elite Infiltrator</span>
                    )}
                  </div>
                  <div className="flex flex-wrap justify-center md:justify-start items-center gap-5 text-slate-400">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                      <Mail size={13} className="prof-text-cyan" /> {user.email}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                      <Calendar size={13} className="prof-text-cyan" /> Since {joinDate}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                      <Trophy size={13} className="prof-text-orange" /> Rank #{ud.rank}
                    </div>
                  </div>
                </div>

                {/* Socials */}
                <div className="flex items-center gap-2">
                  {[Github, Twitter, Linkedin].map((Icon, i) => (
                    <button key={i} className="prof-social-btn">
                      <Icon size={16} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ CONTENT GRID ═══ */}
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: PROGRESS & ACHIEVEMENTS */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Level Widget */}
            <div className="prof-card prof-card--level">
              <div className="prof-card__glow" />
              <div className="relative">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Deployment Level</p>
                    <p className="text-5xl font-black text-white">{ud.level || 1}</p>
                  </div>
                  <div className="prof-card__icon-box prof-card__icon-box--cyan">
                    <Zap size={24} />
                  </div>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Combat XP</span>
                  <span className="text-sm font-black prof-text-cyan">{(ud.points || 0).toLocaleString()}</span>
                </div>
                <div className="prof-progress-track">
                  <div 
                    className="prof-progress-fill" 
                    style={{ width: `${Math.min(((ud.points % 1000) / 1000) * 100, 100)}%` }} 
                  />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-[10px] font-bold text-slate-500">{1000 - (ud.points % 1000)} XP to Next Rank</p>
                  <TrendingUp size={12} className="prof-text-cyan opacity-40" />
                </div>
              </div>
            </div>

            {/* Streak & Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="prof-stat-mini">
                <p className="prof-stat-mini__val">{ud.streak || 0}</p>
                <p className="prof-stat-mini__label">Day Streak</p>
                <Flame size={12} className="prof-text-orange absolute top-3 right-3 opacity-30" />
              </div>
              <div className="prof-stat-mini">
                <p className="prof-stat-mini__val">{ud.longestStreak || 0}</p>
                <p className="prof-stat-mini__label">Best Record</p>
                <Star size={12} className="prof-text-cyan absolute top-3 right-3 opacity-30" />
              </div>
              <div className="prof-stat-mini">
                <p className="prof-stat-mini__val">{ud.completedRooms || 0}</p>
                <p className="prof-stat-mini__label">Rooms Mastered</p>
              </div>
              <div className="prof-stat-mini">
                <p className="prof-stat-mini__val">{ud.completedLabs || 0}</p>
                <p className="prof-stat-mini__label">Labs Deployed</p>
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="prof-card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Award size={18} className="prof-text-orange" />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Recent Merit</h3>
                </div>
                <span className="text-[10px] font-bold text-slate-500 bg-white/5 py-1 px-3 rounded-lg border border-white/5">
                  {badges.length} Total
                </span>
              </div>
              
              {badges.length === 0 ? (
                <div className="prof-empty-mini">
                  <Shield size={24} className="opacity-20 mx-auto mb-2" />
                  <p className="text-[10px] uppercase font-bold text-slate-500">No medals recorded</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {badges.slice(0, 12).map((b, i) => (
                    <div key={b._id || i} title={b.name} className="prof-badge-slot group">
                      <div className="prof-badge-slot__icon group-hover:scale-110 transition-transform duration-300">
                        <BadgeIcon name={b.icon} />
                      </div>
                      <div className="prof-badge-slot__tooltip">{b.name}</div>
                    </div>
                  ))}
                </div>
              )}
              
              {badges.length > 12 && (
                <button className="prof-view-all-btn">
                  Analyze All Achievement Logs <ChevronRight size={12} />
                </button>
              )}
            </div>
          </div>

          {/* RIGHT: ACTIVITY & RECENT LOGS */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Heatmap Widget */}
            <div className="prof-card">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Activity size={18} className="prof-text-cyan" />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Training Persistence</h3>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold text-slate-500">Last 365 Operations</span>
                  <div className="flex items-center gap-1.5 opacity-60">
                    <span className="text-[9px] font-bold text-slate-600">Less</span>
                    {heatmapColors.map((c, i) => (
                      <div key={i} className={`w-2.5 h-2.5 rounded-sm ${c}`} />
                    ))}
                    <span className="text-[9px] font-bold text-slate-600">More</span>
                  </div>
                </div>
              </div>
              
              <div className="prof-hmap-container overflow-x-auto">
                <div className="flex gap-1.5 min-w-max pb-2">
                  {weeks.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-1.5">
                      {week.map((day, di) => (
                        <div
                          key={di}
                          title={`${day.date}: ${day.level} items`}
                          className={`prof-hmap-cell ${heatmapColors[day.level]}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Real Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: <Trophy size={20} />, label: "Global Standing", val: `#${ud.rank}`, color: "cyan" },
                { icon: <Target size={20} />, label: "Target Rooms", val: ud.completedRooms || 0, color: "orange" },
                { icon: <FlaskConical size={20} />, label: "Lab Deploys", val: ud.completedLabs || 0, color: "cyan" },
                { icon: <Zap size={20} />, label: "Force Points", val: (ud.points || 0).toLocaleString(), color: "orange" },
              ].map((s, i) => (
                <div key={i} className="prof-card prof-card--stat-box">
                  <div className={`prof-card__icon-mini prof-card__icon-mini--${s.color}`}>
                    {s.icon}
                  </div>
                  <p className="text-2xl font-black text-white mt-1">{s.val}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Recent Timeline */}
            <div className="prof-card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Terminal size={18} className="prof-text-cyan" />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Operational Log</h3>
                </div>
                <button className="text-[10px] font-black uppercase tracking-widest text-[#00D1FF] hover:opacity-70 transition-opacity">
                  Access History
                </button>
              </div>
              
              <div className="space-y-3">
                {user.roomProgress?.filter(rp => rp.completed).slice(0, 5).length === 0 ? (
                  <div className="prof-empty-timeline py-12 text-center border border-dashed border-white/5 rounded-2xl">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">No operations recorded</p>
                  </div>
                ) : (
                  user.roomProgress.filter(rp => rp.completed).sort((a,b) => new Date(b.completedAt) - new Date(a.completedAt)).slice(0, 5).map((log, i) => (
                    <div key={i} className="prof-log-item group">
                      <div className="prof-log-item__icon">
                        <CheckCircle2 size={16} className="text-emerald-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white group-hover:prof-text-cyan transition-colors">Target Neutralized</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                          {new Date(log.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <div className="prof-log-item__badge">
                        <TrendingUp size={11} /> 100% COMPLETE
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
});

Profile.displayName = "Profile";
export default Profile;
