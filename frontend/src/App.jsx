import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AppProvider } from './contexts/app-context'
import { RealtimeProvider } from './contexts/realtime-context'
import { ActivityProvider } from './contexts/activity-context'
import { ThemeProvider } from './contexts/theme-context'
import { ToastProvider } from './contexts/toast-context'
import { BookmarkProvider } from './contexts/bookmark-context'
import { AchievementProvider } from './contexts/achievement-context'
import Navbar from './components/navbar'
import Footer from './components/footer'
import { ConnectionStatus } from './components/ConnectionStatus'
import SessionTimeoutWarning from './components/SessionTimeoutWarning'
import { Suspense, lazy } from 'react'
import './App.css'

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Leaderboard = lazy(() => import('./pages/Leaderboard'))

// Auth pages
const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'))

// Admin pages
const SecureAdminLogin = lazy(() => import('./pages/admin/SecureAdminLogin'))
const SecureAdminDashboard = lazy(() => import('./pages/admin/SecureAdminDashboard'))
const AdminUserDetail = lazy(() => import('./pages/admin/AdminUserDetail'))
const RoomEditor = lazy(() => import('./pages/admin/RoomEditor'))
const SimpleUserManagement = lazy(() => import('./pages/admin/SimpleUserManagement'))

// Labs pages
const Labs = lazy(() => import('./pages/labs/Labs'))
const LabDetail = lazy(() => import('./pages/labs/LabDetail'))
const LinuxForensicsLab = lazy(() => import('./pages/labs/LinuxForensicsLab'))

// Rooms pages
const Rooms = lazy(() => import('./pages/rooms/Rooms'))
const RoomDetail = lazy(() => import('./pages/rooms/RoomDetail'))
const RoomCompleted = lazy(() => import('./pages/rooms/RoomCompleted'))
const RoomResume = lazy(() => import('./pages/rooms/RoomResume'))
const WebAppPentestingRoom = lazy(() => import('./pages/rooms/WebAppPentestingRoom'))
const RestApiRoom = lazy(() => import('./pages/rooms/RestApiRoom'))
const NetworkingFundamentalsRoom = lazy(() => import('./pages/rooms/NetworkingFundamentalsRoom'))

// User pages
const Profile = lazy(() => import('./pages/user/Profile'))
const Settings = lazy(() => import('./pages/user/Settings'))
const Badges = lazy(() => import('./pages/user/Badges'))
const Certificates = lazy(() => import('./pages/user/Certificates'))
const SavedItems = lazy(() => import('./pages/user/SavedItems'))

// Payment pages
const Premium = lazy(() => import('./pages/payments/Premium'))
const Checkout = lazy(() => import('./pages/payments/Checkout'))
const PaymentSuccess = lazy(() => import('./pages/payments/PaymentSuccess'))

// Minimal loading component - matches app background to prevent flash
const PageLoader = () => (
  <div className="min-h-screen bg-[rgb(8,12,16)]">
    {/* Intentionally minimal - page loads fast enough with lazy loading */}
  </div>
)

function AppContent() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/secure-admin') || location.pathname.startsWith('/admin')

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0B0F1A" }}>
      {!isAdminRoute && <Navbar />}

      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          {isAdminRoute ? (
            <Routes>
              <Route path="/secure-admin-login" element={<SecureAdminLogin />} />
              <Route path="/secure-admin-dashboard" element={<SecureAdminDashboard />} />
              <Route path="/admin/users/:id" element={<AdminUserDetail />} />
              <Route path="/admin/rooms/:id/edit" element={<RoomEditor />} />
              <Route path="/admin/user-management" element={<SimpleUserManagement />} />
            </Routes>
          ) : (
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/labs" element={<Labs />} />
              <Route path="/labs/linux-forensics" element={<LinuxForensicsLab />} />
              <Route path="/labs/:id" element={<LabDetail />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/premium" element={<Premium />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/certificates" element={<Certificates />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              <Route path="/rooms" element={<Rooms />} />
              <Route path="/rooms/:id/completed" element={<RoomCompleted />} />
              <Route path="/rooms/web-app-pentesting" element={<WebAppPentestingRoom />} />
              <Route path="/rooms/rest-api-mastery" element={<RestApiRoom />} />
              <Route path="/rooms/networking-fundamentals" element={<NetworkingFundamentalsRoom />} />
              <Route path="/rooms/:slug" element={<RoomDetail />} />
              <Route path="/rooms/:slug/resume" element={<RoomResume />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/badges" element={<Badges />} />
              <Route path="/saved" element={<SavedItems />} />
            </Routes>
          )}
        </Suspense>
      </main>

      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <ConnectionStatus />}
      {!isAdminRoute && <SessionTimeoutWarning />}
    </div>
  )
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ThemeProvider>
        <AppProvider>
          <ToastProvider>
            <BookmarkProvider>
              <RealtimeProvider>
                <ActivityProvider>
                  <AchievementProvider>
                    <AppContent />
                  </AchievementProvider>
                </ActivityProvider>
              </RealtimeProvider>
            </BookmarkProvider>
          </ToastProvider>
        </AppProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App