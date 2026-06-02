import { useState, useEffect, memo, useCallback, useMemo } from 'react';
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
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiCall } from '../../config/api';
import { getLabXP } from '../../utils/xpConfig';

/* ─── Task Component (THM Style) ─── */
const LabTask = memo(({ task, isCompleted, onSubmit }) => {
  const [expanded, setExpanded] = useState(!isCompleted);
  const [answer, setAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
      className={`mb-4 rounded-xl transition-all duration-300 ${
        isCompleted 
          ? "border border-emerald-500/30 bg-[#10b98108]" 
          : "border border-slate-700/50 bg-[#1a2332]"
      }`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 px-6 text-left"
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
            isCompleted ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-[#242f44] text-slate-400"
          }`}>
            {isCompleted ? <CheckCircle size={18} /> : task.id}
          </div>
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${isCompleted ? "text-emerald-500" : "text-slate-500"}`}>
              Task {task.id}
            </p>
            <h3 className="font-bold text-white transition-colors group-hover:text-blue-400">
              {task.title}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-3">
           {isCompleted && <span className="hidden sm:inline-block text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded tracking-widest uppercase">Completed</span>}
           {expanded ? <ChevronUp size={20} className="text-slate-500" /> : <ChevronDown size={20} className="text-slate-500" />}
        </div>
      </button>

      {expanded && (
        <div className="px-6 pb-6 animate-fade-in">
          <div className="h-px bg-slate-700/30 mb-5" />
          <div className="prose prose-invert max-w-none mb-6">
            <p className="text-slate-300 leading-relaxed text-sm">
              {task.instructions}
            </p>
          </div>

          {task.commands && task.commands.length > 0 && (
            <div className="mb-6 bg-[#0d1829] p-4 rounded-lg border border-slate-700/30">
               <p className="text-[10px] font-black text-slate-500 tracking-widest uppercase mb-3">Target Commands</p>
               <div className="space-y-2">
                 {task.commands.map((cmd, i) => (
                   <code key={i} className="block text-blue-400 font-mono text-sm bg-slate-950/50 p-2 rounded">
                     $ {cmd}
                   </code>
                 ))}
               </div>
            </div>
          )}

          <div className="bg-[#0b121e] p-5 rounded-lg border border-slate-700/30">
            <div className="flex items-start gap-3 mb-4">
               <HelpCircle size={16} className="text-blue-400 mt-0.5" />
               <p className="text-sm font-semibold text-white">{task.question}</p>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input 
                  type="text"
                  placeholder={isCompleted ? "Answer submitted" : "Enter flag or answer..."}
                  className="w-full bg-[#1a2332] border border-slate-700 rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-all font-mono"
                  value={isCompleted ? "**********" : answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={isCompleted}
                />
                {isCompleted && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500"><CheckCircle size={16} /></div>}
              </div>
              <button 
                type="submit"
                className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg ${
                  isCompleted 
                    ? "bg-slate-700 text-slate-400 cursor-not-allowed" 
                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20"
                }`}
                disabled={isCompleted || submitting || !answer.trim()}
              >
                {submitting ? "Checking..." : "Submit"}
              </button>
              {!isCompleted && task.hint && (
                <button 
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className={`px-3 py-2.5 rounded-lg transition-all ${showHint ? "bg-amber-500 text-slate-900" : "bg-slate-800 text-slate-400 hover:text-white"}`}
                  title="Show Hint"
                >
                  <Info size={18} />
                </button>
              )}
            </form>
            
            {showHint && task.hint && (
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg animate-fade-in">
                <p className="text-[11px] text-amber-500 flex items-center gap-2">
                  <Zap size={12} fill="currentColor" /> HINT: {task.hint}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

const LinuxForensicsLab = () => {
    // Current application design language
    const [labStarted, setLabStarted] = useState(false);
    const [machineStarted, setMachineStarted] = useState(false);
    const [labCompleted, setLabCompleted] = useState(false);
    const [terminalUrl, setTerminalUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [completedTasks, setCompletedTasks] = useState([]);

    const labConfig = {
        title: 'Linux File Forensics: Hidden Secrets',
        difficulty: 'Beginner',
        points: getLabXP('Beginner'),
        estimatedTime: '30-45 minutes'
    };

    const tasks = [
        {
            id: 1,
            title: 'Hidden File Discovery',
            instructions: 'Navigate to the evidence directory and list all files including hidden ones.',
            commands: ['cd /home/labuser/evidence', 'ls -a'],
            question: 'What is the name of the hidden file you discovered?',
            hint: 'Hidden files in Linux start with a dot (.)',
            correctAnswer: '.secret_note'
        },
        {
            id: 2,
            title: 'File Content Examination',
            instructions: 'Read the content of the hidden file you discovered.',
            commands: ['cat .secret_note'],
            question: 'What message is written inside the hidden file?',
            hint: 'Use the cat command to read file contents',
            correctAnswer: 'The password is hidden in the binary'
        },
        {
            id: 3,
            title: 'Binary File Investigation',
            instructions: 'There is a file called mystery.bin. Check its file type and decode it.',
            commands: ['file mystery.bin', 'base64 -d mystery.bin'],
            question: 'What is the decoded message from mystery.bin?',
            hint: 'The file is Base64 encoded. Use base64 -d to decode it',
            correctAnswer: 'SECRET_KEY_12345'
        },
        {
            id: 4,
            title: 'Command History Analysis',
            instructions: 'Examine the bash command history to find suspicious activity.',
            commands: ['cat ~/.bash_history'],
            question: 'What suspicious command appears in the history?',
            hint: 'Look for commands involving flags or secrets',
            correctAnswer: 'echo "FLAG" > /tmp/flag_storage'
        },
        {
            id: 5,
            title: 'Final Flag Extraction',
            instructions: 'Search the entire home directory for files containing the word "FLAG".',
            commands: ['grep -R "FLAG" /home/labuser 2>/dev/null', 'cat ~/.backup_flag.txt'],
            question: 'What is the final flag?',
            hint: 'The flag is stored in a hidden backup file',
            correctAnswer: 'FLAG{FORENSIC_DISCOVERY_COMPLETE}'
        }
    ];

    useEffect(() => {
        checkCompletionStatus();
    }, []);

    const checkCompletionStatus = async () => {
        try {
            const response = await apiCall('/labs/linux-forensics/completion-status');
            if (response.success && response.completed) {
                setLabCompleted(true);
                setLabStarted(true);
                setCompletedTasks(tasks.map(t => t.id));
            }
        } catch (err) {
            console.error('Error checking status:', err);
        }
    };

    const handleStartLab = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiCall('/labs/start/linux-forensics', { method: 'POST' });
            if (response.success) {
                setLabStarted(true);
            } else {
                throw new Error(response.message || 'Failed to start lab');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStartMachine = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiCall('/labs/start/linux-forensics', { method: 'POST' });
            if (response.success) {
                setMachineStarted(true);
                setTerminalUrl(response.webTerminalUrl);
            } else {
                throw new Error(response.message || 'Failed to start machine');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitAnswer = async (taskId, answer) => {
        const task = tasks.find(t => t.id === taskId);
        if (task.correctAnswer && answer.trim().toUpperCase() === task.correctAnswer.toUpperCase()) {
            const updatedCompletedTasks = [...completedTasks, taskId];
            setCompletedTasks(updatedCompletedTasks);
            
            if (taskId === tasks.length) {
                setLabCompleted(true);
                try {
                    const response = await apiCall('/labs/linux-forensics/complete', {
                        method: 'POST',
                        body: JSON.stringify({
                            tasksCompleted: tasks.length,
                            timeSpent: 0,
                            finalScore: labConfig.points
                        })
                    });
                    if (window.triggerRealtimeUpdate) window.triggerRealtimeUpdate();
                } catch (err) {
                    console.error('Record completion error:', err);
                }
            }
            return true;
        } else {
            setError(`Incorrect answer for Task ${taskId}. Try again!`);
            return false;
        }
    };

    const progressPct = Math.round((completedTasks.length / tasks.length) * 100);

    return (
        <div className="min-h-screen bg-[#0a1128] pb-40">
            {/* ═══ TOP NAVBAR CLEARANCE ═══ */}
            <div className="h-16" />

            {/* ═══ BREADCRUMB ═══ */}
            <div className="bg-[#0d1829] border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link to="/labs" className="p-2 text-slate-400 hover:text-white transition-colors">
                                <ArrowLeft size={18} />
                            </Link>
                            <div className="w-px h-6 bg-slate-700" />
                            <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase">
                                <Link to="/labs" className="hover:text-blue-400 transition-colors">LABS</Link>
                                <ArrowRight size={10} className="opacity-30" />
                                <span className="text-blue-400 truncate max-w-[150px]">{labConfig.title}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                              <Monitor size={14} className="text-emerald-400" />
                              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Environment Ready</span>
                           </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ IMMERSIVE HERO ═══ */}
            <div className="relative overflow-hidden bg-gradient-to-b from-[#0d1829] to-[#0a1128] pt-12 pb-10 border-b border-white/5">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -mr-64 -mt-32 pointer-events-none" />
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-600/30">
                                    <Terminal size={26} className="text-white" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black tracking-[0.3em] text-blue-500 uppercase">Hands-on Investigation</span>
                                    <div className="flex items-center gap-3 mt-1">
                                        <DifficultyBadge level={labConfig.difficulty} />
                                        <span className="w-1 h-1 bg-slate-700 rounded-full" />
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{labConfig.estimatedTime}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <h1 className="text-4xl sm:text-5xl font-black text-white mb-6 tracking-tight leading-[1.1]">
                                {labConfig.title}
                            </h1>
                            
                            <div className="flex flex-wrap items-center gap-8">
                                <div className="flex items-center gap-2.5">
                                    <Zap size={18} className="text-amber-400" />
                                    <span className="text-sm font-bold text-white uppercase tracking-wider">
                                        {labConfig.points} <span className="text-slate-500 font-medium">XP POINTS</span>
                                    </span>
                                </div>
                                <div className="w-px h-5 bg-slate-700 hidden sm:block" />
                                <div className="flex items-center gap-2.5">
                                    <Users size={18} className="text-blue-400" />
                                    <span className="text-sm font-bold text-white">1,245 <span className="text-slate-500 font-medium">Participants</span></span>
                                </div>
                                <div className="w-px h-5 bg-slate-700 hidden sm:block" />
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center -space-x-1.5">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <Star key={i} size={10} className="text-amber-500 fill-amber-500" />
                                        ))}
                                    </div>
                                    <span className="text-xs font-bold text-white ml-1">4.9 <span className="text-slate-500 font-medium">(215)</span></span>
                                </div>
                            </div>
                        </div>

                        {/* Progress Tracker */}
                        <div className="flex items-center gap-6 bg-[#1a2332]/60 backdrop-blur-2xl p-7 rounded-[2rem] border border-white/5 shadow-2xl">
                            <div className="relative w-24 h-24">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="48" cy="48" r="42" className="stroke-slate-800" strokeWidth="6" fill="transparent" />
                                    <circle cx="48" cy="48" r="42" className="stroke-blue-500 transition-all duration-1000" strokeWidth="6" strokeDasharray={`${2 * Math.PI * 42}`} strokeDashoffset={`${2 * Math.PI * 42 * (1 - progressPct/100)}`} strokeLinecap="round" fill="transparent" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                   <span className="text-xl font-black text-white leading-none">{progressPct}%</span>
                                   <span className="text-[7px] font-black tracking-[0.2em] text-slate-500 uppercase mt-1">PROGRESS</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Your Mission</p>
                                <h3 className="text-xl font-bold text-white leading-tight">
                                    {completedTasks.length} / {tasks.length} Tasks<br/>
                                    <span className={labCompleted ? "text-emerald-400" : "text-blue-400"}>
                                        {labCompleted ? "Completed" : "In Progress"}
                                    </span>
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ MAIN CONTENT GRID ═══ */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* LEFT COLUMN: The Lab Flow */}
                    <div className="lg:col-span-8 space-y-10">
                        
                        {/* Machine Control Center */}
                        <div className="bg-[#1a2332] rounded-3xl border border-blue-500/20 shadow-2xl overflow-hidden">
                           <div className="p-8 bg-gradient-to-r from-blue-600/10 to-transparent flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                                       <Monitor size={24} className="text-blue-400" />
                                       Lab Control Center
                                    </h3>
                                    <p className="text-sm text-slate-400">Spawn your isolated Linux environment to begin forensic analysis.</p>
                                </div>
                                
                                {!labStarted ? (
                                    <button 
                                        onClick={handleStartLab}
                                        disabled={loading}
                                        className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-600/30 flex items-center gap-3 uppercase tracking-widest text-xs"
                                    >
                                        {loading ? <Loader className="animate-spin" /> : <Play size={18} fill="currentColor" />}
                                        Start My Lab
                                    </button>
                                ) : !machineStarted && !labCompleted ? (
                                    <button 
                                        onClick={handleStartMachine}
                                        disabled={loading}
                                        className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-emerald-600/30 flex items-center gap-3 uppercase tracking-widest text-xs"
                                    >
                                        {loading ? <Loader className="animate-spin" /> : <Terminal size={18} />}
                                        Initialize Machine
                                    </button>
                                ) : machineStarted && !labCompleted ? (
                                    <div className="bg-[#0b121e] px-5 py-3 rounded-xl border border-emerald-500/30">
                                        <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase">Dynamic Target IP</span>
                                        <div className="flex items-center gap-4 mt-1">
                                            <span className="text-2xl font-mono font-bold text-emerald-400 tracking-tighter">10.10.245.82</span>
                                            <div className="flex items-center gap-2">
                                              <button className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-all" title="Refresh">
                                                <RotateCcw size={16} />
                                              </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 px-8 py-4 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                                        <CheckCircle size={20} />
                                        <span className="font-black text-xs uppercase tracking-widest">Lab Completed Successfully</span>
                                    </div>
                                )}
                           </div>
                           
                           {machineStarted && !labCompleted && (
                             <div className="p-6 bg-slate-950 border-t border-white/5">
                                <div className="flex items-center justify-between mb-4">
                                     <div className="flex items-center gap-3">
                                        <span className="relative flex h-3 w-3">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                        </span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Remote Terminal Protocol Active</span>
                                     </div>
                                </div>
                                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10 shadow-inner">
                                    <iframe
                                        src={terminalUrl || "about:blank"}
                                        className="absolute inset-0 w-full h-full"
                                        title="Lab Environment"
                                    />
                                </div>
                             </div>
                           )}
                        </div>

                        {/* Error Handling */}
                        {error && (
                            <div className="p-5 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-4 animate-shake">
                                <AlertCircle className="text-red-500 mt-1 flex-shrink-0" />
                                <div className="flex-1">
                                    <h4 className="text-red-500 font-bold mb-1">Observation Log: Error Detected</h4>
                                    <p className="text-sm text-red-400/80">{error}</p>
                                </div>
                                <button onClick={() => setError(null)} className="text-red-500/50 hover:text-red-500">
                                   <X size={18} />
                                </button>
                            </div>
                        )}

                        {/* Lab Tasks Curriculumn */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-4 px-2">
                                <span className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center">
                                   <BookOpen size={20} className="text-blue-500" />
                                </span>
                                Mission Critical Tasks
                            </h2>
                            
                            <div className="space-y-4">
                                {tasks.map((task) => (
                                    <LabTask 
                                        key={task.id} 
                                        task={task} 
                                        isCompleted={completedTasks.includes(task.id)}
                                        onSubmit={handleSubmitAnswer}
                                    />
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Metadata & Sidebar */}
                    <div className="lg:col-span-4 space-y-8">
                        
                        {/* Investigation Introduction */}
                        <div className="bg-[#1a2332] rounded-3xl border border-slate-700/50 p-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                                <Info size={100} className="text-white" />
                            </div>
                            <h3 className="text-[11px] font-black text-slate-500 tracking-[0.3em] uppercase mb-6">Briefing Overview</h3>
                            <div className="space-y-5">
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    In this mission, you're investigating a suspicious folder left behind by an unknown developer.
                                </p>
                                <div className="h-px bg-slate-800" />
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-white uppercase tracking-widest">Key Objectives:</h4>
                                    <ul className="space-y-3">
                                        {[
                                            "Understand hidden file discovery",
                                            "Read and analyze file metadata",
                                            "Perform advanced grep searches",
                                            "Extract flags from backup files"
                                        ].map((obj, i) => (
                                            <li key={i} className="flex items-start gap-3 text-[11px] text-slate-400 font-medium">
                                                <CheckCircle size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                                                <span>{obj}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* SOLVERS LEADERBOARD (Mock) */}
                        <div className="bg-[#1a2332] rounded-3xl border border-slate-700/50 overflow-hidden shadow-2xl">
                             <div className="p-7 pb-2 border-b border-white/5">
                                <h3 className="text-[11px] font-black text-slate-500 tracking-[0.3em] uppercase mb-6 flex items-center gap-2">
                                   <Trophy size={14} className="text-amber-500" />
                                   Top Responders
                                </h3>
                                <div className="space-y-6 mb-4">
                                    {[
                                        { name: "RootVector", time: "18m 42s", xp: 100 },
                                        { name: "CypherPunk", time: "22m 10s", xp: 100 },
                                        { name: "ShadowLeak", time: "25m 05s", xp: 100 }
                                    ].map((player, i) => (
                                        <div key={i} className="flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center font-black text-xs text-blue-400 group-hover:scale-105 transition-transform">
                                                    {i + 1}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white">{player.name}</p>
                                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{player.time}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-blue-400">+{player.xp}</p>
                                                <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">POINTS</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                             </div>
                             <button className="w-full py-5 bg-[#242f44] text-[10px] font-black text-slate-400 hover:text-blue-400 transition-all uppercase tracking-[0.2em]">
                                Full Lab Rankings
                             </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ─── Difficulty Component ─── */
const DifficultyBadge = memo(({ level }) => {
  const bars = { Beginner: 1, Intermediate: 2, Advanced: 3, Expert: 4 }[level] || 2;
  const color = { Beginner: "#88E636", Intermediate: "#F5A623", Advanced: "#E74C3C", Expert: "#E74C3C" }[level] || "#94A3B8";

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-end gap-[2px]">
        {[1, 2, 3, 4].map(i => (
          <div 
            key={i} 
            className="w-[2.5px] rounded-[1px] transition-all" 
            style={{ 
              height: `${5 + (i * 2.5)}px`, 
              background: i <= bars ? color : "rgba(255,255,255,0.1)" 
            }} 
          />
        ))}
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest" style={{ color }}>{level}</span>
    </div>
  );
});

export default LinuxForensicsLab;
