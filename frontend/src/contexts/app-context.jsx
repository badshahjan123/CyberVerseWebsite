import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { apiCall } from "../config/api"
import sessionManager from "../utils/sessionManager"

const AppContext = createContext(undefined)

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()

  const updateUserProfile = useCallback((data) => {
    setUser(prev => ({
      ...prev,
      ...data
    }))
  }, [])

  // Handle session timeout
  const handleSessionTimeout = useCallback(() => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('token')
    localStorage.removeItem('lastActivity')
    sessionManager.cleanup()
    navigate('/login?timeout=true', { replace: true })
  }, [navigate])

  // Check authentication status on mount
  useEffect(() => {
    // Skip user authentication for admin routes
    const isAdminRoute = window.location.pathname.startsWith('/secure-admin') || 
                        window.location.pathname.startsWith('/admin')
    
    if (isAdminRoute) {
      setLoading(false)
      return
    }

    const token = localStorage.getItem('token')
    if (token) {
      // Check if session is expired
      if (sessionManager.isSessionExpired()) {
        handleSessionTimeout()
        return
      }

      apiCall('/auth/me')
        .then(response => {
          if (response?.user) {
            setUser(response.user)
            setIsAuthenticated(true)
            // Initialize session manager
            sessionManager.init(handleSessionTimeout)
          } else {
            localStorage.removeItem('token')
            setIsAuthenticated(false)
          }
        })
        .catch(() => {
          localStorage.removeItem('token')
          setIsAuthenticated(false)
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [handleSessionTimeout])

  const updateLastActivity = useCallback(() => {
    sessionManager.updateActivity()
  }, [])

  const verify2FA = useCallback(async (userId, code) => {
    try {
      console.log('🔐 Starting 2FA verification...', { userId, code })
      setLoading(true)

      if (!userId || !code || code.length !== 6) {
        console.error('Invalid verification data')
        return { success: false, message: 'Invalid verification code' }
      }

      const response = await apiCall('/auth/verify-2fa', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          code: code.trim()
        })
      })

      console.log('Server response:', response)

      if (!response) {
        throw new Error('No response from server')
      }

      // Handle string response (likely error)
      if (typeof response === 'string') {
        return {
          success: false,
          message: response
        }
      }

      // Handle user ID response (backend error)
      if (response === userId || response.data === userId) {
        console.error('Backend returned only userId:', userId)
        return {
          success: false,
          message: 'Invalid server response'
        }
      }

      // Check for successful verification
      if (response.token || (response.data && response.data.token)) {
        const token = response.token || response.data.token
        localStorage.setItem('token', token)

        try {
          const userData = await apiCall('/auth/me')
          if (userData?.user || (userData?.data && userData.data.user)) {
            const user = userData?.user || userData.data.user
            console.log('Setting authenticated user:', user)
            setUser(user)
            setIsAuthenticated(true)
            setLoading(false)
            sessionManager.init(handleSessionTimeout)

            // Navigate to dashboard
            navigate('/dashboard', { replace: true })

            return {
              success: true,
              message: 'Verification successful',
              user,
              token,
              isAuthenticated: true
            }
          }
        } catch (error) {
          console.error('Failed to fetch user data after 2FA:', error)
          throw new Error('Failed to load user data after verification')
        }
      }

      // Handle error messages
      if (response.message || response.error) {
        return {
          success: false,
          message: response.message || response.error
        }
      }

      return {
        success: false,
        message: 'Invalid verification code'
      }

    } catch (error) {
      console.error('2FA verification error:', error)
      return {
        success: false,
        message: error.message || 'Verification failed'
      }
    } finally {
      setLoading(false)
    }
  }, [updateLastActivity, navigate])

  const login = useCallback(async (email, password) => {
    try {
      setLoading(true)
      const response = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })

      console.log('Login response:', response)

      // If user has 2FA enabled and verification is required
      if (response.user?.twoFactorEnabled) {
        console.log('User has 2FA enabled, redirecting to verification')
        return {
          success: true,
          requiresTwoFactor: true,
          userId: response.userId || response.user.id,
          email: response.email
        }
      }

      // No 2FA enabled, proceed with normal login
      if (response.token) {
        console.log('Login successful, no 2FA required')
        localStorage.setItem('token', response.token)
        setUser(response.user)
        setIsAuthenticated(true)
        sessionManager.init(handleSessionTimeout)
        navigate('/dashboard', { replace: true })
      }

      return {
        success: true,
        requiresTwoFactor: false,
        user: response.user
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Login failed'
      }
    } finally {
      setLoading(false)
    }
  }, [updateLastActivity, navigate])

  const register = useCallback(async (username, email, password) => {
    try {
      setLoading(true)
      const response = await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: username, email, password })
      })

      return {
        success: true,
        message: response.message || 'Registration successful'
      }
    } catch (error) {
      // Handle validation errors specifically
      let errorMessage = error.message || 'Registration failed'

      // If it's a validation error, try to extract the first validation message
      if (error.message === 'Validation failed') {
        errorMessage = 'Please check your input: name (2+ chars), valid email, strong password (6+ chars with uppercase, lowercase, number, special char)'
      }

      return {
        success: false,
        message: errorMessage
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const loginWithGoogle = useCallback(async (credentialResponse) => {
    try {
      setLoading(true)
      const response = await apiCall('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ credential: credentialResponse.credential })
      })

      if (response.token) {
        localStorage.setItem('token', response.token)
        setUser(response.user)
        setIsAuthenticated(true)
        sessionManager.init(handleSessionTimeout)
        navigate('/dashboard', { replace: true })
        return { success: true, user: response.user }
      }

      return {
        success: false,
        message: response.message || 'Google authentication failed'
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Google authentication failed'
      }
    } finally {
      setLoading(false)
    }
  }, [updateLastActivity, navigate])

  const logout = useCallback(() => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('token')
    localStorage.removeItem('lastActivity')
    sessionManager.cleanup()
    navigate('/', { replace: true })
  }, [navigate])

  const contextValue = useMemo(() => ({
    user,
    loading,
    isAuthenticated,
    login,
    loginWithGoogle,
    register,
    logout,
    verify2FA,
    updateUserProfile
  }), [user, loading, isAuthenticated, login, loginWithGoogle, register, logout, verify2FA, updateUserProfile])

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}