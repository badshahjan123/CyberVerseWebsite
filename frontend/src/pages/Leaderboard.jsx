import { useEffect, useState, memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../contexts/app-context";
import { useRealTimeLeaderboard } from "../hooks/useRealTimeLeaderboard";
import { useRealtime } from "../contexts/realtime-context";
import { Trophy, TrendingUp, TrendingDown, Minus, Search, Shield, Star, Medal } from "lucide-react";

const SkeletonRow = () => (
  <div className="flex items-center gap-4 px-6 py-4 animate-pulse">
    <div className="w-8 h-5 bg-slate-200 dark:bg-slate-700 rounded" />
    <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
    <div className="flex-1 space-y-2">
      <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
      <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
    </div>
    <div className="w-16 h-5 bg-slate-200 dark:bg-slate-700 rounded" />
    <div className="w-20 h-6 bg-slate-200 dark:bg-slate-700 rounded" />
  </div>
);

const medalConfig = {
  0: { label: "#1", bg: "from-amber-400 to-yellow-500", border: "border-amber-400/60", shadow: "shadow-amber-400/20", icon: <Trophy size={18} className="text-amber-400" />, textColor: "text-amber-400" },
  1: { label: "#2", bg: "from-slate-400 to-slate-500", border: "border-slate-400/60", shadow: "shadow-slate-400/20", icon: <Medal size={18} className="text-slate-400" />, textColor: "text-slate-400" },
  2: { label: "#3", bg: "from-orange-500 to-amber-600", border: "border-orange-500/60", shadow: "shadow-orange-500/20", icon: <Star size={18} className="text-orange-400" />, textColor: "text-orange-400" },
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

  const leaderboardData = useMemo(() =>
    leaderboard.map((p) => ({ ...p, username: p.name })),
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
    <div className="page-root min-h-screen">
      {/* Profile-Style Banner */}
      <div className="cv-banner">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/5 rounded-full -mr-48 -mt-48 blur-3xl" />
        <div className="cv-banner-glow" />
      </div>

      <div className="container mx-auto px-6 max-w-6xl relative">
        {/* HERO CONTENT OVERLAP */}
        <div className="cv-hero-overlap flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl p-8 rounded-3xl border border-white/20 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-400/30">
                <Trophy size={16} className="text-white" />
              </div>
              <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 tracking-widest uppercase">Rankings</span>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Leaderboard</h1>
            <p className="text-slate-500 dark:text-slate-400">Compete with the best in the CyberVerse community</p>
          </div>

          {/* Stats strip */}
          <div className="flex items-center gap-6 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl p-6 rounded-2xl border border-white/20 dark:border-slate-800 shadow-lg mb-0.5">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{leaderboardData.length}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Players</p>
            </div>
            <div className="w-px h-10 bg-slate-200 dark:bg-slate-700" />
            <div className="text-center">
              <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">Live</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Updated</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-6xl py-8">

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl p-1 gap-1">
            {["global", "weekly", "monthly"].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabSwitch(tab)}
                className={`relative px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 capitalize ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 shadow-md shadow-cyan-400/30"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {activeTab === tab && isFiltering && (
                  <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-cyan-400">
                    <span className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                  </span>
                )}
                {tab}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            {isFiltering && searchQuery && (
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-slate-300 dark:border-slate-600 border-t-cyan-400 rounded-full animate-spin" />
            )}
            <input
              type="text"
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 transition-all"
            />
          </div>
        </div>

        {leaderboardError ? (
          <div className="text-center py-16 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 rounded-2xl">
            <p className="text-red-500 font-medium">Failed to load leaderboard</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
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
                      className={`relative bg-white dark:bg-[#111827] border ${cfg.border} rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${cfg.shadow} ${isFirst ? "md:order-2 ring-1 ring-cyan-400/30" : realIdx === 1 ? "md:order-1" : "md:order-3"}`}
                    >
                      <div className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-br ${cfg.bg} opacity-5 rounded-full -mr-10 -mt-10`} />
                      <div className="relative">
                        <div className="flex items-center justify-between mb-5">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r ${cfg.bg} bg-opacity-10`}>
                            {cfg.icon}
                            <span className={`text-sm font-bold ${cfg.textColor}`}>{cfg.label}</span>
                          </div>
                          {isFirst && <span className="text-xs font-semibold text-cyan-500 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 px-2 py-1 rounded-full">Top Rank</span>}
                        </div>
                        <div className="flex items-center gap-3 mb-5">
                          <div className={`${isFirst ? "w-16 h-16 text-2xl" : "w-12 h-12 text-lg"} rounded-2xl bg-gradient-to-br ${cfg.bg} flex items-center justify-center font-bold text-white shadow-lg ${cfg.shadow}`}>
                            {player.username.slice(0, 1).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={`${isFirst ? "text-xl" : "text-base"} font-bold text-slate-900 dark:text-white truncate`}>{player.username}</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Shield size={12} className="text-slate-400" />
                              <span className="text-xs text-slate-500 dark:text-slate-400">Level {player.level || 1}</span>
                            </div>
                          </div>
                        </div>
                        <div className={`flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800`}>
                          <span className="text-xs text-slate-500 dark:text-slate-400">Total Points</span>
                          <span className={`${isFirst ? "text-xl" : "text-base"} font-bold ${cfg.textColor}`}>{player.points.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Table */}
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-hidden shadow-sm">
              {/* Table Header */}
              <div className="grid grid-cols-[48px_1fr_80px_100px] sm:grid-cols-[48px_1fr_80px_80px_110px] items-center px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">#</span>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Player</span>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:block">Level</span>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:block">Change</span>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Points</span>
              </div>

              {isLoading ? (
                <div>
                  {Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}
                </div>
              ) : filteredLeaderboard.length === 0 ? (
                <div className="text-center py-16">
                  <Search size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400 font-medium">No players found</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredLeaderboard.map((player) => {
                    const isUser = player.username === ud.name || player.name === ud.name;
                    const rankChange = player.rankChange || 0;
                    return (
                      <div
                        key={player.rank}
                        className={`grid grid-cols-[48px_1fr_80px_100px] sm:grid-cols-[48px_1fr_80px_80px_110px] items-center px-6 py-4 transition-all duration-150 group ${
                          isUser
                            ? "bg-cyan-50 dark:bg-cyan-900/10 border-l-[3px] border-cyan-400"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        }`}
                      >
                        <span className={`text-sm font-bold ${isUser ? "text-cyan-600 dark:text-cyan-400" : "text-slate-400 dark:text-slate-500"}`}>
                          {player.rank <= 3 ? (
                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold text-white bg-gradient-to-br ${
                              player.rank === 1 ? "from-amber-400 to-yellow-500" :
                              player.rank === 2 ? "from-slate-400 to-slate-500" :
                              "from-orange-500 to-amber-600"
                            }`}>{player.rank}</span>
                          ) : `#${player.rank}`}
                        </span>

                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 transition-transform duration-150 group-hover:scale-105 ${
                            isUser
                              ? "bg-gradient-to-br from-cyan-400 to-cyan-600 text-white shadow-md shadow-cyan-400/30"
                              : "bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 text-slate-700 dark:text-slate-200"
                          }`}>
                            {player.username.slice(0, 1).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className={`text-sm font-semibold truncate ${isUser ? "text-cyan-700 dark:text-cyan-300" : "text-slate-900 dark:text-white"}`}>
                              {player.username}
                              {isUser && <span className="ml-2 text-[10px] font-bold text-cyan-500 bg-cyan-100 dark:bg-cyan-900/30 px-1.5 py-0.5 rounded-full">You</span>}
                            </p>
                          </div>
                        </div>

                        <span className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">Lv. {player.level || 1}</span>

                        <div className="hidden sm:flex items-center">
                          {rankChange > 0 ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">
                              <TrendingUp size={12} /> +{rankChange}
                            </span>
                          ) : rankChange < 0 ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg">
                              <TrendingDown size={12} /> {rankChange}
                            </span>
                          ) : (
                            <Minus size={14} className="text-slate-300 dark:text-slate-600" />
                          )}
                        </div>

                        <div className="text-right">
                          <span className={`text-sm font-bold ${isUser ? "text-cyan-600 dark:text-cyan-400" : "text-slate-900 dark:text-white"}`}>
                            {player.points.toLocaleString()}
                          </span>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500">pts</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* Your Rank Footer */}
        {ud.name && userRank && (
          <div className="mt-6 relative bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-2xl p-6 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5" />
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-400/5 rounded-full -mr-24 -mt-24 blur-2xl" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-xl font-bold text-white shadow-xl shadow-cyan-400/25">
                  {ud.name?.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Your Standing</p>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">#{userRank}</span>
                    <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Points</p>
                      <p className="text-base font-bold text-cyan-600 dark:text-cyan-400">{(ud.xp || 0).toLocaleString()}</p>
                    </div>
                    <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Level</p>
                      <p className="text-base font-bold text-slate-900 dark:text-white">{ud.level || 1}</p>
                    </div>
                  </div>
                </div>
              </div>
              {pointsToNextRank > 0 && (
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3">
                  <TrendingUp size={18} className="text-cyan-500" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">To next rank</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">+{pointsToNextRank.toLocaleString()} pts</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

Leaderboard.displayName = "Leaderboard";
export default Leaderboard;
