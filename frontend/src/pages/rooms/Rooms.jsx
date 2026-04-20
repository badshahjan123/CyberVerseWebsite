import { useState, useMemo, memo, useCallback, useEffect, useRef } from "react";
import {
  Users, Zap, Filter, Clock, Crown, Search, ChevronDown, Flame,
  Trophy, X, Play, BookOpen, TrendingUp, Bookmark, BookmarkCheck,
  SlidersHorizontal, Shield, Target, ChevronLeft, ChevronRight,
  CheckCircle2, RotateCcw, ArrowRight, Grid, List, Globe, Terminal,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getRooms } from "../../services/rooms";
import { useBookmarks } from "../../contexts/bookmark-context";
import { useApp } from "../../contexts/app-context";
import { ProtectedRoute } from "../../components/protected-route";
import "./Rooms.css";

/* ══════ Difficulty config ══════ */
const DIFF = {
  Beginner:     { color: "#39FF14", bars: 1 },
  Easy:         { color: "#39FF14", bars: 1 },
  Intermediate: { color: "#F59E0B", bars: 2 },
  Medium:       { color: "#F59E0B", bars: 2 },
  Advanced:     { color: "#EF4444", bars: 3 },
  Hard:         { color: "#EF4444", bars: 3 },
  Insane:       { color: "#B91C1C", bars: 4 },
};
const getDiff = (d) => DIFF[d] || { color: "#94A3B8", bars: 2 };
const DIFFICULTY_POINTS = { Beginner: 100, Easy: 100, Intermediate: 175, Medium: 175, Advanced: 250, Hard: 250, Insane: 250 };
const getPoints = (d) => DIFFICULTY_POINTS[d] || 100;

/* ── Difficulty signal bars ── */
const DiffBars = memo(({ level }) => {
  const dm = getDiff(level);
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-end gap-[2px]">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              width: 3, height: 6 + i * 3, borderRadius: 1,
              background: i <= dm.bars ? dm.color : "rgba(255,255,255,0.1)",
              transition: "background 0.2s",
            }}
          />
        ))}
      </div>
      <span className="text-xs font-bold" style={{ color: dm.color }}>
        {level}
      </span>
    </div>
  );
});
DiffBars.displayName = "DiffBars";

/* ══════ Category config ══════ */
const CAT_META = {
  Web:                 { icon: <Globe size={12} />,    color: "#00D1FF" },
  Networking:          { icon: <Shield size={12} />,   color: "#A855F7" },
  Development:         { icon: <Zap size={12} />,      color: "#88E636" },
  DevOps:              { icon: <Target size={12} />,   color: "#FFB800" },
  Misc:                { icon: <Trophy size={12} />,   color: "#FF6B00" },
  System:              { icon: <Terminal size={12} />, color: "#00D1FF" },
  Recon:               { icon: <Target size={12} />,   color: "#A855F7" },
  Crypto:              { icon: <Shield size={12} />,   color: "#FFB800" },
  "Reverse Engineering":{ icon: <Zap size={12} />,     color: "#EF4444" },
  Advanced:            { icon: <Flame size={12} />,    color: "#EF4444" },
};
const getCat = (c) => CAT_META[c] || { icon: <BookOpen size={12} />, color: "#64748B" };

/* ── Placeholder images ── */
const CAT_IMG = {
  Web: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=600",
  Networking: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=600",
  Development: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=600",
  DevOps: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?auto=format&fit=crop&q=80&w=600",
  Misc: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=600",
};
const FALLBACK_IMG = "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800";
const getRoomImg = (c) => CAT_IMG[c] || FALLBACK_IMG;

/* ── Local rooms ── */
const LOCAL_ROOMS = [
  {
    _id: "local-web-app-pentesting", id: "local-web-app-pentesting",
    slug: "web-app-pentesting", title: "Web App Pentesting Mastery",
    short_description: "Learn how real hackers identify, analyze, and exploit vulnerabilities in web applications using industry tools and techniques.",
    category: "Web", difficulty: "Advanced", estimated_time_minutes: 90, points: 250,
    tags: ["web-security", "pentesting", "owasp", "sql-injection", "xss"],
    topics: Array(5).fill(null), cover_image_url: "/images/rooms/attack-surface.png",
    subscriberOnly: false, isPremium: false, completedBy: Array(4827).fill(null),
    createdAt: "2026-03-26T00:00:00.000Z", customRoute: "/rooms/web-app-pentesting", isLocal: true,
  },
  {
    _id: "local-rest-api-mastery", id: "local-rest-api-mastery",
    slug: "rest-api-mastery", title: "Introduction to RESTful APIs",
    short_description: "Master the basics of REST APIs, HTTP methods, status codes, and JSON data structures.",
    category: "Development", difficulty: "Beginner", estimated_time_minutes: 40, points: 100,
    tags: ["api", "rest", "backend", "http", "express"], topics: Array(5).fill(null),
    cover_image_url: "/images/rooms/api-intro.png", completedBy: Array(4827).fill(null),
    createdAt: "2026-03-26T00:00:00.000Z", customRoute: "/rooms/rest-api-mastery", isLocal: true,
  },
  {
    _id: "local-networking-fundamentals", id: "local-networking-fundamentals",
    slug: "networking-fundamentals", title: "Networking Fundamentals",
    short_description: "Learn the core concepts of networking: OSI model, IP addressing, TCP/UDP, and routing.",
    category: "Networking", difficulty: "Beginner", estimated_time_minutes: 60, points: 100,
    tags: ["networking", "osi-model", "tcp-ip", "routing", "dns"], topics: Array(5).fill(null),
    cover_image_url: "/images/rooms/osi-model.png", completedBy: Array(1250).fill(null),
    createdAt: "2026-03-26T00:00:00.000Z", customRoute: "/rooms/networking-fundamentals", isLocal: true,
  },
  {
    _id: "local-sql-injection-fundamentals", id: "local-sql-injection-fundamentals",
    slug: "sql-injection-fundamentals", title: "SQL Injection Fundamentals",
    short_description: "Learn how SQL Injection works and how attackers bypass authentication and extract data from databases.",
    category: "Web", difficulty: "Beginner", estimated_time_minutes: 50, points: 100,
    tags: ["sqli", "database", "web-security", "injection"], topics: Array(4).fill(null),
    cover_image_url: "/images/rooms/sqli.png", completedBy: Array(2100).fill(null),
    createdAt: "2026-04-13T00:00:00.000Z", customRoute: "/rooms/sql-injection-fundamentals", isLocal: true,
  },
  {
    _id: "local-linux-fundamentals", id: "local-linux-fundamentals",
    slug: "linux-fundamentals", title: "Linux Fundamentals",
    short_description: "Master the Linux command line, manage file systems, control user permissions, and handle system level processes like a pro.",
    category: "System", difficulty: "Intermediate", estimated_time_minutes: 60, points: 175,
    tags: ["linux", "terminal", "sysadmin", "system-security"], topics: Array(5).fill(null),
    cover_image_url: "/images/rooms/linux.png", completedBy: Array(1800).fill(null),
    createdAt: "2026-04-13T00:00:00.000Z", customRoute: "/rooms/linux-fundamentals", isLocal: true,
  },
  {
    _id: "local-authentication-session-attacks", id: "local-authentication-session-attacks",
    slug: "authentication-session-attacks", title: "Authentication & Session Attacks",
    short_description: "Master the dark side of authentication. From hijacking sessions to manipulating JWT signatures and bypassing MFA.",
    category: "Web", difficulty: "Advanced", estimated_time_minutes: 90, points: 250,
    tags: ["auth", "sessions", "jwt", "oauth", "mfa-bypass"], topics: Array(5).fill(null),
    cover_image_url: "/images/rooms/auth/task1.png", completedBy: Array(1650).fill(null),
    createdAt: "2026-04-13T00:00:00.000Z", customRoute: "/rooms/authentication-session-attacks", isLocal: true,
  },
  {
    _id: "local-osint-investigation", id: "local-osint-investigation",
    slug: "osint-investigation", title: "OSINT Investigation",
    short_description: "Deep dive into Open Source Intelligence. Learn to map digital footprints, exploit search engine dorks, and uncover hidden infrastructure.",
    category: "Recon", difficulty: "Advanced", estimated_time_minutes: 60, points: 250,
    tags: ["osint", "recon", "investigation", "social-engineering"], topics: Array(5).fill(null),
    cover_image_url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
    completedBy: Array(1200).fill(null), createdAt: "2026-04-13T00:00:00.000Z",
    customRoute: "/rooms/osint-investigation", isLocal: true,
  },
  {
    _id: "local-python-pickle-deserialization", id: "local-python-pickle-deserialization",
    slug: "python-pickle-deserialization", title: "Python Pickle Exploitation",
    short_description: "Master the dark art of insecure deserialization. Learn how Python's Pickle module can be weaponized into a full system compromise.",
    category: "Advanced", difficulty: "Advanced", estimated_time_minutes: 70, points: 250,
    tags: ["pickle", "deserialization", "python", "rce"], topics: Array(5).fill(null),
    cover_image_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800",
    completedBy: Array(950).fill(null), createdAt: "2026-04-13T00:00:00.000Z",
    customRoute: "/rooms/python-pickle-deserialization", isLocal: true,
  },
  {
    _id: "local-cryptography-basics", id: "local-cryptography-basics",
    slug: "cryptography-basics", title: "Cryptography & Hashing",
    short_description: "Master the fundamental pillars of digital security. Learn how to encrypt data, securely hash passwords, and understand key management.",
    category: "Crypto", difficulty: "Intermediate", estimated_time_minutes: 60, points: 175,
    tags: ["crypto", "hashing", "encryption"], topics: Array(5).fill(null),
    cover_image_url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
    completedBy: Array(1400).fill(null), createdAt: "2026-04-13T00:00:00.000Z",
    customRoute: "/rooms/cryptography-basics", isLocal: true,
  },
  {
    _id: "local-reverse-engineering-basics", id: "local-reverse-engineering-basics",
    slug: "reverse-engineering-basics", title: "Reverse Engineering Basics",
    short_description: "Peel back the layers of compiled software. Learn how to disassemble binaries, analyze machine instructions, and uncover hidden program logic.",
    category: "Reverse Engineering", difficulty: "Advanced", estimated_time_minutes: 75, points: 250,
    tags: ["reverse", "binary", "analysis", "malware"], topics: Array(5).fill(null),
    cover_image_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800",
    completedBy: Array(800).fill(null), createdAt: "2026-04-13T00:00:00.000Z",
    customRoute: "/rooms/reverse-engineering-basics", isLocal: true,
  },
];

/* ── Image with fallback ── */
const RoomImg = memo(({ src, category, alt, className }) => {
  const [imgSrc, setImgSrc] = useState(src || getRoomImg(category));
  const fallbacks = [getRoomImg(category), FALLBACK_IMG];
  const fallbackIdx = useRef(0);
  useEffect(() => { setImgSrc(src || getRoomImg(category)); fallbackIdx.current = 0; }, [src, category]);
  const handleError = () => {
    const next = fallbacks[fallbackIdx.current];
    if (next && next !== imgSrc) { fallbackIdx.current++; setImgSrc(next); }
  };
  return <img src={imgSrc} alt={alt} onError={handleError} className={className} loading="lazy" />;
});
RoomImg.displayName = "RoomImg";

/* ══════ Room Card — premium redesign matching Labs card ══════ */
const RoomCard = memo(({ room, userProgress, isBookmarked, onBookmark }) => {
  const dm = getDiff(room.difficulty);
  const cat = getCat(room.category);
  const prog = userProgress || null;
  const isCompleted = prog?.completed || false;
  const isStarted = prog?.joined || prog?.completedLectures?.length > 0;
  const pct = isCompleted ? 100
    : room.topics?.length > 0 && prog?.completedLectures?.length > 0
      ? Math.round((prog.completedLectures.length / room.topics.length) * 100) : 0;
  const completions = room.completedBy?.length || 0;
  const xp = getPoints(room.difficulty);
  const roomLink = room.customRoute || `/rooms/${room.slug || room._id}`;
  const handleBookmark = (e) => { e.preventDefault(); e.stopPropagation(); onBookmark(room); };

  return (
    <div className={`room-card group relative rounded-2xl overflow-hidden flex flex-col ${isCompleted ? "room-card--completed" : ""}`}>
      {/* Top accent line — difficulty-coded */}
      <div className="room-card__accent-line" style={{ background: dm.color, boxShadow: `0 0 10px ${dm.color}80` }} />

      {/* ── HERO IMAGE ── */}
      <div className="relative overflow-hidden room-card__hero">
        <RoomImg
          src={room.cover_image_url} category={room.category} alt={room.title}
          className="room-card__hero-img"
        />
        <div className="room-card__hero-gradient" />

        {/* Top-left: category + premium chips */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="room-badge room-badge--cat" style={{ color: cat.color, borderColor: `${cat.color}40`, background: `${cat.color}14` }}>
            {cat.icon} {room.category}
          </span>
          {(room.subscriberOnly || room.isPremium) && (
            <span className="room-badge room-badge--premium"><Crown size={8} /> PRO</span>
          )}
        </div>

        {/* Top-right: status + bookmark */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {isCompleted && (
            <span className="room-badge room-badge--completed"><CheckCircle2 size={8} /> Done</span>
          )}
          <button className={`room-bookmark-btn ${isBookmarked ? "room-bookmark-btn--active" : ""}`} onClick={handleBookmark}>
            {isBookmarked ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
          </button>
        </div>

        {/* Title + difficulty overlaid at bottom */}
        <div className="room-card__hero-title-block">
          <h3 className="room-card__title">{room.title}</h3>
          <DiffBars level={room.difficulty} />
        </div>

        {/* Hover CTA — slides up */}
        <div className="room-card__hover-overlay">
          {isCompleted ? (
            <Link to={roomLink} className="room-hover-cta room-hover-cta--completed">
              <RotateCcw size={14} /> Replay Room
            </Link>
          ) : (
            <Link to={roomLink} className="room-hover-cta room-hover-cta--enter">
              <Play size={14} /> {isStarted ? "Resume" : "Enter Room"}
            </Link>
          )}
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="room-card__body">
        <p className="room-card__desc">{room.short_description}</p>

        {/* Stat pills */}
        <div className="room-card__stat-row">
          <span className="room-stat-pill"><Clock size={10} /> {room.estimated_time_minutes || "—"}m</span>
          <span className="room-stat-pill"><Users size={10} /> {completions}</span>
          {room.topics?.length > 0 && (
            <span className="room-stat-pill"><BookOpen size={10} /> {room.topics.length} topics</span>
          )}
          <span className="room-stat-pill room-stat-pill--xp"><Zap size={10} /> {xp} XP</span>
        </div>

        {/* Progress bar */}
        {pct > 0 && !isCompleted && (
          <div className="room-card__progress">
            <div className="room-card__progress-labels">
              <span>Progress</span>
              <span className="room-text-cyan">{pct}%</span>
            </div>
            <div className="room-progress-track">
              <div className="room-progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
RoomCard.displayName = "RoomCard";

/* ══════ Room Row (list mode) ══════ */
const RoomRow = memo(({ room, userProgress, isBookmarked, onBookmark }) => {
  const dm = getDiff(room.difficulty);
  const cat = getCat(room.category);
  const prog = userProgress || null;
  const isCompleted = prog?.completed || false;
  const isStarted = prog?.joined || prog?.completedLectures?.length > 0;
  const xp = getPoints(room.difficulty);
  const roomLink = room.customRoute || `/rooms/${room.slug || room._id}`;
  const handleBookmark = (e) => { e.preventDefault(); e.stopPropagation(); onBookmark(room); };

  return (
    <div className={`room-row group flex items-center gap-4 p-3 rounded-xl ${isCompleted ? "room-row--completed" : ""}`}>
      <div className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0" style={{ background: "#060d1a" }}>
        <RoomImg src={room.cover_image_url} category={room.category} alt={room.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-60 group-hover:opacity-90" />
      </div>

      <div className="flex-1 flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="room-card__title text-[13px] line-clamp-1">{room.title}</h3>
          {isCompleted && (
            <span className="room-badge room-badge--completed room-badge--sm"><CheckCircle2 size={8} /> Done</span>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <DiffBars level={room.difficulty} />
          <span className="text-[10px] font-bold" style={{ color: cat.color }}>{room.category}</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-500 font-semibold">
          <span className="flex items-center gap-1"><Clock size={10} /> {room.estimated_time_minutes || "—"}m</span>
          <span className="flex items-center gap-1"><Users size={10} /> {room.completedBy?.length || 0}</span>
          <span className="room-stat-pill room-stat-pill--xp"><Zap size={10} /> {xp} XP</span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button className={`room-bookmark-btn ${isBookmarked ? "room-bookmark-btn--active" : ""}`} onClick={handleBookmark}>
          {isBookmarked ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
        </button>
        {isCompleted ? (
          <Link to={roomLink} className="room-cta-btn room-cta-btn--completed room-cta-btn--sm">
            <RotateCcw size={11} /> Replay
          </Link>
        ) : (
          <Link to={roomLink} className="room-cta-btn room-cta-btn--enter room-cta-btn--sm">
            <Play size={11} /> {isStarted ? "Resume" : "Enter"}
          </Link>
        )}
      </div>
    </div>
  );
});
RoomRow.displayName = "RoomRow";

/* ══════ Main Rooms Page ══════ */
const Rooms = memo(() => {
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { user } = useApp();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("popular");
  const [mobileOpen, setMobileOpen] = useState(false);
  const searchTimer = useRef(null);

  const [filters, setFilters] = useState({
    search: "", subscription: "all", category: "all", difficulties: [], tags: [],
  });

  const userProgress = useMemo(() => {
    const m = {};
    if (!user?.roomProgress) return m;
    user.roomProgress.forEach((p) => { m[p.roomId] = p; });
    return m;
  }, [user?.roomProgress]);

  const fetchRooms = useCallback(
    async (search = filters.search) => {
      setLoading(true); setError(null);
      try {
        const params = {};
        if (filters.category && filters.category !== "all") params.category = filters.category;
        if (filters.difficulties?.length) params.difficulty = filters.difficulties[0];
        const data = await getRooms(params);

        const localSlugs = new Set(LOCAL_ROOMS.map((r) => r.slug));
        const filteredApiRooms = data.filter((r) => {
          // Only exclude rooms whose slugs already exist in LOCAL_ROOMS
          return !localSlugs.has(r.slug);
        });

        const remoteToAdd = filteredApiRooms;
        setRooms([...LOCAL_ROOMS, ...remoteToAdd]);
      } catch (err) {
        console.error("Room fetch error:", err);
        setError("Unable to load rooms. Please try again.");
        setRooms(LOCAL_ROOMS);
      } finally { setLoading(false); }
    },
    [filters.category, filters.difficulties],
  );

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchRooms(filters.search), 350);
    return () => clearTimeout(searchTimer.current);
  }, [filters.search]);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const categories = useMemo(() => {
    const s = new Set(rooms.map((r) => r.category).filter(Boolean));
    return ["all", ...Array.from(s)];
  }, [rooms]);

  const allTags = useMemo(() => {
    const s = new Set();
    rooms.forEach((r) => r.tags?.forEach((t) => s.add(t)));
    return [...s];
  }, [rooms]);

  const filtered = useMemo(
    () => rooms.filter((r) => {
      const s = filters.search.toLowerCase();
      return (
        (!s || r.title?.toLowerCase().includes(s) || r.short_description?.toLowerCase().includes(s)) &&
        (filters.subscription === "all" || (filters.subscription === "free" ? !r.isPremium && !r.subscriberOnly : r.isPremium || r.subscriberOnly)) &&
        (filters.category === "all" || r.category === filters.category) &&
        (!filters.difficulties?.length || filters.difficulties.includes(r.difficulty)) &&
        (!filters.tags?.length || filters.tags.some((t) => r.tags?.includes(t)))
      );
    }), [rooms, filters],
  );

  const sorted = useMemo(() => {
    const a = [...filtered];
    if (sortBy === "popular") return a.sort((x, y) => (y.completedBy?.length || 0) - (x.completedBy?.length || 0));
    if (sortBy === "newest") return a.sort((x, y) => new Date(y.createdAt || 0) - new Date(x.createdAt || 0));
    if (sortBy === "xp") return a.sort((x, y) => (y.points || 0) - (x.points || 0));
    if (sortBy === "duration") return a.sort((x, y) => (x.estimated_time_minutes || 99) - (y.estimated_time_minutes || 99));
    return a;
  }, [filtered, sortBy]);

  const setFilter = useCallback((k, v) => setFilters((p) => ({ ...p, [k]: v })), []);
  const clearAll = useCallback(() => setFilters({ search: "", subscription: "all", category: "all", difficulties: [], tags: [] }), []);

  const activeCount = useMemo(() => {
    let n = 0;
    if (filters.search) n++;
    if (filters.subscription !== "all") n++;
    if (filters.category !== "all") n++;
    n += filters.difficulties?.length || 0;
    n += filters.tags?.length || 0;
    return n;
  }, [filters]);

  const stats = useMemo(() => ({
    total: rooms.length,
    free: rooms.filter((r) => !r.isPremium && !r.subscriberOnly).length,
    completed: Object.values(userProgress).filter((p) => p?.completed).length || user?.completedRooms || 0,
    inProgress: Object.values(userProgress).filter((p) => p?.joined && !p?.completed).length,
  }), [rooms, userProgress, user?.completedRooms]);

  const handleBookmark = useCallback(
    (room) => {
      const id = room.slug || room._id || room.id;
      if (isBookmarked(id, "room")) { removeBookmark(id, "room"); }
      else { addBookmark({ id, slug: room.slug, type: "room", title: room.title, category: room.category, difficulty: room.difficulty }); }
    }, [isBookmarked, addBookmark, removeBookmark],
  );

  const diffChips = [
    { label: "Beginner", cls: "room-chip--easy" },
    { label: "Intermediate", cls: "room-chip--medium" },
    { label: "Advanced", cls: "room-chip--hard" },
    { label: "Insane", cls: "room-chip--insane" },
  ];

  return (
    <ProtectedRoute>
      {/* ═══ PAGE WRAPPER — exact Dashboard background ═══ */}
      <div className="rooms-page min-h-screen text-white relative overflow-x-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none rooms-page__grid" />
        <div className="absolute inset-0 z-0 pointer-events-none rooms-page__overlay" />

        <div className="relative z-10">

          {/* ═══ HERO HEADER ═══ */}
          <div className="relative overflow-hidden rooms-hero">
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="rooms-hero__icon-box">
                      <Shield size={22} className="rooms-icon-cyan" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest rooms-text-cyan">
                      Challenge Rooms
                    </span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
                    Active Rooms
                  </h1>
                  <p className="text-slate-400 text-sm max-w-lg">
                    {loading
                      ? "Loading challenge rooms…"
                      : `${rooms.length} hacking room${rooms.length !== 1 ? "s" : ""} available — learn by doing, not just reading.`}
                  </p>
                </div>

                {/* Stats counters */}
                <div className="flex items-center gap-6">
                  {[
                    { val: stats.total, label: "Rooms", icon: <Shield size={16} /> },
                    { val: stats.free, label: "Free", icon: <Zap size={16} /> },
                    { val: stats.completed, label: "Completed", icon: <CheckCircle2 size={16} /> },
                    { val: stats.inProgress, label: "Active", icon: <Flame size={16} /> },
                  ].map(({ val, label, icon }) => (
                    <div key={label} className="text-center rooms-stat-counter">
                      <div className="flex items-center justify-center gap-1.5 mb-1 rooms-text-cyan">{icon}</div>
                      <p className="text-2xl font-extrabold text-white">{val}</p>
                      <p className="text-xs text-slate-400 whitespace-nowrap">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ═══ CATEGORY TABS ═══ */}
          <div className="rooms-toolbar">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between gap-4 overflow-x-auto">
                <div className="flex items-center gap-0">
                  {categories.map((cat) => {
                    const isActive = filters.category === cat;
                    const meta = cat !== "all" ? getCat(cat) : null;
                    return (
                      <button
                        key={cat}
                        onClick={() => setFilter("category", cat)}
                        className={`rooms-tab ${isActive ? "rooms-tab--active" : ""}`}
                      >
                        {meta && <span style={{ color: isActive ? meta.color : undefined }}>{meta.icon}</span>}
                        {cat === "all" ? "All Rooms" : cat}
                        {isActive && <div className="rooms-tab__indicator" />}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3 py-2">
                  {/* Search */}
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      className="rooms-search-input"
                      placeholder="Search rooms…"
                      value={filters.search}
                      onChange={(e) => setFilter("search", e.target.value)}
                    />
                    {filters.search && (
                      <button
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                        onClick={() => setFilter("search", "")}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <button className="lg:hidden rooms-filter-mobile-btn" onClick={() => setMobileOpen(true)}>
                    <Filter size={14} /> Filters
                    {activeCount > 0 && <span className="rooms-filter-count">{activeCount}</span>}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ FILTER CHIPS + SORT ═══ */}
          <div className="rooms-chipbar">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {["all", "free", "premium"].map((sub) => {
                    const isActive = filters.subscription === sub;
                    return (
                      <button
                        key={sub}
                        onClick={() => setFilter("subscription", sub)}
                        className={`room-chip room-chip--green ${isActive ? "room-chip--active" : ""}`}
                      >
                        {sub === "all" ? "All" : sub === "free" ? "Free" : "Premium"}
                      </button>
                    );
                  })}
                  <div className="rooms-chipbar__divider" />
                  {diffChips.map(({ label, cls }) => {
                    const isActive = filters.difficulties?.includes(label);
                    return (
                      <button
                        key={label}
                        onClick={() => setFilter("difficulties", isActive
                          ? filters.difficulties.filter((x) => x !== label)
                          : [...(filters.difficulties || []), label])}
                        className={`room-chip ${cls} ${isActive ? "room-chip--active" : ""}`}
                      >
                        {label}
                      </button>
                    );
                  })}
                  {activeCount > 0 && (
                    <button onClick={clearAll} className="rooms-clear-btn">
                      <X size={12} /> Clear All
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">
                    {loading ? "Loading…" : `${sorted.length} rooms`}
                  </span>
                  <div className="relative">
                    <select
                      className="rooms-sort-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="popular">Popular</option>
                      <option value="newest">Newest</option>
                      <option value="xp">Highest XP</option>
                      <option value="duration">Shortest</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  </div>
                  <div className="rooms-view-toggle">
                    <button
                      className={`rooms-view-btn ${viewMode === "grid" ? "rooms-view-btn--active" : ""}`}
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid size={14} />
                    </button>
                    <button
                      className={`rooms-view-btn ${viewMode === "list" ? "rooms-view-btn--active" : ""}`}
                      onClick={() => setViewMode("list")}
                    >
                      <List size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ MAIN CONTENT ═══ */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Loading */}
            {loading && (
              <div className={`grid gap-5 ${viewMode === "list" ? "grid-cols-1" : "md:grid-cols-2 lg:grid-cols-3"}`}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rooms-skeleton rounded-2xl overflow-hidden">
                    <div className="h-40 rooms-skeleton__img" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 rounded w-3/4 rooms-skeleton__line" />
                      <div className="h-3 rounded w-full rooms-skeleton__line rooms-skeleton__line--dim" />
                      <div className="h-2 rounded w-1/2 rooms-skeleton__line rooms-skeleton__line--dimmer" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="rooms-empty-state">
                <div className="rooms-empty-state__icon rooms-empty-state__icon--error">
                  <X size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{error}</h3>
                <button className="room-cta-btn room-cta-btn--enter mt-4" onClick={fetchRooms}>
                  Try Again
                </button>
              </div>
            )}

            {/* Empty */}
            {!loading && !error && sorted.length === 0 && (
              <div className="rooms-empty-state">
                <div className="rooms-empty-state__icon">
                  <Target size={40} className="rooms-icon-cyan" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No rooms match your filters</h3>
                <p className="text-slate-400 text-sm mb-4 max-w-md text-center">
                  Try adjusting your search or clearing all filters to see available rooms.
                </p>
                {activeCount > 0 && (
                  <p className="text-xs text-slate-500 mb-4">
                    {activeCount} active filter{activeCount > 1 ? "s" : ""} applied
                  </p>
                )}
                <button className="room-cta-btn room-cta-btn--enter" onClick={clearAll}>
                  Reset Filters
                </button>
              </div>
            )}

            {/* Grid / List */}
            {!loading && !error && sorted.length > 0 && (
              <div className={`grid gap-5 ${viewMode === "list" ? "grid-cols-1" : "md:grid-cols-2 lg:grid-cols-3"}`}>
                {sorted.map((room) => {
                  const prog = userProgress[room.slug] || userProgress[room._id] || null;
                  const bmd = isBookmarked(room.slug || room._id || room.id, "room");
                  return viewMode === "grid" ? (
                    <RoomCard key={room._id || room.id} room={room} userProgress={prog} isBookmarked={bmd} onBookmark={handleBookmark} />
                  ) : (
                    <RoomRow key={room._id || room.id} room={room} userProgress={prog} isBookmarked={bmd} onBookmark={handleBookmark} />
                  );
                })}
              </div>
            )}
          </div>

          {/* ═══ MOBILE FILTER DRAWER ═══ */}
          {mobileOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
              <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm flex flex-col rooms-mobile-drawer">
                <div className="flex items-center justify-between p-5 rooms-mobile-drawer__header">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <SlidersHorizontal size={18} className="rooms-icon-cyan" /> Filters
                  </h2>
                  <button className="p-2 rounded-lg rooms-mobile-drawer__close" onClick={() => setMobileOpen(false)}>
                    <X size={18} className="text-slate-400" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                  <div>
                    <h4 className="text-xs font-bold uppercase text-slate-500 mb-3 tracking-wider">Subscription</h4>
                    <div className="flex flex-wrap gap-2">
                      {["all", "free", "premium"].map((sub) => (
                        <button
                          key={sub}
                          onClick={() => setFilter("subscription", sub)}
                          className={`room-chip room-chip--green ${filters.subscription === sub ? "room-chip--active" : ""}`}
                        >
                          {sub === "all" ? "All" : sub.charAt(0).toUpperCase() + sub.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase text-slate-500 mb-3 tracking-wider">Difficulty</h4>
                    <div className="flex flex-wrap gap-2">
                      {diffChips.map(({ label, cls }) => {
                        const on = filters.difficulties?.includes(label);
                        return (
                          <button
                            key={label}
                            onClick={() => setFilter("difficulties", on
                              ? filters.difficulties.filter((x) => x !== label)
                              : [...(filters.difficulties || []), label])}
                            className={`room-chip ${cls} ${on ? "room-chip--active" : ""}`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {allTags.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase text-slate-500 mb-3 tracking-wider">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {allTags.map((t) => {
                          const on = filters.tags?.includes(t);
                          return (
                            <button
                              key={t}
                              onClick={() => setFilter("tags", on
                                ? filters.tags.filter((x) => x !== t)
                                : [...(filters.tags || []), t])}
                              className={`room-chip room-chip--green ${on ? "room-chip--active" : ""}`}
                            >
                              {t}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-5 rooms-mobile-drawer__footer">
                  <button className="w-full room-cta-btn room-cta-btn--enter" onClick={() => setMobileOpen(false)}>
                    Apply Filters {activeCount > 0 ? `(${activeCount})` : ""}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </ProtectedRoute>
  );
});

Rooms.displayName = "Rooms";
export default Rooms;
