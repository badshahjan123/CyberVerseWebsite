import { createContext, useContext, useState, useEffect } from 'react'

const ActivityContext = createContext()

export const useActivity = () => {
    const context = useContext(ActivityContext)
    if (!context) {
        throw new Error('useActivity must be used within ActivityProvider')
    }
    return context
}

export const ActivityProvider = ({ children }) => {
    const [recentRooms, setRecentRooms] = useState([])

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('cyberverse_recent_rooms')
        if (stored) {
            try {
                setRecentRooms(JSON.parse(stored))
            } catch (error) {
                console.error('Failed to parse recent rooms:', error)
            }
        }
    }, [])

    // Save to localStorage whenever recentRooms changes
    useEffect(() => {
        if (recentRooms.length > 0) {
            localStorage.setItem('cyberverse_recent_rooms', JSON.stringify(recentRooms))
        }
    }, [recentRooms])

    /**
     * Update room progress and mark as recently accessed
     * @param {string} roomId - The room ID
     * @param {object} roomData - Room metadata (title, category, thumbnail, etc.)
     * @param {number} progressPercent - Progress percentage (0-100)
     */
    const updateRoomProgress = (roomId, roomData, progressPercent) => {
        setRecentRooms(prev => {
            // Remove existing entry for this room
            const filtered = prev.filter(room => room.roomId !== roomId)

            // Create new entry with updated data
            const newEntry = {
                roomId,
                title: roomData.title || 'Untitled Room',
                category: roomData.category || 'General',
                difficulty: roomData.difficulty || 'Medium',
                thumbnail: roomData.thumbnail || null,
                progressPercent: Math.min(100, Math.max(0, progressPercent)),
                lastAccessed: new Date().toISOString(),
                completedTasks: roomData.completedTasks || 0,
                totalTasks: roomData.totalTasks || 0
            }

            // Add to front (most recent first) and limit to 10 rooms
            return [newEntry, ...filtered].slice(0, 10)
        })
    }

    /**
     * Mark a room as accessed (updates lastAccessed timestamp)
     */
    const markRoomAccessed = (roomId, roomData) => {
        setRecentRooms(prev => {
            const existing = prev.find(room => room.roomId === roomId)

            if (existing) {
                // Update existing entry
                const filtered = prev.filter(room => room.roomId !== roomId)
                return [
                    { ...existing, lastAccessed: new Date().toISOString() },
                    ...filtered
                ]
            } else {
                // Create new entry with 0% progress
                return [
                    {
                        roomId,
                        title: roomData.title || 'Untitled Room',
                        category: roomData.category || 'General',
                        difficulty: roomData.difficulty || 'Medium',
                        thumbnail: roomData.thumbnail || null,
                        progressPercent: 0,
                        lastAccessed: new Date().toISOString(),
                        completedTasks: 0,
                        totalTasks: roomData.totalTasks || 0
                    },
                    ...prev
                ].slice(0, 10)
            }
        })
    }

    /**
     * Clear all recent rooms
     */
    const clearRecentRooms = () => {
        setRecentRooms([])
        localStorage.removeItem('cyberverse_recent_rooms')
    }

    /**
     * Remove a specific room from recent list
     */
    const removeRecentRoom = (roomId) => {
        setRecentRooms(prev => prev.filter(room => room.roomId !== roomId))
    }

    const value = {
        recentRooms,
        updateRoomProgress,
        markRoomAccessed,
        clearRecentRooms,
        removeRecentRoom
    }

    return (
        <ActivityContext.Provider value={value}>
            {children}
        </ActivityContext.Provider>
    )
}

export default ActivityContext
