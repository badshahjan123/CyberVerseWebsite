import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Award, Crown, Menu, X, Search, Shield, Flame, Zap, Trophy, LogOut, Swords, Star, Target } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import { useApp } from '../contexts/app-context';
import { API_BASE_URL } from '../config/api';
import SearchModal from './SearchModal';
import ProfileDropdown from './ProfileDropdown';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useApp();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [streak, setStreak] = useState(0); // User's current streak

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Global keyboard shortcut for search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setIsSearchOpen(true);
      }
    };
    
    if (isAuthenticated) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isAuthenticated]);

  // Fetch user streak
  useEffect(() => {
    const fetchStreak = async () => {
      if (isAuthenticated && user) {
        try {
          const token = localStorage.getItem('token')
          const response = await fetch('http://localhost:5000/api/user/streak', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          if (response.ok) {
            const data = await response.json()
            setStreak(data.streak || 0)
          }
        } catch (error) {
          console.error('Failed to fetch streak:', error)
        }
      }
    }
    fetchStreak()
  }, [isAuthenticated, user])

  const navLinks = [
    { to: "/dashboard", text: "Dashboard" },
    { to: "/labs", text: "Labs" },
    { to: "/rooms", text: "Rooms" },
    { to: "/leaderboard", text: "Leaderboard" },
    { to: "/premium", text: "Premium" },
  ];

  return (
    <>
      <nav className={`navbar sticky top-0 z-50 px-4 sm:px-6 lg:px-8 transition-all duration-300 ${scrolled ? 'shadow-lg' : ''}`}>
        <div className="container mx-auto flex items-center justify-between h-16">
          {/* Logo with Icon */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 group-hover:border-primary/50 transition-all">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:inline">CyberVerse</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${isActive
                    ? 'text-primary bg-primary/10 border border-primary/20'
                    : 'text-muted hover:text-text hover:bg-white/5'
                  }`
                }
              >
                {link.text}
              </NavLink>
            ))}
            {isAuthenticated && (
              <NavLink
                to="/certificates"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${isActive
                    ? 'text-primary bg-primary/10 border border-primary/20'
                    : 'text-muted hover:text-text hover:bg-white/5'
                  }`
                }
              >
                <Award size={16} /> Certificates
              </NavLink>
            )}
          </div>

          {/* Auth Buttons & Profile */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-all border border-white/10"
                  title="Search (Ctrl+K)"
                >
                  <Search size={16} />
                  <span className="hidden lg:inline text-sm">Search</span>
                  <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-xs bg-white/10 rounded border border-white/20">⌘K</kbd>
                </button>

                <NotificationDropdown />

                {/* Streak Counter */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                  <Flame size={18} className="text-green-500" />
                  <span className="text-sm font-bold text-text">{streak}</span>
                </div>

                {/* Go Premium Button */}
                {!user?.isPremium && (
                  <Link
                    to="/premium"
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all shadow-lg shadow-green-600/20"
                  >
                    <Crown size={16} />
                    <span className="hidden lg:inline">Go Premium</span>
                  </Link>
                )}

                {/* Profile Dropdown */}
                <ProfileDropdown user={user} onLogout={logout} />
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm px-5 py-2 rounded-lg">Log In</Link>
                <Link to="/signup" className="btn-primary text-sm">Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-muted hover:text-primary transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden glass-effect border-t border-white/10 absolute top-16 left-0 w-full shadow-xl">
            <div className="flex flex-col p-4 space-y-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-lg text-base font-semibold transition-all ${isActive
                      ? 'text-primary bg-primary/10 border border-primary/20'
                      : 'text-muted hover:text-text hover:bg-white/5'
                    }`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  {link.text}
                </NavLink>
              ))}
              {isAuthenticated && (
                <NavLink
                  to="/certificates"
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-lg text-base font-semibold transition-all flex items-center gap-2 ${isActive
                      ? 'text-primary bg-primary/10 border border-primary/20'
                      : 'text-muted hover:text-text hover:bg-white/5'
                    }`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  <Award size={18} /> Certificates
                </NavLink>
              )}

              <div className="border-t border-white/10 my-2"></div>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    <img
                      src={user?.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${API_BASE_URL}${user.avatar}?t=${user?.avatarTimestamp || Date.now()}`) : `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name}`}
                      alt="avatar"
                      className="w-10 h-10 rounded-full border-2 border-primary/50 object-cover"
                      key={`${user?.avatar}-${user?.avatarTimestamp}`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-text">{user?.name}</span>
                        {user?.isPremium && <Crown size={16} className="text-warning" />}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                        <span className="flex items-center gap-1">
                          <Zap size={12} className="text-warning" /> Lvl {user?.level || 1}
                        </span>
                        <span className="flex items-center gap-1">
                          <Trophy size={12} className="text-primary" /> {user?.points || 0} pts
                        </span>
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={() => { logout(); setIsOpen(false); }}
                    className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-danger hover:bg-danger/10 font-semibold transition-all"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-2">
                  <Link to="/login" className="btn-ghost text-center py-3 rounded-lg" onClick={() => setIsOpen(false)}>Log In</Link>
                  <Link to="/signup" className="btn-primary text-center py-3" onClick={() => setIsOpen(false)}>Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Navbar;