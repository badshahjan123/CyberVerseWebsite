import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Settings, Moon, Sun, Award, Bookmark, LogOut, ChevronDown, Crown } from 'lucide-react'
import { useTheme } from '../contexts/theme-context'
import { API_BASE_URL } from '../config/api'

const ProfileDropdown = ({ user, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)
    const { isDarkMode, toggleTheme } = useTheme()
    const navigate = useNavigate()

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    const handleLogout = () => {
        setIsOpen(false)
        onLogout()
    }

    const handleNavigation = (path) => {
        setIsOpen(false)
        navigate(path)
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Avatar Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-white/10 transition-all group"
            >
                <div className="relative">
                    <img
                        src={user?.avatar ? (user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}?t=${user?.avatarTimestamp || Date.now()}`) : `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name}`}
                        alt={user?.name}
                        className={`w-9 h-9 rounded-full group-hover:border-primary transition-all object-cover ${user?.isPremium ? 'border-2 border-yellow-400' : 'border-2 border-primary/50'
                            }`}
                        key={`${user?.avatar}-${user?.avatarTimestamp}`}
                    />
                    {user?.isPremium && (
                        <div className="absolute -top-0.5 -right-0.5 bg-yellow-400 rounded-full p-0.5">
                            <Crown size={8} className="text-slate-900" />
                        </div>
                    )}
                </div>
                <ChevronDown
                    size={16}
                    className={`text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                    {/* User Info Header */}
                    <div className={`px-4 py-3 border-b border-slate-200 dark:border-slate-700 ${user?.isPremium ? 'bg-gradient-to-r from-yellow-600/10 to-orange-600/10' : ''
                        }`}>
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                {user?.name}
                            </p>
                            {user?.isPremium && (
                                <span className="flex items-center gap-1 px-1.5 py-0.5 bg-yellow-400/20 border border-yellow-400/30 rounded-full">
                                    <Crown size={10} className="text-yellow-400" />
                                    <span className="text-[9px] font-bold text-yellow-400">PRO</span>
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {user?.email}
                        </p>
                    </div>

                    {/* Group 1: User */}
                    <div className="py-2">
                        <button
                            onClick={() => handleNavigation('/profile')}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            <User size={18} />
                            <span>View Profile</span>
                        </button>
                        <button
                            onClick={() => handleNavigation('/settings')}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            <Settings size={18} />
                            <span>Manage Account</span>
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-slate-200 dark:border-slate-700"></div>

                    {/* Group 2: Learning */}
                    <div className="py-2">
                        <button
                            onClick={() => handleNavigation('/badges')}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            <Award size={18} />
                            <span>My Badges</span>
                        </button>
                        <button
                            onClick={() => handleNavigation('/saved')}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            <Bookmark size={18} />
                            <span>Saved Items</span>
                        </button>
                    </div>

                    {/* Group 3: Theme Toggle */}
                    <div className="py-1">
                        <button
                            onClick={toggleTheme}
                            className="w-full flex items-center justify-between px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                                <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                            </div>
                            <div className={`w-8 h-4 rounded-full relative transition-colors ${isDarkMode ? 'bg-cyan-500' : 'bg-slate-500'}`}>
                                <div className={`absolute top-1 left-1 w-2 h-2 bg-white rounded-full transition-transform ${isDarkMode ? 'translate-x-4' : ''}`} />
                            </div>
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-slate-200 dark:border-slate-700"></div>

                    {/* Group 4: Logout */}
                    <div className="py-2">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
                        >
                            <LogOut size={18} />
                            <span>Log Out</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProfileDropdown
