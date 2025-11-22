import { Link } from 'react-router-dom'
import { Shield, Github, Linkedin, Instagram, Mail, Award, Code2, Zap, Trophy, Crown } from 'lucide-react'

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
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/badshah-khan-871222277',
      icon: Linkedin,
      color: 'hover:text-blue-400',
      bgGlow: 'hover:bg-blue-400/10'
    },
    {
      name: 'GitHub',
      url: 'https://github.com/badshahjan123',
      icon: Github,
      color: 'hover:text-purple-400',
      bgGlow: 'hover:bg-purple-400/10'
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/badshah___jamil?igsh=MXBkczl6bXJjM2R3cw==',
      icon: Instagram,
      color: 'hover:text-pink-400',
      bgGlow: 'hover:bg-pink-400/10'
    }
  ]

  return (
    <footer className="relative mt-auto bg-[rgb(8,12,16)] border-t border-white/10">
      {/* Gamified Top Border with Glow Effect */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative">
                <Shield className="w-8 h-8 text-primary" />
                <div className="absolute inset-0 blur-md bg-primary/30"></div>
              </div>
              <span className="text-2xl font-bold gradient-text">CyberVerse</span>
            </div>
            <p className="text-muted text-sm mb-6 leading-relaxed">
              Master through gamified learning. Battle challenges, earn achievements, and level up your skills in a competitive environment.
            </p>

            {/* Gamified Stats */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1.5 text-xs">
                <Trophy className="w-4 h-4 text-warning" />
                <span className="text-muted">learners</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Award className="w-4 h-4 text-primary" />
                <span className="text-muted">Rooms</span>
              </div>
            </div>

            {/* Founder Social Links */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-text flex items-center gap-2">
                <Crown className="w-4 h-4 text-warning" />
                Connect with the Founder
              </p>
              <div className="flex items-center gap-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group relative p-2.5 rounded-lg bg-white/5 border border-white/10 ${social.bgGlow} ${social.color} transition-all hover:scale-110 hover:border-white/30`}
                    aria-label={social.name}
                  >
                    <social.icon className="w-5 h-5" />
                    <div className="absolute inset-0 rounded-lg blur-md opacity-0 group-hover:opacity-30 transition-opacity bg-current"></div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div className="lg:col-span-2">
            <h3 className="text-text font-bold mb-4 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-primary" />
              Platform
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted hover:text-primary transition-colors inline-flex items-center gap-1.5 group"
                  >
                    <Zap className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div className="lg:col-span-3">
            <h3 className="text-text font-bold mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-accent" />
              Resources
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted hover:text-accent transition-colors inline-flex items-center gap-1.5 group"
                  >
                    <Zap className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-accent" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="lg:col-span-3">
            <h3 className="text-text font-bold mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-warning" />
              Company
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted hover:text-warning transition-colors inline-flex items-center gap-1.5 group"
                  >
                    <Zap className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-warning" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/30">
                <span className="text-xs font-semibold text-primary">v2.0</span>
              </div>
              <p className="text-sm text-muted">
                © {currentYear} CyberVerse. All rights reserved.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted">
              <a href="mailto:contact@cyberverse.com" className="hover:text-primary transition-colors flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                Contact Us
              </a>
              <span className="text-white/20">|</span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-primary" />
                Built with 💚 by Badshah Jan and Yasir Hussain
              </span>
            </div>
          </div>
        </div>

        {/* Achievement Badge - Gamified Element */}
        <div className="mt-6 flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-primary/30 hover:border-primary/50 transition-all group cursor-default">
            <Award className="w-4 h-4 text-primary group-hover:rotate-12 transition-transform" />
            <span className="text-xs font-semibold gradient-text">Secured by Industry Experts</span>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`w-1 h-4 rounded-full bg-primary transition-all delay-${i * 100} group-hover:h-6`}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer