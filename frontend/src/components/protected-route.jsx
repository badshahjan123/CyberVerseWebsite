import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useApp } from "../contexts/app-context"
import sessionManager from "../utils/sessionManager"

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useApp()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login", { replace: true })
    } else if (isAuthenticated) {
      // Check for session expiration on route access
      if (sessionManager.isSessionExpired()) {
        navigate("/login?timeout=true", { replace: true })
      }
    }
  }, [isAuthenticated, loading, navigate])

  // Only show loading screen if we're checking auth AND user is not yet authenticated
  // This prevents flickering when navigating between pages for already-authenticated users
  if (loading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(8,12,16)]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <div className="text-muted text-sm">Verifying authentication...</div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return children
}