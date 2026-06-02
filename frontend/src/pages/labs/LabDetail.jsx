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
  Copy,
  Check,
  BookOpen,
  Star,
  Activity,
  AlertCircle,
  ShieldAlert,
  ChevronRight,
  Key
} from "lucide-react";
import { useApp } from "../../contexts/app-context";
import { getLabXP } from "../../utils/xpConfig";
import axios from "../../api/axios";
import "./LabDetail.css";
/* ─── Contextual Onboarding Intelligence Map ─── */
const getTaskOnboarding = (taskTitle, index, labSlug = "") => {
  const titleLower = taskTitle.toLowerCase();
  const slugLower = labSlug.toLowerCase();

  // Lab 1: Linux Forensics
  if (slugLower.includes("forensic") || titleLower.includes("forensic") || titleLower.includes("linux")) {
    return {
      beginnerExplanation: "Forensics is security detective work. We analyze server logs, timestamps, and active files to reconstruct unauthorized user pathways.",
      whyItMatters: "Logs are the flight recorder of a server. When breaches occur, forensic logs help engineers patch vulnerabilities and identify attack signatures.",
      conceptExplain: "Examine /var/log/auth.log or access logs for repetitive failed logins or abnormal parameters. Tools include grep, awk, and find.",
      videoUrl: "https://www.youtube.com/embed/FccI31kzZao",
      videoTitle: "Linux Forensics Audit Walkthrough"
    };
  }

  // Lab 2: Malware Analysis
  if (slugLower.includes("malware") || titleLower.includes("malware") || titleLower.includes("reverse")) {
    return {
      beginnerExplanation: "Malware analysis helps dissect threat payloads. We examine registry modifications, command and control logs, and hidden environment values.",
      whyItMatters: "Understanding malicious binaries helps engineers create accurate security rules, detect intrusions, and isolate infected servers.",
      conceptExplain: "Analyze network trace logs, environment variables, and hidden JSON settings. Tools include printenv, grep, and sandbox auditing.",
      videoUrl: "https://www.youtube.com/embed/BjRMbe0-kLI",
      videoTitle: "Malware Analysis Bootcamp - Introduction To Malware Analysis"
    };
  }

  // Lab 3: Web Security
  if (slugLower.includes("web") || titleLower.includes("web") || titleLower.includes("sql") || titleLower.includes("exploit") || titleLower.includes("injection")) {
    return {
      beginnerExplanation: "Injection vulnerabilities occur when user input is executed directly as database queries. In SQL Injection, we inject SQL statements to bypass security gates.",
      whyItMatters: "Exploiting input fields can allow administrative database access, exposing private tables, user hashes, and master credentials.",
      conceptExplain: "By appending special characters (like ' OR '1'='1), we alter the query structure. Always sanitize input fields using parameterized queries.",
      videoUrl: "https://www.youtube.com/embed/nkkcQcl4vPU",
      videoTitle: "Web Security: Infrastructure Forensics Walkthrough"
    };
  }

  // General default fallback
  return {
    beginnerExplanation: `Objective ${index + 1} requires investigating active VM ports, running recommended commands on your range, and verifying administrative access logs.`,
    whyItMatters: "Auditing system services prevents configuration drift, privilege escalation loops, and potential unauthorized backdoor access.",
    conceptExplain: "Utilize the copyable commands in your active range terminal. Analyze the outputs, detect anomalous files or credentials, and grab the flag.",
    videoUrl: "https://www.youtube.com/embed/fNzpcB7ODxQ",
    videoTitle: "Ethical Hacking in 12 Hours - Full Course"
  };
};

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
const LabTask = memo(({ task, index, onComplete, isActive, isLocked, guidedMode, labSlug = "" }) => {
  const [expanded, setExpanded] = useState(isActive);
  const [answer, setAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [activeTab, setActiveTab] = useState(null); // 'concept', 'tutorial', or null

  useEffect(() => {
    if (isActive) setExpanded(true);
    else if (isLocked) setExpanded(false);
  }, [isActive, isLocked]);

  const onboarding = useMemo(() => getTaskOnboarding(task.title, index, labSlug), [task.title, index, labSlug]);

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
                  <Activity size={8} /> ACTIVE MISSION
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
          <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent mb-6" />
          
          {/* Beginner Onboarding Segment */}
          {guidedMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-500/[0.01] border border-blue-500/10 p-4 rounded-xl">
                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <Info size={11} /> Beginner Explanation
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  {onboarding.beginnerExplanation}
                </p>
              </div>
              <div className="bg-amber-500/[0.01] border border-amber-500/10 p-4 rounded-xl">
                <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <Zap size={11} /> Why It Matters
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  {onboarding.whyItMatters}
                </p>
              </div>
            </div>
          )}

          {/* Core Objectives & Description */}
          <div className="prose prose-invert max-w-none mb-6">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">MISSION INSTRUCTIONS</span>
            <div className="text-slate-300 leading-relaxed text-[14px] font-medium space-y-4">
              {task.description ? (
                task.description.split('```').map((block, i) => {
                  if (i % 2 === 1) return <CommandBox key={i} command={block.trim()} />;
                  return <p key={i} className="opacity-90">{block}</p>;
                })
              ) : (
                <p>In this task, you will explore the technical details of the environment and perform specific checks to identify vulnerabilities.</p>
              )}
            </div>
          </div>

          {/* Explain Buttons & Interactive Tabs */}
          {guidedMode && (
            <div className="border-t border-b border-white/5 py-4 my-6">
              <div className="flex flex-wrap items-center gap-3">
                <button 
                  onClick={() => setActiveTab(activeTab === 'concept' ? null : 'concept')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${
                    activeTab === 'concept' ? "bg-blue-600/20 border-blue-500 text-blue-400" : "bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <BookOpen size={11} /> Explain Concept
                </button>
                <button 
                  onClick={() => setActiveTab(activeTab === 'tutorial' ? null : 'tutorial')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${
                    activeTab === 'tutorial' ? "bg-purple-600/20 border-purple-500 text-purple-400" : "bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Play size={11} fill="currentColor" /> Simulated Walkthrough
                </button>
              </div>

              {activeTab === 'concept' && (
                <div className="mt-4 p-5 bg-[#0a111a] border border-blue-500/20 rounded-xl animate-fade-in">
                  <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Deep-Dive Concept Analysis</h5>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {onboarding.conceptExplain}
                  </p>
                </div>
              )}

              {activeTab === 'tutorial' && (
                <div className="mt-4 p-5 bg-[#0f111a] border border-purple-500/20 rounded-xl animate-fade-in space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2.5 flex-wrap gap-2">
                    <div>
                      <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest block mb-0.5">VIDEO TUTORIAL BRIEFING</span>
                      <h5 className="text-xs text-slate-200 font-bold uppercase tracking-tight">{onboarding.videoTitle}</h5>
                    </div>
                    <a 
                      href={onboarding.videoUrl.replace('/embed/', '/watch?v=')} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[9px] font-black text-purple-400 hover:text-purple-300 uppercase tracking-widest flex items-center gap-1 transition-colors bg-purple-500/10 px-2.5 py-1 rounded border border-purple-500/20"
                    >
                      Watch on YouTube <ExternalLink size={10} />
                    </a>
                  </div>

                  <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-white/5 bg-black shadow-2xl">
                    <iframe
                      src={onboarding.videoUrl}
                      title={onboarding.videoTitle}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Question / Flag Submission */}
          <div className="space-y-6 mt-8">
            <div className="flex items-center gap-3 ml-1">
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
  const { user } = useApp();
  const [lab, setLab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [machineStatus, setMachineStatus] = useState("stopped"); // stopped, booting, running
  const [ipAddress, setIpAddress] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [guidedMode, setGuidedMode] = useState(true);

  // Stateful AI assistant
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiHistory, setAiHistory] = useState([
    { sender: "assistant", text: "Secure link active. I can interpret sandbox commands, explain concepts, or offer objective hints. What do you need help with?" }
  ]);
  const [aiTyping, setAiTyping] = useState(false);

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

  const prepVideo = useMemo(() => {
    if (!lab) return { url: "https://www.youtube.com/embed/fNzpcB7ODxQ", title: "Ethical Hacking Full Course" };
    const titleLower = (lab.title || "").toLowerCase();
    const slugLower = (lab.slug || "").toLowerCase();
    
    // Lab 1: Linux Forensics
    if (slugLower.includes("forensic") || titleLower.includes("forensic") || titleLower.includes("linux")) {
      return { url: "https://www.youtube.com/embed/FccI31kzZao", title: "Linux Forensics Audit Walkthrough" };
    }
    // Lab 2: Malware Analysis
    if (slugLower.includes("malware") || titleLower.includes("malware") || titleLower.includes("reverse")) {
      return { url: "https://www.youtube.com/embed/BjRMbe0-kLI", title: "Malware Analysis Bootcamp - Introduction To Malware Analysis" };
    }
    // Lab 3: Web Security
    if (slugLower.includes("web") || titleLower.includes("web") || titleLower.includes("sql") || titleLower.includes("exploit") || titleLower.includes("injection")) {
      return { url: "https://www.youtube.com/embed/nkkcQcl4vPU", title: "Web Security: Infrastructure Forensics Walkthrough" };
    }
    
    return { url: "https://www.youtube.com/embed/fNzpcB7ODxQ", title: "Ethical Hacking in 12 Hours - Full Course" };
  }, [lab]);

  const handbookMaterial = useMemo(() => {
    if (!lab?.title) return {
      topic: "General Cyber Security & Target Environments",
      commands: [
        { cmd: "ping <IP>", desc: "Check connection status to target environment." },
        { cmd: "id", desc: "Print current user authority and operational groups." },
        { cmd: "ls -la", desc: "List all files, including hidden system backdoors." }
      ]
    };
    const titleLower = lab.title.toLowerCase();
    if (titleLower.includes("recon") || titleLower.includes("scan") || titleLower.includes("port") || titleLower.includes("nmap")) {
      return {
        topic: "Network Reconnaissance & Service Discovery",
        commands: [
          { cmd: "nmap -sV -p- <IP>", desc: "Scan all 65,535 ports on the target machine with version verification." },
          { cmd: "nmap -sC -sV <IP>", desc: "Run default safe discovery scripts against found active ports." },
          { cmd: "nc -zv <IP> 20-80", desc: "Quickly scan for open common ports between 20 and 80 without packet handshake." }
        ]
      };
    }
    if (titleLower.includes("exploit") || titleLower.includes("injection") || titleLower.includes("sql")) {
      return {
        topic: "Input Vulnerability & Database Exploitation",
        commands: [
          { cmd: "' OR 1=1 --", desc: "Common SQL Injection authentication bypass payload." },
          { cmd: "UNION SELECT null, username, password FROM users", desc: "Append additional query results from databases to dump master accounts." },
          { cmd: "sqlmap -u <TargetURL>", desc: "Automate discovery and database takeover vectors." }
        ]
      };
    }
    if (titleLower.includes("forensic") || titleLower.includes("log") || titleLower.includes("investigate")) {
      return {
        topic: "Security Forensics & Incident Log Analysis",
        commands: [
          { cmd: "tail -n 100 /var/log/auth.log", desc: "View the 100 most recent server authorization attempts." },
          { cmd: "grep -i 'failed' /var/log/nginx/access.log", desc: "Filter access logs for anomalous, unauthorized parameters or repetitive failures." },
          { cmd: "find / -mtime -2 -type f", desc: "Locate any files modified within the past 48 hours to discover malicious backdoors." }
        ]
      };
    }
    return {
      topic: "General Cyber Security & Target Environments",
      commands: [
        { cmd: "whoami", desc: "Identify active administrative privilege profile." },
        { cmd: "netstat -tuln", desc: "List local processes actively listening on network channels." },
        { cmd: "sudo -l", desc: "Check system commands user is authorized to run with elevated privileges." }
      ]
    };
  }, [lab?.title]);

  const handleAskAI = async (promptText) => {
    const question = promptText || aiQuestion;
    if (!question.trim()) return;
    
    setAiHistory(prev => [...prev, { sender: "user", text: question }]);
    setAiQuestion("");
    setAiTyping(true);

    await new Promise(resolve => setTimeout(resolve, 800));
    
    let aiResponse = "Analysing sandbox logs... For optimal performance, copy the active recommended command into your deployed terminal, then submit the result.";
    if (question.toLowerCase().includes("flag") || question.toLowerCase().includes("answer")) {
      aiResponse = "To grab the flag, execute the terminal commands listed under your active task. Analyze the decryption or scan outputs and enter them in the payload box.";
    } else if (question.toLowerCase().includes("hint") || question.toLowerCase().includes("help")) {
      aiResponse = "Guided Mode is active! Expand the current task card to reveal the 'Request Intelligence' button for targeted clues.";
    } else if (question.toLowerCase().includes("concept") || question.toLowerCase().includes("why")) {
      aiResponse = "Understanding vulnerability architecture is critical. It allows developers to identify exploit vectors before malicious actors execute arbitrary code.";
    }

    setAiHistory(prev => [...prev, { sender: "assistant", text: aiResponse }]);
    setAiTyping(false);
  };

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

        {/* ═══ 1. COMPACT HERO SECTION (TOP) ═══ */}
        <div className="bg-[#0b121e]/45 border-b border-white/5 py-6">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <DifficultyBadge level={lab.difficulty} />
                <span className="text-slate-600">•</span>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Clock size={12} /> {lab.estimatedTime || "45 MINS"}
                </div>
                <span className="text-slate-600">•</span>
                <div className="flex items-center gap-1 text-[10px] font-black text-amber-500 uppercase tracking-widest">
                  <Trophy size={12} /> {getLabXP(lab.difficulty)} XP
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                {lab.title}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Guided Mode Toggle */}
              <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 px-4 py-2 rounded-xl">
                <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Guided Mode</span>
                <button 
                  onClick={() => setGuidedMode(!guidedMode)}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                    guidedMode ? "bg-blue-600" : "bg-white/10"
                  }`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    guidedMode ? "translate-x-5" : "translate-x-1"
                  }`} />
                </button>
              </div>

              {/* Start Mission Button */}
              {machineStatus === "stopped" ? (
                <button 
                  onClick={handleDeploy}
                  className="px-6 py-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:scale-105 active:scale-95 text-white font-black rounded-xl transition-all shadow-lg shadow-orange-600/20 flex items-center gap-2 uppercase tracking-widest text-[10px]"
                >
                  <Play size={12} fill="currentColor" /> Start Mission
                </button>
              ) : machineStatus === "booting" ? (
                <div className="flex items-center gap-2 px-6 py-2 bg-white/5 text-slate-400 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest">
                  <div className="w-3.5 h-3.5 border-2 border-slate-700 border-t-white rounded-full animate-spin" />
                  Provisioning...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-black tracking-wider">
                    {ipAddress}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══ TRYHACKME-STYLE GUIDED ACADEMY ROADMAP ═══ */}
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT MAIN GUIDED WORKSPACE (70%) */}
            <div className="lg:col-span-8 space-y-10">
              
              {/* 🌟 STEP 01: WHAT YOU'LL LEARN & MISSION OVERVIEW */}
              <div className="bg-[#0f172a] rounded-3xl border border-white/5 overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-600 to-blue-400" />
                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-black text-sm">
                      01
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500">ACADEMIC FOUNDATION</span>
                      <h2 className="text-lg font-black text-white uppercase tracking-tight">Step 01: What You'll Learn</h2>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">BEGINNER-FRIENDLY BRIEFING</span>
                      <p className="text-[14px] text-slate-300 leading-relaxed font-medium">
                        {lab.description || `In this interactive cybersecurity sandbox, you will investigate operational security logs, analyze configuration ports, and execute offensive terminal operations to identify vulnerabilities.`}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl">
                        <span className="text-[8px] font-black text-blue-400 tracking-wider uppercase block mb-1.5 flex items-center gap-1.5"><Info size={10} /> Concepts Involved</span>
                        <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside font-sans">
                          <li>Network Reconnaissance Audits</li>
                          <li>System Configuration Audits</li>
                          <li>Offensive Command Injection Validation</li>
                          <li>Threat Identification & Backdoor Seclusion</li>
                        </ul>
                      </div>
                      <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl">
                        <span className="text-[8px] font-black text-amber-500 tracking-wider uppercase block mb-1.5 flex items-center gap-1.5"><Trophy size={10} /> Skills You Will Gain</span>
                        <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside font-sans">
                          <li>Offensive Console Operations</li>
                          <li>Interpreting Server Access Credentials</li>
                          <li>Real-time Vulnerability Assessment</li>
                          <li>Log Forensics Investigation</li>
                        </ul>
                      </div>
                    </div>

                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-start gap-3">
                      <Shield size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-[8px] font-black text-emerald-400 tracking-wider uppercase block">REAL-WORLD RELEVANCE</span>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">
                          This challenge simulates the exact operational methods used by enterprise SOC (Security Operations Center) defense teams to audit, isolate, and remediate backdoor penetrations in production subnets.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 🌟 STEP 02: PREPARATORY VIDEO TUTORIAL */}
              <div className="bg-[#0f172a] rounded-3xl border border-white/5 overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-purple-600 to-purple-400" />
                <div className="p-6 sm:p-8">
                  <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-black text-sm">
                        02
                      </div>
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-purple-400">GUIDED TUTORIAL VIDEO</span>
                        <h2 className="text-lg font-black text-white uppercase tracking-tight">Step 02: Preparatory Video Walkthrough</h2>
                      </div>
                    </div>
                    <a 
                      href={prepVideo.url.replace('/embed/', '/watch?v=')} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[9px] font-black text-purple-400 hover:text-purple-300 uppercase tracking-widest flex items-center gap-1.5 transition-colors bg-purple-500/10 px-3 py-1 rounded-lg border border-purple-500/20"
                    >
                      Watch on YouTube <ExternalLink size={10} />
                    </a>
                  </div>

                  <div className="space-y-4">
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      Watch the conceptual tutorial below to prepare yourself before initializing the sandbox range. This walkthrough covers Nmap scanning, vulnerability exploits, and log file navigation.
                    </p>
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-white/5 bg-black shadow-2xl">
                      <iframe
                        src={prepVideo.url}
                        title={prepVideo.title}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center mt-2 flex items-center justify-center gap-1.5">
                      <Play size={10} /> CURRENT REPOSITORY Walkthrough: {prepVideo.title}
                    </p>
                  </div>
                </div>
              </div>

              {/* 🌟 STEP 03: INTERACTIVE HANDBOOK & CHEATSHEETS */}
              <div className="bg-[#0f172a] rounded-3xl border border-white/5 overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-teal-600 to-teal-400" />
                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-black text-sm">
                      03
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-teal-400">READABLE HANDBOOK MATTERS</span>
                      <h2 className="text-lg font-black text-white uppercase tracking-tight">Step 03: Key Commands Cheatsheet</h2>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      Familiarize yourself with the core operational commands for <span className="text-teal-400 font-bold">{handbookMaterial.topic}</span>. We break them down into digestible blocks with zero intimidation.
                    </p>

                    <div className="space-y-4 font-sans">
                      {handbookMaterial.commands.map((cmdItem, i) => (
                        <div key={i} className="bg-white/[0.01] border border-white/5 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-teal-500/20 transition-all">
                          <div className="space-y-1.5">
                            <span className="text-[8px] font-black text-teal-400 tracking-wider uppercase block">RECOMMENDED COMMAND</span>
                            <code className="text-xs font-mono text-emerald-400 font-black tracking-wide bg-black/40 px-2.5 py-1 rounded border border-white/5 inline-block">{cmdItem.cmd}</code>
                          </div>
                          <div className="md:text-right max-w-md">
                            <span className="text-[8px] font-black text-slate-500 tracking-wider uppercase block">EXPLANATION</span>
                            <p className="text-xs text-slate-400 leading-relaxed">{cmdItem.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 🌟 STEP 04: TARGET ENVIRONMENT DEPLOYMENT */}
              <div className="bg-[#0f172a] rounded-3xl border border-white/5 overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-orange-600 to-orange-400" />
                <div className="p-6 sm:p-8">
                  <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center font-black text-sm">
                        04
                      </div>
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-400">TARGET ENVIRONMENT</span>
                        <h2 className="text-lg font-black text-white uppercase tracking-tight">Step 04: Deploy Sandbox VM</h2>
                      </div>
                    </div>

                    {/* Quick Sandbox Action Button */}
                    {machineStatus === "stopped" && (
                      <button 
                        onClick={handleDeploy}
                        className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 hover:scale-[1.03] active:scale-95 text-white font-black rounded-xl transition-all shadow-lg shadow-orange-600/20 flex items-center gap-2 uppercase tracking-widest text-[10px]"
                      >
                        <Play size={12} fill="currentColor" /> Initialize Sandbox VM
                      </button>
                    )}
                  </div>

                  {machineStatus === "stopped" ? (
                    <div className="bg-[#0c121e] border border-white/5 p-6 rounded-2xl text-center">
                      <Monitor size={32} className="text-slate-600 mx-auto mb-3" />
                      <p className="text-xs text-slate-400 uppercase font-black tracking-wider mb-2">Sandbox Environment Inactive</p>
                      <p className="text-[11px] text-slate-500 leading-relaxed max-w-md mx-auto mb-4 font-sans">
                        Press the "Initialize Sandbox VM" button above to spin up your dedicated target virtual machine and active operational command shell.
                      </p>
                    </div>
                  ) : machineStatus === "booting" ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-10 bg-[#0c121e] border border-white/5 rounded-2xl text-slate-400">
                      <div className="w-8 h-8 border-[3px] border-orange-500/10 border-t-orange-500 rounded-full animate-spin mb-2" />
                      <span className="text-xs font-black uppercase tracking-widest text-slate-300">PROVISIONING MACHINE LAB...</span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Securing virtual sub-networks</span>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Active Connection Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#0c121e] p-5 border border-emerald-500/20 rounded-2xl">
                        <div>
                          <span className="text-[7px] font-black text-emerald-500 block uppercase mb-1 tracking-wider">TARGET IP ADDRESS</span>
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-mono font-black text-emerald-400 tracking-wider">{ipAddress}</span>
                            <button 
                              onClick={() => { navigator.clipboard.writeText(ipAddress); alert("IP Copied!"); }}
                              className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-all"
                            >
                              <Copy size={11} />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col justify-center md:items-end">
                          <span className="text-[7px] font-black text-slate-500 block uppercase mb-1 tracking-wider">SESSION TIMER</span>
                          <span className="text-sm font-black text-slate-300 tracking-widest uppercase flex items-center gap-1.5"><Clock size={12} /> {Math.floor(timeLeft / 60)}m Left</span>
                        </div>
                      </div>

                      {/* Embedded Live Virtual Terminal */}
                      <div className="rounded-2xl border border-white/5 bg-black overflow-hidden shadow-2xl">
                        <div className="p-3 px-5 flex items-center justify-between bg-white/[0.02] border-b border-white/5">
                          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2"><Terminal size={12} /> Active Terminal Shell</span>
                          <a href={ipAddress} target="_blank" rel="noopener noreferrer" className="text-[9px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-1"><ExternalLink size={10} /> Fullscreen</a>
                        </div>
                        <iframe
                          src={ipAddress}
                          title="Lab Terminal"
                          className="w-full"
                          style={{ height: "420px", border: "none" }}
                          allow="clipboard-read; clipboard-write"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 🌟 STEP 05: GUIDED PRACTICAL CHALLENGES */}
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black text-sm">
                    05
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500">PRACTICAL CHALLENGES</span>
                    <h2 className="text-lg font-black text-white uppercase tracking-tight">Step 05: Practical Tasks Console</h2>
                  </div>
                </div>

                {/* Lab Tasks Feed */}
                <div className="space-y-6">
                  {lab.tasks?.map((task, idx) => (
                    <LabTask 
                      key={idx} 
                      task={task} 
                      index={idx} 
                      onComplete={handleCompleteTask}
                      isActive={idx === currentTaskIdx}
                      isLocked={idx > currentTaskIdx}
                      guidedMode={guidedMode}
                      labSlug={lab.slug}
                    />
                  ))}
                </div>
              </div>

              {/* Intelligence Repository Footer */}
              <div className="bg-[#1a2332]/20 rounded-3xl border border-white/5 p-8 overflow-hidden relative group">
                 <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl -mb-32 -mr-32 group-hover:bg-blue-600/10 transition-all duration-700" />
                 <h3 className="text-md font-black text-white uppercase tracking-wider mb-6 relative">Tactical Materials</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                    {[
                      { title: "VPN Access Key", icon: <Key size={16} /> },
                      { title: "Team Discord", icon: <ExternalLink size={16} /> },
                      { title: "Whitepapers", icon: <BookOpen size={16} /> },
                      { title: "System FAQ", icon: <Info size={16} /> }
                    ].map((res, i) => (
                      <button key={i} className="flex items-center justify-between p-4 bg-[#0d131f] hover:bg-[#111927] rounded-xl border border-white/5 hover:border-blue-500/30 transition-all group/btn shadow-sm">
                         <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/5 rounded-lg text-blue-500 transition-all group-hover/btn:bg-blue-500 group-hover/btn:text-white">{res.icon}</div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest transition-all group-hover/btn:text-slate-200">{res.title}</span>
                         </div>
                         <ArrowRight size={14} className="text-slate-600 group-hover/btn:text-blue-400 group-hover/btn:translate-x-1.5 transition-all duration-300" />
                      </button>
                    ))}
                 </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR: Tactical Operations Support (30%) */}
            <div className="lg:col-span-4 sticky top-28 space-y-6">
              
              {/* Operation Header */}
              <div className="p-1 px-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">TACTICAL UTILITIES</span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              </div>

              {/* Circular Operations Progress HUD */}
              <div className="bg-[#0f172a] p-6 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="flex items-center gap-6">
                   <div className="relative w-20 h-20">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="40" cy="40" r="34" className="stroke-white/5" strokeWidth="5" fill="transparent" />
                      <circle 
                        cx="40" cy="40" r="34" 
                        className="stroke-blue-500 transition-all duration-1000 ease-out" 
                        strokeWidth="5" 
                        strokeDasharray={2 * Math.PI * 34} 
                        strokeDashoffset={2 * Math.PI * 34 * (1 - stats.pct / 100)} 
                        strokeLinecap="round" 
                        fill="transparent" 
                        style={{ filter: 'drop-shadow(0 0 6px rgba(59,130,246,0.5))' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-lg font-black text-white leading-none">{stats.pct}%</span>
                       <p className="text-[5px] font-black tracking-[0.2em] text-blue-400 uppercase mt-1">SYNC</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1 border-l-2 border-blue-500">Operation Status</h3>
                    <p className="text-xl font-black text-white tracking-tight leading-none uppercase">
                      {stats.completed} <span className="text-slate-600">/</span> {stats.total} Tasks
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2 bg-white/5 px-2.5 py-1 rounded border border-white/5 inline-block">
                      {stats.pct === 100 ? "Elite Clearance" : "Operator Sync Mode"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Naturally Integrated CyberVerse AI Assistant */}
              <div className="bg-[#0f172a] rounded-3xl border border-white/5 overflow-hidden shadow-2xl flex flex-col">
                <div className="p-5 px-6 border-b border-white/5 bg-black/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Zap size={14} className="text-blue-500 animate-pulse" />
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">CYBERVERSE INTEL AI</span>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                </div>
                
                {/* Chat Feed */}
                <div className="p-4 h-[200px] overflow-y-auto space-y-3 font-sans text-xs bg-black/10">
                  {aiHistory.map((item, idx) => (
                    <div key={idx} className={`p-3 rounded-xl leading-relaxed ${
                      item.sender === "assistant" 
                        ? "bg-white/[0.02] border border-white/5 text-slate-300" 
                        : "bg-blue-600/10 border border-blue-500/20 text-blue-400 text-right ml-4"
                    }`}>
                      {item.text}
                    </div>
                  ))}
                  {aiTyping && (
                    <div className="p-3 bg-white/[0.02] border border-white/5 text-slate-500 rounded-xl animate-pulse">
                      Processing security vectors...
                    </div>
                  )}
                </div>

                {/* Question Prompt buttons */}
                <div className="p-3 px-4 border-t border-white/5 flex flex-wrap gap-1.5 bg-black/5">
                  <button onClick={() => handleAskAI("Explain active command")} className="text-[9px] bg-white/5 hover:bg-white/10 border border-white/5 px-2 py-1 rounded text-slate-400 uppercase font-black tracking-wider">
                    Explain Command
                  </button>
                  <button onClick={() => handleAskAI("Give me a hint")} className="text-[9px] bg-white/5 hover:bg-white/10 border border-white/5 px-2 py-1 rounded text-slate-400 uppercase font-black tracking-wider">
                    Hint
                  </button>
                </div>

                {/* Chat Input */}
                <div className="p-3 border-t border-white/5 bg-black/25 flex items-center gap-2">
                  <input 
                    type="text" 
                    placeholder="Ask operational query..."
                    className="flex-1 bg-white/5 border border-white/5 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-blue-500 font-sans text-slate-200"
                    value={aiQuestion}
                    onChange={e => setAiQuestion(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAskAI()}
                  />
                  <button 
                    onClick={() => handleAskAI()} 
                    className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-black text-[10px] uppercase"
                  >
                    Ask
                  </button>
                </div>
              </div>

              {/* Solver Rank Telemetry */}
              <div className="bg-[#0f172a] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                 <div className="p-6">
                   <div className="flex items-center gap-3 mb-6">
                     <Activity size={15} className="text-blue-500" />
                     <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase">Operator Live Telemetry</span>
                   </div>
                   <div className="space-y-4">
                     {[
                       { name: "RootK1d", time: "12m 4s", score: 150 },
                       { name: "CybeRhea", time: "14m 20s", score: 140 },
                       { name: "VoidPointer", time: "15m 55s", score: 130 },
                     ].map((player, i) => (
                       <div key={i} className="flex items-center justify-between group cursor-default">
                          <div className="flex items-center gap-3">
                             <div className={`w-8 h-8 rounded-lg border border-white/5 flex items-center justify-center font-black text-[10px] ${
                               i === 0 ? "bg-amber-500/10 text-amber-500" : "bg-white/5 text-slate-500"
                             }`}>
                                {i + 1}
                             </div>
                             <div>
                                <p className="text-xs font-black text-slate-300 group-hover:text-blue-400 transition-colors">{player.name}</p>
                                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">{player.time}</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <span className="text-[10px] font-black text-blue-400">+{player.score} XP</span>
                          </div>
                       </div>
                     ))}
                   </div>
                 </div>
                 <Link to={`/labs/${id}/leaderboard`} className="flex items-center justify-center gap-2 w-full py-4 bg-white/5 border-t border-white/5 text-[9px] font-black text-slate-500 hover:text-white hover:bg-white/[0.08] transition-all uppercase tracking-widest">
                    ACCESS TELEMETRY LOGS <ChevronRight size={12} />
                 </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Margin */}
        <div className="h-20" />
      </div>
    </div>
  );
});

/* ─── Difficulty Badge Logic ─── */
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