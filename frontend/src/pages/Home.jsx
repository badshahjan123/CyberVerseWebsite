import React, { memo, useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Shield, Zap, Trophy, Flame, Crown, Server, Globe, Cpu, 
  Award, Lock, Unlock, ArrowRight, Clock, Target, Users, 
  Play, Terminal, ChevronRight, Activity, Bell, CheckCircle, ExternalLink, AlertTriangle
} from "lucide-react"
import { useApp } from "../contexts/app-context"
import { useRealtime } from "../contexts/realtime-context"
import "./Home.css"

const C = {
  cyan: "#00D1FF",
  orange: "#FF6B00",
}

// ── Live Operational Terminal Script Sequence ──
const terminalSequences = [
  [
    { text: "sys_op@cyberverse:~# kubectl deploy malware-lab -n operations", delay: 600 },
    { text: "● Initializing pod deployment 'cyberverse-malware-sandbox'...", delay: 400 },
    { text: "✓ Pod created (ID: cyber-pod-f8413a)", delay: 300, color: "text-green-400 font-mono" },
    { text: "✓ Service exposed (Port: 7681 -> NodePort: 32230)", delay: 200, color: "text-green-400 font-mono" },
    { text: "✓ Sandbox container fully initialized.", delay: 300, color: "text-green-400 font-mono" },
    { text: "★ Interactive shell session ttyd created.", delay: 400, color: "text-cyan-400 font-bold" },
    { text: "● Ready for secure connection at http://localhost:32230", delay: 300, color: "text-cyan-400 font-bold" }
  ],
  [
    { text: "sys_op@cyberverse:~# nmap -sV -p 80,3306 10.10.1.42", delay: 800 },
    { text: "Starting Nmap 7.94 ( https://nmap.org ) at 2026-05-07", delay: 300 },
    { text: "Initiating Service Scan against 10.10.1.42...", delay: 400 },
    { text: "Scanning 2 ports [80, 3306]...", delay: 300 },
    { text: "PORT     STATE SERVICE VERSION", delay: 200, color: "text-slate-400 font-bold" },
    { text: "80/tcp   open  http    Apache httpd 2.4.41", delay: 300, color: "text-yellow-400" },
    { text: "3306/tcp open  mysql   MySQL 8.0.25 (Community Server)", delay: 300, color: "text-yellow-400" },
    { text: "✓ Service detection complete. Vulnerability vector ready.", delay: 400, color: "text-green-400" }
  ],
  [
    { text: "sys_op@cyberverse:~# hydra -l admin -P rockyou.txt 10.10.1.42 ssh", delay: 900 },
    { text: "Hydra v9.5 (c) 2026 by van Hauser/THC - for legal purposes only", delay: 300 },
    { text: "[DATA] attacking ssh://10.10.1.42:22/", delay: 400 },
    { text: "[ATTEMPT] admin / password - failed", delay: 200, color: "text-red-500/80" },
    { text: "[ATTEMPT] admin / 123456 - failed", delay: 150, color: "text-red-500/80" },
    { text: "[ATTEMPT] admin / welcome - failed", delay: 150, color: "text-red-500/80" },
    { text: "[SUCCESS] host: 10.10.1.42  login: admin  password: rockyou_winner", delay: 600, color: "text-green-400 font-black" },
    { text: "✓ Target compromised. Session spawned on channel [1].", delay: 400, color: "text-cyan-400 font-bold" }
  ]
];

// ── Live Realtime Telemetry Stream ──
const dummyActivities = [
  { user: "ghost_sec", action: "captured SQLi flag", target: "SQL Injection", xp: "+250 XP", color: "text-[#00d1ff]" },
  { user: "rootx", action: "deployed malware sandbox", target: "Malware Analysis", xp: "+50 XP", color: "text-[#ff6b00]" },
  { user: "kernel_panic", action: "completed Web Exploitation", target: "XSS Attack Chain", xp: "+500 XP", color: "text-green-400" },
  { user: "phantomX", action: "earned Offensive Security Certificate", target: "System Exploitation", xp: "+1000 XP", color: "text-yellow-400" },
  { user: "shadow_sec", action: "captured flag", target: "Privilege Escalation", xp: "+400 XP", color: "text-[#00d1ff]" },
];

const Home = memo(() => {
  const { isAuthenticated } = useApp()
  const { userStats } = useRealtime()

  // ── Stats Counting Animation ──
  const [counts, setCounts] = useState({ hackers: 0, labs: 0, flags: 0, rooms: 0, daily: 0, xp: 0 })
  useEffect(() => {
    const duration = 1200
    const steps = 30
    const stepTime = duration / steps
    let currentStep = 0

    const targets = { hackers: 1342, labs: 45, flags: 18945, rooms: 87, daily: 12, xp: 45900 }

    const timer = setInterval(() => {
      currentStep++
      setCounts({
        hackers: Math.floor((targets.hackers / steps) * currentStep),
        labs: Math.floor((targets.labs / steps) * currentStep),
        flags: Math.floor((targets.flags / steps) * currentStep),
        rooms: Math.floor((targets.rooms / steps) * currentStep),
        daily: Math.floor((targets.daily / steps) * currentStep),
        xp: Math.floor((targets.xp / steps) * currentStep),
      })

      if (currentStep >= steps) {
        setCounts(targets)
        clearInterval(timer)
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [])

  // ── Terminal Output Typer Logic ──
  const [terminalLines, setTerminalLines] = useState([])
  const [activeSequenceIndex, setActiveSequenceIndex] = useState(0)
  const [currentLineIndex, setCurrentLineIndex] = useState(0)

  useEffect(() => {
    const currentSequence = terminalSequences[activeSequenceIndex]
    if (currentLineIndex < currentSequence.length) {
      const line = currentSequence[currentLineIndex]
      const delay = line.delay || 500

      const timer = setTimeout(() => {
        setTerminalLines(prev => [...prev, line])
        setCurrentLineIndex(prev => prev + 1)
      }, delay)

      return () => clearTimeout(timer)
    } else {
      const rotateTimer = setTimeout(() => {
        setTerminalLines([])
        setCurrentLineIndex(0)
        setActiveSequenceIndex(prev => (prev + 1) % terminalSequences.length)
      }, 5000)

      return () => clearTimeout(rotateTimer)
    }
  }, [activeSequenceIndex, currentLineIndex])

  // ── Countdown Timer for Daily Challenge ──
  const [timeLeft, setTimeLeft] = useState("04:22:11")
  useEffect(() => {
    let seconds = 4 * 3600 + 22 * 60 + 11
    const interval = setInterval(() => {
      seconds--
      if (seconds <= 0) {
        seconds = 4 * 3600 + 22 * 60 + 11
      }
      const h = Math.floor(seconds / 3600).toString().padStart(2, '0')
      const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0')
      const s = (seconds % 60).toString().padStart(2, '0')
      setTimeLeft(`${h}:${m}:${s}`)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // ── WAF Alert Logs Simulator ──
  const wafLogPool = [
    "[ALERT] 10.10.14.2 - SQLi payload detected in HTTP URI",
    "[SYSTEM] Triggering Web Application Firewall filtering rule...",
    "[CRITICAL] Sandbox isolation container spawned.",
    "[SEC-OPS] Blocking source IP 10.10.14.2...",
    "[SYSTEM] Redirecting attack vector to honeypot telemetry...",
    "[INFO] Flag cryptographic container locked."
  ];
  const [wafLogs, setWafLogs] = useState([]);
  
  useEffect(() => {
    setWafLogs(wafLogPool.slice(0, 3));
    
    const interval = setInterval(() => {
      setWafLogs(prev => {
        const nextIndex = (wafLogPool.indexOf(prev[prev.length - 1]) + 1) % wafLogPool.length;
        return [...prev.slice(1), wafLogPool[nextIndex]];
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="cyber-grid-container text-white relative min-h-screen">
      
      {/* ── Background Grid, Fog and Orbs ── */}
      <div className="cyber-grid-bg" />
      <div className="radar-sweep-indicator" />
      <div className="light-streak" />
      <div className="glowing-orb w-[450px] h-[450px] bg-[#00d1ff]/8 top-[10%] left-[-10%]" />
      <div className="glowing-orb w-[550px] h-[550px] bg-[#ff6b00]/5 bottom-[20%] right-[-10%]" />

      {/* ══════════════════════════════════════════════
          HERO SECTION (CINEMATIC)
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 lg:px-[80px] pt-[70px] pb-[100px]">
        <div className="max-w-[1300px] mx-auto grid grid-cols-1 lg:grid-cols-[1.10fr_0.90fr] gap-12 lg:gap-16 items-center">
          
          {/* Hero Content Reveal */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, cubicBezier: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00d1ff]/8 border border-[#00d1ff]/25 text-[10px] font-mono text-[#00d1ff] tracking-widest w-fit shadow-lg shadow-[#00d1ff]/5">
              <span className="active-pulse" />
              <span>SEC_OPS PLATFORM ACTIVE</span>
            </div>

            <h1 className="leading-[1.05]">
              <span 
                className="block text-[42px] lg:text-[62px] font-black uppercase tracking-tight font-mono text-white"
                style={{ letterSpacing: "-0.01em" }}
              >
                GAMIFIED TECH LEARNING.
              </span>
              <span 
                className="block text-[38px] lg:text-[56px] font-black uppercase tracking-tight mt-1"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                <span>THE ULTIMATE </span>
                <span className="text-[#00D1FF] breathing-glow-text" style={{ textShadow: "0 0 15px rgba(0,209,255,0.4)" }}>
                  PLATFORM
                </span>
              </span>
            </h1>

            <p className="text-slate-300 text-sm lg:text-base leading-relaxed max-w-[530px]">
              Deploy isolated, containerized targets on-demand. Exploit real-world architectural flaws, audit live network telemetry, and extract cryptographic flags in real time.
            </p>

            <p className="text-slate-500 text-xs leading-relaxed max-w-[450px]">
              No simple questionnaires or slides. Get a live, isolated terminal directly in your browser. Hack real-world servers safely.
            </p>

            {/* CTAs with glowing sweeping light */}
            <div className="flex flex-wrap items-center gap-4 pt-3">
              <Link
                to={isAuthenticated ? "/labs" : "/signup"}
                className="flex items-center gap-2.5 px-8 py-4 rounded-xl text-xs font-black tracking-widest uppercase transition-all cyber-btn-primary"
              >
                <Terminal size={14} /> <span>Enter Labs</span>
              </Link>
              <Link
                to={isAuthenticated ? "/rooms" : "/signup"}
                className="flex items-center gap-2.5 px-8 py-4 rounded-xl text-xs font-black tracking-widest uppercase transition-all cyber-btn-secondary"
              >
                <Cpu size={14} /> <span>Explore Rooms</span>
              </Link>
            </div>
          </motion.div>

          {/* Cinematic Live Terminal Simulator */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15, cubicBezier: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="absolute inset-0 bg-[#00d1ff]/5 blur-[80px] rounded-full pointer-events-none" />
            <div className="cyber-panel corner-brackets overflow-hidden rounded-xl shadow-2xl terminal-flicker">
              
              {/* Terminal Title Bar */}
              <div className="flex items-center justify-between px-5 py-3.5 bg-[#090e1b] border-b border-white/[0.08]">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-lg shadow-[#FF5F57]/30" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-lg shadow-[#FFBD2E]/30" />
                  <div className="w-3 h-3 rounded-full bg-[#28C840] shadow-lg shadow-[#28C840]/30" />
                </div>
                <span className="text-[10px] font-black tracking-[0.2em] uppercase font-mono flex items-center gap-2 text-[#00D1FF]">
                  <Shield size={12} />
                  <span>CORE_SHELL_LOG</span>
                </span>
                <span className="text-[9px] font-black text-green-400 tracking-widest flex items-center gap-1 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping mr-1" /> RUNNING
                </span>
              </div>

              {/* Terminal Output */}
              <div className="p-6 font-mono text-[12px] leading-[1.8] min-h-[260px] bg-[#050811]/98 text-slate-300">
                <AnimatePresence>
                  {terminalLines.map((line, idx) => (
                    <motion.p
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={line.color || "text-slate-300"}
                    >
                      {line.text}
                    </motion.p>
                  ))}
                </AnimatePresence>
                <span className="inline-block w-2 h-4 bg-cyan-400 ml-1 animate-pulse" />
              </div>

              {/* Metrics strip */}
              <div className="flex gap-2 px-5 py-3.5 border-t border-white/[0.08] bg-[#070b16]">
                {[
                  { label: `Level ${userStats?.level || 1}`, icon: <Trophy size={12} className="text-yellow-400" /> },
                  { label: `${userStats?.streak || 0} Streak`, icon: <Flame size={12} className="text-orange-500" /> },
                  { label: `${(userStats?.totalXP || 0).toLocaleString()} XP`, icon: <Zap size={12} className="text-cyan-400" /> },
                ].map((b, i) => (
                  <div key={i} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest bg-white/[0.02] border border-white/[0.06]">
                    {b.icon}
                    <span>{b.label}</span>
                  </div>
                ))}
              </div>

            </div>
          </motion.div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════
          LIVE STATS SECTION (LIVE DOT + COUNTS)
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 lg:px-[80px] py-10 border-y border-white/[0.06] bg-[#050811]/90 backdrop-blur-md">
        <div className="max-w-[1300px] mx-auto grid grid-cols-2 md:grid-cols-6 gap-6">
          {[
            { label: "Active Hackers", value: counts.hackers.toLocaleString(), icon: <Users size={16} className="text-[#00d1ff]" />, liveDot: true },
            { label: "Labs Running", value: counts.labs.toString(), icon: <Server size={16} className="text-[#ff6b00]" />, liveDot: true },
            { label: "Total Flags", value: counts.flags.toLocaleString(), icon: <Target size={16} className="text-green-400" /> },
            { label: "Rooms Completed", value: counts.rooms.toString(), icon: <Award size={16} className="text-yellow-400" /> },
            { label: "Daily Challenges", value: counts.daily.toString(), icon: <Flame size={16} className="text-red-500" /> },
            { label: "XP Earned Today", value: counts.xp.toLocaleString(), icon: <Zap size={16} className="text-cyan-300" /> },
          ].map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/[0.04] bg-[#070b15] shadow-lg hover:border-cyan-400/20 transition-all animate-fade-in"
            >
              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] mb-2 animate-pulse">
                {c.icon}
              </div>
              <div className="text-[22px] font-black font-mono text-white mb-0.5">{c.value}</div>
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest text-center leading-tight flex items-center gap-1.5 justify-center">
                <span>{c.label}</span>
                {c.liveDot && (
                  <span className="flex h-1.5 w-1.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          LIVE TELEMETRY TICKER
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 py-5 border-b border-white/[0.06] overflow-hidden bg-black/30">
        <div className="max-w-[1300px] mx-auto px-6 lg:px-[80px] flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-[10px] font-black tracking-[0.25em] text-[#00d1ff] uppercase shrink-0 bg-[#00d1ff]/8 border border-[#00d1ff]/20 px-3 py-1 rounded-md">
            <Activity size={12} className="animate-pulse" />
            <span>OPERATIONAL STREAM</span>
          </div>
          <div className="overflow-hidden flex-1 relative h-6">
            <div className="activity-feed-track">
              {[...dummyActivities, ...dummyActivities].map((act, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.04] px-4 py-1 rounded-full text-xs shrink-0 font-mono">
                  <span className="text-green-400 font-black">{act.user}</span>
                  <span className="text-slate-400">{act.action}</span>
                  <span className="text-white font-bold">{act.target}</span>
                  <span className={`${act.color} font-black`}>{act.xp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          WHY CHOOSE CYBERVERSE
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 lg:px-[80px] py-[100px]">
        <div className="max-w-[1300px] mx-auto">
          
          <div className="text-center mb-16">
            <h2 className="text-[32px] lg:text-[42px] font-black tracking-tight font-mono uppercase" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              OPERATION: <span className="text-[#00D1FF] breathing-glow-text">TACTICAL PARADIGMS</span>
            </h2>
            <p className="text-slate-400 text-xs mt-2 max-w-[500px] mx-auto">
              Attack and defend realistic, production-grade target environments built on enterprise architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: <Server size={22} className="text-cyan-400" />, title: "Live Kubernetes Labs", desc: "Dedicated virtual containers spawned inside a specialized educational cluster on demand." },
              { icon: <Terminal size={22} className="text-[#ff6b00]" />, title: "Real Terminal Access", desc: "Interact via live browser consoles without SSH or configurations." },
              { icon: <Zap size={22} className="text-yellow-400" />, title: "Gamified Progression", desc: "Gain points, earn level-ups, and compete globally to claim badges." },
              { icon: <Target size={22} className="text-red-400" />, title: "Real-world Scenarios", desc: "Learn system auditing, privilege escalations, and API vulnerabilities." },
              { icon: <Award size={22} className="text-purple-400" />, title: "Verifiable Certificates", desc: "Dynamic landscape verification credentials signed on completing courses." },
              { icon: <Trophy size={22} className="text-emerald-400" />, title: "Social Leaderboards", desc: "Compete globally in friendly virtual cyber warfare operations." },
              { icon: <Shield size={22} className="text-blue-400" />, title: "Secure Sandbox Environments", desc: "Isolated defensive models containing zero risk to local devices." },
              { icon: <Cpu size={22} className="text-orange-400" />, title: "Remediation Insights", desc: "Acquire real theoretical defensive and remediation knowledge." },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="cyber-panel corner-brackets p-6 flex flex-col gap-4 rounded-xl hover:translate-y-[-4px]"
              >
                <div className="p-3 bg-white/[0.03] border border-white/[0.08] rounded-lg w-fit">
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-sm font-black text-white mb-1.5 font-mono">{f.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════
          INTERACTIVE CYBER ROADMAP
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 lg:px-[80px] py-[100px] border-t border-white/[0.06] bg-black/10">
        <div className="max-w-[1300px] mx-auto">
          
          <div className="mb-16">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#00d1ff] uppercase mb-1.5">
              <Activity size={12} />
              <span>Operational Pathway</span>
            </div>
            <h2 className="text-[28px] lg:text-[34px] font-black text-white font-mono uppercase" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              THE CYBER <span className="text-[#00D1FF]">VECTOR ROADMAP</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 relative">
            <div className="hidden md:block absolute top-[42px] left-[5%] right-[5%] h-[2.5px] bg-gradient-to-r from-cyan-500 via-orange-500 to-[#00d1ff]/20 z-0" />

            {[
              { node: "Beginner", sub: "Linux & CLI basics", xp: "0 XP REQUIRED", status: "unlocked" },
              { node: "Web Exploitation", sub: "SQLi, XSS, CSRF", xp: "1,500 XP REQUIRED", status: "unlocked" },
              { node: "Network Security", sub: "Scanning & Recon", xp: "5,000 XP REQUIRED", status: "current" },
              { node: "Reverse Engineering", sub: "Disassemblers & ASM", xp: "10,000 XP REQUIRED", status: "locked" },
              { node: "Malware Analysis", sub: "Trace Logs & Decryption", xp: "18,000 XP REQUIRED", status: "locked" },
              { node: "Red Team Ops", sub: "PrivEsc & Shell spawns", xp: "25,000 XP REQUIRED", status: "locked" },
            ].map((node, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -5 }}
                className={`relative z-10 flex flex-col gap-4 p-5 rounded-xl border bg-[#0a0f1d]/95 shadow-xl hover:border-cyan-400/40 transition-all ${node.status === 'current' ? "active-roadmap-pulse" : ""}`}
                style={{
                  borderColor: node.status === 'unlocked' ? 'rgba(0, 209, 255, 0.4)' : node.status === 'current' ? 'rgba(255, 107, 0, 0.5)' : 'rgba(255,255,255,0.08)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs"
                    style={{
                      background: node.status === 'unlocked' ? 'rgba(0,209,255,0.15)' : node.status === 'current' ? 'rgba(255,107,0,0.2)' : 'rgba(255,255,255,0.05)',
                      color: node.status === 'unlocked' ? '#00D1FF' : node.status === 'current' ? '#ff6b00' : '#4b5563',
                      border: `1px solid ${node.status === 'unlocked' ? '#00D1FF' : node.status === 'current' ? '#ff6b00' : 'rgba(255,255,255,0.1)'}`
                    }}
                  >
                    {node.status === 'unlocked' ? "✓" : i + 1}
                  </div>
                  {node.status === 'locked' ? (
                    <Lock size={12} className="text-slate-600" />
                  ) : (
                    <Unlock size={12} className={node.status === 'current' ? "text-[#ff6b00]" : "text-[#00D1FF]"} />
                  )}
                </div>

                <div>
                  <h4 className="text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1 font-mono">{node.xp}</h4>
                  <h3 className="text-sm font-black leading-tight text-white mb-1 font-mono">{node.node}</h3>
                  <p className="text-xs text-slate-400 leading-normal">{node.sub}</p>
                </div>

                <div className="mt-auto pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-[9px] font-bold text-slate-500 uppercase font-mono">{node.status}</span>
                  <ChevronRight size={12} className={node.status === 'locked' ? "text-slate-600" : "text-[#00D1FF]"} />
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FEATURED LABS SECTION (ELITE OPERATIONS)
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 lg:px-[80px] py-[100px] border-t border-white/[0.06]">
        <div className="max-w-[1300px] mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#00d1ff] uppercase mb-1.5">
                <Terminal size={12} />
                <span>Live Deployments</span>
              </div>
              <h2 className="text-[28px] lg:text-[34px] font-black text-white font-mono uppercase" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                FEATURED <span className="text-[#00D1FF]">SANDBOX LABS</span>
              </h2>
            </div>
            <Link to="/labs" className="flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-white transition-colors uppercase border border-white/[0.08] px-4 py-2 rounded-lg bg-white/[0.02]">
              <span>LAUNCH CONTROL</span> <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                title: "Linux Forensics Audit", 
                cat: "Forensics", 
                diff: "Easy", 
                diffColor: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10", 
                time: "45 mins", 
                active: "12 Actives", 
                xp: "+150 XP", 
                code: "sys_op@cyberverse:~# find /var/log -name \"*.log\" -exec grep \"failed\" {} \\;\n/var/log/auth.log: Failed password for root from 203.0.113.5\n/var/log/auth.log: Failed password for root from 203.0.113.5\n[ALERT] Brute-force footprint identified." 
              },
              { 
                title: "Stored SQLi Session Hijack", 
                cat: "Web Security", 
                diff: "Medium", 
                diffColor: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10", 
                time: "60 mins", 
                active: "28 Actives", 
                xp: "+250 XP", 
                code: "sqlmap -u \"http://target.local/vuln.php?id=1\" --dbms=mysql --dbs\n[INFO] testing connection to the target URL\n[INFO] checking if the target is protected by WAF/IPS\n[INFO] target is vulnerable to SQL injection\navailable databases [2]: cyberverse_vault" 
              },
              { 
                title: "Buffer Overflow Shellcode", 
                cat: "Exploitation", 
                diff: "Hard", 
                diffColor: "text-red-500 border-red-500/30 bg-red-500/10", 
                time: "90 mins", 
                active: "9 Actives", 
                xp: "+400 XP", 
                code: "gdb -q ./binary_overflow\n(gdb) run $(python3 -c \"print('A'*104 + '\\xef\\xbe\\xad\\xde')\")\nProgram received signal SIGSEGV, Segmentation fault.\n0xdeadbeef in ?? ()" 
              },
            ].map((lab, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -6 }}
                className="cyber-panel corner-brackets flex flex-col rounded-xl overflow-hidden group shadow-2xl"
              >
                <div className="h-28 bg-[#050810] border-b border-white/[0.08] p-4 font-mono text-[10px] text-slate-500 select-none overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050810] to-transparent pointer-events-none z-10" />
                  <pre className="text-cyan-400/60 leading-normal">{lab.code}</pre>
                </div>

                <div className="p-6 flex flex-col gap-4 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 font-mono">{lab.cat}</span>
                    <span className={`text-[8px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full border ${lab.diffColor}`}>
                      {lab.diff}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-white mb-1.5 font-mono group-hover:text-cyan-400 transition-colors">{lab.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-slate-500 font-mono">
                      <span className="flex items-center gap-1.5"><Clock size={12} /> {lab.time}</span>
                      <span className="flex items-center gap-1.5"><Users size={12} /> {lab.active}</span>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#00d1ff]">{lab.xp}</span>
                    <Link to={isAuthenticated ? "/labs" : "/signup"} className="px-5 py-2 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 transition-all cyber-btn-primary">
                      <span>Launch Sandbox</span> <Play size={10} fill="white" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════
          DAILY CHALLENGE SECTION (ALERT URGENCE + WAF LOGS)
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 lg:px-[80px] py-[100px] border-t border-white/[0.06] bg-black/10">
        <div className="max-w-[1300px] mx-auto flex justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-full max-w-[750px] cyber-panel corner-brackets p-8 md:p-10 rounded-2xl flex flex-col items-center text-center relative overflow-hidden border-orange-500/30 shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ff6b00]/10 border border-[#ff6b00]/25 text-[10px] font-mono text-[#ff6b00] mb-6 tracking-widest animate-pulse">
              <AlertTriangle size={12} />
              <span>ACTIVE INTRUSION ALERT</span>
            </div>

            <h3 className="text-2xl md:text-3xl font-black font-mono leading-tight text-white mb-3" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              OPERATION: <span className="text-orange-500">WAF INTRUSION DETECTED</span>
            </h3>
            
            <p className="text-xs md:text-sm text-slate-400 max-w-[500px] leading-relaxed mb-6">
              A regular expression firewall blocks traditional bypasses. Craft a custom hexadecimal encoding exploit vector to evade the regex sanitizer and read the admin payload.
            </p>

            {/* Dark Code Block WAF Terminal */}
            <div className="w-full max-w-[500px] mb-6 rounded-xl bg-slate-950 border border-white/[0.08] shadow-inner overflow-hidden font-mono text-[10px] text-left">
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] bg-slate-900/60">
                <span className="text-slate-400 font-bold uppercase tracking-wider">WAF ALARM LOGGER</span>
                <div className="flex gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                </div>
              </div>
              <div className="p-4 space-y-2 h-24 overflow-hidden leading-relaxed">
                {wafLogs.map((log, idx) => {
                  let colorClass = "text-slate-400";
                  if (log.includes("[ALERT]")) colorClass = "text-amber-500 font-bold";
                  if (log.includes("[CRITICAL]")) colorClass = "text-red-500 font-black animate-pulse";
                  if (log.includes("[SYSTEM]")) colorClass = "text-cyan-400";
                  if (log.includes("[SEC-OPS]")) colorClass = "text-purple-400";
                  
                  return (
                    <p key={idx} className={`${colorClass} truncate`}>
                      {log}
                    </p>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 md:gap-12 p-5 bg-white/[0.02] border border-white/[0.08] rounded-xl w-full max-w-[500px] mb-8 font-mono">
              <div className="flex flex-col items-center">
                <span className="text-lg md:text-xl font-black text-white tracking-widest tabular-nums">{timeLeft}</span>
                <span className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">Time Limit</span>
              </div>
              <div className="border-r border-white/[0.08]" />
              <div className="flex flex-col items-center">
                <span className="text-lg md:text-xl font-black text-green-400 tracking-wider">+300 XP</span>
                <span className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">XP Bounty</span>
              </div>
            </div>

            <Link 
              to={isAuthenticated ? "/rooms" : "/signup"}
              className="px-8 py-4 rounded-xl text-xs font-black tracking-widest uppercase transition-all cyber-btn-primary"
            >
              Start Interception
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          LIVE GLOBAL LEADERBOARD & ATTACK MAP
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 lg:px-[80px] py-[100px] border-t border-white/[0.06]">
        <div className="max-w-[1300px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Global Leaderboard */}
          <div className="flex flex-col gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#00d1ff] uppercase mb-1.5">
                <Trophy size={12} />
                <span>Rankings</span>
              </div>
              <h2 className="text-2xl font-black text-white font-mono uppercase" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                RANKED <span className="text-[#00D1FF]">PLATFORM OPERATORS</span>
              </h2>
            </div>

            <div className="cyber-panel corner-brackets rounded-xl p-6 bg-black/30 flex flex-col gap-3 shadow-xl">
              {[
                { rank: 1, name: "badshahjan", level: "Lv.42", xp: "45,900 XP", streak: "15 Days", active: true },
                { rank: 2, name: "Hacker_X7", level: "Lv.38", xp: "38,200 XP", streak: "8 Days", active: false },
                { rank: 3, name: "byte_ninja", level: "Lv.35", xp: "34,500 XP", streak: "12 Days", active: true },
                { rank: 4, name: "r00t_user", level: "Lv.31", xp: "29,400 XP", streak: "4 Days", active: false },
                { rank: 5, name: "ghost_sec", level: "Lv.29", xp: "25,100 XP", streak: "9 Days", active: true },
              ].map((hacker, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:border-cyan-400/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs font-black w-4 text-center" style={{ color: hacker.rank === 1 ? '#EAB308' : hacker.rank === 2 ? '#94A3B8' : hacker.rank === 3 ? '#CD7F32' : '#4B5563' }}>
                      {hacker.rank}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                        {hacker.name}
                        {hacker.rank === 1 && <Crown size={12} className="text-yellow-500 fill-yellow-500" />}
                      </span>
                      <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">{hacker.level}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 font-mono text-xs">
                    <span className="text-[#00D1FF] font-bold">{hacker.xp}</span>
                    <span className="text-orange-500 font-bold hidden md:inline-block">{hacker.streak}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${hacker.active ? "bg-green-400 shadow-[0_0_8px_#4ade80]" : "bg-slate-600"}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tactical Cyber Attack Map */}
          <div className="flex flex-col gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#00d1ff] uppercase mb-1.5">
                <Globe size={12} />
                <span>Active Telemetry</span>
              </div>
              <h2 className="text-2xl font-black text-white font-mono uppercase" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                GLOBAL <span className="text-orange-500">ATTACK VECTOR MAP</span>
              </h2>
            </div>

            <div className="cyber-panel corner-brackets rounded-xl p-4 bg-[#050811]/90 h-[330px] flex items-center justify-center overflow-hidden relative shadow-2xl">
              <svg viewBox="0 0 800 400" className="w-full h-full opacity-65">
                <g fill="rgba(0, 209, 255, 0.12)">
                  <circle cx="150" cy="120" r="1.5" /><circle cx="170" cy="140" r="1.5" /><circle cx="200" cy="110" r="1.5" />
                  <circle cx="240" cy="160" r="1.5" /><circle cx="280" cy="180" r="1.5" /><circle cx="320" cy="140" r="1.5" />
                  <circle cx="450" cy="100" r="1.5" /><circle cx="500" cy="120" r="1.5" /><circle cx="520" cy="160" r="1.5" />
                  <circle cx="580" cy="220" r="1.5" /><circle cx="620" cy="240" r="1.5" /><circle cx="680" cy="200" r="1.5" />
                </g>

                {/* Nodes */}
                <circle cx="200" cy="110" r="5" fill="#00D1FF" className="pulsing-node" />
                <circle cx="500" cy="120" r="5" fill="#ff6b00" className="pulsing-node" />
                <circle cx="410" cy="280" r="5" fill="#EF4444" className="pulsing-node" />

                {/* Vectors */}
                <path d="M 200 110 Q 350 50, 500 120" fill="none" stroke="#ff6b00" strokeWidth="2.5" className="attack-line" />
                <path d="M 500 120 Q 450 200, 410 280" fill="none" stroke="#EF4444" strokeWidth="2.5" className="attack-line" />
                <path d="M 410 280 Q 300 200, 200 110" fill="none" stroke="#00D1FF" strokeWidth="2.5" className="attack-line" />

                <text x="215" y="115" fill="#00D1FF" fontSize="8" fontFamily="monospace">NODE_US_PORT80</text>
                <text x="515" y="125" fill="#ff6b00" fontSize="8" fontFamily="monospace">NODE_EU_SSH</text>
                <text x="425" y="285" fill="#EF4444" fontSize="8" fontFamily="monospace">NODE_AS_MYSQL</text>
              </svg>

              <div className="absolute bottom-4 left-4 right-4 bg-black/80 border border-white/[0.08] p-3 rounded-lg flex items-center justify-between font-mono text-[9px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span>INTRUSION: US → EU (Brute Force SSH)</span>
                </div>
                <div className="text-slate-500">PACKET SIZE: 242 kb/s</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CERTIFICATES SHOWCASE (WITH HOLO SWEEP)
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 lg:px-[80px] py-[100px] border-t border-white/[0.06] bg-black/10">
        <div className="max-w-[1300px] mx-auto">
          
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#00d1ff] uppercase mb-1.5">
              <Award size={12} />
              <span>Academic Accreditations</span>
            </div>
            <h2 className="text-[28px] lg:text-[34px] font-black text-white font-mono uppercase" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              EARN RECOGNIZED <span className="text-[#00D1FF]">SECURITY CREDENTIALS</span>
            </h2>
            <p className="text-slate-400 text-xs mt-1">Successfully complete room tracks to unlock verified landscape PDF certificates.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {[
              { title: "Junior Web Application Penetration Tester", path: "Web Security Pathway", desc: "Demonstrated professional practical proficiency in executing and mitigating Cross-Site Scripting, SQL Injections, and broken access controls.", code: "VERIFY_ID: CV-WEB-87943" },
              { title: "Offensive Security Systems Engineer", path: "System Exploitation Pathway", desc: "Validated advanced engineering knowledge in binary auditing, Linux forensics, stack frame overflows, and operational shell hijacks.", code: "VERIFY_ID: CV-SYS-34220" },
            ].map((cert, i) => (
              <div key={i} className="holographic-scanner rounded-xl shadow-2xl">
                <div className="cyber-panel corner-brackets p-8 rounded-xl flex flex-col justify-between bg-[#0a1121]/95 min-h-[250px] border-[#00d1ff]/20">
                  <div>
                    <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-4 font-mono text-[10px]">
                      <span className="text-[#00d1ff] font-bold">CYBERVERSE CYBER RANGE OPERATIONAL</span>
                      <span className="text-slate-500">{cert.code}</span>
                    </div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">{cert.path}</span>
                    <h3 className="text-lg font-black font-mono text-white mt-1 mb-2 leading-tight">{cert.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{cert.desc}</p>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between">
                    <span className="text-[9px] font-bold text-slate-500 uppercase font-mono">Issued by: CyberVerse Team</span>
                    <Link to={isAuthenticated ? "/certificates" : "/signup"} className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 hover:underline">
                      <span>View Credentials</span> <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CYBER OPERATOR DEBRIEFINGS
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 lg:px-[80px] py-[100px] border-t border-white/[0.06]">
        <div className="max-w-[1300px] mx-auto">
          
          <div className="text-center mb-16">
            <h2 className="text-[28px] lg:text-[34px] font-black text-white font-mono uppercase" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              OPERATOR <span className="text-orange-500">DEBRIEFINGS</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { quote: "Deploying secure Kubernetes instances directly from my browser dashboard is highly productive. Doing actual forensics on live containers is an unmatched training experience.", author: "f0ren_sic_dev", role: "SOC Specialist" },
              { quote: "The SQL Injection rooms are outstandingly realistic. It feels like practicing actual offensive penetration testing rather than memorizing dry slides.", author: "m4l_hunter", role: "Offensive Analyst" },
              { quote: "Adding my verifiable cryptographic credentials and verification IDs on LinkedIn gave me the required edge to secure my cybersecurity internship.", author: "net_recon_99", role: "Junior Pentester" },
            ].map((t, i) => (
              <div key={i} className="cyber-panel corner-brackets p-6 rounded-xl bg-black/40 flex flex-col justify-between shadow-lg">
                <p className="text-xs text-slate-400 leading-relaxed italic mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/[0.02] border border-white/[0.08] overflow-hidden flex items-center justify-center font-mono text-cyan-400 font-black">
                    [O]
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-mono">{t.author}</h4>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

    </div>
  )
})

Home.displayName = "Home"
export default Home
