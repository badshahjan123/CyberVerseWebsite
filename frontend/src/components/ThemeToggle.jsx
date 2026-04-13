import React from 'react';
import { useTheme } from '../contexts/theme-context';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  const handleClick = () => {
    console.log('Theme toggle clicked! Current mode:', isDarkMode ? 'dark' : 'light');
    toggleTheme();
    console.log('Theme toggled to:', !isDarkMode ? 'dark' : 'light');
  };

  return (
    <button
      onClick={handleClick}
      className="relative w-9 h-9 rounded-lg overflow-hidden
                 bg-white/10 dark:bg-slate-900/30
                 backdrop-blur-xl border border-slate-200/20 dark:border-cyan-500/20
                 shadow-sm hover:shadow-md
                 hover:scale-105 active:scale-95
                 transition-all duration-300 ease-out
                 flex items-center justify-center cursor-pointer"
      aria-label="Toggle theme"
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      type="button"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br 
                      from-slate-100 via-blue-50 to-slate-200
                      dark:from-slate-900 dark:via-cyan-950 dark:to-slate-900
                      opacity-80 dark:opacity-60 pointer-events-none" />
      
      {/* Glow effect */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100
                      bg-gradient-to-br from-blue-400/20 to-cyan-400/20
                      dark:from-cyan-400/20 dark:to-purple-500/20
                      blur-xl transition-opacity duration-300 pointer-events-none" />

      {/* Icon container */}
      <div className="relative z-10 pointer-events-none">
        {isDarkMode ? (
          <Moon className="w-4 h-4 text-cyan-400 transition-all duration-500" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500 transition-all duration-500" />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;
