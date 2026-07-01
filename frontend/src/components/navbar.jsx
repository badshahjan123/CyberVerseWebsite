import React, { useState, useEffect } from "react";
import "./navbar.css";
import { NavLink, Link, useLocation } from "react-router-dom";
import {
  Menu, X, Search, Shield, Bell,
  Flame, Zap, Trophy, Crown, Users
} from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
import { useApp } from "../contexts/app-context";
import { useRealtime } from "../contexts/realtime-context";
import SearchModal from "./SearchModal";
import ProfileDropdown from "./ProfileDropdown";
import { getAvatarUrl } from "../config/api";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useApp();
  const { userStats } = useRealtime();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(1342);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Simulate subtle real-time fluctuations of online hackers
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineUsers(prev => prev + Math.floor(Math.random() * 7) - 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setIsOpen(false) }, [location.pathname]);

  const ud = {
    xp: userStats?.totalXP || user?.points || 0,
    level: userStats?.level || user?.level || 1,
    streak: userStats?.streak || user?.currentStreak || 0,
    isPremium: userStats?.isPremium ?? user?.isPremium ?? false,
  };

  const navLinks = [
    { to: "/dashboard", text: "Dashboard" },
    { to: "/labs", text: "Labs" },
    { to: "/rooms", text: "Rooms" },
    { to: "/leaderboard", text: "Leaderboard" },
    { to: "/certificates", text: "Certificates" },
  ];

  if (!ud.isPremium) {
    navLinks.push({ to: "/premium", text: "Premium" });
  }

  return (
    <>
      <nav className={`cv-navbar-matte ${scrolled ? "scrolled" : ""}`}>
        <div className="cv-nav-container">

          {/* Logo with cyber glow */}
          <div className="cv-nav-left">
            <Link to="/" className="cv-nav-logo group">
              <Shield size={22} className="text-cyan-400 group-hover:rotate-[15deg] transition-transform duration-300" strokeWidth={2.5} style={{ filter: "drop-shadow(0 0 6px #00d1ff)" }} />
              <div className="flex items-baseline font-mono font-black tracking-widest text-white">
                CYBER<span className="text-cyan-400" style={{ textShadow: "0 0 10px rgba(0,209,255,0.5)" }}>VERSE</span>
              </div>
            </Link>
          </div>

          {/* Center Nav Links */}
          <div className="cv-nav-links">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `cv-nav-link-item ${isActive ? "active font-bold" : "hover:text-white"}`
                }
              >
                {link.text}
              </NavLink>
            ))}
          </div>

          {/* Right Section containing profile details, telemetry, actions */}
          <div className="cv-nav-right">
            {isAuthenticated ? (
              <>
                <div className="cv-nav-search-wrapper">
                  <Search size={14} className="text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search operations..."
                    className="cv-nav-search-input"
                    onFocus={() => setIsSearchOpen(true)}
                  />
                </div>

                {/* Cyber telemetry stats inside navbar */}
                <div className="cv-nav-stats">
                  <div className="cv-nav-stat-item hidden sm:flex" title="Streak">
                    <Flame size={14} className={ud.streak > 0 ? "text-orange-500" : "text-slate-600"} style={{ filter: ud.streak > 0 ? "drop-shadow(0 0 4px #ff6b00)" : "none" }} />
                    <span className="font-mono">{ud.streak}</span>
                  </div>
                  <div className="cv-nav-stat-item hidden sm:flex" title="XP">
                    <Zap size={14} className="text-yellow-400" style={{ filter: "drop-shadow(0 0 4px #facc15)" }} />
                    <span className="font-mono">{ud.xp.toLocaleString()}</span>
                  </div>
                  <div className="cv-nav-stat-item hidden sm:flex" title="Level">
                    <Trophy size={14} className="text-cyan-400" style={{ filter: "drop-shadow(0 0 4px #00d1ff)" }} />
                    <span className="font-mono">Lv.{ud.level}</span>
                  </div>

                  {/* Real-time online users counter inside navbar */}
                  <div className="cv-nav-stat-item pl-3 border-l border-white/[0.08] hidden md:flex items-center gap-1.5" title="Active Platform Operators">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-green-400 font-mono font-bold text-[10px] tracking-widest">{onlineUsers.toLocaleString()} ONLINE</span>
                  </div>
                </div>

                {ud.isPremium && (
                  <Link to="/premium" className="cv-nav-pro-badge">
                    <Crown size={12} className="text-yellow-500 fill-yellow-500" /><span>PRO</span>
                  </Link>
                )}

                <NotificationDropdown />

                <ProfileDropdown
                  user={{ ...user, ...userStats }}
                  onLogout={logout}
                  trigger={
                    <div className="cv-nav-avatar-btn">
                      <img
                        src={getAvatarUrl(user?.avatar, user?.name, user?.avatarTimestamp)}
                        alt="avatar"
                      />
                    </div>
                  }
                />
              </>
            ) : (
              <div className="flex items-center gap-4">
                {/* Live Online Users for unauthenticated visitors */}
                <div className="hidden lg:flex items-center gap-1.5 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20 mr-2">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                  </span>
                  <span className="text-green-400 font-mono text-[9px] font-black tracking-widest">{onlineUsers.toLocaleString()} OPERATORS</span>
                </div>
                
                <Link to="/login" className="cv-nav-link-item hover:text-white transition-colors font-semibold">Log In</Link>
                <Link
                  to="/signup"
                  className="cv-nav-signup-btn font-black tracking-wider text-xs"
                >
                  SIGN UP
                </Link>
              </div>
            )}

            <button className="cv-mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="cv-mobile-menu-overlay">
          <div className="cv-mobile-menu-content">
            <nav className="cv-mobile-nav-links">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `cv-mobile-nav-link ${isActive ? "active" : ""}`
                  }
                >
                  {link.text}
                </NavLink>
              ))}
            </nav>
            
            {!isAuthenticated && (
              <div className="cv-mobile-auth-section">
                <Link to="/login" className="cv-mobile-login-btn">Log In</Link>
                <Link to="/signup" className="cv-mobile-signup-btn">SIGN UP</Link>
              </div>
            )}
          </div>
        </div>
      )}

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Navbar;
