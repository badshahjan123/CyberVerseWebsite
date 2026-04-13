import { Link } from 'react-router-dom'
import { Archive, BookmarkX, Clock, Target, Beaker, ArrowUpRight, Play, Shield } from 'lucide-react'
import { useBookmarks } from '../../contexts/bookmark-context'
import './SavedItems.css'

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
                <header className="cv-page-header rcp-fade-in flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div>
                        <h1 className="cv-page-title">Saved Items</h1>
                        <p className="cv-page-subtitle">
                           Manage your architectural intelligence and stored directives
                        </p>
                    </div>
                    {bookmarkedItems.length > 0 && (
                        <button onClick={handleClearAll} className="si-purge-btn px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-500 font-bold uppercase text-[10px] tracking-widest hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all flex-shrink-0">
                            Purge Archives
                        </button>
                    )}
                </header>

                {bookmarkedItems.length === 0 ? (
                    <div className="si-empty-state rcp-fade-in max-w-4xl mx-auto backdrop-blur-md">
                        <div className="w-24 h-24 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-cyan-500/20">
                            <Archive size={40} className="text-cyan-400 opacity-50" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Archive Vault Empty</h3>
                        <p className="cv-page-subtitle mb-12">No tactical data has been stored in your mainframe.</p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Link to="/rooms" className="rcp-primary-btn !w-fit !px-8">
                                Locate Rooms
                            </Link>
                            <Link to="/labs" className="px-8 py-3 bg-white/5 border border-white/10 text-white font-bold text-sm rounded-xl hover:bg-white/10 transition-all">
                                Infiltrate Labs
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                    <BookmarkX size={16} />
                                </button>

                                <div className="flex items-center justify-between mb-5">
                                    <div className={`si-type-tag ${item.type === 'room' ? 'si-type-tag--room' : 'si-type-tag--lab'}`}>
                                        {item.type === 'room' ? <Target size={12} /> : <Beaker size={12} />}
                                        <span style={{ marginLeft: '6px' }}>{item.type}</span>
                                    </div>
                                    {item.difficulty && (
                                        <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border bg-white/5 ${item.difficulty.toLowerCase().includes('easy') || item.difficulty.toLowerCase().includes('beginner') ? 'text-emerald-400 border-emerald-500/30' : item.difficulty.toLowerCase().includes('hard') || item.difficulty.toLowerCase().includes('advanced') ? 'text-red-400 border-red-500/30' : 'text-amber-400 border-amber-500/30'}`}>
                                            {item.difficulty}
                                        </div>
                                    )}
                                </div>

                                <div className="si-item-icon mb-4">
                                    {item.icon ? item.icon : (item.type === 'room' ? '🎯' : '🧪')}
                                </div>

                                <h3 className="si-item-title mb-2">
                                    {item.title}
                                </h3>

                                <p className="si-item-meta mb-6">
                                    {item.category || 'Classified Intelligence'}
                                </p>

                                <div className="si-stat-row">
                                    <div className="si-stat">
                                        <Clock size={14} />
                                        <span>Logged: {new Date(item.bookmarkedAt).toLocaleDateString()}</span>
                                    </div>
                                    {item.xp && (
                                        <div className="si-stat ml-auto">
                                            <span className="text-amber-400 font-black">{item.xp} XP</span>
                                        </div>
                                    )}
                                </div>

                                <Link
                                    to={item.type === 'room' ? `/rooms/${item.slug || item.id}` : `/labs/${item.id}`}
                                    className="rcp-primary-btn"
                                >
                                    Access Data 
                                    <ArrowUpRight size={16} />
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
