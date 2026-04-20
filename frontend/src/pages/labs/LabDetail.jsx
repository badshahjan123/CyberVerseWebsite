import { useParams, Link } from "react-router-dom";
import { useState, memo, useMemo, useEffect, useCallback, useRef } from "react";
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
  Copy,
  Check,
  BookOpen,
  Star,
  Activity,
  AlertCircle
} from "lucide-react";
import { useApp } from "../../contexts/app-context";
import axios from "../../api/axios";
import "./LabDetail.css";

/* ─── Command Box Component ─── */
const CommandBox = memo(({ command }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4">
      <div className="absolute -inset-y-2 -inset-x-0 bg-blue-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="relative bg-[#0d1117] border border-white/5 rounded-xl overflow-hidden font-mono text-sm leading-relaxed">
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/5">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/30" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/30" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/30" />
          </div>
          <button 
            onClick={handleCopy}
            className={`flex items-center gap-2 px-2 py-1 rounded-md text-[10px] uppercase font-black tracking-widest transition-all ${
              copied ? "bg-emerald-500/10 text-emerald-400" : "hover:bg-white/10 text-slate-500 hover:text-white"
            }`}
          >
            {copied ? <Check size={10} /> : <Copy size={10} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="p-4 text-emerald-400/90 overflow-x-auto">
          <span className="text-slate-600 mr-2">$</span>{command}
        </div>
      </div>
    </div>
  );
});

/* ─── Task Component ─── */
const LabTask = memo(({ task, index, onComplete, isActive, isLocked }) => {
  const [expanded, setExpanded] = useState(isActive || index === 0);
  const [answer, setAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (isActive) setExpanded(true);
  }, [isActive]);

  return (
    <div 
      className={`mb-6 rounded-2xl transition-all duration-500 overflow-hidden ${
        task.completed 
          ? "border border-emerald-500/20 bg-[#10b98103]" 
          : isActive
            ? "border border-blue-500/30 bg-blue-500/5 ring-1 ring-blue-500/20"
            : isLocked
              ? "opacity-50 grayscale border border-white/5 bg-white/[0.01] pointer-events-none"
              : "border border-white/5 bg-white/[0.02]"
      }`}
    >
      {/* Task Header */}
      <button
        onClick={() => !isLocked && setExpanded(!expanded)}
        className={`w-full flex items-center justify-between p-5 px-6 text-left transition-colors ${
          isActive ? "hover:bg-blue-500/5" : "hover:bg-white/5"
        }`}
      >
        <div className="flex items-center gap-5">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg transition-all duration-300 ${
            task.completed 
              ? "bg-emerald-500 text-white shadow-xl shadow-emerald-500/30" 
              : isActive
                ? "bg-blue-600 text-white shadow-xl shadow-blue-500/30 scale-110"
                : "bg-white/5 text-slate-500"
          }`}>
            {task.completed ? <CheckCircle size={22} /> : isLocked ? <Lock size={20} /> : index + 1}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                task.completed ? "text-emerald-500" : isActive ? "text-blue-400" : "text-slate-500"
              }`}>
                TASK {index + 1}
              </p>
              {isActive && !task.completed && (
                <span className="flex items-center gap-1.5 text-[8px] font-black bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20 animate-pulse">
                  <Activity size={8} /> ACTIVE SESSION
                </span>
              )}
            </div>
            <h3 className={`font-black text-lg tracking-tight transition-colors ${
              task.completed ? "text-slate-200" : isActive ? "text-white" : "text-slate-400"
            }`}>
              {task.title}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-4">
           {task.completed && (
             <span className="hidden sm:flex items-center gap-1.5 text-[9px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-lg tracking-widest uppercase shadow-sm">
               <Check size={10} /> Verified
             </span>
           )}
           {!isLocked && (
             <div className={`p-2 rounded-lg transition-colors ${expanded ? "bg-white/5" : ""}`}>
               {expanded ? <ChevronUp size={20} className="text-slate-500" /> : <ChevronDown size={20} className="text-slate-500" />}
             </div>
           )}
        </div>
      </button>

      {/* Task Content */}
      {!isLocked && expanded && (
        <div className="px-6 pb-8 pt-2 animate-fade-in">
          <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent mb-8" />
          
          <div className="prose prose-invert max-w-none mb-8">
            <div className="text-slate-300 leading-relaxed text-[14px] font-medium space-y-4">
              {task.description ? (
                // Simple parser for code blocks if present
                task.description.split('```').map((block, i) => {
                  if (i % 2 === 1) return <CommandBox key={i} command={block.trim()} />;
                  return <p key={i} className="opacity-90">{block}</p>;
                })
              ) : (
                <p>In this task, you will explore the technical details of the environment and perform specific checks to identify vulnerabilities.</p>
              )}
            </div>
          </div>

          {/* Question Section */}
          <div className="space-y-6 mt-10">
            <div className="flex items-center gap-3 ml-2">
              <HelpCircle size={16} className="text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Operation Objectives</span>
            </div>
            
            {task.questions?.map((q, qIdx) => (
              <div key={qIdx} className={`p-6 rounded-2xl border transition-all ${
                task.completed 
                  ? "bg-emerald-500/[0.02] border-emerald-500/10" 
                  : "bg-[#0d131f] border-white/5 focus-within:border-blue-500/30"
              }`}>
                <div className="flex items-start gap-4 mb-6">
                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                     task.completed ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-400"
                   }`}>
                      <Info size={14} />
                   </div>
                   <p className="text-[15px] font-bold text-slate-200 leading-snug pt-1">{q.question}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                  <div className="relative flex-1">
                    <input 
                      type="text"
                      placeholder="Input Decryption Key / Flag..."
                      className={`w-full bg-[#1a2332]/50 border rounded-xl py-3.5 px-5 text-sm transition-all font-mono tracking-wider focus:outline-none ${
                        task.completed 
                          ? "border-emerald-500/20 text-emerald-400" 
                          : "border-white/10 text-white focus:border-blue-500 ring-offset-2 focus:ring-2 focus:ring-blue-500/20"
                      }`}
                      value={task.completed ? "DECRYPTED_SUCCESS" : answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      disabled={task.completed}
                    />
                    {task.completed && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500"><CheckCircle size={18} /></div>}
                  </div>
                  <button 
                    onClick={() => onComplete(index, qIdx, answer)}
                    className={`px-8 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      task.completed 
                        ? "bg-slate-800 text-slate-500 scale-95 cursor-not-allowed border border-white/5" 
                        : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 active:translate-y-0"
                    }`}
                    disabled={task.completed}
                  >
                    Submit Payload
                  </button>
                </div>
                
                {q.hint && !task.completed && (
                  <div className="mt-5 flex justify-end">
                    <button 
                      onClick={() => setShowHint(!showHint)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                        showHint ? "bg-blue-500/10 text-blue-400" : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      <Zap size={10} className={showHint ? "fill-blue-400" : ""} />
                      {showHint ? "Conceal Hint" : "Request Intelligence"}
                    </button>
                  </div>
                )}
                
                {showHint && q.hint && !task.completed && (
                  <div className="mt-3 p-4 bg-blue-500/[0.03] border border-blue-500/10 border-l-2 border-l-blue-500 rounded-xl animate-fade-in">
                    <p className="text-[12px] text-slate-400 leading-relaxed italic">
                       {q.hint}
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

  const handleDeploy = async () => {
    setMachineStatus("booting");
    try {
      const res = await axios.post(`/labs/start/${id}`);
      if (res.data.success) {
        setMachineStatus("running");
        setIpAddress(res.data.labUrl);
        setTimeLeft(3600);
      } else {
        setMachineStatus("stopped");
        alert("Failed to start lab: " + (res.data.message || "Unknown error"));
      }
    } catch (err) {
      setMachineStatus("stopped");
      alert("Failed to start lab: " + (err.response?.data?.message || err.message));
    }
  };

  const handleCompleteTask = (taskIdx, qIdx, ans) => {
    const newLab = { ...lab };
    newLab.tasks[taskIdx].completed = true;
    setLab(newLab);
  };

  const stats = useMemo(() => {
    if (!lab?.tasks) return { total: 0, completed: 0, pct: 0 };
    const completed = lab.tasks.filter(t => t.completed).length;
    const total = lab.tasks.length;
    return { total, completed, pct: Math.round((completed / total) * 100) };
  }, [lab?.tasks]);

  const currentTaskIdx = useMemo(() => {
    if (!lab?.tasks) return 0;
    const firstIncomplete = lab.tasks.findIndex(t => !t.completed);
    return firstIncomplete === -1 ? lab.tasks.length - 1 : firstIncomplete;
  }, [lab?.tasks]);

  if (loading) return (
    <div className="min-h-screen bg-[#081224] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-[3px] border-blue-500/10 border-t-blue-500 rounded-full animate-spin" />
          <Terminal size={24} className="absolute inset-x-0 mx-auto top-1/2 -translate-y-1/2 text-blue-500/50" />
        </div>
        <div className="text-center">
          <p className="text-white font-black tracking-[0.3em] uppercase text-sm mb-1">Initiating Terminal</p>
          <p className="text-slate-500 font-bold uppercase text-[9px] tracking-widest">Bridging encrypted connection...</p>
        </div>
      </div>
    </div>
  );

  if (error || !lab) return (
    <div className="min-h-screen bg-[#081224] flex items-center justify-center p-6 text-center">
      <div className="max-w-md p-10 bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-xl">
        <ShieldAlert size={64} className="text-red-500/40 mx-auto mb-6" />
        <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">{error || "Access Denied"}</h2>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest leading-relaxed mb-10">This lab environment requires higher clearance or has been decommissioned.</p>
        <Link to="/labs" className="inline-flex items-center gap-3 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition-all shadow-xl shadow-blue-600/20">
          <ArrowLeft size={16} /> RETURN TO LABS
        </Link>
      </div>
    </div>
  );

  return (
    <div className="lab-det-page">
      <div className="lab-det-page__grid" />
      <div className="lab-det-page__overlay" />
      
      <div className="lab-det-content">
        {/* ═══ BREADCRUMB + NAV ═══ */}
        <div className="bg-[#0b121e]/80 backdrop-blur-xl border-b border-white/5 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link to="/labs" className="p-2.5 bg-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5">
                  <ArrowLeft size={18} />
                </Link>
                <div className="h-4 w-px bg-white/10 mx-2" />
                <div className="flex items-center gap-3 text-[10px] font-black tracking-[0.2em]">
                  <Link to="/labs" className="text-slate-500 hover:text-blue-400 transition-colors uppercase">ARCHIVE</Link>
                  <ChevronRight size={12} className="text-slate-700" />
                  <span className="text-blue-500 uppercase truncate max-w-[200px]">{lab.title}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="hidden md:flex items-center gap-3 px-4 py-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded-full shadow-sm">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em]">Ready For Deployment</span>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ HERO SECTION ═══ */}
        <div className="relative overflow-hidden pt-12 pb-10">
          <div className="max-w-7xl mx-auto px-6 relative">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/30">
                    <Terminal size={28} className="text-white" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-black tracking-[0.3em] text-blue-500 uppercase">Operational Protocol</span>
                    <div className="flex items-center gap-3">
                      <DifficultyBadge level={lab.difficulty} />
                      <div className="w-1 h-1 bg-slate-700 rounded-full" />
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                         <Clock size={12} /> {lab.estimatedTime || "45 MINS"}
                      </div>
                    </div>
                  </div>
                </div>
                
                <h1 className="text-4xl sm:text-6xl font-black text-white mb-6 tracking-tight leading-tight uppercase">
                  {lab.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-8">
                  <div className="flex items-center gap-2.5 group">
                    <div className="p-1.5 bg-amber-500/10 rounded-lg group-hover:bg-amber-500/20 transition-colors">
                      <Trophy size={16} className="text-amber-500" />
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Combat XP</p>
                      <p className="text-sm font-black text-white">{lab.points || 150} pts</p>
                    </div>
                  </div>
                  <div className="w-px h-8 bg-white/5 hidden sm:block" />
                  <div className="flex items-center gap-2.5 group">
                    <div className="p-1.5 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                      <Users size={16} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Infiltrators</p>
                      <p className="text-sm font-black text-white">{lab.participants || "1.2k"}</p>
                    </div>
                  </div>
                  <div className="w-px h-8 bg-white/5 hidden sm:block" />
                  <div className="flex items-center gap-2.5 group">
                    <div className="flex items-center -space-x-1 ml-1">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-6 h-6 rounded-full border-2 border-[#081224] bg-slate-800 flex items-center justify-center shadow-lg">
                          <Star size={10} className="text-amber-500 fill-amber-500" />
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">User Rating</p>
                      <p className="text-sm font-black text-white">{lab.rating || 4.8}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress HUD */}
              <div className="bg-[#0f172a] p-8 rounded-3xl border border-white/5 shadow-2xl relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-all duration-700" />
                <div className="flex items-center gap-8 relative">
                   <div className="relative w-24 h-24">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="48" cy="48" r="42" className="stroke-white/5" strokeWidth="6" fill="transparent" />
                      <circle 
                        cx="48" cy="48" r="42" 
                        className="stroke-blue-500 transition-all duration-1000 ease-out" 
                        strokeWidth="6" 
                        strokeDasharray={2 * Math.PI * 42} 
                        strokeDashoffset={2 * Math.PI * 42 * (1 - stats.pct / 100)} 
                        strokeLinecap="round" 
                        fill="transparent" 
                        style={{ filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.5))' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-2xl font-black text-white leading-none">{stats.pct}%</span>
                       <p className="text-[7px] font-black tracking-[0.2em] text-blue-400 uppercase mt-2">SYNCED</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.25em] mb-2 px-1 border-l-2 border-blue-500">Operation Status</h3>
                    <p className="text-2xl font-black text-white tracking-tight leading-none uppercase">
                      {stats.completed} <span className="text-slate-600">/</span> {stats.total}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 bg-white/5 px-3 py-1 rounded-md inline-block border border-white/5">
                      Clearance: {stats.pct === 100 ? "Elite" : stats.pct > 50 ? "Advanced" : "Apprentice"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ MAIN LAYOUT ═══ */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* LEFT COLUMN: Content & Tasks */}
            <div className="lg:col-span-8 space-y-10">
              
              {/* Deploy Machine Widget */}
              <div className={`rounded-3xl border transition-all duration-500 overflow-hidden ${
                machineStatus === 'running' 
                  ? "bg-[#0b121e] border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.05)]" 
                  : "bg-[#0b121e] border-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.05)]"
              }`}>
                 <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
                   <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Monitor size={20} className={machineStatus === 'running' ? "text-emerald-400" : "text-blue-400"} />
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">Deployment Controller</h3>
                      </div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Initialize virtual terminal for offensive operations</p>
                   </div>
                   
                   <div className="flex items-center gap-4">
                     {machineStatus === "stopped" ? (
                        <button 
                          onClick={handleDeploy}
                          className="px-10 py-3.5 bg-gradient-to-r from-[#FF6B00] to-[#CC4400] hover:scale-105 active:scale-95 text-white font-black rounded-xl transition-all shadow-xl shadow-orange-600/25 flex items-center gap-3 uppercase tracking-[0.15em] text-[11px]"
                        >
                          <Play size={18} fill="currentColor" /> Deploy Instance
                        </button>
                     ) : machineStatus === "booting" ? (
                        <div className="flex items-center gap-4 px-10 py-3.5 bg-white/5 text-slate-400 rounded-xl border border-white/10">
                           <div className="w-4 h-4 border-2 border-slate-700 border-t-white rounded-full animate-spin" />
                           <span className="font-black text-[11px] uppercase tracking-widest">Provisioning...</span>
                        </div>
                     ) : (
                        <div className="flex flex-col md:flex-row items-center gap-4">
                           <div className="bg-emerald-500/5 px-6 py-2.5 rounded-xl border border-emerald-500/20 flex flex-col group cursor-copy active:bg-emerald-500/10 transition-all" onClick={() => navigator.clipboard.writeText(ipAddress)}>
                              <span className="text-[8px] font-black text-emerald-500/60 tracking-[0.2em] uppercase mb-0.5">Target IP Ready</span>
                              <span className="text-xl font-mono font-black text-emerald-400 tracking-wider">{ipAddress}</span>
                           </div>
                           <div className="flex items-center gap-3">
                              <button className="p-3.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-all border border-white/10" title="Restart Node">
                                <RotateCcw size={18} />
                              </button>
                              <button className="px-6 py-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-black rounded-xl transition-all border border-red-500/20 uppercase tracking-widest text-[10px]" title="Terminate Connection">
                                Terminate
                              </button>
                           </div>
                        </div>
                     )}
                   </div>
                 </div>
                 
                 {machineStatus === "running" && (
                   <div className="bg-black/20 border-t border-white/5 p-5 px-8 flex items-center justify-between">
                     <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2.5">
                           <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                           <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Instance Live</span>
                        </div>
                        <div className="w-px h-4 bg-white/10" />
                        <div className="flex items-center gap-2.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                           <Clock size={13} className="text-blue-500/50" /> {Math.floor(timeLeft / 60)}m Session Duration
                        </div>
                     </div>
                     <a
                       href={ipAddress}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="text-[10px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest flex items-center gap-2 transition-all"
                     >
                       <ExternalLink size={14} /> Open in New Tab
                     </a>
                   </div>
                 )}

                 {/* ── Embedded Terminal ── */}
                 {machineStatus === "running" && ipAddress && (
                   <div className="border-t border-white/5">
                     <iframe
                       src={ipAddress}
                       title="Lab Terminal"
                       className="w-full"
                       style={{ height: "500px", border: "none", background: "#000" }}
                       allow="clipboard-read; clipboard-write"
                     />
                   </div>
                 )}
              </div>

              {/* Lab Content Header */}
              <div className="space-y-8">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-blue-500/5 rounded-xl border border-blue-500/10">
                      <BookOpen size={20} className="text-blue-500" />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Lab Briefing</h2>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sequential Order Enforced</span>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {lab.tasks?.map((task, idx) => (
                    <LabTask 
                      key={idx} 
                      task={task} 
                      index={idx} 
                      onComplete={handleCompleteTask}
                      isActive={idx === currentTaskIdx}
                      isLocked={idx > currentTaskIdx}
                    />
                  ))}
                </div>
              </div>

              {/* Resources Footer */}
              <div className="bg-[#1a2332]/20 rounded-3xl border border-white/5 p-10 overflow-hidden relative group">
                 <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl -mb-32 -mr-32 group-hover:bg-blue-600/10 transition-all duration-700" />
                 <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8 relative">Intelligence Repository</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative">
                    {[
                      { title: "VPN Access Key", icon: <Key size={18} /> },
                      { title: "Team Discord", icon: <ExternalLink size={18} /> },
                      { title: "Whitepapers", icon: <BookOpen size={18} /> },
                      { title: "System FAQ", icon: <Info size={18} /> }
                    ].map((res, i) => (
                      <button key={i} className="flex items-center justify-between p-5 bg-[#0d131f] hover:bg-[#111927] rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all group/btn shadow-sm">
                         <div className="flex items-center gap-4">
                            <div className="p-2 bg-blue-500/5 rounded-xl text-blue-500 transition-all group-hover/btn:bg-blue-500 group-hover/btn:text-white group-hover/btn:shadow-lg group-hover/btn:shadow-blue-500/30">{res.icon}</div>
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover/btn:text-slate-200 transition-all">{res.title}</span>
                         </div>
                         <ArrowRight size={16} className="text-slate-600 group-hover/btn:text-blue-400 group-hover/btn:translate-x-2 transition-all duration-300" />
                      </button>
                    ))}
                 </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Sidebar Stats */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* Solver Card */}
              <div className="bg-[#0f172a] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                 <div className="p-8">
                   <div className="flex items-center gap-3 mb-8">
                     <Activity size={18} className="text-blue-500" />
                     <h3 className="text-[10px] font-black text-slate-500 tracking-[0.3em] uppercase">Tactical Rankings</h3>
                   </div>
                   <div className="space-y-6">
                     {[
                       { name: "RootK1d", time: "12m 4s", score: 150 },
                       { name: "CybeRhea", time: "14m 20s", score: 140 },
                       { name: "VoidPointer", time: "15m 55s", score: 130 },
                     ].map((player, i) => (
                       <div key={i} className="flex items-center justify-between group cursor-default">
                         <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl border border-white/5 flex items-center justify-center font-black text-xs transition-all ${
                              i === 0 ? "bg-amber-500/10 text-amber-500" : "bg-white/5 text-slate-500"
                            }`}>
                               {i + 1}
                            </div>
                            <div>
                               <p className="text-sm font-black text-white group-hover:text-blue-400 transition-colors">{player.name}</p>
                               <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.1em]">{player.time}</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-xs font-black text-blue-400 transition-all group-hover:scale-110">+{player.score} XP</p>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
                 <Link to={`/labs/${id}/leaderboard`} className="flex items-center justify-center gap-2 w-full py-5 bg-white/5 border-t border-white/5 text-[10px] font-black text-slate-500 hover:text-white hover:bg-white/[0.08] transition-all uppercase tracking-[0.2em]">
                    ACCESS FULL LOGS <ChevronRight size={14} />
                 </Link>
              </div>

              {/* Related Labs */}
              <div className="bg-[#0f172a] rounded-3xl border border-white/5 p-8 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl -mr-16 -mt-16" />
                 <div className="flex items-center gap-3 mb-8">
                   <Zap size={18} className="text-[#FF6B00]" />
                   <h3 className="text-[10px] font-black text-slate-500 tracking-[0.3em] uppercase">Core Directives</h3>
                 </div>
                 <div className="space-y-6">
                   {[
                     { title: "Network Infiltration", diff: "Medium", type: "Offensive" },
                     { title: "Binary Analysis", diff: "Hard", type: "Research" },
                   ].map((related, i) => (
                     <Link key={i} to="/labs" className="group block p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-orange-500/20 transition-all">
                       <p className="text-[8px] font-black text-orange-500 uppercase tracking-widest mb-1.5">{related.type}</p>
                       <h4 className="text-[13px] font-black text-white group-hover:text-[#FF6B00] transition-colors mb-3 uppercase tracking-tight">{related.title}</h4>
                       <DifficultyBadge level={related.diff} />
                     </Link>
                   ))}
                 </div>
              </div>

              {/* Community Banner */}
              <div className="p-8 bg-gradient-to-br from-[#0b121e] to-[#0f172a] rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-all duration-700 group-hover:rotate-12">
                     <HelpCircle size={80} className="text-white" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-3 relative uppercase tracking-tight">Tactical Support</h3>
                  <p className="text-xs font-bold text-slate-500 mb-8 leading-relaxed relative uppercase tracking-widest opacity-80">
                    Join our official security researchers community for mission intelligence.
                  </p>
                  <button className="w-full py-4 bg-white text-slate-900 font-black rounded-2xl text-[10px] uppercase tracking-[0.25em] shadow-xl hover:bg-blue-400 hover:text-white transition-all transform active:scale-95 relative overflow-hidden">
                    Join Community
                  </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* ═══ FOOTER MARGIN ═══ */}
        <div className="h-40" />
      </div>
    </div>
  );
});

/* ─── Difficulty Badge Logic ─── */
const DifficultyBadge = memo(({ level }) => {
  const bars = { Easy: 1, Beginner: 1, Medium: 2, Hard: 3, Insane: 4 }[level] || 2;
  const color = { Easy: "#88E636", Beginner: "#88E636", Medium: "#F5A623", Hard: "#FF6B00", Insane: "#FF3D71" }[level] || "#94A3B8";

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-end gap-[2px]">
        {[1, 2, 3, 4].map(i => (
          <div 
            key={i} 
            className="w-[3px] rounded-[1px] transition-all duration-500" 
            style={{ 
              height: `${5 + (i * 2)}px`, 
              background: i <= bars ? color : "rgba(255,255,255,0.08)",
              boxShadow: i <= bars ? `0 0 6px ${color}33` : 'none'
            }} 
          />
        ))}
      </div>
      <span className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color }}>{level}</span>
    </div>
  );
});

LabDetail.displayName = "LabDetail";
export default LabDetail;