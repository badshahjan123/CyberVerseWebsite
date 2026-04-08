import { Link } from 'react-router-dom'
import { Archive, BookmarkX, Clock, Target, Beaker, ArrowUpRight, Play, Shield } from 'lucide-react'
import { useBookmarks } from '../../contexts/bookmark-context'

const SavedItems = () => {
    const { bookmarkedItems, removeBookmark, setBookmarkedItems } = useBookmarks()
    
    const handleUnsave = (id, type) => {
        removeBookmark(id, type)
    }

    const handleClearAll = () => {
        if (confirm("Are you sure you want to purge all tactical archive data?")) {
            setBookmarkedItems([])
        }
    }
    
    return (
        <div className="si-root">
            <div className="si-grid-bg" />
            <div className="rdp-bg-glow" /> {/* Reusing the glow from RoomDetail */}
            
            <div className="container mx-auto px-6 max-w-7xl pt-20 pb-40 relative z-10">
                <header className="si-hero rcp-fade-in flex flex-col md:flex-row justify-between items-end gap-8">
                    <div>
                        <h1 className="si-title italic">Tactical <span className="gradient-text">Archive</span></h1>
                        <p className="si-subtitle">
                           <Archive size={16} className="text-primary" /> 
                           Central Intelligence Stash // Stored Directives: {bookmarkedItems.length}
                        </p>
                    </div>
                    {bookmarkedItems.length > 0 && (
                        <button onClick={handleClearAll} className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-500 font-bold uppercase text-[10px] tracking-widest hover:bg-danger/10 hover:text-danger hover:border-danger/30 transition-all">
                            Purge Archives
                        </button>
                    )}
                </header>

                {bookmarkedItems.length === 0 ? (
                    <div className="si-empty-state rcp-fade-in max-w-4xl mx-auto backdrop-blur-md">
                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-primary/20">
                            <Archive size={40} className="text-primary opacity-50" />
                        </div>
                        <h3 className="text-3xl font-black text-white italic uppercase mb-3">Archive Vault Empty</h3>
                        <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[11px] mb-12">No tactical data has been stored in your mainframe.</p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Link to="/rooms" className="px-10 py-4 bg-primary text-black font-black uppercase text-sm rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_rgba(139,92,246,0.3)]">
                                Locate Rooms
                            </Link>
                            <Link to="/labs" className="px-10 py-4 bg-white/5 border border-white/10 text-white font-black uppercase text-sm rounded-xl hover:bg-white/10 transition-all">
                                Infiltrate Labs
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {bookmarkedItems.map((item, index) => (
                            <div
                                key={`${item.type}-${item.id}`}
                                className="si-card rcp-fade-in"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <button
                                    onClick={() => handleUnsave(item.id, item.type)}
                                    className="si-unsave-btn"
                                    title="Purge from Archive"
                                >
                                    <BookmarkX size={18} />
                                </button>

                                <div className="flex items-center justify-between mb-8">
                                    <div className={`si-type-tag ${item.type === 'room' ? 'si-type-tag--room' : 'si-type-tag--lab'}`}>
                                        {item.type === 'room' ? <Target size={12} className="mr-2" /> : <Beaker size={12} className="mr-2" />}
                                        {item.type}
                                    </div>
                                    {item.difficulty && (
                                        <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border bg-white/5 ${item.difficulty.toLowerCase().includes('easy') ? 'text-success border-success/30' : 'text-warning border-warning/30'}`}>
                                            {item.difficulty}
                                        </div>
                                    )}
                                </div>

                                <div className="si-item-icon mb-6">
                                    {item.icon ? item.icon : (item.type === 'room' ? '🎯' : '🧪')}
                                </div>

                                <h3 className="si-item-title mb-3 group-hover:text-primary transition-colors">
                                    {item.title}
                                </h3>

                                <p className="si-item-meta mb-10">
                                    {item.category || 'Classified Intelligence'}
                                </p>

                                <div className="si-stat-row">
                                    <div className="si-stat">
                                        <Clock size={14} className="text-primary" />
                                        <span>Logged: {new Date(item.bookmarkedAt).toLocaleDateString()}</span>
                                    </div>
                                    {item.xp && (
                                        <div className="si-stat ml-auto">
                                            <span className="text-warning font-black">{item.xp} XP</span>
                                        </div>
                                    )}
                                </div>

                                <Link
                                    to={item.type === 'room' ? `/rooms/${item.slug || item.id}` : `/labs/${item.id}`}
                                    className="w-full py-4 bg-primary text-black font-black uppercase text-sm rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
                                >
                                    Access Data 
                                    <ArrowUpRight size={18} />
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default SavedItems
