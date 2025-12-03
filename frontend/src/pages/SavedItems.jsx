import { Link } from 'react-router-dom'
import { Bookmark, BookmarkX, Clock, Award, Play } from 'lucide-react'
import { useBookmarks } from '../contexts/bookmark-context'

const SavedItems = () => {
    const { bookmarkedItems, removeBookmark } = useBookmarks()
    
    const handleUnsave = (id, type) => {
        removeBookmark(id, type)
    }
    
    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': case 'Beginner': return 'bg-success/20 text-success border-success/30'
            case 'Medium': case 'Intermediate': return 'bg-warning/20 text-warning border-warning/30'
            case 'Hard': case 'Insane': return 'bg-danger/20 text-danger border-danger/30'
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
        }
    }



    return (
        <div className="page-container bg-[rgb(8,12,16)] text-text min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-text mb-2">Saved Items</h1>
                <p className="text-muted">Your bookmarked rooms and labs</p>
            </div>

            {bookmarkedItems.length === 0 ? (
                <div className="card p-12 text-center">
                    <Bookmark className="w-16 h-16 text-muted mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-text mb-2">No Saved Items</h3>
                    <p className="text-muted mb-4">Bookmark rooms and labs to access them quickly!</p>
                    <div className="flex gap-3 justify-center">
                        <Link to="/rooms" className="btn-primary inline-flex items-center gap-2">
                            <Play className="w-4 h-4" />
                            Browse Rooms
                        </Link>
                        <Link to="/labs" className="btn-ghost inline-flex items-center gap-2">
                            <Award className="w-4 h-4" />
                            Browse Labs
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookmarkedItems.map((item) => (
                        <div
                            key={`${item.type}-${item.id}`}
                            className="card p-6 hover:border-primary/50 transition-all group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.type === 'room'
                                        ? 'bg-primary/20 text-primary'
                                        : 'bg-accent/20 text-accent'
                                    }`}>
                                    {item.type.toUpperCase()}
                                </span>
                                <button
                                    onClick={() => handleUnsave(item.id, item.type)}
                                    className="p-1 hover:bg-danger/10 rounded transition-colors"
                                    title="Remove from saved"
                                >
                                    <BookmarkX className="w-4 h-4 text-muted hover:text-danger" />
                                </button>
                            </div>

                            <div className="text-3xl mb-3">{item.icon || (item.type === 'room' ? '🎯' : '🧪')}</div>

                            <h3 className="font-bold text-text mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                {item.title}
                            </h3>

                            <p className="text-sm text-muted mb-4">
                                {item.category}
                            </p>

                            <div className="flex items-center justify-between text-xs mb-4">
                                <span className="flex items-center gap-1 text-muted">
                                    <Clock className="w-3 h-3" />
                                    Saved {new Date(item.bookmarkedAt).toLocaleDateString()}
                                </span>
                                {item.difficulty && (
                                    <span className={`px-2 py-1 rounded text-xs font-semibold border ${getDifficultyColor(item.difficulty)}`}>
                                        {item.difficulty}
                                    </span>
                                )}
                            </div>

                            <Link
                                to={item.type === 'room' ? `/rooms/${item.slug || item.id}` : `/labs/${item.id}`}
                                className="block w-full btn-primary text-center text-sm py-2"
                            >
                                View {item.type === 'room' ? 'Room' : 'Lab'}
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
