import { useState, useEffect } from 'react'
import { useRealtime } from '../contexts/realtime-context'
import { useApp } from '../contexts/app-context'
import { RefreshCw } from 'lucide-react'

export const ConnectionStatus = () => {
    const { connected } = useRealtime()
    const { isAuthenticated } = useApp()
    const [showStatus, setShowStatus] = useState(false)

    useEffect(() => {
        // Only bother tracking connection state for authenticated users
        if (!isAuthenticated) {
            setShowStatus(false)
            return
        }

        let timeout
        if (!connected) {
            // Wait 3 seconds before showing — avoids flicker on initial load
            timeout = setTimeout(() => {
                setShowStatus(true)
            }, 3000)
        } else {
            setShowStatus(false)
        }

        return () => clearTimeout(timeout)
    }, [connected, isAuthenticated])

    // Only show for authenticated users when truly disconnected
    if (!isAuthenticated || connected || !showStatus) return null

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg backdrop-blur-sm">
                <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />
                <span className="text-sm font-medium text-yellow-400">
                    Reconnecting to server...
                </span>
            </div>
        </div>
    )
}


// Optional: Detailed version with connection info for debugging
export const ConnectionStatusDetailed = () => {
    const { connected, lastUpdate } = useRealtime()

    const getStatusConfig = () => {
        if (connected) {
            return {
                icon: Wifi,
                color: 'text-green-400',
                bgColor: 'bg-green-500/10',
                borderColor: 'border-green-500/30',
                text: 'Connected',
                showTime: true
            }
        }

        return {
            icon: WifiOff,
            color: 'text-yellow-400',
            bgColor: 'bg-yellow-500/10',
            borderColor: 'border-yellow-500/30',
            text: 'Reconnecting...',
            showTime: false,
            animate: true
        }
    }

    const config = getStatusConfig()
    const Icon = config.icon
    const timeSinceUpdate = lastUpdate ? Math.floor((Date.now() - lastUpdate) / 1000) : 0

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all cursor-pointer group">
            <Icon className={`w-4 h-4 ${config.color} ${config.animate ? 'animate-pulse' : ''}`} />
            <div className="flex flex-col">
                <span className={`text-xs font-medium ${config.color}`}>
                    {config.text}
                </span>
                {config.showTime && timeSinceUpdate > 0 && (
                    <span className="text-[10px] text-muted">
                        Updated {timeSinceUpdate}s ago
                    </span>
                )}
            </div>
        </div>
    )
}
