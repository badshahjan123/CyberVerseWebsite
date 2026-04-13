import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from "react";
import {
  Globe, Wifi, Server, Cpu, Database, ArrowRight, Radio, Folder, FileCode,
  Layers, Clock, Target, Router, Activity, Search, Code, Terminal,
  Unlock, CheckCircle, ShieldAlert, AlertTriangle, Sparkles,
  Lock, Download, Cookie, UserCheck, Repeat, Key, Map, SearchCode, Eye, Network, Package, FileJson, AlertCircle, Trophy, Hash, CircuitBoard, Binary, Box, Play, ShieldCheck
} from "lucide-react";

/* ... existing code ... */

// (I will add LinuxAnimation at the end of the file)

/* ─────────────────────────────────────────────
   ANIMATION BOX WRAPPER
   All animations render inside this fixed container.
   Nothing escapes. Nothing shifts layout.
───────────────────────────────────────────── */
export const AnimationBox = memo(({ title, children, height = 300 }) => {
  const [paused, setPaused] = useState(false);

  return (
    <div className="anim-box" style={{ "--anim-height": `${height}px` }}>
      {/* Header bar */}
      <div className="anim-box__header">
        <div className="anim-box__header-left">
          <span className="anim-box__dot anim-box__dot--red" />
          <span className="anim-box__dot anim-box__dot--yellow" />
          <span className="anim-box__dot anim-box__dot--green" />
          <span className="anim-box__title">
            <Radio size={11} className="anim-box__title-icon" />
            {title || "Visual Simulation"}
          </span>
        </div>
        <button
          className="anim-box__pause"
          onClick={() => setPaused(p => !p)}
          aria-label={paused ? "Resume animation" : "Pause animation"}
        >
          {paused ? (
            <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
              <path d="M0 0l10 6-10 6z" />
            </svg>
          ) : (
            <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
              <rect x="0" y="0" width="3.5" height="12" rx="1" />
              <rect x="6.5" y="0" width="3.5" height="12" rx="1" />
            </svg>
          )}
        </button>
      </div>

      {/* Contained animation stage */}
      <div className={`anim-box__stage${paused ? " anim-box__stage--paused" : ""}`}>
        {/* Subtle scanline overlay */}
        <div className="anim-box__scanline" aria-hidden="true" />
        {/* Corner accents */}
        <span className="anim-box__corner anim-box__corner--tl" aria-hidden="true" />
        <span className="anim-box__corner anim-box__corner--tr" aria-hidden="true" />
        <span className="anim-box__corner anim-box__corner--bl" aria-hidden="true" />
        <span className="anim-box__corner anim-box__corner--br" aria-hidden="true" />

        {paused ? (
          <div className="anim-box__paused-overlay">
            <svg width="28" height="28" viewBox="0 0 10 12" fill="rgba(255,255,255,0.3)">
              <rect x="0" y="0" width="3.5" height="12" rx="1" />
              <rect x="6.5" y="0" width="3.5" height="12" rx="1" />
            </svg>
            <span>Paused</span>
          </div>
        ) : (
          <div className="anim-box__inner">{children}</div>
        )}
      </div>
    </div>
  );
});
AnimationBox.displayName = "AnimationBox";

/* ─────────────────────────────────────────────
   REQUEST FLOW ANIMATION
───────────────────────────────────────────── */
export const RequestFlowAnimation = memo(() => {
  const [active, setActive] = useState(0);
  const steps = [
    { icon: <Globe size={18} />, label: "Client",   color: "#00F5FF" },
    { icon: <Wifi size={16} />,  label: "HTTP",     color: "#8B5CF6" },
    { icon: <Server size={18} />,label: "Server",   color: "#F59E0B" },
    { icon: <Cpu size={16} />,   label: "Logic",    color: "#EF4444" },
    { icon: <Database size={18} />, label: "DB",    color: "#39FF14" },
  ];

  useEffect(() => {
    const id = setInterval(() => setActive(p => (p + 1) % steps.length), 900);
    return () => clearInterval(id);
  }, []);

  return (
    <AnimationBox title="Request Flow">
      <div className="anim-flow">
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <div
              className={`anim-flow__node${active === i ? " anim-flow__node--on" : ""}`}
              style={{ "--nc": s.color }}
            >
              <div className="anim-flow__icon">{s.icon}</div>
              <span className="anim-flow__label">{s.label}</span>
              {active === i && <span className="anim-flow__ring" />}
            </div>
            {i < steps.length - 1 && (
              <div className={`anim-flow__arrow${active === i ? " anim-flow__arrow--on" : ""}`}>
                <ArrowRight size={14} />
                {active === i && <span className="anim-flow__packet" />}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </AnimationBox>
  );
});
RequestFlowAnimation.displayName = "RequestFlowAnimation";

/* ─────────────────────────────────────────────
   API FLOW ANIMATION
───────────────────────────────────────────── */
export const ApiFlowAnimation = memo(() => {
  const [active, setActive] = useState(0);
  const steps = [
    { label: "Client",   icon: <Globe size={16} />,    color: "#00F5FF" },
    { label: "Request",  icon: <ArrowRight size={14} />, color: "#8B5CF6", isArrow: true },
    { label: "Server",   icon: <Server size={16} />,   color: "#8B5CF6" },
    { label: "Database", icon: <Database size={16} />, color: "#39FF14" },
    { label: "Response", icon: <ArrowRight size={14} />, color: "#F59E0B", isArrow: true },
    { label: "UI Ready", icon: <Sparkles size={16} />, color: "#F59E0B" },
  ];

  useEffect(() => {
    const id = setInterval(() => setActive(p => (p + 1) % steps.length), 1400);
    return () => clearInterval(id);
  }, []);

  return (
    <AnimationBox title="API Request Lifecycle">
      <div className="anim-flow">
        {steps.map((s, i) =>
          s.isArrow ? (
            <div key={i} className={`anim-flow__arrow${active === i ? " anim-flow__arrow--on" : ""}`} style={{ "--nc": s.color }}>
              {s.icon}
              {active === i && <span className="anim-flow__packet" style={{ background: s.color, boxShadow: `0 0 8px ${s.color}` }} />}
            </div>
          ) : (
            <div key={i} className={`anim-flow__node${active === i ? " anim-flow__node--on" : ""}`} style={{ "--nc": s.color }}>
              <div className="anim-flow__icon">{s.icon}</div>
              <span className="anim-flow__label">{s.label}</span>
              {active === i && <span className="anim-flow__ring" />}
            </div>
          )
        )}
      </div>
    </AnimationBox>
  );
});
ApiFlowAnimation.displayName = "ApiFlowAnimation";

/* ─────────────────────────────────────────────
   SCANNING ANIMATION
───────────────────────────────────────────── */
export const ScanningAnimation = memo(() => {
  const [items, setItems] = useState([]);
  const idxRef = useRef(0);
  const discoveries = [
    { type: "PORT", text: "80/tcp (HTTP) — OPEN",          color: "#39FF14" },
    { type: "PORT", text: "443/tcp (HTTPS) — OPEN",        color: "#39FF14" },
    { type: "VULN", text: "Apache 2.4.41 — OUTDATED",      color: "#F59E0B" },
    { type: "FILE", text: "/admin — 301 Redirect",         color: "#8B5CF6" },
    { type: "FILE", text: "/robots.txt — 200 OK",          color: "#8B5CF6" },
    { type: "VULN", text: "Directory Listing Enabled",     color: "#EF4444" },
    { type: "FILE", text: "/.env — 200 OK (SENSITIVE!)",   color: "#EF4444" },
    { type: "SUB",  text: "admin.target.com — ACTIVE",     color: "#EF4444" },
  ];

  useEffect(() => {
    const id = setInterval(() => {
      if (idxRef.current < discoveries.length) {
        const i = idxRef.current++;
        setItems(p => [...p, discoveries[i]]);
      } else {
        setItems([]);
        idxRef.current = 0;
      }
    }, 650);
    return () => clearInterval(id);
  }, []);

  return (
    <AnimationBox title="Live Scan Results" height={320}>
      <div className="anim-scan">
        <div className="anim-scan__header">
          <Activity size={12} className="anim-scan__pulse" />
          <span>SCANNING TARGET</span>
          <span className="anim-scan__count">{items.length} found</span>
        </div>
        <div className="anim-scan__list">
          {items.map((item, i) => (
            <div key={i} className="anim-scan__row" style={{ "--ic": item.color }}>
              <span className="anim-scan__type">{item.type}</span>
              <span className="anim-scan__text">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </AnimationBox>
  );
});
ScanningAnimation.displayName = "ScanningAnimation";

/* ─────────────────────────────────────────────
   EXPLOIT ANIMATION
───────────────────────────────────────────── */
export const ExploitAnimation = memo(() => {
  const [step, setStep] = useState(0);
  const phases = [
    { label: "Identifying target...", icon: <Search size={14} />,      color: "#00F5FF" },
    { label: "Injecting payload...",  icon: <Code size={14} />,        color: "#F59E0B" },
    { label: "Bypassing auth...",     icon: <Unlock size={14} />,      color: "#EF4444" },
    { label: "ACCESS GRANTED ✓",     icon: <CheckCircle size={14} />, color: "#39FF14" },
  ];

  useEffect(() => {
    const id = setInterval(() => setStep(p => (p + 1) % phases.length), 1300);
    return () => clearInterval(id);
  }, []);

  return (
    <AnimationBox title="Attack Simulation">
      <div className="anim-exploit">
        {phases.map((p, i) => (
          <div
            key={i}
            className={`anim-exploit__step${step >= i ? " anim-exploit__step--done" : ""}${step === i ? " anim-exploit__step--active" : ""}`}
            style={{ "--sc": p.color }}
          >
            <span className="anim-exploit__icon">{p.icon}</span>
            <span className="anim-exploit__label">{p.label}</span>
            {step === i && <span className="anim-exploit__scanner" />}
          </div>
        ))}
      </div>
    </AnimationBox>
  );
});
ExploitAnimation.displayName = "ExploitAnimation";

/* ─────────────────────────────────────────────
   DEFENSE / WAF ANIMATION
───────────────────────────────────────────── */
export const DefenseAnimation = memo(() => {
  const [log, setLog] = useState([]);
  const types = ["XSS", "SQLi", "CSRF", "RCE", "LFI"];

  useEffect(() => {
    const id = setInterval(() => {
      const blocked = Math.random() > 0.25;
      const type = types[Math.floor(Math.random() * types.length)];
      setLog(p => [...p.slice(-6), { id: Date.now(), blocked, type }]);
    }, 950);
    return () => clearInterval(id);
  }, []);

  return (
    <AnimationBox title="WAF Defense Monitor" height={320}>
      <div className="anim-defense">
        <div className="anim-defense__shield">
          <ShieldCheck size={26} />
          <span>WAF ACTIVE</span>
        </div>
        <div className="anim-defense__log">
          {log.map(a => (
            <div key={a.id} className={`anim-defense__entry${a.blocked ? " anim-defense__entry--blocked" : " anim-defense__entry--warn"}`}>
              {a.blocked ? <ShieldAlert size={11} /> : <AlertTriangle size={11} />}
              <span className="anim-defense__type">{a.type}</span>
              <span className="anim-defense__status">{a.blocked ? "BLOCKED" : "WARNING"}</span>
            </div>
          ))}
        </div>
      </div>
    </AnimationBox>
  );
});
DefenseAnimation.displayName = "DefenseAnimation";

/* ─────────────────────────────────────────────
   OSI MODEL ANIMATION
───────────────────────────────────────────── */
export const OsiModelAnimation = memo(() => {
  const [active, setActive] = useState(6);
  const layers = [
    { name: "L7: Application",  icon: <Globe size={13} />,    color: "#EF4444" },
    { name: "L6: Presentation", icon: <Sparkles size={13} />, color: "#F97316" },
    { name: "L5: Session",      icon: <Clock size={13} />,    color: "#FACC15" },
    { name: "L4: Transport",    icon: <Activity size={13} />, color: "#39FF14" },
    { name: "L3: Network",      icon: <Target size={13} />,   color: "#00F5FF" },
    { name: "L2: Data Link",    icon: <Layers size={13} />,   color: "#8B5CF6" },
    { name: "L1: Physical",     icon: <Wifi size={13} />,     color: "#EC4899" },
  ];

  useEffect(() => {
    const id = setInterval(() => setActive(p => (p === 0 ? 6 : p - 1)), 1100);
    return () => clearInterval(id);
  }, []);

  return (
    <AnimationBox title="OSI Model — Data Flow" height={340}>
      <div className="anim-osi">
        {layers.map((l, i) => (
          <div
            key={i}
            className={`anim-osi__layer${active === i ? " anim-osi__layer--active" : ""}`}
            style={{ "--lc": l.color }}
          >
            <span className="anim-osi__icon">{l.icon}</span>
            <span className="anim-osi__name">{l.name}</span>
            {active === i && <span className="anim-osi__scanner" />}
          </div>
        ))}
      </div>
    </AnimationBox>
  );
});
OsiModelAnimation.displayName = "OsiModelAnimation";

/* ─────────────────────────────────────────────
   ROUTING / PACKET ANIMATION
───────────────────────────────────────────── */
export const RoutingAnimation = memo(() => {
  const [active, setActive] = useState(0);
  const nodes = [
    { label: "My PC",         icon: <Cpu size={16} />,    color: "#00F5FF" },
    { label: "Switch",        icon: <Layers size={16} />, color: "#8B5CF6" },
    { label: "Router",        icon: <Router size={16} />, color: "#39FF14" },
    { label: "Internet",      icon: <Globe size={16} />,  color: "#F97316" },
    { label: "Remote Server", icon: <Server size={16} />, color: "#EF4444" },
  ];

  useEffect(() => {
    const id = setInterval(() => setActive(p => (p + 1) % nodes.length), 1400);
    return () => clearInterval(id);
  }, []);

  return (
    <AnimationBox title="Packet Routing">
      <div className="anim-flow">
        {nodes.map((n, i) => (
          <React.Fragment key={i}>
            <div
              className={`anim-flow__node${active === i ? " anim-flow__node--on" : ""}`}
              style={{ "--nc": n.color }}
            >
              <div className="anim-flow__icon">{n.icon}</div>
              <span className="anim-flow__label">{n.label}</span>
              {active === i && <span className="anim-flow__ring" />}
            </div>
            {i < nodes.length - 1 && (
              <div className={`anim-flow__arrow${active === i ? " anim-flow__arrow--on" : ""}`}>
                <ArrowRight size={13} />
                {active === i && <span className="anim-flow__packet" />}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </AnimationBox>
  );
});
RoutingAnimation.displayName = "RoutingAnimation";

/* ── LINUX FUNDAMENTALS ANIMATION ── */
export const LinuxAnimation = memo(({ taskId }) => {
  const [step, setStep] = useState(0);
  
  const scenarios = useMemo(() => {
    switch (taskId) {
      case 1: // Navigation
        return [
          { query: "$ pwd", status: "Locating", color: "#00F5FF", icon: <Target size={14} /> },
          { query: "/home/cyberverse", status: "Path Resolved", color: "#39FF14", icon: <CheckCircle size={14} /> },
          { query: "$ ls -F", status: "Listing", color: "#F59E0B", icon: <Search size={14} /> },
        ];
      case 2: // File Ops
        return [
          { query: "$ mkdir evidence", status: "Creating Dir", color: "#3B82F6", icon: <Folder size={14} /> },
          { query: "$ touch report.txt", status: "Creating File", color: "#00F5FF", icon: <FileCode size={14} /> },
          { query: "$ cp report.txt backup/", status: "Copying", color: "#F59E0B", icon: <ArrowRight size={14} /> },
        ];
      case 3: // Permissions
        return [
          { query: "-rwx------ root root", status: "Checking Access", color: "#EF4444", icon: <Lock size={14} /> },
          { query: "$ chmod 755 script.sh", status: "Changing Mode", color: "#F59E0B", icon: <Unlock size={14} /> },
          { query: "-rwxr-xr-x user group", status: "Permissions Updated", color: "#39FF14", icon: <CheckCircle size={14} /> },
        ];
      case 4: // Search & Pipes
        return [
          { query: "$ grep -r 'API_KEY' .", status: "Pattern Search", color: "#F59E0B", icon: <Search size={14} /> },
          { query: "$ find /etc -name '*.conf'", status: "File Discovery", color: "#00F5FF", icon: <Target size={14} /> },
          { query: "MATCH: config.conf: L42", status: "Secret Found", color: "#39FF14", icon: <CheckCircle size={14} /> },
        ];
      case 5: // Processes
        return [
          { query: "$ ps aux | grep 'malware'", status: "Hunting SID", color: "#EF4444", icon: <Target size={14} /> },
          { query: "$ kill -9 1337", status: "Terminating", color: "#F59E0B", icon: <Activity size={14} /> },
          { query: "STATUS: KILLED (PID 1337)", status: "Process Terminated", color: "#39FF14", icon: <ShieldCheck size={14} /> },
        ];
      default:
        return [
          { query: "$ boot --system", status: "Initializing", color: "#64748B", icon: <Terminal size={14} /> }
        ];
    }
  }, [taskId]);

  useEffect(() => {
    setStep(0);
    const interval = setInterval(() => {
      setStep(s => (s + 1) % scenarios.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [scenarios]);

  const current = scenarios[step] || scenarios[0] || { status: "Initializing", color: "#fff" };

  return (
    <AnimationBox title={`Terminal Session — ${current.status}`}>
      <div className="anim-exploit">
        <div className="anim-scan__header" style={{ marginBottom: "15px" }}>
          <Activity size={12} className="anim-scan__pulse" />
          <span>BASH_SHELL — KERNEL: 5.15.0-generic</span>
        </div>
        <div className="anim-sqli-display">
          {scenarios.map((s, i) => (
            <div
              key={i}
              className={`anim-exploit__step${step >= i ? " anim-exploit__step--done" : ""}${step === i ? " anim-exploit__step--active" : ""}`}
              style={{ 
                "--sc": s.color, 
                opacity: step === i ? 1 : step > i ? 0.6 : 0.2,
                transform: step === i ? "scale(1.02)" : "scale(1)",
                transition: "all 0.4s ease"
              }}
            >
              <span className="anim-exploit__icon">{s.icon}</span>
              <span className="anim-exploit__label" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85em" }}>{s.query}</span>
              {step === i && <span className="anim-exploit__scanner" />}
            </div>
          ))}
        </div>
      </div>
    </AnimationBox>
  );
});
LinuxAnimation.displayName = "LinuxAnimation";

/* ─────────────────────────────────────────────
   JSON PARSER ANIMATION
───────────────────────────────────────────── */
export const JsonParserAnimation = memo(() => {
  const [line, setLine] = useState(0);
  const lines = [
    { prefix: "FETCH",   text: " /api/user/101...",              color: "#00F5FF" },
    { prefix: "HEADER",  text: " Content-Type: application/json", color: "#8B5CF6" },
    { prefix: "PARSE",   text: " Reading raw bytes...",          color: "#F59E0B" },
    { prefix: "KEY",     text: " 'username' → 'admin'",         color: "#39FF14" },
    { prefix: "KEY",     text: " 'role' → 'superuser'",         color: "#39FF14" },
    { prefix: "ARRAY",   text: " 'permissions' (4 items)",       color: "#F59E0B" },
    { prefix: "VALID",   text: " Syntax check passed",           color: "#00F5FF" },
    { prefix: "SUCCESS", text: " Status 200 OK",                 color: "#39FF14" },
  ];

  useEffect(() => {
    const id = setInterval(() => setLine(p => (p + 1) % lines.length), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <AnimationBox title="JSON Parser">
      <div className="anim-scan">
        <div className="anim-scan__header">
          <Cpu size={12} className="anim-scan__pulse" />
          <span>JSON_PARSER v1.0</span>
        </div>
        <div className="anim-scan__list">
          {lines.slice(0, line + 1).map((l, i) => (
            <div key={i} className="anim-scan__row" style={{ "--ic": l.color }}>
              <span className="anim-scan__type">{l.prefix}</span>
              <span className="anim-scan__text">{l.text}</span>
            </div>
          ))}
        </div>
      </div>
    </AnimationBox>
  );
});
JsonParserAnimation.displayName = "JsonParserAnimation";

/* ─────────────────────────────────────────────
   SQL INJECTION ANIMATION
───────────────────────────────────────────── */
export const SqliAnimation = memo(({ taskId }) => {
  const [step, setStep] = useState(0);
  
  const scenarios = useMemo(() => {
    switch (taskId) {
      case 1: // What is SQLi?
        return [
          { query: "SELECT * FROM users WHERE name='Alice'", status: "Normal Operation", color: "#00F5FF", icon: <Database size={14} /> },
          { query: "SELECT * FROM users WHERE name='Alice''", status: "Syntax Error Probing", color: "#F59E0B", icon: <Search size={14} /> },
          { query: "ERROR: Unclosed quotation mark...", status: "Vulnerability Confirmed", color: "#EF4444", icon: <AlertTriangle size={14} /> },
        ];
      case 2: // Login Bypass
        return [
          { query: "SELECT * FROM users WHERE pass='1234'", status: "Checking Password", color: "#00F5FF", icon: <Database size={14} /> },
          { query: "SELECT * FROM users WHERE pass='' OR 1=1 --'", status: "Injecting Tautology", color: "#F59E0B", icon: <Unlock size={14} /> },
          { query: "STATUS: LOGGED_IN AS ADMIN", status: "Authentication Bypassed", color: "#39FF14", icon: <CheckCircle size={14} /> },
        ];
      case 3: // UNION Extraction
        return [
          { query: "SELECT name FROM products WHERE id=1", status: "Product Query", color: "#00F5FF", icon: <Database size={14} /> },
          { query: "UNION SELECT user, pass FROM users", status: "Database Dumping", color: "#F59E0B", icon: <Download size={14} /> },
          { query: "DUMP: admin | $2y$10$...", status: "Data Exfiltrated", color: "#EF4444", icon: <CheckCircle size={14} /> },
        ];
      case 4: // Prevention
        return [
          { query: "query = 'SELECT * FROM users WHERE id=' + input", status: "VULNERABLE PATTERN", color: "#EF4444", icon: <AlertTriangle size={14} /> },
          { query: "db.prepare('SELECT * FROM users WHERE id=?')", status: "SECURE PARAMETERS", color: "#39FF14", icon: <ShieldCheck size={14} /> },
          { query: "Result: Malicious code ignored", status: "Attack Deflected", color: "#00F5FF", icon: <CheckCircle size={14} /> },
        ];
      default:
        return [
          { query: "INITIALIZING DATABASE...", status: "Loading", color: "#64748B", icon: <Activity size={14} /> }
        ];
    }
  }, [taskId]);

  useEffect(() => {
    setStep(0);
  }, [taskId]);

  useEffect(() => {
    const id = setInterval(() => setStep(p => (p + 1) % scenarios.length), 2000);
    return () => clearInterval(id);
  }, [scenarios]);

  const current = scenarios[step] || scenarios[0] || { status: "Initializing", color: "#fff" };

  return (
    <AnimationBox title={`SQLi Simulation — ${current.status}`}>
      <div className="anim-exploit">
        <div className="anim-scan__header" style={{ marginBottom: "15px" }}>
          <Activity size={12} className="anim-scan__pulse" />
          <span>QUERY_SIMULATOR — TASK_{taskId}</span>
        </div>
        <div className="anim-sqli-display">
          {scenarios.map((s, i) => (
            <div
              key={i}
              className={`anim-exploit__step${step >= i ? " anim-exploit__step--done" : ""}${step === i ? " anim-exploit__step--active" : ""}`}
              style={{ 
                "--sc": s.color, 
                opacity: step === i ? 1 : step > i ? 0.6 : 0.2,
                transform: step === i ? "scale(1.02)" : "scale(1)",
                transition: "all 0.4s ease"
              }}
            >
              <span className="anim-exploit__icon">{s.icon}</span>
              <span className="anim-exploit__label" style={{ fontFamily: "monospace", fontSize: "0.8em" }}>{s.query}</span>
              {step === i && <span className="anim-exploit__scanner" />}
            </div>
          ))}
        </div>
      </div>
    </AnimationBox>
  );
});
SqliAnimation.displayName = "SqliAnimation";

/* ── AUTHENTICATION & SESSION ANIMATION ── */
export const AuthAnimation = memo(({ taskId }) => {
  const [step, setStep] = useState(0);
  
  const scenarios = useMemo(() => {
    switch (taskId) {
      case 1: // Broken Auth
        return [
          { query: "LOGIN: admin / password123", status: "Access Denied", color: "#EF4444", icon: <Lock size={14} /> },
          { query: "RUNNING: credential_stuffing.py", status: "PW Spraying...", color: "#F59E0B", icon: <Radio size={14} /> },
          { query: "SUCCESS: admin / winter2024!", status: "Access Granted", color: "#39FF14", icon: <CheckCircle size={14} /> },
        ];
      case 2: // Session Hijacking
        return [
          { query: "Set-Cookie: SID=abc123456", status: "Secure Session", color: "#00F5FF", icon: <Cookie size={14} /> },
          { query: "INTERCEPT: Cookie: SID=abc123456", status: "Packet Sniffed", color: "#EF4444", icon: <Radio size={14} /> },
          { query: "BROWSER: GET /dashboard", status: "Impersonating Admin", color: "#39FF14", icon: <UserCheck size={14} /> },
        ];
      case 3: // JWT
        return [
          { query: "JWT: eyJhbGciOiJIUzI1NiIs...", status: "Valid Token", color: "#8B5CF6", icon: <Key size={14} /> },
          { query: "SET: alg = none", status: "Tampering Signature", color: "#F59E0B", icon: <Code size={14} /> },
          { query: "SET: role = admin", status: "Privilege Escalated", color: "#EF4444", icon: <ShieldCheck size={14} /> },
        ];
      case 4: // OAuth
        return [
          { query: "/auth?redirect_uri=trusted.com", status: "Initiating OAuth", color: "#00F5FF", icon: <Repeat size={14} /> },
          { query: "/auth?redirect_uri=attacker.com", status: "Vulnerable Redirect", color: "#EF4444", icon: <AlertTriangle size={14} /> },
          { query: "Location: attacker.com?code=...", status: "Token Leaked", color: "#F59E0B", icon: <Search size={14} /> },
        ];
      case 5: // MFA
        return [
          { query: "MFA: Approve login request?", status: "Pending Push", color: "#00F5FF", icon: <Radio size={14} /> },
          { query: "MFA: [Spamming Notifications]", status: "Push Fatigue Attack", color: "#EF4444", icon: <Activity size={14} /> },
          { query: "MFA: Access Approved ✓", status: "User Bypassed", color: "#39FF14", icon: <CheckCircle size={14} /> },
        ];
      default:
        return [{ query: "INIT_AUTH_SYSTEM...", status: "Ready", color: "#64748B", icon: <Lock size={14} /> }];
    }
  }, [taskId]);

  useEffect(() => {
    setStep(0);
    const interval = setInterval(() => {
      setStep(s => (s + 1) % scenarios.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [scenarios]);

  return (
    <AnimationBox title={`Auth Simulation — ${scenarios[step]?.status || "Active"}`}>
      <div className="anim-exploit">
        <div className="anim-scan__header" style={{ marginBottom: "15px" }}>
          <Activity size={12} className="anim-scan__pulse" />
          <span>CYBERVERSE_AUTH_V8.0 — ENCRYPTED</span>
        </div>
        <div className="anim-sqli-display">
          {scenarios.map((s, i) => (
            <div
              key={i}
              className={`anim-exploit__step${step >= i ? " anim-exploit__step--done" : ""}${step === i ? " anim-exploit__step--active" : ""}`}
              style={{ 
                "--sc": s.color, 
                opacity: step === i ? 1 : step > i ? 0.6 : 0.2,
                transform: step === i ? "scale(1.05)" : "scale(1)",
                transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
            >
              <span className="anim-exploit__icon">{s.icon}</span>
              <span className="anim-exploit__label" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85em" }}>{s.query}</span>
              {step === i && <span className="anim-exploit__scanner" />}
            </div>
          ))}
        </div>
      </div>
    </AnimationBox>
  );
});
AuthAnimation.displayName = "AuthAnimation";

/* ── OSINT INVESTIGATION ANIMATION ── */
export const OsintAnimation = memo(({ taskId }) => {
  const [step, setStep] = useState(0);
  
  const scenarios = useMemo(() => {
    switch (taskId) {
      case 1: // Mindset/Global
        return [
          { query: "SCANNING: satellite_feeds_v2", status: "Accessing OSINT Hub", color: "#00F5FF", icon: <Globe size={14} /> },
          { query: "FILTERING: public_data_nodes", status: "Mapping Connections", color: "#8B5CF6", icon: <Map size={14} /> },
          { query: "SUCCESS: 1.2M relevant nodes", status: "Intelligence Loaded", color: "#39FF14", icon: <CheckCircle size={14} /> },
        ];
      case 2: // Google Dorking
        return [
          { query: "SEARCH: site:*.gov filetype:xls", status: "Dorking Targets...", color: "#F59E0B", icon: <SearchCode size={14} /> },
          { query: "EXTRACTING: metadata_v4", status: "Leaked Files Found", color: "#EF4444", icon: <Download size={14} /> },
          { query: "RESULT: 15 confidential docs", status: "Secrets Exposed", color: "#39FF14", icon: <Terminal size={14} /> },
        ];
      case 3: // SOCMINT
        return [
          { query: "SHERLOCK: @target_handle", status: "Tracking Footprint", color: "#8B5CF6", icon: <UserCheck size={14} /> },
          { query: "CORRELATING: IG vs LinkedIn", status: "Linking Identity", color: "#00F5FF", icon: <Network size={14} /> },
          { query: "SUCCESS: Personal PII found", status: "Profile Mapped", color: "#39FF14", icon: <CheckCircle size={14} /> },
        ];
      case 4: // Infra
        return [
          { query: "QUERY: WHOIS megacorp.com", status: "Tracing Ownership", color: "#00F2FF", icon: <Search size={14} /> },
          { query: "ENUM: cert_sh subdomains", status: "Hidden Infra Reveal", color: "#EF4444", icon: <Eye size={14} /> },
          { query: "FOUND: staging.megacorp.int", status: "Ghost Server ID'd", color: "#39FF14", icon: <Server size={14} /> },
        ];
      case 5: // Tools
        return [
          { query: "RUNNING: theHarvester -b all", status: "Automating Recon", color: "#F59E0B", icon: <Code size={14} /> },
          { query: "MALTEGO: Mapping Transforms", status: "Graphing Entities", color: "#8B5CF6", icon: <Network size={14} /> },
          { query: "COMPLETE: Recon Report v1.0", status: "Operation Ready", color: "#39FF14", icon: <ShieldCheck size={14} /> },
        ];
      default:
        return [{ query: "INIT_OSINT_MODULE...", status: "Awaiting Input", color: "#64748B", icon: <Search size={14} /> }];
    }
  }, [taskId]);

  useEffect(() => {
    setStep(0);
    const interval = setInterval(() => {
      setStep(s => (s + 1) % scenarios.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [scenarios]);

  return (
    <AnimationBox title={`OSINT Simulation — ${scenarios[step]?.status || "Active"}`}>
      <div className="anim-exploit">
        <div className="anim-scan__header" style={{ marginBottom: "15px" }}>
          <Activity size={12} className="anim-scan__pulse" />
          <span>CYBERVERSE_OSINT_v2.1 — MONITORING</span>
        </div>
        <div className="anim-sqli-display">
          {scenarios.map((s, i) => (
            <div
              key={i}
              className={`anim-exploit__step${step >= i ? " anim-exploit__step--done" : ""}${step === i ? " anim-exploit__step--active" : ""}`}
              style={{ 
                "--sc": s.color, 
                opacity: step === i ? 1 : step > i ? 0.6 : 0.2,
                transform: step === i ? "scale(1.05)" : "scale(1)",
                transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
            >
              <span className="anim-exploit__icon">{s.icon}</span>
              <span className="anim-exploit__label" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85em" }}>{s.query}</span>
              {step === i && <span className="anim-exploit__scanner" />}
            </div>
          ))}
        </div>
      </div>
    </AnimationBox>
  );
});
OsintAnimation.displayName = "OsintAnimation";

/* ── PICKLE EXPLOITATION ANIMATION ── */
export const PickleAnimation = memo(({ taskId }) => {
  const [step, setStep] = useState(0);
  
  const scenarios = useMemo(() => {
    switch (taskId) {
      case 1: // Serialization
        return [
          { query: "OBJ: UserProfile(role='admin')", status: "Preparing Object", color: "#39FF14", icon: <Package size={14} /> },
          { query: "PICKLE: pickle.dumps(user)", status: "Stack VM Active", color: "#00F5FF", icon: <Radio size={14} /> },
          { query: "RESULT: b'\\x80\\x04\\x95\\x12...'", status: "Binary Stream Generated", color: "#39FF14", icon: <FileCode size={14} /> },
        ];
      case 2: // Danger
        return [
          { query: "INPUT: cookie_session_v1", status: "Receiving Byte Stream", color: "#F59E0B", icon: <Download size={14} /> },
          { query: "SINK: pickle.loads(input)", status: "Deserialization Active", color: "#EF4444", icon: <AlertCircle size={14} /> },
          { query: "WARNING: Unsafe instruction", status: "Untrusted Data Sink", color: "#EF4444", icon: <ShieldAlert size={14} /> },
        ];
      case 3: // Payload
        return [
          { query: "CLASS: Exploit()", status: "Crafting Payload", color: "#8B5CF6", icon: <Code size={14} /> },
          { query: "HOOK: def __reduce__(self):", status: "Injecting Callables", color: "#EF4444", icon: <Radio size={14} /> },
          { query: "CMD: (os.system, ('id',))", status: "Payload Weaponized", color: "#39FF14", icon: <Trophy size={14} /> },
        ];
      case 4: // RCE
        return [
          { query: "TRIGGER: loads(malicious_b)", status: "Payload Execution", color: "#EF4444", icon: <ShieldCheck size={14} /> },
          { query: "EXEC: /bin/sh reverse_shell", status: "Spawning Process", color: "#EF4444", icon: <Terminal size={14} /> },
          { query: "CONNECTED: [10.10.1.5]:4444", status: "RCE SUCCESSFUL", color: "#39FF14", icon: <CheckCircle size={14} /> },
        ];
      case 5: // Fix
        return [
          { query: "DROP: pickle.loads()", status: "Removing Vulnerability", color: "#EF4444", icon: <Radio size={14} /> },
          { query: "ADD: json.loads()", status: "Implementing Data-Only", color: "#00F5FF", icon: <FileJson size={14} /> },
          { query: "VERIFY: RCE impossible", status: "Asset Secured", color: "#39FF14", icon: <ShieldCheck size={14} /> },
        ];
      default:
        return [{ query: "INIT_PICKLE_MODULE...", status: "Awaiting Input", color: "#64748B", icon: <Terminal size={14} /> }];
    }
  }, [taskId]);

  useEffect(() => {
    setStep(0);
    const interval = setInterval(() => {
      setStep(s => (s + 1) % scenarios.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [scenarios]);

  return (
    <AnimationBox title={`Pickle Exploit Simulation — ${scenarios[step]?.status || "Active"}`}>
      <div className="anim-exploit">
        <div className="anim-scan__header" style={{ marginBottom: "15px" }}>
          <Activity size={12} className="anim-scan__pulse" />
          <span>CYBERVERSE_PICKLE_v1.0 — PYTHON_RUNTIME</span>
        </div>
        <div className="anim-sqli-display">
          {scenarios.map((s, i) => (
            <div
              key={i}
              className={`anim-exploit__step${step >= i ? " anim-exploit__step--done" : ""}${step === i ? " anim-exploit__step--active" : ""}`}
              style={{ 
                "--sc": s.color, 
                opacity: step === i ? 1 : step > i ? 0.6 : 0.2,
                transform: step === i ? "scale(1.05)" : "scale(1)",
                transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
            >
              <span className="anim-exploit__icon">{s.icon}</span>
              <span className="anim-exploit__label" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85em" }}>{s.query}</span>
              {step === i && <span className="anim-exploit__scanner" />}
            </div>
          ))}
        </div>
      </div>
    </AnimationBox>
  );
});
PickleAnimation.displayName = "PickleAnimation";

/* ── CRYPTOGRAPHY & HASHING ANIMATION ── */
export const CryptoAnimation = memo(({ taskId }) => {
  const [step, setStep] = useState(0);
  
  const scenarios = useMemo(() => {
    switch (taskId) {
      case 1: // Intro
        return [
          { query: "MSG: 'CONFIDENTIAL'", status: "Data Input", color: "#39FF14", icon: <FileCode size={14} /> },
          { query: "APPLY: AES-256-GCM", status: "Encrypting Stream", color: "#00F5FF", icon: <Lock size={14} /> },
          { query: "RESULT: #f7a9...z1", status: "Confidentiality Secured", color: "#39FF14", icon: <ShieldCheck size={14} /> },
        ];
      case 2: // Encoding
        return [
          { query: "ADMIN -> [B64]", status: "Encoding Process", color: "#8B5CF6", icon: <Code size={14} /> },
          { query: "OUTPUT: YWRtaW4=", status: "Representation Ready", color: "#F59E0B", icon: <Radio size={14} /> },
          { query: "REVERSE: -> 'admin'", status: "Reversible (No Key)", color: "#EF4444", icon: <Repeat size={14} /> },
        ];
      case 3: // Hashing
        return [
          { query: "DATA: MySecretPass", status: "Hashing Input", color: "#00F5FF", icon: <Terminal size={14} /> },
          { query: "SHA-256: Hash Engine", status: "One-Way Grinding", color: "#8B5CF6", icon: <Hash size={14} /> },
          { query: "HASH: ba7816...b89", status: "Integrity Fingerprint", color: "#39FF14", icon: <CheckCircle size={14} /> },
        ];
      case 4: // Cracking
        return [
          { query: "TARGET: f59...ac2", status: "Targeting Hash", color: "#EF4444", icon: <Target size={14} /> },
          { query: "DICT: RockYou.txt", status: "Brute Force Guessing", color: "#F59E0B", icon: <Activity size={12} /> },
          { query: "P@ssword123 -> MATCH!", status: "Plaintext Found!", color: "#39FF14", icon: <Unlock size={14} /> },
        ];
      case 5: // Keys
        return [
          { query: "SYM: [SecretKey]", status: "Single Key Mode", color: "#00F5FF", icon: <Key size={14} /> },
          { query: "ASYM: [Pub/Priv]", status: "Key Pair Exchange", color: "#8B5CF6", icon: <Key size={14} /> },
          { query: "TLS_HANDSHAKE: OK", status: "Secure Channel Est.", color: "#39FF14", icon: <ShieldCheck size={14} /> },
        ];
      default:
        return [{ query: "INIT_CRYPTO_CORE...", status: "Awaiting Input", color: "#64748B", icon: <Lock size={14} /> }];
    }
  }, [taskId]);

  useEffect(() => {
    setStep(0);
    const interval = setInterval(() => {
      setStep(s => (s + 1) % scenarios.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [scenarios]);

  return (
    <AnimationBox title={`Crypto Simulation — ${scenarios[step]?.status || "Active"}`}>
      <div className="anim-exploit">
        <div className="anim-scan__header" style={{ marginBottom: "15px" }}>
          <Activity size={12} className="anim-scan__pulse" />
          <span>CYBERVERSE_CRYPTO_v4.0 — HSM_CORE</span>
        </div>
        <div className="anim-sqli-display">
          {scenarios.map((s, i) => (
            <div
              key={i}
              className={`anim-exploit__step${step >= i ? " anim-exploit__step--done" : ""}${step === i ? " anim-exploit__step--active" : ""}`}
              style={{ 
                "--sc": s.color, 
                opacity: step === i ? 1 : step > i ? 0.6 : 0.2,
                transform: step === i ? "scale(1.05)" : "scale(1)",
                transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
            >
              <span className="anim-exploit__icon">{s.icon}</span>
              <span className="anim-exploit__label" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85em" }}>{s.query}</span>
              {step === i && <span className="anim-exploit__scanner" />}
            </div>
          ))}
        </div>
      </div>
    </AnimationBox>
  );
});
CryptoAnimation.displayName = "CryptoAnimation";

/* ── REVERSE ENGINEERING ANIMATION ── */
export const ReAnimation = memo(({ taskId }) => {
  const [step, setStep] = useState(0);
  
  const scenarios = useMemo(() => {
    switch (taskId) {
      case 1: // Intro
        return [
          { query: "LOAD: suspicious_binary.exe", status: "Importing Artifact", color: "#00F5FF", icon: <Binary size={14} /> },
          { query: "ANALYZING: x86_64_PE", status: "Identifying Format", color: "#8B5CF6", icon: <Box size={14} /> },
          { query: "READY: 1.4MB Machine Code", status: "Analysis Core Init", color: "#39FF14", icon: <Cpu size={14} /> },
        ];
      case 2: // Strings
        return [
          { query: "PARSING: binary_strings", status: "Extracting Text", color: "#F59E0B", icon: <Search size={14} /> },
          { query: "FOUND: 'https://evil.ru/api'", status: "Clues Discovered", color: "#EF4444", icon: <Radio size={14} /> },
          { query: "LEAKED: User='admin'", status: "Sensitive PII Found", color: "#39FF14", icon: <CheckCircle size={14} /> },
        ];
      case 3: // Static
        return [
          { query: "GHIDRA: Disassembling...", status: "Static Disassembly", color: "#00F5FF", icon: <CircuitBoard size={14} /> },
          { query: "CODE: mov eax, [ebp+8]", status: "Mapping Assembly", color: "#8B5CF6", icon: <FileCode size={14} /> },
          { query: "GRAPH: LoginLogicFlow", status: "Control Flow Mapped", color: "#39FF14", icon: <Activity size={12} /> },
        ];
      case 4: // Dynamic
        return [
          { query: "GDB: run --debug", status: "Dynamic Trace", color: "#F59E0B", icon: <Play size={14} /> },
          { query: "REG: EAX=0x0 | EIP=0x4010", status: "Monitoring Registers", color: "#EF4444", icon: <Cpu size={14} /> },
          { query: "BP: 0x4010ff TOUCHED", status: "Breakpoint Hit", color: "#39FF14", icon: <Target size={14} /> },
        ];
      case 5: // Logic Bypass
        return [
          { query: "OP: 74 12 (JZ -> FAIL)", status: "Finding Check Logic", color: "#EF4444", icon: <Lock size={14} /> },
          { query: "PATCH: 90 90 (NOP)", status: "Binary Patching", color: "#F59E0B", icon: <Terminal size={14} /> },
          { query: "RUN: Access Granted!", status: "Logic Bypassed", color: "#39FF14", icon: <Unlock size={14} /> },
        ];
      default:
        return [{ query: "INIT_RE_CORE...", status: "Awaiting Input", color: "#64748B", icon: <Cpu size={14} /> }];
    }
  }, [taskId]);

  useEffect(() => {
    setStep(0);
    const interval = setInterval(() => {
      setStep(s => (s + 1) % scenarios.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [scenarios]);

  return (
    <AnimationBox title={`RE Simulation — ${scenarios[step]?.status || "Active"}`}>
      <div className="anim-exploit">
        <div className="anim-scan__header" style={{ marginBottom: "15px" }}>
          <Activity size={12} className="anim-scan__pulse" />
          <span>CYBERVERSE_RE_v3.2 — GHIDRA_ENGINE</span>
        </div>
        <div className="anim-sqli-display">
          {scenarios.map((s, i) => (
            <div
              key={i}
              className={`anim-exploit__step${step >= i ? " anim-exploit__step--done" : ""}${step === i ? " anim-exploit__step--active" : ""}`}
              style={{ 
                "--sc": s.color, 
                opacity: step === i ? 1 : step > i ? 0.6 : 0.2,
                transform: step === i ? "scale(1.05)" : "scale(1)",
                transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
            >
              <span className="anim-exploit__icon">{s.icon}</span>
              <span className="anim-exploit__label" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85em" }}>{s.query}</span>
              {step === i && <span className="anim-exploit__scanner" />}
            </div>
          ))}
        </div>
      </div>
    </AnimationBox>
  );
});
ReAnimation.displayName = "ReAnimation";
