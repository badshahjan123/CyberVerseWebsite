import { useState, useMemo, memo, useCallback, useEffect } from "react"
import { Users, Zap, Plus, Filter, Clock, Crown, Search, ChevronDown, Star, Flame, Trophy, X, Play, Award, TrendingUp, Bookmark, BookmarkCheck } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { getRooms } from "../services/rooms"
import { useBookmarks } from "../contexts/bookmark-context"
import { ProtectedRoute } from "../components/protected-route"

// Skeleton Loader Component
const SkeletonCard = memo(() => (
  <div className="card overflow-hidden animate-pulse">
    <div className="h-40 bg-slate-700/50"></div>
    <div className="p-4 space-y-3">
      <div className="h-4 bg-slate-700/50 rounded w-3/4"></div>
      <div className="h-3 bg-slate-700/50 rounded w-full"></div>
      <div className="h-3 bg-slate-700/50 rounded w-2/3"></div>
      <div className="flex gap-2 mt-4">
        <div className="h-6 bg-slate-700/50 rounded w-16"></div>
        <div className="h-6 bg-slate-700/50 rounded w-20"></div>
      </div>
    </div>
  </div>
))

// Helper to get placeholder image based on category
const getRoomImage = (category = 'general') => {
  const categoryMap = {
    'web': 'https://placehold.co/600x400/1e293b/9bff00?text=Web+Security',
    'development': 'https://placehold.co/600x400/1e1b4b/a78bfa?text=Development',
    'networking': 'https://placehold.co/600x400/0f172a/00b8d9?text=Networking',
    'devops': 'https://placehold.co/600x400/14532d/22c55e?text=DevOps',
    'security': 'https://placehold.co/600x400/7f1d1d/ef4444?text=Security',
    'general': 'https://placehold.co/600x400/18181b/f59e0b?text=Challenge'
  }
  return categoryMap[category?.toLowerCase()] || categoryMap.general
}

// Get difficulty color
const getDifficultyConfig = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'info':
    case 'beginner':
      return { color: 'bg-info/20 text-info border-info/30', barColor: 'bg-info', width: 20 }
    case 'easy':
      return { color: 'bg-success/20 text-success border-success/30', barColor: 'bg-success', width: 40 }
    case 'medium':
    case 'intermediate':
      return { color: 'bg-warning/20 text-warning border-warning/30', barColor: 'bg-warning', width: 60 }
    case 'hard':
      return { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', barColor: 'bg-orange-500', width: 80 }
    case 'insane':
      return { color: 'bg-danger/20 text-danger border-danger/30', barColor: 'bg-danger', width: 100 }
    default:
      return { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', barColor: 'bg-gray-500', width: 50 }
  }
}

// Professional Room Card Component
const RoomCard = memo(({ room, onBookmark, isBookmarked }) => {
  const difficultyConfig = getDifficultyConfig(room.difficulty)
  const xpReward = room.points || 500 // Use points field or default
  const isNew = room.isNew || false
  const subscriberOnly = room.subscriberOnly || room.isPremium || false
  
  const handleBookmark = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onBookmark(room)
  }

  return (
    <Link to={`/rooms/${room.slug}`} className="block group">
      <div className="card overflow-hidden hover:scale-105 hover:ring-2 hover:ring-primary/50 transition-all duration-300 h-full">
        {/* Thumbnail Image */}
        <div className="relative h-40 overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
          <img
            src={room.coverImage || getRoomImage(room.category)}
            alt={room.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
          {/* Badge Overlays */}
          <div className="absolute top-3 right-3 flex gap-2">
            {isNew && (
              <div className="px-2 py-1 bg-primary/90 backdrop-blur-sm text-black rounded-md text-xs font-bold flex items-center gap-1">
                <Flame className="w-3 h-3" />
                NEW
              </div>
            )}
            {subscriberOnly ? (
              <div className="px-2 py-1 bg-warning/90 backdrop-blur-sm text-black rounded-md text-xs font-bold flex items-center gap-1">
                <Crown className="w-3 h-3" />
                PRO
              </div>
            ) : (
              <div className="px-2 py-1 bg-success/90 backdrop-blur-sm text-white rounded-md text-xs font-bold">
                FREE
              </div>
            )}
          </div>
          
          {/* Bookmark Button */}
          <button
            onClick={handleBookmark}
            className={`absolute top-3 left-3 p-2 rounded-full backdrop-blur-sm transition-all ${
              isBookmarked 
                ? 'bg-warning/90 text-black hover:bg-warning' 
                : 'bg-black/50 text-white hover:bg-black/70'
            }`}
          >
            {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>
          {/* Difficulty Bar Overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
            <div
              className={`h-full ${difficultyConfig.barColor} transition-all`}
              style={{ width: `${difficultyConfig.width}%` }}
            />
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4">
          <h3 className="font-bold text-text mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {room.title}
          </h3>
          <p className="text-xs text-muted mb-3 line-clamp-2">
            {room.short_description || room.description}
          </p>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
            <div className="flex items-center gap-1.5 text-muted">
              <Clock className="w-3.5 h-3.5" />
              <span>{room.estimated_time_minutes || 0} min</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted">
              <Users className="w-3.5 h-3.5" />
              <span>{room.usersOnline || (room.completedBy?.length || 0)} online</span>
            </div>
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded ${difficultyConfig.color} text-xs font-semibold col-span-2`}>
              <Award className="w-3.5 h-3.5" />
              {room.difficulty || 'Medium'}
            </div>
          </div>

          {/* XP Reward Banner */}
          <div className="flex items-center justify-between p-2 bg-primary/10 border border-primary/20 rounded-md">
            <span className="text-xs text-muted">XP Reward</span>
            <span className="text-sm font-bold text-primary">+{xpReward} XP</span>
          </div>
        </div>
      </div>
    </Link>
  )
})

const Rooms = memo(() => {
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks()
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedTypes, setSelectedTypes] = useState([]) // walkthrough, challenge
  const [selectedDifficulties, setSelectedDifficulties] = useState([])
  const [orderBy, setOrderBy] = useState("popular") // popular, newest
  const [searchTerm, setSearchTerm] = useState("")
  const [showSidebar, setShowSidebar] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true) // Track initial load
  const [error, setError] = useState(null)
  const [rooms, setRooms] = useState([])

  // Featured Room (from API)
  const featuredRoom = useMemo(() => rooms.find(room => room.featured) || null, [rooms])

  // Advanced Filtering
  const filteredRooms = useMemo(() => {
    const filtered = rooms.filter(room => {
      const matchesSearch = room.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.description?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "all" || room.category?.toLowerCase() === selectedCategory.toLowerCase()
      const matchesType = selectedTypes.length === 0 ||
        selectedTypes.includes(room.type?.toLowerCase()) ||
        selectedTypes.some(type => room.tags?.includes(type))
      const matchesDifficulty = selectedDifficulties.length === 0 ||
        selectedDifficulties.includes(room.difficulty)

      const passes = matchesSearch && matchesCategory && matchesType && matchesDifficulty
      
      if (room.title?.toLowerCase().includes('network')) {
        console.log('🔍 Networking room filter check:', {
          title: room.title,
          category: room.category,
          selectedCategory,
          matchesSearch,
          matchesCategory,
          matchesType,
          matchesDifficulty,
          passes
        })
      }
      
      return passes
    })
    
    console.log('🔍 Filtered rooms count:', filtered.length)
    return filtered
  }, [rooms, searchTerm, selectedCategory, selectedTypes, selectedDifficulties])

  // Sorting
  const sortedRooms = useMemo(() => {
    const sorted = [...filteredRooms]
    if (orderBy === 'popular') {
      return sorted.sort((a, b) => (b.completedBy?.length || 0) - (a.completedBy?.length || 0))
    } else if (orderBy === 'newest') {
      return sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    }
    console.log('📊 Final sorted rooms:', sorted.length)
    return sorted
  }, [filteredRooms, orderBy])

  // Stats
  const stats = useMemo(() => {
    const activeRooms = rooms.filter(room => room.isActive).length
    const totalCompletions = rooms.reduce((sum, room) => sum + (room.completedBy?.length || 0), 0)
    return { activeRooms, totalCompletions }
  }, [rooms])

  // Fetch Rooms
  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getRooms({ category: selectedCategory })
      console.log('🏠 Fetched rooms:', data)
      console.log('🏠 Number of rooms:', data.length)
      console.log('🏠 Room categories:', data.map(r => r.category))
      setRooms(data)
      setIsInitialLoad(false) // Mark initial load as complete
    } catch (err) {
      setError('Failed to load rooms')
      console.error('Error fetching rooms:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedCategory])

  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  // Handlers
  const toggleType = useCallback((type) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }, [])

  const toggleDifficulty = useCallback((difficulty) => {
    setSelectedDifficulties(prev =>
      prev.includes(difficulty) ? prev.filter(d => d !== difficulty) : [...prev, difficulty]
    )
  }, [])

  const clearFilters = useCallback(() => {
    setSelectedTypes([])
    setSelectedDifficulties([])
    setSelectedCategory("all")
    setSearchTerm("")
    setOrderBy("popular")
  }, [])

  return (
    <ProtectedRoute>
      <div className="page-container bg-[rgb(8,12,16)] text-text min-h-screen">
        <div className="container mx-auto px-4 max-w-[1600px] py-6">

          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                <span className="gradient-text">Active Rooms</span>
              </h1>
              <p className="text-muted">Join live challenges and test your skills</p>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="lg:hidden btn-primary px-4 py-2 flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Featured Room Banner - "Room of the Day" */}
          {loading ? (
            <div className="relative overflow-hidden rounded-xl mb-6 border border-primary/20 bg-gradient-to-r from-purple-900/40 to-blue-900/40 backdrop-blur-sm animate-pulse">
              <div className="h-48 lg:h-64 bg-slate-700/50"></div>
              <div className="absolute inset-0 p-8 lg:p-12 flex flex-col justify-center">
                <div className="h-4 bg-slate-700/50 rounded w-32 mb-3"></div>
                <div className="h-8 lg:h-10 bg-slate-700/50 rounded w-3/4 mb-3"></div>
                <div className="h-5 bg-slate-700/50 rounded w-full max-w-2xl mb-4"></div>
                <div className="flex gap-4 mb-6">
                  <div className="h-4 bg-slate-700/50 rounded w-16"></div>
                  <div className="h-4 bg-slate-700/50 rounded w-20"></div>
                  <div className="h-6 bg-slate-700/50 rounded w-24"></div>
                </div>
                <div className="h-12 bg-slate-700/50 rounded w-40"></div>
              </div>
            </div>
          ) : featuredRoom && (
            <div className="relative overflow-hidden rounded-xl mb-6 border border-primary/20 bg-gradient-to-r from-purple-900/40 to-blue-900/40 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent z-10"></div>
              <img
                src={featuredRoom.coverImage || getRoomImage(featuredRoom.category)}
                alt={featuredRoom.title}
                className="absolute inset-0 w-full h-full object-cover opacity-30"
              />
              <div className="relative z-20 p-8 lg:p-12">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold text-primary">Room of the Day</span>
                  {featuredRoom.isNew && (
                    <span className="px-2 py-0.5 bg-danger/90 text-white rounded text-xs font-bold">NEW RELEASE</span>
                  )}
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">{featuredRoom.title}</h2>
                <p className="text-lg text-slate-200 mb-4 max-w-2xl">{featuredRoom.short_description || featuredRoom.description}</p>
                <div className="flex items-center gap-4 mb-6 text-sm text-slate-300">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {featuredRoom.estimated_time_minutes || 0} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {featuredRoom.completedBy?.length || 0} completed
                  </span>
                  <span className={`px-3 py-1 rounded ${getDifficultyConfig(featuredRoom.difficulty).color}`}>
                    {featuredRoom.difficulty}
                  </span>
                </div>
                <Link to={`/rooms/${featuredRoom.slug}`} className="btn-primary px-8 py-3 text-lg inline-flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Start Hacking
                </Link>
              </div>
            </div>
          )}

          {/* 2-Column Layout: Sidebar + Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* LEFT SIDEBAR - Advanced Filters (20%) */}
            <div className={`lg:col-span-2 ${showSidebar ? 'block' : 'hidden lg:block'}`}>
              <div className="card p-5 sticky top-4 space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto">

                {/* Close Button (Mobile) */}
                <div className="flex items-center justify-between lg:hidden mb-4">
                  <h3 className="font-bold text-lg">Filters</h3>
                  <button onClick={() => setShowSidebar(false)}>
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Search */}
                <div>
                  <label className="block text-sm font-semibold text-muted mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
                    <input
                      placeholder="Search for rooms..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary labs-search-input"
                    />
                  </div>
                </div>

                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-semibold text-muted mb-2">Type</label>
                  <div className="space-y-2">
                    {['walkthrough', 'challenge'].map((type) => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedTypes.includes(type)}
                          onChange={() => toggleType(type)}
                          className="w-4 h-4 rounded text-primary"
                        />
                        <span className="text-sm capitalize group-hover:text-primary transition-colors">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <label className="block text-sm font-semibold text-muted mb-2">Difficulty</label>
                  <div className="space-y-2">
                    {['Beginner', 'Easy', 'Intermediate', 'Medium', 'Hard', 'Insane'].map((difficulty) => (
                      <label key={difficulty} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedDifficulties.includes(difficulty)}
                          onChange={() => toggleDifficulty(difficulty)}
                          className="w-4 h-4 rounded text-primary"
                        />
                        <span className="text-sm group-hover:text-primary transition-colors">{difficulty}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Order By */}
                <div>
                  <label className="block text-sm font-semibold text-muted mb-2">Order By</label>
                  <select
                    value={orderBy}
                    onChange={(e) => setOrderBy(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary labs-dropdown text-sm"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-semibold text-muted mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary labs-dropdown text-sm"
                  >
                    <option value="all">All Categories</option>
                    <option value="Development">Development</option>
                    <option value="Web">Web</option>
                    <option value="Networking">Networking</option>
                    <option value="DevOps">DevOps</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={clearFilters}
                  className="w-full btn-ghost text-sm py-2"
                >
                  Clear All Filters
                </button>
              </div>
            </div>

            {/* RIGHT GRID - Room Cards (80%) */}
            <div className="lg:col-span-10 space-y-6">

              {/* Results Header */}
              <div className="flex items-center justify-between">
                <p className="text-muted">
                  Showing <span className="text-primary font-semibold">{sortedRooms.length}</span> room{sortedRooms.length !== 1 ? 's' : ''}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted">
                  <span className="flex items-center gap-1">
                    <Zap className="w-4 h-4 text-success" />
                    {stats.activeRooms} Active
                  </span>
                </div>
              </div>

              {/* Loading State - Skeleton */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                  {[...Array(8)].map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-16 card">
                  <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-8 h-8 text-danger" />
                  </div>
                  <p className="text-lg font-semibold text-text mb-2">{error}</p>
                  <button
                    onClick={fetchRooms}
                    className="btn-primary px-6 py-2 mt-4"
                  >
                    Try Again
                  </button>
                </div>
              ) : sortedRooms.length === 0 ? (
                <div className="text-center py-16 card">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-lg font-semibold text-text mb-2">No rooms found</p>
                  <p className="text-muted mb-4">Try adjusting your filters</p>
                  <button onClick={clearFilters} className="btn-primary px-4 py-2">
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                  {sortedRooms.map(room => {
                    const roomBookmarked = isBookmarked(room.slug || room._id || room.id, 'room')
                    
                    const handleBookmark = (roomData) => {
                      if (roomBookmarked) {
                        removeBookmark(roomData.slug || roomData._id || roomData.id, 'room')
                      } else {
                        addBookmark({
                          id: roomData.slug || roomData._id || roomData.id,
                          slug: roomData.slug,
                          type: 'room',
                          title: roomData.title,
                          category: roomData.category,
                          difficulty: roomData.difficulty,
                          icon: roomData.icon
                        })
                      }
                    }
                    
                    return (
                      <RoomCard 
                        key={room._id || room.id} 
                        room={room} 
                        isBookmarked={roomBookmarked}
                        onBookmark={handleBookmark}
                      />
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
})

Rooms.displayName = 'Rooms'
export default Rooms