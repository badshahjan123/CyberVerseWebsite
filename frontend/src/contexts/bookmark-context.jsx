import { createContext, useContext, useState, useEffect } from 'react'
import { useToast } from './toast-context'
import { useApp } from './app-context'

const BookmarkContext = createContext()

export const useBookmarks = () => {
  const context = useContext(BookmarkContext)
  if (!context) {
    throw new Error('useBookmarks must be used within BookmarkProvider')
  }
  return context
}

export const BookmarkProvider = ({ children }) => {
  const [bookmarkedItems, setBookmarkedItems] = useState([])
  const { addToast } = useToast()
  const { user } = useApp()

  // Load bookmarks from localStorage on mount or user change
  useEffect(() => {
    if (!user?.id) {
      setBookmarkedItems([])
      return
    }

    const userBookmarkKey = `cyberverse_bookmarks_${user.id}`
    const stored = localStorage.getItem(userBookmarkKey)
    if (stored) {
      try {
        setBookmarkedItems(JSON.parse(stored))
      } catch (error) {
        console.error('Failed to parse bookmarks:', error)
        setBookmarkedItems([])
      }
    } else {
      setBookmarkedItems([])
    }
  }, [user?.id])

  // Save to localStorage whenever bookmarks change
  useEffect(() => {
    if (user?.id) {
      const userBookmarkKey = `cyberverse_bookmarks_${user.id}`
      localStorage.setItem(userBookmarkKey, JSON.stringify(bookmarkedItems))
    }
  }, [bookmarkedItems, user?.id])

  const addBookmark = (item) => {
    const exists = bookmarkedItems.find(bookmark => bookmark.id === item.id && bookmark.type === item.type)
    if (exists) return

    setBookmarkedItems(prev => [...prev, {
      ...item,
      bookmarkedAt: new Date().toISOString()
    }])

    // Toast after state update to avoid React warning
    setTimeout(() => {
      addToast({
        type: 'success',
        title: '🔖 Saved!',
        message: `${item.title} added to your collection`,
        duration: 3000
      })
    }, 0)
  }

  const removeBookmark = (id, type) => {
    const item = bookmarkedItems.find(bookmark => bookmark.id === id && bookmark.type === type)

    setBookmarkedItems(prev =>
      prev.filter(bookmark => !(bookmark.id === id && bookmark.type === type))
    )

    // Toast after state update to avoid React warning
    if (item) {
      setTimeout(() => {
        addToast({
          type: 'info',
          title: '🗑️ Removed',
          message: `${item.title} removed from saved items`,
          duration: 2500
        })
      }, 0)
    }
  }

  const isBookmarked = (id, type) => {
    return bookmarkedItems.some(item => item.id === id && item.type === type)
  }

  const getBookmarksByType = (type) => {
    return bookmarkedItems.filter(item => item.type === type)
  }

  const value = {
    bookmarkedItems,
    addBookmark,
    removeBookmark,
    isBookmarked,
    getBookmarksByType
  }

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  )
}

export default BookmarkContext