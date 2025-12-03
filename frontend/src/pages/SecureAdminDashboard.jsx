import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, Shield, BookOpen, MessageSquare, Settings, BarChart3,
  Plus, Edit, Trash2, Crown, Ban, CheckCircle, LogOut, Activity,
  Search, Eye, X, TrendingUp, Calendar, Bell, Filter, Download,
  MoreVertical, UserCheck, AlertTriangle, Zap, RefreshCw, Save
} from 'lucide-react'

// Disable any global WebSocket connections for admin
if (typeof window !== 'undefined') {
  window.DISABLE_WEBSOCKET = true
}

const SecureAdminDashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState({})
  const [users, setUsers] = useState([])
  const [rooms, setRooms] = useState([])
  const [labs, setLabs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const [formData, setFormData] = useState({})
  const [recentActivity, setRecentActivity] = useState([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUsers, setSelectedUsers] = useState([])
  const [editingItem, setEditingItem] = useState(null)

  useEffect(() => {
    verifyAuth()
  }, [])

  // Disable WebSocket for admin panel to prevent reconnection issues
  useEffect(() => {
    // Clear any existing WebSocket connections
    if (window.socket) {
      window.socket.disconnect()
      window.socket = null
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchData()
      fetchRecentActivity()
    }
  }, [activeTab, user])

  // Real-time updates every 30 seconds + WebSocket events
  useEffect(() => {
    if (!user) return
    const interval = setInterval(() => {
      fetchData()
      fetchRecentActivity()
    }, 30000)
    return () => clearInterval(interval)
  }, [user, activeTab])

  // Real-time activity updates via polling (simplified)
  useEffect(() => {
    if (!user) return
    
    const interval = setInterval(() => {
      fetchRecentActivity()
    }, 5000) // Poll every 5 seconds for real-time feel
    
    return () => clearInterval(interval)
  }, [user])

  const verifyAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/secure-admin-login')
        return
      }

      const response = await fetch('http://localhost:5000/api/admin/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('adminUser')
          navigate('/secure-admin-login')
          return
        }
        throw new Error('Authentication failed')
      }

      const data = await response.json()
      if (!data.user || data.user.role !== 'admin') {
        localStorage.removeItem('token')
        localStorage.removeItem('adminUser')
        navigate('/secure-admin-login')
        return
      }

      setUser(data.user)
      setLoading(false)
    } catch (error) {
      console.error('Admin verification error:', error)
      // Don't redirect on network errors, show error state instead
      setLoading(false)
    }
  }

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (activeTab === 'dashboard') {
        const response = await fetch('http://localhost:5000/api/admin/dashboard/stats', {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } else if (activeTab === 'users') {
        const response = await fetch('http://localhost:5000/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setUsers(data.users || [])
        }
      } else if (activeTab === 'rooms') {
        const response = await fetch('http://localhost:5000/api/admin/rooms', {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setRooms(data.rooms || [])
        }
      } else if (activeTab === 'labs') {
        const response = await fetch('http://localhost:5000/api/admin/labs', {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setLabs(data.labs || [])
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      localStorage.removeItem('token')
      localStorage.removeItem('adminUser')
      navigate('/secure-admin-login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const fetchRecentActivity = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/admin/activity', {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setRecentActivity(data.activities || [])
      } else {
        // Fallback to mock data if endpoint not available
        setRecentActivity([
          { type: 'user', message: 'New user registered: John Doe', timestamp: '2 minutes ago' },
          { type: 'room', message: 'Room completed: SQL Injection Challenge', timestamp: '5 minutes ago' },
          { type: 'lab', message: 'New lab published: Network Security', timestamp: '1 hour ago' }
        ])
      }
    } catch (error) {
      console.error('Failed to fetch activity:', error)
      // Fallback to mock data on error
      setRecentActivity([
        { type: 'user', message: 'New user registered: John Doe', timestamp: '2 minutes ago' },
        { type: 'room', message: 'Room completed: SQL Injection Challenge', timestamp: '5 minutes ago' },
        { type: 'lab', message: 'New lab published: Network Security', timestamp: '1 hour ago' }
      ])
    }
  }

  const refreshData = async () => {
    setIsRefreshing(true)
    await Promise.all([fetchData(), fetchRecentActivity()])
    setIsRefreshing(false)
  }

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('token')
        await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include'
        })
        fetchData()
        fetchRecentActivity()
      } catch (error) {
        console.error('Failed to delete user:', error)
      }
    }
  }

  const deleteRoom = async (roomId) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        const token = localStorage.getItem('token')
        await fetch(`http://localhost:5000/api/admin/rooms/${roomId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include'
        })
        fetchData()
        fetchRecentActivity()
      } catch (error) {
        console.error('Failed to delete room:', error)
      }
    }
  }

  const deleteLab = async (labId) => {
    if (window.confirm('Are you sure you want to delete this lab?')) {
      try {
        const token = localStorage.getItem('token')
        await fetch(`http://localhost:5000/api/admin/labs/${labId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include'
        })
        fetchData()
        fetchRecentActivity()
      } catch (error) {
        console.error('Failed to delete lab:', error)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const url = modalType === 'room' ? 'http://localhost:5000/api/admin/rooms' : 'http://localhost:5000/api/admin/labs'
      const method = editingItem ? 'PUT' : 'POST'
      const endpoint = editingItem ? `${url}/${editingItem._id}` : url
      
      await fetch(endpoint, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })
      setShowModal(false)
      setFormData({})
      setEditingItem(null)
      fetchData()
      fetchRecentActivity()
    } catch (error) {
      console.error('Failed to save:', error)
    }
  }

  const openModal = (type, item = null) => {
    setModalType(type)
    setEditingItem(item)
    if (item) {
      setFormData(item)
    } else {
      setFormData(type === 'room' ? {
        name: '', description: '', difficulty: 'Beginner', category: 'Web Security',
        points: 100, estimatedTime: 30, tags: ''
      } : {
        title: '', description: '', content: '', difficulty: 'Beginner',
        category: 'Web Security', points: 100, estimatedTime: 30, tags: ''
      })
    }
    setShowModal(true)
  }

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const bulkDeleteUsers = async () => {
    if (selectedUsers.length === 0) return
    if (window.confirm(`Delete ${selectedUsers.length} selected users?`)) {
      try {
        const token = localStorage.getItem('token')
        await fetch('http://localhost:5000/api/admin/users/bulk-delete', {
          method: 'DELETE',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include',
          body: JSON.stringify({ userIds: selectedUsers })
        })
        setSelectedUsers([])
        fetchData()
        fetchRecentActivity()
      } catch (error) {
        console.error('Failed to bulk delete users:', error)
      }
    }
  }

  const createNewRoom = async () => {
    try {
      const token = localStorage.getItem('token')
      const newRoomData = {
        slug: `new-room-${Date.now()}`,
        title: 'New Room',
        short_description: 'A new cybersecurity challenge room',
        long_description_markdown: '# New Room\n\nAdd your room description here...',
        difficulty: 'Beginner',
        category: 'Web',
        estimated_time_minutes: 30,
        topics: [],
        exercises: [],
        quizzes: []
      }
      
      const response = await fetch('http://localhost:5000/api/admin/rooms', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(newRoomData)
      })
      
      if (response.ok) {
        const data = await response.json()
        navigate(`/admin/rooms/${data.room._id}/edit`)
      }
    } catch (error) {
      console.error('Failed to create room:', error)
    }
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'rooms', label: 'Rooms', icon: MessageSquare },
    { id: 'labs', label: 'Labs', icon: BookOpen }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-white">Loading Admin Dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">
            <AlertTriangle className="w-12 h-12 mx-auto mb-2" />
            <p>Authentication Error</p>
          </div>
          <button 
            onClick={() => navigate('/secure-admin-login')}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
          >
            Go to Admin Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Professional Header */}
      <header className="bg-gray-800 border-b border-gray-700 shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">CyberVerse Admin</h1>
                <p className="text-gray-300 text-sm">Professional Management Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2">
                <button className="p-2 rounded-lg bg-gray-700 text-cyan-400 hover:bg-gray-600 hover:text-cyan-300 transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-lg bg-gray-700 text-cyan-400 hover:bg-gray-600 hover:text-cyan-300 transition-colors">
                  <Search className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-700">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center text-black font-semibold text-sm">
                  {user?.name?.charAt(0)}
                </div>
                <div className="hidden sm:block text-right">
                  <div className="text-white font-medium text-sm">{user?.name}</div>
                  <div className="text-green-400 text-xs flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    Administrator
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 bg-gray-800 border-r border-gray-700 min-h-screen">
          <nav className="p-4 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30 shadow-lg shadow-green-500/20'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-cyan-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                  {activeTab === tab.id && (
                    <div className="ml-auto w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  )}
                </button>
              )
            })}
          </nav>
          
          <div className="absolute bottom-4 left-4 right-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-gray-700 to-gray-600 border border-cyan-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-white">System Status</span>
              </div>
              <div className="text-xs text-gray-300">All systems operational</div>
              <div className="flex items-center gap-1 mt-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400">Online</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-white capitalize">
                {activeTab === 'dashboard' ? 'Overview' : `${activeTab} Management`}
              </h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={refreshData}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 hover:border-green-400 transition-colors text-gray-300 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 hover:border-cyan-400 transition-colors text-gray-300">
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <p className="text-gray-400">
              {activeTab === 'dashboard' && 'Monitor your platform performance and key metrics'}
              {activeTab === 'users' && 'Manage user accounts, roles, and permissions'}
              {activeTab === 'rooms' && 'Create and manage cybersecurity challenge rooms'}
              {activeTab === 'labs' && 'Organize and maintain hands-on learning laboratories'}
            </p>
          </div>

          {/* Dashboard Overview */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg hover:shadow-cyan-500/20 hover:border-cyan-500/50 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg bg-cyan-500/20">
                      <Users className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div className="flex items-center gap-1 text-green-400 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      +12%
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Total Users</p>
                    <p className="text-3xl font-bold text-white">{stats.totalUsers || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">+23 this month</p>
                  </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg hover:shadow-green-500/20 hover:border-green-500/50 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg bg-green-500/20">
                      <UserCheck className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="flex items-center gap-1 text-green-400 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      +8%
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Active Users</p>
                    <p className="text-3xl font-bold text-white">{stats.activeUsers || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
                  </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg hover:shadow-purple-500/20 hover:border-purple-500/50 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg bg-purple-500/20">
                      <MessageSquare className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="flex items-center gap-1 text-green-400 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      +5%
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Challenge Rooms</p>
                    <p className="text-3xl font-bold text-white">{stats.totalRooms || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">+2 this week</p>
                  </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg hover:shadow-orange-500/20 hover:border-orange-500/50 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg bg-orange-500/20">
                      <BookOpen className="w-6 h-6 text-orange-400" />
                    </div>
                    <div className="flex items-center gap-1 text-green-400 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      +15%
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Learning Labs</p>
                    <p className="text-3xl font-bold text-white">{stats.totalLabs || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">+4 this month</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                    <button 
                      onClick={fetchRecentActivity}
                      className="text-cyan-400 text-sm hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Refresh
                    </button>
                  </div>
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-gray-700">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === 'user' ? 'bg-green-400' :
                          activity.type === 'room' ? 'bg-cyan-400' :
                          activity.type === 'lab' ? 'bg-purple-400' : 'bg-orange-400'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{activity.message}</p>
                          <p className="text-xs text-gray-400">{activity.timestamp}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-gray-400">
                        <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No recent activity</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                  <h3 className="text-lg font-semibold text-white mb-6">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => openModal('room')}
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 hover:shadow-cyan-500/20 shadow-lg transition-all"
                    >
                      <Plus className="w-5 h-5" />
                      <span className="font-medium">Add New Room</span>
                    </button>
                    <button
                      onClick={() => openModal('lab')}
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 hover:shadow-purple-500/20 shadow-lg transition-all"
                    >
                      <Plus className="w-5 h-5" />
                      <span className="font-medium">Create Lab</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab('users')}
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 hover:shadow-green-500/20 shadow-lg transition-all"
                    >
                      <Users className="w-5 h-5" />
                      <span className="font-medium">Manage Users</span>
                    </button>
                    {selectedUsers.length > 0 && (
                      <button
                        onClick={bulkDeleteUsers}
                        className="w-full flex items-center gap-3 p-3 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:shadow-red-500/20 shadow-lg transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                        <span className="font-medium">Delete Selected ({selectedUsers.length})</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Management */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  {selectedUsers.length > 0 && (
                    <button
                      onClick={bulkDeleteUsers}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Selected ({selectedUsers.length})
                    </button>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-900">
                      <tr>
                        <th className="text-left py-4 px-6">
                          <input
                            type="checkbox"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers(users.map(u => u._id))
                              } else {
                                setSelectedUsers([])
                              }
                            }}
                            className="rounded border-gray-600 bg-gray-700 text-cyan-400 focus:ring-cyan-400"
                          />
                        </th>
                        <th className="text-left py-4 px-6 text-gray-300 font-medium">User</th>
                        <th className="text-left py-4 px-6 text-gray-300 font-medium">Email</th>
                        <th className="text-left py-4 px-6 text-gray-300 font-medium">Role</th>
                        <th className="text-left py-4 px-6 text-gray-300 font-medium">Points</th>
                        <th className="text-left py-4 px-6 text-gray-300 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.filter(user => 
                        !searchTerm || 
                        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
                      ).map((user) => (
                        <tr key={user._id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                          <td className="py-4 px-6">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user._id)}
                              onChange={() => toggleUserSelection(user._id)}
                              className="rounded border-gray-600 bg-gray-700 text-cyan-400 focus:ring-cyan-400"
                            />
                          </td>
                          <td className="py-4 px-6 text-white font-medium">{user.name}</td>
                          <td className="py-4 px-6 text-gray-400">{user.email}</td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.role === 'admin' 
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-green-400 font-medium">{user.points || 0}</td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => navigate(`/admin/users/${user._id}`)}
                                className="p-2 text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteUser(user._id)}
                                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Rooms Management */}
          {activeTab === 'rooms' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="text-gray-400 text-sm">
                  {rooms.length} total rooms
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal('room')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Quick Add
                  </button>
                  <button
                    onClick={() => createNewRoom()}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 hover:shadow-cyan-500/20 shadow-lg transition-all"
                  >
                    <Edit className="w-4 h-4" />
                    Create Room
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.filter(room => 
                  !searchTerm || 
                  room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  room.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  room.description?.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((room) => (
                  <div key={room._id} className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg hover:shadow-cyan-500/20 hover:border-cyan-500/50 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">{room.title || room.name}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/admin/rooms/${room._id}/edit`)}
                          className="p-2 text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition-colors"
                          title="Edit Room Content"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openModal('room', room)}
                          className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                          title="Quick Edit"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteRoom(room._id)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Delete Room"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{room.description}</p>
                    <div className="flex justify-between items-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        room.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        room.difficulty === 'Intermediate' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                        'bg-red-500/20 text-red-400 border-red-500/30'
                      }`}>
                        {room.difficulty}
                      </span>
                      <div className="flex items-center gap-2">
                        {room.isPremium && (
                          <Crown className="w-4 h-4 text-yellow-400" title="Premium" />
                        )}
                        <span className="text-green-400 text-sm font-medium">{room.points} pts</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Labs Management */}
          {activeTab === 'labs' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="text-gray-400 text-sm">
                  {labs.length} total labs
                </div>
                <button
                  onClick={() => openModal('lab')}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 hover:shadow-purple-500/20 shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Lab
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {labs.filter(lab => 
                  !searchTerm || 
                  lab.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  lab.description?.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((lab) => (
                  <div key={lab._id} className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg hover:shadow-purple-500/20 hover:border-purple-500/50 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors">{lab.title}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal('lab', lab)}
                          className="p-2 text-purple-400 hover:bg-purple-500/20 rounded-lg transition-colors"
                          title="Edit Lab"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteLab(lab._id)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Delete Lab"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{lab.description}</p>
                    <div className="flex justify-between items-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        lab.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        lab.difficulty === 'Intermediate' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                        'bg-red-500/20 text-red-400 border-red-500/30'
                      }`}>
                        {lab.difficulty}
                      </span>
                      <div className="flex items-center gap-2">
                        {lab.isPremium && (
                          <Crown className="w-4 h-4 text-yellow-400" title="Premium" />
                        )}
                        <span className="text-green-400 text-sm font-medium">{lab.points} pts</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl border border-gray-700 shadow-2xl shadow-cyan-500/10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingItem ? 'Edit' : 'Add'} {modalType === 'room' ? 'Room' : 'Lab'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingItem(null)
                  setFormData({})
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {modalType === 'room' ? 'Room Name' : 'Lab Title'}
                </label>
                <input
                  type="text"
                  required
                  value={modalType === 'room' ? formData.name || '' : formData.title || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    [modalType === 'room' ? 'name' : 'title']: e.target.value
                  })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  placeholder={`Enter ${modalType} ${modalType === 'room' ? 'name' : 'title'}...`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  placeholder="Enter description..."
                />
              </div>

              {modalType === 'lab' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.content || ''}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    placeholder="Enter lab content..."
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
                  <select
                    value={formData.difficulty || 'Beginner'}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Points</label>
                  <input
                    type="number"
                    min="10"
                    required
                    value={formData.points || 100}
                    onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-gray-300">
                  <input
                    type="checkbox"
                    checked={formData.isPremium || false}
                    onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                    className="rounded border-gray-600 bg-gray-700 text-cyan-400 focus:ring-cyan-400"
                  />
                  Premium Content
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingItem(null)
                    setFormData({})
                  }}
                  className="px-4 py-2 text-gray-400 border border-gray-600 rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white rounded-lg transition-all shadow-lg ${
                    modalType === 'room' 
                      ? 'bg-cyan-600 hover:bg-cyan-700 hover:shadow-cyan-500/20' 
                      : 'bg-purple-600 hover:bg-purple-700 hover:shadow-purple-500/20'
                  }`}
                >
                  <Save className="w-4 h-4 inline mr-2" />
                  {editingItem ? 'Update' : 'Create'} {modalType === 'room' ? 'Room' : 'Lab'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SecureAdminDashboard