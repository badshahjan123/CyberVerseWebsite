import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
    const isDarkMode = true

    useEffect(() => {
        const root = document.documentElement
        const body = document.body
        
        // Lock system classes permanently into dark mode
        root.classList.remove('light')
        root.classList.add('dark')
        root.setAttribute('data-theme', 'dark')
        body.setAttribute('data-theme', 'dark')
        localStorage.setItem('cyberverse-theme', 'dark')
        
        // Repaint
        void document.body.offsetHeight
    }, [])

    const toggleTheme = () => {
        console.log('Operational Status: Theme locked in permanent classified Dark-Ops mode.')
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
