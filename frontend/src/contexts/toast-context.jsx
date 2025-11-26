import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { X, CheckCircle, AlertCircle, Info, Trophy, Star, Zap, Crown } from 'lucide-react'

const ToastContext = createContext()

export const useToast = () => {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within ToastProvider')
    }
    return context
}

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([])

    const addToast = useCallback((toast) => {
        const id = Date.now() + Math.random()
        const newToast = {
            id,
            type: toast.type || 'info',
            title: toast.title,
            message: toast.message,
            duration: toast.duration || 4000,
            icon: toast.icon
        }

        setToasts(prev => [...prev, newToast])

        // Auto-remove after duration
        if (newToast.duration > 0) {
            setTimeout(() => {
                removeToast(id)
            }, newToast.duration)
        }

        return id
    }, [])

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    // Convenience methods
    const success = useCallback((title, message) => {
        return addToast({ type: 'success', title, message, icon: CheckCircle })
    }, [addToast])

    const error = useCallback((title, message) => {
        return addToast({ type: 'error', title, message, icon: AlertCircle, duration: 6000 })
    }, [addToast])

    const info = useCallback((title, message) => {
        return addToast({ type: 'info', title, message, icon: Info })
    }, [addToast])

    const achievement = useCallback((title, message) => {
        return addToast({ type: 'achievement', title, message, icon: Trophy, duration: 5000 })
    }, [addToast])

    const levelUp = useCallback((level) => {
        return addToast({
            type: 'levelup',
            title: 'Level Up!',
            message: `You've reached level ${level}!`,
            icon: Zap,
            duration: 5000
        })
    }, [addToast])

    const premium = useCallback((message) => {
        return addToast({
            type: 'premium',
            title: 'Premium Activated!',
            message: message || 'Welcome to CyberVerse Premium',
            icon: Crown,
            duration: 6000
        })
    }, [addToast])

    const value = useMemo(() => ({
        toasts,
        addToast,
        removeToast,
        success,
        error,
        info,
        achievement,
        levelUp,
        premium
    }), [toasts, addToast, removeToast, success, error, info, achievement, levelUp, premium])

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    )
}

const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm">
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
            ))}
        </div>
    )
}

const Toast = ({ toast, onClose }) => {
    const getTypeStyles = () => {
        switch (toast.type) {
            case 'success':
                return {
                    bg: 'bg-gradient-to-r from-green-500/20 to-green-600/10',
                    border: 'border-green-500/50',
                    iconColor: 'text-green-400',
                    glow: 'shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                }
            case 'error':
                return {
                    bg: 'bg-gradient-to-r from-red-500/20 to-red-600/10',
                    border: 'border-red-500/50',
                    iconColor: 'text-red-400',
                    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                }
            case 'achievement':
                return {
                    bg: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/10',
                    border: 'border-yellow-500/50',
                    iconColor: 'text-yellow-400',
                    glow: 'shadow-[0_0_20px_rgba(234,179,8,0.3)]'
                }
            case 'levelup':
                return {
                    bg: 'bg-gradient-to-r from-primary/20 to-accent/10',
                    border: 'border-primary/50',
                    iconColor: 'text-primary',
                    glow: 'shadow-[0_0_20px_rgba(155,255,0,0.3)]'
                }
            case 'premium':
                return {
                    bg: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/10',
                    border: 'border-yellow-500/50',
                    iconColor: 'text-yellow-400',
                    glow: 'shadow-[0_0_30px_rgba(234,179,8,0.4)]'
                }
            default:
                return {
                    bg: 'bg-gradient-to-r from-blue-500/20 to-blue-600/10',
                    border: 'border-blue-500/50',
                    iconColor: 'text-blue-400',
                    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                }
        }
    }

    const styles = getTypeStyles()
    const Icon = toast.icon || Info

    return (
        <div
            className={`
        ${styles.bg} ${styles.border} ${styles.glow}
        border backdrop-blur-lg rounded-lg p-4 
        animate-in slide-in-from-right-full duration-300
        hover:scale-105 transition-transform
      `}
        >
            <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 ${styles.iconColor} flex-shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-text mb-1">{toast.title}</h4>
                    {toast.message && (
                        <p className="text-sm text-muted">{toast.message}</p>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="text-muted hover:text-text transition-colors flex-shrink-0"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}
