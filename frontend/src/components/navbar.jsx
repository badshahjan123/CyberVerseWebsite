import React, { useState, useEffect, useRef } from "react";
import "./navbar.css";
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
import ThemeToggle from "./ThemeToggle";

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
      <Zap
        size={12}
        className={
          displayValue !== value
            ? "text-yellow-400 animate-pulse"
            : "text-yellow-400"
        }
      />
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
    <div
      className={`cv-stat-chip ${pulse ? "cv-stat-level-up" : ""}`}
      title="Level"
    >
      <Trophy
        size={12}
        className={pulse ? "text-primary animate-bounce" : "text-primary"}
      />
      <span
        className={pulse ? "text-white scale-110 transition-transform" : ""}
      >
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
    isPremium: userStats?.isPremium ?? user?.isPremium ?? false,
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-slate-950/95 border-b border-slate-800/80 shadow-2xl shadow-black/50"
            : "bg-slate-950/80 border-b border-slate-800/50"
        } backdrop-blur-xl`}
      >
        <div className="w-full px-6">
          <div className="flex items-center justify-between h-16 gap-6">
            {/* Left: Logo */}
            <Link
              to="/"
              className="flex items-center gap-3 flex-shrink-0 group"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500/20 blur-lg group-hover:bg-cyan-500/30 transition-all duration-300"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <Shield size={20} className="text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-white">
                  CYBER<span className="text-cyan-400">VERSE</span>
                </span>
                <span className="text-[9px] font-bold tracking-widest text-slate-500 uppercase">
                  Security Platform
                </span>
              </div>
            </Link>

            {/* Center: Navigation Links */}
            <div className="hidden md:flex items-center justify-center flex-1 gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `relative px-4 py-2 text-sm font-semibold transition-all duration-200 rounded-lg ${
                      isActive
                        ? "text-white bg-slate-800/60"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className="relative z-10">{link.text}</span>
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-cyan-500/5 to-transparent rounded-lg"></div>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* Right Side: Actions */}
            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              {isAuthenticated ? (
                <>
                  {/* Search */}
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-all duration-200"
                    title="Search (Ctrl+K)"
                  >
                    <Search size={18} strokeWidth={2} />
                  </button>

                  {/* Notifications */}
                  <NotificationDropdown />

                  {/* Theme Toggle */}
                  <ThemeToggle />

                  {/* Stats - Compact */}
                  <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-900/60 border border-slate-800/80 rounded-lg ml-2">
                    <div className="flex items-center gap-1.5" title="Streak">
                      <Flame
                        size={16}
                        className={
                          ud.streak > 0 ? "text-orange-400" : "text-slate-600"
                        }
                        strokeWidth={2}
                      />
                      <span className="text-xs font-bold text-slate-300">
                        {ud.streak}
                      </span>
                    </div>
                    <div className="w-px h-4 bg-slate-700"></div>
                    <div className="flex items-center gap-1.5" title="XP">
                      <Zap
                        size={16}
                        className="text-yellow-400"
                        strokeWidth={2}
                      />
                      <span className="text-xs font-bold text-slate-300 tabular-nums">
                        {(ud.xp || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="w-px h-4 bg-slate-700"></div>
                    <div className="flex items-center gap-1.5" title="Level">
                      <Trophy
                        size={16}
                        className="text-cyan-400"
                        strokeWidth={2}
                      />
                      <span className="text-xs font-bold text-slate-300">
                        {ud.level}
                      </span>
                    </div>
                  </div>

                  {/* Premium */}
                  <Link
                    to="/premium"
                    className="relative px-4 py-2 rounded-lg overflow-hidden group transition-all duration-200 ml-2"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 group-hover:from-yellow-500/20 group-hover:to-orange-500/20 transition-all duration-200"></div>
                    <div className="absolute inset-0 border border-yellow-500/30 group-hover:border-yellow-500/50 rounded-lg transition-all duration-200"></div>
                    <div className="relative flex items-center gap-2">
                      <Crown
                        size={16}
                        className="text-yellow-500"
                        strokeWidth={2}
                      />
                      <span className="text-sm font-bold text-yellow-500">
                        PRO
                      </span>
                    </div>
                  </Link>

                  {/* Profile */}
                  <ProfileDropdown
                    user={{ ...user, ...userStats }}
                    onLogout={logout}
                  />
                </>
              ) : (
                <>
                  <ThemeToggle />
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white transition-all duration-200"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    className="relative px-5 py-2 rounded-lg overflow-hidden group transition-all duration-200"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 group-hover:from-cyan-400 group-hover:to-blue-500 transition-all duration-200"></div>
                    <span className="relative text-sm font-bold text-white">
                      Sign Up
                    </span>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
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
