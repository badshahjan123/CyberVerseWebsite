import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Trophy,
  Star,
  Clock,
  Target,
  ArrowRight,
  RotateCcw,
  Home,
  Award,
  Zap,
  Shield,
  Layout,
  ChevronRight,
  Share2
} from "lucide-react";
import { getRoomBySlug } from "../../services/rooms";
import { getRoomProgress, resetRoomProgress } from "../../services/roomProgress";
import { useApp } from "../../contexts/app-context";
import { useActivity } from "../../contexts/activity-context";
import { useToast } from "../../contexts/toast-context";

const RoomCompleted = () => {
  const { slug: roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useApp();
  const { resetRoomProgress: resetActivityProgress } = useActivity();
  const { toast } = useToast();
  const [room, setRoom] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [roomData, progressData] = await Promise.all([
          getRoomBySlug(roomId),
          getRoomProgress(roomId),
        ]);
        setRoom(roomData);
        setProgress(progressData.progress);
      } catch (error) {
        console.error("Failed to load room completion data:", error);
        navigate("/rooms");
      } finally {
        setLoading(false);
      }
    };

    if (user) loadData();
  }, [roomId, user, navigate]);

  const handleTryAgain = async () => {
    try {
      if(!confirm("Are you sure you want to reset all progress for this room?")) return;
      setResetting(true);
      await resetRoomProgress(roomId);
      resetActivityProgress(roomId);
      toast({ title: "Sector Reset", description: "Commencing new operation..." });
      navigate(`/rooms/${roomId}`);
    } catch (error) {
      console.error("Failed to reset progress:", error);
      toast({ title: "Reset Failed", description: "System failure during reset." });
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
           <span className="text-primary font-bold animate-pulse uppercase tracking-[0.2em] text-xs">Processing Intel...</span>
        </div>
      </div>
    );
  }

  if (!room || !progress?.completed) {
    navigate("/rooms");
    return null;
  }

  const stats = {
    score:
      progress.finalScore && progress.finalScore > 1000000000000
        ? progress.quizScore?.percentage || 100
        : progress.finalScore || progress.quizScore?.percentage || 100,
    xp: progress.totalXP || progress.totalPointsEarned || room.points || 500,
    timeSpent: "15m 42s",
    tasksCompleted: progress.completedLectures?.length || 0,
  };

  return (
    <div className="rcp-root min-h-screen pb-20">
      <div className="rcp-grid-bg" />
      
      {/* ── TOP NAV ── */}
      <div className="rcp-header flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0B0F1A]/80 backdrop-blur-md sticky top-0 z-50">
         <div className="flex items-center gap-4">
            <button onClick={() => navigate("/rooms")} className="text-slate-500 hover:text-white transition-colors">
               <RotateCcw size={18} className="rotate-180"/>
            </button>
            <div className="h-4 w-px bg-slate-800" />
            <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Mission Summary // {room.id?.substring(0,8)}</span>
         </div>
         <div className="flex items-center gap-3">
            <button className="rcp-icon-btn"><Share2 size={16}/></button>
            <button onClick={() => navigate("/dashboard")} className="rcp-primary-btn text-xs py-2 px-4">Exit Archive</button>
         </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl mt-12">
        {/* ── HERO BANNER ── */}
        <div className="relative mb-12 rcp-fade-in text-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 blur-[120px] rounded-full -z-10" />
          
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-primary/10 border border-primary/20 mb-8 relative">
             <Trophy size={48} className="text-primary rcp-bounce" />
             <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-success flex items-center justify-center border-4 border-[#0B0F1A]">
                <Shield size={14} className="text-white"/>
             </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-white italic tracking-tighter mb-4 uppercase">
            Sector Cleared
          </h1>
          <p className="text-lg text-slate-400 font-medium">
            Subject successfully dominated <span className="text-primary font-bold uppercase tracking-widest ml-2">"{room.title}"</span>
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
           
           {/* LEFT: PERFORMANCE MATRIX */}
           <div className="lg:col-span-2 space-y-8">
              
              <div className="rcp-card overflow-hidden">
                 <div className="p-1.5 bg-white/5 border-b border-white/5 flex items-center gap-2">
                    <div className="flex gap-1.5 px-3">
                       <div className="w-1.5 h-1.5 rounded-full bg-red-500/50"/>
                       <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50"/>
                       <div className="w-1.5 h-1.5 rounded-full bg-green-500/50"/>
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Performance_Diagnostics</span>
                 </div>
                 
                 <div className="p-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       <div className="rcp-stat-box">
                          <span className="rcp-stat-lbl">Efficiency</span>
                          <span className="rcp-stat-val text-white">{stats.score}%</span>
                          <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                             <div className="h-full bg-primary" style={{width: `${stats.score}%`}}/>
                          </div>
                       </div>
                       <div className="rcp-stat-box">
                          <span className="rcp-stat-lbl">Intel Harvested</span>
                          <span className="rcp-stat-val text-primary">+{stats.xp} XP</span>
                          <span className="text-[10px] text-slate-500 font-bold mt-1 tracking-tighter">PREV: 0 XP</span>
                       </div>
                       <div className="rcp-stat-box">
                          <span className="rcp-stat-lbl">Time in Field</span>
                          <span className="rcp-stat-val text-white">{stats.timeSpent}</span>
                          <span className="text-[10px] text-slate-500 font-bold mt-1 tracking-tighter">TOP 5% SPEED</span>
                       </div>
                       <div className="rcp-stat-box">
                          <span className="rcp-stat-lbl">Tasks Zeroed</span>
                          <span className="rcp-stat-val text-white">{stats.tasksCompleted} / {room.tasks?.length || stats.tasksCompleted}</span>
                          <span className="text-[10px] text-success font-bold mt-1 tracking-tighter">100% COVERAGE</span>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="rcp-card p-6">
                 <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Award size={14} className="text-primary"/> Achievements Unlocked
                 </h3>
                 <div className="flex flex-wrap gap-4">
                    <div className="rcp-badge">
                       <Shield size={16} className="text-primary"/>
                       <div className="flex flex-col">
                          <span className="text-white font-bold text-[11px]">System Breaker</span>
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Room Completed</span>
                       </div>
                    </div>
                    {stats.score >= 90 && (
                       <div className="rcp-badge rcp-badge--gold">
                          <Star size={16} className="text-warning text-yellow-400"/>
                          <div className="flex flex-col">
                             <span className="text-white font-bold text-[11px]">Apex Predator</span>
                             <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Score {stats.score}%</span>
                          </div>
                       </div>
                    )}
                    <div className="rcp-badge">
                       <Target size={16} className="text-success"/>
                       <div className="flex flex-col">
                          <span className="text-white font-bold text-[11px]">Full Coverage</span>
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">All Tasks Done</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* RIGHT: NEXT OPS */}
           <div className="space-y-6">
              <div className="rcp-card p-6 border-primary/20 bg-primary/5">
                 <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-4">Command Briefing</h3>
                 <p className="text-xs text-slate-400 leading-relaxed font-medium mb-6">
                    Operator <span className="text-white font-bold">@{user?.username || "Ghost"}</span>, you have successfully compromised this sector. Intelligence reports suggest immediate advancement to higher difficulty domains.
                 </p>
                 <div className="space-y-3">
                    <Link to="/rooms" className="rcp-primary-btn w-full justify-center gap-2 py-4">
                       Advance to Next Op <ArrowRight size={18}/>
                    </Link>
                    <button onClick={handleTryAgain} disabled={resetting} className="rcp-secondary-btn w-full justify-center gap-2 py-4">
                       <RotateCcw size={16} className={resetting ? "animate-spin" : ""}/>
                       {resetting ? "Purging Progress..." : "Replay Simulation"}
                    </button>
                 </div>
              </div>

              <div className="rcp-card p-6">
                 <h3 className="text-slate-500 font-black text-xs uppercase tracking-[0.2em] mb-4">Intel Suggestions</h3>
                 <div className="space-y-3">
                    <button onClick={() => navigate(`/rooms?category=${room.category}`)} className="rcp-suggest-card">
                       <Layout size={16} className="text-primary"/>
                       <div className="flex-1 text-left">
                          <span className="block text-[11px] font-bold text-white">More {room.category}</span>
                          <span className="block text-[9px] text-slate-500 uppercase font-black">7 Available Ops</span>
                       </div>
                       <ChevronRight size={14} className="text-slate-700"/>
                    </button>
                    <button onClick={() => navigate(`/rooms?difficulty=Medium`)} className="rcp-suggest-card">
                       <Zap size={16} className="text-warning"/>
                       <div className="flex-1 text-left">
                          <span className="block text-[11px] font-bold text-white">Increase Difficulty</span>
                          <span className="block text-[9px] text-slate-500 uppercase font-black">Level Up Ops</span>
                       </div>
                       <ChevronRight size={14} className="text-slate-700"/>
                    </button>
                 </div>
              </div>
           </div>

        </div>

        {/* ── FOOTER ACTIONS ── */}
        <div className="mt-12 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                 <Home size={20} className="text-slate-400"/>
              </div>
              <div className="flex flex-col">
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Return Home</span>
                 <Link to="/dashboard" className="text-xs text-white font-bold hover:text-primary transition-colors">Go to Control Center</Link>
              </div>
           </div>
           
           <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest italic mr-2">CV_SYSTEM_VERIFIED // 200_OK</span>
              <div className="w-16 h-1.5 bg-success/20 rounded-full overflow-hidden">
                 <div className="w-full h-full bg-success"/>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCompleted;
