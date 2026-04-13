import { useState, useMemo, memo, useCallback, useEffect, useRef } from "react";
import {
  Users, Zap, Filter, Clock, Crown, Search, ChevronDown, Flame,
  Trophy, X, Play, BookOpen, TrendingUp, Bookmark, BookmarkCheck,
  SlidersHorizontal, Shield, Target, ChevronLeft, ChevronRight,
  CheckCircle2, RotateCcw, ArrowRight, Grid, List, Globe,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getRooms } from "../../services/rooms";
import { useBookmarks } from "../../contexts/bookmark-context";
import { useApp } from "../../contexts/app-context";
import { ProtectedRoute } from "../../components/protected-route";

/* ══════ Shared design tokens (same as Dashboard/Labs) ══════ */
const T = {
  bg: "#0a1128",
  surface: "#111a2e",
  surfaceAlt: "#162236",
  border: "rgba(255,255,255,0.06)",
  text: "#E2E8F0",
  textMuted: "#64748B",
  cyan: "#00F2FF",
  green: "#88E636",
  purple: "#A855F7",
  amber: "#FFB800",
  orange: "#FF6B35",
};

/* ══════ Difficulty config ══════ */
const DIFF = {
  Beginner:     { color: "#88E636", bg: "rgba(136,230,54,0.1)",  border: "rgba(136,230,54,0.25)",  bars: 1 },
  Easy:         { color: "#88E636", bg: "rgba(136,230,54,0.1)",  border: "rgba(136,230,54,0.25)",  bars: 1 },
  Intermediate: { color: "#F5A623", bg: "rgba(245,166,35,0.1)",  border: "rgba(245,166,35,0.25)",  bars: 2 },
  Medium:       { color: "#F5A623", bg: "rgba(245,166,35,0.1)",  border: "rgba(245,166,35,0.25)",  bars: 2 },
  Advanced:     { color: "#F97316", bg: "rgba(249,115,22,0.1)",  border: "rgba(249,115,22,0.25)",  bars: 3 },
  Hard:         { color: "#F97316", bg: "rgba(249,115,22,0.1)",  border: "rgba(249,115,22,0.25)",  bars: 3 },
  Insane:       { color: "#FF3D71", bg: "rgba(255,61,113,0.1)",  border: "rgba(255,61,113,0.25)",  bars: 4 },
};
const getDiff = (d) => DIFF[d] || { color: "#94A3B8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.18)", bars: 2 };

const DIFFICULTY_POINTS = { Beginner: 100, Easy: 100, Intermediate: 175, Medium: 175, Advanced: 250, Hard: 250, Expert: 250, Insane: 250 };
const getPoints = (difficulty) => DIFFICULTY_POINTS[difficulty] || 100;

/* ── Difficulty signal bars (THM-style, same as Labs) ── */
const DiffBars = memo(({ level }) => {
  const dm = getDiff(level);
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-end gap-[2px]">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ width: 3, height: 6 + i * 3, borderRadius: 1, background: i <= dm.bars ? dm.color : "rgba(255,255,255,0.1)", transition: "background 0.2s" }} />
        ))}
      </div>
      <span className="text-xs font-semibold" style={{ color: dm.color }}>{level}</span>
    </div>
  );
});
DiffBars.displayName = "DiffBars";

/* ══════ Category config ══════ */
const CAT_META = {
  Web:         { icon: <Globe size={13} />, color: T.cyan },
  Networking:  { icon: <Shield size={13} />, color: T.purple },
  Development: { icon: <Zap size={13} />,   color: T.green },
  DevOps:      { icon: <Target size={13} />, color: T.amber },
  Misc:        { icon: <Trophy size={13} />, color: T.orange },
};
const getCat = (c) => CAT_META[c] || { icon: <BookOpen size={13} />, color: T.textMuted };

/* ── Placeholder images ── */
const CAT_IMG = {
  Web: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=600",
  Networking: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=600",
  Development: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=600",
  DevOps: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?auto=format&fit=crop&q=80&w=600",
  Misc: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=600",
};
const FALLBACK_IMG = "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600";
const getRoomImg = (c) => CAT_IMG[c] || FALLBACK_IMG;

/* ── Local rooms ── */
const LOCAL_ROOMS = [
  {
    _id: "local-web-app-pentesting", id: "local-web-app-pentesting",
    slug: "web-app-pentesting", title: "Web App Pentesting Mastery",
    short_description: "Learn how real hackers identify, analyze, and exploit vulnerabilities in web applications using industry tools and techniques.",
    category: "Web", difficulty: "Advanced", estimated_time_minutes: 90, points: 250,
    tags: ["web-security", "pentesting", "owasp", "sql-injection", "xss"],
    topics: Array(5).fill(null),
    cover_image_url: "/images/rooms/attack-surface.png",
    subscriberOnly: false, isPremium: false,
    completedBy: Array(4827).fill(null),
    createdAt: "2026-03-26T00:00:00.000Z",
    customRoute: "/rooms/web-app-pentesting", isLocal: true,
  },
  {
    _id: "local-rest-api-mastery", id: "local-rest-api-mastery",
    slug: "rest-api-mastery", title: "Introduction to RESTful APIs",
    short_description: "Master the basics of REST APIs, HTTP methods, status codes, and JSON data structures.",
    category: "Development", difficulty: "Beginner", estimated_time_minutes: 40, points: 100,
    tags: ["api", "rest", "backend", "http", "express"],
    topics: Array(5).fill(null),
    cover_image_url: "/images/rooms/api-intro.png",
    completedBy: Array(4827).fill(null),
    createdAt: "2026-03-26T00:00:00.000Z",
    customRoute: "/rooms/rest-api-mastery", isLocal: true,
  },
  {
    _id: "local-networking-fundamentals", id: "local-networking-fundamentals",
    slug: "networking-fundamentals", title: "Networking Fundamentals",
    short_description: "Learn the core concepts of networking: OSI model, IP addressing, TCP/UDP, and routing.",
    category: "Networking", difficulty: "Beginner", estimated_time_minutes: 60, points: 100,
    tags: ["networking", "osi-model", "tcp-ip", "routing", "dns"],
    topics: Array(5).fill(null),
    cover_image_url: "/images/rooms/osi-model.png",
    completedBy: Array(1250).fill(null),
    createdAt: "2026-03-26T00:00:00.000Z",
    customRoute: "/rooms/networking-fundamentals", isLocal: true,
  },
  {
    _id: "local-sql-injection-fundamentals", id: "local-sql-injection-fundamentals",
    slug: "sql-injection-fundamentals", title: "SQL Injection Fundamentals",
    short_description: "Learn how SQL Injection works and how attackers bypass authentication and extract data from databases.",
    category: "Web", difficulty: "Beginner", estimated_time_minutes: 50, points: 100,
    tags: ["sqli", "database", "web-security", "injection"],
    topics: Array(4).fill(null),
    cover_image_url: "/images/rooms/sqli.png",
    completedBy: Array(2100).fill(null),
    createdAt: "2026-04-13T00:00:00.000Z",
    customRoute: "/rooms/sql-injection-fundamentals", isLocal: true,
  },
  {
    _id: "local-linux-fundamentals", id: "local-linux-fundamentals",
    slug: "linux-fundamentals", title: "Linux Fundamentals",
    short_description: "Master the Linux command line, manage file systems, control user permissions, and handle system level processes like a pro.",
    category: "System", difficulty: "Intermediate", estimated_time_minutes: 60, points: 175,
    tags: ["linux", "terminal", "sysadmin", "system-security"],
    topics: Array(5).fill(null),
    cover_image_url: "/images/rooms/linux.png",
    completedBy: Array(1800).fill(null),
    createdAt: "2026-04-13T00:00:00.000Z",
    customRoute: "/rooms/linux-fundamentals", isLocal: true,
  },
  {
    _id: "local-authentication-session-attacks", id: "local-authentication-session-attacks",
    slug: "authentication-session-attacks", title: "Authentication & Session Attacks",
    short_description: "Master the dark side of authentication. From hijacking sessions to manipulating JWT signatures and bypassing MFA, learn the advanced exploits that topple secure systems.",
    category: "Web", difficulty: "Advanced", estimated_time_minutes: 90, points: 250,
    tags: ["auth", "sessions", "jwt", "oauth", "mfa-bypass"],
    topics: Array(5).fill(null),
    cover_image_url: "/images/rooms/auth/task1.png",
    completedBy: Array(1650).fill(null),
    createdAt: "2026-04-13T00:00:00.000Z",
    customRoute: "/rooms/authentication-session-attacks", isLocal: true,
  },
  {
    _id: "local-osint-investigation", id: "local-osint-investigation",
    slug: "osint-investigation", title: "OSINT Investigation",
    short_description: "Deep dive into Open Source Intelligence. Learn to map digital footprints, exploit search engine dorks, and uncover hidden infrastructure with professional tools.",
    category: "Recon", difficulty: "Advanced", estimated_time_minutes: 60, points: 250,
    tags: ["osint", "recon", "investigation", "social-engineering"],
    topics: Array(5).fill(null),
    cover_image_url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
    completedBy: Array(1200).fill(null),
    createdAt: "2026-04-13T00:00:00.000Z",
    customRoute: "/rooms/osint-investigation", isLocal: true,
  },
  {
    _id: "local-python-pickle-deserialization", id: "local-python-pickle-deserialization",
    slug: "python-pickle-deserialization", title: "Python Pickle Exploitation",
    short_description: "Master the dark art of insecure deserialization. Learn how Python's Pickle module can be weaponized into a full system compromise via Remote Code Execution.",
    category: "Advanced", difficulty: "Advanced", estimated_time_minutes: 70, points: 250,
    tags: ["pickle", "deserialization", "python", "rce"],
    topics: Array(5).fill(null),
    cover_image_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800",
    completedBy: Array(950).fill(null),
    createdAt: "2026-04-13T00:00:00.000Z",
    customRoute: "/rooms/python-pickle-deserialization", isLocal: true,
  },
  {
    _id: "local-cryptography-basics", id: "local-cryptography-basics",
    slug: "cryptography-basics", title: "Cryptography & Hashing",
    short_description: "Master the fundamental pillars of digital security. Learn how to encrypt data, securely hash passwords, and understand key management protocols.",
    category: "Crypto", difficulty: "Intermediate", estimated_time_minutes: 60, points: 175,
    tags: ["crypto", "hashing", "encryption"],
    topics: Array(5).fill(null),
    cover_image_url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
    completedBy: Array(1400).fill(null),
    createdAt: "2026-04-13T00:00:00.000Z",
    customRoute: "/rooms/cryptography-basics", isLocal: true,
  },
  {
    _id: "local-reverse-engineering-basics", id: "local-reverse-engineering-basics",
    slug: "reverse-engineering-basics", title: "Reverse Engineering Basics",
    short_description: "Peel back the layers of compiled software. Learn how to disassemble binaries, analyze machine instructions, and uncover hidden program logic.",
    category: "Reverse Engineering", difficulty: "Advanced", estimated_time_minutes: 75, points: 250,
    tags: ["reverse", "binary", "analysis", "malware"],
    topics: Array(5).fill(null),
    cover_image_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800",
    completedBy: Array(800).fill(null),
    createdAt: "2026-04-13T00:00:00.000Z",
    customRoute: "/rooms/reverse-engineering-basics", isLocal: true,
  },
];

/* ── Image with fallback ── */
const RoomImg = memo(({ src, category, alt, className }) => {
  const [imgSrc, setImgSrc] = useState(src || getRoomImg(category));
  const fallbacks = [getRoomImg(category), FALLBACK_IMG];
  const fallbackIdx = useRef(0);

  useEffect(() => {
    setImgSrc(src || getRoomImg(category));
    fallbackIdx.current = 0;
  }, [src, category]);

  const handleError = () => {
    const next = fallbacks[fallbackIdx.current];
    if (next && next !== imgSrc) { fallbackIdx.current++; setImgSrc(next); }
  };

  return <img src={imgSrc} alt={alt} onError={handleError} className={className} loading="lazy" />;
});
RoomImg.displayName = "RoomImg";

/* ══════ Room Card (THM/HTB-style) ══════ */
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
  const roomLink = room.customRoute || `/rooms/${room.slug}`;

  const handleBookmark = (e) => { e.preventDefault(); e.stopPropagation(); onBookmark(room); };

  return (
    <div
      className={`group relative rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col ${isCompleted ? "ring-1 ring-emerald-500/40" : ""}`}
      style={{ background: T.surface, border: `1px solid ${T.border}` }}
    >
      {/* Thumbnail */}
      <div className="relative h-32 overflow-hidden" style={{ background: "#0d1829" }}>
        <RoomImg src={room.cover_image_url} category={room.category} alt={room.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111a2e] via-transparent to-transparent" />

        {/* Top right badges */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {(room.subscriberOnly || room.isPremium) ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold"
              style={{ background: "#212c42", color: T.amber, border: "1px solid rgba(255,184,0,0.3)" }}>
              <Crown size={10} /> Premium
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold"
              style={{ background: "rgba(136,230,54,0.12)", color: T.green, border: "1px solid rgba(136,230,54,0.25)" }}>
              Free
            </span>
          )}
          {isCompleted && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold"
              style={{ background: "rgba(16,185,129,0.15)", color: "#10B981", border: "1px solid rgba(16,185,129,0.3)" }}>
              <CheckCircle2 size={10} /> Done
            </span>
          )}
        </div>

        {/* Bookmark */}
        <button
          className="absolute top-3 left-3 p-1.5 rounded-lg transition-all"
          style={{
            background: isBookmarked ? T.cyan : "rgba(0,0,0,0.4)",
            color: isBookmarked ? T.bg : "#94A3B8",
          }}
          onClick={handleBookmark} aria-label="Bookmark"
        >
          {isBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
        </button>

        {/* Category tag */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", color: cat.color, border: `1px solid ${cat.color}30` }}>
            {cat.icon} {room.category}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col p-3.5 gap-2">
        <div>
          <h3 className="font-bold text-white text-sm leading-tight line-clamp-1 group-hover:text-[#00F2FF] transition-colors">{room.title}</h3>
          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{room.short_description}</p>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 flex-wrap">
          <DiffBars level={room.difficulty} />
          {room.topics?.length > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
              <BookOpen size={11} /> {room.topics.length} topics
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1"><Clock size={11} className="text-slate-500" /> {room.estimated_time_minutes || "—"}m</span>
          <span className="flex items-center gap-1"><Users size={11} className="text-slate-500" /> {completions}</span>
          <span className="flex items-center gap-1 font-semibold" style={{ color: T.amber }}><Zap size={11} /> {xp} XP</span>
        </div>

        {/* Progress */}
        {pct > 0 && !isCompleted && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span style={{ color: T.textMuted }}>Progress</span>
              <span style={{ color: T.cyan }} className="font-semibold">{pct}%</span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${T.cyan}, #0099CC)`, boxShadow: `0 0 6px ${T.cyan}30` }} />
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="flex gap-2 mt-auto pt-1">
          {isCompleted ? (
            <Link to={roomLink} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:brightness-110" style={{ background: 'linear-gradient(135deg, #10B981, #059669)', color: '#fff' }}>
              <RotateCcw size={12} /> Replay
            </Link>
          ) : isStarted ? (
            <Link to={roomLink} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:brightness-110" style={{ background: 'linear-gradient(135deg, #00D4FF, #0099CC)', color: '#0a1128' }}>
              <Play size={12} /> Resume
            </Link>
          ) : (
            <Link to={roomLink} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:brightness-110" style={{ background: 'linear-gradient(135deg, #00D4FF, #0099CC)', color: '#0a1128' }}>
              <Play size={12} /> Enter
            </Link>
          )}
          <Link to={roomLink} className="px-2 py-1.5 rounded-lg transition-all" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} aria-label="Details">
            <ArrowRight size={14} className="text-slate-400" />
          </Link>
        </div>
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
  const roomLink = room.customRoute || `/rooms/${room.slug}`;
  const handleBookmark = (e) => { e.preventDefault(); e.stopPropagation(); onBookmark(room); };

  return (
    <div
      className={`group flex gap-4 p-4 rounded-xl transition-all duration-300 ${isCompleted ? "ring-1 ring-emerald-500/30" : ""}`}
      style={{ background: T.surface, border: `1px solid ${T.border}` }}
    >
      <div className="relative w-28 h-20 rounded-lg overflow-hidden flex-shrink-0" style={{ background: "#0d1829" }}>
        <RoomImg src={room.cover_image_url} category={room.category} alt={room.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80" />
      </div>

      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-[#00F2FF] transition-colors">{room.title}</h3>
        <div className="flex items-center gap-3 flex-wrap">
          <DiffBars level={room.difficulty} />
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold"
            style={{ background: `${cat.color}12`, color: cat.color }}>
            {cat.icon} {room.category}
          </span>
          {(room.subscriberOnly || room.isPremium) && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold" style={{ color: T.amber }}>
              <Crown size={10} /> Premium
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1"><Clock size={11} /> {room.estimated_time_minutes || "—"}m</span>
          <span className="flex items-center gap-1"><Users size={11} /> {room.completedBy?.length || 0}</span>
          <span className="flex items-center gap-1 font-semibold" style={{ color: T.amber }}><Zap size={11} /> {xp} XP</span>
          {room.topics?.length > 0 && <span className="flex items-center gap-1"><BookOpen size={11} /> {room.topics.length}</span>}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          className="p-1.5 rounded-lg transition-all"
          style={{ background: isBookmarked ? T.cyan : "rgba(255,255,255,0.04)", color: isBookmarked ? T.bg : "#64748B" }}
          onClick={handleBookmark} aria-label="Bookmark"
        >
          {isBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
        </button>
        {isCompleted ? (
          <Link to={roomLink} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:brightness-110 whitespace-nowrap" style={{ background: 'linear-gradient(135deg, #10B981, #059669)', color: '#fff' }}><RotateCcw size={11} /> Replay</Link>
        ) : isStarted ? (
          <Link to={roomLink} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:brightness-110 whitespace-nowrap" style={{ background: 'linear-gradient(135deg, #00D4FF, #0099CC)', color: '#0a1128' }}><Play size={11} /> Resume</Link>
        ) : (
          <Link to={roomLink} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:brightness-110 whitespace-nowrap" style={{ background: 'linear-gradient(135deg, #00D4FF, #0099CC)', color: '#0a1128' }}><Play size={11} /> Enter</Link>
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

        const filteredApiRooms = data.filter((r) => {
          const title = r.title?.toLowerCase() || "";
          const slug = r.slug?.toLowerCase() || "";
          const isOldApiRoom = title.includes("backend development basics") || slug.includes("introduction-to-restful-apis");
          const isOldNetworkingRoom = title === "networking fundamentals" || slug === "networking-fundamentals";
          const isOldPentestingRoom = title.includes("web app pentesting") || slug.includes("web-app-pentesting");
          return !isOldApiRoom && !isOldNetworkingRoom && !isOldPentestingRoom;
        });

        const localSlugs = new Set(LOCAL_ROOMS.map((r) => r.slug));
        const remoteToAdd = filteredApiRooms.filter((r) => !localSlugs.has(r.slug));
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

  /* ── Filter chip data ── */
  const diffChips = [
    { label: "Beginner", color: "#88E636" },
    { label: "Intermediate", color: "#F5A623" },
    { label: "Advanced", color: "#F97316" },
    { label: "Hard", color: "#F97316" },
    { label: "Insane", color: "#FF3D71" },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ background: T.bg }}>

        {/* ═══ HERO HEADER ═══ */}
        <div className="relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0a1128 0%, #1a2744 50%, #0a1128 100%)" }}>
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl" style={{ background: "rgba(0,242,255,0.1)", border: "1px solid rgba(0,242,255,0.2)" }}>
                    <Shield size={22} style={{ color: T.cyan }} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: T.cyan }}>Challenge Rooms</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>Active Rooms</h1>
                <p className="text-slate-400 text-sm max-w-lg">
                  {loading ? "Loading challenge rooms…" : `${rooms.length} hacking room${rooms.length !== 1 ? "s" : ""} available — learn by doing, not just reading.`}
                </p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6">
                {[
                  { val: stats.total, label: "Rooms", icon: <Shield size={16} /> },
                  { val: stats.free, label: "Free", icon: <Zap size={16} /> },
                  { val: stats.completed, label: "Completed", icon: <CheckCircle2 size={16} /> },
                  { val: stats.inProgress, label: "Active", icon: <Flame size={16} /> },
                ].map(({ val, label, icon }) => (
                  <div key={label} className="text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1" style={{ color: T.cyan }}>{icon}</div>
                    <p className="text-2xl font-extrabold text-white">{val}</p>
                    <p className="text-xs text-slate-400 whitespace-nowrap">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ═══ CATEGORY TABS ═══ */}
        <div style={{ background: "#0d1829", borderBottom: `1px solid ${T.border}` }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4 overflow-x-auto">
              <div className="flex items-center">
                {categories.map((cat) => {
                  const isActive = filters.category === cat;
                  const meta = cat !== "all" ? getCat(cat) : null;
                  return (
                    <button key={cat} onClick={() => setFilter("category", cat)}
                      className="relative px-4 py-3.5 text-sm font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5"
                      style={{ color: isActive ? T.cyan : T.textMuted }}>
                      {meta && <span style={{ color: isActive ? meta.color : undefined }}>{meta.icon}</span>}
                      {cat === "all" ? "All Rooms" : cat}
                      {isActive && <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: T.cyan }} />}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-3 py-2">
                {/* Search */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    className="pl-9 pr-8 py-2 rounded-lg text-sm transition-all w-48 focus:w-64"
                    style={{ background: T.surface, border: `1px solid ${T.border}`, color: "#fff", outline: "none" }}
                    placeholder="Search rooms…" value={filters.search}
                    onChange={(e) => setFilter("search", e.target.value)}
                    onFocus={(e) => e.target.style.borderColor = "rgba(0,242,255,0.4)"}
                    onBlur={(e) => e.target.style.borderColor = T.border}
                  />
                  {filters.search && (
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white" onClick={() => setFilter("search", "")}>
                      <X size={14} />
                    </button>
                  )}
                </div>
                {/* Mobile filter */}
                <button className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold"
                  style={{ background: T.surface, color: T.textMuted, border: `1px solid ${T.border}` }} onClick={() => setMobileOpen(true)}>
                  <Filter size={14} /> Filters
                  {activeCount > 0 && <span className="px-1.5 py-0.5 rounded text-xs font-bold" style={{ background: T.cyan, color: T.bg }}>{activeCount}</span>}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ FILTER CHIPS + SORT ═══ */}
        <div style={{ background: "#0f1d2e" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {["all", "free", "premium"].map((sub) => {
                  const isActive = filters.subscription === sub;
                  return (
                    <button key={sub} onClick={() => setFilter("subscription", sub)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{ background: isActive ? `${T.cyan}15` : "rgba(255,255,255,0.03)", color: isActive ? T.cyan : T.textMuted, border: `1px solid ${isActive ? `${T.cyan}35` : T.border}` }}>
                      {sub === "all" ? "All" : sub === "free" ? "Free" : "Premium"}
                    </button>
                  );
                })}
                <div className="w-px h-5 mx-1" style={{ background: T.border }} />
                {diffChips.map(({ label, color }) => {
                  const isActive = filters.difficulties?.includes(label);
                  return (
                    <button key={label} onClick={() => setFilter("difficulties", isActive ? filters.difficulties.filter((x) => x !== label) : [...(filters.difficulties || []), label])}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{ background: isActive ? `${color}18` : "rgba(255,255,255,0.03)", color: isActive ? color : T.textMuted, border: `1px solid ${isActive ? `${color}40` : T.border}` }}>
                      {label}
                    </button>
                  );
                })}
                {activeCount > 0 && (
                  <button onClick={clearAll} className="px-2 py-1 rounded text-xs font-semibold text-slate-500 hover:text-white transition-colors flex items-center gap-1">
                    <X size={12} /> Clear
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">{loading ? "Loading…" : `${sorted.length} rooms`}</span>
                <div className="relative">
                  <select className="appearance-none pl-3 pr-7 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                    style={{ background: T.surface, border: `1px solid ${T.border}`, color: "#CBD5E1", outline: "none" }}
                    value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="popular">Popular</option>
                    <option value="newest">Newest</option>
                    <option value="xp">Highest XP</option>
                    <option value="duration">Shortest</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
                <div className="flex items-center gap-0.5 rounded-lg p-0.5" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <button className="p-1.5 rounded transition-colors" style={{ background: viewMode === "grid" ? `${T.cyan}15` : "transparent", color: viewMode === "grid" ? T.cyan : T.textMuted }} onClick={() => setViewMode("grid")}><Grid size={14} /></button>
                  <button className="p-1.5 rounded transition-colors" style={{ background: viewMode === "list" ? `${T.cyan}15` : "transparent", color: viewMode === "list" ? T.cyan : T.textMuted }} onClick={() => setViewMode("list")}><List size={14} /></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ MAIN CONTENT ═══ */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Loading */}
          {loading && (
            <div className={`grid gap-4 ${viewMode === "list" ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"}`}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-xl overflow-hidden animate-pulse" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                  <div className="h-32" style={{ background: "#0d1829" }} />
                  <div className="p-3.5 space-y-2.5">
                    <div className="h-3.5 rounded w-3/4" style={{ background: "rgba(255,255,255,0.06)" }} />
                    <div className="h-2.5 rounded w-full" style={{ background: "rgba(255,255,255,0.04)" }} />
                    <div className="h-2 rounded w-1/2" style={{ background: "rgba(255,255,255,0.03)" }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="p-4 rounded-xl mb-4" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <X size={32} className="text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{error}</h3>
              <button className="mt-4 px-6 py-2.5 rounded-lg text-sm font-bold transition-all hover:brightness-110" style={{ background: 'linear-gradient(135deg, #00D4FF, #0099CC)', color: '#0a1128' }} onClick={fetchRooms}>Try Again</button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && sorted.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="p-4 rounded-xl mb-4" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${T.border}` }}>
                <Target size={32} className="text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No rooms match your filters</h3>
              <p className="text-slate-400 text-sm mb-6">Try adjusting your search or clearing all filters.</p>
              <button className="px-6 py-2.5 rounded-lg text-sm font-bold transition-all hover:brightness-110" style={{ background: 'linear-gradient(135deg, #00D4FF, #0099CC)', color: '#0a1128' }} onClick={clearAll}>Reset Filters</button>
            </div>
          )}

          {/* Grid / List */}
          {!loading && !error && sorted.length > 0 && (
            <div className={`grid gap-4 ${viewMode === "list" ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"}`}>
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
            <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm flex flex-col" style={{ background: "#0d1829" }}>
              <div className="flex items-center justify-between p-5" style={{ borderBottom: `1px solid ${T.border}` }}>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <SlidersHorizontal size={18} style={{ color: T.cyan }} /> Filters
                </h2>
                <button className="p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.04)" }} onClick={() => setMobileOpen(false)}>
                  <X size={18} className="text-slate-400" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Subscription */}
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-500 mb-3 tracking-wider">Subscription</h4>
                  <div className="flex flex-wrap gap-2">
                    {["all", "free", "premium"].map((sub) => (
                      <button key={sub} onClick={() => setFilter("subscription", sub)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={{ background: filters.subscription === sub ? `${T.cyan}15` : "rgba(255,255,255,0.03)", color: filters.subscription === sub ? T.cyan : T.textMuted, border: `1px solid ${filters.subscription === sub ? `${T.cyan}35` : T.border}` }}>
                        {sub === "all" ? "All" : sub.charAt(0).toUpperCase() + sub.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Difficulty */}
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-500 mb-3 tracking-wider">Difficulty</h4>
                  <div className="flex flex-wrap gap-2">
                    {diffChips.map(({ label, color }) => {
                      const on = filters.difficulties?.includes(label);
                      return (
                        <button key={label} onClick={() => setFilter("difficulties", on ? filters.difficulties.filter((x) => x !== label) : [...(filters.difficulties || []), label])}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                          style={{ background: on ? `${color}18` : "rgba(255,255,255,0.03)", color: on ? color : T.textMuted, border: `1px solid ${on ? `${color}40` : T.border}` }}>
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* Tags */}
                {allTags.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase text-slate-500 mb-3 tracking-wider">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {allTags.map((t) => {
                        const on = filters.tags?.includes(t);
                        return (
                          <button key={t} onClick={() => setFilter("tags", on ? filters.tags.filter((x) => x !== t) : [...(filters.tags || []), t])}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                            style={{ background: on ? `${T.cyan}15` : "rgba(255,255,255,0.03)", color: on ? T.cyan : T.textMuted, border: `1px solid ${on ? `${T.cyan}35` : T.border}` }}>
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="p-5" style={{ borderTop: `1px solid ${T.border}` }}>
                <button className="w-full py-3 rounded-lg text-sm font-bold transition-all hover:brightness-110" style={{ background: 'linear-gradient(135deg, #00D4FF, #0099CC)', color: '#0a1128' }} onClick={() => setMobileOpen(false)}>
                  Apply Filters {activeCount > 0 ? `(${activeCount})` : ""}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
});

Rooms.displayName = "Rooms";
export default Rooms;
