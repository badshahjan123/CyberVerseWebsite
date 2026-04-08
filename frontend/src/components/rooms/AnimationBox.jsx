import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import {
  Globe, Wifi, Server, Cpu, Database, ArrowRight, Radio,
  Layers, Clock, Target, Router, Activity, Search, Code,
  Unlock, CheckCircle, ShieldCheck, ShieldAlert, AlertTriangle, Sparkles
} from "lucide-react";

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
