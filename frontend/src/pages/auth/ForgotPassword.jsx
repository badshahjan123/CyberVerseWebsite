import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { apiCall } from "../../config/api"
import {
  Shield, KeyRound, Mail, ArrowLeft, Check,
  Loader2, Eye, EyeOff, Smartphone
} from "lucide-react"

/* Re-used password strength bar */
const StrengthBar = ({ password }) => {
  if (!password) return null
  const checks = [
    password.length >= 6,
    password.length >= 10,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  ]
  const score = checks.filter(Boolean).length
  const labels = ["", "Very Weak", "Weak", "Fair", "Strong", "Very Strong"]
  const colors = ["", "#EF4444", "#F97316", "#FACC15", "#22C55E", "#39FF14"]
  return (
    <div className="auth2-strength">
      <div className="auth2-strength-bars">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="auth2-strength-bar"
            style={{ background: i <= score ? colors[score] : "rgba(255,255,255,0.08)" }} />
        ))}
      </div>
      <span className="auth2-strength-label" style={{ color: colors[score] }}>{labels[score]}</span>
    </div>
  )
}

/* Step indicator dots */
const StepDots = ({ current }) => (
  <div className="fp-steps">
    {[1, 2].map(s => (
      <div key={s} className={`fp-step-dot ${s === current ? "fp-step-dot--active" : s < current ? "fp-step-dot--done" : ""}`}>
        {s < current ? <Check size={10} /> : s}
      </div>
    ))}
    <div className={`fp-step-line ${current === 2 ? "fp-step-line--done" : ""}`} />
  </div>
)

const ForgotPassword = () => {
  const navigate = useNavigate()

  const [email, setEmail]                   = useState("")
  const [twoFactorCode, setTwoFactorCode]   = useState("")
  const [newPassword, setNewPassword]       = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [step, setStep]                     = useState(1)
  const [loading, setLoading]               = useState(false)
  const [error, setError]                   = useState("")
  const [showPassword, setShowPassword]     = useState(false)
  const [showConfirm, setShowConfirm]       = useState(false)

  /* ── Step 1: check email + 2FA ── */
  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const response = await apiCall("/auth/check-2fa", {
        method: "POST",
        body: JSON.stringify({ email })
      })
      if (response.has2FA) {
        setStep(2)
      } else {
        setError("Password reset requires 2FA to be enabled. Please contact support.")
      }
    } catch (err) {
      setError(err.message || "User not found or 2FA not enabled")
    } finally {
      setLoading(false)
    }
  }

  /* ── Step 2: verify 2FA + set new password ── */
  const handlePasswordReset = async (e) => {
    e.preventDefault()
    setError("")
    if (newPassword !== confirmPassword) return setError("Passwords do not match")
    if (newPassword.length < 6)          return setError("Password must be at least 6 characters")
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(newPassword))
      return setError("Password must contain uppercase, lowercase, number, and special character")

    setLoading(true)
    try {
      await apiCall("/auth/reset-password-2fa", {
        method: "POST",
        body: JSON.stringify({ email, twoFactorCode, newPassword })
      })
      navigate("/login", {
        state: { message: "Password reset successfully! Please sign in with your new password." }
      })
    } catch (err) {
      setError(err.message || "Failed to reset password. Please check your 2FA code.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth2-bg">
      {/* Background layers */}
      <div className="auth2-glow auth2-glow--cyan" aria-hidden="true" />
      <div className="auth2-glow auth2-glow--purple" aria-hidden="true" />
      <div className="auth2-grid" aria-hidden="true" />

      <div className="auth2-card-wrap">
        {/* Logo */}
        <Link to="/" className="auth2-logo">
          <div className="auth2-logo-icon fp-logo-icon">
            <Shield size={18} style={{ color: "#FACC15" }} />
          </div>
          <span className="auth2-logo-text">CyberVerse</span>
        </Link>

        {/* Card */}
        <div className="auth2-card fp-card">

          {/* Header */}
          <div className="auth2-card-header">
            <div className="fp-icon-wrap">
              <KeyRound size={22} style={{ color: "#FACC15" }} />
            </div>
            <h1 className="auth2-card-title">Reset Password</h1>
            <p className="auth2-card-sub">
              {step === 1
                ? "Enter your email address to get started"
                : `Verify with your 2FA code for ${email}`}
            </p>
          </div>

          {/* Step indicator */}
          <StepDots current={step} />

          {/* ── STEP 1: Email ── */}
          {step === 1 && (
            <form onSubmit={handleEmailSubmit} className="auth2-form">
              <div className="auth2-field">
                <label className="auth2-label">Email Address</label>
                <div className="auth2-input-wrap">
                  <input
                    id="fp-email"
                    type="email"
                    placeholder="hacker@cyberverse.io"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="auth2-input"
                  />
                  <Mail size={15} className="fp-field-icon" />
                </div>
                <p className="fp-hint">
                  ⚠ You must have Google Authenticator 2FA enabled to reset your password.
                </p>
              </div>

              {error && <div className="auth2-error"><span>⚠</span>{error}</div>}

              <button type="submit" id="fp-continue" disabled={loading} className="auth2-submit fp-submit">
                {loading
                  ? <><Loader2 size={16} className="auth2-btn-spin" /> Checking...</>
                  : <>Continue <ArrowLeft size={16} style={{ transform: "rotate(180deg)" }} /></>}
              </button>
            </form>
          )}

          {/* ── STEP 2: 2FA + New Password ── */}
          {step === 2 && (
            <form onSubmit={handlePasswordReset} className="auth2-form">
              {/* 2FA Code */}
              <div className="auth2-field">
                <label className="auth2-label">
                  <Smartphone size={12} style={{ display: "inline", marginRight: 4 }} />
                  Authenticator Code
                </label>
                <input
                  id="fp-2fa"
                  type="text"
                  placeholder="0  0  0  0  0  0"
                  value={twoFactorCode}
                  onChange={e => setTwoFactorCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  className="auth2-input fp-otp-input"
                />
                <p className="fp-hint">Enter the 6-digit code from your authenticator app.</p>
              </div>

              {/* New Password */}
              <div className="auth2-field">
                <label className="auth2-label">New Password</label>
                <div className="auth2-input-wrap">
                  <input
                    id="fp-new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 6 chars, upper, lower, number, symbol"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="auth2-input"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="auth2-eye">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <StrengthBar password={newPassword} />
              </div>

              {/* Confirm Password */}
              <div className="auth2-field">
                <label className="auth2-label">Confirm New Password</label>
                <div className="auth2-input-wrap">
                  <input
                    id="fp-confirm-password"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className={`auth2-input ${confirmPassword && confirmPassword !== newPassword ? "auth2-input--err" : confirmPassword && confirmPassword === newPassword ? "auth2-input--ok" : ""}`}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="auth2-eye">
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {confirmPassword && confirmPassword === newPassword && (
                  <p className="auth2-match-ok"><Check size={11} /> Passwords match</p>
                )}
              </div>

              {error && <div className="auth2-error"><span>⚠</span>{error}</div>}

              <button type="submit" id="fp-reset" disabled={loading} className="auth2-submit fp-submit">
                {loading
                  ? <><Loader2 size={16} className="auth2-btn-spin" /> Resetting...</>
                  : <><Check size={16} /> Reset Password</>}
              </button>

              {/* Back to step 1 */}
              <button type="button" onClick={() => { setStep(1); setError("") }} className="fp-back-btn">
                <ArrowLeft size={13} /> Back to email
              </button>
            </form>
          )}

          {/* Back to Login */}
          <Link to="/login" className="fp-back-login">
            <ArrowLeft size={13} /> Back to Login
          </Link>
        </div>

        {/* Trust note */}
        <div className="auth2-badges">
          <span className="auth2-badge" style={{ color: "#475569" }}>
            🔒 Your data is encrypted and never shared
          </span>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
