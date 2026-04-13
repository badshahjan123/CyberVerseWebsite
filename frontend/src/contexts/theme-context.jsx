import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('cyberverse-theme')
        if (saved) {
            return saved === 'dark'
        }
        return true
    })

    useEffect(() => {
        const root = document.documentElement
        const body = document.body
        
        // Remove both classes first
        root.classList.remove('dark', 'light')
        
        if (isDarkMode) {
            // Dark mode
            root.classList.add('dark')
            root.setAttribute('data-theme', 'dark')
            body.setAttribute('data-theme', 'dark')
            localStorage.setItem('cyberverse-theme', 'dark')
        } else {
            // Light mode
            root.classList.add('light')
            root.setAttribute('data-theme', 'light')
            body.setAttribute('data-theme', 'light')
            localStorage.setItem('cyberverse-theme', 'light')
        }
        
        // Force repaint
        void document.body.offsetHeight
    }, [isDarkMode])

    const toggleTheme = () => {
        console.log('Toggling theme from:', isDarkMode ? 'dark' : 'light', 'to:', isDarkMode ? 'light' : 'dark')
        setIsDarkMode(prev => !prev)
    }

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider')
    }
    return context
}
