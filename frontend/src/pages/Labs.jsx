import { useState, useMemo, memo, useCallback, useEffect } from "react"
import { Search, Grid, List, Lock, Clock, Users, Filter, Star, Play, BookOpen, Trophy, X, ChevronDown, Sparkles, TrendingUp, Award } from "lucide-react"
import { Link } from "react-router-dom"
import { ProtectedRoute } from "../components/protected-route"
import { getLabs } from "../services/labs"

// Rich Media Lab Card Component
const LabCard = memo(({ lab }) => (
  <Link to={`/labs/${lab.id}`} className="block group">
    <div className="card overflow-hidden hover:scale-[1.02] hover:border-primary/40 transition-all duration-300 h-full">
      {/* Image Cover */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
        <img
          src={lab.coverImage}
          alt={lab.title}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        {/* Badge Overlays */}
        <div className="absolute top-3 right-3 flex gap-2">
          {lab.isPremium ? (
            <div className="flex items-center gap-1 px-2 py-1 bg-warning/90 backdrop-blur-sm text-black rounded-md text-xs font-bold">
              <Lock className="h-3 w-3" />
              PRO
            </div>
          ) : (
            <div className="px-2 py-1 bg-success/90 backdrop-blur-sm text-white rounded-md text-xs font-bold">
              FREE
            </div>
          )}
        </div>
        {/* Type Badge */}
        <div className="absolute bottom-3 left-3">
          {lab.type === 'ctf' ? (
            <div className="flex items-center gap-1 px-2 py-1 bg-purple-600/90 backdrop-blur-sm text-white rounded-md text-xs font-semibold">
              <Trophy className="h-3 w-3" />
              CTF
            </div>
          ) : (
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-600/90 backdrop-blur-sm text-white rounded-md text-xs font-semibold">
              <BookOpen className="h-3 w-3" />
              Walkthrough
            </div>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4">
        <h3 className="font-bold text-text mb-1 line-clamp-1 group-hover:text-primary transition-colors">
          {lab.title}
        </h3>
        <p className="text-xs text-muted mb-3">Created by {lab.creator}</p>

        {/* Star Rating */}
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${i < Math.floor(lab.rating) ? 'fill-warning text-warning' : 'text-muted/30'}`}
            />
          ))}
          <span className="text-xs text-muted ml-1">({lab.rating.toFixed(1)})</span>
        </div>

        {/* Metadata Row */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 text-muted">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {lab.participants}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {lab.duration}
            </span>
          </div>
          <span className={`px-2 py-1 rounded-md font-semibold ${lab.difficulty === 'Easy' ? 'bg-success/20 text-success border border-success/30' :
            lab.difficulty === 'Medium' ? 'bg-warning/20 text-warning border border-warning/30' :
              lab.difficulty === 'Hard' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                'bg-danger/20 text-danger border border-danger/30'
            }`}>
            {lab.difficulty}
          </span>
        </div>
      </div>
    </div>
  </Link>
))

const Labs = memo(() => {
  const [viewMode, setViewMode] = useState("grid")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedDifficulties, setSelectedDifficulties] = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [selectedType, setSelectedType] = useState("all") // walkthrough, ctf, all
  const [subscriptionFilter, setSubscriptionFilter] = useState("all") // all, free, premium
  const [sortBy, setSortBy] = useState("newest") // newest, popular, difficulty
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // Mobile filter toggle
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9

  // Labs will be populated from API
  const [labs, setLabs] = useState([])

  // Featured Lab - will be set from API response
  const featuredLab = useMemo(() => labs.find(lab => lab.featured) || null, [labs])

  // TODO: Fetch labs from API
  useEffect(() => {
    const fetchLabs = async () => {
      try {
        // const fetchedLabs = await getLabs({ category: selectedCategory, difficulty: selectedDifficulties, type: selectedType })
        // setLabs(fetchedLabs)
      } catch (error) {
        console.error("Failed to fetch labs:", error)
      }
    }
    fetchLabs()
  }, [selectedCategory, selectedDifficulties, selectedType, subscriptionFilter])

  const categories = useMemo(() => [
    { value: "all", label: "All Categories" },
    { value: "web", label: "Web Security" },
    { value: "network", label: "Network" },
    { value: "system", label: "System" },
    { value: "crypto", label: "Cryptography" },
    { value: "osint", label: "OSINT" },
    { value: "mobile", label: "Mobile" }
  ], [])

  const difficulties = ["Easy", "Medium", "Hard", "Insane"]

  const allTags = useMemo(() => {
    const tags = new Set()
    labs.forEach(lab => lab.tags?.forEach(tag => tags.add(tag)))
    return Array.from(tags)
  }, [labs])

  // Advanced Filtering
  const filteredLabs = useMemo(() => {
    return labs.filter(lab => {
      const matchesSearch = lab.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lab.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "all" || lab.category === selectedCategory
      const matchesDifficulty = selectedDifficulties.length === 0 || selectedDifficulties.includes(lab.difficulty)
      const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => lab.tags.includes(tag))
      const matchesType = selectedType === "all" || lab.type === selectedType
      const matchesSubscription = subscriptionFilter === "all" ||
        (subscriptionFilter === "free" && !lab.isPremium) ||
        (subscriptionFilter === "premium" && lab.isPremium)

      return matchesSearch && matchesCategory && matchesDifficulty && matchesTags && matchesType && matchesSubscription
    })
  }, [labs, searchTerm, selectedCategory, selectedDifficulties, selectedTags, selectedType, subscriptionFilter])

  // Sorting
  const sortedLabs = useMemo(() => {
    const sorted = [...filteredLabs]
    switch (sortBy) {
      case "popular":
        return sorted.sort((a, b) => parseFloat(b.participants) - parseFloat(a.participants))
      case "difficulty":
        const difficultyOrder = { "Easy": 1, "Medium": 2, "Hard": 3, "Insane": 4 }
        return sorted.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty])
      case "newest":
      default:
        return sorted // Already in newest order
    }
  }, [filteredLabs, sortBy])

  // Pagination
  const paginatedLabs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedLabs.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedLabs, currentPage])

  const totalPages = Math.ceil(sortedLabs.length / itemsPerPage)

  // Handlers
  const toggleDifficulty = useCallback((difficulty) => {
    setSelectedDifficulties(prev =>
      prev.includes(difficulty) ? prev.filter(d => d !== difficulty) : [...prev, difficulty]
    )
    setCurrentPage(1)
  }, [])

  const toggleTag = useCallback((tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
    setCurrentPage(1)
  }, [])

  const clearFilters = useCallback(() => {
    setSelectedDifficulties([])
    setSelectedTags([])
    setSelectedCategory("all")
    setSelectedType("all")
    setSubscriptionFilter("all")
    setSearchTerm("")
    setCurrentPage(1)
  }, [])

  return (
    <ProtectedRoute>
      <div className="page-container bg-[rgb(8,12,16)] text-text min-h-screen">
        <div className="container mx-auto px-4 max-w-[1600px] py-6">

          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                <span className="gradient-text">Hacktivities</span>
              </h1>
              <p className="text-muted">Discover challenges and learning paths</p>
            </div>
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden btn-primary px-4 py-2 flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* LEFT SIDEBAR - Filters (25%) */}
            <div className={`lg:col-span-3 ${isSidebarOpen ? 'block' : 'hidden lg:block'}`}>
              <div className="card p-5 sticky top-4 space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto">

                {/* Close Button (Mobile) */}
                <div className="flex items-center justify-between lg:hidden mb-4">
                  <h3 className="font-bold text-lg">Filters</h3>
                  <button onClick={() => setIsSidebarOpen(false)}>
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Search */}
                <div>
                  <label className="block text-sm font-semibold text-muted mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
                    <input
                      placeholder="Search labs..."
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                      className="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary labs-search-input"
                    />
                  </div>
                </div>

                {/* Subscription Filter */}
                <div>
                  <label className="block text-sm font-semibold text-muted mb-2">Subscription</label>
                  <div className="space-y-2">
                    {['all', 'free', 'premium'].map((option) => (
                      <label key={option} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="subscription"
                          checked={subscriptionFilter === option}
                          onChange={() => { setSubscriptionFilter(option); setCurrentPage(1); }}
                          className="w-4 h-4 text-primary"
                        />
                        <span className="text-sm capitalize group-hover:text-primary transition-colors">
                          {option === 'all' ? 'All Labs' : option === 'free' ? 'Free Only' : 'Premium Only'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-muted mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                    className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary labs-dropdown"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-semibold text-muted mb-2">Type</label>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'All Types', icon: null },
                      { value: 'walkthrough', label: 'Walkthroughs', icon: BookOpen },
                      { value: 'ctf', label: 'CTF Challenges', icon: Trophy }
                    ].map((option) => {
                      const Icon = option.icon
                      return (
                        <label key={option.value} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="radio"
                            name="type"
                            checked={selectedType === option.value}
                            onChange={() => { setSelectedType(option.value); setCurrentPage(1); }}
                            className="w-4 h-4 text-primary"
                          />
                          <div className="flex items-center gap-1.5">
                            {Icon && <Icon className="w-3.5 h-3.5 text-muted group-hover:text-primary" />}
                            <span className="text-sm group-hover:text-primary transition-colors">{option.label}</span>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>

                {/* Difficulty Checkboxes */}
                <div>
                  <label className="block text-sm font-semibold text-muted mb-2">Difficulty</label>
                  <div className="space-y-2">
                    {difficulties.map((difficulty) => (
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

                {/* Tags Cloud */}
                <div>
                  <label className="block text-sm font-semibold text-muted mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${selectedTags.includes(tag)
                          ? 'bg-primary/20 text-primary border border-primary/40'
                          : 'bg-white/5 text-muted hover:bg-white/10 border border-white/10'
                          }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
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

            {/* MAIN CONTENT (75%) */}
            <div className="lg:col-span-9 space-y-6">

              {/* Featured Lab Banner */}
              {featuredLab && (
                <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-r from-purple-900/40 to-blue-900/40 backdrop-blur-sm">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-10"></div>
                  <img
                    src={featuredLab.coverImage}
                    alt={featuredLab.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                  />
                  <div className="relative z-20 p-8 lg:p-12">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-warning" />
                      <span className="text-sm font-semibold text-warning">Featured Challenge</span>
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">{featuredLab.title}</h2>
                    <p className="text-lg text-slate-200 mb-4 max-w-2xl">{featuredLab.description}</p>
                    <div className="flex items-center gap-4 mb-6 text-sm text-slate-300">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {featuredLab.participants} enrolled
                      </span>
                      <span className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < Math.floor(featuredLab.rating) ? 'fill-warning text-warning' : 'text-slate-500'}`} />
                        ))}
                        <span className="ml-1">{featuredLab.rating}</span>
                      </span>
                    </div>
                    <Link to={`/labs/${featuredLab.id}`} className="btn-primary px-6 py-3 text-lg inline-flex items-center gap-2">
                      <Play className="w-5 h-5" />
                      Start Now
                    </Link>
                  </div>
                </div>
              )}

              {/* Sort & View Controls */}
              <div className="flex items-center justify-between">
                <p className="text-muted">
                  Showing <span className="text-primary font-semibold">{paginatedLabs.length}</span> of{' '}
                  <span className="text-primary font-semibold">{sortedLabs.length}</span> labs
                </p>
                <div className="flex items-center gap-3">
                  <select
                    value={sortBy}
                    onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                    className="px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary labs-dropdown text-sm"
                  >
                    <option value="newest">Newest</option>
                    <option value="popular">Most Popular</option>
                    <option value="difficulty">Difficulty</option>
                  </select>
                  <div className="flex bg-panel border border-card-border rounded-lg p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-md ${viewMode === "grid" ? "bg-primary text-black" : "text-muted hover:text-text"}`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-md ${viewMode === "list" ? "bg-primary text-black" : "text-muted hover:text-text"}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Labs Grid */}
              {paginatedLabs.length === 0 ? (
                <div className="text-center py-16 card">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-lg font-semibold text-text mb-2">No labs found</p>
                  <p className="text-muted mb-4">Try adjusting your filters or search term</p>
                  <button onClick={clearFilters} className="btn-primary px-4 py-2">
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className={`grid gap-5 ${viewMode === "grid"
                  ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                  : "grid-cols-1"
                  }`}>
                  {paginatedLabs.map(lab => (
                    <LabCard key={lab.id} lab={lab} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 rounded-lg font-semibold transition-colors ${currentPage === i + 1
                          ? 'bg-primary text-black'
                          : 'bg-white/5 hover:bg-white/10 text-text'
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
})

Labs.displayName = 'Labs'
export default Labs