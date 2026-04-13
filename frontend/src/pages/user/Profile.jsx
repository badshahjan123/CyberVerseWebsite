import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Github, Twitter, Linkedin, MapPin, Calendar,
  Trophy, Target, Shield, Award, Zap, Star,
  CheckCircle, Clock, TrendingUp, Crown, Activity,
  Compass, FlaskConical, Code, Briefcase, BadgeCheck, Crown as CrownIcon,
  Globe as GlobeIcon, Terminal, Heart, Zap as ZapIcon, EyeOff, CheckCircle2,
  Database, Network, Search, Eye, Flame, Map as MapIcon, Server
} from "lucide-react";
import { useApp } from "../../contexts/app-context";
import { useRealtime } from "../../contexts/realtime-context";
import { apiCall } from "../../config/api";

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

const StatCard = ({ icon, label, value, accent = "cyan" }) => {
  const colors = {
    cyan: "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20",
    purple: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20",
    amber: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20",
    emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20",
  };
  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-xl p-5 flex items-center gap-4 hover:shadow-md transition-all duration-200">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[accent]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </div>
  );
};

/* ── Badge Icon Mapper ── */
const BadgeIcon = ({ name, size = 20 }) => {
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

  if (name && name.length <= 2 && /\p{Emoji}/u.test(name)) {
    return <span className="text-xl">{name}</span>;
  }

  return iconMap[name] || <Award size={size} />;
};

const Profile = () => {
  const { user, refreshUser } = useApp();
  const { userStats } = useRealtime();
  const [heatmapData, setHeatmapData] = useState([]);
  const [badges, setBadges] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
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

  const fetchProfileData = useCallback(async (bypassLoading = false) => {
    if (!user) return;
    if (!bypassLoading) setLoading(true);
    try {
      const badgesResponse = await apiCall("/user/badges");
      setBadges((badgesResponse.badges || []).filter(b => b.earned));
      const recentRooms = user.roomProgress
        ?.filter((rp) => rp.completed)
        ?.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
        ?.slice(0, 5) || [];
      setRecentActivity(recentRooms);
      setHeatmapData(generateHeatmapData(user.roomProgress || []));
    } catch (error) {
      console.error("Profile fetch error:", error);
    } finally {
      if (!bypassLoading) setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchProfileData(); }, [fetchProfileData]);

  useEffect(() => {
    const handleSync = async () => {
      await refreshUser();
      fetchProfileData(true);
    };
    window.addEventListener("roomCompleted", handleSync);
    window.addEventListener("labCompleted", handleSync);
    return () => {
      window.removeEventListener("roomCompleted", handleSync);
      window.removeEventListener("labCompleted", handleSync);
    };
  }, [refreshUser, fetchProfileData]);

  const weeks = [];
  for (let i = 0; i < heatmapData.length; i += 7) weeks.push(heatmapData.slice(i, i + 7));

  const heatmapColors = [
    "bg-slate-100 dark:bg-slate-800",
    "bg-cyan-200 dark:bg-cyan-900/60",
    "bg-cyan-400 dark:bg-cyan-700",
    "bg-cyan-500 dark:bg-cyan-500",
    "bg-cyan-600 dark:bg-cyan-400",
  ];

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "Member";

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F1A] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-slate-200 dark:border-slate-700 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F1A]">

      {/* Profile-Style Banner */}
      <div className="cv-banner">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(168,85,247,0.1),transparent_60%)]" />
        <div className="cv-banner-glow" />
      </div>

      <div className="container mx-auto px-6 max-w-6xl">

        {/* HERO CONTENT OVERLAP */}
        <div className="cv-hero-overlap flex flex-col sm:flex-row sm:items-end gap-5">
          <div className="relative flex-shrink-0">
            <div className="w-28 h-28 rounded-2xl ring-4 ring-white dark:ring-[#0B0F1A] overflow-hidden shadow-xl">
              <img
                src={user.avatar?.startsWith("http") ? user.avatar : `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                alt={user.name}
                className="w-full h-full object-cover bg-slate-200 dark:bg-slate-700"
              />
            </div>
            {ud.isPremium && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg">
                <Crown size={14} className="text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{user.name}</h1>
                  {ud.isPremium && (
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full">Premium</span>
                  )}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Calendar size={13} />
                    <span>Joined {joinDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Trophy size={13} className="text-cyan-500" />
                    <span>Rank #{ud.rank}</span>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-2">
                {[Github, Twitter, Linkedin].map((Icon, i) => (
                  <button key={i} className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 transition-all">
                    <Icon size={16} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">

          {/* Left Column */}
          <div className="lg:col-span-1 space-y-5">

            {/* Level & XP Card */}
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/10 to-purple-400/10 rounded-full -mr-16 -mt-16" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Current Level</p>
                    <p className="text-4xl font-bold text-slate-900 dark:text-white">{ud.level || 1}</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-400/25">
                    <Zap size={24} className="text-white" />
                  </div>
                </div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Total XP</span>
                  <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">{(ud.points || 0).toLocaleString()}</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(((ud.points % 1000) / 1000) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">{1000 - (ud.points % 1000)} XP to next level</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{ud.completedRooms || 0}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Rooms</p>
              </div>
              <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{ud.completedLabs || 0}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Labs</p>
              </div>
              <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{ud.streak || 0}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Day Streak</p>
              </div>
              <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{ud.longestStreak || 0}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Best Streak</p>
              </div>
            </div>

            {/* Badges Section */}
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-3xl rounded-full" />
              
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                    <Award size={18} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Achievements</h3>
                </div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                  {badges.length} Earned
                </span>
              </div>

              {badges.length === 0 ? (
                <div className="py-6 text-center border-2 border-dashed border-slate-100 dark:border-slate-800/50 rounded-xl">
                  <Award size={24} className="text-slate-200 dark:text-slate-700 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Complete challenges to earn badges</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-4 gap-3">
                  {badges.slice(0, 12).map((b, i) => (
                    <div 
                      key={b._id || i} 
                      title={`${b.name}: ${b.description}`}
                      className="group relative aspect-square rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 cursor-help"
                    >
                      <div className="text-slate-600 dark:text-slate-400 group-hover:text-purple-500 dark:group-hover:text-purple-400 group-hover:scale-110 transition-transform duration-300">
                        <BadgeIcon name={b.icon} />
                      </div>
                      
                      {/* Sub-label for text badges if icon fails or to show name on hover if needed */}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap z-10 pointer-events-none">
                        {b.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {badges.length > 12 && (
                <button className="w-full mt-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-purple-500 transition-colors">
                  View all {badges.length} badges
                </button>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-5">

            {/* Activity Heatmap */}
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <Activity size={16} className="text-cyan-500" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Activity</h3>
                <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">— last 365 days</span>
              </div>
              <div className="overflow-x-auto">
                <div className="flex gap-1 min-w-max">
                  {weeks.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-1">
                      {week.map((day, di) => (
                        <div
                          key={di}
                          title={`${day.date}: ${day.level} activity`}
                          className={`w-3 h-3 rounded-sm ${heatmapColors[day.level]} transition-all hover:scale-125 cursor-default`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-slate-400 dark:text-slate-500">Past year</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400 dark:text-slate-500">Less</span>
                  {heatmapColors.map((c, i) => (
                    <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
                  ))}
                  <span className="text-xs text-slate-400 dark:text-slate-500">More</span>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard icon={<Trophy size={18} />} label="Global Rank" value={`#${ud.rank}`} accent="cyan" />
              <StatCard icon={<Target size={18} />} label="Rooms Done" value={ud.completedRooms || 0} accent="purple" />
              <StatCard icon={<Shield size={18} />} label="Labs Done" value={ud.completedLabs || 0} accent="emerald" />
              <StatCard icon={<Star size={18} />} label="Total XP" value={(ud.points || 0).toLocaleString()} accent="amber" />
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <Clock size={16} className="text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Activity</h3>
              </div>

              {recentActivity.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                  <Target size={28} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">No activity yet</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Complete rooms and labs to see your progress here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentActivity.map((activity, i) => (
                    <div key={i} className="flex items-center gap-4 p-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                        <CheckCircle size={16} className="text-emerald-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                          Room Completed
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {new Date(activity.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-lg">
                          <TrendingUp size={11} /> 100%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
