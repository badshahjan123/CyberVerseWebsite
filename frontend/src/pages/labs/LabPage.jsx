import { useState, useEffect, memo, useCallback, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Lock,
  Unlock,
  Terminal,
  Play,
  CheckCircle,
  AlertCircle,
  Loader,
  ArrowLeft,
  ArrowRight,
  Monitor,
  Trophy,
  Users,
  Clock,
  Zap,
  RotateCcw,
  BookOpen,
  Info,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Star,
  ExternalLink,
  Copy,
  Check,
  Activity,
  ChevronRight,
  Download,
  Key,
  ShieldAlert
} from "lucide-react";
import { labsService } from "../../services/labs";
import { attemptsService } from "../../services/attempts";
import { useApp } from "../../contexts/app-context";
import "./LabPage.css";

/* ─── Command Box ─── */
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

/* ─── Difficulty Badge ─── */
const DifficultyBadge = memo(({ level }) => {
  const bars = { Beginner: 1, Intermediate: 2, Advanced: 3, Expert: 4 }[level] || 2;
  const color = { Beginner: "#88E636", Intermediate: "#F5A623", Advanced: "#FF6B00", Expert: "#FF3D71" }[level] || "#94A3B8";

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-end gap-[2px]">
        {[1, 2, 3, 4].map(i => (
          <div 
            key={i} 
            className="w-[3px] rounded-[1px] transition-all duration-500" 
            style={{ 
              height: `${5 + (i * i * 0.5)}px`, 
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

/* ─── Lab Task Component ─── */
const LabTask = memo(({ task, isCompleted, isActive, isLocked, onSubmit }) => {
  const [expanded, setExpanded] = useState(isActive || !isCompleted);
  const [answer, setAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isActive) setExpanded(true);
  }, [isActive]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return;
    setSubmitting(true);
    const success = await onSubmit(task.id, answer);
    if (success) {
      setAnswer("");
      setExpanded(false);
    }
    setSubmitting(false);
  };

  return (
    <div
      className={`lab-task-modern mb-6 rounded-2xl transition-all duration-500 overflow-hidden ${
        isCompleted 
          ? "border border-emerald-500/20 bg-[#0b121e]" 
          : isActive
            ? "border border-orange-500/30 bg-[#0d131f] ring-1 ring-orange-500/20 shadow-2xl shadow-orange-500/10"
            : isLocked
              ? "opacity-50 grayscale border border-white/5 bg-[#0b121e]/40 pointer-events-none"
              : "border border-white/5 bg-[#0b121e]"
      }`}
    >
      <button
        onClick={() => !isLocked && setExpanded(!expanded)}
        className={`w-full flex items-center justify-between p-5 px-6 text-left transition-colors ${
          isActive ? "hover:bg-blue-500/5" : "hover:bg-white/5"
        }`}
      >
        <div className="flex items-center gap-5">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg transition-all duration-300 ${
            isCompleted 
              ? "bg-emerald-500 text-white shadow-xl shadow-emerald-500/30" 
              : isActive
                ? "bg-orange-600 text-white shadow-xl shadow-orange-500/30 scale-110"
                : "bg-white/5 text-slate-500"
          }`}>
            {isCompleted ? <CheckCircle size={22} /> : isLocked ? <Lock size={20} /> : task.id}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                isCompleted ? "text-emerald-500" : isActive ? "text-orange-400" : "text-slate-500"
              }`}>
                TASK {task.id}
              </p>
              {isActive && !isCompleted && (
                <span className="flex items-center gap-1.5 text-[8px] font-black bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/20 animate-pulse">
                  <Activity size={8} /> ACTIVE SESSION
                </span>
              )}
            </div>
            <h3 className={`font-black text-lg tracking-tight transition-colors ${
              isCompleted ? "text-slate-200" : isActive ? "text-white" : "text-slate-400"
            }`}>
              {task.title}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-4">
           {isCompleted && (
             <span className="hidden sm:flex items-center gap-1.5 text-[9px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-lg tracking-widest uppercase">
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

      {!isLocked && expanded && (
        <div className="px-6 pb-8 pt-2 animate-fade-in">
          <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent mb-8" />
          
          <div className="text-slate-300 leading-relaxed text-[14px] font-medium space-y-4 mb-8">
            <p className="opacity-90">{task.instructions}</p>
          </div>

          {task.commands && task.commands.length > 0 && (
            <div className="space-y-4 mb-10">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Engagement Commands</span>
              {task.commands.map((cmd, i) => (
                <CommandBox key={i} command={cmd} />
              ))}
            </div>
          )}

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl blur opacity-20 group-focus-within:opacity-40 transition duration-1000"></div>
            <form onSubmit={handleSubmit} className="relative flex gap-3">
              <div className="relative flex-1">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <Key size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Enter flag or answer here..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={isCompleted || submitting}
                  className="w-full bg-[#0d1117] border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all font-mono text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={isCompleted || submitting || !answer.trim()}
                className={`px-8 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${
                  isCompleted
                    ? "bg-emerald-500/10 text-emerald-400 cursor-default"
                    : "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-600/20 hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                {submitting ? <Loader className="animate-spin" size={16} /> : isCompleted ? <CheckCircle size={16} /> : "Submit"}
                {!submitting && !isCompleted && <ArrowRight size={14} />}
              </button>
            </form>
          </div>
          
          <div className="mt-6 flex items-center justify-between px-2">
            <button 
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-400 transition-colors"
            >
              <HelpCircle size={12} /> {showHint ? "Hide Hint" : "Need a Hint?"}
            </button>
            <span className="text-[10px] font-bold text-slate-600">MISSION OBJS: TASK DATA INSPECTION REQUIRED</span>
          </div>
          
          {showHint && (
            <div className="mt-4 p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl text-[12px] text-amber-200/80 leading-relaxed italic">
              <strong>Forensic Hint:</strong> Search the current directory for strings using the 'strings' command, or inspect hidden files if you're stuck.
            </div>
          )}
        </div>
      )}
    </div>
  );
});

/* ─── Main Lab Page ─── */
const LabPage = () => {
  const { user, refreshUser } = useApp();
  const { labId } = useParams();
  const navigate = useNavigate();

  const [lab, setLab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [labCompleted, setLabCompleted] = useState(false);
  const [labStarted, setLabStarted] = useState(false);
  const [machineStarted, setMachineStarted] = useState(false);
  const [machineStatus, setMachineStatus] = useState("stopped"); // stopped, booting, running
  const [terminalUrl, setTerminalUrl] = useState(null);
  
  const [operationLoading, setOperationLoading] = useState(false);
  const [operationError, setOperationError] = useState(null);
  
  const [attemptId, setAttemptId] = useState(null);
  const [bestScore, setBestScore] = useState(0);
  const [attemptsCount, setAttemptsCount] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [newHighScore, setNewHighScore] = useState(false);

  /* ─── Fetch Lab Data & Initialize Attempt ─── */
  useEffect(() => {
    const fetchLabAndStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const labData = await labsService.getLabById(labId);
        setLab(labData);
        
        // Load Best Scores & Attempt History
        // Use labData.id (ObjectId) instead of labId (slug) for database internal tracking
        const statsData = await attemptsService.getItemStats('lab', labData.id);
        setBestScore(statsData.bestScore);
        setAttemptsCount(statsData.attemptsCount);

        // Start NEW Attempt for Replay
        const attempt = await attemptsService.startAttempt(labData.id, 'lab', labData.points);
        setAttemptId(attempt.attemptId);
        setStartTime(Date.now());

        await checkMachineStatus(labId);
      } catch (err) {
        setError(err.message || "Failed to load lab");
      } finally {
        setLoading(false);
      }
    };

    if (labId) {
      fetchLabAndStats();
    }
  }, [labId]);

  const checkMachineStatus = async (id) => {
    try {
      const response = await labsService.getLabStatus(id);
      if (response.status === "running") {
        setMachineStarted(true);
        setMachineStatus("running");
        const startResponse = await labsService.startLab(id);
        if (startResponse.success) {
           setTerminalUrl(startResponse.labUrl);
        }
      }
    } catch (err) { }
  };

  const checkCompletionStatus = async (id) => {
    try {
      const response = await labsService.getCompletionStatus(id);
      if (response.success && response.completed) {
        setLabCompleted(true);
        setLabStarted(true);
        if (lab?.tasks) {
          setCompletedTasks(lab.tasks.map((t) => t.id));
        }
      }
    } catch (err) { }
  };

  const handleStartMachine = async () => {
    setOperationLoading(true);
    setMachineStatus("booting");
    setOperationError(null);
    try {
      const response = await labsService.startLab(labId);
      if (response.success) {
        setMachineStarted(true);
        setMachineStatus("running");
        setTerminalUrl(response.labUrl);
        window.open(response.labUrl, "_blank");
      } else {
        setMachineStatus("stopped");
        throw new Error(response.message || "Failed to start machine");
      }
    } catch (err) {
      setOperationError(err.message);
      setMachineStatus("stopped");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleStopLab = async () => {
    setOperationLoading(true);
    setOperationError(null);
    try {
      const response = await labsService.stopLab(labId);
      if (response.success) {
        setMachineStarted(false);
        setMachineStatus("stopped");
        setTerminalUrl(null);
      } else {
        throw new Error(response.message || "Failed to stop lab");
      }
    } catch (err) {
      setOperationError(err.message);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleSubmitAnswer = async (taskId, answer) => {
    setOperationError(null);
    const task = lab?.tasks?.find((t) => Number(t.id) === Number(taskId));
    
    if (task && task.correctAnswer && answer.trim().toUpperCase() === task.correctAnswer.toUpperCase()) {
      const updatedCompletedTasks = [...completedTasks, taskId];
      setCompletedTasks(updatedCompletedTasks);
      
      // If all tasks completed -> Finalize Attempt
      if (updatedCompletedTasks.length === lab.tasks.length) {
        setLabCompleted(true);
        try {
          const completionTime = Math.floor((Date.now() - startTime) / 1000);
          const finalScore = lab.points; // Simple scoring: 100% completion = full points

          const result = await attemptsService.completeAttempt(
            attemptId, 
            finalScore, 
            completionTime, 
            updatedCompletedTasks.map(id => ({ taskId: id, completed: true, completedAt: new Date() }))
          );

          if (result.isNewBest) {
            setNewHighScore(true);
            setBestScore(result.bestScore);
          }
          
          setAttemptsCount(result.attemptsCount);
          
          // Refresh user context to update navigation buttons and progress
          if (refreshUser) await refreshUser();
          
          if (window.triggerRealtimeUpdate) window.triggerRealtimeUpdate();
        } catch (err) {
          console.error("Failed to save attempt:", err);
        }
      }
      return true;
    } else {
      setOperationError(`Incorrect payload for Task ${taskId}. Access Denied!`);
      return false;
    }
  };

  const stats = useMemo(() => {
    if (!lab?.tasks) return { total: 0, completed: 0, pct: 0 };
    const total = lab.tasks.length;
    const completed = completedTasks.length;
    return { total, completed, pct: Math.round((completed / total) * 100) };
  }, [lab?.tasks, completedTasks]);

  const currentTaskIdx = useMemo(() => {
    if (!lab?.tasks) return 0;
    const firstIncomplete = lab.tasks.findIndex(t => !completedTasks.includes(t.id));
    return firstIncomplete === -1 ? lab.tasks.length - 1 : firstIncomplete;
  }, [lab?.tasks, completedTasks]);

  if (loading) return (
    <div className="lab-page-modern min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin" />
        </div>
        <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Initializing Lab Environment...</p>
      </div>
    </div>
  );

  if (error || !lab) return (
    <div className="lab-page-modern min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-red-500/5 border border-red-500/20 rounded-3xl p-10 text-center shadow-2xl">
        <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">Access Denied</h2>
        <p className="text-slate-400 mb-8 font-medium leading-relaxed">{error || "The requested lab could not be located in the secure database."}</p>
        <button onClick={() => navigate('/labs')} className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-black rounded-xl transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2">
          <ArrowLeft size={16} /> Return to Archive
        </button>
      </div>
    </div>
  );

  return (
    <div className="lab-page-modern min-h-screen text-slate-300 font-sans selection:bg-orange-500/30 selection:text-white pb-32">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-600/10 blur-[150px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-600/10 blur-[150px] rounded-full animate-pulse-slow delay-1000" />
      </div>

      <div className="relative z-10">
        {/* Top Navbar */}
        <div className="fixed top-20 left-0 right-0 z-40 bg-[#070b14]/80 backdrop-blur-md border-b border-white/5 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link to="/labs" className="p-2 hover:bg-white/5 rounded-lg transition-colors group">
                <ArrowLeft size={20} className="text-slate-400 group-hover:text-white transition-colors" />
              </Link>
              <div className="flex items-center gap-3 text-[10px] font-black tracking-widest">
                <Link to="/labs" className="text-slate-500 hover:text-orange-400 transition-colors uppercase">ARCHIVE</Link>
                <ChevronRight size={12} className="text-slate-700" />
                <span className="text-orange-500 uppercase truncate max-w-[200px]">{lab.title}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Header */}
        <div className="max-w-7xl mx-auto px-6 pt-32 pb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl flex items-center justify-center shadow-2xl">
                <Terminal size={28} className="text-white" />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black tracking-[0.3em] text-orange-500 uppercase">Lab Mission</span>
                <DifficultyBadge level={lab.difficulty} />
              </div>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-white mb-6 uppercase tracking-tight">{lab.title}</h1>
            <div className="flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-2.5">
                <Trophy size={16} className="text-amber-500" />
                <span className="text-sm font-black">{lab.points} XP pts</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock size={16} className="text-orange-400" />
                <span className="text-sm font-black">45 MINS</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0f172a] p-8 rounded-3xl border border-white/5 shadow-2xl flex items-center gap-8">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="42" className="stroke-white/5" strokeWidth="6" fill="transparent" />
                <circle 
                  cx="48" cy="48" r="42" 
                  className="stroke-orange-500 transition-all duration-1000" 
                  strokeWidth="6" 
                  strokeDasharray={2 * Math.PI * 42} 
                  strokeDashoffset={2 * Math.PI * 42 * (1 - stats.pct / 100)} 
                  strokeLinecap="round" 
                  fill="transparent" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-2xl font-black text-white">{stats.pct}%</span>
              </div>
            </div>
            <div>
              <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.25em] mb-2 px-1 border-l-2 border-orange-500">Task Progress</h3>
              <p className="text-2xl font-black text-white">{stats.completed} <span className="text-slate-600">/</span> {stats.total} Tasks</p>
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            {/* Machine Control */}
            <div className={`rounded-3xl border transition-all duration-500 p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 ${
              machineStatus === 'running' ? "bg-[#0b121e] border-emerald-500/20" : "bg-[#0b121e] border-orange-500/20"
            }`}>
               <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Virtual Machine</h3>
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${machineStatus === 'running' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{machineStatus === 'running' ? 'Running' : 'Stopped'}</span>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                 {machineStatus === "stopped" ? (
                    <button onClick={handleStartMachine} disabled={operationLoading} className="px-8 py-2.5 bg-gradient-to-r from-[#FF6B00] to-[#CC4400] font-black rounded-xl transition-all shadow-xl shadow-orange-600/20 uppercase tracking-widest text-xs flex items-center gap-2 hover:brightness-110 active:translate-y-0.5 btn-primary lp-btn-primary" style={{ color: '#FFFFFF' }}>
                      {operationLoading ? (
                        <Loader className="animate-spin" size={14} style={{ color: '#FFFFFF' }} />
                      ) : stats.pct === 100 ? (
                        <RotateCcw size={14} style={{ color: '#FFFFFF' }} />
                      ) : (
                        <Play size={14} fill="#FFFFFF" style={{ color: '#FFFFFF' }} />
                      )}
                      {stats.pct === 100 ? "Restart Mission" : "Start Mission"}
                    </button>
                 ) : machineStatus === "booting" ? (
                    <div className="flex items-center gap-4 px-10 py-3.5 bg-white/5 text-slate-400 rounded-xl border border-white/10 uppercase tracking-widest text-[11px] font-black">
                      <Loader className="animate-spin" size={18} /> Loading...
                    </div>
                 ) : (
                    <div className="flex flex-col md:flex-row items-center gap-4">
                       {terminalUrl && (
                         <a href={terminalUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-2.5 bg-gradient-to-r from-[#FF6B00] to-[#CC4400] font-black rounded-xl transition-all shadow-lg flex items-center gap-2 uppercase tracking-widest text-xs hover:brightness-110 active:translate-y-0.5 shadow-orange-600/20 btn-primary lp-btn-primary" style={{ color: '#FFFFFF' }}>
                            <ExternalLink size={14} style={{ color: '#FFFFFF' }} /> Open Terminal
                         </a>
                       )}
                       <button onClick={handleStopLab} disabled={operationLoading} className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-black rounded-xl transition-all border border-red-500/20 uppercase tracking-widest text-xs">
                          Stop
                       </button>
                    </div>
                 )}
               </div>
            </div>

            {/* Error Alert */}
            {operationError && (
              <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl flex items-center gap-4 text-red-400 text-sm font-bold">
                <AlertCircle size={20} /> {operationError}
              </div>
            )}

            {/* Lab Content */}
            <div className="bg-[#0b121e] border border-white/5 rounded-3xl p-10">
              <div className="prose prose-invert prose-orange max-w-none">
                <div 
                  dangerouslySetInnerHTML={{ __html: lab.content }} 
                  className="text-slate-400 font-medium leading-[1.8] text-lg space-y-4"
                />
              </div>
            </div>

            {/* Success Celebration Card */}
            {(labCompleted || stats.pct === 100) && (
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-10 text-center shadow-2xl animate-fade-in relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500/30">
                  <Trophy size={40} className="animate-bounce-slow" />
                </div>
                <h2 className="text-3x font-black text-white italic uppercase tracking-[0.1em] mb-4">CONGRATULATIONS!</h2>
                <p className="text-emerald-400 font-black text-xs uppercase tracking-widest mb-2">Mission Accomplished</p>
                <p className="text-slate-400 mb-8 font-medium leading-relaxed max-w-md mx-auto">
                  You have successfully neutralized all threats and captured all flags in the <span className="text-white font-bold">{lab.title}</span> environment.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button 
                    onClick={handleStartMachine}
                    className="px-8 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-black rounded-xl transition-all shadow-xl shadow-orange-600/20 uppercase tracking-widest text-xs flex items-center gap-2 hover:scale-[1.05] active:scale-[0.95]"
                  >
                    <RotateCcw size={16} /> Restart Mission
                  </button>
                  <Link 
                    to="/leaderboard"
                    className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-black rounded-xl transition-all border border-white/10 uppercase tracking-widest text-xs flex items-center gap-2"
                  >
                    <Trophy size={16} className="text-amber-500" /> View Leaderboard
                  </Link>
                </div>
              </div>
            )}

            {/* Tasks Section */}
            <div className="space-y-8">
               <div className="flex items-center justify-between mb-8 px-2">
                 <h2 className="text-2xl font-black text-white uppercase tracking-tight">Mission Objectives</h2>
                 <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em]">Phase 1 Deployment</span>
               </div>
               
                {lab.tasks.map((task, idx) => (
                  <LabTask
                    key={task.id}
                    task={task}
                    isCompleted={completedTasks.includes(task.id)}
                    isActive={idx === currentTaskIdx}
                    isLocked={false}
                    onSubmit={handleSubmitAnswer}
                  />
                ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-[#0b121e] border border-white/5 rounded-3xl p-8 sticky top-24 overflow-hidden">
               {/* Decorative background element */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16 rounded-full" />
               
               <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.25em] mb-8 border-l-2 border-blue-500 px-3">Intelligence Summary</h3>
               
               <div className="space-y-6">
                 {/* Points Card */}
                 <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                   <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                     <Trophy size={18} />
                   </div>
                   <div>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Max Points</p>
                     <p className="text-lg font-black text-white">{lab.points} XP</p>
                   </div>
                 </div>

                 {/* History Card */}
                 <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                   <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                     <Activity size={18} />
                   </div>
                   <div>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Best Score</p>
                     <p className="text-lg font-black text-white">{bestScore} XP</p>
                   </div>
                 </div>

                 {/* Attempts Card */}
                 <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                   <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500">
                     <RotateCcw size={18} />
                   </div>
                   <div>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Attempts</p>
                     <p className="text-lg font-black text-white">{attemptsCount}</p>
                   </div>
                 </div>
               </div>

               <div className="mt-10 p-6 bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/10 rounded-2xl">
                 <div className="flex items-center gap-3 mb-4">
                    <ShieldAlert size={16} className="text-blue-400" />
                    <h4 className="text-xs font-black text-white uppercase tracking-widest">Rules of Engagement</h4>
                 </div>
                 <ul className="space-y-3">
                   <li className="flex gap-3 text-[11px] text-slate-400 font-medium">
                     <span className="text-blue-500 font-black">01</span>
                     <span>Accessing unauthorized systems outside of the lab range is strictly prohibited.</span>
                   </li>
                   <li className="flex gap-3 text-[11px] text-slate-400 font-medium">
                     <span className="text-blue-500 font-black">02</span>
                     <span>Use only the provided tools within the secure browser-based terminal.</span>
                   </li>
                 </ul>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabPage;
