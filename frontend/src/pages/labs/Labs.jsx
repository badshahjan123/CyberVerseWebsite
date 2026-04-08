import { useState, useMemo, memo, useCallback, useEffect, useRef } from "react"
import {
  Search, Grid, List, Lock, Clock, Users, Filter, Star, Play,
  BookOpen, Trophy, X, ChevronDown, Zap, CheckCircle2, Crown,
  ArrowRight, SlidersHorizontal, Terminal, ChevronLeft, ChevronRight,
  Flame, TrendingUp, Shield, Target
} from "lucide-react"
import { Link } from "react-router-dom"
import { ProtectedRoute } from "../../components/protected-route"
import { useApp } from "../../contexts/app-context"
import axios from "../../api/axios"

/* ─── helpers ─── */
const DIFF_COLORS = {
  Easy:     { color: "#39FF14", bg: "rgba(57,255,20,0.12)",   border: "rgba(57,255,20,0.3)"   },
  Beginner: { color: "#39FF14", bg: "rgba(57,255,20,0.12)",   border: "rgba(57,255,20,0.3)"   },
  Medium:   { color: "#FACC15", bg: "rgba(250,204,21,0.12)",  border: "rgba(250,204,21,0.3)"  },
  Hard:     { color: "#F97316", bg: "rgba(249,115,22,0.12)",  border: "rgba(249,115,22,0.3)"  },
  Insane:   { color: "#FF3D71", bg: "rgba(255,61,113,0.12)",  border: "rgba(255,61,113,0.3)"  },
}
const getDiff = d => DIFF_COLORS[d] || { color: "#94A3B8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.2)" }

/* ─── Star Rating ─── */
const StarRating = memo(({ rating }) => {
  const r = Number(rating) || 0
  return (
    <div className="lp2-stars">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={12}
          style={{ fill: i <= Math.round(r) ? "#FACC15" : "transparent",
                   color: i <= Math.round(r) ? "#FACC15" : "#2D3748" }} />
      ))}
      <span className="lp2-stars-val">{r.toFixed(1)}</span>
    </div>
  )
})
StarRating.displayName = "StarRating"

/* ─── Lab Card (Grid mode) ─── */
const LabCard = memo(({ lab, progress, isPremiumUser }) => {
  const dm = getDiff(lab.difficulty)
  const slug = lab.slug || lab.id
  const isCompleted = progress?.completed || false
  const progressPct = progress?.progress || (isCompleted ? 100 : 0)
  const isLocked = lab.isPremium && !isPremiumUser

  return (
    <div className={`lp2-card ${isCompleted ? "lp2-card--done" : ""} ${isLocked ? "lp2-card--locked" : ""}`}>
      {/* Image */}
      <div className="lp2-card-img-wrap">
        <img
          src={lab.coverImage || "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=600"}
          alt={lab.title}
          loading="lazy"
          className="lp2-card-img"
        />
        {/* Top badges */}
        <div className="lp2-card-top-badges">
          {lab.isPremium
            ? <span className="lp2-badge lp2-badge--pro"><Crown size={9}/> PRO</span>
            : <span className="lp2-badge lp2-badge--free">FREE</span>
          }
          {isCompleted && <span className="lp2-badge lp2-badge--done"><CheckCircle2 size={9}/> Done</span>}
        </div>
        {/* Bottom type badge */}
        <div className="lp2-card-bot-badges">
          {lab.type === "ctf"
            ? <span className="lp2-type lp2-type--ctf"><Trophy size={10}/> CTF</span>
            : <span className="lp2-type lp2-type--walk"><BookOpen size={10}/> Walkthrough</span>
          }
        </div>
        {/* Lock overlay */}
        {isLocked && (
          <div className="lp2-lock-layer">
            <Lock size={22} style={{ color: "#FACC15" }}/>
            <span>Premium Only</span>
            <Link to="/premium" className="lp2-upgrade-cta">Upgrade →</Link>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="lp2-card-body">
        {/* Title */}
        <h3 className="lp2-card-title">{lab.title}</h3>
        <p className="lp2-card-by">by {lab.creator || "CyberVerse"}</p>

        {/* Rating + Difficulty row */}
        <div className="lp2-card-row">
          <StarRating rating={lab.rating || 4.5} />
          <span className="lp2-diff-pill"
            style={{ color: dm.color, background: dm.bg, border: `1px solid ${dm.border}` }}>
            {lab.difficulty}
          </span>
        </div>

        {/* Stats row */}
        <div className="lp2-card-stats">
          <span className="lp2-stat"><Users size={11}/> {lab.participants || 0}</span>
          <span className="lp2-stat"><Clock size={11}/> {lab.duration || "30 min"}</span>
          <span className="lp2-stat lp2-stat--xp"><Zap size={11}/> {lab.points || 100} XP</span>
        </div>

        {/* Progress bar if in-progress */}
        {progressPct > 0 && !isCompleted && (
          <div className="lp2-prog-row">
            <div className="lp2-prog-track">
              <div className="lp2-prog-fill" style={{ width: `${progressPct}%` }}/>
            </div>
            <span className="lp2-prog-pct">{progressPct}%</span>
          </div>
        )}

        {/* CTA */}
        <div className="lp2-card-cta">
          {isLocked ? (
            <Link to="/premium" className="lp2-btn lp2-btn--lock"><Lock size={13}/> Unlock Lab</Link>
          ) : isCompleted ? (
            <Link to={`/labs/${slug}`} className="lp2-btn lp2-btn--done"><CheckCircle2 size={13}/> Review</Link>
          ) : progressPct > 0 ? (
            <Link to={`/labs/${slug}`} className="lp2-btn lp2-btn--resume"><Play size={13}/> Resume</Link>
          ) : (
            <Link to={`/labs/${slug}`} className="lp2-btn lp2-btn--start"><Play size={13}/> Start Lab</Link>
          )}
          <Link to={`/labs/${slug}`} className="lp2-btn lp2-btn--icon" aria-label="View details">
            <ArrowRight size={14}/>
          </Link>
        </div>
      </div>
    </div>
  )
})
LabCard.displayName = "LabCard"

/* ─── Lab List Row (List mode) ─── */
const LabRow = memo(({ lab, progress, isPremiumUser }) => {
  const dm = getDiff(lab.difficulty)
  const slug = lab.slug || lab.id
  const isCompleted = progress?.completed || false
  const isLocked = lab.isPremium && !isPremiumUser

  return (
    <div className="lp2-row">
      <img
        src={lab.coverImage || "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=180"}
        alt={lab.title}
        loading="lazy"
        className="lp2-row-img"
      />
      <div className="lp2-row-body">
        <div className="lp2-row-top">
          <div>
            <h3 className="lp2-row-title">{lab.title}</h3>
            <p className="lp2-row-by">by {lab.creator || "CyberVerse"}</p>
          </div>
          <div className="lp2-row-badges">
            {lab.isPremium
              ? <span className="lp2-badge lp2-badge--pro"><Crown size={9}/> PRO</span>
              : <span className="lp2-badge lp2-badge--free">FREE</span>
            }
            {lab.type === "ctf"
              ? <span className="lp2-type lp2-type--ctf"><Trophy size={10}/> CTF</span>
              : <span className="lp2-type lp2-type--walk"><BookOpen size={10}/> Walkthrough</span>
            }
            <span className="lp2-diff-pill" style={{ color: dm.color, background: dm.bg, border: `1px solid ${dm.border}` }}>
              {lab.difficulty}
            </span>
          </div>
        </div>
        <div className="lp2-row-meta">
          <StarRating rating={lab.rating || 4.5} />
          <span className="lp2-stat"><Users size={11}/> {lab.participants || 0}</span>
          <span className="lp2-stat"><Clock size={11}/> {lab.duration || "30 min"}</span>
          <span className="lp2-stat lp2-stat--xp"><Zap size={11}/> {lab.points || 100} XP</span>
        </div>
      </div>
      <div className="lp2-row-cta">
        {isLocked ? (
          <Link to="/premium" className="lp2-btn lp2-btn--lock"><Lock size={13}/> Unlock</Link>
        ) : isCompleted ? (
          <Link to={`/labs/${slug}`} className="lp2-btn lp2-btn--done"><CheckCircle2 size={13}/> Done</Link>
        ) : (
          <Link to={`/labs/${slug}`} className="lp2-btn lp2-btn--start"><Play size={13}/> Start</Link>
        )}
      </div>
    </div>
  )
})
LabRow.displayName = "LabRow"

/* ─── Main Labs Page ─── */
const Labs = memo(() => {
  const { user } = useApp()
  const [labs, setLabs]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [viewMode, setViewMode] = useState("grid")
  const [sortBy, setSortBy]     = useState("newest")
  const [page, setPage]         = useState(1)
  const [mobileOpen, setMobileOpen] = useState(false)
  const itemsPerPage = 9
  const searchTimer = useRef(null)

  const [filters, setFilters] = useState({
    search: "", subscription: "all", category: "all", type: "all", difficulties: [], tags: []
  })

  /* User lab progress map */
  const userProgress = useMemo(() => {
    const m = {}
    if (!user?.labProgress) return m
    user.labProgress.forEach(lp => {
      m[lp.labId] = { completed: !!lp.completed, progress: lp.progress || (lp.completed ? 100 : 0) }
    })
    return m
  }, [user?.labProgress])

  const isPremiumUser = user?.isPremium || false

  /* Fetch */
  const fetchLabs = useCallback(async (search = filters.search) => {
    setLoading(true); setError(null)
    try {
      const p = new URLSearchParams()
      if (filters.category && filters.category !== "all") p.append("category", filters.category)
      if (filters.difficulties?.length) p.append("difficulty", filters.difficulties[0])
      if (search) p.append("search", search)
      if (filters.type !== "all") p.append("type", filters.type)
      const res = await axios.get(`/labs?${p}`)
      setLabs(res.data.data || [])
    } catch {
      setError("Unable to load labs. Please try again.")
      setLabs([])
    } finally { setLoading(false) }
  }, [filters.category, filters.difficulties, filters.type])

  /* Debounce search */
  useEffect(() => {
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => fetchLabs(filters.search), 380)
    return () => clearTimeout(searchTimer.current)
  }, [filters.search])

  useEffect(() => { fetchLabs() }, [fetchLabs])

  /* Derived categories from labs */
  const categories = useMemo(() => {
    const cats = [...new Set(labs.map(l => l.category).filter(Boolean))]
    return [{ value: "all", label: "All Categories" }, ...cats.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))]
  }, [labs])

  const allTags = useMemo(() => {
    const t = new Set(); labs.forEach(l => l.tags?.forEach(x => t.add(x))); return [...t]
  }, [labs])

  /* Client-side filter + sort */
  const filtered = useMemo(() => labs.filter(lab => {
    const s = filters.search.toLowerCase()
    return (
      (!s || lab.title?.toLowerCase().includes(s) || lab.description?.toLowerCase().includes(s)) &&
      (filters.subscription === "all" || (filters.subscription === "free" ? !lab.isPremium : lab.isPremium)) &&
      (!filters.difficulties?.length || filters.difficulties.includes(lab.difficulty)) &&
      (!filters.tags?.length || filters.tags.some(t => lab.tags?.includes(t)))
    )
  }), [labs, filters])

  const sorted = useMemo(() => {
    const a = [...filtered]
    if (sortBy === "popular") return a.sort((x,y) => (y.participants||0) - (x.participants||0))
    if (sortBy === "rating")  return a.sort((x,y) => (y.rating||0) - (x.rating||0))
    if (sortBy === "xp")      return a.sort((x,y) => (y.points||0) - (x.points||0))
    if (sortBy === "shortest") return a.sort((x,y) => parseInt(x.estimatedTime||30) - parseInt(y.estimatedTime||30))
    return a
  }, [filtered, sortBy])

  const paginated    = useMemo(() => sorted.slice((page-1)*itemsPerPage, page*itemsPerPage), [sorted, page])
  const totalPages   = Math.ceil(sorted.length / itemsPerPage)

  const setFilter = useCallback((k, v) => { setFilters(p => ({ ...p, [k]: v })); setPage(1) }, [])
  const clearAll  = useCallback(() => { setFilters({ search:"", subscription:"all", category:"all", type:"all", difficulties:[], tags:[] }); setPage(1) }, [])

  const activeCount = useMemo(() => {
    let n = 0
    if (filters.search) n++
    if (filters.subscription !== "all") n++
    if (filters.category !== "all") n++
    if (filters.type !== "all") n++
    n += (filters.difficulties?.length || 0)
    n += (filters.tags?.length || 0)
    return n
  }, [filters])

  /* ─── Sidebar inner component ─── */
  const FilterPanel = useCallback(() => {
    const [open, setOpen] = useState({ sub: true, cat: true, type: true, diff: true, tags: false })
    const toggle = k => setOpen(p => ({ ...p, [k]: !p[k] }))

    const Section = ({ k, label, children }) => (
      <div className="lp2-fs">
        <button className="lp2-fs-head" onClick={() => toggle(k)}>
          <span>{label}</span>
          <ChevronDown size={13} style={{ transform: open[k] ? "rotate(180deg)":"none", transition:"0.2s ease" }}/>
        </button>
        {open[k] && <div className="lp2-fs-body">{children}</div>}
      </div>
    )

    return (
      <div className="lp2-panel">
        {/* Header */}
        <div className="lp2-panel-head">
          <span className="lp2-panel-title"><SlidersHorizontal size={13}/> Filters</span>
          {activeCount > 0 && (
            <button className="lp2-panel-clear" onClick={clearAll}>
              <X size={11}/> Clear {activeCount}
            </button>
          )}
        </div>

        {/* Search */}
        <div className="lp2-search-wrap">
          <Search size={13} className="lp2-search-ico"/>
          <input
            className="lp2-search-inp"
            placeholder="Search labs…"
            value={filters.search}
            onChange={e => setFilter("search", e.target.value)}
          />
          {filters.search && (
            <button className="lp2-search-clr" onClick={() => setFilter("search","")}>
              <X size={11}/>
            </button>
          )}
        </div>

        {/* Subscription */}
        <Section k="sub" label="Subscription">
          {[["all","All Labs"],["free","Free Only"],["premium","Premium"]].map(([v,l]) => (
            <label key={v} className={`lp2-opt ${filters.subscription === v ? "lp2-opt--on":""}`}>
              <input type="radio" name="sub" checked={filters.subscription === v} onChange={() => setFilter("subscription", v)}/>
              <span>{l}</span>
            </label>
          ))}
        </Section>

        {/* Category */}
        <Section k="cat" label="Category">
          {categories.map(c => (
            <label key={c.value} className={`lp2-opt ${filters.category === c.value ? "lp2-opt--on":""}`}>
              <input type="radio" name="cat" checked={filters.category === c.value} onChange={() => setFilter("category", c.value)}/>
              <span>{c.label}</span>
            </label>
          ))}
        </Section>

        {/* Type */}
        <Section k="type" label="Type">
          {[["all","All Types"],["walkthrough","Walkthrough"],["ctf","CTF Challenge"]].map(([v,l]) => (
            <label key={v} className={`lp2-opt ${filters.type === v ? "lp2-opt--on":""}`}>
              <input type="radio" name="type" checked={filters.type === v} onChange={() => setFilter("type", v)}/>
              <span>{l}</span>
            </label>
          ))}
        </Section>

        {/* Difficulty */}
        <Section k="diff" label="Difficulty">
          {[["Easy","#39FF14"],["Medium","#FACC15"],["Hard","#F97316"],["Insane","#FF3D71"]].map(([d,col]) => {
            const on = filters.difficulties?.includes(d)
            return (
              <label key={d} className={`lp2-opt ${on ? "lp2-opt--on":""}`}>
                <input type="checkbox" checked={!!on}
                  onChange={() => setFilter("difficulties",
                    on ? filters.difficulties.filter(x=>x!==d) : [...(filters.difficulties||[]), d]
                  )}
                />
                <span style={{ color: col }}>{d}</span>
              </label>
            )
          })}
        </Section>

        {/* Tags */}
        {allTags.length > 0 && (
          <Section k="tags" label="Tags">
            <div className="lp2-tag-cloud">
              {allTags.map(t => {
                const on = filters.tags?.includes(t)
                return (
                  <button key={t}
                    className={`lp2-tag ${on ? "lp2-tag--on":""}`}
                    onClick={() => setFilter("tags", on ? filters.tags.filter(x=>x!==t) : [...(filters.tags||[]), t])}>
                    {t}
                  </button>
                )
              })}
            </div>
          </Section>
        )}
      </div>
    )
  }, [filters, categories, allTags, activeCount, setFilter, clearAll])

  return (
    <ProtectedRoute>
      <div className="lp2-root">
        <div className="lp2-bg-top"   aria-hidden="true"/>
        <div className="lp2-bg-right" aria-hidden="true"/>
        <div className="lp2-grid-bg"  aria-hidden="true"/>

        <div className="lp2-wrap">

          {/* ── PAGE HEADER ── */}
          <div className="lp2-header">
            <div className="lp2-header-left">
              <div className="lp2-header-icon"><Terminal size={22} style={{color:"#00F5FF"}}/></div>
              <div>
                <h1 className="lp2-h1">Hacktivities</h1>
                <p className="lp2-sub">
                  {loading ? "Loading challenge catalog…"
                    : `${labs.length} hacking challenge${labs.length !== 1 ? "s" : ""} available`}
                </p>
              </div>
            </div>
            {/* Stats bar */}
            <div className="lp2-header-stats">
              {[
                { icon: <Shield   size={14}/>, label: "Labs", val: labs.length               },
                { icon: <Flame    size={14}/>, label: "Free",    val: labs.filter(l=>!l.isPremium).length },
                { icon: <Crown    size={14}/>, label: "Premium", val: labs.filter(l=>l.isPremium).length },
              ].map(({icon, label, val}) => (
                <div key={label} className="lp2-hstat">
                  {icon}
                  <strong>{val}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>
            {/* Mobile filter btn */}
            <button className="lp2-mob-btn" onClick={() => setMobileOpen(true)}>
              <Filter size={14}/> Filters
              {activeCount > 0 && <span className="lp2-mob-count">{activeCount}</span>}
            </button>
          </div>

          {/* ── BODY: sidebar + content ── */}
          <div className="lp2-body">

            {/* Sidebar — desktop */}
            <div className="lp2-sidebar">
              <FilterPanel/>
            </div>

            {/* Content */}
            <div className="lp2-content">

              {/* Toolbar */}
              <div className="lp2-bar">
                <p className="lp2-bar-count">
                  {loading ? <span style={{color:"#334155"}}>Loading…</span> : (
                    <>Showing <b style={{color:"#00F5FF"}}>{paginated.length}</b> of <b style={{color:"#00F5FF"}}>{sorted.length}</b> labs</>
                  )}
                  {activeCount > 0 && <span className="lp2-bar-filter-badge"> • {activeCount} filter{activeCount>1?"s":""} active</span>}
                </p>
                <div className="lp2-bar-right">
                  {/* Sort */}
                  <div className="lp2-sort">
                    <select className="lp2-sort-sel" value={sortBy}
                      onChange={e => { setSortBy(e.target.value); setPage(1) }}>
                      <option value="newest">Newest</option>
                      <option value="popular">Most Popular</option>
                      <option value="rating">Highest Rated</option>
                      <option value="xp">Highest XP</option>
                      <option value="shortest">Shortest</option>
                    </select>
                    <ChevronDown size={13} className="lp2-sort-arr"/>
                  </div>
                  {/* View toggle */}
                  <div className="lp2-view">
                    <button className={`lp2-vbtn ${viewMode === "grid" ? "lp2-vbtn--on":""}`} onClick={() => setViewMode("grid")}><Grid size={15}/></button>
                    <button className={`lp2-vbtn ${viewMode === "list" ? "lp2-vbtn--on":""}`} onClick={() => setViewMode("list")}><List size={15}/></button>
                  </div>
                </div>
              </div>

              {/* Loading skeletons */}
              {loading && (
                <div className={`lp2-grid ${viewMode === "list" ? "lp2-grid--list":""}`}>
                  {Array.from({length: 6}).map((_,i) => (
                    <div key={i} className="lp2-skel">
                      <div className="lp2-skel-img"/>
                      <div className="lp2-skel-bd">
                        <div className="lp2-skel-ln lp2-skel-ln--lg"/>
                        <div className="lp2-skel-ln"/>
                        <div className="lp2-skel-ln lp2-skel-ln--sm"/>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Error */}
              {!loading && error && (
                <div className="lp2-state">
                  <div className="lp2-state-icon lp2-state-icon--red"><X size={24}/></div>
                  <h3>{error}</h3>
                  <button className="lp2-btn lp2-btn--start" onClick={() => fetchLabs()}>Try Again</button>
                </div>
              )}

              {/* Empty */}
              {!loading && !error && sorted.length === 0 && (
                <div className="lp2-state">
                  <div className="lp2-state-icon"><Target size={28}/></div>
                  <h3>No labs match your filters</h3>
                  <p>Adjust your search or clear all filters to see all labs.</p>
                  <button className="lp2-btn lp2-btn--start" onClick={clearAll}>Clear Filters</button>
                </div>
              )}

              {/* Grid / List */}
              {!loading && !error && sorted.length > 0 && (
                <div className={`lp2-grid ${viewMode === "list" ? "lp2-grid--list":""}`}>
                  {paginated.map(lab => (
                    viewMode === "grid"
                      ? <LabCard  key={lab.id} lab={lab} progress={userProgress[lab.id]} isPremiumUser={isPremiumUser}/>
                      : <LabRow   key={lab.id} lab={lab} progress={userProgress[lab.id]} isPremiumUser={isPremiumUser}/>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!loading && totalPages > 1 && (
                <div className="lp2-pages">
                  <button className="lp2-pg-btn" disabled={page===1} onClick={() => setPage(p => Math.max(1,p-1))}>
                    <ChevronLeft size={14}/> Prev
                  </button>
                  <div className="lp2-pg-nums">
                    {Array.from({length: totalPages}).map((_,i) => (
                      <button key={i} className={`lp2-pg-num ${page===i+1?"lp2-pg-num--on":""}`} onClick={()=>setPage(i+1)}>
                        {i+1}
                      </button>
                    ))}
                  </div>
                  <button className="lp2-pg-btn" disabled={page===totalPages} onClick={() => setPage(p => Math.min(totalPages,p+1))}>
                    Next <ChevronRight size={14}/>
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Mobile filter drawer */}
        {mobileOpen && (
          <div className="lp2-overlay" onClick={() => setMobileOpen(false)}>
            <div className="lp2-drawer" onClick={e => e.stopPropagation()}>
              <div className="lp2-drawer-head">
                <span style={{fontWeight:700, color:"#E2E8F0"}}>Filters</span>
                <button className="lp2-drawer-close" onClick={() => setMobileOpen(false)}><X size={18}/></button>
              </div>
              <div style={{flex:1, overflowY:"auto"}}>
                <FilterPanel/>
              </div>
              <button className="lp2-drawer-apply" onClick={() => setMobileOpen(false)}>
                Apply Filters {activeCount > 0 ? `(${activeCount})` : ""}
              </button>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
})

Labs.displayName = "Labs"
export default Labs
