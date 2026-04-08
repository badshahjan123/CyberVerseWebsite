import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Github,
  Twitter,
  Linkedin,
  MapPin,
  Calendar,
  Trophy,
  Target,
  Shield,
  Star,
  Award,
  Flame,
  Crown,
} from "lucide-react";
import { useApp } from "../../contexts/app-context";
import { useRealtime } from "../../contexts/realtime-context";
import { apiCall, API_BASE_URL } from "../../config/api";
import BadgeIcon from "../../components/achievements/BadgeIcon";

// Helper function to generate activity heatmap data for last 365 days
const generateHeatmapData = (roomProgress = []) => {
  const data = [];
  const today = new Date();

  // Create a map of dates with completion counts
  const activityMap = new Map();

  roomProgress.forEach((room) => {
    if (room.completedAt) {
      const date = new Date(room.completedAt).toISOString().split("T")[0];
      activityMap.set(date, (activityMap.get(date) || 0) + 1);
    }
  });

  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    const level = Math.min(activityMap.get(dateStr) || 0, 4);

    data.push({
      date: dateStr,
      level: level,
    });
  }

  return data;
};

const Profile = () => {
  const { user, refreshUser } = useApp();
  const { userStats } = useRealtime();
  const [heatmapData, setHeatmapData] = useState([]);
  const [badges, setBadges] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stats merging: Prefer RealtimeContext for volatile stats, use AppContext for identity/progress
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
      setBadges(badgesResponse.badges || []);

      const recentRooms = user.roomProgress
        ?.filter((rp) => rp.completed)
        ?.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
        ?.slice(0, 3) || [];
      setRecentActivity(recentRooms);

      setHeatmapData(generateHeatmapData(user.roomProgress || []));
    } catch (error) {
      console.error("Profile Retrieval Failure:", error);
    } finally {
      if (!bypassLoading) setLoading(false);
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  // Real-time listeners for profile sync
  useEffect(() => {
    const handleSync = async () => {
      console.log("🔄 Profile Sync Triggered...");
      await refreshUser(); // This updates the 'user' object in AppContext
      fetchProfileData(true); // Re-fetch auxiliary data (badges, recent activity)
    };

    window.addEventListener("roomCompleted", handleSync);
    window.addEventListener("labCompleted", handleSync);
    
    return () => {
      window.removeEventListener("roomCompleted", handleSync);
      window.removeEventListener("labCompleted", handleSync);
    };
  }, [refreshUser, fetchProfileData]);

  const weeks = [];
  for (let i = 0; i < heatmapData.length; i += 7) {
    weeks.push(heatmapData.slice(i, i + 7));
  }

  if (loading || !user) {
    return (
      <div className="up-root flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="up-root">
      <div className="up-grid" />
      <div className="up-bg-glow" />

      <div className="container mx-auto px-4 max-w-7xl pt-12 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ── IDENTITY COLUMN ── */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
            <div className="up-identity-card rcp-fade-in">
               <div className="up-avatar-wrap">
                  <div className="up-avatar-ring" />
                  <img 
                    src={user.avatar?.startsWith('http') ? user.avatar : `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`} 
                    className="up-avatar-img"
                    alt="Subject"
                  />
               </div>
               
               <h2 className="text-3xl font-black text-white italic tracking-tighter mb-1 uppercase">
                  {user.name}
               </h2>
               <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-6">
                  {user.email}
               </p>

               <div className="flex flex-wrap justify-center gap-2 mb-8">
                  <div className="up-rank-tag">
                     <Trophy size={10} className="mr-2" /> Global #{ud.rank || '---'}
                  </div>
                  {ud.isPremium && (
                    <div className="up-rank-tag !text-primary !border-primary/20 !bg-primary/5">
                       <Crown size={10} className="mr-2" /> Elite Tier
                    </div>
                  )}
               </div>

               <div className="grid grid-cols-2 gap-3">
                  <div className="up-stat-tile">
                     <div className="up-stat-val text-primary">{ud.completedRooms || 0}</div>
                     <div className="up-stat-label">Operations</div>
                  </div>
                  <div className="up-stat-tile">
                     <div className="up-stat-val text-white">{ud.streak || 0}</div>
                     <div className="up-stat-label">Day Streak</div>
                  </div>
               </div>

               <div className="mt-8 pt-8 border-t border-white/5">
                  <div className="flex items-center justify-center gap-6 text-slate-500">
                     <Github size={20} className="hover:text-white cursor-pointer transition-colors" />
                     <Twitter size={20} className="hover:text-white cursor-pointer transition-colors" />
                     <Linkedin size={20} className="hover:text-white cursor-pointer transition-colors" />
                  </div>
               </div>
            </div>
          </div>

          {/* ── ACHIEVEMENT DATA ── */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* ACTIVITY MATRIX */}
            <div className="up-matrix-card rcp-fade-in" style={{ animationDelay: '0.1s' }}>
               <div className="up-section-title">
                  <Target size={20} className="text-primary" />
                  Activity Matrix
               </div>
               
               <div className="up-heatmap-grid">
                  {weeks.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-1">
                       {week.map((day, di) => (
                         <div 
                           key={di} 
                           className={`up-heatmap-day up-heatmap-day--${day.level}`}
                           title={`${day.date}: ${day.level} activity`}
                         />
                       ))}
                    </div>
                  ))}
               </div>
               <div className="flex justify-between mt-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                  <span>Past 365 Days Operation Log</span>
                  <div className="flex items-center gap-2">
                     <span>Less</span>
                     <div className="flex gap-1">
                        <div className="w-2 h-2 bg-slate-800 rounded-sm" />
                        <div className="w-2 h-2 up-heatmap-day--4 rounded-sm" />
                     </div>
                     <span>More</span>
                  </div>
               </div>
            </div>

            {/* SKILL INSIGNIAS */}
            {badges.length > 0 && (
              <div className="up-matrix-card rcp-fade-in" style={{ animationDelay: '0.2s' }}>
                 <div className="up-section-title">
                    <Award size={20} className="text-purple-500" />
                    Operational Insignias
                 </div>
                 <div className="up-badge-grid">
                    {badges.map(b => (
                      <div key={b._id} className="up-badge-item">
                         <span className="up-badge-icon">{b.icon || '🏆'}</span>
                         <div className="text-[11px] font-black text-white uppercase mb-1">{b.name}</div>
                         <div className="text-[9px] font-bold text-slate-600 leading-tight">{b.description}</div>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {/* MISSION LOGS */}
            <div className="up-matrix-card rcp-fade-in" style={{ animationDelay: '0.3s' }}>
               <div className="up-section-title">
                  <Flame size={20} className="text-danger" />
                  Recent Mission Logs
               </div>
               
               {recentActivity.length === 0 ? (
                 <div className="text-center py-12 border border-dashed border-white/5 rounded-2xl">
                    <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">No Recent Field Activity</p>
                 </div>
               ) : (
                 <div className="space-y-3">
                    {recentActivity.map((activity, i) => (
                      <div key={i} className="up-activity-row group">
                         <div className="up-activity-icon">
                            <Shield size={20} />
                         </div>
                         <div className="flex-1">
                            <h4 className="font-black text-white uppercase italic group-hover:text-primary transition-colors">
                               Room Objective Decoupled
                            </h4>
                            <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">
                               Detected: {new Date(activity.completedAt).toLocaleDateString()}
                            </div>
                         </div>
                         <div className="text-right">
                            <div className="text-xl font-black text-primary italic">100%</div>
                            <div className="text-[9px] font-black text-slate-600 uppercase">Yield</div>
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

