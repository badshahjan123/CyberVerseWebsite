import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Settings, Moon, Sun, Award, Bookmark, LogOut, ChevronDown, Crown, Zap, Shield, Target, HelpCircle, ArrowLeft, Play } from 'lucide-react'
import { useTheme } from '../contexts/theme-context'
import { motion, AnimatePresence } from 'framer-motion'
import { getAvatarUrl } from '../config/api'

const ProfileDropdown = ({ user, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [showHelpSubmenu, setShowHelpSubmenu] = useState(false)
    const dropdownRef = useRef(null)
    const { isDarkMode, toggleTheme } = useTheme()
    const navigate = useNavigate()

    // Derived gamified stats
    const xp = user?.xp || user?.points || user?.totalXP || 0
    const level = user?.level || 1
    const nextLevelXP = level * 1000
    const currentLevelXP = xp % 1000
    const xpPercentage = Math.min(100, Math.round((currentLevelXP / nextLevelXP) * 100))
    const rankTitle = level < 5 ? 'Novice' : level < 15 ? 'Hacker' : level < 30 ? 'Elite' : 'Master'
    const rankColor = level < 5 ? 'text-green-400' : level < 15 ? 'text-blue-400' : level < 30 ? 'text-purple-400' : 'text-red-400'

    useEffect(() => {
        if (!isOpen) {
            setShowHelpSubmenu(false)
        }
    }, [isOpen])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        if (isOpen) document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen])

    const handleAction = (action) => {
        setIsOpen(false)
        if (typeof action === 'string') navigate(action)
        else action()
    }

    return (
        <div className="sm:relative shrink-0" ref={dropdownRef}>
            {/* Avatar Trigger */}
            <button
                id="tour-profile-avatar"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/5 transition-all group"
            >
                <div className="relative">
                    <img
                        src={getAvatarUrl(user?.avatar, user?.name, user?.avatarTimestamp)}
                        alt={user?.name}
                        className={`w-9 h-9 rounded-xl group-hover:scale-105 transition-transform object-cover ${user?.isPremium ? 'border border-yellow-400/50 shadow-[0_0_10px_rgba(250,204,21,0.2)]' : 'border border-cyan-500/30'}`}
                    />
                    {user?.isPremium && (
                        <div className="absolute -top-1.5 -right-1.5 bg-yellow-400 rounded-md p-0.5 shadow-[0_0_8px_rgba(234,179,8,0.5)]">
                            <Crown size={8} className="text-black" />
                        </div>
                    )}
                </div>
            </button>

            {/* Dropdown Menu - Gamified Player Card */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(5px)' }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="absolute left-4 right-4 top-[74px] sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-[320px] bg-[#0b1120]/95 backdrop-blur-xl rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)] border border-cyan-500/20 overflow-hidden z-50 origin-top-right"
                    >
                        
                        {/* Header: Player Identity */}
                        <div className={`relative p-5 border-b border-white/5 ${user?.isPremium ? 'bg-gradient-to-br from-yellow-500/10 to-orange-600/5' : 'bg-gradient-to-br from-cyan-500/10 to-blue-600/5'}`}>
                            {/* Decorative background grid */}
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50" />
                            
                            <div className="relative flex items-center gap-4">
                                <div className="relative">
                                    <img
                                        src={getAvatarUrl(user?.avatar, user?.name, user?.avatarTimestamp)}
                                        alt={user?.name}
                                        className="w-16 h-16 rounded-xl border-2 border-white/10 object-cover"
                                    />
                                    <div className="absolute -bottom-2 -right-2 bg-[#0b1120] px-1.5 py-0.5 rounded-md border border-cyan-500/30 flex items-center gap-1">
                                        <Shield size={8} className="text-cyan-400" />
                                        <span className="text-[9px] font-black font-mono text-cyan-400">Lv.{level}</span>
                                    </div>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-base font-black text-white truncate font-mono uppercase tracking-wide">
                                            {user?.name || 'Operator'}
                                        </h3>
                                        {user?.isPremium && (
                                            <span className="flex items-center gap-1 px-1.5 py-0.5 bg-yellow-400/10 border border-yellow-400/30 rounded text-[8px] font-black text-yellow-400 tracking-wider">
                                                <Crown size={8} /> PRO
                                            </span>
                                        )}
                                    </div>
                                    <div className={`text-[10px] font-bold uppercase tracking-widest ${rankColor} mb-2 flex items-center gap-1.5`}>
                                        <Target size={10} /> {rankTitle} Rank
                                    </div>
                                    
                                    {/* XP Progress Bar */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-[8px] font-mono font-bold text-slate-400">
                                            <span>{currentLevelXP} XP</span>
                                            <span>{nextLevelXP} XP</span>
                                        </div>
                                        <div className="h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/5">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${xpPercentage}%` }}
                                                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                                                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_10px_rgba(0,209,255,0.5)]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-2 space-y-1 bg-[#060913]/50">
                            {showHelpSubmenu ? (
                                <>
                                    {/* Help Submenu Items */}
                                    <button 
                                        onClick={() => setShowHelpSubmenu(false)} 
                                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white transition-all group border border-transparent hover:border-white/5 font-mono"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 rounded-lg bg-slate-500/10 text-slate-400 group-hover:-translate-x-0.5 transition-transform">
                                                <ArrowLeft size={14} />
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-wider">Back to Menu</span>
                                        </div>
                                    </button>

                                    <button 
                                        onClick={() => { 
                                            window.dispatchEvent(new CustomEvent("startProductTour")); 
                                            setIsOpen(false); 
                                        }} 
                                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-cyan-500/10 text-cyan-400 hover:text-cyan-300 transition-all group border border-transparent hover:border-cyan-500/20 font-mono"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                                                <Play size={14} />
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-wider">Take Product Tour</span>
                                        </div>
                                    </button>
                                </>
                            ) : (
                                <>
                                    {/* Gamified Menu Items */}
                                    <button onClick={() => handleAction('/profile')} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white transition-all group border border-transparent hover:border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                                                <User size={14} />
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-wider">Operator Profile</span>
                                        </div>
                                    </button>

                                    <button onClick={() => handleAction('/badges')} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white transition-all group border border-transparent hover:border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 group-hover:scale-110 transition-transform">
                                                <Award size={14} />
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-wider">Achievements</span>
                                        </div>
                                        <span className="text-[9px] font-black bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded border border-yellow-500/20">NEW</span>
                                    </button>

                                    <button onClick={() => handleAction('/saved')} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white transition-all group border border-transparent hover:border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                                                <Bookmark size={14} />
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-wider">Saved Intel</span>
                                        </div>
                                    </button>

                                    <button onClick={() => handleAction('/settings')} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white transition-all group border border-transparent hover:border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 rounded-lg bg-slate-500/10 text-slate-400 group-hover:scale-110 transition-transform">
                                                <Settings size={14} />
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-wider">System Config</span>
                                        </div>
                                    </button>

                                    {/* Help & Support Button */}
                                    <button onClick={() => setShowHelpSubmenu(true)} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white transition-all group border border-transparent hover:border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                                                <HelpCircle size={14} />
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-wider">Help</span>
                                        </div>
                                        <ChevronDown size={12} className="text-slate-500 group-hover:text-slate-400 transition-colors" />
                                    </button>

                                    <div className="h-px bg-white/5 my-2" />

                                    <button onClick={toggleTheme} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white transition-all group border border-transparent hover:border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 group-hover:scale-110 transition-transform">
                                                {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-wider">Theme Overlay</span>
                                        </div>
                                        <div className={`w-7 h-3.5 rounded-full relative transition-colors ${isDarkMode ? 'bg-cyan-500/30 border border-cyan-500/50' : 'bg-slate-500/30 border border-slate-500/50'}`}>
                                            <div className={`absolute top-[1px] left-[1px] w-2.5 h-2.5 bg-white rounded-full transition-transform ${isDarkMode ? 'translate-x-3.5 shadow-[0_0_5px_#00d1ff]' : ''}`} />
                                        </div>
                                    </button>

                                    <button onClick={() => handleAction(onLogout)} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all group border border-transparent hover:border-red-500/20 mt-1">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 group-hover:scale-110 transition-transform">
                                                <LogOut size={14} />
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-wider">Disconnect Session</span>
                                        </div>
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default ProfileDropdown
