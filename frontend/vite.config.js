import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => ({
  // Environment-specific optimizations
  define: {
    __DEV__: mode === 'development',
  },
  plugins: [
    react({
      // Optimize React refresh
      fastRefresh: true
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    // Optimize build for performance
    minify: 'esbuild',
    target: 'esnext',
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React chunks
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          // UI library chunks
          'ui-icons': ['lucide-react'],
          'ui-components': ['@radix-ui/react-slot'],
          // Page chunks - split by functionality
          'pages-auth': ['./src/pages/auth/Login.jsx', './src/pages/auth/Register.jsx'],
          'pages-main': ['./src/pages/Dashboard.jsx', './src/pages/user/Profile.jsx'],
          'pages-labs': ['./src/pages/labs/Labs.jsx', './src/pages/labs/LabDetail.jsx'],
          'pages-rooms': ['./src/pages/rooms/Rooms.jsx', './src/pages/rooms/RoomDetail.jsx'],
          'pages-other': ['./src/pages/Leaderboard.jsx', './src/pages/payments/Premium.jsx', './src/pages/user/Settings.jsx'],
        },
        // Optimize chunk file names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Performance optimizations
    chunkSizeWarningLimit: 500,
    assetsInlineLimit: 2048,
    // Enable tree shaking
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
      tryCatchDeoptimization: false
    },
  },
  server: {
    // Optimize dev server
    hmr: {
      overlay: false,
      port: 3001,
    },
    host: true,
    // Enable HTTP/2
    https: false,
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      'lucide-react'
    ],
    // Force pre-bundling
    force: false,
  },
  // Performance hints
  esbuild: {
    // Remove debugger statements
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
  // CSS optimization
  css: {
    devSourcemap: false,
    preprocessorOptions: {
      // Optimize CSS processing
    }
  }
}))