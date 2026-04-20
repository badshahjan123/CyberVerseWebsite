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
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ProtectedRoute } from "../../components/protected-route";
import { useApp } from "../../contexts/app-context";
import axios from "../../api/axios";
import "./Labs.css";

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
            className="labs-diff-bar"
            data-active={i <= bars ? "true" : "false"}
            data-color={level}
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
      <span className="labs-diff-label" data-level={level} style={{ color }}>
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

/* ─── Lab Card (Grid mode — premium redesign) ─── */
const LabCard = memo(({ lab, progress, isPremiumUser }) => {
  const slug = lab.slug || lab.id;
  const isCompleted = progress?.completed || false;
  const progressPct = progress?.progress || (isCompleted ? 100 : 0);
  const isInProgress = progressPct > 0 && !isCompleted;
  const isLocked = lab.isPremium && !isPremiumUser;

  /* accent color for the top glow line */
  const accentColor = isCompleted
    ? "#10B981"
    : lab.difficulty === "Easy" || lab.difficulty === "Beginner"
    ? "#39FF14"
    : lab.difficulty === "Medium"
    ? "#F59E0B"
    : lab.difficulty === "Hard"
    ? "#EF4444"
    : lab.difficulty === "Insane"
    ? "#B91C1C"
    : "#00D1FF";

  return (
    <div
      className={`labs-card group relative rounded-2xl overflow-hidden flex flex-col ${
        isCompleted ? "labs-card--completed" : ""
      } ${isLocked ? "labs-card--locked" : ""}`}
    >
      {/* Top accent glow line — colour-coded by difficulty */}
      <div className="labs-card__accent-line" style={{ background: accentColor, boxShadow: `0 0 12px ${accentColor}99` }} />

      {/* ── HERO IMAGE ── */}
      <div className="relative overflow-hidden labs-card__hero">
        <img
          src={lab.coverImage || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800"}
          alt={lab.title}
          loading="lazy"
          className="labs-card__hero-img"
        />
        {/* cinematic gradient — stronger at bottom so text sits on it */}
        <div className="labs-card__hero-gradient" />

        {/* ── Floating chips (top-left) ── */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {/* Premium / Free */}
          {lab.isPremium ? (
            <span className="labs-badge labs-badge--premium">
              <Crown size={8} /> PRO
            </span>
          ) : (
            <span className="labs-badge labs-badge--free">FREE</span>
          )}
          {/* Type */}
          {lab.type === "ctf" ? (
            <span className="labs-badge labs-badge--type-ctf"><Trophy size={8} /> CTF</span>
          ) : (
            <span className="labs-badge labs-badge--type-lab"><Terminal size={8} /> Lab</span>
          )}
        </div>

        {/* ── Status chip (top-right) ── */}
        <div className="absolute top-3 right-3">
          {isCompleted && (
            <span className="labs-badge labs-badge--completed">
              <CheckCircle2 size={8} /> Done
            </span>
          )}
          {isInProgress && (
            <span className="labs-badge labs-badge--inprogress">
              <Clock size={8} /> {progressPct}%
            </span>
          )}
        </div>

        {/* ── Title sits on the image gradient at bottom ── */}
        <div className="labs-card__hero-title-block">
          <h3 className="labs-card__title">{lab.title}</h3>
          <DifficultyBars level={lab.difficulty} />
        </div>

        {/* Lock overlay */}
        {isLocked && (
          <div className="absolute inset-0 labs-card__lock-overlay">
            <div className="labs-card__lock-icon">
              <Lock size={22} className="labs-icon-orange" />
            </div>
            <Link to="/premium" className="labs-upgrade-btn">Unlock Pro</Link>
          </div>
        )}

        {/* ── Hover CTA overlay — slides up from bottom ── */}
        {!isLocked && (
          <div className="labs-card__hover-overlay">
            {isCompleted ? (
              <Link to={`/labs/${slug}`} className="labs-hover-cta labs-hover-cta--completed">
                <RotateCcw size={14} /> Replay Lab
              </Link>
            ) : (
              <Link to={`/labs/${slug}`} className="labs-hover-cta labs-hover-cta--start btn-primary">
                <Play size={14} /> {progressPct > 0 ? "Resume" : "Start Lab"}
              </Link>
            )}
          </div>
        )}
      </div>

      {/* ── BODY ── */}
      <div className="labs-card__body">
        {/* Description */}
        <p className="labs-card__desc">
          {lab.description || lab.short_description || `By ${lab.creator || "CyberVerse Team"}`}
        </p>

        {/* ── Stat pills row ── */}
        <div className="labs-card__stat-row">
          <span className="labs-stat-pill">
            <Users size={10} /> {lab.participants || 0}
          </span>
          <span className="labs-stat-pill">
            <Clock size={10} /> {lab.duration || "30m"}
          </span>
          <span className="labs-stat-pill labs-stat-pill--xp">
            <Zap size={10} /> {lab.points || 100} XP
          </span>
        </div>

        {/* ── Progress bar ── */}
        {progressPct > 0 && !isCompleted && (
          <div className="labs-card__progress">
            <div className="labs-card__progress-labels">
              <span>Progress</span>
              <span className="labs-text-cyan">{progressPct}%</span>
            </div>
            <div className="labs-progress-track">
              <div className="labs-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        )}

        {/* ── Footer: only show for locked (hover overlay handles start/replay) ── */}
        {isLocked && (
          <div className="labs-card__footer">
            <Link to="/premium" className="labs-cta-btn labs-cta-btn--locked flex-1">
              <Lock size={12} /> Locked — Upgrade
            </Link>
          </div>
        )}
      </div>
    </div>
  );
});
LabCard.displayName = "LabCard";

/* ─── Lab List Row ─── */
const LabRow = memo(({ lab, progress, isPremiumUser }) => {
  const slug = lab.slug || lab.id;
  const isCompleted = progress?.completed || false;
  const progressPct = progress?.progress || (isCompleted ? 100 : 0);
  const isInProgress = progressPct > 0 && !isCompleted;
  const isLocked = lab.isPremium && !isPremiumUser;

  return (
    <div
      className={`labs-row group flex items-center gap-4 p-3 rounded-xl ${isCompleted ? "labs-row--completed" : ""}`}
    >
      <div className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 labs-card__image">
        <img
          src={lab.coverImage || "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=180"}
          alt={lab.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-70"
        />
        {isLocked && (
          <div className="absolute inset-0 labs-card__lock-overlay">
            <Lock size={14} className="labs-icon-orange" />
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-white text-[13px] line-clamp-1 labs-card__title leading-tight">
            {lab.title}
          </h3>
          {isInProgress && (
            <span className="labs-badge labs-badge--inprogress labs-badge--sm">
              {progressPct}%
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <DifficultyBars level={lab.difficulty} />
          {lab.type === "ctf" ? (
            <span className="text-[9px] font-extrabold uppercase labs-text-orange">CTF</span>
          ) : (
            <span className="text-[9px] font-extrabold uppercase labs-text-cyan">Labs</span>
          )}
        </div>
        <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold">
          <span className="flex items-center gap-1"><Users size={11} /> {lab.participants || 0}</span>
          <span className="labs-xp-badge"><Zap size={11} /> {lab.points || 100} XP</span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {isLocked ? (
          <Link to="/premium" className="labs-cta-btn labs-cta-btn--locked labs-cta-btn--sm">
            Unlock
          </Link>
        ) : isCompleted ? (
          <Link to={`/labs/${slug}`} className="labs-cta-btn labs-cta-btn--completed labs-cta-btn--sm">
            Replay
          </Link>
        ) : (
          <Link to={`/labs/${slug}`} className="labs-cta-btn labs-cta-btn--start labs-cta-btn--row labs-cta-btn--sm">
            <Play size={11} /> {progressPct > 0 ? "Resume" : "Start"}
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
    { label: "Easy", cls: "labs-chip--easy" },
    { label: "Medium", cls: "labs-chip--medium" },
    { label: "Hard", cls: "labs-chip--hard" },
    { label: "Insane", cls: "labs-chip--insane" },
  ];

  return (
    <ProtectedRoute>
      {/* ═══ PAGE WRAPPER — exact same background as Dashboard ═══ */}
      <div className="labs-page min-h-screen text-white relative overflow-x-hidden">
        {/* dot grid — same as Dashboard + Home */}
        <div className="absolute inset-0 z-0 pointer-events-none labs-page__grid" />
        {/* dark overlay — same as Dashboard */}
        <div className="absolute inset-0 z-0 pointer-events-none labs-page__overlay" />

        <div className="relative z-10">

        {/* ═══ HERO HEADER ═══ */}
        <div className="relative overflow-hidden labs-hero">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="labs-hero__icon-box">
                    <Terminal size={22} className="labs-icon-cyan" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest labs-text-cyan">
                    Hands-On Training
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
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
                  <div key={label} className="text-center labs-stat-counter">
                    <div className="flex items-center justify-center gap-1.5 mb-1 labs-text-cyan">
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
        <div className="labs-toolbar">
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
                      className={`labs-tab ${isActive ? "labs-tab--active" : ""}`}
                    >
                      {tab.label}
                      {isActive && (
                        <div className="labs-tab__indicator" />
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
                    className="labs-search-input"
                    placeholder="Search labs…"
                    value={filters.search}
                    onChange={(e) => setFilter("search", e.target.value)}
                  />
                  {filters.search && (
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors duration-200"
                      onClick={() => setFilter("search", "")}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Mobile filter button */}
                <button
                  className="md:hidden labs-filter-mobile-btn"
                  onClick={() => setMobileOpen(true)}
                >
                  <Filter size={14} /> Filters
                  {activeCount > 0 && (
                    <span className="labs-filter-count">{activeCount}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ FILTER CHIPS + SORT BAR ═══ */}
        <div className="labs-chipbar">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Difficulty chips + subscription */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Subscription filter — no inline style */}
                {["all", "free", "premium"].map((sub) => {
                  const isActive = filters.subscription === sub;
                  return (
                    <button
                      key={sub}
                      onClick={() => setFilter("subscription", sub)}
                      className={`labs-chip labs-chip--green ${isActive ? "labs-chip--active" : ""}`}
                    >
                      {sub === "all" ? "All" : sub === "free" ? "Free" : "Premium"}
                    </button>
                  );
                })}
                <div className="labs-chipbar__divider" />
                {/* Difficulty chips — class-based colors, NO inline style */}
                {diffChips.map(({ label, cls }) => {
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
                      className={`labs-chip ${cls} ${isActive ? "labs-chip--active" : ""}`}
                    >
                      {label}
                    </button>
                  );
                })}
                {/* Clear Filters button */}
                {activeCount > 0 && (
                  <button
                    onClick={clearAll}
                    className="labs-clear-btn"
                  >
                    <X size={12} /> Clear All
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
                    className="labs-sort-select"
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
                <div className="labs-view-toggle">
                  <button
                    className={`labs-view-btn ${viewMode === "grid" ? "labs-view-btn--active" : ""}`}
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid size={14} />
                  </button>
                  <button
                    className={`labs-view-btn ${viewMode === "list" ? "labs-view-btn--active" : ""}`}
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
                <div key={i} className="labs-skeleton rounded-xl overflow-hidden">
                  <div className="h-36 labs-skeleton__img" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 rounded w-3/4 labs-skeleton__line" />
                    <div className="h-3 rounded w-1/2 labs-skeleton__line labs-skeleton__line--dim" />
                    <div className="h-2 rounded w-5/6 labs-skeleton__line labs-skeleton__line--dimmer" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="labs-empty-state">
              <div className="labs-empty-state__icon labs-empty-state__icon--error">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{error}</h3>
              <button
                className="labs-cta-btn labs-cta-btn--start mt-4"
                onClick={() => fetchLabs()}
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && sorted.length === 0 && (
            <div className="labs-empty-state">
              <div className="labs-empty-state__icon">
                <Target size={40} className="labs-icon-cyan" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No labs match your filters</h3>
              <p className="text-slate-400 text-sm mb-2 max-w-md text-center">
                We couldn't find any labs matching your current criteria. Try adjusting your search, removing difficulty filters, or clearing all filters.
              </p>
              {activeCount > 0 && (
                <p className="text-xs text-slate-500 mb-4">
                  {activeCount} active filter{activeCount > 1 ? "s" : ""} applied
                </p>
              )}
              <button
                className="labs-cta-btn labs-cta-btn--start"
                onClick={clearAll}
              >
                Clear All Filters
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
                className="labs-pagination-btn"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    className={`labs-pagination-num ${page === i + 1 ? "labs-pagination-num--active" : ""}`}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                className="labs-pagination-btn"
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
            <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm flex flex-col labs-mobile-drawer">
              <div className="flex items-center justify-between p-5 labs-mobile-drawer__header">
                <h2 className="text-lg font-bold text-white">Filters</h2>
                <button className="p-2 rounded-lg labs-mobile-drawer__close" onClick={() => setMobileOpen(false)}>
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
                        className={`labs-chip labs-chip--green ${filters.subscription === sub ? "labs-chip--active" : ""}`}
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
                    {diffChips.map(({ label, cls }) => {
                      const on = filters.difficulties?.includes(label);
                      return (
                        <button
                          key={label}
                          onClick={() => setFilter("difficulties", on ? filters.difficulties.filter((x) => x !== label) : [...(filters.difficulties || []), label])}
                          className={`labs-chip ${cls} ${on ? "labs-chip--active" : ""}`}
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
                            className={`labs-chip labs-chip--green ${on ? "labs-chip--active" : ""}`}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="p-5 labs-mobile-drawer__footer">
                <button
                  className="w-full labs-cta-btn labs-cta-btn--start labs-cta-btn--row"
                  onClick={() => setMobileOpen(false)}
                >
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

Labs.displayName = "Labs";
export default Labs;
