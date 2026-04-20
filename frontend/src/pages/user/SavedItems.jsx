import { useMemo, memo } from 'react'
import { Link } from 'react-router-dom'
import { 
  Archive, BookmarkX, Clock, Target, Beaker, 
  ArrowUpRight, Play, Shield, Bookmark,
  Zap, Search, Ghost, Trash2, LayoutGrid,
  ChevronRight, ExternalLink
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
    
    return (
        <div className="si-page min-h-screen relative overflow-x-hidden text-white">
            {/* Background layers */}
            <div className="absolute inset-0 z-0 pointer-events-none si-page__grid" />
            <div className="absolute inset-0 z-0 pointer-events-none si-page__overlay" />
            
            <div className="relative z-10 pt-20 pb-40 px-6 max-w-7xl mx-auto">
                
                {/* ═══ HEADER ═══ */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16 si-fade-in">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                           <div className="si-hero-icon">
                             <Bookmark size={22} className="text-[#00D1FF]" />
                           </div>
                           <h1 className="text-4xl font-black uppercase tracking-tight">Tactical Archive</h1>
                        </div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">
                           Manage your architectural intelligence and stored mission directives
                        </p>
                    </div>
                    {bookmarkedItems.length > 0 && (
                        <button onClick={handleClearAll} className="si-btn-outline-danger">
                            <Trash2 size={14} /> Purge Archives
                        </button>
                    )}
                </header>

                {/* ═══ CONTENT ═══ */}
                {bookmarkedItems.length === 0 ? (
                    <div className="si-empty-state si-fade-in">
                        <div className="si-empty-state__icon-box">
                            <Archive size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Archive Vault Empty</h3>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed max-w-xs mx-auto mb-10">
                          No tactical intelligence has been stored in your primary mainframe.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Link to="/rooms" className="si-btn-primary">
                                Locate Rooms <ChevronRight size={14} />
                            </Link>
                            <Link to="/labs" className="si-btn-secondary">
                                Infiltrate Labs
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {sortedItems.map((item, index) => (
                            <Link 
                                to={item.type === 'room' ? `/rooms/${item.slug || item.id}` : `/labs/${item.id}`}
                                key={`${item.type}-${item.id}`}
                                className="si-card group si-fade-in"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                {/* Unsave Floating Action */}
                                <button
                                    onClick={(e) => handleUnsave(e, item.id, item.type)}
                                    className="si-card__unsave"
                                    title="Purge Intelligence"
                                >
                                    <BookmarkX size={16} />
                                </button>

                                {/* Top Section: Hero Image / Placeholder */}
                                <div className="si-card__hero">
                                    <div className="si-card__hero-overlay" />
                                    <div className="si-card__hero-content">
                                        <div className={`si-card__type-badge si-card__type-badge--${item.type}`}>
                                            {item.type === 'room' ? <Target size={12} /> : <Beaker size={12} />}
                                            <span>{item.type}</span>
                                        </div>
                                    </div>
                                    {/* Difficulty overlay top right */}
                                    {item.difficulty && (
                                        <div className={`si-card__diff-badge si-card__diff-badge--${item.difficulty.toLowerCase()}`}>
                                            {item.difficulty}
                                        </div>
                                    )}
                                </div>

                                {/* Body */}
                                <div className="si-card__body">
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <h3 className="text-lg font-black text-white leading-tight group-hover:text-[#00D1FF] transition-colors line-clamp-2">
                                            {item.title}
                                        </h3>
                                        <div className="si-card__xp">
                                            <Zap size={10} className="text-[#FF6B00]" />
                                            <span>{item.xp || 500}</span>
                                        </div>
                                    </div>

                                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-6">
                                        {item.category || 'Classified Intelligence'}
                                    </p>

                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                            <Clock size={12} className="opacity-40" />
                                            <span>Logged {new Date(item.bookmarkedAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="si-card__cta">
                                           Access <ChevronRight size={14} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
})

SavedItems.displayName = "SavedItems";
export default SavedItems
