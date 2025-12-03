import { useState, memo, useCallback, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { GoogleLogin } from '@react-oauth/google'
import { useApp } from "../contexts/app-context"
import { ModernButton } from "../components/ui/modern-button"
import { Shield, Loader2, Check, ArrowRight, Mail, Eye, EyeOff } from "lucide-react"

const RegisterPage = memo(() => {
  const navigate = useNavigate()
  const { register, loginWithGoogle } = useApp()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleGoogleSuccess = useCallback(async (credentialResponse) => {
    setError("")
    const result = await loginWithGoogle(credentialResponse)
    if (!result.success) {
      setError(result.message || "Google authentication failed")
    }
  }, [loginWithGoogle])

  const handleGoogleError = useCallback(() => {
    setError("Google authentication failed. Please try again.")
  }, [])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!username || username.trim().length < 2) {
      setError("Username must be at least 2 characters long")
      setLoading(false)
      return
    }

    // Validate username
    if (!username || username.trim().length < 2) {
      setError("Username must be at least 2 characters long")
      setLoading(false)
      return
    }

    // Validate email
    if (!email || !email.includes('@')) {
      setError("Please enter a valid email address")
      setLoading(false)
      return
    }

    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/

    if (!strongRegex.test(password)) {
      setError("Password must be at least 6 characters long and include uppercase, lowercase, number, and special character")
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    const result = await register(username, email, password)

    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        navigate("/login")
      }, 2000)
    } else {
      setError(result.message || "Registration failed. Please try again.")
    }
    setLoading(false)
  }, [username, email, password, confirmPassword, register, navigate])



  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
          <div className="text-center mb-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white mb-1">Join CyberVerse</h1>
            <p className="text-gray-300 text-sm">Only Gmail accounts allowed</p>
          </div>

          {/* Google Sign Up Button */}
          <div className="mb-4">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_blue"
              size="large"
              width="100%"
              text="signup_with"
            />
          </div>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-slate-800 px-2 text-gray-400">or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full h-11 px-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <input
                type="email"
                placeholder="Gmail address only"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-11 px-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-11 px-3 pr-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full h-11 px-3 pr-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                {error}
              </p>
            )}

            {success && (
              <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg p-2">
                <Check className="inline h-4 w-4 mr-1" />
                Account created Successfully navigating to login page..
              </p>
            )}

            <ModernButton
              variant="primary"
              size="sm"
              type="submit"
              disabled={loading || success}
              className="w-full h-11"
            >
              {success ? (
                <Check className="h-4 w-4" />
              ) : loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </ModernButton>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-gray-400">Already have an account? </span>
            <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
})

RegisterPage.displayName = 'RegisterPage'
export default RegisterPage