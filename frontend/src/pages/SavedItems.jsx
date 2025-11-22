import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, BookmarkX, Clock, Award } from 'lucide-react'
import { useApp } from '../contexts/app-context'

const SavedItems = () => {
    const { user } = useApp()
    const [savedItems, setSavedItems] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSavedItems = async () => {
            try {
                const token = localStorage.getItem('token')
                const response = await fetch('http://localhost:5000/api/user/saved-items', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                if (response.ok) {
                    const data = await response.json()
                    setSavedItems(data.savedItems || [])
                }
            } catch (error) {
                console.error('Failed to fetch saved items:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchSavedItems()
    }, [])

    const handleUnsave = async (itemType, itemId) => {
        try {
            const token = localStorage.getItem('token')
            await fetch(`http://localhost:5000/api/user/save-item/${itemType}/${itemId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            // Remove from list
            setSavedItems(prev => prev.filter(item => item.itemId._id !== itemId))
        } catch (error) {
            console.error('Failed to unsave item:', error)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-text mb-2">Saved Items</h1>
                <p className="text-muted">Your bookmarked rooms and labs</p>
            </div>

            {savedItems.length === 0 ? (
                <div className="card p-12 text-center">
                    <Bookmark className="w-16 h-16 text-muted mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-text mb-2">No Saved Items</h3>
                    <p className="text-muted">Bookmark rooms and labs to access them quickly!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedItems.map((item) => (
                        <div
                            key={item._id}
                            className="card p-6 hover:border-primary/50 transition-all group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.itemType === 'room'
                                        ? 'bg-primary/20 text-primary'
                                        : 'bg-accent/20 text-accent'
                                    }`}>
                                    {item.itemType.toUpperCase()}
                                </span>
                                <button
                                    onClick={() => handleUnsave(item.itemType, item.itemId._id)}
                                    className="p-1 hover:bg-danger/10 rounded transition-colors"
                                    title="Remove from saved"
                                >
                                    <BookmarkX className="w-4 h-4 text-muted hover:text-danger" />
                                </button>
                            </div>

                            <h3 className="font-bold text-text mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                {item.itemId?.title || item.itemId?.name || 'Untitled'}
                            </h3>

                            <p className="text-sm text-muted mb-4 line-clamp-2">
                                {item.itemId?.description || 'No description'}
                            </p>

                            <div className="flex items-center justify-between text-xs text-muted">
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Saved {new Date(item.savedAt).toLocaleDateString()}
                                </span>
                                {item.itemId?.difficulty && (
                                    <span className={`px-2 py-1 rounded ${item.itemId.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                                            item.itemId.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-red-500/20 text-red-400'
                                        }`}>
                                        {item.itemId.difficulty}
                                    </span>
                                )}
                            </div>

                            <Link
                                to={item.itemType === 'room' ? `/rooms/${item.itemId?.slug}` : `/labs/${item.itemId?._id}`}
                                className="mt-4 block w-full btn-primary text-center text-sm py-2"
                            >
                                View {item.itemType === 'room' ? 'Room' : 'Lab'}
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default SavedItems
