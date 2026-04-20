import React, { useState, useEffect } from "react";
import "./navbar.css";
import { NavLink, Link, useLocation } from "react-router-dom";
import {
  Menu, X, Search, Shield, Bell,
  Flame, Zap, Trophy, Crown
} from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
import { useApp } from "../contexts/app-context";
import { useRealtime } from "../contexts/realtime-context";
import SearchModal from "./SearchModal";
import ProfileDropdown from "./ProfileDropdown";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useApp();
  const { userStats } = useRealtime();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setIsOpen(false) }, [location.pathname]);

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
    isPremium: userStats?.isPremium ?? user?.isPremium ?? false,
  };

  return (
    <>
      <nav className={`cv-navbar-matte ${scrolled ? "scrolled" : ""}`}>
        <div className="cv-nav-container">

          {/* Logo */}
          <div className="cv-nav-left">
            <Link to="/" className="cv-nav-logo">
              <Shield size={22} className="text-cyan-400" strokeWidth={2.5} />
              <div className="flex items-baseline">
                CYBER<span className="text-cyan-400">VERSE</span>
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
                  `cv-nav-link-item ${isActive ? "active" : ""}`
                }
              >
                {link.text}
              </NavLink>
            ))}
          </div>

          {/* Right */}
          <div className="cv-nav-right">
            {isAuthenticated ? (
              <>
                <div className="cv-nav-search-wrapper">
                  <Search size={14} className="text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="cv-nav-search-input"
                    onFocus={() => setIsSearchOpen(true)}
                  />
                </div>

                <div className="cv-nav-stats">
                  <div className="cv-nav-stat-item" title="Streak">
                    <Flame size={14} className={ud.streak > 0 ? "text-orange-500" : "text-slate-600"} />
                    <span>{ud.streak}</span>
                  </div>
                  <div className="cv-nav-stat-item" title="XP">
                    <Zap size={14} className="text-yellow-400" />
                    <span>{ud.xp.toLocaleString()}</span>
                  </div>
                  <div className="cv-nav-stat-item" title="Level">
                    <Trophy size={14} className="text-cyan-400" />
                    <span>Lv.{ud.level}</span>
                  </div>
                </div>

                {ud.isPremium && (
                  <Link to="/premium" className="cv-nav-pro-badge">
                    <Crown size={12} /><span>PRO</span>
                  </Link>
                )}

                <NotificationDropdown />

                <ProfileDropdown
                  user={{ ...user, ...userStats }}
                  onLogout={logout}
                  trigger={
                    <div className="cv-nav-avatar-btn">
                      <img
                        src={
                          user?.avatar
                            ? user.avatar.startsWith("http")
                              ? user.avatar
                              : `http://localhost:5000${user.avatar}?t=${user?.avatarTimestamp || Date.now()}`
                            : `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name}`
                        }
                        alt="avatar"
                      />
                    </div>
                  }
                />
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="cv-nav-link-item">Log In</Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-cyan-500 text-slate-950 text-xs font-bold rounded hover:bg-cyan-400 transition-colors"
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

        {/* Mobile Menu */}
        {isOpen && (
          <div className="fixed inset-0 top-[64px] bg-[#060912] z-50 p-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-lg font-bold transition-colors ${isActive ? "text-cyan-400" : "text-slate-400"}`
                }
              >
                {link.text}
              </NavLink>
            ))}
            {!isAuthenticated && (
              <div className="flex flex-col gap-3 mt-4">
                <Link to="/login" className="text-white font-bold">Login</Link>
                <Link to="/signup" className="p-3 bg-cyan-500 text-center font-bold text-slate-950 rounded">Sign Up</Link>
              </div>
            )}
          </div>
        )}
      </nav>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Navbar;
