import { useEffect, useState, memo, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../contexts/app-context";
import { useRealTimeLeaderboard } from "../hooks/useRealTimeLeaderboard";
import { useRealtime } from "../contexts/realtime-context";
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  Crown,
  Star,
  Zap,
  Target,
  Search,
  ChevronUp,
  Globe,
  ArrowRight,
  Flame,
  Shield
} from "lucide-react";
import BadgeIcon from "../components/achievements/BadgeIcon";

const Leaderboard = memo(() => {
  const { isAuthenticated, loading, user } = useApp();
  const { userStats } = useRealtime();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("global");
  const [searchQuery, setSearchQuery] = useState("");
  const [showLoadingSkeleton, setShowLoadingSkeleton] = useState(false);
  const {
    leaderboard,
    loading: leaderboardLoading,
    error: leaderboardError,
  } = useRealTimeLeaderboard();

  const ud = {
    ...user,
    ...userStats,
    xp: userStats?.totalXP || user?.points || 0,
    rank: userStats?.rank || user?.rank || 999
  };

  // Process leaderboard data
  const leaderboardData = useMemo(() => {
    return leaderboard.map((player) => ({
      ...player,
      username: player.name,
      trend: "up",
    }));
  }, [leaderboard]);

  // Filter leaderboard by search query
  const filteredLeaderboard = useMemo(() => {
    if (!searchQuery) return leaderboardData;
    return leaderboardData.filter((player) =>
      player.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [leaderboardData, searchQuery]);

  // Split into top 3 (champions) and rest (challengers)
  const champions = filteredLeaderboard.slice(0, 3);
  const challengers = filteredLeaderboard.slice(3);

  // Derive user rank from leaderboard index
  const userRank = useMemo(() => {
    if (!ud.name || !leaderboardData?.length) return ud.rank || 999;
    const pos = leaderboardData.findIndex(p => p.name === ud.name);
    return pos !== -1 ? pos + 1 : (ud.rank || 999);
  }, [ud.name, ud.rank, leaderboardData]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setShowLoadingSkeleton(true);
    setTimeout(() => setShowLoadingSkeleton(false), 400);
  };

  // Calculate points to next rank
  const pointsToNextRank = useMemo(() => {
    if (!ud.xp || !userRank || userRank === 1) return null;
    const nextPlayer = leaderboardData[userRank - 2];
    if (!nextPlayer) return null;
    return nextPlayer.points - (ud.xp || 0);
  }, [ud.xp, userRank, leaderboardData]);

  if (loading) return null;

  return (
    <div className="lb-root">
      <div className="lb-grid" />
      <div className="lb-bg-glow" />

      <div className="container mx-auto px-4 max-w-7xl pt-16 pb-40">
        
        {/* ── HEADER & SEARCH ── */}
        <div className="lb-title-wrap">
           <span className="text-[10px] font-black tracking-[0.4em] text-primary uppercase mb-4 block">Operation: Global Dominance</span>
           <h1 className="lb-title-main">Leaderboard</h1>
           
           <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-12">
              <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                 {["global", "weekly", "monthly"].map((tab) => (
                    <button
                       key={tab}
                       onClick={() => handleTabSwitch(tab)}
                       className={`lb-tab-btn ${activeTab === tab ? 'lb-tab-btn--active' : ''}`}
                    >
                       {tab}
                    </button>
                 ))}
              </div>

              <div className="relative w-full max-w-md">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                 <input 
                    type="text" 
                    placeholder="Locate Subject..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/40 focus:bg-white/10 transition-all font-medium"
                 />
              </div>
           </div>
        </div>

        {leaderboardLoading || showLoadingSkeleton ? (
           <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
              <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Synchronizing Data...</span>
           </div>
        ) : leaderboardError ? (
           <div className="text-center py-20 bg-danger/5 border border-danger/20 rounded-3xl">
              <p className="text-danger font-bold uppercase tracking-widest">Connection Failure: {leaderboardError}</p>
           </div>
        ) : filteredLeaderboard.length === 0 ? (
           <div className="text-center py-20">
              <p className="text-slate-500 font-bold uppercase tracking-widest">No Intelligence Matching Filter</p>
           </div>
        ) : (
           <>
              {/* ── CHAMPIONS PODIUM ── */}
              <div className="lb-podium">
                 {/* RANK #2 */}
                 {champions[1] && (
                    <div className="lb-pod-item lb-pod-item--2 rcp-fade-in" style={{ animationDelay: '0.1s' }}>
                       <div className="lb-avatar-ring">
                          <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-3xl font-black text-slate-300">
                             {champions[1].username.slice(0,1)}
                          </div>
                          <div className="lb-rank-badge">2</div>
                          <Medal className="absolute -top-5 left-1/2 -translate-x-1/2 text-slate-400 drop-shadow-[0_0_8px_rgba(203,213,225,0.4)]" size={28} />
                       </div>
                       <h3 className="text-xl font-black text-white truncate px-2 mb-1">{champions[1].username}</h3>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Elite Operator</p>
                       <div className="flex items-center justify-center gap-2 mb-4">
                          <Shield size={14} className="text-slate-400" />
                          <span className="text-xs font-bold text-slate-500">LVL {champions[1].level || 1}</span>
                       </div>
                       <div className="lb-xp-pill border border-slate-400/30 bg-slate-400/10 text-slate-300 text-center mx-auto inline-block">
                          {champions[1].points.toLocaleString()} XP
                       </div>
                    </div>
                 )}

                 {/* RANK #1 */}
                 {champions[0] && (
                    <div className="lb-pod-item lb-pod-item--1 rcp-fade-in">
                       <div className="lb-avatar-ring">
                          <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-600 to-yellow-800 flex items-center justify-center text-4xl font-black text-yellow-100">
                             {champions[0].username.slice(0,1)}
                          </div>
                          <div className="lb-rank-badge">1</div>
                          <Crown className="absolute -top-8 left-1/2 -translate-x-1/2 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" size={36} />
                       </div>
                       <h3 className="text-2xl font-black text-white truncate px-2 mb-1">{champions[0].username}</h3>
                       <p className="text-[11px] font-black text-yellow-400 uppercase tracking-[0.3em] mb-3">CHAMPION</p>
                       <div className="flex items-center justify-center gap-3 mb-5">
                          <div className="flex items-center gap-1.5">
                             <Trophy size={16} className="text-yellow-400" />
                             <span className="text-xs font-bold text-yellow-500">LVL {champions[0].level || 1}</span>
                          </div>
                          <div className="h-4 w-px bg-yellow-500/30" />
                          <div className="flex items-center gap-1.5">
                             <Flame size={16} className="text-orange-400" />
                             <span className="text-xs font-bold text-orange-400">{champions[0].streak || 0} Day</span>
                          </div>
                       </div>
                       <div className="lb-xp-pill bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 text-lg py-2 px-7 shadow-[0_0_20px_rgba(250,204,21,0.2)]">
                          {champions[0].points.toLocaleString()} XP
                       </div>
                    </div>
                 )}

                 {/* RANK #3 */}
                 {champions[2] && (
                    <div className="lb-pod-item lb-pod-item--3 rcp-fade-in" style={{ animationDelay: '0.2s' }}>
                       <div className="lb-avatar-ring">
                          <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-700 to-orange-900 flex items-center justify-center text-3xl font-black text-orange-300">
                             {champions[2].username.slice(0,1)}
                          </div>
                          <div className="lb-rank-badge">3</div>
                          <Award className="absolute -top-5 left-1/2 -translate-x-1/2 text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]" size={28} />
                       </div>
                       <h3 className="text-xl font-black text-white truncate px-2 mb-1">{champions[2].username}</h3>
                       <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-2">Rising Star</p>
                       <div className="flex items-center justify-center gap-2 mb-4">
                          <Star size={14} className="text-orange-400" />
                          <span className="text-xs font-bold text-orange-500">LVL {champions[2].level || 1}</span>
                       </div>
                       <div className="lb-xp-pill border border-orange-600/30 bg-orange-600/10 text-orange-400 text-center mx-auto inline-block">
                          {champions[2].points.toLocaleString()} XP
                       </div>
                    </div>
                 )}
              </div>

              {/* ── CHALLENGERS LIST ── */}
              <div className="lb-list-wrap rcp-fade-in" style={{ animationDelay: '0.4s' }}>
                 <div className="flex items-center justify-between mb-6 px-6">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                       <Target size={14} className="text-primary"/> Field Challengers
                    </span>
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">Verified by CyberVerse Engine</span>
                 </div>

                 {challengers.map((player, idx) => {
                    const isUser = player.username === ud.name || player.name === ud.name;
                    const rankChange = player.rankChange || 0;
                    const xpProgress = ((player.points % 1000) / 1000) * 100;
                    
                    return (
                       <div key={player.rank} className={`lb-row ${isUser ? 'lb-row--user shadow-[0_0_30px_rgba(0,245,255,0.08)]' : ''}`} style={{ animationDelay: `${0.5 + idx * 0.05}s` }}>
                          <div className="lb-rank-num">#{player.rank}</div>
                          <div className="lb-user-info">
                             <div className="lb-user-avatar">
                                {player.username.slice(0,2).toUpperCase()}
                             </div>
                             <div className="flex-1">
                                <h4 className="font-bold text-white text-sm leading-none mb-1.5">{player.username}</h4>
                                <div className="flex items-center gap-3">
                                   <div className="flex items-center gap-1.5">
                                      <Zap size={12} className="text-primary" />
                                      <span className="text-[10px] font-bold text-slate-500 uppercase">LVL {player.level || 1}</span>
                                   </div>
                                   <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
                                      <div className="h-full bg-gradient-to-r from-primary to-purple-500" style={{ width: `${xpProgress}%` }} />
                                   </div>
                                   {player.streak > 0 && (
                                      <div className="flex items-center gap-1">
                                         <Flame size={12} className="text-orange-400" />
                                         <span className="text-[10px] font-bold text-orange-400">{player.streak}</span>
                                      </div>
                                   )}
                                </div>
                             </div>
                          </div>
                          <div className="flex items-center justify-center">
                             {rankChange > 0 ? (
                                <div className="flex items-center gap-1">
                                   <TrendingUp size={18} className="text-success" />
                                   <span className="text-xs font-bold text-success">+{rankChange}</span>
                                </div>
                             ) : rankChange < 0 ? (
                                <div className="flex items-center gap-1">
                                   <TrendingDown size={18} className="text-danger" />
                                   <span className="text-xs font-bold text-danger">{rankChange}</span>
                                </div>
                             ) : (
                                <Minus size={18} className="text-slate-600" />
                             )}
                          </div>
                          <div className="text-right">
                             <div className="lb-xp-pill inline-block">{player.points.toLocaleString()} XP</div>
                             {player.badges && player.badges > 0 && (
                                <div className="flex items-center justify-end gap-1 mt-1">
                                   <Trophy size={12} className="text-yellow-500" />
                                   <span className="text-[10px] font-bold text-slate-500">{player.badges} badges</span>
                                </div>
                             )}
                          </div>
                       </div>
                    );
                 })}
              </div>
           </>
        )}
      </div>

      {/* ── MY RANK STATUS FOOTER ── */}
      {ud.name && userRank && (
         <div className="lb-status-footer rcp-fade-in">
            <div className="container mx-auto max-w-7xl flex items-center justify-between gap-4 flex-wrap">
               <div className="flex items-center gap-6">
                  <div className="lb-user-avatar !w-16 !h-16 !text-2xl !bg-gradient-to-br !from-primary/20 !to-purple-500/20 !border-primary/30 !text-primary !shadow-[0_0_20px_rgba(0,245,255,0.2)]">
                     {ud.name?.slice(0,1).toUpperCase()}
                  </div>
                  <div>
                     <h5 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Globe size={12} className="text-primary" />
                        Your Global Rank
                     </h5>
                     <div className="flex items-center gap-3">
                        <span className="text-3xl font-black text-white italic tracking-tighter">#{userRank}</span>
                        <div className="h-2 w-2 rounded-full bg-success animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                        <span className="text-[10px] font-bold text-success uppercase tracking-widest">Live</span>
                     </div>
                  </div>
               </div>

               <div className="hidden lg:flex items-center gap-12">
                  <div className="text-right">
                     <span className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 flex items-center justify-end gap-1.5">
                        <Zap size={12} className="text-primary" />
                        Total XP
                     </span>
                     <span className="text-2xl font-black text-primary">{(ud.xp || 0).toLocaleString()}</span>
                  </div>
                  <div className="h-12 w-px bg-slate-800" />
                  <div className="text-right">
                     <span className="block text-[10px] font-black text-slate-500 uppercase mb-1.5">Next Rank</span>
                     <div className="flex items-center gap-2 justify-end">
                        <ChevronUp className="text-warning" size={18} />
                        <span className="text-sm font-black text-warning uppercase">{pointsToNextRank > 0 ? `+${pointsToNextRank?.toLocaleString()} XP` : 'Top Rank!'}</span>
                     </div>
                  </div>
                  <div className="h-12 w-px bg-slate-800" />
                  <div className="text-right">
                     <span className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 flex items-center justify-end gap-1.5">
                        <Trophy size={12} className="text-yellow-500" />
                        Level
                     </span>
                     <span className="text-2xl font-black text-yellow-500">{ud.level || 1}</span>
                  </div>
               </div>

               <button onClick={() => navigate("/rooms")} className="rcp-primary-btn !py-3.5 !px-8 !text-sm !bg-gradient-to-r !from-primary !to-purple-500 !text-black flex items-center gap-2 !shadow-[0_0_30px_rgba(0,245,255,0.3)] hover:!shadow-[0_0_40px_rgba(0,245,255,0.5)] hover:scale-105 transition-all">
                  <Zap size={16} />
                  Start Training
                  <ArrowRight size={16}/>
               </button>
            </div>
         </div>
      )}
    </div>
  );
});

Leaderboard.displayName = "Leaderboard";
export default Leaderboard;
