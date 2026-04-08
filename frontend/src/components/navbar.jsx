import React, { useState, useEffect, useRef } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  Award,
  Crown,
  Menu,
  X,
  Search,
  Shield,
  Flame,
  Zap,
  Trophy,
  LogOut,
  Swords,
  Star,
  Target,
} from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
import { useApp } from "../contexts/app-context";
import { useRealtime } from "../contexts/realtime-context";
import { API_BASE_URL } from "../config/api";
import SearchModal from "./SearchModal";
import ProfileDropdown from "./ProfileDropdown";

// --- Sub-components for Gamified Animations ---
const XPDisplay = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (value === prevValueRef.current) return;
    
    // Simple count-up animation over 1 sec
    const start = prevValueRef.current;
    const end = value;
    const duration = 1000;
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const current = Math.floor(start + (end - start) * progress);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        prevValueRef.current = value;
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <div className="cv-stat-chip" title="Total XP">
      <Zap size={12} className={displayValue !== value ? "text-yellow-400 animate-pulse" : "text-yellow-400"} />
      <span className="tabular-nums">
        {displayValue.toLocaleString()} 
        <span className="text-[10px] text-slate-500 font-bold ml-0.5">XP</span>
      </span>
    </div>
  );
};

const LevelDisplay = ({ level }) => {
  const [pulse, setPulse] = useState(false);
  const prevLevelRef = useRef(level);

  useEffect(() => {
    if (level > prevLevelRef.current) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 2000);
      prevLevelRef.current = level;
      return () => clearTimeout(timer);
    }
  }, [level]);

  return (
    <div className={`cv-stat-chip ${pulse ? "cv-stat-level-up" : ""}`} title="Level">
      <Trophy size={12} className={pulse ? "text-primary animate-bounce" : "text-primary"} />
      <span className={pulse ? "text-white scale-110 transition-transform" : ""}>
        LVL {level}
      </span>
    </div>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useApp();
  const { userStats } = useRealtime();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Global keyboard shortcut for search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        setIsSearchOpen(true);
      }
    };

    if (isAuthenticated) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isAuthenticated]);

  const navLinks = [
    { to: "/dashboard", text: "Dashboard" },
    { to: "/labs", text: "Labs" },
    { to: "/rooms", text: "Rooms" },
    { to: "/leaderboard", text: "Leaderboard" },
    { to: "/certificates", text: "Certificates" },
  ];

  const ud = {
    xp: userStats?.totalXP || user?.points || 0,
    level: userStats?.level || user?.level || 1,
    streak: userStats?.streak || user?.currentStreak || 0,
    rank: userStats?.rank || user?.rank || 999,
    isPremium: userStats?.isPremium ?? user?.isPremium ?? false
  };

  return (
    <>
      <nav
        className={`cv-navbar sticky top-0 z-50 transition-all duration-300 ${scrolled ? "cv-navbar-scrolled" : ""}`}
      >
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="cv-logo-shield">
              <Shield size={18} className="text-primary" />
            </div>
            <span className="cv-logo-text">
              <span className="text-primary">C</span>YBERVERSE
            </span>
          </Link>

          {/* Center: Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `cv-nav-link ${isActive ? "cv-nav-link-active" : ""}`
                }
              >
                {link.text}
              </NavLink>
            ))}
          </div>

          {/* Right Side: Status & Profile */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="cv-nav-search-btn"
                  title="Search (Ctrl+K)"
                >
                  <Search size={14} />
                </button>

                <NotificationDropdown />

                {/* Gamified Status Cluster */}
                <div className="cv-stats-cluster">
                  <div className="cv-stat-chip" title="Streak">
                    <Flame size={12} className={ud.streak > 0 ? "text-orange-500 animate-pulse" : "text-slate-500"} />
                    <span>{ud.streak}</span>
                  </div>
                  <div className="cv-stat-divider" />
                  
                  {/* XP Chip with Animated Counter */}
                  <XPDisplay value={ud.xp} />
                  
                  <div className="cv-stat-divider" />
                  
                  {/* Level Chip with Pulse Effect */}
                  <LevelDisplay level={ud.level} />
                </div>

                {/* Premium Outline Button */}
                <Link to="/premium" className="cv-premium-outline-btn">
                  <Crown size={14} className="mr-1.5" />
                  <span>PREMIUM</span>
                </Link>

                {/* Profile Dropdown */}
                <ProfileDropdown user={{ ...user, ...userStats }} onLogout={logout} />
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">
                  LOG IN
                </Link>
                <Link to="/signup" className="cv-premium-outline-btn px-6 ml-2">
                  SIGN UP
                </Link>
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
          <div className="md:hidden border-t border-white/10 absolute top-16 left-0 w-full shadow-xl bg-[rgb(8,12,16)] backdrop-blur-xl">
            <div className="flex flex-col p-4 space-y-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-lg text-base font-semibold transition-all ${
                      isActive
                        ? "text-primary bg-primary/10 border border-primary/20"
                        : "text-muted hover:text-text hover:bg-white/5"
                    }`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  {link.text}
                </NavLink>
              ))}

              <div className="border-t border-white/10 my-2"></div>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      user?.isPremium
                        ? "bg-gradient-to-r from-yellow-600/10 to-orange-600/10 border border-yellow-600/30 hover:border-yellow-600/50"
                        : "bg-white/5 hover:bg-white/10"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="relative">
                      <img
                        src={
                          user?.avatar
                            ? user.avatar.startsWith("http")
                              ? user.avatar
                              : `http://localhost:5000${user.avatar}?t=${user?.avatarTimestamp || Date.now()}`
                            : `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name}`
                        }
                        alt="avatar"
                        className={`w-10 h-10 rounded-full object-cover ${
                          user?.isPremium
                            ? "border-2 border-yellow-400"
                            : "border-2 border-primary/50"
                        }`}
                        key={`${user?.avatar}-${user?.avatarTimestamp}`}
                      />
                      {user?.isPremium && (
                        <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5">
                          <Crown size={10} className="text-slate-900" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-text">
                          {user?.name}
                        </span>
                        {ud.isPremium && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-400/20 border border-yellow-400/30 rounded-full">
                            <Crown size={12} className="text-yellow-400" />
                            <span className="text-xs font-bold text-yellow-400">
                              PRO
                            </span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                        <span className="flex items-center gap-1">
                          <Zap size={12} className="text-warning" /> Lvl{" "}
                          {ud.level}
                        </span>
                        <span className="flex items-center gap-1">
                           <Flame size={12} className="text-orange-500" />{" "}
                           {ud.streak}d
                        </span>
                        <span className="flex items-center gap-1">
                          <Trophy size={12} className="text-primary" />{" "}
                          {(ud.xp || 0).toLocaleString()} pts
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Go Premium Button for non-premium users in mobile */}
                  {!user?.isPremium && (
                    <Link
                      to="/premium"
                      className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all shadow-lg text-center justify-center"
                      onClick={() => setIsOpen(false)}
                    >
                      <Crown size={18} />
                      <span>Go Premium</span>
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-danger hover:bg-danger/10 font-semibold transition-all"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-2">
                  <Link
                    to="/login"
                    className="btn-ghost text-center py-3 rounded-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    className="btn-primary text-center py-3"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
};

export default Navbar;
