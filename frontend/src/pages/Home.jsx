import { Link } from "react-router-dom"
import { useApp } from "../contexts/app-context"
import {
  Shield, Terminal, Network, Code, Trophy, Crown,
  Zap, Lock, Star, Flame, ChevronRight, CheckCircle, Swords
} from "lucide-react"
import { memo, useMemo, useEffect, useRef, useState } from "react"

/* ─────────────────────────────────────────
   Animated counter hook (runs once on mount)
───────────────────────────────────────── */
const useCounter = (target, duration = 1800, startOnMount = true) => {
  const [count, setCount] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (!startOnMount || started.current) return
    started.current = true
    const startTime = performance.now()
    const step = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, startOnMount])

  return count
}

/* ─────────────────────────────────────────
   Stat Card
───────────────────────────────────────── */
const StatCard = memo(({ emoji, label, value, xp, color }) => {
  const numericVal = parseInt(value.replace(/,/g, ""), 10)
  const counted = useCounter(numericVal)

  const formatted = counted.toLocaleString()

  return (
    <div className="cv-stat-card" style={{ "--accent-color": color }}>
      <div className="cv-stat-icon">{emoji}</div>
      <div className="cv-stat-value">{formatted}</div>
      <div className="cv-stat-label">{label}</div>
      <div className="cv-xp-bar-wrap">
        <div className="cv-xp-bar" style={{ "--xp-pct": `${xp}%`, "--bar-color": color }} />
      </div>
      <div className="cv-xp-label">{xp} XP Progress</div>
    </div>
  )
})

/* ─────────────────────────────────────────
   Feature Card
───────────────────────────────────────── */
const FeatureCard = memo(({ icon: Icon, title, description, xpBadge, color }) => (
  <div className="cv-feature-card" style={{ "--feat-color": color }}>
    <div className="cv-feature-header">
      <div className="cv-feature-icon-wrap">
        <Icon className="cv-feature-icon" size={22} />
      </div>
      <span className="cv-xp-badge">{xpBadge}</span>
    </div>
    <h3 className="cv-feature-title">{title}</h3>
    <p className="cv-feature-desc">{description}</p>
  </div>
))

/* ─────────────────────────────────────────
   Leaderboard Row
───────────────────────────────────────── */
const LeaderRow = memo(({ rank, name, level, xp, color }) => (
  <div className="cv-leader-row">
    <div className="cv-rank-badge" style={{ "--rank-color": color }}>
      {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
    </div>
    <div className="cv-leader-info">
      <span className="cv-leader-name">{name}</span>
      <span className="cv-leader-level">Lvl {level}</span>
    </div>
    <div className="cv-leader-xp" style={{ color }}>
      <Zap size={12} /> {xp.toLocaleString()} XP
    </div>
  </div>
))

/* ─────────────────────────────────────────
   Dashboard Preview Card (Hero Right)
───────────────────────────────────────── */
const DashboardPreview = memo(() => (
  <div className="cv-dash-card">
    <div className="cv-dash-header">
      <Shield size={16} className="cv-dash-icon" />
      <span className="cv-dash-title">CyberVerse Console</span>
      <div className="cv-dash-dots">
        <span style={{ background: "#FF5F57" }} />
        <span style={{ background: "#FFBD2E" }} />
        <span style={{ background: "#28C840" }} />
      </div>
    </div>

    <div className="cv-dash-terminal">
      <p><span className="cv-term-prompt">$</span> <span className="cv-term-cmd">connect --lab sql-injection-advanced</span></p>
      <p className="cv-term-success">✓ Lab environment spawned</p>
      <p><span className="cv-term-prompt">$</span> <span className="cv-term-cmd">nmap -sV 10.10.1.42</span></p>
      <p className="cv-term-muted">Starting Nmap 7.94...</p>
      <p className="cv-term-info">PORT   STATE SERVICE VERSION</p>
      <p className="cv-term-warn">80/tcp open  http    Apache 2.4.41</p>
      <p className="cv-term-success">3306/tcp open  mysql</p>
    </div>

    <div className="cv-dash-stats-row">
      <div className="cv-mini-stat">
        <Trophy size={13} style={{ color: "#FACC15" }} />
        <span>Level 5</span>
      </div>
      <div className="cv-mini-stat">
        <Flame size={13} style={{ color: "#00F5FF" }} />
        <span>7 Streak</span>
      </div>
      <div className="cv-mini-stat">
        <Star size={13} style={{ color: "#39FF14" }} />
        <span>2,450 XP</span>
      </div>
    </div>
  </div>
))

/* ─────────────────────────────────────────
   Main Home Component
───────────────────────────────────────── */
const Home = memo(() => {
  const { isAuthenticated } = useApp()

  const stats = useMemo(() => [
    { emoji: "👾", label: "Active Hackers", value: "1,248", xp: 72, color: "#00F5FF" },
    { emoji: "🧪", label: "Live Labs",      value: "86",    xp: 58, color: "#8B5CF6" },
    { emoji: "🏆", label: "Challenges Completed", value: "23,490", xp: 89, color: "#39FF14" },
  ], [])

  const features = useMemo(() => [
    {
      icon: Terminal,
      title: "Interactive Labs",
      description: "Practice real-world cybersecurity scenarios in isolated virtual environments with real tooling.",
      xpBadge: "+20 XP",
      color: "#00F5FF",
    },
    {
      icon: Swords,
      title: "Live Attack Rooms",
      description: "Join collaborative hacking challenges with players worldwide and earn arena points.",
      xpBadge: "+50 XP",
      color: "#8B5CF6",
    },
    {
      icon: Trophy,
      title: "Global Leaderboard",
      description: "Compete with hackers globally, climb the ranked system and earn exclusive titles.",
      xpBadge: "Ranked",
      color: "#FACC15",
    },
    {
      icon: Zap,
      title: "Skill Progression",
      description: "Track your journey from beginner to elite. Unlock abilities, collect badges and level up.",
      xpBadge: "Leveling",
      color: "#39FF14",
    },
  ], [])

  const leaders = useMemo(() => [
    { rank: 1, name: "0xShadow",   level: 42, xp: 98450, color: "#FACC15" },
    { rank: 2, name: "n1ght_cr4wl", level: 38, xp: 87220, color: "#94A3B8" },
    { rank: 3, name: "byte_ghost",  level: 35, xp: 74100, color: "#CD7F32" },
  ], [])

  return (
    <div className="cv-home">

      {/* ══════════════ HERO ══════════════ */}
      <section className="cv-hero">
        {/* Background layers */}
        <div className="cv-hero-glow" />
        <div className="cv-hero-grid" aria-hidden="true" />

        <div className="cv-hero-inner">
          {/* Left */}
          <div className="cv-hero-left">
            <div className="cv-hero-badge">
              <Shield size={13} />
              <span>Next-Gen Security Training</span>
            </div>

            <h1 className="cv-hero-heading">
              Master{" "}
              <span className="cv-gradient-animate">Cyber Security</span>
              <br />
              Like a Pro
            </h1>

            <p className="cv-hero-sub">
              Hack. Learn. Compete. Rise through the ranks in the world's most
              immersive cybersecurity training arena.
            </p>

            <div className="cv-hero-cta">
              <Link
                to={isAuthenticated ? "/dashboard" : "/signup"}
                id="hero-enter-labs"
                className="cv-btn-primary"
              >
                🚀 Enter Labs
                <ChevronRight size={16} />
              </Link>
              <Link
                to="/leaderboard"
                id="hero-compete-now"
                className="cv-btn-secondary"
              >
                🎮 Compete Now
              </Link>
            </div>
          </div>

          {/* Right */}
          <div className="cv-hero-right">
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* ══════════════ STATS ══════════════ */}
      <section className="cv-stats-section">
        <div className="cv-section-inner">
          <div className="cv-stats-grid">
            {stats.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ FEATURES ══════════════ */}
      <section id="features" className="cv-features-section">
        <div className="cv-section-inner">
          <div className="cv-section-header">
            <h2 className="cv-section-title">Why Choose <span className="cv-gradient-text">CyberVerse?</span></h2>
            <p className="cv-section-sub">Professional gamified training with real-world scenarios and XP rewards</p>
          </div>
          <div className="cv-features-grid">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ LEADERBOARD PREVIEW ══════════════ */}
      <section className="cv-lb-section">
        <div className="cv-section-inner cv-lb-inner">
          <div className="cv-lb-left">
            <div className="cv-section-header" style={{ textAlign: "left" }}>
              <h2 className="cv-section-title">
                🏆 <span className="cv-gradient-text">Top Hackers</span>
              </h2>
              <p className="cv-section-sub">The elite arena. Prove your skills and earn a spot on the global leaderboard.</p>
            </div>
            <Link to="/leaderboard" id="view-full-leaderboard" className="cv-btn-outline">
              View Full Leaderboard <ChevronRight size={14} />
            </Link>
          </div>

          <div className="cv-lb-card">
            <div className="cv-lb-card-header">
              <Trophy size={18} style={{ color: "#FACC15" }} />
              <span>Global Rankings</span>
              <span className="cv-lb-live">LIVE</span>
            </div>
            {leaders.map((l) => (
              <LeaderRow key={l.rank} {...l} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ PREMIUM ══════════════ */}
      <section className="cv-premium-section">
        <div className="cv-section-inner">
          <div className="cv-premium-card">
            <div className="cv-premium-glow" aria-hidden="true" />
            <Crown size={40} className="cv-premium-crown" />
            <h2 className="cv-premium-title">Unlock Pro Hacker Mode</h2>
            <p className="cv-premium-sub">
              Gain full access to exclusive labs, private attack rooms, and elite content
              trusted by professional red teamers.
            </p>

            <div className="cv-premium-benefits">
              {[
                "Unlimited Lab Access & Private Rooms",
                "Exclusive CTF Competitions & Certificates",
                "Priority Support & Community Mentorship",
              ].map((b) => (
                <div key={b} className="cv-premium-benefit">
                  <CheckCircle size={16} className="cv-benefit-check" />
                  <span>{b}</span>
                </div>
              ))}
            </div>

            <Link
              to={isAuthenticated ? "/premium" : "/signup"}
              id="premium-upgrade-cta"
              className="cv-btn-gold"
            >
              <Crown size={16} /> Upgrade to Pro
            </Link>

            <p className="cv-premium-note">Cancel anytime • 7-day money-back guarantee</p>
          </div>
        </div>
      </section>

    </div>
  )
})

Home.displayName = "Home"
export default Home