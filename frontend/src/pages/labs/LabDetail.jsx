import { useParams, Link } from "react-router-dom";
import { useState, memo, useMemo, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Users,
  Trophy,
  Lock,
  CheckCircle,
  ArrowRight,
  Shield,
  Layout,
  Terminal,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Info,
  Zap,
  HelpCircle,
  Monitor,
  Download,
} from "lucide-react";
import { useApp } from "../../contexts/app-context";
import axios from "../../api/axios";

/* ─── Task Component (THM Style) ─── */
const LabTask = memo(({ task, index, onComplete }) => {
  const [expanded, setExpanded] = useState(index === 0);
  const [answer, setAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);

  return (
    <div 
      className={`mb-4 rounded-xl transition-all duration-300 ${
        task.completed 
          ? "border border-emerald-500/30 bg-[#10b98108]" 
          : "border border-slate-700/50 bg-[#1a2332]"
      }`}
    >
      {/* Task Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 px-6 text-left"
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
            task.completed ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-[#242f44] text-slate-400"
          }`}>
            {task.completed ? <CheckCircle size={18} /> : index + 1}
          </div>
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${task.completed ? "text-emerald-500" : "text-slate-500"}`}>
              Task {index + 1}
            </p>
            <h3 className="font-bold text-white transition-colors group-hover:text-blue-400">
              {task.title}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-3">
           {task.completed && <span className="hidden sm:inline-block text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded tracking-widest uppercase">Completed</span>}
           {expanded ? <ChevronUp size={20} className="text-slate-500" /> : <ChevronDown size={20} className="text-slate-500" />}
        </div>
      </button>

      {/* Task Content */}
      {expanded && (
        <div className="px-6 pb-6 animate-fade-in">
          <div className="h-px bg-slate-700/30 mb-5" />
          <div className="prose prose-invert max-w-none mb-6">
            <p className="text-slate-300 leading-relaxed text-sm">
              {task.description || "In this task, you will explore the technical details of the environment and perform specific checks to identify vulnerabilities."}
            </p>
          </div>

          {/* Question Section */}
          <div className="space-y-4">
            {task.questions?.map((q, qIdx) => (
              <div key={qIdx} className="bg-[#0d1829] p-5 rounded-lg border border-slate-700/30">
                <div className="flex items-start gap-3 mb-4">
                   <HelpCircle size={16} className="text-blue-400 mt-0.5" />
                   <p className="text-sm font-semibold text-white">{q.question}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <input 
                      type="text"
                      placeholder="Enter your answer here..."
                      className="w-full bg-[#1a2332] border border-slate-700 rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-all font-mono"
                      value={task.completed ? "**********" : answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      disabled={task.completed}
                    />
                    {task.completed && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500"><CheckCircle size={16} /></div>}
                  </div>
                  <button 
                    onClick={() => onComplete(index, qIdx, answer)}
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg ${
                      task.completed 
                        ? "bg-slate-700 text-slate-400 cursor-not-allowed" 
                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20"
                    }`}
                    disabled={task.completed}
                  >
                    Submit
                  </button>
                  {!task.completed && q.hint && (
                    <button 
                      onClick={() => setShowHint(!showHint)}
                      className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all"
                      title="Show Hint"
                    >
                      <Info size={18} />
                    </button>
                  )}
                </div>
                
                {showHint && q.hint && (
                  <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg animate-fade-in">
                    <p className="text-[11px] text-blue-300 flex items-center gap-2">
                      <Zap size={12} /> HINT: {q.hint}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

/* ─── Main Lab Detail Page ─── */
const LabDetail = memo(() => {
  const { id } = useParams();
  const { user, refreshUser } = useApp();
  const [lab, setLab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [machineStatus, setMachineStatus] = useState("stopped"); // stopped, booting, running
  const [ipAddress, setIpAddress] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const fetchLabData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/labs/${id}`);
      setLab(res.data.data);
    } catch {
      setError("Failed to load lab data.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLabData();
  }, [fetchLabData]);

  const handleDeploy = () => {
    setMachineStatus("booting");
    setTimeout(() => {
      setMachineStatus("running");
      setIpAddress("10.10.145.23");
      setTimeLeft(3600); // 1 hour
    }, 5000);
  };

  const handleCompleteTask = (taskIdx, qIdx, ans) => {
    // Mock logic for completion
    const newLab = { ...lab };
    newLab.tasks[taskIdx].completed = true;
    setLab(newLab);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a1128] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-slate-400 font-bold tracking-widest uppercase text-sm">Initiating Lab Environment...</p>
      </div>
    </div>
  );

  if (error || !lab) return (
    <div className="min-h-screen bg-[#0a1128] flex items-center justify-center p-6 text-center">
      <div>
        <Shield size={64} className="text-slate-700 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-white mb-2">{error || "Access Denied"}</h2>
        <p className="text-slate-500 mb-8">This lab might have been moved or you don't have the necessary permissions.</p>
        <Link to="/labs" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all">
          Back to Labs
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a1128]">
      
      {/* ═══ BREADCRUMB + NAV ═══ */}
      <div className="bg-[#0d1829] border-b border-white/5 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/labs" className="p-2 text-slate-400 hover:text-white transition-colors">
                <ArrowLeft size={18} />
              </Link>
              <div className="w-px h-6 bg-slate-700" />
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <Link to="/labs" className="hover:text-blue-400 transition-colors uppercase">LABS</Link>
                <ArrowRight size={12} className="opacity-50" />
                <span className="text-blue-400 uppercase truncate max-w-[150px]">{lab.title}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                  <Monitor size={14} className="text-blue-400" />
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Environment Ready</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ HERO SECTION ═══ */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#0d1829] to-[#0a1128] pt-10 pb-8 border-b border-white/5">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -mr-64 -mt-32 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-600/20">
                  <Terminal size={24} className="text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black tracking-[0.2em] text-blue-500 uppercase">Interactive Lab</span>
                  <div className="flex items-center gap-2">
                    <DifficultyBadge level={lab.difficulty} />
                    <span className="w-1 h-1 bg-slate-700 rounded-full" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{lab.estimatedTime || "45 MINS"}</span>
                  </div>
                </div>
              </div>
              
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
                {lab.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <Trophy size={16} className="text-amber-500" />
                  <span className="text-sm font-bold text-white transition-colors">
                    {lab.points || 150} <span className="text-slate-500 font-medium">XP</span>
                  </span>
                </div>
                <div className="w-px h-4 bg-slate-700 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-blue-400" />
                  <span className="text-sm font-bold text-white">
                    {lab.participants || 0} <span className="text-slate-500 font-medium">Participants</span>
                  </span>
                </div>
                <div className="w-px h-4 bg-slate-700 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <div className="flex items-center -space-x-1.5">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-5 h-5 rounded-full border border-[#0a1128] bg-slate-800 flex items-center justify-center">
                        <Star size={8} className="text-amber-500 fill-amber-500" />
                      </div>
                    ))}
                  </div>
                  <span className="text-sm font-bold text-white">
                    {lab.rating || 4.8} <span className="text-slate-500 font-medium">(102 Reviews)</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Progress Circle */}
            <div className="flex items-center gap-6 bg-[#1a2332]/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5">
              <div className="relative w-20 h-20">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r="34" className="stroke-slate-800" strokeWidth="6" fill="transparent" />
                  <circle cx="40" cy="40" r="34" className="stroke-blue-500 transition-all duration-1000" strokeWidth="6" strokeDasharray={`${2 * Math.PI * 34}`} strokeDashoffset={`${2 * Math.PI * 34 * (1 - 0.2)}`} strokeLinecap="round" fill="transparent" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-lg font-black text-white leading-none">20%</span>
                   <span className="text-[7px] font-black tracking-widest text-slate-500 uppercase mt-1">DONE</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Your Progress</p>
                <h3 className="text-lg font-bold text-white leading-tight">1 / 5 Tasks<br/><span className="text-blue-400">Completed</span></h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ MAIN LAYOUT ═══ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Content & Tasks */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Deploy Machine Widget */}
            <div className="bg-[#1a2332] rounded-2xl border border-blue-500/20 shadow-2xl overflow-hidden">
               <div className="p-6 bg-gradient-to-r from-blue-600/10 to-transparent flex flex-col md:flex-row md:items-center justify-between gap-6">
                 <div>
                    <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                       <Monitor size={20} className="text-blue-400" />
                       Virtual Machine
                    </h3>
                    <p className="text-sm text-slate-400">Spawn a dedicated instance to perform the lab exercises.</p>
                 </div>
                 
                 {machineStatus === "stopped" ? (
                    <button 
                      onClick={handleDeploy}
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition-all shadow-xl shadow-blue-600/25 flex items-center gap-3 uppercase tracking-widest text-xs"
                    >
                      <Play size={18} fill="currentColor" /> Deploy Machine
                    </button>
                 ) : machineStatus === "booting" ? (
                    <div className="flex items-center gap-3 px-8 py-3 bg-slate-800 text-slate-400 rounded-xl">
                       <div className="w-4 h-4 border-2 border-slate-600 border-t-blue-400 rounded-full animate-spin" />
                       <span className="font-bold text-xs uppercase tracking-widest">Provisioning...</span>
                    </div>
                 ) : (
                    <div className="flex flex-col md:flex-row items-center gap-4">
                       <div className="bg-[#0d1829] px-4 py-2 rounded-lg border border-emerald-500/30 flex flex-col">
                          <span className="text-[8px] font-black text-slate-500 tracking-widest uppercase">Target IP Address</span>
                          <span className="text-lg font-mono font-bold text-emerald-400 tracking-wider transition-all">{ipAddress}</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <button className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all" title="Restart">
                            <RotateCcw size={18} />
                          </button>
                          <button className="px-5 py-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 font-bold rounded-xl transition-all" title="Terminate">
                            Finalize
                          </button>
                       </div>
                    </div>
                 )}
               </div>
               
               {machineStatus === "running" && (
                 <div className="bg-[#0b121e] border-t border-white/5 p-4 py-3 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Instance Live</span>
                      </div>
                      <div className="w-px h-3 bg-slate-800" />
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                         <Clock size={12} /> {Math.floor(timeLeft / 60)}m left
                      </div>
                   </div>
                   <button className="text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest flex items-center gap-1.5">
                      <Download size={12} /> VPN Access Info
                   </button>
                 </div>
               )}
            </div>

            {/* Lab Content Header */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <BookOpen size={24} className="text-blue-400" />
                Lab Curriculum
              </h2>
              
              <div className="space-y-4">
                {lab.tasks?.map((task, idx) => (
                  <LabTask 
                    key={idx} 
                    task={task} 
                    index={idx} 
                    onComplete={handleCompleteTask} 
                  />
                ))}
              </div>
            </div>

            {/* Resources Footer */}
            <div className="bg-[#1a2332]/30 rounded-2xl border border-white/5 p-8">
               <h3 className="text-lg font-bold text-white mb-4">Additional Resources</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: "VPN Installation Guide", icon: <Download /> },
                    { title: "Lab Support Discord", icon: <ExternalLink /> },
                    { title: "Recommended Reading", icon: <BookOpen /> },
                    { title: "Environment FAQ", icon: <Info /> }
                  ].map((res, i) => (
                    <button key={i} className="flex items-center justify-between p-4 bg-[#0d1829] hover:bg-[#152033] rounded-xl border border-slate-700/30 transition-all group">
                       <div className="flex items-center gap-3">
                          <div className="text-blue-400 opacity-50 group-hover:opacity-100 transition-all">{res.icon}</div>
                          <span className="text-sm font-semibold text-slate-300 group-hover:text-white transition-all">{res.title}</span>
                       </div>
                       <ArrowRight size={16} className="text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
               </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sidebar Stats */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Solver Card */}
            <div className="bg-[#1a2332] rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
               <div className="p-6 pb-2 border-b border-white/5">
                 <h3 className="text-sm font-black text-slate-500 tracking-[0.2em] uppercase mb-4">Solvers</h3>
                 <div className="space-y-4">
                   {[
                     { name: "RootK1d", time: "12m 4s", score: 150 },
                     { name: "CybeRhea", time: "14m 20s", score: 140 },
                     { name: "VoidPointer", time: "15m 55s", score: 130 },
                   ].map((player, i) => (
                     <div key={i} className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xs text-blue-400">
                             {i + 1}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{player.name}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{player.time}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-sm font-bold text-blue-400">+{player.score}</p>
                          <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">XP</p>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
               <Link to={`/labs/${id}/leaderboard`} className="block w-full text-center py-4 bg-[#242f44] text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-700 transition-all uppercase tracking-widest">
                  View Full Rankings
               </Link>
            </div>

            {/* Related Labs */}
            <div className="bg-[#1a2332] rounded-2xl border border-slate-700/50 p-6 shadow-xl">
               <h3 className="text-sm font-black text-slate-500 tracking-[0.2em] uppercase mb-5">Next in Queue</h3>
               <div className="space-y-5">
                 {[
                   { title: "Advanced SQLi Protection", difficulty: "Medium", type: "Walkthrough" },
                   { title: "Database Leak Investigation", difficulty: "Hard", type: "Challenge" },
                 ].map((related, i) => (
                   <Link key={i} to="/labs" className="group block">
                     <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">{related.type}</p>
                     <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors mb-2">{related.title}</h4>
                     <DifficultyBadge level={related.difficulty} />
                   </Link>
                 ))}
               </div>
            </div>

            {/* Community/Help */}
            <div className="p-6 bg-gradient-to-br from-[#1a2332] to-[#242f44] rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <HelpCircle size={48} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 relative">Need Assistance?</h3>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed relative">
                  Join our official security researchers community on Discord for real-time help and discussions about this lab.
                </p>
                <button className="w-full py-3 bg-white text-slate-900 font-black rounded-xl text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all active:scale-95">
                  Join Community
                </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* ═══ FOOTER MARGIN ═══ */}
      <div className="h-32" />
    </div>
  );
});

/* ─── Difficulty Badge Logic ─── */
const DifficultyBadge = memo(({ level }) => {
  const bars = { Easy: 1, Beginner: 1, Medium: 2, Hard: 3, Insane: 4 }[level] || 2;
  const color = { Easy: "#88E636", Beginner: "#88E636", Medium: "#F5A623", Hard: "#E74C3C", Insane: "#E74C3C" }[level] || "#94A3B8";

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-end gap-[2px]">
        {[1, 2, 3, 4].map(i => (
          <div 
            key={i} 
            className="w-[2px] rounded-[1px] transition-all" 
            style={{ 
              height: `${4 + (i * 2)}px`, 
              background: i <= bars ? color : "rgba(255,255,255,0.12)" 
            }} 
          />
        ))}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color }}>{level}</span>
    </div>
  );
});

LabDetail.displayName = "LabDetail";
export default LabDetail;