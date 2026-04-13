import { useState, useMemo, memo, useCallback, useEffect, useRef } from "react";
import {
  Search,
  Grid,
  List,
  Lock,
  Clock,
  Users,
  Filter,
  Star,
  Play,
  BookOpen,
  Trophy,
  X,
  ChevronDown,
  Zap,
  CheckCircle2,
  Crown,
  ArrowRight,
  SlidersHorizontal,
  Terminal,
  ChevronLeft,
  ChevronRight,
  Flame,
  TrendingUp,
  Shield,
  Target,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ProtectedRoute } from "../../components/protected-route";
import { useApp } from "../../contexts/app-context";
import axios from "../../api/axios";

/* ─── Difficulty signal bars (THM-style) ─── */
const DifficultyBars = memo(({ level }) => {
  const levels = { Easy: 1, Beginner: 1, Medium: 2, Hard: 3, Insane: 4 };
  const colors = {
    Easy: "#39FF14",
    Beginner: "#39FF14",
    Medium: "#F59E0B",
    Hard: "#EF4444",
    Insane: "#B91C1C",
  };
  const bars = levels[level] || 2;
  const color = colors[level] || "#94A3B8";

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-end gap-[1.5px]">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              width: "2.5px",
              height: `${5 + i * 2.5}px`,
              borderRadius: "0.5px",
              background: i <= bars ? color : "rgba(255,255,255,0.08)",
              transition: "background 0.2s",
            }}
          />
        ))}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color, opacity: 0.9 }}>
        {level}
      </span>
    </div>
  );
});
DifficultyBars.displayName = "DifficultyBars";

/* ─── Star Rating ─── */
const StarRating = memo(({ rating }) => {
  const r = Number(rating) || 0;
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={12}
            className={
              i <= Math.round(r)
                ? "fill-amber-400 text-amber-400"
                : "text-slate-600"
            }
          />
        ))}
      </div>
      <span className="text-xs text-slate-400 ml-0.5">
        {r.toFixed(1)}
      </span>
    </div>
  );
});
StarRating.displayName = "StarRating";

/* ─── Lab Card (Grid mode — THM-inspired) ─── */
const LabCard = memo(({ lab, progress, isPremiumUser }) => {
  const slug = lab.slug || lab.id;
  const isCompleted = progress?.completed || false;
  const progressPct = progress?.progress || (isCompleted ? 100 : 0);
  const isLocked = lab.isPremium && !isPremiumUser;

  return (
    <div
      className={`group relative rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 flex flex-col ${isCompleted ? "ring-1 ring-emerald-500/30" : ""} ${isLocked ? "opacity-75" : ""}`}
      style={{
        background: "rgba(17, 25, 40, 0.75)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)"
      }}
    >
      {/* Image */}
      <div className="relative h-32 overflow-hidden" style={{ background: "#0D1117" }}>
        <img
          src={lab.coverImage || "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=600"}
          alt={lab.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-70 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111a2e] via-transparent to-transparent opacity-60" />

        {/* Status badges */}
        <div className="absolute top-2 right-2 flex items-center gap-2">
          {lab.isPremium ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase"
              style={{ background: "rgba(245,166,35,0.15)", color: "#F5A623", border: "1px solid rgba(245,166,35,0.3)" }}>
              <Crown size={9} /> Premium
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase"
              style={{ background: "rgba(136,230,54,0.12)", color: "#39FF14", border: "1px solid rgba(57,255,20,0.25)" }}>
              Free
            </span>
          )}
        </div>

        {isCompleted && (
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase"
              style={{ background: "rgba(16,185,129,0.15)", color: "#10B981", border: "1px solid rgba(16,185,129,0.3)" }}>
              <CheckCircle2 size={9} /> Completed
            </span>
          </div>
        )}

        {/* Lock overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-[#0a1128]/80 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2">
            <Lock size={20} style={{ color: "#F5A623" }} />
            <Link to="/premium" className="px-3 py-1 rounded text-[10px] font-bold uppercase transition-all hover:scale-105"
              style={{ background: "#F5A623", color: "#000" }}>Upgrade</Link>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col p-3.5 gap-3">
        <div>
          <h3 className="font-bold text-white text-[14px] leading-snug line-clamp-2 mb-1 group-hover:text-[#00F2FF] transition-colors">
            {lab.title}
          </h3>
          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed opacity-80">
            {lab.description || lab.short_description || `By ${lab.creator || "CyberVerse Team"}`}
          </p>
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between">
          <DifficultyBars level={lab.difficulty} />
          {lab.type === "ctf" ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase" style={{ background: "rgba(245,166,35,0.08)", color: "#F5A623" }}>
              <Trophy size={10} /> CTF
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase" style={{ background: "rgba(0,242,255,0.08)", color: "#00F2FF" }}>
              <BookOpen size={10} /> Labs
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold border-t border-white/5 pt-3">
          <span className="flex items-center gap-1"><Users size={11} /> {lab.participants || 0}</span>
          <span className="flex items-center gap-1"><Clock size={11} /> {lab.duration || "30m"}</span>
          <span className="flex items-center gap-1 text-amber-400/90"><Zap size={11} /> {lab.points || 100} XP</span>
        </div>

        {/* Progress */}
        {progressPct > 0 && !isCompleted && (
          <div className="mt-1">
            <div className="flex justify-between text-[10px] mb-1 font-bold">
              <span className="text-slate-500 uppercase tracking-tighter">Progress</span>
              <span style={{ color: "#00F2FF" }}>{progressPct}%</span>
            </div>
            <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progressPct}%`, background: "linear-gradient(90deg, #00F2FF, #0099CC)" }} />
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="flex gap-2 mt-auto pt-1">
          {isLocked ? (
            <Link to="/premium" className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-extrabold uppercase transition-all" style={{ background: "rgba(255,255,255,0.05)", color: "#94A3B8", border: "1px solid rgba(255,255,255,0.1)" }}>
              <Lock size={12} /> Locked
            </Link>
          ) : isCompleted ? (
            <Link to={`/labs/${slug}`} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-extrabold uppercase transition-all hover:bg-emerald-500/20" style={{ background: "rgba(16,185,129,0.1)", color: "#10B981", border: "1px solid rgba(16,185,129,0.2)" }}>
              <CheckCircle2 size={12} /> Review
            </Link>
          ) : (
            <Link to={`/labs/${slug}`} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-extrabold uppercase transition-all hover:brightness-110 shadow-lg shadow-cyan-500/20" style={{ background: "linear-gradient(135deg, #00F2FF 0%, #0099CC 100%)", color: "#000" }}>
              <Play size={12} /> {progressPct > 0 ? "Resume" : "Start"}
            </Link>
          )}
          <Link to={`/labs/${slug}`} className="flex items-center justify-center w-9 h-9 rounded-lg transition-all hover:bg-white/10" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <ArrowRight size={14} className="text-slate-400" />
          </Link>
        </div>
      </div>
    </div>
  );
});
LabCard.displayName = "LabCard";

/* ─── Lab List Row ─── */
const LabRow = memo(({ lab, progress, isPremiumUser }) => {
  const slug = lab.slug || lab.id;
  const isCompleted = progress?.completed || false;
  const isLocked = lab.isPremium && !isPremiumUser;

  return (
    <div
      className={`group flex items-center gap-4 p-3 rounded-xl transition-all duration-300 hover:border-cyan-500/30 ${isCompleted ? "ring-1 ring-emerald-500/20" : ""}`}
      style={{
        background: "rgba(17, 25, 40, 0.6)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0" style={{ background: "#0D1117" }}>
        <img
          src={lab.coverImage || "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=180"}
          alt={lab.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-70"
        />
        {isLocked && (
          <div className="absolute inset-0 bg-[#0a1128]/80 flex items-center justify-center">
            <Lock size={14} style={{ color: "#F5A623" }} />
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-1 min-w-0">
        <h3 className="font-bold text-white text-[13px] line-clamp-1 group-hover:text-[#00F2FF] transition-colors leading-tight">
          {lab.title}
        </h3>
        <div className="flex items-center gap-3 flex-wrap">
          <DifficultyBars level={lab.difficulty} />
          {lab.type === "ctf" ? (
            <span className="text-[9px] font-extrabold uppercase" style={{ color: "#F5A623" }}>CTF</span>
          ) : (
            <span className="text-[9px] font-extrabold uppercase" style={{ color: "#00F2FF" }}>Labs</span>
          )}
        </div>
        <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold">
          <span className="flex items-center gap-1"><Users size={11} /> {lab.participants || 0}</span>
          <span className="flex items-center gap-1 text-amber-500/80"><Zap size={11} /> {lab.points || 100} XP</span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {isLocked ? (
          <Link to="/premium" className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase" style={{ background: "rgba(245,166,35,0.1)", color: "#F5A623" }}>
            Unlock
          </Link>
        ) : isCompleted ? (
          <Link to={`/labs/${slug}`} className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1" style={{ background: "rgba(16,185,129,0.1)", color: "#10B981" }}>
            Review
          </Link>
        ) : (
          <Link to={`/labs/${slug}`} className="px-4 py-1.5 rounded-lg text-[10px] font-extrabold uppercase flex items-center gap-1 hover:brightness-110 transition-all shadow-md shadow-cyan-500/10" style={{ background: "linear-gradient(135deg, #00F2FF 0%, #0099CC 100%)", color: "#000" }}>
            <Play size={11} /> Start
          </Link>
        )}
      </div>
    </div>
  );
});
LabRow.displayName = "LabRow";

/* ─── Main Labs Page ─── */
const Labs = memo(() => {
  const { user } = useApp();
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 9;
  const searchTimer = useRef(null);

  const [filters, setFilters] = useState({
    search: "",
    subscription: "all",
    category: "all",
    type: "all",
    difficulties: [],
    tags: [],
  });

  const userProgress = useMemo(() => {
    const m = {};
    if (!user?.labProgress) return m;
    user.labProgress.forEach((lp) => {
      m[lp.labId] = {
        completed: !!lp.completed,
        progress: lp.progress || (lp.completed ? 100 : 0),
      };
    });
    return m;
  }, [user?.labProgress]);

  const isPremiumUser = user?.isPremium || false;

  const fetchLabs = useCallback(
    async (search = filters.search) => {
      setLoading(true);
      setError(null);
      try {
        const p = new URLSearchParams();
        if (filters.category && filters.category !== "all")
          p.append("category", filters.category);
        if (filters.difficulties?.length)
          p.append("difficulty", filters.difficulties[0]);
        if (search) p.append("search", search);
        if (filters.type !== "all") p.append("type", filters.type);
        const res = await axios.get(`/labs?${p}`);
        setLabs(res.data.data || []);
      } catch {
        setError("Unable to load labs. Please try again.");
        setLabs([]);
      } finally {
        setLoading(false);
      }
    },
    [filters.category, filters.difficulties, filters.type],
  );

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchLabs(filters.search), 380);
    return () => clearTimeout(searchTimer.current);
  }, [filters.search]);

  useEffect(() => {
    fetchLabs();
  }, [fetchLabs]);

  const categories = useMemo(() => {
    const cats = [...new Set(labs.map((l) => l.category).filter(Boolean))];
    return [
      { value: "all", label: "All Categories" },
      ...cats.map((c) => ({
        value: c,
        label: c.charAt(0).toUpperCase() + c.slice(1),
      })),
    ];
  }, [labs]);

  const allTags = useMemo(() => {
    const t = new Set();
    labs.forEach((l) => l.tags?.forEach((x) => t.add(x)));
    return [...t];
  }, [labs]);

  const filtered = useMemo(
    () =>
      labs.filter((lab) => {
        const s = filters.search.toLowerCase();
        return (
          (!s ||
            lab.title?.toLowerCase().includes(s) ||
            lab.description?.toLowerCase().includes(s)) &&
          (filters.subscription === "all" ||
            (filters.subscription === "free"
              ? !lab.isPremium
              : lab.isPremium)) &&
          (!filters.difficulties?.length ||
            filters.difficulties.includes(lab.difficulty)) &&
          (!filters.tags?.length ||
            filters.tags.some((t) => lab.tags?.includes(t)))
        );
      }),
    [labs, filters],
  );

  const sorted = useMemo(() => {
    const a = [...filtered];
    if (sortBy === "popular")
      return a.sort((x, y) => (y.participants || 0) - (x.participants || 0));
    if (sortBy === "rating")
      return a.sort((x, y) => (y.rating || 0) - (x.rating || 0));
    if (sortBy === "xp")
      return a.sort((x, y) => (y.points || 0) - (x.points || 0));
    if (sortBy === "shortest")
      return a.sort(
        (x, y) =>
          parseInt(x.estimatedTime || 30) - parseInt(y.estimatedTime || 30),
      );
    return a;
  }, [filtered, sortBy]);

  const paginated = useMemo(
    () => sorted.slice((page - 1) * itemsPerPage, page * itemsPerPage),
    [sorted, page],
  );
  const totalPages = Math.ceil(sorted.length / itemsPerPage);

  const setFilter = useCallback((k, v) => {
    setFilters((p) => ({ ...p, [k]: v }));
    setPage(1);
  }, []);
  const clearAll = useCallback(() => {
    setFilters({
      search: "",
      subscription: "all",
      category: "all",
      type: "all",
      difficulties: [],
      tags: [],
    });
    setPage(1);
  }, []);

  const activeCount = useMemo(() => {
    let n = 0;
    if (filters.search) n++;
    if (filters.subscription !== "all") n++;
    if (filters.category !== "all") n++;
    if (filters.type !== "all") n++;
    n += filters.difficulties?.length || 0;
    n += filters.tags?.length || 0;
    return n;
  }, [filters]);

  /* ── Tab definitions ── */
  const tabs = [
    { key: "all", label: "All", type: "all" },
    { key: "walkthrough", label: "Walkthroughs", type: "walkthrough" },
    { key: "ctf", label: "Challenges", type: "ctf" },
  ];

  /* ── Difficulty quick-filter chips ── */
  const diffChips = [
    { label: "Easy", color: "#39FF14" },
    { label: "Medium", color: "#F59E0B" },
    { label: "Hard", color: "#EF4444" },
    { label: "Insane", color: "#B91C1C" },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ background: "#0a1128" }}>

        {/* ═══ HERO HEADER (THM-style) ═══ */}
        <div
          className="relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0a1128 0%, #1a2744 50%, #0a1128 100%)",
          }}
        >
          {/* Subtle grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="p-2.5 rounded-xl"
                    style={{ background: "rgba(0, 242, 255, 0.1)", border: "1px solid rgba(0, 242, 255, 0.2)" }}
                  >
                    <Terminal size={22} style={{ color: "#00F2FF" }} />
                  </div>
                  <span
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: "#00F2FF" }}
                  >
                    Hands-On Training
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Cybersecurity Labs
                </h1>
                <p className="text-slate-400 text-sm max-w-lg">
                  Learn cyber security the hands-on way — interactive, browser-based labs covering web security, forensics, networking, and more.
                </p>
              </div>

              {/* Stats counters */}
              <div className="flex items-center gap-6">
                {[
                  { val: labs.length || "—", label: "Hands-on Labs", icon: <Terminal size={16} /> },
                  { val: labs.filter((l) => !l.isPremium).length || "—", label: "Free Labs", icon: <Shield size={16} /> },
                  { val: Object.values(userProgress).filter((p) => p.completed).length, label: "Completed", icon: <CheckCircle2 size={16} /> },
                ].map(({ val, label, icon }) => (
                  <div key={label} className="text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1" style={{ color: "#00F2FF" }}>
                      {icon}
                    </div>
                    <p className="text-2xl font-extrabold text-white">{val}</p>
                    <p className="text-xs text-slate-400 whitespace-nowrap">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ═══ TABS + FILTERS BAR ═══ */}
        <div style={{ background: "#0d1829", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4 overflow-x-auto">
              {/* Category tabs */}
              <div className="flex items-center gap-0">
                {tabs.map((tab) => {
                  const isActive = filters.type === tab.type;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setFilter("type", tab.type)}
                      className="relative px-5 py-3.5 text-sm font-semibold transition-colors whitespace-nowrap"
                      style={{
                        color: isActive ? "#00F2FF" : "#94A3B8",
                      }}
                    >
                      {tab.label}
                      {isActive && (
                        <div
                          className="absolute bottom-0 left-0 right-0 h-[2px]"
                          style={{ background: "#00F2FF" }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Right side: search + filter controls */}
              <div className="flex items-center gap-3 py-2">
                {/* Search */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    className="pl-9 pr-8 py-2 rounded-lg text-sm transition-all w-48 focus:w-64"
                    style={{
                      background: "#1a2332",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#fff",
                      outline: "none",
                    }}
                    placeholder="Search labs…"
                    value={filters.search}
                    onChange={(e) => setFilter("search", e.target.value)}
                    onFocus={(e) => e.target.style.borderColor = "rgba(0, 242, 255, 0.4)"}
                    onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
                  />
                  {filters.search && (
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                      onClick={() => setFilter("search", "")}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Mobile filter button */}
                <button
                  className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold"
                  style={{ background: "#1a2332", color: "#94A3B8", border: "1px solid rgba(255,255,255,0.08)" }}
                  onClick={() => setMobileOpen(true)}
                >
                  <Filter size={14} /> Filters
                  {activeCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded text-xs font-bold" style={{ background: "#00F2FF", color: "#0a1128" }}>
                      {activeCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ FILTER CHIPS + SORT BAR ═══ */}
        <div style={{ background: "#0f1d2e" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Difficulty chips + subscription */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Subscription filter */}
                {["all", "free", "premium"].map((sub) => {
                  const isActive = filters.subscription === sub;
                  return (
                    <button
                      key={sub}
                      onClick={() => setFilter("subscription", sub)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: isActive ? "rgba(136,230,54,0.12)" : "rgba(255,255,255,0.03)",
                        color: isActive ? "#88E636" : "#64748B",
                        border: `1px solid ${isActive ? "rgba(136,230,54,0.25)" : "rgba(255,255,255,0.06)"}`,
                      }}
                    >
                      {sub === "all" ? "All" : sub === "free" ? "Free" : "Premium"}
                    </button>
                  );
                })}
                <div className="w-px h-5 mx-1" style={{ background: "rgba(255,255,255,0.08)" }} />
                {/* Difficulty chips */}
                {diffChips.map(({ label, color }) => {
                  const isActive = filters.difficulties?.includes(label);
                  return (
                    <button
                      key={label}
                      onClick={() =>
                        setFilter(
                          "difficulties",
                          isActive
                            ? filters.difficulties.filter((x) => x !== label)
                            : [...(filters.difficulties || []), label],
                        )
                      }
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: isActive ? `${color}18` : "rgba(255,255,255,0.03)",
                        color: isActive ? color : "#64748B",
                        border: `1px solid ${isActive ? `${color}40` : "rgba(255,255,255,0.06)"}`,
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
                {activeCount > 0 && (
                  <button
                    onClick={clearAll}
                    className="px-2 py-1 rounded text-xs font-semibold text-slate-500 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <X size={12} /> Clear
                  </button>
                )}
              </div>

              {/* Right: sort + view toggle + results count */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">
                  {loading ? "Loading…" : `${sorted.length} labs`}
                </span>
                <div className="relative">
                  <select
                    className="appearance-none pl-3 pr-7 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                    style={{
                      background: "#1a2332",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#CBD5E1",
                      outline: "none",
                    }}
                    value={sortBy}
                    onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                  >
                    <option value="newest">Newest</option>
                    <option value="popular">Popular</option>
                    <option value="rating">Top Rated</option>
                    <option value="xp">Highest XP</option>
                    <option value="shortest">Shortest</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
                <div className="flex items-center gap-0.5 rounded-lg p-0.5" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <button
                    className="p-1.5 rounded transition-colors"
                    style={{
                      background: viewMode === "grid" ? "rgba(136,230,54,0.12)" : "transparent",
                      color: viewMode === "grid" ? "#88E636" : "#64748B",
                    }}
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid size={14} />
                  </button>
                  <button
                    className="p-1.5 rounded transition-colors"
                    style={{
                      background: viewMode === "list" ? "rgba(0, 242, 255, 0.12)" : "transparent",
                      color: viewMode === "list" ? "#00F2FF" : "#64748B",
                    }}
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
            <div className={`grid gap-5 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl overflow-hidden animate-pulse"
                  style={{ background: "#1a2332", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="h-36" style={{ background: "#111a27" }} />
                  <div className="p-4 space-y-3">
                    <div className="h-4 rounded w-3/4" style={{ background: "rgba(255,255,255,0.06)" }} />
                    <div className="h-3 rounded w-1/2" style={{ background: "rgba(255,255,255,0.04)" }} />
                    <div className="h-2 rounded w-5/6" style={{ background: "rgba(255,255,255,0.03)" }} />
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
              <button
                className="mt-4 px-6 py-2.5 rounded-lg font-bold text-sm transition-all hover:brightness-110"
                style={{ background: "linear-gradient(135deg, #00F2FF, #0099CC)", color: "#0a1128" }}
                onClick={() => fetchLabs()}
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && sorted.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="p-4 rounded-xl mb-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <Target size={32} className="text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No labs match your filters</h3>
              <p className="text-slate-400 text-sm mb-6">Try adjusting your search or clearing all filters.</p>
              <button
                className="px-6 py-2.5 rounded-lg font-bold text-sm transition-all hover:brightness-110"
                style={{ background: "linear-gradient(135deg, #00F2FF, #0099CC)", color: "#0a1128" }}
                onClick={clearAll}
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Grid / List */}
          {!loading && !error && sorted.length > 0 && (
            <div className={`grid gap-5 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
              {paginated.map((lab) =>
                viewMode === "grid" ? (
                  <LabCard key={lab.id} lab={lab} progress={userProgress[lab.id]} isPremiumUser={isPremiumUser} />
                ) : (
                  <LabRow key={lab.id} lab={lab} progress={userProgress[lab.id]} isPremiumUser={isPremiumUser} />
                ),
              )}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-10">
              <button
                className="flex items-center gap-1 px-3 py-2 rounded-lg font-semibold text-sm transition-colors disabled:opacity-40"
                style={{ background: "#1a2332", color: "#CBD5E1", border: "1px solid rgba(255,255,255,0.06)" }}
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    className="w-9 h-9 rounded-lg font-semibold text-sm transition-all"
                    style={{
                      background: page === i + 1 ? "#00F2FF" : "#1a2332",
                      color: page === i + 1 ? "#0a1128" : "#94A3B8",
                      border: page === i + 1 ? "none" : "1px solid rgba(255,255,255,0.06)",
                    }}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                className="flex items-center gap-1 px-3 py-2 rounded-lg font-semibold text-sm transition-colors disabled:opacity-40"
                style={{ background: "#1a2332", color: "#CBD5E1", border: "1px solid rgba(255,255,255,0.06)" }}
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* ═══ MOBILE FILTER DRAWER ═══ */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm flex flex-col" style={{ background: "#0d1829" }}>
              <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <h2 className="text-lg font-bold text-white">Filters</h2>
                <button className="p-2 rounded-lg transition-colors" style={{ background: "rgba(255,255,255,0.04)" }} onClick={() => setMobileOpen(false)}>
                  <X size={18} className="text-slate-400" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Subscription */}
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-500 mb-3 tracking-wider">Subscription</h4>
                  <div className="flex flex-wrap gap-2">
                    {["all", "free", "premium"].map((sub) => (
                      <button
                        key={sub}
                        onClick={() => setFilter("subscription", sub)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={{
                          background: filters.subscription === sub ? "rgba(136,230,54,0.12)" : "rgba(255,255,255,0.03)",
                          color: filters.subscription === sub ? "#88E636" : "#64748B",
                          border: `1px solid ${filters.subscription === sub ? "rgba(136,230,54,0.25)" : "rgba(255,255,255,0.06)"}`,
                        }}
                      >
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
                        <button
                          key={label}
                          onClick={() => setFilter("difficulties", on ? filters.difficulties.filter((x) => x !== label) : [...(filters.difficulties || []), label])}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                          style={{
                            background: on ? `${color}18` : "rgba(255,255,255,0.03)",
                            color: on ? color : "#64748B",
                            border: `1px solid ${on ? `${color}40` : "rgba(255,255,255,0.06)"}`,
                          }}
                        >
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
                          <button
                            key={t}
                            onClick={() => setFilter("tags", on ? filters.tags.filter((x) => x !== t) : [...(filters.tags || []), t])}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                            style={{
                              background: on ? "rgba(136,230,54,0.12)" : "rgba(255,255,255,0.03)",
                              color: on ? "#88E636" : "#64748B",
                              border: `1px solid ${on ? "rgba(136,230,54,0.25)" : "rgba(255,255,255,0.06)"}`,
                            }}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="p-5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <button
                  className="w-full px-4 py-3 rounded-lg font-bold text-sm transition-all hover:brightness-110"
                  style={{ background: "#88E636", color: "#0a1128" }}
                  onClick={() => setMobileOpen(false)}
                >
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

Labs.displayName = "Labs";
export default Labs;
