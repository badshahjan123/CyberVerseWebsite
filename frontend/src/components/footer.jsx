import { Link } from 'react-router-dom'
import { Shield, Github, Linkedin, Instagram, Mail, Award, Code2, Zap, Trophy, Crown, Terminal, Flame } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    platform: [
      { name: 'Rooms', path: '/rooms' },
      { name: 'Labs', path: '/labs' },
      { name: 'Leaderboard', path: '/leaderboard' },
      { name: 'Learning Paths', path: '/pathways' }
    ],
    resources: [
      { name: 'Documentation', path: '#' },
      { name: 'Blog', path: '#' },
      { name: 'Community', path: '#' },
      { name: 'FAQ', path: '#' }
    ],
    company: [
      { name: 'About Us', path: '/about' },
      { name: 'Contact', path: '/contact' },
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' }
    ]
  }

  const socialLinks = [
    { name: 'LinkedIn',  url: 'https://www.linkedin.com/in/badshah-khan-871222277', icon: Linkedin,  color: '#0A66C2' },
    { name: 'GitHub',    url: 'https://github.com/badshahjan123',                   icon: Github,    color: '#8B5CF6' },
    { name: 'Instagram', url: 'https://www.instagram.com/badshah___jamil?igsh=MXBkczl6bXJjM2R3cw==', icon: Instagram, color: '#E1306C' }
  ]

  return (
    <footer className="cv-footer">
      {/* Top neon border */}
      <div className="cv-footer-topline" aria-hidden="true" />

      {/* Static grid backdrop */}
      <div className="cv-footer-grid" aria-hidden="true" />

      <div className="cv-footer-inner">

        {/* ── Brand ── */}
        <div className="cv-footer-brand">
          {/* Logo */}
          <Link to="/" className="cv-footer-logo">
            <div className="cv-footer-logo-icon">
              <Shield size={18} style={{ color: '#00F5FF' }} />
            </div>
            <span className="cv-footer-logo-text">CyberVerse</span>
          </Link>

          <p className="cv-footer-tagline">
            Master cybersecurity through gamified hacking challenges. Battle, earn XP,
            and level&nbsp;up in a competitive hacker arena.
          </p>

          {/* Mini stats */}
          <div className="cv-footer-mini-stats">
            <div className="cv-footer-mini-stat">
              <Trophy size={13} style={{ color: '#FACC15' }} />
              <span>Global Leaderboard</span>
            </div>
            <div className="cv-footer-mini-stat">
              <Flame size={13} style={{ color: '#00F5FF' }} />
              <span>Daily Challenges</span>
            </div>
            <div className="cv-footer-mini-stat">
              <Terminal size={13} style={{ color: '#39FF14' }} />
              <span>Live Labs</span>
            </div>
          </div>

          {/* Founder socials */}
          <div className="cv-footer-social-block">
            <p className="cv-footer-social-label">
              <Crown size={13} style={{ color: '#FACC15' }} />
              Connect with the Founder
            </p>
            <div className="cv-footer-socials">
              {socialLinks.map((s) => {
                const Icon = s.icon
                return (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.name}
                    className="cv-footer-social-btn"
                    style={{ '--social-color': s.color }}
                  >
                    <Icon size={16} />
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Links ── */}
        <div className="cv-footer-links-col">
          <h3 className="cv-footer-col-title">
            <Code2 size={14} style={{ color: '#00F5FF' }} /> Platform
          </h3>
          <ul className="cv-footer-link-list">
            {footerLinks.platform.map((l) => (
              <li key={l.name}>
                <Link to={l.path} className="cv-footer-link">
                  <Zap size={11} className="cv-footer-link-arrow" />
                  {l.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="cv-footer-links-col">
          <h3 className="cv-footer-col-title">
            <Shield size={14} style={{ color: '#8B5CF6' }} /> Resources
          </h3>
          <ul className="cv-footer-link-list">
            {footerLinks.resources.map((l) => (
              <li key={l.name}>
                <Link to={l.path} className="cv-footer-link cv-footer-link--purple">
                  <Zap size={11} className="cv-footer-link-arrow" />
                  {l.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="cv-footer-links-col">
          <h3 className="cv-footer-col-title">
            <Award size={14} style={{ color: '#FACC15' }} /> Company
          </h3>
          <ul className="cv-footer-link-list">
            {footerLinks.company.map((l) => (
              <li key={l.name}>
                <Link to={l.path} className="cv-footer-link cv-footer-link--gold">
                  <Zap size={11} className="cv-footer-link-arrow" />
                  {l.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* ── Bottom Bar ── */}
      <div className="cv-footer-bottom">
        <div className="cv-footer-bottom-inner">
          <div className="cv-footer-bottom-left">
            <span className="cv-footer-version">v2.0</span>
            <span className="cv-footer-copy">© {currentYear} CyberVerse. All rights reserved.</span>
          </div>

          <div className="cv-footer-bottom-center">
            <div className="cv-footer-badge">
              <Award size={13} style={{ color: '#00F5FF' }} />
              <span>Secured by Industry Experts</span>
            </div>
          </div>

          <div className="cv-footer-bottom-right">
            <a href="mailto:contact@cyberverse.com" className="cv-footer-contact">
              <Mail size={13} /> Contact Us
            </a>
            <span className="cv-footer-divider" />
            <span className="cv-footer-built">
              <Shield size={13} style={{ color: '#00F5FF' }} />
              Built with 💚 by Badshah Jan &amp; Yasir Hussain
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer