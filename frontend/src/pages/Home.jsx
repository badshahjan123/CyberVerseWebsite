import React, { memo, useState } from "react"
import { Link } from "react-router-dom"
import { Rocket, Gamepad2, Trophy, Flame, Star, Shield } from "lucide-react"
import { useApp } from "../contexts/app-context"
import { useRealtime } from "../contexts/realtime-context"

/* ── Colour tokens (single source of truth) ──────────────────────────
   orange  → primary CTA buttons only
   cyan    → data, stats, terminal, info highlights
   slate   → body text, secondary labels
   white   → headings, primary text
──────────────────────────────────────────────────────────────────── */
const C = {
  orange:      "#FF6B00",
  orangeGlow:  "rgba(255,107,0,0.25)",
  orangeDim:   "rgba(255,107,0,0.12)",
  orangeBorder:"rgba(255,107,0,0.3)",
  cyan:        "#00D1FF",
  cyanGlow:    "rgba(0,209,255,0.15)",
  cyanDim:     "rgba(0,209,255,0.08)",
  cyanBorder:  "rgba(0,209,255,0.2)",
}

const Home = memo(() => {
  const { isAuthenticated } = useApp()
  const { userStats } = useRealtime()

  const [stats] = useState({
    hackers: 7, rooms: 10, labs: 15,
    hPct: "0.7", rPct: "50.0", lPct: "30.0",
  })

  return (
    <div style={{
        background: `radial-gradient(circle at 0% 0%, rgba(0, 209, 255, 0.15) 0%, transparent 40%), 
                     radial-gradient(circle at 100% 100%, rgba(255, 107, 0, 0.2) 0%, transparent 40%),
                     #081224`
      }}
      className="text-white relative overflow-x-hidden">

      {/* ── Background grid overlay ── */}
      <div className="absolute inset-0 z-0 pointer-events-none"
           style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      {/* Dark overlay — tones down background, improves card/text contrast */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ background: 'rgba(0,0,0,0.3)' }} />

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 lg:px-[80px] pt-[40px] pb-[80px]">
        <div className="max-w-[1300px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-12 lg:gap-16 items-center">

          {/* LEFT */}
          <div className="flex flex-col gap-6">
            <h1 className="leading-[1.1]">
              <span className="block text-white text-[42px] lg:text-[52px] font-black uppercase tracking-tight"
                    style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: '-0.01em' }}>
                UNLEASH YOUR POWER.
              </span>
              <span className="block text-[42px] lg:text-[52px] font-black uppercase tracking-tight"
                    style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: '-0.01em' }}>
                <span className="text-white">Master </span>
                <span style={{ color: C.cyan }}>Cyber Security</span>
              </span>
            </h1>

            <p className="text-white text-[18px] lg:text-[20px] font-bold leading-snug max-w-[480px]">
              Become an Unstoppable Pro in the Ultimate Training Arena
            </p>

            <p className="text-slate-400 text-[15px] leading-relaxed max-w-[420px]">
              Hack. Learn. Compete. Rise through the ranks in the world's most immersive cybersecurity training arena.
            </p>

            {/* CTAs — orange = primary action */}
            <div className="flex items-center gap-4 pt-2">
              <Link
                to={isAuthenticated ? "/labs" : "/login"}
                className="flex items-center gap-3 px-7 py-3.5 rounded-xl text-[15px] font-bold transition-all hover:scale-[1.03] active:scale-[0.97] btn-primary"
              >
                <div className="flex items-center gap-3">
                  <Rocket size={18} /> <span>Enter Labs</span>
                </div>
              </Link>
              <Link
                to={isAuthenticated ? "/leaderboard" : "/login"}
                className="flex items-center gap-3 px-7 py-3.5 rounded-xl bg-transparent border border-white/30 text-[15px] transition-all hover:border-white/50"
                style={{ color: '#ffffff', fontWeight: 900 }}>
                <Gamepad2 size={18} /> Compete Now
              </Link>
            </div>
          </div>

          {/* RIGHT — Terminal card */}
          <div className="relative">
            <div className="bg-[#0d1623] border border-white/[0.07] rounded-xl overflow-hidden"
                 style={{ boxShadow: `0 0 50px ${C.cyanGlow}` }}>

              {/* Bar */}
              <div className="flex items-center justify-between px-5 py-3 bg-[#111e2e] border-b border-white/[0.05]">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                </div>
                <span className="text-[11px] font-bold tracking-wider uppercase font-mono flex items-center gap-2"
                      style={{ color: C.cyan }}>
                  <Shield size={11} strokeWidth={3} /> CyberVerse Console
                </span>
                <span className="text-[10px] font-bold text-green-400 tracking-wider">● LIVE</span>
              </div>

              {/* Body */}
              <div className="p-6 font-mono text-[13px] leading-[1.8] space-y-1">
                <p><span className="text-green-400 font-bold">$</span> <span className="text-white/85">connect --lab sql-injection-advanced</span></p>
                <p className="text-green-400">✓ Lab environment spawned</p>
                <p className="mt-2"><span className="text-green-400 font-bold">$</span> <span className="text-white/85">nmap -sV 10.10.1.42</span></p>
                <p className="text-slate-600 text-[12px]">Starting Nmap 7.94...</p>
                <p className="text-slate-600 text-[12px]">PORT &nbsp;&nbsp;STATE SERVICE &nbsp;VERSION</p>
                <p className="text-[#FFBD2E]">80/tcp open http &nbsp;&nbsp;Apache 2.4.41</p>
                <p className="text-green-400">3306/tcp open mysql</p>
              </div>

              {/* Stats footer — cyan = data */}
              <div className="flex gap-3 px-5 py-4 border-t border-white/[0.05] bg-[#090f1a]">
                {[
                  { icon: <Trophy size={12} />, label: `Level ${userStats?.level || 1}` },
                  { icon: <Flame size={12} />,  label: `${userStats?.streak || 0} Streak` },
                  { icon: <Star size={12} />,   label: `${(userStats?.totalXP || 0).toLocaleString()} XP` },
                ].map((b) => (
                  <div key={b.label}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider"
                    style={{ background: C.cyanDim, border: `1px solid ${C.cyanBorder}`, color: C.cyan }}>
                    {b.icon} {b.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════
          STATS + WHY CHOOSE
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 lg:px-[80px] pb-[100px]">
        <div className="max-w-[1300px] mx-auto flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">

          {/* Stat cards — cyan = data */}
          <div className="grid grid-cols-3 gap-4 shrink-0" style={{ width: '460px' }}>
            {[
              { num: stats.hackers, label: "Registered Hackers", sub: `${stats.hPct}% Global Scale` },
              { num: stats.rooms,   label: "Training Rooms",     sub: `${stats.rPct}% Live Courses` },
              { num: stats.labs,    label: "Active Labs",        sub: `${stats.lPct}% Live Instances` },
            ].map((s) => (
              <div key={s.label}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border relative overflow-hidden"
                style={{ aspectRatio: '1', padding: '16px 12px', background: 'rgba(13,22,35,0.95)', borderColor: 'rgba(0,209,255,0.25)', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>
                <div className="absolute top-0 inset-x-0 h-[2px]"
                     style={{ backgroundColor: C.cyan, boxShadow: `0 0 10px ${C.cyan}` }} />
                <div className="text-[32px] font-black leading-none" style={{ color: C.cyan }}>{s.num}</div>
                <div className="text-[9px] font-black tracking-[0.12em] uppercase text-center leading-tight" style={{ color: 'rgba(255,255,255,0.75)' }}>{s.label}</div>
                <div className="w-[50%] h-[2px] rounded-full overflow-hidden mt-1" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <div className="h-full rounded-full" style={{ width: '40%', backgroundColor: C.cyan }} />
                </div>
                <div className="text-[8px] font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Why Choose */}
          <div className="flex-1 flex flex-col gap-6">
            <div>
              <h2 className="text-[36px] lg:text-[42px] font-black leading-tight tracking-tight">
                Why Choose <span style={{ color: C.cyan }}>CyberVerse?</span>
              </h2>
              <p className="text-slate-500 text-[14px] mt-2">
                Professional gamified training with real-world scenarios and XP rewards
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-10 gap-y-6">
              {[
                { emoji: "🏆", title: "Gamified cybersecurity badges",       desc: "Earn exclusive markers." },
                { emoji: "🎯", title: "Real-world scenarios and XP rewards", desc: "Practice in actual network setups." },
                { emoji: "⚡", title: "Fast structured training",            desc: "Optimized learning path for speed." },
                { emoji: "🛡️", title: "Security guarantee",                  desc: "Safe and isolated lab environments." },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-3">
                  <span className="text-[22px] shrink-0 mt-0.5">{f.emoji}</span>
                  <div>
                    <h5 className="text-[13px] font-bold leading-snug" style={{ color: '#ffffff' }}>{f.title}</h5>
                    <p className="text-[12px] mt-0.5" style={{ color: 'rgba(148,163,184,0.9)' }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════
          LEARNING JOURNEY
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 lg:px-[80px] py-[80px] border-t border-white/[0.04]">
        <div className="max-w-[1300px] mx-auto">
          <div className="mb-10">
            <p className="text-[11px] font-bold tracking-[0.2em] text-white/30 uppercase mb-2">Your Path</p>
            <h2 className="text-[32px] font-black text-white leading-tight">Your Learning Journey</h2>
          </div>

          <div className="flex items-stretch gap-0">
            {[
              { step: 1, label: "Beginner",         sub: "Linux & Networking", done: true,  active: false, locked: false },
              { step: 2, label: "Web Exploitation",  sub: "SQLi, XSS, CSRF",   done: false, active: true,  locked: false },
              { step: 3, label: "Network Security",  sub: "Recon & Pivoting",  done: false, active: false, locked: true  },
              { step: 4, label: "Advanced",          sub: "Red Team Ops",      done: false, active: false, locked: true  },
            ].map((s, i, arr) => (
              <div key={s.step} className="flex items-center flex-1">
                <div className="flex-1 flex flex-col gap-3 px-5 py-5 rounded-xl border transition-all"
                  style={{
                    background:  s.active
                      ? 'rgba(255,107,0,0.15)'
                      : s.done
                      ? 'rgba(0,209,255,0.1)'
                      : 'rgba(255,255,255,0.06)',
                    borderColor: s.active
                      ? 'rgba(255,107,0,0.5)'
                      : s.done
                      ? 'rgba(0,209,255,0.4)'
                      : 'rgba(255,255,255,0.15)',
                    boxShadow: s.active
                      ? '0 0 24px rgba(255,107,0,0.15), inset 0 1px 0 rgba(255,255,255,0.05)'
                      : s.done
                      ? '0 0 20px rgba(0,209,255,0.1), inset 0 1px 0 rgba(255,255,255,0.05)'
                      : 'inset 0 1px 0 rgba(255,255,255,0.04)',
                  }}>
                  <div className="flex items-center justify-between">
                    {/* Step circle */}
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-black"
                      style={{
                        background:  s.done ? 'rgba(0,209,255,0.2)' : s.active ? 'rgba(255,107,0,0.25)' : 'rgba(255,255,255,0.1)',
                        color:       s.done ? C.cyan : s.active ? C.orange : 'rgba(255,255,255,0.5)',
                        border:      `1px solid ${s.done ? 'rgba(0,209,255,0.5)' : s.active ? 'rgba(255,107,0,0.6)' : 'rgba(255,255,255,0.2)'}`,
                      }}>
                      {s.done ? "✓" : s.step}
                    </div>
                    {/* Status pill */}
                    {s.done   && <span className="text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full"
                                       style={{ background: 'rgba(0,209,255,0.15)', color: C.cyan, border: `1px solid rgba(0,209,255,0.4)` }}>Done</span>}
                    {s.active && <span className="text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full"
                                       style={{ background: 'rgba(255,107,0,0.2)', color: C.orange, border: `1px solid rgba(255,107,0,0.5)` }}>Current</span>}
                    {s.locked && <span className="text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full"
                                       style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.15)' }}>🔒 Locked</span>}
                  </div>
                  <div>
                    <p className="text-[14px] font-bold leading-tight"
                       style={{ color: s.locked ? 'rgba(255,255,255,0.35)' : s.active ? C.orange : '#ffffff' }}>
                      {s.label}
                    </p>
                    <p className="text-[12px] mt-1"
                       style={{ color: s.locked ? 'rgba(255,255,255,0.25)' : 'rgba(148,163,184,0.9)' }}>
                      {s.sub}
                    </p>
                  </div>
                </div>
                {/* Connector */}
                {i < arr.length - 1 && (
                  <div className="w-6 shrink-0 h-[2px] mx-1"
                       style={{ background: s.done ? 'rgba(0,209,255,0.4)' : 'rgba(255,255,255,0.12)' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FEATURED LABS
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 lg:px-[80px] py-[80px] border-t border-white/[0.04]">
        <div className="max-w-[1300px] mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[11px] font-bold tracking-[0.2em] text-white/30 uppercase mb-2">Hands-On</p>
              <h2 className="text-[32px] font-black text-white leading-tight">Featured Labs</h2>
            </div>
            <Link to="/labs" className="text-[13px] font-semibold text-slate-500 hover:text-white transition-colors">
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: "💉", title: "SQL Injection",       desc: "Extract data from a vulnerable login endpoint.",          diff: "Easy",   diffColor: "#28C840", xp: 150 },
              { icon: "🌐", title: "XSS Attack Chain",    desc: "Craft a stored XSS payload to hijack admin sessions.",    diff: "Medium", diffColor: "#FFBD2E", xp: 250 },
              { icon: "🔓", title: "Privilege Escalation",desc: "Exploit a misconfigured SUID binary to gain root.",       diff: "Hard",   diffColor: "#FF5F57", xp: 400 },
            ].map((lab) => (
              <div key={lab.title}
                className="flex flex-col gap-4 p-5 rounded-xl border transition-all"
                style={{ background: 'rgba(13,22,35,0.95)', borderColor: 'rgba(255,255,255,0.12)', boxShadow: '0 4px 24px rgba(0,0,0,0.35)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.5)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.35)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-[26px]">{lab.icon}</span>
                  <span className="text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full border"
                        style={{ color: lab.diffColor, borderColor: `${lab.diffColor}60`, background: `${lab.diffColor}18` }}>
                    {lab.diff}
                  </span>
                </div>
                <div>
                  <h3 className="text-[15px] font-bold" style={{ color: '#ffffff' }}>{lab.title}</h3>
                  <p className="text-[12px] mt-1 leading-relaxed" style={{ color: 'rgba(148,163,184,0.9)' }}>{lab.desc}</p>
                </div>
                <div className="flex items-center justify-between mt-auto pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  <span className="text-[12px] font-bold" style={{ color: C.cyan }}>+{lab.xp} XP</span>
                  <Link to={isAuthenticated ? "/labs" : "/signup"}
                    className="px-4 py-1.5 rounded-lg text-[12px] font-bold text-white transition-all hover:scale-[1.03] btn-primary"
                    style={{ background: `linear-gradient(135deg, ${C.orange}, #cc4400)`, boxShadow: `0 0 14px ${C.orangeGlow}`, color: '#ffffff', fontWeight: 900 }}>
                    Start Lab
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          DAILY CHALLENGE
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 lg:px-[80px] py-[80px] border-t border-white/[0.04]">
        <div className="max-w-[1300px] mx-auto flex justify-center">
          <div className="w-full max-w-[600px] flex flex-col items-center gap-5 px-8 py-8 rounded-2xl border text-center"
               style={{ background: 'rgba(13,22,35,0.95)', borderColor: 'rgba(255,107,0,0.3)', boxShadow: '0 4px 32px rgba(0,0,0,0.4)' }}>
            {/* Label — orange = action/urgency */}
            <span className="text-[10px] font-black tracking-[0.25em] uppercase px-3 py-1 rounded-full"
                  style={{ color: C.orange, background: C.orangeDim, border: `1px solid ${C.orangeBorder}` }}>
              🔥 Daily Challenge
            </span>

            <h3 className="text-[22px] font-black leading-tight" style={{ color: '#ffffff' }}>Bypass the WAF</h3>
            <p className="text-[13px] max-w-[400px] leading-relaxed" style={{ color: 'rgba(148,163,184,0.9)' }}>
              A firewall is blocking your injection attempts. Find a bypass and extract the admin hash.
            </p>

            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[20px] font-black text-white tabular-nums">04:22:11</span>
                <span className="text-[10px] text-white/50 uppercase tracking-widest">Time Left</span>
              </div>
              <div className="w-[1px] h-8 bg-white/[0.08]" />
              {/* XP reward — cyan = data */}
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[20px] font-black tabular-nums" style={{ color: C.cyan }}>+300 XP</span>
                <span className="text-[10px] text-white/50 uppercase tracking-widest">Reward</span>
              </div>
              <div className="w-[1px] h-8 bg-white/[0.08]" />
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[20px] font-black text-[#FFBD2E] tabular-nums">Medium</span>
                <span className="text-[10px] text-white/50 uppercase tracking-widest">Difficulty</span>
              </div>
            </div>

            {/* CTA — orange = action */}
            <Link to={isAuthenticated ? "/rooms" : "/login"}
              className="mt-1 px-8 py-3 rounded-xl text-[14px] font-black transition-all hover:scale-[1.03] active:scale-[0.97] btn-primary"
              style={{ background: `linear-gradient(135deg, ${C.orange}, #cc4400)`, boxShadow: `0 0 24px ${C.orangeGlow}` }}>
              Start Challenge
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          WHY CYBERVERSE
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 lg:px-[80px] py-[80px] border-t border-white/[0.04]">
        <div className="max-w-[1300px] mx-auto">
          <div className="mb-10 text-center">
            <p className="text-[11px] font-bold tracking-[0.2em] text-white/30 uppercase mb-2">Platform</p>
            <h2 className="text-[32px] font-black text-white leading-tight">Why CyberVerse</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "🎮", title: "Gamified Learning", line: "XP, ranks & badges keep you motivated." },
              { icon: "🧪", title: "Real Labs",          line: "Isolated environments, real tools." },
              { icon: "📈", title: "Skill Progression",  line: "Structured path from zero to elite." },
              { icon: "💼", title: "Career Focus",       line: "Certs and skills employers look for." },
            ].map((item) => (
              <div key={item.title}
                className="flex flex-col gap-3 px-5 py-5 rounded-xl border transition-all"
                style={{ background: 'rgba(13,22,35,0.95)', borderColor: 'rgba(255,255,255,0.12)', boxShadow: '0 4px 20px rgba(0,0,0,0.35)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}>
                <span className="text-[24px]">{item.icon}</span>
                <div>
                  <p className="text-[13px] font-bold" style={{ color: '#ffffff' }}>{item.title}</p>
                  <p className="text-[11px] mt-1 leading-relaxed" style={{ color: 'rgba(148,163,184,0.9)' }}>{item.line}</p>
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
