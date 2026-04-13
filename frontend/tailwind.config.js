/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // CyberVerse Global Design System
        cyberverse: {
          // Dark Mode Palette
          dark: {
            bg: '#0B0F1A',
            surface: '#111827',
            border: '#1F2937',
            text: {
              primary: '#FFFFFF',
              secondary: '#94A3B8',
              tertiary: '#64748B',
            },
          },
          // Light Mode Palette
          light: {
            bg: '#F8FAFC',
            surface: '#F1F5F9',
            border: '#CBD5E1',
            text: {
              primary: '#1E293B',
              secondary: '#64748B',
              tertiary: '#94A3B8',
            },
          },
          // Global Accent
          accent: {
            primary: '#38BDF8',
            hover: '#0EA5E9',
            light: '#7DD3FC',
          },
          // Semantic Colors
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#3B82F6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      borderRadius: {
        'cyberverse': '12px',
      },
      boxShadow: {
        'cyberverse-light': '0 1px 3px rgba(0, 0, 0, 0.05)',
        'cyberverse-dark': '0 4px 12px rgba(0, 0, 0, 0.3)',
        'cyberverse-glow': '0 0 20px rgba(56, 189, 248, 0.3)',
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(56, 189, 248, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(56, 189, 248, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}
