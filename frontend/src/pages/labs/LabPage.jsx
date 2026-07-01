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
  ShieldAlert,
  Target,
  Shield,
  Eye,
  X,
  Sparkles,
  Youtube,
  MessageSquare,
  Crosshair,
  Award,
  Crown
} from "lucide-react";
import { labsService } from "../../services/labs";
import { attemptsService } from "../../services/attempts";
import { useApp } from "../../contexts/app-context";
import { getLabXP } from "../../utils/xpConfig";
import "./LabPage.css";

/* ─── Glossary Terms ─── */
const GLOSSARY = {
  "reverse shell": "A connection where the target machine connects back to the attacker, giving remote command-line access.",
  "environment variable": "A dynamic value stored in the OS that programs can read — often used to pass secrets like API keys.",
  "flag": "A hidden string you must find to prove you completed a challenge, like flag{example}.",
  "forensics": "The practice of collecting and analyzing digital evidence from computer systems after a security incident.",
  "C2 server": "Command & Control server — the attacker's remote system used to send orders to compromised machines.",
  "lateral movement": "Techniques attackers use to move through a network after initial access to reach more valuable targets.",
  "privilege escalation": "Exploiting a bug to gain higher-level permissions than originally granted on a system."
};

/* ─── Tutorial Video Map ─── */
const TUTORIAL_MAP = {
  "Web Security": "https://www.youtube.com/embed/nkkcQcl4vPU",
  "Network Security": "https://www.youtube.com/embed/E75OjnlOhKk",
  "Cryptography": "https://www.youtube.com/embed/jhXCTbFnK8o",
  "Forensics": "https://www.youtube.com/embed/FccI31kzZao",
  "Reverse Engineering": "https://www.youtube.com/embed/gh2RXE9BIN8",
  "OSINT": "https://www.youtube.com/embed/qwA6MmbeGNo",
  "Cloud Security": "https://www.youtube.com/embed/hEGGp9XqDjI"
};

/* ─── Skill Tree Map ─── */
const SKILL_TREES = {
  "Web Security": ["HTTP Analysis", "XSS Detection", "SQL Injection", "Auth Bypass"],
  "Network Security": ["Packet Capture", "Port Scanning", "Firewall Rules", "DNS Audit"],
  "Forensics": ["Log Analysis", "File Carving", "Memory Dump", "Timeline Reconstruction"],
  "Reverse Engineering": ["Binary Analysis", "Disassembly", "Malware Triage", "Config Extraction"],
  "Cryptography": ["Hash Cracking", "Cipher Analysis", "Key Management", "PKI"],
  "OSINT": ["Recon", "Metadata Extraction", "Social Engineering", "Domain Intel"],
  "Cloud Security": ["IAM Audit", "S3 Misconfig", "Lambda Injection", "Container Escape"]
};

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

/* ─── Markdown / Formatting Clean Up Utilities ─── */
const getEmbedUrl = (url) => {
  if (!url) return null;
  let videoId = "";
  if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1]?.split("?")[0];
  } else if (url.includes("youtube.com/watch?v=")) {
    videoId = url.split("v=")[1]?.split("&")[0];
  } else if (url.includes("youtube.com/embed/")) {
    return url; // Already an embed URL
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};
const parseBoldText = (text) => {
  if (!text) return "";
  const parts = text.split('**');
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return <strong key={i} className="text-white font-bold">{part}</strong>;
    }
    return part;
  });
};

const renderCleanBriefing = (text) => {
  if (!text) return null;
  
  const lines = text.split('\n');
  const elements = [];
  let inList = false;
  let listItems = [];

  const flushList = (key) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${key}`} className="list-disc pl-5 my-3 space-y-2 text-slate-300 text-xs leading-relaxed">
          {listItems.map((item, index) => (
            <li key={index} className="opacity-90">{item}</li>
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList(index);
      return;
    }

    if (trimmed.startsWith('##')) {
      flushList(index);
      const headingText = trimmed.replace(/^##\s*/, '').replace(/\*\*/g, '');
      elements.push(
        <h4 key={index} className="text-sm font-bold text-orange-400 mt-4 mb-2 uppercase tracking-wide">
          {headingText}
        </h4>
      );
    } else if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
      inList = true;
      const itemText = trimmed.substring(1).trim();
      listItems.push(parseBoldText(itemText));
    } else {
      flushList(index);
      elements.push(
        <p key={index} className="text-slate-300 text-xs leading-relaxed opacity-95 mb-3">
          {parseBoldText(trimmed)}
        </p>
      );
    }
  });

  flushList('final');
  return <div className="space-y-1">{elements}</div>;
};

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

/* ─── Gamified Concept Modal ─── */
const ConceptModal = memo(({ term, content, onClose }) => {
  if (!term) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
      <div className="absolute inset-0 cursor-default" onClick={onClose} />
      
      <div className="relative bg-[#0d1424] border border-orange-500/30 rounded-2xl max-w-md w-full overflow-hidden shadow-[0_0_40px_rgba(249,115,22,0.15)] animate-scale-up z-10">
        
        <div className="bg-slate-950 px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
            </span>
            <span className="text-[10px] font-mono text-orange-400 font-bold uppercase tracking-widest">
              Intel Decrypted
            </span>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-500 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shadow-inner">
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider">{term}</h3>
              <p className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">Concept Node: Level 1</p>
            </div>
          </div>

          <div className="h-px bg-white/5" />

          <div className="bg-slate-950/60 border border-white/5 rounded-xl p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/[0.02] blur-xl rounded-full" />
            <p className="text-xs text-slate-300 leading-relaxed relative z-10 font-medium">
              {content}
            </p>
          </div>

          <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 pt-1">
            <span>KNOWLEDGE INDEX: SECURE</span>
            <span className="text-emerald-400 flex items-center gap-1 font-bold">
              <Zap size={10} className="fill-emerald-500/20" /> READINESS BOOSTED
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:brightness-110 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md shadow-orange-500/10"
          >
            Acknowledge Intel
          </button>
        </div>

      </div>
    </div>
  );
});

/* ─── Lab Task Component ─── */
const LabTask = memo(({ task, isCompleted, isActive, isLocked, onSubmit }) => {
  const [expanded, setExpanded] = useState(isActive);
  const [answer, setAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isActive) {
      setExpanded(true);
    } else if (isCompleted) {
      setExpanded(false);
    }
  }, [isActive, isCompleted]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return;
    setSubmitting(true);
    const success = await onSubmit(task.id, answer);
    if (success) {
      setAnswer("");
    }
    setSubmitting(false);
  };

  return (
    <div
      className={`mb-4 rounded-xl border transition-all duration-300 ${
        isCompleted 
          ? "border-emerald-500/20 bg-slate-900/10" 
          : isActive
            ? "border-orange-500/50 bg-[#0d1424] shadow-lg shadow-orange-500/5 ring-1 ring-orange-500/20"
            : "border-white/5 bg-slate-950/20"
      } ${isLocked ? "opacity-50 pointer-events-none select-none" : ""}`}
    >
      {/* Header Bar */}
      <button
        onClick={() => !isLocked && !isCompleted && setExpanded(!expanded)}
        disabled={isLocked || isCompleted}
        className={`w-full flex items-center justify-between text-left transition-all duration-300 ${
          isCompleted || isLocked ? "cursor-default" : "cursor-pointer"
        } ${expanded ? "p-6 pb-3" : "p-4"}`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-colors duration-300 ${
            isCompleted 
              ? "bg-emerald-500/20 text-emerald-400" 
              : isActive
                ? "bg-orange-500 text-white"
                : "bg-white/5 text-slate-500"
          }`}>
            {isCompleted ? <Check size={16} className="text-emerald-400 font-bold" /> : isLocked ? <Lock size={12} /> : task.id}
          </div>
          <div>
            <h4 className={`text-sm font-bold tracking-tight transition-colors duration-300 ${
              isCompleted ? "text-slate-400 line-through" : "text-white"
            }`}>
              {task.title}
            </h4>
            {isActive && (
              <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider block mt-0.5 animate-pulse">
                Active Objective
              </span>
            )}
          </div>
        </div>
        {!isLocked && !isCompleted && (
          <div className="text-slate-500">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        )}
      </button>

      {/* Expanded content */}
      {!isLocked && expanded && (
        <div className="px-6 pb-6 pt-1 space-y-4 border-t border-white/5">
          <p className="text-slate-300 text-xs leading-relaxed mt-3">{task.instructions}</p>

          {/* View Hints & Commands Toggle */}
          {(task.commands?.length > 0 || task.hint || task.hints) && (
            <div>
              <button
                type="button"
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 font-bold transition-colors mt-2"
              >
                <span>💡 {showHint ? "Hide Hints & Commands" : "View Hints & Commands"}</span>
              </button>

              {showHint && (
                <div className="mt-3 bg-slate-950 p-4 rounded-xl border border-white/5 space-y-3 animate-fade-in font-mono text-xs text-green-400">
                  {(task.hint || task.hints) && (
                    <p className="text-xs text-slate-300 leading-relaxed italic font-sans mb-2">
                      <span className="font-bold text-orange-400 font-sans">Hint:</span> {task.hint || task.hints}
                    </p>
                  )}
                  {task.commands && task.commands.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-sans">Suggested Commands:</p>
                      {task.commands.map((cmd, i) => (
                        <CommandBox key={i} command={cmd} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Form Flag Input */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3 mt-4">
            <div className="relative flex-1 w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                <Key size={14} />
              </span>
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={isCompleted || submitting}
                placeholder="Enter flag here (e.g., FLAG{...})"
                className="w-full bg-slate-950 border border-white/10 rounded-lg py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/50 transition-colors font-mono"
              />
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
              <button
                type="button"
                onClick={() => setShowHint(true)}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors font-medium underline underline-offset-4 whitespace-nowrap"
              >
                Need Help?
              </button>
              <button
                type="submit"
                disabled={isCompleted || submitting || !answer.trim()}
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95 shadow-md shadow-orange-500/15"
              >
                {submitting ? <Loader className="animate-spin" size={12} /> : "Submit Flag"}
              </button>
            </div>
          </form>
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

  // Guided Learning State
  const [guidedMode, setGuidedMode] = useState(true);
  const [activeContentTab, setActiveContentTab] = useState('briefing'); // briefing | tutorial | concepts
  const [glossaryTerm, setGlossaryTerm] = useState(null);
  const [expandedConcept, setExpandedConcept] = useState(null);
  const [tutorialWatched, setTutorialWatched] = useState(() => {
    try { return localStorage.getItem(`tutorial_watched_${window.location.pathname.split('/').pop()}`) === 'true'; } catch { return false; }
  });

  // UI Refactoring States
  const [videoUnlocked, setVideoUnlocked] = useState(false);
  const [assistanceTab, setAssistanceTab] = useState("concepts"); // concepts | video
  const [briefingOpen, setBriefingOpen] = useState(true);
  const [copiedIp, setCopiedIp] = useState(false);
  const [selectedConcept, setSelectedConcept] = useState(null);

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

  const handleCopyIp = () => {
    navigator.clipboard.writeText("10.10.142.5");
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 2000);
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
          const finalScore = getLabXP(lab.difficulty) || lab.points || 200; // Synced with centralized XP config

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
      {/* Background decoration */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-600/5 blur-[150px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full animate-pulse-slow delay-1000" />
      </div>

      <div className="relative z-10">
        {/* Top Navigation / Breadcrumb */}
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/labs" className="p-2 hover:bg-white/5 rounded-lg transition-colors group">
              <ArrowLeft size={16} className="text-slate-400 group-hover:text-white transition-colors" />
            </Link>
            <div className="flex items-center gap-2.5 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
              <Link to="/labs" className="hover:text-orange-400 transition-colors">Archive</Link>
              <ChevronRight size={10} className="text-slate-700" />
              <span className="text-orange-500 truncate max-w-[200px]">{lab.title}</span>
            </div>
          </div>
        </div>

        {/* ═══ 3-COLUMN WORKSPACE GRID ═══ */}
        <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* COLUMN 1: LEFT SIDEBAR (Span 3) - "The Mission Hub" */}
          <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-24">
            
            {/* Top card: Lab Title, Category, Reward, Time Limit */}
            <div className="bg-[#0b121e]/80 border border-white/5 rounded-2xl p-5 space-y-4 backdrop-blur-md">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-orange-500">{lab.category || "Infrastructure Forensics"}</span>
                <h2 className="text-xl font-bold text-white uppercase tracking-tight mt-1 leading-tight">{lab.title}</h2>
              </div>
              <div className="h-px bg-white/5" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-1">Total XP Reward</p>
                  <p className="text-sm font-black text-amber-500 flex items-center gap-1.5 mt-0.5">
                    <Zap size={14} className="text-amber-400" />
                    +{getLabXP(lab.difficulty)} XP
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-1">Estimated Time</p>
                  <p className="text-sm font-bold text-blue-400 flex items-center gap-1.5 mt-0.5">
                    <Clock size={14} />
                    {lab.estimatedTime || lab.duration || "45m"}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-1">Required Level</p>
                  <p className="text-xs font-bold text-[#88E636] uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                    <BookOpen size={12} className="text-[#88E636]" />
                    Level {lab.difficulty === 'Beginner' ? 1 : lab.difficulty === 'Intermediate' ? 5 : lab.difficulty === 'Advanced' ? 10 : 20}+
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-1">Certificate</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                    <Crown size={12} className="text-purple-400" />
                    In Progress
                  </p>
                </div>
              </div>
              <div className="pt-2">
                <DifficultyBadge level={lab.difficulty} />
              </div>
              
              {/* TARGET/EARNED BADGE */}
              {lab.badgeReward && (
                <div className="mt-4 pt-4 border-t border-white/5 animate-fade-in">
                  <span className={`text-[9px] font-bold uppercase tracking-widest block mb-3 ${labCompleted ? 'text-emerald-500' : 'text-slate-500'}`}>
                    {labCompleted ? 'Earned Achievement' : 'Target Achievement'}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg border flex items-center justify-center shadow-inner ${labCompleted ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-orange-500/10 border-orange-500/20 text-orange-500'}`}>
                      <Award size={18} />
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold uppercase tracking-wider ${labCompleted ? 'text-emerald-400' : 'text-white'}`}>{lab.badgeReward.name}</h4>
                      <p className="text-[9px] text-slate-400 mt-0.5 line-clamp-2">{lab.badgeReward.description}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Middle card: Deployment Button */}
            <div className="bg-[#0b121e]/80 border border-white/5 rounded-2xl p-5 space-y-3 backdrop-blur-md">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Environment Controller</span>
              
              {machineStatus === "stopped" ? (
                <button 
                  onClick={handleStartMachine} 
                  disabled={operationLoading} 
                  className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 active:scale-95 transition-all text-white font-bold rounded-xl shadow-lg shadow-orange-500/15 uppercase tracking-wider text-xs flex items-center justify-center gap-2" style={{ color: '#FFFFFF' }}
                >
                  <Play size={14} fill="#fff" style={{ color: '#FFFFFF' }} />
                  DEPLOY VIRTUAL MACHINE
                </button>
              ) : machineStatus === "booting" ? (
                <div className="w-full py-3.5 bg-slate-900 border border-white/5 text-slate-500 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed">
                  <Loader className="animate-spin text-orange-500" size={14} />
                  Spawning Instance...
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-slate-900/40 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between shadow-lg shadow-emerald-500/5 backdrop-blur-md relative overflow-hidden">
                    <div className="absolute inset-0 bg-emerald-500/[0.02] pointer-events-none" />
                    <div className="flex items-center gap-3 relative z-10">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                      </span>
                      <span className="text-xs font-mono text-slate-300 font-bold">Target IP: 10.10.142.5</span>
                    </div>
                    <button 
                      onClick={handleCopyIp}
                      className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors animate-fade-in"
                      title={copiedIp ? "Copied!" : "Copy IP to clipboard"}
                    >
                      {copiedIp ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                  {terminalUrl && (
                    <a 
                      href={terminalUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:brightness-110 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow-md shadow-orange-600/10 btn-primary" style={{ color: '#FFFFFF' }}
                    >
                      <ExternalLink size={12} style={{ color: '#FFFFFF' }} /> Open Console
                    </a>
                  )}
                  <button 
                    onClick={handleStopLab} 
                    disabled={operationLoading} 
                    className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors"
                  >
                    {operationLoading ? <Loader className="animate-spin" size={12} /> : "Terminate VM"}
                  </button>
                </div>
              )}

              {operationError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] text-red-400 font-medium">
                  {operationError}
                </div>
              )}
            </div>

            {/* Bottom card: Global lab stats */}
            <div className="bg-[#0b121e]/80 border border-white/5 rounded-2xl p-5 backdrop-blur-md">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-4">Readiness & Progress</span>
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-24 h-24 mb-4">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="40" className="stroke-white/5" strokeWidth="6" fill="transparent" />
                    <circle 
                      cx="48" cy="48" r="40" 
                      className="stroke-orange-500 transition-all duration-1000" 
                      strokeWidth="6" 
                      strokeDasharray={2 * Math.PI * 40} 
                      strokeDashoffset={2 * Math.PI * 40 * (1 - stats.pct / 100)} 
                      strokeLinecap="round" 
                      fill="transparent" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-xl font-bold text-white leading-none">{stats.pct}%</span>
                     <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider mt-1">Cleared</span>
                  </div>
                </div>
                <div className="w-full flex justify-between items-center text-[10px] border-t border-white/5 pt-4">
                  <span className="text-slate-400 font-medium uppercase tracking-wider">Total Attempts</span>
                  <span className="text-white font-bold">{attemptsCount}</span>
                </div>
              </div>
            </div>

          </div>

          {/* COLUMN 2: CENTER PANEL (Span 6) - "The Briefing & Objective Arena" */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Top Card: Collapsible Briefing Accordion */}
            <div className="bg-[#0b121e]/80 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md">
              <button 
                onClick={() => setBriefingOpen(!briefingOpen)}
                className="w-full p-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                    <Info size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Mission Intelligence & Case File</h3>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Dossier operational parameters</p>
                  </div>
                </div>
                <div className="text-slate-500">
                  {briefingOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </button>
              
              {briefingOpen && (
                <div className="p-6 pt-3 border-t border-white/5 space-y-4 animate-fade-in">
                  <div className="border-l-2 border-orange-500/40 pl-4 py-1">
                    <span className="text-[9px] font-bold text-orange-500 uppercase tracking-widest block mb-1">Operational Briefing</span>
                    <p className="text-slate-300 text-xs leading-relaxed">{lab.description}</p>
                  </div>
                  <div className="h-px bg-white/5 my-2" />
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Technical Intelligence Parameters</span>
                  <div className="space-y-2 text-slate-300 text-xs leading-relaxed">
                    {renderCleanBriefing(lab.content)}
                  </div>
                </div>
              )}
            </div>

            {/* Active Tasks Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div>
                  <span className="text-[9px] font-bold text-orange-500 uppercase tracking-widest block">Objective Checklist</span>
                  <h3 className="text-lg font-bold text-white uppercase tracking-tight">Mission Objectives</h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                  {stats.completed} / {stats.total} Cleared
                </span>
              </div>

              <div className="space-y-3">
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

          </div>

          {/* COLUMN 3: RIGHT SIDEBAR (Span 3) - "Assistance & Resources" */}
          <div className="lg:col-span-3 lg:sticky lg:top-24">
            
            <div className="bg-[#0b121e]/80 border border-white/5 rounded-2xl overflow-hidden flex flex-col backdrop-blur-md">
              {/* Tab headers */}
              <div className="flex border-b border-white/5 bg-white/[0.01] relative">
                <button 
                  onClick={() => setAssistanceTab("concepts")}
                  className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider relative transition-colors ${
                    assistanceTab === "concepts" 
                      ? "text-white font-medium" 
                      : "text-slate-400 hover:text-slate-200 transition-colors"
                  }`}
                >
                  Concepts
                  {assistanceTab === "concepts" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
                  )}
                </button>
                <button 
                  onClick={() => setAssistanceTab("video")}
                  className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider relative transition-colors ${
                    assistanceTab === "video" 
                      ? "text-white font-medium" 
                      : "text-slate-400 hover:text-slate-200 transition-colors"
                  }`}
                >
                  Walkthrough
                  {assistanceTab === "video" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
                  )}
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-5 min-h-[340px] flex flex-col justify-between">
                {assistanceTab === "concepts" && (
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen size={14} className="text-slate-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Concept Explainer</h4>
                    </div>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {Object.keys(GLOSSARY).map(term => {
                        return (
                          <button 
                            key={term}
                            onClick={() => setSelectedConcept(term)}
                            className="w-full p-2.5 rounded-lg border bg-white/[0.01] border-white/5 hover:border-orange-500/30 hover:bg-orange-500/5 text-left transition-all duration-300 flex items-center justify-between group active:scale-[0.98]"
                          >
                            <span className="text-[10px] font-bold text-slate-200 uppercase tracking-wide group-hover:text-white transition-colors">{term}</span>
                            <span className="text-[9px] font-mono text-orange-500/60 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all uppercase font-bold flex items-center gap-1">
                              Decrypt <ChevronRight size={10} />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {assistanceTab === "video" && (
                  <div className="flex-1 flex flex-col justify-between">
                    {!videoUnlocked ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-4 bg-slate-950/40 rounded-xl border border-white/5 min-h-[260px]">
                        <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 mb-3 animate-pulse">
                          <Youtube size={20} />
                        </div>
                        <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Need direct guidance?</h5>
                        <p className="text-[10px] text-slate-500 mb-4 max-w-[180px] leading-relaxed">
                          Stuck? Unlock Video Walkthrough (Reduces XP)
                        </p>
                        <button 
                          onClick={() => setVideoUnlocked(true)}
                          className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg text-[9px] uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-md shadow-orange-600/10"
                        >
                          Unlock Video
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3 animate-fade-in">
                        <div className="aspect-video rounded-xl overflow-hidden border border-white/10 bg-black">
                            <iframe
                              src={
                                (lab?.resources && lab.resources.length > 0 && lab.resources.find(r => r.type === "video")?.url)
                                  ? getEmbedUrl(lab.resources.find(r => r.type === "video").url)
                                  : (lab?.slug === "active-directory" || lab?.title?.toLowerCase().includes("active directory"))
                                    ? "https://www.youtube.com/embed/-vjF3kgvWVg"
                                    : TUTORIAL_MAP[lab?.category] || TUTORIAL_MAP['Web Security']
                              }
                            title="Walkthrough Video"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                          Carefully trace the terminal input values demonstrated in the guide to identify target flags.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Concept Modal Popup */}
      {selectedConcept && (
        <ConceptModal 
          term={selectedConcept}
          content={GLOSSARY[selectedConcept]}
          onClose={() => setSelectedConcept(null)}
        />
      )}
    </div>
  );
};

export default LabPage;
