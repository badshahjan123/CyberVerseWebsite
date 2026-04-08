import { useState, useMemo, memo, useCallback, useEffect, useRef } from "react"
import {
  Users, Zap, Filter, Clock, Crown, Search, ChevronDown,
  Flame, Trophy, X, Play, BookOpen, TrendingUp, Bookmark,
  BookmarkCheck, SlidersHorizontal, Shield, Target, ChevronLeft,
  ChevronRight, CheckCircle2, RotateCcw, ArrowRight, Grid, List, Globe
} from "lucide-react"
import { Link } from "react-router-dom"
import { getRooms } from "../../services/rooms"
import { useBookmarks } from "../../contexts/bookmark-context"
import { useApp } from "../../contexts/app-context"
import { ProtectedRoute } from "../../components/protected-route"

/* ─── Difficulty config ─── */
const DIFF = {
  Beginner:     { color: "#39FF14", bg: "rgba(57,255,20,0.1)",   border: "rgba(57,255,20,0.25)",   bar: 25  },
  Easy:         { color: "#39FF14", bg: "rgba(57,255,20,0.1)",   border: "rgba(57,255,20,0.25)",   bar: 35  },
  Intermediate: { color: "#FACC15", bg: "rgba(250,204,21,0.1)",  border: "rgba(250,204,21,0.25)",  bar: 60  },
  Medium:       { color: "#FACC15", bg: "rgba(250,204,21,0.1)",  border: "rgba(250,204,21,0.25)",  bar: 55  },
  Advanced:     { color: "#F97316", bg: "rgba(249,115,22,0.1)",  border: "rgba(249,115,22,0.25)",  bar: 80  },
  Hard:         { color: "#F97316", bg: "rgba(249,115,22,0.1)",  border: "rgba(249,115,22,0.25)",  bar: 80  },
  Insane:       { color: "#FF3D71", bg: "rgba(255,61,113,0.1)",  border: "rgba(255,61,113,0.25)",  bar: 100 },
}
const getDiff = d => DIFF[d] || { color: "#94A3B8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.18)", bar: 50 }

/* ─── Category icon colours ─── */
const CAT_COLORS = {
  Web:         { icon: <Globe size={13}/>,   color: "#00F5FF" },
  Networking:  { icon: <Shield size={13}/>,  color: "#8B5CF6" },
  Development: { icon: <Zap size={13}/>,     color: "#39FF14" },
  DevOps:      { icon: <Target size={13}/>,  color: "#FACC15" },
  Misc:        { icon: <Trophy size={13}/>,  color: "#F97316" },
}
const getCat = c => CAT_COLORS[c] || { icon: <BookOpen size={13}/>, color: "#64748B" }

/* ─── Placeholder image per category — multiple fallbacks ─── */
const CAT_IMG = {
  Web:         "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=600",
  Networking:  "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=600",
  Development: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=600",
  DevOps:      "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?auto=format&fit=crop&q=80&w=600",
  Misc:        "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=600",
}
const ULTIMATE_FALLBACK = "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600"
const getRoomImg = c => CAT_IMG[c] || ULTIMATE_FALLBACK

/* ─── Local / hardcoded rooms (not from API) ─── */
const LOCAL_ROOMS = [
  {
    _id: "local-web-app-pentesting",
    id: "local-web-app-pentesting",
    slug: "web-app-pentesting",
    title: "Web App Pentesting Mastery",
    short_description: "Learn how real hackers identify, analyze, and exploit vulnerabilities in web applications using industry tools and techniques.",
    category: "Web",
    difficulty: "Advanced",
    estimated_time_minutes: 90,
    points: 2500,
    tags: ["web-security", "pentesting", "owasp", "sql-injection", "xss"],
    topics: Array(5).fill(null),
    cover_image_url: "/images/rooms/attack-surface.png",
    subscriberOnly: false,
    isPremium: false,
    completedBy: Array(4827).fill(null),
    createdAt: "2026-03-26T00:00:00.000Z",
    customRoute: "/rooms/web-app-pentesting",
    isLocal: true,
  },
  {
    _id: "local-rest-api-mastery",
    id: "local-rest-api-mastery",
    slug: "rest-api-mastery",
    title: "Introduction to RESTful APIs",
    short_description: "Master the basics of REST APIs, HTTP methods, status codes, and JSON data structures.",
    category: "Development",
    difficulty: "Beginner",
    estimated_time_minutes: 40,
    points: 1300,
    tags: ["api", "rest", "backend", "http", "express"],
    topics: Array(5).fill(null),
    cover_image_url: "/images/rooms/api-intro.png",
    completedBy: Array(4827).fill(null),
    createdAt: "2026-03-26T00:00:00.000Z",
    customRoute: "/rooms/rest-api-mastery",
    isLocal: true,
  },
  {
    _id: "local-networking-fundamentals",
    id: "local-networking-fundamentals",
    slug: "networking-fundamentals",
    title: "Networking Fundamentals",
    short_description: "Learn the core concepts of networking: OSI model, IP addressing, TCP/UDP, and routing.",
    category: "Networking",
    difficulty: "Beginner",
    estimated_time_minutes: 60,
    points: 1550,
    tags: ["networking", "osi-model", "tcp-ip", "routing", "dns"],
    topics: Array(5).fill(null),
    cover_image_url: "/images/rooms/osi-model.png",
    completedBy: Array(1250).fill(null),
    createdAt: "2026-03-26T00:00:00.000Z",
    customRoute: "/rooms/networking-fundamentals",
    isLocal: true,
  }
]

/* ─── Image with fallback chain ─── */
const RoomImg = memo(({ src, category, alt, className }) => {
  const [imgSrc, setImgSrc] = useState(src || getRoomImg(category))
  const fallbacks = [getRoomImg(category), ULTIMATE_FALLBACK]
  const fallbackIdx = useRef(0)

  useEffect(() => {
    setImgSrc(src || getRoomImg(category))
    fallbackIdx.current = 0
  }, [src, category])

  const handleError = () => {
    const next = fallbacks[fallbackIdx.current]
    if (next && next !== imgSrc) {
      fallbackIdx.current++
      setImgSrc(next)
    }
  }

  return <img src={imgSrc} alt={alt} onError={handleError} className={className} loading="lazy"/>
})
RoomImg.displayName = "RoomImg"

/* ─── Room Card ─── */
const RoomCard = memo(({ room, userProgress, isBookmarked, onBookmark }) => {
  const dm  = getDiff(room.difficulty)
  const cat = getCat(room.category)
  const prog = userProgress || null
  const isCompleted = prog?.completed || false
  const isStarted   = prog?.joined || (prog?.completedLectures?.length > 0)
  const pct = isCompleted ? 100 :
    (room.topics?.length > 0 && prog?.completedLectures?.length > 0)
      ? Math.round((prog.completedLectures.length / room.topics.length) * 100)
      : 0
  const completions = room.completedBy?.length || 0
  const xp = room.points || (room.exercises?.reduce((s, e) => s + (e.points || 0), 0)) || 500
  const roomLink = room.customRoute || `/rooms/${room.slug}`

  const handleBookmark = e => { e.preventDefault(); e.stopPropagation(); onBookmark(room) }

  return (
    <div className={`rp-card ${isCompleted ? "rp-card--done" : ""}`}>
      {/* Thumbnail */}
      <div className="rp-card-img-wrap">
        <RoomImg
          src={room.cover_image_url}
          category={room.category}
          alt={room.title}
          className="rp-card-img"
        />
        {/* Difficulty progress bar */}
        <div className="rp-diff-bar-track">
          <div className="rp-diff-bar-fill" style={{ width: `${dm.bar}%`, background: dm.color }}/>
        </div>
        {/* Top badges */}
        <div className="rp-card-top-r">
          {room.subscriberOnly || room.isPremium
            ? <span className="rp-badge rp-badge--pro"><Crown size={9}/> PRO</span>
            : <span className="rp-badge rp-badge--free">FREE</span>
          }
          {isCompleted && <span className="rp-badge rp-badge--done"><CheckCircle2 size={9}/> Done</span>}
        </div>
        {/* Category tag bottom-left */}
        <div className="rp-card-bot-l">
          <span className="rp-cat-tag" style={{ borderColor: `${cat.color}40`, color: cat.color, background: `${cat.color}12` }}>
            {cat.icon} {room.category}
          </span>
        </div>
        {/* Bookmark top-left */}
        <button className={`rp-bm-btn ${isBookmarked ? "rp-bm-btn--on" : ""}`} onClick={handleBookmark} aria-label="Bookmark">
          {isBookmarked ? <BookmarkCheck size={14}/> : <Bookmark size={14}/>}
        </button>
      </div>

      {/* Body */}
      <div className="rp-card-body">
        <h3 className="rp-card-title">{room.title}</h3>
        <p className="rp-card-desc">{room.short_description}</p>

        {/* Meta row */}
        <div className="rp-card-meta">
          <span className="rp-meta-item"><Clock size={11}/> {room.estimated_time_minutes || "—"} min</span>
          <span className="rp-meta-item"><Users size={11}/> {completions}</span>
          <span className="rp-meta-item rp-meta-item--xp"><Zap size={11}/> {xp} XP</span>
        </div>

        {/* Difficulty badge */}
        <div className="rp-diff-row">
          <span className="rp-diff-pill"
            style={{ color: dm.color, background: dm.bg, border: `1px solid ${dm.border}` }}>
            {room.difficulty}
          </span>
          {room.topics?.length > 0 && (
            <span className="rp-topic-count"><BookOpen size={10}/> {room.topics.length} topics</span>
          )}
        </div>

        {/* Progress bar if started */}
        {pct > 0 && !isCompleted && (
          <div className="rp-prog-row">
            <div className="rp-prog-track"><div className="rp-prog-fill" style={{ width: `${pct}%` }}/></div>
            <span className="rp-prog-pct">{pct}%</span>
          </div>
        )}

        {/* CTA */}
        <div className="rp-card-cta">
          {isCompleted ? (
            <Link to={roomLink} className="rp-btn rp-btn--done">
              <RotateCcw size={13}/> Replay
            </Link>
          ) : isStarted ? (
            <Link to={roomLink} className="rp-btn rp-btn--resume">
              <Play size={13}/> Resume
            </Link>
          ) : (
            <Link to={roomLink} className="rp-btn rp-btn--start">
              <Play size={13}/> Enter Room
            </Link>
          )}
          <Link to={roomLink} className="rp-btn rp-btn--icon" aria-label="Details">
            <ArrowRight size={14}/>
          </Link>
        </div>
      </div>
    </div>
  )
})
RoomCard.displayName = "RoomCard"

/* ─── Room Row (list mode) ─── */
const RoomRow = memo(({ room, userProgress, isBookmarked, onBookmark }) => {
  const dm  = getDiff(room.difficulty)
  const cat = getCat(room.category)
  const prog = userProgress || null
  const isCompleted = prog?.completed || false
  const isStarted   = prog?.joined || (prog?.completedLectures?.length > 0)
  const xp = room.points || 500
  const roomLink = room.customRoute || `/rooms/${room.slug}`
  const handleBookmark = e => { e.preventDefault(); e.stopPropagation(); onBookmark(room) }

  return (
    <div className={`rp-row ${isCompleted ? "rp-row--done" : ""}`}>
      <RoomImg src={room.cover_image_url} category={room.category} alt={room.title} className="rp-row-img"/>
      <div className="rp-row-body">
        <div className="rp-row-top">
          <div>
            <h3 className="rp-row-title">{room.title}</h3>
            <p className="rp-row-desc">{room.short_description}</p>
          </div>
          <div className="rp-row-badges">
            {room.subscriberOnly || room.isPremium
              ? <span className="rp-badge rp-badge--pro"><Crown size={9}/> PRO</span>
              : <span className="rp-badge rp-badge--free">FREE</span>
            }
            <span className="rp-cat-tag" style={{ borderColor: `${cat.color}40`, color: cat.color, background: `${cat.color}12` }}>
              {cat.icon} {room.category}
            </span>
            <span className="rp-diff-pill" style={{ color: dm.color, background: dm.bg, border: `1px solid ${dm.border}` }}>
              {room.difficulty}
            </span>
          </div>
        </div>
        <div className="rp-row-meta">
          <span className="rp-meta-item"><Clock size={11}/> {room.estimated_time_minutes || "—"} min</span>
          <span className="rp-meta-item"><Users size={11}/> {room.completedBy?.length || 0} completed</span>
          <span className="rp-meta-item rp-meta-item--xp"><Zap size={11}/> {xp} XP</span>
          {room.topics?.length > 0 && <span className="rp-meta-item"><BookOpen size={11}/> {room.topics.length} topics</span>}
        </div>
      </div>
      <div className="rp-row-actions">
        <button className={`rp-bm-btn-sm ${isBookmarked ? "rp-bm-btn-sm--on" : ""}`} onClick={handleBookmark}>{isBookmarked ? <BookmarkCheck size={13}/> : <Bookmark size={13}/>}</button>
        {isCompleted
          ? <Link to={roomLink} className="rp-btn rp-btn--done"><RotateCcw size={13}/> Replay</Link>
          : isStarted
            ? <Link to={roomLink} className="rp-btn rp-btn--resume"><Play size={13}/> Resume</Link>
            : <Link to={roomLink} className="rp-btn rp-btn--start"><Play size={13}/> Enter</Link>
        }
      </div>
    </div>
  )
})
RoomRow.displayName = "RoomRow"

/* ─── Filter Panel ─── */
const FilterPanel = memo(({ filters, setFilter, clearAll, categories, activeCount, allTags }) => {
  const [open, setOpen] = useState({ diff: true, type: true, cat: true, tags: false })
  const tog = k => setOpen(p => ({ ...p, [k]: !p[k] }))

  const Sec = ({ k, label, children }) => (
    <div className="rp-fs">
      <button className="rp-fs-head" onClick={() => tog(k)}>
        <span>{label}</span>
        <ChevronDown size={13} style={{ transform: open[k] ? "rotate(180deg)" : "none", transition: "0.2s" }}/>
      </button>
      {open[k] && <div className="rp-fs-body">{children}</div>}
    </div>
  )

  return (
    <div className="rp-panel">
      <div className="rp-panel-head">
        <span className="rp-panel-title"><SlidersHorizontal size={13}/> Filters</span>
        {activeCount > 0 && (
          <button className="rp-panel-clear" onClick={clearAll}><X size={10}/> Clear {activeCount}</button>
        )}
      </div>

      {/* Search */}
      <div className="rp-search-wrap">
        <Search size={13} className="rp-search-ico"/>
        <input className="rp-search-inp" placeholder="Search rooms…" value={filters.search}
          onChange={e => setFilter("search", e.target.value)}/>
        {filters.search && <button className="rp-search-clr" onClick={() => setFilter("search", "")}><X size={11}/></button>}
      </div>

      {/* Subscription */}
      <Sec k="sub" label="Subscription">
        {[["all","All Rooms"],["free","Free Only"],["premium","Premium Only"]].map(([v,l]) => (
          <label key={v} className={`rp-opt ${filters.subscription === v ? "rp-opt--on" : ""}`}>
            <input type="radio" name="rp-sub" checked={filters.subscription === v} onChange={() => setFilter("subscription", v)}/>
            <span>{l}</span>
          </label>
        ))}
      </Sec>

      {/* Category */}
      <Sec k="cat" label="Category">
        {categories.map(c => (
          <label key={c} className={`rp-opt ${filters.category === c ? "rp-opt--on" : ""}`}>
            <input type="radio" name="rp-cat" checked={filters.category === c} onChange={() => setFilter("category", c)}/>
            <span style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ color: getCat(c).color }}>{getCat(c).icon}</span> {c}
            </span>
          </label>
        ))}
      </Sec>

      {/* Difficulty */}
      <Sec k="diff" label="Difficulty">
        {[["Beginner","#39FF14"],["Intermediate","#FACC15"],["Advanced","#F97316"]].map(([d,col]) => {
          const on = filters.difficulties?.includes(d)
          return (
            <label key={d} className={`rp-opt ${on ? "rp-opt--on" : ""}`}>
              <input type="checkbox" checked={!!on}
                onChange={() => setFilter("difficulties", on
                  ? filters.difficulties.filter(x => x !== d)
                  : [...(filters.difficulties || []), d]
                )}/>
              <span style={{ color: col }}>{d}</span>
            </label>
          )
        })}
      </Sec>

      {/* Tags */}
      {allTags.length > 0 && (
        <Sec k="tags" label="Tags">
          <div className="rp-tag-cloud">
            {allTags.map(t => {
              const on = filters.tags?.includes(t)
              return (
                <button key={t} className={`rp-tag ${on ? "rp-tag--on" : ""}`}
                  onClick={() => setFilter("tags", on ? filters.tags.filter(x => x !== t) : [...(filters.tags || []), t])}>
                  {t}
                </button>
              )
            })}
          </div>
        </Sec>
      )}
    </div>
  )
})
FilterPanel.displayName = "FilterPanel"

/* ─── Main Rooms Page ─── */
const Rooms = memo(() => {
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks()
  const { user } = useApp()

  const [rooms, setRooms]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [viewMode, setViewMode]     = useState("grid")
  const [sortBy, setSortBy]         = useState("popular")
  const [mobileOpen, setMobileOpen] = useState(false)
  const searchTimer = useRef(null)

  const [filters, setFilters] = useState({
    search: "", subscription: "all", category: "all",
    difficulties: [], tags: []
  })

  /* ─ User room progress map: { roomId: prog } ─ */
  const userProgress = useMemo(() => {
    const m = {}
    if (!user?.roomProgress) return m
    user.roomProgress.forEach(p => { m[p.roomId] = p })
    return m
  }, [user?.roomProgress])

  /* ─ Fetch rooms ─ */
  const fetchRooms = useCallback(async (search = filters.search) => {
    setLoading(true); setError(null)
    try {
      const params = {}
      if (filters.category && filters.category !== "all") params.category = filters.category
      if (filters.difficulties?.length) params.difficulty = filters.difficulties[0]
      const data = await getRooms(params)

      // Aggressive filter to remove redundant/old rooms
      const filteredApiRooms = data.filter(r => {
        const title = r.title?.toLowerCase() || "";
        const slug = r.slug?.toLowerCase() || "";
        
        // Block exact matches or fuzzy variations of the old rooms
        const isOldApiRoom = title.includes("backend development basics") || slug.includes("introduction-to-restful-apis");
        const isOldNetworkingRoom = title === "networking fundamentals" || slug === "networking-fundamentals";
        const isOldPentestingRoom = title.includes("web app pentesting") || slug.includes("web-app-pentesting");

        return !isOldApiRoom && !isOldNetworkingRoom && !isOldPentestingRoom;
      });

      // Merge: Local rooms take absolute priority
      const localSlugs = new Set(LOCAL_ROOMS.map(r => r.slug));
      const remoteToAdd = filteredApiRooms.filter(r => !localSlugs.has(r.slug));

      setRooms([...LOCAL_ROOMS, ...remoteToAdd])
    } catch (err) {
      console.error("Room fetch error:", err)
      setError("Unable to load rooms. Please try again.")
      setRooms(LOCAL_ROOMS)
    } finally { setLoading(false) }
  }, [filters.category, filters.difficulties])


  useEffect(() => {
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => fetchRooms(filters.search), 350)
    return () => clearTimeout(searchTimer.current)
  }, [filters.search])

  useEffect(() => { fetchRooms() }, [fetchRooms])

  /* ─ Categories from rooms ─ */
  const categories = useMemo(() => {
    const s = new Set(rooms.map(r => r.category).filter(Boolean))
    return ["all", ...Array.from(s)]
  }, [rooms])

  const allTags = useMemo(() => {
    const s = new Set(); rooms.forEach(r => r.tags?.forEach(t => s.add(t))); return [...s]
  }, [rooms])

  /* ─ Client-side filter + sort ─ */
  const filtered = useMemo(() => rooms.filter(r => {
    const s = filters.search.toLowerCase()
    return (
      (!s || r.title?.toLowerCase().includes(s) || r.short_description?.toLowerCase().includes(s)) &&
      (filters.subscription === "all" || (filters.subscription === "free" ? !r.isPremium && !r.subscriberOnly : r.isPremium || r.subscriberOnly)) &&
      (filters.category === "all" || r.category === filters.category) &&
      (!filters.difficulties?.length || filters.difficulties.includes(r.difficulty)) &&
      (!filters.tags?.length || filters.tags.some(t => r.tags?.includes(t)))
    )
  }), [rooms, filters])

  const sorted = useMemo(() => {
    const a = [...filtered]
    if (sortBy === "popular")  return a.sort((x,y) => (y.completedBy?.length||0) - (x.completedBy?.length||0))
    if (sortBy === "newest")   return a.sort((x,y) => new Date(y.createdAt||0) - new Date(x.createdAt||0))
    if (sortBy === "xp")       return a.sort((x,y) => (y.points||0) - (x.points||0))
    if (sortBy === "duration") return a.sort((x,y) => (x.estimated_time_minutes||99) - (y.estimated_time_minutes||99))
    return a
  }, [filtered, sortBy])

  const setFilter = useCallback((k, v) => setFilters(p => ({ ...p, [k]: v })), [])
  const clearAll  = useCallback(() => setFilters({ search:"", subscription:"all", category:"all", difficulties:[], tags:[] }), [])

  const activeCount = useMemo(() => {
    let n = 0
    if (filters.search) n++
    if (filters.subscription !== "all") n++
    if (filters.category !== "all") n++
    n += filters.difficulties?.length || 0
    n += filters.tags?.length || 0
    return n
  }, [filters])

  /* ─ Stats ─ */
  const stats = useMemo(() => ({
    total:      rooms.length,
    free:       rooms.filter(r => !r.isPremium && !r.subscriberOnly).length,
    // Count from roomProgress map first; fall back to user.completedRooms
    completed:  Object.values(userProgress).filter(p => p?.completed).length || (user?.completedRooms || 0),
    inProgress: Object.values(userProgress).filter(p => p?.joined && !p?.completed).length,
  }), [rooms, userProgress, user?.completedRooms])

  /* ─ Bookmark handler ─ */
  const handleBookmark = useCallback((room) => {
    const id = room.slug || room._id || room.id
    if (isBookmarked(id, "room")) {
      removeBookmark(id, "room")
    } else {
      addBookmark({ id, slug: room.slug, type: "room", title: room.title, category: room.category, difficulty: room.difficulty })
    }
  }, [isBookmarked, addBookmark, removeBookmark])

  return (
    <ProtectedRoute>
      <div className="rp-root">
        <div className="rp-bg-tl"  aria-hidden="true"/>
        <div className="rp-bg-br"  aria-hidden="true"/>
        <div className="rp-grid-bg" aria-hidden="true"/>

        <div className="rp-wrap">

          {/* ── HEADER ── */}
          <div className="rp-header">
            <div className="rp-header-left">
              <div className="rp-header-icon"><Shield size={22} style={{ color:"#8B5CF6" }}/></div>
              <div>
                <h1 className="rp-h1">Active Rooms</h1>
                <p className="rp-sub">
                  {loading ? "Loading challenge rooms…"
                    : `${rooms.length} hacking room${rooms.length !== 1 ? "s" : ""} available`}
                </p>
              </div>
            </div>
            {/* Stats */}
            <div className="rp-header-stats">
              {[
                { icon: <Shield size={13}/>,       label: "Total",     val: stats.total,      col: "#8B5CF6" },
                { icon: <Zap size={13}/>,           label: "Free",      val: stats.free,       col: "#39FF14" },
                { icon: <CheckCircle2 size={13}/>,  label: "Completed", val: stats.completed,  col: "#00F5FF" },
                { icon: <Flame size={13}/>,         label: "Active",    val: stats.inProgress, col: "#FACC15" },
              ].map(({ icon, label, val, col }) => (
                <div key={label} className="rp-hstat" style={{ "--stat-col": col }}>
                  <span style={{ color: col }}>{icon}</span>
                  <strong style={{ color: col }}>{val}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>
            {/* Mobile filter btn */}
            <button className="rp-mob-btn" onClick={() => setMobileOpen(true)}>
              <Filter size={14}/> Filters
              {activeCount > 0 && <span className="rp-mob-count">{activeCount}</span>}
            </button>
          </div>

          {/* ── BODY ── */}
          <div className="rp-body">

            {/* Sidebar — desktop */}
            <div className="rp-sidebar">
              <FilterPanel filters={filters} setFilter={setFilter} clearAll={clearAll}
                categories={categories} activeCount={activeCount} allTags={allTags}/>
            </div>

            {/* Content */}
            <div className="rp-content">

              {/* Toolbar */}
              <div className="rp-bar">
                <p className="rp-bar-count">
                  {loading ? <span style={{ color:"#334155" }}>Loading…</span> : (
                    <>Showing <b style={{ color:"#8B5CF6" }}>{sorted.length}</b> room{sorted.length !== 1 ? "s" : ""}</>
                  )}
                  {activeCount > 0 && <span className="rp-bar-flt"> · {activeCount} filter{activeCount>1?"s":""} active</span>}
                </p>
                <div className="rp-bar-right">
                  <div className="rp-sort">
                    <select className="rp-sort-sel" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                      <option value="popular">Most Popular</option>
                      <option value="newest">Newest</option>
                      <option value="xp">Highest XP</option>
                      <option value="duration">Shortest</option>
                    </select>
                    <ChevronDown size={13} className="rp-sort-arr"/>
                  </div>
                  <div className="rp-view">
                    <button className={`rp-vbtn ${viewMode==="grid"?"rp-vbtn--on":""}`} onClick={() => setViewMode("grid")}><Grid size={15}/></button>
                    <button className={`rp-vbtn ${viewMode==="list"?"rp-vbtn--on":""}`} onClick={() => setViewMode("list")}><List size={15}/></button>
                  </div>
                </div>
              </div>

              {/* Loading */}
              {loading && (
                <div className={`rp-grid ${viewMode==="list"?"rp-grid--list":""}`}>
                  {Array.from({length:6}).map((_,i) => (
                    <div key={i} className="rp-skel">
                      <div className="rp-skel-img"/>
                      <div className="rp-skel-bd">
                        <div className="rp-skel-ln rp-skel-ln--lg"/>
                        <div className="rp-skel-ln"/>
                        <div className="rp-skel-ln rp-skel-ln--sm"/>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Error */}
              {!loading && error && (
                <div className="rp-state">
                  <div className="rp-state-ico rp-state-ico--red"><X size={24}/></div>
                  <h3>{error}</h3>
                  <button className="rp-btn rp-btn--start" onClick={fetchRooms}>Try Again</button>
                </div>
              )}

              {/* Empty */}
              {!loading && !error && sorted.length === 0 && (
                <div className="rp-state">
                  <div className="rp-state-ico"><Target size={28}/></div>
                  <h3>No rooms match your filters</h3>
                  <p>Adjust your search or reset all filters.</p>
                  <button className="rp-btn rp-btn--start" onClick={clearAll}>Reset Filters</button>
                </div>
              )}

              {/* Grid / List */}
              {!loading && !error && sorted.length > 0 && (
                <div className={`rp-grid ${viewMode==="list"?"rp-grid--list":""}`}>
                  {sorted.map(room => {
                    const prog = userProgress[room.slug] || userProgress[room._id] || null
                    const bmd  = isBookmarked(room.slug || room._id || room.id, "room")
                    return viewMode === "grid"
                      ? <RoomCard key={room._id||room.id} room={room} userProgress={prog} isBookmarked={bmd} onBookmark={handleBookmark}/>
                      : <RoomRow  key={room._id||room.id} room={room} userProgress={prog} isBookmarked={bmd} onBookmark={handleBookmark}/>
                  })}
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="rp-overlay" onClick={() => setMobileOpen(false)}>
            <div className="rp-drawer" onClick={e => e.stopPropagation()}>
              <div className="rp-drawer-head">
                <span style={{ fontWeight:700, color:"#E2E8F0" }}>Filters</span>
                <button className="rp-drawer-close" onClick={() => setMobileOpen(false)}><X size={18}/></button>
              </div>
              <div style={{ flex:1, overflowY:"auto", padding:"1rem" }}>
                <FilterPanel filters={filters} setFilter={setFilter} clearAll={clearAll}
                  categories={categories} activeCount={activeCount} allTags={allTags}/>
              </div>
              <button className="rp-drawer-apply" onClick={() => setMobileOpen(false)}>
                Apply {activeCount > 0 ? `(${activeCount})` : ""}
              </button>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
})

Rooms.displayName = "Rooms"
export default Rooms