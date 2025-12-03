import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Settings, Moon, Sun, Award, Bookmark, LogOut, ChevronDown } from 'lucide-react'
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
                <img
                    src={user?.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${API_BASE_URL}${user.avatar}?t=${user?.avatarTimestamp || Date.now()}`) : `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name}`}
                    alt={user?.name}
                    className="w-9 h-9 rounded-full border-2 border-primary/50 group-hover:border-primary transition-all object-cover"
                    key={`${user?.avatar}-${user?.avatarTimestamp}`}
                />
                <ChevronDown
                    size={16}
                    className={`text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {user?.name}
                        </p>
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

                    {/* Divider */}
                    <div className="border-t border-slate-200 dark:border-slate-700"></div>

                    {/* Group 3: Logout */}
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
