import { useEffect, useState, memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../contexts/app-context";
import { useRealTimeLeaderboard } from "../hooks/useRealTimeLeaderboard";
import { useRealtime } from "../contexts/realtime-context";
import {
  Trophy, TrendingUp, TrendingDown, Minus, Search,
  Shield, Star, Medal, Zap, Crown, Users, Clock, Flame, Play, Target
} from "lucide-react";
import "./Leaderboard.css";

/* ─── Skeleton Row ─── */
const SkeletonRow = () => (
  <div className="flex items-center gap-4 px-6 py-4 lb-table__row animate-pulse">
    <div className="w-8 h-5 rounded lb-skeleton-block" />
    <div className="w-10 h-10 rounded-xl lb-skeleton-block" />
    <div className="flex-1 space-y-2">
      <div className="h-4 w-32 rounded lb-skeleton-block" />
      <div className="h-3 w-20 rounded lb-skeleton-block lb-skeleton-block--dim" />
    </div>
    <div className="w-16 h-5 rounded lb-skeleton-block" />
    <div className="w-20 h-6 rounded lb-skeleton-block" />
  </div>
);

/* ─── Medal config ─── */
const medalConfig = {
  0: {
    label: "#1", icon: <Crown size={22} className="animate-pulse" />,
    color: "#FFB800", bg: "rgba(255,184,0,0.12)", border: "rgba(255,184,0,0.3)",
    glow: "rgba(255,184,0,0.15)", avatarGrad: "linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)",
  },
  1: {
    label: "#2", icon: <Medal size={18} />,
    color: "#94A3B8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.2)",
    glow: "rgba(148,163,184,0.08)", avatarGrad: "linear-gradient(135deg, #E2E8F0 0%, #94A3B8 100%)",
  },
  2: {
    label: "#3", icon: <Star size={18} />,
    color: "#FF6B00", bg: "rgba(255,107,0,0.10)", border: "rgba(255,107,0,0.25)",
    glow: "rgba(255,107,0,0.12)", avatarGrad: "linear-gradient(135deg, #FF8C00 0%, #cc4400 100%)",
  },
};

const getSpecializationBadge = (username = "") => {
  const hash = username.charCodeAt(0) + (username.charCodeAt(1) || 0);
  const badges = [
    { label: "SQLi Master", color: "#00D1FF", bg: "rgba(0,209,255,0.08)", border: "rgba(0,209,255,0.2)" },
    { label: "Recon Specialist", color: "#A855F7", bg: "rgba(168,85,247,0.08)", border: "rgba(168,85,247,0.2)" },
    { label: "Malware Hunter", color: "#EF4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)" },
    { label: "Top Operator", color: "#39FF14", bg: "rgba(57,255,20,0.08)", border: "rgba(57,255,20,0.2)" },
    { label: "Forensics Expert", color: "#FFB800", bg: "rgba(255,184,0,0.08)", border: "rgba(255,184,0,0.2)" },
  ];
  return badges[hash % badges.length];
};

const Leaderboard = memo(() => {
  const { isAuthenticated, loading, user } = useApp();
  const { userStats } = useRealtime();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("global");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);
  const { leaderboard, loading: leaderboardLoading, error: leaderboardError } = useRealTimeLeaderboard();

  const ud = {
    ...user,
    ...userStats,
    xp: userStats?.totalXP || user?.points || 0,
    rank: userStats?.rank || user?.rank || 999,
  };

  const leaderboardData = useMemo(
    () => leaderboard.map((p) => ({ ...p, username: p.name })),
    [leaderboard]
  );

  const filteredLeaderboard = useMemo(() => {
    if (!searchQuery) return leaderboardData;
    return leaderboardData.filter((p) =>
      p.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [leaderboardData, searchQuery]);

  const top3 = filteredLeaderboard.slice(0, 3);
  const rest = filteredLeaderboard.slice(3);

  const userRank = useMemo(() => {
    console.log("ud._id:", ud._id, "ud.id:", ud.id);
    console.log("leaderboard sample:", leaderboardData.slice(0, 5).map(p => ({ id: p._id, name: p.name })));
    
    // Support both _id and id just in case
    const currentId = ud._id || ud.id;
    if (!currentId || !leaderboardData?.length) return ud.rank || 999;
    
    const pos = leaderboardData.findIndex((p) => (p._id || p.id) === currentId);
    return pos !== -1 ? pos + 1 : ud.rank || 999;
  }, [ud._id, ud.id, ud.rank, leaderboardData]);

  const pointsToNextRank = useMemo(() => {
    if (!ud.xp || !userRank || userRank === 1) return null;
    const next = leaderboardData[userRank - 2];
    return next ? next.points - ud.xp : null;
  }, [ud.xp, userRank, leaderboardData]);

  const liveFeed = useMemo(() => {
    if (!leaderboardData.length) return [];
    return [
      { name: leaderboardData[0]?.username || "ghost_sec", event: "captured SQLi flag", xp: "+250 XP" },
      { name: leaderboardData[1]?.username || "kernel_panic", event: "escalated VM privileges", xp: "+175 XP" },
      { name: leaderboardData[2]?.username || "rootx", event: "entered Top 10 roster", xp: "Rank Up" },
      { name: leaderboardData[3]?.username || "cyph3r", event: "completed Malware Sandbox", xp: "SUCCESS" },
    ];
  }, [leaderboardData]);

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate("/login");
  }, [isAuthenticated, loading, navigate]);

  const handleTabSwitch = (tab) => {
    if (tab === activeTab) return;
    setIsFiltering(true);
    setActiveTab(tab);
    setTimeout(() => setIsFiltering(false), 600);
  };

  const handleSearch = (val) => {
    setIsFiltering(true);
    setSearchQuery(val);
    setTimeout(() => setIsFiltering(false), 400);
  };

  if (loading) return null;
  const isLoading = leaderboardLoading || isFiltering;

  return (
    <div className="lb-page min-h-screen relative overflow-x-hidden text-white">
      {/* Background matching Labs and Dashboard perfectly */}
      <div className="absolute inset-0 z-0 pointer-events-none lb-page__grid" />
      <div className="absolute inset-0 z-0 pointer-events-none lb-page__overlay" />

      <div className="relative z-10">
        {/* ═══ HERO HEADER ═══ */}
        <div className="lb-hero relative overflow-hidden border-b border-white/[0.04] bg-[#081224]/80">
          <div className="lb-hero__glow-orange" />
          <div className="lb-hero__glow-cyan" />

          <div className="relative max-w-7xl mx-auto px-6 pt-10 pb-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              {/* Title Block */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="lb-hero__icon-box">
                    <Trophy size={22} className="lb-icon-orange" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest lb-text-cyan font-mono">
                    Operational Standing
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 font-mono">Leaderboard</h1>
                <p className="text-slate-400 text-xs max-w-md font-mono text-[11px] leading-relaxed">
                  Compete with elite operators globally. Every task deployment, sandbox flag extraction, and system intrusion adds to your ranking metrics.
                </p>
              </div>

              {/* Tournament Season Indicator */}
              <div className="flex items-center gap-3 bg-cyan-950/40 border border-cyan-500/20 rounded-xl p-3 px-4 font-mono text-xs max-w-xs">
                <Clock size={16} className="text-cyan-400 animate-pulse flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500 uppercase font-black">CURRENT SYSTEM CYCLE</p>
                  <p className="text-cyan-400 font-extrabold text-[11px]">Operation Black Cipher</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Ends in 12 Days</p>
                </div>
              </div>

              {/* Stats strip */}
              <div className="lb-stats-strip font-mono text-xs">
                <div className="text-center lb-stats-item">
                  <div className="flex items-center justify-center gap-1.5 mb-1 lb-text-cyan">
                    <Users size={16} />
                  </div>
                  <p className="text-2xl font-extrabold text-white">{leaderboardData.length}</p>
                  <p className="text-xs text-slate-400">Operators</p>
                </div>
                <div className="lb-stats-divider" />
                <div className="text-center lb-stats-item">
                  <div className="flex items-center justify-center gap-1.5 mb-1 lb-text-orange">
                    <Zap size={16} />
                  </div>
                  <p className="text-2xl font-extrabold lb-text-orange">Live</p>
                  <p className="text-xs text-slate-400">Stream</p>
                </div>
                <div className="lb-stats-divider" />
                <div className="text-center lb-stats-item">
                  <div className="flex items-center justify-center gap-1.5 mb-1 lb-text-cyan">
                    <Shield size={16} />
                  </div>
                  <p className="text-2xl font-extrabold text-white">
                    {top3[0]?.points?.toLocaleString() || "—"}
                  </p>
                  <p className="text-xs text-slate-400">Apex XP</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* ═══ FILTER BAR ═══ */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 font-mono text-xs">
            {/* Tab pills */}
            <div className="lb-tab-group">
              {["global", "weekly", "monthly"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabSwitch(tab)}
                  className={`lb-tab uppercase tracking-wider ${activeTab === tab ? "lb-tab--active" : ""}`}
                >
                  {activeTab === tab && isFiltering && (
                    <span className="absolute inset-0 flex items-center justify-center rounded-lg">
                      <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    </span>
                  )}
                  {tab} Cycle
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
              {isFiltering && searchQuery && (
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-slate-600 border-t-[#00D1FF] rounded-full animate-spin" />
              )}
              <input
                type="text"
                placeholder="Search active operators…"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="lb-search-input"
              />
            </div>
          </div>

          {leaderboardError ? (
            <div className="lb-error-state font-mono">
              <Trophy size={32} className="lb-icon-orange mb-3 opacity-40" />
              <p className="text-red-400 font-medium">Failed to load communities leaderboard</p>
              <p className="text-slate-500 text-sm mt-1">Please check network or refresh matrix.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
              
              {/* LEFT COLUMN: PODIUM & LIST */}
              <div className="space-y-6">
                
                {/* ═══ TOP 3 PODIUM ═══ */}
                {!isLoading && top3.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end mb-4">
                    {[top3[1], top3[0], top3[2]].map((player, displayIdx) => {
                      const realIdx = displayIdx === 0 ? 1 : displayIdx === 1 ? 0 : 2;
                      if (!player) return <div key={displayIdx} />;
                      const cfg = medalConfig[realIdx];
                      const isFirst = realIdx === 0;
                      const spec = getSpecializationBadge(player.username);
                      
                      return (
                        <div
                          key={player.rank}
                          className={`lb-podium-card relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 ${isFirst ? "md:order-2 lb-podium-card--first md:min-h-[250px]" : realIdx === 1 ? "md:order-1 md:min-h-[210px]" : "md:order-3 md:min-h-[190px]"}`}
                          style={{
                            border: `1px solid ${cfg.border}`,
                            boxShadow: `0 8px 32px ${cfg.glow}`,
                          }}
                        >
                          {/* ambient glow */}
                          <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-2xl"
                            style={{ background: cfg.color + "18" }} />

                          <div className="relative">
                            {/* Rank badge */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="lb-podium-rank-badge font-mono" style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                                <span style={{ color: cfg.color }}>{cfg.icon}</span>
                                <span className="text-xs font-black">{cfg.label}</span>
                              </div>
                              {isFirst && (
                                <span className="lb-top-tag font-mono">👑 APEX OPERATOR</span>
                              )}
                            </div>

                            {/* Avatar + name */}
                            <div className="flex items-center gap-3 mb-4">
                              <div
                                className={`${isFirst ? "w-14 h-14 text-xl" : "w-11 h-11 text-sm"} rounded-xl flex items-center justify-center font-bold text-white shadow-lg flex-shrink-0`}
                                style={{ background: cfg.avatarGrad, boxShadow: `0 4px 20px ${cfg.glow}` }}
                              >
                                {player.username.slice(0, 1).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0 font-mono">
                                <h3 className={`${isFirst ? "text-lg" : "text-sm"} font-black text-white truncate`}>
                                  {player.username}
                                </h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <Shield size={11} className="text-slate-500" />
                                  <span className="text-[10px] text-slate-500">Level {player.level || 1}</span>
                                </div>
                                <span 
                                  className="inline-block text-[9px] font-bold px-2 py-0.5 rounded border mt-1.5 font-mono"
                                  style={{ color: player.color || spec.color, background: `${player.color || spec.color}15`, borderColor: `${player.color || spec.color}40` }}
                                >
                                  {player.title ? player.title.toUpperCase() : spec.label}
                                </span>
                              </div>
                            </div>

                            {/* Points */}
                            <div className="flex items-center justify-between pt-4 border-t border-white/[0.04]">
                              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider font-semibold">Total Score</span>
                              <span className={`${isFirst ? "text-lg" : "text-sm"} font-bold font-mono`} style={{ color: cfg.color }}>
                                {player.points.toLocaleString()} XP
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ═══ LEADERBOARD TABLE ═══ */}
                <div id="tour-leaderboard-table" className="lb-table rounded-2xl overflow-hidden bg-[#0a1424]/40 border border-white/[0.04]">
                  {/* Header */}
                  <div className="lb-table__header grid grid-cols-[48px_1fr_80px_100px] sm:grid-cols-[48px_1fr_80px_100px_110px] items-center px-6 py-3 font-mono text-xs text-slate-500 uppercase tracking-wider">
                    <span className="lb-table__th">#</span>
                    <span className="lb-table__th">Operator</span>
                    <span className="lb-table__th hidden sm:block">Level</span>
                    <span className="lb-table__th hidden sm:block">Rank Title</span>
                    <span className="lb-table__th text-right">XP Points</span>
                  </div>

                  {isLoading ? (
                    <div>
                      {Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}
                    </div>
                  ) : filteredLeaderboard.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center font-mono">
                      <Search size={32} className="text-slate-600 mb-3" />
                      <p className="text-slate-400 font-medium">Operator profile not located</p>
                      <p className="text-slate-600 text-xs mt-1">Try a different search query string</p>
                    </div>
                  ) : (
                    <div className="lb-table__body font-mono">
                      {rest.map((player) => {
                        const currentId = ud._id || ud.id;
                        const playerId = player._id || player.id;
                        const isUser = playerId && currentId ? playerId === currentId : (player.username === ud.name || player.name === ud.name);
                        const spec = getSpecializationBadge(player.username);
                        
                        /* Dynamic Win-streak or Rank indicator */
                        const isHot = player.points > 2000;

                        return (
                          <div
                            key={player.rank}
                            className={`lb-table__row grid grid-cols-[48px_1fr_80px_100px] sm:grid-cols-[48px_1fr_80px_100px_110px] items-center px-6 py-4 transition-all duration-150 group border-b border-white/[0.02] ${isUser ? "lb-table__row--you" : ""}`}
                          >
                            {/* Rank */}
                            <span className={`text-sm font-bold ${isUser ? "lb-text-cyan" : "text-slate-500"}`}>
                              {player.rank <= 3 ? (
                                <span className="lb-rank-badge text-xs" style={{
                                  background: player.rank === 1
                                    ? "linear-gradient(135deg,#FFB800,#FF6B00)"
                                    : player.rank === 2
                                    ? "linear-gradient(135deg,#64748B,#94A3B8)"
                                    : "linear-gradient(135deg,#FF6B00,#cc4400)",
                                }}>
                                  {player.rank}
                                </span>
                              ) : `#${player.rank}`}
                            </span>

                            {/* Player */}
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 transition-transform duration-150 group-hover:scale-105 ${isUser ? "lb-avatar--you" : "lb-avatar"}`}>
                                {player.username.slice(0, 1).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className={`text-sm font-semibold truncate ${isUser ? "lb-text-cyan" : "text-white"}`}>
                                  {player.username}
                                  {isUser && <span className="lb-you-tag ml-2">You</span>}
                                  {isHot && (
                                    <span className="ml-1.5 text-[8px] bg-red-950/40 border border-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                      WIN STREAK
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>

                            {/* Level */}
                            <span className="text-sm text-slate-500 hidden sm:block">Lv. {player.level || 1}</span>

                            {/* Title Badge */}
                            <div className="hidden sm:flex items-center">
                              <span 
                                className="text-[8px] font-black px-2 py-0.5 rounded border tracking-wider"
                                style={{ color: player.color || spec.color, background: `${player.color || spec.color}15`, borderColor: `${player.color || spec.color}40` }}
                              >
                                {player.title ? player.title.toUpperCase() : spec.label}
                              </span>
                            </div>

                            {/* Points */}
                            <div className="text-right">
                              <span className={`text-sm font-bold ${isUser ? "lb-text-cyan" : "text-white"}`}>
                                {player.points.toLocaleString()}
                              </span>
                              <p className="text-[10px] text-slate-600">XP</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: REALTIME COMMUNITY STREAM & STATS */}
              <div className="space-y-6">
                
                {/* 🎯 TACTICAL STAT WIDGETS */}
                <div className="p-5 rounded-2xl bg-[#0a1424]/40 border border-cyan-500/10 space-y-4 font-mono text-xs">
                  <div className="flex items-center gap-2 border-b border-white/[0.04] pb-3">
                    <Target size={14} className="text-cyan-400" />
                    <h3 className="font-bold text-white uppercase tracking-wider text-[10px]">Operational Metrics</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-black/20 p-2.5 rounded border border-white/[0.02]">
                      <span className="text-slate-500 text-[10px] uppercase font-bold">Apex XP Today</span>
                      <span className="text-cyan-400 font-extrabold">+1,250 XP</span>
                    </div>
                    <div className="flex justify-between items-center bg-black/20 p-2.5 rounded border border-white/[0.02]">
                      <span className="text-slate-500 text-[10px] uppercase font-bold">Max Win Streak</span>
                      <span className="text-orange-400 font-extrabold">14 Rooms</span>
                    </div>
                    <div className="flex justify-between items-center bg-black/20 p-2.5 rounded border border-white/[0.02]">
                      <span className="text-slate-500 text-[10px] uppercase font-bold">Fastest Intrusion</span>
                      <span className="text-[#39FF14] font-extrabold">12m 40s</span>
                    </div>
                  </div>
                </div>

                {/* 📡 COMMUNITY LOG FEED */}
                <div className="p-5 rounded-2xl bg-[#0a1424]/40 border border-white/[0.04] space-y-4 font-mono text-xs">
                  <div className="flex items-center gap-2 border-b border-white/[0.04] pb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-pulse" />
                    <h3 className="font-bold text-white uppercase tracking-wider text-[10px]">Community Log Feed</h3>
                  </div>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {liveFeed.map((feed, i) => (
                      <div key={i} className="space-y-1 bg-black/25 p-3 rounded border border-white/[0.02] transition-colors hover:border-cyan-500/20">
                        <div className="flex justify-between items-center">
                          <span className="font-black text-white text-[11px] truncate max-w-[120px]">{feed.name}</span>
                          <span className="text-[8px] bg-cyan-950/60 border border-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">{feed.xp}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-normal">{feed.event}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ═══ YOUR RANK FOOTER ═══ */}
          {ud.name && userRank && (
            <div className="lb-your-rank mt-8 relative overflow-hidden rounded-2xl p-6 bg-[#0a1424]/60 border border-cyan-500/20">
              <div className="lb-your-rank__glow-cyan" />
              <div className="lb-your-rank__glow-orange" />

              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono">
                <div className="flex items-center gap-4">
                  <div className="lb-your-rank__avatar font-mono">
                    {ud.name?.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Your Standing</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-3xl font-extrabold text-white">#{userRank}</span>
                      <div className="lb-your-rank__divider" />
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase">Points</p>
                        <p className="text-base font-bold lb-text-cyan">{(ud.xp || 0).toLocaleString()} XP</p>
                      </div>
                      <div className="lb-your-rank__divider" />
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase">Level & Title</p>
                        <p className="text-base font-bold" style={{ color: ud.titleColor || ud.color || '#fff' }}>
                          Lv. {ud.level || 1} <span className="text-xs uppercase ml-1 opacity-80">{ud.title}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {pointsToNextRank > 0 && (
                  <div className="lb-next-rank-box">
                    <TrendingUp size={18} className="lb-icon-orange" />
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase">To Next Roster Standing</p>
                      <p className="text-base font-bold text-white">+{pointsToNextRank.toLocaleString()} XP</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

Leaderboard.displayName = "Leaderboard";
export default Leaderboard;
