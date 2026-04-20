import { useEffect, useState, memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../contexts/app-context";
import { useRealTimeLeaderboard } from "../hooks/useRealTimeLeaderboard";
import { useRealtime } from "../contexts/realtime-context";
import {
  Trophy, TrendingUp, TrendingDown, Minus, Search,
  Shield, Star, Medal, Zap, Crown, Users,
} from "lucide-react";
import "./Leaderboard.css";


/* ─── Skeleton Row ─── */
const SkeletonRow = () => (
  <div className="flex items-center gap-4 px-6 py-4 animate-pulse">
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
    label: "#1", icon: <Trophy size={18} />,
    color: "#FFB800", bg: "rgba(255,184,0,0.12)", border: "rgba(255,184,0,0.3)",
    glow: "rgba(255,184,0,0.15)", avatarGrad: "linear-gradient(135deg,#FFB800,#FF6B00)",
  },
  1: {
    label: "#2", icon: <Medal size={18} />,
    color: "#94A3B8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.2)",
    glow: "rgba(148,163,184,0.08)", avatarGrad: "linear-gradient(135deg,#64748B,#94A3B8)",
  },
  2: {
    label: "#3", icon: <Star size={18} />,
    color: "#FF6B00", bg: "rgba(255,107,0,0.10)", border: "rgba(255,107,0,0.25)",
    glow: "rgba(255,107,0,0.12)", avatarGrad: "linear-gradient(135deg,#FF6B00,#cc4400)",
  },
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
    if (!ud.name || !leaderboardData?.length) return ud.rank || 999;
    const pos = leaderboardData.findIndex((p) => p.name === ud.name);
    return pos !== -1 ? pos + 1 : ud.rank || 999;
  }, [ud.name, ud.rank, leaderboardData]);

  const pointsToNextRank = useMemo(() => {
    if (!ud.xp || !userRank || userRank === 1) return null;
    const next = leaderboardData[userRank - 2];
    return next ? next.points - ud.xp : null;
  }, [ud.xp, userRank, leaderboardData]);

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
      {/* Background layers */}
      <div className="absolute inset-0 z-0 pointer-events-none lb-page__grid" />
      <div className="absolute inset-0 z-0 pointer-events-none lb-page__overlay" />

      <div className="relative z-10">

        {/* ═══ HERO ═══ */}
        <div className="lb-hero relative overflow-hidden">
          {/* ambient glow orbs */}
          <div className="lb-hero__glow-orange" />
          <div className="lb-hero__glow-cyan" />

          <div className="relative max-w-6xl mx-auto px-6 pt-10 pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              {/* Title block */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="lb-hero__icon-box">
                    <Trophy size={22} className="lb-icon-orange" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest lb-text-cyan">
                    Rankings
                  </span>
                </div>
                <h1 className="text-4xl font-extrabold text-white mb-2">Leaderboard</h1>
                <p className="text-slate-400 text-sm max-w-md">
                  Compete with the best in the CyberVerse community. Every point counts.
                </p>
              </div>

              {/* Stats strip */}
              <div className="lb-stats-strip">
                <div className="text-center lb-stats-item">
                  <div className="flex items-center justify-center gap-1.5 mb-1 lb-text-cyan">
                    <Users size={16} />
                  </div>
                  <p className="text-2xl font-extrabold text-white">{leaderboardData.length}</p>
                  <p className="text-xs text-slate-400">Players</p>
                </div>
                <div className="lb-stats-divider" />
                <div className="text-center lb-stats-item">
                  <div className="flex items-center justify-center gap-1.5 mb-1 lb-text-orange">
                    <Zap size={16} />
                  </div>
                  <p className="text-2xl font-extrabold lb-text-orange">Live</p>
                  <p className="text-xs text-slate-400">Updated</p>
                </div>
                <div className="lb-stats-divider" />
                <div className="text-center lb-stats-item">
                  <div className="flex items-center justify-center gap-1.5 mb-1 lb-text-cyan">
                    <Shield size={16} />
                  </div>
                  <p className="text-2xl font-extrabold text-white">
                    {top3[0]?.points?.toLocaleString() || "—"}
                  </p>
                  <p className="text-xs text-slate-400">Top Score</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">

          {/* ═══ FILTER BAR ═══ */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {/* Tab pills */}
            <div className="lb-tab-group">
              {["global", "weekly", "monthly"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabSwitch(tab)}
                  className={`lb-tab ${activeTab === tab ? "lb-tab--active" : ""}`}
                >
                  {activeTab === tab && isFiltering && (
                    <span className="absolute inset-0 flex items-center justify-center rounded-lg">
                      <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    </span>
                  )}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
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
                placeholder="Search players…"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="lb-search-input"
              />
            </div>
          </div>

          {leaderboardError ? (
            <div className="lb-error-state">
              <Trophy size={32} className="lb-icon-orange mb-3 opacity-40" />
              <p className="text-red-400 font-medium">Failed to load leaderboard</p>
              <p className="text-slate-500 text-sm mt-1">Please refresh the page to try again.</p>
            </div>
          ) : (
            <>
              {/* ═══ TOP 3 PODIUM ═══ */}
              {!isLoading && top3.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {[top3[1], top3[0], top3[2]].map((player, displayIdx) => {
                    const realIdx = displayIdx === 0 ? 1 : displayIdx === 1 ? 0 : 2;
                    if (!player) return <div key={displayIdx} />;
                    const cfg = medalConfig[realIdx];
                    const isFirst = realIdx === 0;
                    return (
                      <div
                        key={player.rank}
                        className={`lb-podium-card relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 ${isFirst ? "md:order-2 lb-podium-card--first" : realIdx === 1 ? "md:order-1" : "md:order-3"}`}
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
                          <div className="flex items-center justify-between mb-5">
                            <div className="lb-podium-rank-badge" style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                              <span style={{ color: cfg.color }}>{cfg.icon}</span>
                              <span className="text-sm font-bold" style={{ color: cfg.color }}>{cfg.label}</span>
                            </div>
                            {isFirst && (
                              <span className="lb-top-tag">👑 Top Rank</span>
                            )}
                          </div>

                          {/* Avatar + name */}
                          <div className="flex items-center gap-3 mb-5">
                            <div
                              className={`${isFirst ? "w-16 h-16 text-2xl" : "w-12 h-12 text-lg"} rounded-2xl flex items-center justify-center font-bold text-white shadow-lg flex-shrink-0`}
                              style={{ background: cfg.avatarGrad, boxShadow: `0 4px 20px ${cfg.glow}` }}
                            >
                              {player.username.slice(0, 1).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className={`${isFirst ? "text-xl" : "text-base"} font-bold text-white truncate`}>
                                {player.username}
                              </h3>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <Shield size={11} className="text-slate-500" />
                                <span className="text-xs text-slate-500">Level {player.level || 1}</span>
                              </div>
                            </div>
                          </div>

                          {/* Points */}
                          <div className="flex items-center justify-between pt-4 lb-podium-card__footer">
                            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Points</span>
                            <span className={`${isFirst ? "text-xl" : "text-base"} font-bold`} style={{ color: cfg.color }}>
                              {player.points.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ═══ LEADERBOARD TABLE ═══ */}
              <div className="lb-table rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="lb-table__header grid grid-cols-[48px_1fr_80px_100px] sm:grid-cols-[48px_1fr_80px_80px_110px] items-center px-6 py-3">
                  <span className="lb-table__th">#</span>
                  <span className="lb-table__th">Player</span>
                  <span className="lb-table__th hidden sm:block">Level</span>
                  <span className="lb-table__th hidden sm:block">Change</span>
                  <span className="lb-table__th text-right">Points</span>
                </div>

                {isLoading ? (
                  <div>
                    {Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}
                  </div>
                ) : filteredLeaderboard.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Search size={32} className="text-slate-600 mb-3" />
                    <p className="text-slate-400 font-medium">No players found</p>
                    <p className="text-slate-600 text-sm mt-1">Try a different search term</p>
                  </div>
                ) : (
                  <div className="lb-table__body">
                    {filteredLeaderboard.map((player) => {
                      const isUser = player.username === ud.name || player.name === ud.name;
                      const rankChange = player.rankChange || 0;
                      return (
                        <div
                          key={player.rank}
                          className={`lb-table__row grid grid-cols-[48px_1fr_80px_100px] sm:grid-cols-[48px_1fr_80px_80px_110px] items-center px-6 py-4 transition-all duration-150 group ${isUser ? "lb-table__row--you" : ""}`}
                        >
                          {/* Rank */}
                          <span className={`text-sm font-bold ${isUser ? "lb-text-cyan" : "text-slate-500"}`}>
                            {player.rank <= 3 ? (
                              <span className="lb-rank-badge" style={{
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
                              </p>
                            </div>
                          </div>

                          {/* Level */}
                          <span className="text-sm text-slate-500 hidden sm:block">Lv. {player.level || 1}</span>

                          {/* Rank change */}
                          <div className="hidden sm:flex items-center">
                            {rankChange > 0 ? (
                              <span className="lb-change lb-change--up">
                                <TrendingUp size={12} /> +{rankChange}
                              </span>
                            ) : rankChange < 0 ? (
                              <span className="lb-change lb-change--down">
                                <TrendingDown size={12} /> {rankChange}
                              </span>
                            ) : (
                              <Minus size={14} className="text-slate-600" />
                            )}
                          </div>

                          {/* Points */}
                          <div className="text-right">
                            <span className={`text-sm font-bold ${isUser ? "lb-text-cyan" : "text-white"}`}>
                              {player.points.toLocaleString()}
                            </span>
                            <p className="text-[11px] text-slate-600">pts</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ═══ YOUR RANK FOOTER ═══ */}
          {ud.name && userRank && (
            <div className="lb-your-rank mt-6 relative overflow-hidden rounded-2xl p-6">
              {/* glow */}
              <div className="lb-your-rank__glow-cyan" />
              <div className="lb-your-rank__glow-orange" />

              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="lb-your-rank__avatar">
                    {ud.name?.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Your Standing</p>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-extrabold text-white">#{userRank}</span>
                      <div className="lb-your-rank__divider" />
                      <div>
                        <p className="text-xs text-slate-500">Points</p>
                        <p className="text-base font-bold lb-text-cyan">{(ud.xp || 0).toLocaleString()}</p>
                      </div>
                      <div className="lb-your-rank__divider" />
                      <div>
                        <p className="text-xs text-slate-500">Level</p>
                        <p className="text-base font-bold text-white">{ud.level || 1}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {pointsToNextRank > 0 && (
                  <div className="lb-next-rank-box">
                    <TrendingUp size={18} className="lb-icon-orange" />
                    <div>
                      <p className="text-xs text-slate-500">To next rank</p>
                      <p className="text-lg font-bold text-white">+{pointsToNextRank.toLocaleString()} pts</p>
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
