import { useState, useRef, useEffect, useMemo } from 'react'
import { Bell, Trophy, Zap, Flame, Target, Users, Check, CheckCheck, ShieldAlert, ShieldCheck, Key, Terminal, Cpu } from 'lucide-react'
import { apiCall } from '../config/api'
import { useRealtime } from '../contexts/realtime-context'
import { useToast } from '../contexts/toast-context'

const MOCK_INTEL = [
  {
    _id: "mock-1",
    title: "MISSION INITIALIZED",
    message: "Sandbox container successfully deployed and ready for entry.",
    category: "ROOM",
    color: "text-cyan-400",
    createdAt: new Date().toISOString(),
    isRead: false
  },
  {
    _id: "mock-2",
    title: "+250 XP EARNED",
    message: "Obtained via successful payload isolation in Web Room #4.",
    category: "XP",
    color: "text-yellow-400",
    createdAt: new Date(Date.now() - 300000).toISOString(),
    isRead: false
  },
  {
    _id: "mock-3",
    title: "CREDENTIAL VERIFIED",
    message: "Official security council signature attached to verification ID.",
    category: "CERTIFICATE",
    color: "text-emerald-400",
    createdAt: new Date(Date.now() - 1200000).toISOString(),
    isRead: true
  },
  {
    _id: "mock-4",
    title: "THREAT SIMULATION COMPLETED",
    message: "Advanced malware container successfully isolated.",
    category: "ALERT",
    color: "text-orange-400",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    isRead: true
  }
];

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)
  const { socket } = useRealtime()
  const toasts = useToast()

  const iconMap = {
    SYSTEM: Terminal,
    XP: Zap,
    ROOM: Target,
    ALERT: ShieldAlert,
    CERTIFICATE: ShieldCheck,
    ACHIEVEMENT: Trophy
  }

  const categoryColorMap = {
    SYSTEM: "bg-blue-500/10 text-blue-400 border-blue-500/25",
    XP: "bg-yellow-500/10 text-yellow-400 border-yellow-500/25",
    ROOM: "bg-cyan-500/10 text-cyan-400 border-cyan-500/25",
    ALERT: "bg-orange-500/10 text-orange-400 border-orange-500/25",
    CERTIFICATE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
    ACHIEVEMENT: "bg-purple-500/10 text-purple-400 border-purple-500/25"
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      fetchNotifications()
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    fetchUnreadCount()
  }, [])

  /* ─── CENTRALIZED SYNCHRONIZED ARCHITECTURE ─── */
  useEffect(() => {
    const handleNewNotification = (event) => {
      const n = mapToTactical(event.detail)
      setNotifications(prev => [n, ...prev])
      setUnreadCount(prev => prev + 1)
      
      // Optionally trigger temporary tactical toast
      if (toasts) {
        if (n.category === 'ACHIEVEMENT') toasts.achievement(n.title, n.message)
        else if (n.category === 'CERTIFICATE') toasts.success(n.title, n.message)
        else toasts.info(n.title, n.message)
      }
    }

    const handleRoomCompleted = (e) => {
      const room = e.detail || {};
      const newNotif = {
        _id: `room-${Date.now()}`,
        title: "MISSION TARGET SECURED",
        message: `Successfully penetrated target '${room.title || "Unknown Host"}'. Secured +${room.xp || 250} XP.`,
        category: "ROOM",
        color: "text-cyan-400",
        createdAt: new Date().toISOString(),
        isRead: false
      };
      setNotifications(prev => [newNotif, ...prev])
      setUnreadCount(prev => prev + 1)
      if (toasts) toasts.success(newNotif.title, newNotif.message)
    };

    const handleLabCompleted = (e) => {
      const lab = e.detail || {};
      const newNotif = {
        _id: `lab-${Date.now()}`,
        title: "SANDBOX SIMULATION SOLVED",
        message: `Successfully resolved threat parameters in '${lab.title || "Sandbox Target"}'. Secured +${lab.xp || 500} XP.`,
        category: "ALERT",
        color: "text-orange-400",
        createdAt: new Date().toISOString(),
        isRead: false
      };
      setNotifications(prev => [newNotif, ...prev])
      setUnreadCount(prev => prev + 1)
      if (toasts) toasts.info(newNotif.title, newNotif.message)
    };

    const handleBadgeEarned = (e) => {
      const badge = e.detail || {};
      const newNotif = {
        _id: `badge-${Date.now()}`,
        title: "ELITE DESIGNATION UNLOCKED",
        message: `Credential Authority has granted '${badge.name || "Specialist Badge"}'.`,
        category: "ACHIEVEMENT",
        color: "text-purple-400",
        createdAt: new Date().toISOString(),
        isRead: false
      };
      setNotifications(prev => [newNotif, ...prev])
      setUnreadCount(prev => prev + 1)
      if (toasts) toasts.achievement(newNotif.title, newNotif.message)
    };

    window.addEventListener('notification:new', handleNewNotification)
    window.addEventListener('roomCompleted', handleRoomCompleted)
    window.addEventListener('labCompleted', handleLabCompleted)
    window.addEventListener('badge:earned', handleBadgeEarned)

    return () => {
      window.removeEventListener('notification:new', handleNewNotification)
      window.removeEventListener('roomCompleted', handleRoomCompleted)
      window.removeEventListener('labCompleted', handleLabCompleted)
      window.removeEventListener('badge:earned', handleBadgeEarned)
    }
  }, [toasts])

  const mapToTactical = (n) => {
    let title = n.title;
    let message = n.message;
    let category = n.category || "SYSTEM";
    let color = n.color || "text-cyan-400";

    const cleanTitle = title.toLowerCase();
    const cleanMessage = message.toLowerCase();

    if (cleanTitle.includes("welcome") || cleanMessage.includes("welcome")) {
      title = "OPERATOR SYNC INITIALIZED";
      message = "Secure terminal handshake completed successfully. Live intelligence active.";
      category = "SYSTEM";
      color = "text-cyan-400";
    } else if (cleanTitle.includes("xp") || cleanMessage.includes("xp") || cleanMessage.includes("points")) {
      title = `+${message.match(/\d+/)?.[0] || '100'} XP SECURED`;
      category = "XP";
      color = "text-yellow-400";
    } else if (cleanTitle.includes("room") || cleanMessage.includes("room")) {
      title = "SANDBOX DEPLOYED SUCCESSFUL";
      category = "ROOM";
      color = "text-cyan-400";
    } else if (cleanTitle.includes("cert") || cleanMessage.includes("cert") || cleanTitle.includes("credential")) {
      title = "CREDENTIAL VERIFICATION APPROVED";
      category = "CERTIFICATE";
      color = "text-emerald-400";
    } else if (cleanTitle.includes("achievement") || cleanMessage.includes("unlock")) {
      title = "ELITE ACHIEVEMENT COMPLETED";
      category = "ACHIEVEMENT";
      color = "text-purple-400";
    } else if (cleanTitle.includes("alert") || cleanMessage.includes("warning") || cleanTitle.includes("threat")) {
      title = "THREAT ALERT RESOLVED";
      category = "ALERT";
      color = "text-orange-400";
    }

    return { ...n, title, message, category, color };
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await apiCall('/notifications')
      const dbNotifications = response.notifications || [];
      
      if (dbNotifications.length === 0) {
        setNotifications(MOCK_INTEL);
        setUnreadCount(MOCK_INTEL.filter(n => !n.isRead).length);
      } else {
        setNotifications(dbNotifications.map(mapToTactical));
        setUnreadCount(response.unreadCount || 0);
      }
    } catch (error) {
      setNotifications(MOCK_INTEL);
      setUnreadCount(MOCK_INTEL.filter(n => !n.isRead).length);
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const response = await apiCall('/notifications?limit=1')
      const count = response.unreadCount || 0;
      setUnreadCount(count === 0 ? MOCK_INTEL.filter(n => !n.isRead).length : count);
    } catch (error) {
      setUnreadCount(MOCK_INTEL.filter(n => !n.isRead).length);
    }
  }

  const markAsRead = async (notificationId) => {
    if (notificationId.startsWith("mock-") || notificationId.startsWith("room-") || notificationId.startsWith("lab-") || notificationId.startsWith("badge-")) {
      setNotifications(prev => prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
      return;
    }
    try {
      await apiCall(`/notifications/${notificationId}/read`, { method: 'PUT' })
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    const hasMock = notifications.some(n => n._id.startsWith("mock-") || n._id.startsWith("room-") || n._id.startsWith("lab-") || n._id.startsWith("badge-"));
    if (hasMock) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
      return;
    }
    try {
      await apiCall('/notifications/read-all', { method: 'PUT' })
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const getTimeAgo = (date) => {
    const now = new Date()
    const notificationDate = new Date(date)
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <div className="sm:relative font-mono" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/5 rounded-xl border border-white/[0.04] bg-[#0a1220]/60 transition-all shadow-lg"
        title="Live Intel"
      >
        <Bell size={18} className={unreadCount > 0 ? "animate-pulse text-cyan-400" : ""} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-cyan-400 ring-4 ring-cyan-400/20 animate-ping" />
        )}
      </button>

      {isOpen && (
        <div className="absolute left-4 right-4 top-[74px] sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3.5 sm:w-96 bg-[#081224]/95 backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-cyan-500/15 overflow-hidden z-50">
          <div className="px-4.5 py-3.5 border-b border-white/[0.06] flex items-center justify-between bg-black/40">
            <div className="flex items-center gap-2">
              <Cpu size={14} className="text-cyan-400 animate-pulse" />
              <h3 className="text-xs font-black text-white uppercase tracking-wider">Operator Feed</h3>
              <span className="text-[8px] bg-cyan-950 border border-cyan-500/25 px-1.5 py-0.5 rounded text-cyan-400 font-bold uppercase tracking-widest animate-pulse">Live</span>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[9px] text-cyan-400 hover:text-white flex items-center gap-1 font-bold uppercase tracking-wider transition-colors"
              >
                <CheckCheck size={12} />
                Acknowledge All
              </button>
            )}
          </div>

          <div className="max-h-[380px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-cyan-400 border-t-transparent mx-auto"></div>
                <p className="text-[9px] text-slate-500 uppercase mt-2 font-bold tracking-wider">Synthesizing intel feed...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Bell size={24} className="mx-auto mb-2 opacity-30" />
                <p className="text-[10px] uppercase font-bold">Secure connection active</p>
                <p className="text-[9px] text-slate-600 mt-1">No pending operational warnings.</p>
              </div>
            ) : (
              notifications.map((n) => {
                const IconComponent = iconMap[n.category] || Terminal
                const categoryClass = categoryColorMap[n.category] || "bg-cyan-500/10 text-cyan-400 border-cyan-500/25"
                
                return (
                  <div
                    key={n._id}
                    className={`p-4 border-b border-white/[0.04] hover:bg-white/[0.02] cursor-pointer transition-all duration-200 ${
                      !n.isRead ? 'bg-cyan-950/20 border-l-2 border-l-cyan-400' : ''
                    }`}
                    onClick={() => !n.isRead && markAsRead(n._id)}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`p-2 rounded-xl border flex items-center justify-center ${categoryClass}`}>
                        <IconComponent size={14} />
                      </div>
                      <div className="flex-1 min-w-0 font-mono text-xs">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="font-extrabold text-white truncate leading-none uppercase tracking-wide">
                            {n.title}
                          </h4>
                          <span className="text-[8px] text-slate-500 font-black shrink-0 uppercase tracking-widest">
                            {getTimeAgo(n.createdAt)}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-bold">
                          {n.message}
                        </p>
                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/[0.02]">
                          <span className="text-[8px] text-slate-500 uppercase tracking-widest font-black">CATEGORY: {n.category}</span>
                          {!n.isRead && (
                            <span className="text-[8px] text-cyan-400 font-extrabold uppercase tracking-widest flex items-center gap-0.5"><span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse inline-block" /> Unread</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown