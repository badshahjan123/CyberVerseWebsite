import { useMemo, memo } from 'react'
import { Link } from 'react-router-dom'
import { 
  Archive, BookmarkX, Clock, Target, Beaker, 
  Shield, Bookmark, Zap, Trash2, ChevronRight,
  Database, Cpu, Radio, Network
} from 'lucide-react'
import { useBookmarks } from '../../contexts/bookmark-context'
import './SavedItems.css'

const SavedItems = memo(() => {
    const { bookmarkedItems, removeBookmark, setBookmarkedItems } = useBookmarks()
    
    const handleUnsave = (e, id, type) => {
        e.preventDefault()
        e.stopPropagation()
        removeBookmark(id, type)
    }

    const handleClearAll = () => {
        if (window.confirm("Are you sure you want to purge all tactical archive data?")) {
            setBookmarkedItems([])
        }
    }

    const sortedItems = useMemo(() => {
        return [...bookmarkedItems].sort((a,b) => new Date(b.bookmarkedAt) - new Date(a.bookmarkedAt))
    }, [bookmarkedItems])

    // Compute Telemetry Stats for Gamification
    const stats = useMemo(() => {
        const total = bookmarkedItems.length
        const totalXP = bookmarkedItems.reduce((acc, item) => acc + (item.xp || 500), 0)
        const roomsCount = bookmarkedItems.filter(i => i.type === 'room').length
        const labsCount = bookmarkedItems.filter(i => i.type === 'lab').length
        
        let clearance = "GUEST_LEVEL_1"
        if (total >= 10) clearance = "ELITE_INTELLIGENCE_OPERATOR"
        else if (total >= 5) clearance = "FIELD_OPERATOR_LEVEL_3"
        else if (total > 0) clearance = "INITIATE_LEVEL_2"

        const ratio = total > 0 ? Math.round((roomsCount / total) * 100) : 0

        return { total, totalXP, roomsCount, labsCount, clearance, ratio }
    }, [bookmarkedItems])
    
    return (
        <div className="si-page min-h-screen relative overflow-x-hidden text-white">
            {/* High-fidelity background layers */}
            <div className="absolute inset-0 z-0 pointer-events-none si-page__grid" />
            <div className="absolute inset-0 z-0 pointer-events-none si-page__overlay" />
            
            <div className="relative z-10 pt-24 pb-40 px-6 max-w-7xl mx-auto">
                
                {/* ═══ HEADER ═══ */}
                <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10 si-fade-in">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                           <div className="si-hero-icon">
                             <div className="si-hero-icon__ping" />
                             <Bookmark size={20} className="text-[#00D1FF]" />
                           </div>
                           <div>
                             <h1 className="text-3xl font-black uppercase tracking-tight font-sans text-white">
                               Intel Mainframe
                             </h1>
                             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] font-mono">
                               Tactical Target & Payload Archive
                             </p>
                           </div>
                        </div>
                    </div>
                    {bookmarkedItems.length > 0 && (
                        <button onClick={handleClearAll} className="si-btn-outline-danger font-mono">
                            <Trash2 size={13} /> Purge Mainframe
                        </button>
                    )}
                </header>

                {/* ═══ TELEMETRY DASHBOARD PANEL ═══ */}
                {bookmarkedItems.length > 0 && (
                    <div className="si-telemetry p-6 mb-12 grid grid-cols-2 md:grid-cols-4 gap-6 si-fade-in font-mono text-xs">
                        <div className="si-telemetry__scanline" />
                        
                        <div className="si-telemetry__stat pr-4 space-y-2">
                            <div className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                <Radio size={14} className="text-cyan-400" />
                                <span>Core Status</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="si-status-dot" />
                                <span className="text-white font-black uppercase text-sm">ONLINE</span>
                            </div>
                            <p className="text-[9px] text-slate-500 font-bold uppercase">Clearance: {stats.clearance}</p>
                        </div>

                        <div className="si-telemetry__stat px-0 md:px-4 space-y-2">
                            <div className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                <Database size={14} className="text-cyan-400" />
                                <span>Saved Directives</span>
                            </div>
                            <div className="text-white font-black text-lg">
                                {stats.total} <span className="text-[10px] text-slate-500 font-bold">/ 50 SLOTS</span>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded overflow-hidden">
                                <div className="h-full bg-cyan-400" style={{ width: `${Math.min(100, (stats.total / 50) * 100)}%` }} />
                            </div>
                        </div>

                        <div className="si-telemetry__stat px-0 md:px-4 space-y-2">
                            <div className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                <Zap size={14} className="text-[#FF6B00]" />
                                <span>Harvestable XP</span>
                            </div>
                            <div className="text-[#FF6B00] font-black text-lg">
                                +{stats.totalXP} <span className="text-[10px] text-slate-500 font-bold">XP</span>
                            </div>
                            <p className="text-[9px] text-slate-500 font-bold uppercase">Pending Decryption</p>
                        </div>

                        <div className="px-0 md:px-4 space-y-2">
                            <div className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                <Network size={14} className="text-purple-400" />
                                <span>Sector Spread</span>
                            </div>
                            <div className="flex justify-between text-white font-black text-[10px] uppercase">
                                <span>Rooms: {stats.roomsCount}</span>
                                <span>Labs: {stats.labsCount}</span>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded overflow-hidden flex">
                                <div className="h-full bg-cyan-400" style={{ width: `${stats.ratio}%` }} />
                                <div className="h-full bg-[#FF6B00]" style={{ width: `${100 - stats.ratio}%` }} />
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══ CONTENT ═══ */}
                {bookmarkedItems.length === 0 ? (
                    <div className="si-empty-state si-fade-in font-mono">
                        <div className="si-empty-state__icon-box">
                            <Archive size={32} />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight font-sans">
                            Tactical Archive Offline
                        </h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed max-w-sm mx-auto mb-10">
                          System diagnostics indicate 0 files present in primary vault cache. Scan network for deployable targets.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Link to="/rooms" className="si-btn-primary font-mono">
                                Scan Sectors <ChevronRight size={14} />
                            </Link>
                            <Link to="/labs" className="si-btn-secondary font-mono">
                                Lab Databank
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sortedItems.map((item, index) => {
                            // Compute a unique visual hash for decoration
                            const mockHash = `SEC-${item.type === 'room' ? 'RM' : 'LB'}-${String(item.id).substring(0, 4).toUpperCase()}`;

                            return (
                                <Link 
                                    to={item.type === 'room' ? `/rooms/${item.slug || item.id}` : `/labs/${item.id}`}
                                    key={`${item.type}-${item.id}`}
                                    className={`si-card si-card--${item.type} group si-fade-in`}
                                    style={{ animationDelay: `${index * 0.04}s` }}
                                >
                                    {/* Blueprint layout markers */}
                                    <span className="si-card__corner si-card__corner--tl" />
                                    <span className="si-card__corner si-card__corner--tr" />
                                    <span className="si-card__corner si-card__corner--bl" />
                                    <span className="si-card__corner si-card__corner--br" />

                                    {/* Unsave Floating Action */}
                                    <button
                                        onClick={(e) => handleUnsave(e, item.id, item.type)}
                                        className="si-card__unsave"
                                        title="Purge Intel"
                                    >
                                        <BookmarkX size={15} />
                                    </button>

                                    {/* Top Section: Badges & Details */}
                                    <div className="si-card__hero">
                                        <div className="si-card__hero-overlay" />
                                        <div className="si-card__hero-content">
                                            <div className={`si-card__type-badge si-card__type-badge--${item.type}`}>
                                                {item.type === 'room' ? <Target size={11} /> : <Beaker size={11} />}
                                                <span>{item.type}</span>
                                            </div>
                                        </div>
                                        {item.difficulty && (
                                            <div className={`si-card__diff-badge si-card__diff-badge--${item.difficulty.toLowerCase()}`}>
                                                {item.difficulty}
                                            </div>
                                        )}
                                    </div>

                                    {/* Body */}
                                    <div className="si-card__body">
                                        <div className="flex items-start justify-between gap-4 mb-4">
                                            <h3 className="si-card__title text-[15px] font-black text-white leading-tight group-hover:text-cyan-400 group-hover:dark:text-cyan-300 transition-colors line-clamp-2">
                                                {item.title}
                                            </h3>
                                            <div className="si-card__xp shrink-0 font-mono">
                                                <Zap size={10} className="text-[#FF6B00] fill-[#FF6B00]" />
                                                <span>{item.xp || 500}</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wider mb-6">
                                            <span>{item.category || 'Classified Intel'}</span>
                                            <span className="text-[8px] opacity-65">{mockHash}</span>
                                        </div>

                                        <div className="flex items-center justify-between pt-3.5 border-t border-white/[0.04]">
                                            <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wider">
                                                <Clock size={11} className="opacity-45" />
                                                <span>Stored {new Date(item.bookmarkedAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="si-card__cta font-mono">
                                               DECRYPT <ChevronRight size={13} />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
})

SavedItems.displayName = "SavedItems";
export default SavedItems
