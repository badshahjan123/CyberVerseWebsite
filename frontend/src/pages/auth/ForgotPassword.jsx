import { useState } from "react"
import "./Auth.css"
import { Link, useNavigate } from "react-router-dom"
import { apiCall } from "../../config/api"
import {
  Shield, KeyRound, Mail, ArrowLeft, Check,
  Loader2, Eye, EyeOff, Smartphone, RefreshCw
} from "lucide-react"

/* ── Password strength bar ── */
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

/* ── Step indicator ── */
const Steps = ({ current }) => {
  const steps = ["Email", "Verify", "Reset"]
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: "2rem" }}>
      {steps.map((label, i) => {
        const num = i + 1
        const done = num < current
        const active = num === current
        return (
          <div key={num} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 12, fontWeight: 800, transition: "all 0.3s",
                background: done ? "#39FF14" : active ? "linear-gradient(135deg,#00F5FF,#8B5CF6)" : "rgba(255,255,255,0.06)",
                border: `1px solid ${done ? "#39FF14" : active ? "#00F5FF" : "rgba(255,255,255,0.1)"}`,
                color: done ? "#0B0F1A" : active ? "#0B0F1A" : "#475569",
                boxShadow: active ? "0 0 16px rgba(0,245,255,0.4)" : "none"
              }}>
                {done ? <Check size={14} /> : num}
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                color: active ? "#00F5FF" : done ? "#39FF14" : "#475569" }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                width: 60, height: 1, margin: "0 4px", marginBottom: 20,
                background: num < current ? "#39FF14" : "rgba(255,255,255,0.08)",
                transition: "background 0.3s"
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ── OTP digit input ── */
const OTPInput = ({ value, onChange }) => {
  const digits = value.padEnd(6, "").split("")
  const handleKey = (e, idx) => {
    const val = e.target.value.replace(/\D/g, "")
    if (!val) {
      const next = value.split("")
      next[idx] = ""
      onChange(next.join("").slice(0, 6))
      if (idx > 0) document.getElementById(`otp-${idx - 1}`)?.focus()
      return
    }
    const next = value.split("")
    next[idx] = val[val.length - 1]
    const joined = next.join("").slice(0, 6)
    onChange(joined)
    if (idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus()
  }
  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    onChange(pasted)
    document.getElementById(`otp-${Math.min(pasted.length, 5)}`)?.focus()
    e.preventDefault()
  }
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
      {[0,1,2,3,4,5].map(i => (
        <input
          key={i}
          id={`otp-${i}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ""}
          onChange={e => handleKey(e, i)}
          onPaste={handlePaste}
          style={{
            width: 46, height: 54, textAlign: "center", fontSize: 22, fontWeight: 800,
            fontFamily: "monospace", borderRadius: 10, outline: "none",
            background: digits[i] ? "rgba(0,245,255,0.08)" : "rgba(0,0,0,0.25)",
            border: `1.5px solid ${digits[i] ? "#00F5FF" : "rgba(255,255,255,0.1)"}`,
            color: "#00F5FF",
            boxShadow: digits[i] ? "0 0 12px rgba(0,245,255,0.2)" : "none",
            transition: "all 0.2s",
            caretColor: "#00F5FF"
          }}
        />
      ))}
    </div>
  )
}

const ForgotPassword = () => {
  const navigate = useNavigate()

  const [email, setEmail]               = useState("")
  const [step, setStep]                 = useState(1)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState("")

  const [hasTOTP, setHasTOTP]           = useState(false)
  const [verifyMethod, setVerifyMethod] = useState("email")

  const [otp, setOtp]                   = useState("")
  const [resetToken, setResetToken]     = useState("")
  const [newPassword, setNewPassword]   = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPwd, setShowPwd]           = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const startCooldown = () => {
    setResendCooldown(60)
    const t = setInterval(() => {
      setResendCooldown(p => { if (p <= 1) { clearInterval(t); return 0 } return p - 1 })
    }, 1000)
  }

  /* Step 1 */
  const handleEmailSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError("")
    try {
      const res = await apiCall("/auth/forgot-password", {
        method: "POST", body: JSON.stringify({ email })
      })
      setHasTOTP(res.hasTOTP || false)
      setVerifyMethod("email")
      startCooldown()
      setStep(2)
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.")
    } finally { setLoading(false) }
  }

  /* Resend OTP */
  const handleResend = async () => {
    if (resendCooldown > 0) return
    setLoading(true); setError("")
    try {
      await apiCall("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) })
      setOtp("")
      startCooldown()
    } catch (err) {
      setError(err.message || "Failed to resend code.")
    } finally { setLoading(false) }
  }

  /* Step 2 */
  const handleVerify = async (e) => {
    e.preventDefault(); setLoading(true); setError("")
    try {
      let res
      if (verifyMethod === "email") {
        res = await apiCall("/auth/verify-reset-otp", {
          method: "POST", body: JSON.stringify({ email, otp })
        })
      } else {
        res = await apiCall("/auth/verify-totp-reset", {
          method: "POST", body: JSON.stringify({ email, totpCode: otp })
        })
      }
      setResetToken(res.resetToken)
      setStep(3)
    } catch (err) {
      setError(err.message || "Invalid code. Please try again.")
    } finally { setLoading(false) }
  }

  /* Step 3 */
  const handleReset = async (e) => {
    e.preventDefault(); setError("")
    if (newPassword !== confirmPassword) return setError("Passwords do not match")
    if (newPassword.length < 6) return setError("Password must be at least 6 characters")
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(newPassword))
      return setError("Must contain uppercase, lowercase, number and special character")
    setLoading(true)
    try {
      await apiCall("/auth/reset-password", {
        method: "POST", body: JSON.stringify({ resetToken, newPassword })
      })
      navigate("/login", { state: { message: "Password reset successfully! Please sign in." } })
    } catch (err) {
      setError(err.message || "Failed to reset password. Please start over.")
    } finally { setLoading(false) }
  }

  return (
    <div className="auth2-bg">
      <div className="auth2-glow auth2-glow--cyan" />
      <div className="auth2-glow auth2-glow--purple" />
      <div className="auth2-grid" />

      <div className="auth2-card-wrap">
        {/* Logo */}
        <Link to="/" className="auth2-logo">
          <div className="auth2-logo-icon" style={{
            background: "rgba(250,204,21,0.1)", borderColor: "rgba(250,204,21,0.3)",
            boxShadow: "0 0 20px rgba(250,204,21,0.15)"
          }}>
            <Shield size={20} style={{ color: "#FACC15" }} />
          </div>
          <span className="auth2-logo-text">CyberVerse</span>
        </Link>

        <div className={`auth2-card ${error ? "animate-shake" : ""}`}>
          {/* Decorative top border */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 2,
            background: "linear-gradient(90deg, transparent, #00F5FF, #8B5CF6, transparent)"
          }} />

          {/* Header */}
          <div className="auth2-card-header">
            <div style={{
              width: 56, height: 56, borderRadius: 16, margin: "0 auto 1.25rem",
              background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 24px rgba(139,92,246,0.2)"
            }}>
              <KeyRound size={24} style={{ color: "#8B5CF6" }} />
            </div>
            <h1 className="auth2-card-title" style={{ fontSize: "1.5rem" }}>
              {step === 1 && "Forgot Password"}
              {step === 2 && "Verify Identity"}
              {step === 3 && "New Password"}
            </h1>
            <p className="auth2-card-sub" style={{ fontSize: "0.85rem" }}>
              {step === 1 && "Enter your email and we'll send a reset code"}
              {step === 2 && <>Verification code sent to <strong style={{ color: "#00F5FF" }}>{email}</strong></>}
              {step === 3 && "Choose a strong password for your account"}
            </p>
          </div>

          <Steps current={step} />

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <form onSubmit={handleEmailSubmit} className="auth2-form">
              <div className="auth2-field">
                <label className="auth2-label">Email Address</label>
                <div className="auth2-input-wrap">
                  <input
                    type="email" placeholder="agent@cyberverse.io"
                    value={email} onChange={e => setEmail(e.target.value)}
                    required autoComplete="email"
                    className="auth2-input focus:shadow-[0_0_15px_rgba(6,182,212,0.25)] focus:border-cyan-400 focus:outline-none transition-all duration-200" style={{ paddingLeft: "2.75rem" }}
                  />
                  <Mail size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#4A5568" }} />
                </div>
              </div>

              {/* Info box */}
              <div style={{
                background: "rgba(0,245,255,0.04)", border: "1px solid rgba(0,245,255,0.12)",
                borderRadius: 10, padding: "12px 14px", display: "flex", gap: 10, alignItems: "flex-start"
              }}>
                <span style={{ fontSize: 16 }}>📧</span>
                <p style={{ margin: 0, fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>
                  A 6-digit verification code will be sent to your email. Valid for <strong style={{ color: "#f59e0b" }}>10 minutes</strong>.
                </p>
              </div>

              {error && <div className="auth2-error"><span>⚠</span>{error}</div>}

              <button type="submit" disabled={loading} className="auth2-submit relative overflow-hidden group">
                <span className="absolute inset-0 w-[200%] -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 pointer-events-none" />
                {loading
                  ? <><Loader2 size={16} className="auth2-btn-spin" /> Sending Code...</>
                  : <><Mail size={16} /> Send Reset Code</>}
              </button>
            </form>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <form onSubmit={handleVerify} className="auth2-form">

              {/* Method toggle — only if TOTP enabled */}
              {hasTOTP && (
                <div className="auth2-field">
                  <label className="auth2-label">Verification Method</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {[
                      { id: "email", icon: <Mail size={14} />, label: "Email Code", color: "#00F5FF" },
                      { id: "totp",  icon: <Smartphone size={14} />, label: "Authenticator", color: "#a855f7" }
                    ].map(m => (
                      <button key={m.id} type="button" onClick={() => { setVerifyMethod(m.id); setOtp("") }}
                        style={{
                          padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                          border: `1.5px solid ${verifyMethod === m.id ? m.color : "rgba(255,255,255,0.08)"}`,
                          background: verifyMethod === m.id ? `${m.color}12` : "rgba(255,255,255,0.02)",
                          color: verifyMethod === m.id ? m.color : "#475569",
                          fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center",
                          justifyContent: "center", gap: 6, transition: "all 0.2s",
                          boxShadow: verifyMethod === m.id ? `0 0 12px ${m.color}25` : "none"
                        }}>
                        {m.icon} {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="auth2-field">
                <label className="auth2-label" style={{ textAlign: "center", marginBottom: 12 }}>
                  {verifyMethod === "email" ? "Email Verification Code" : "Authenticator App Code"}
                </label>
                <OTPInput value={otp} onChange={setOtp} />
                <p style={{ textAlign: "center", fontSize: 11, color: "#475569", marginTop: 8 }}>
                  {verifyMethod === "email"
                    ? "Enter the 6-digit code from your email"
                    : "Enter the 6-digit code from your authenticator app"}
                </p>
              </div>

              {/* Resend — only for email method */}
              {verifyMethod === "email" && (
                <div style={{ textAlign: "center" }}>
                  <button type="button" onClick={handleResend}
                    disabled={resendCooldown > 0 || loading}
                    style={{
                      background: "none", border: "none", cursor: resendCooldown > 0 ? "not-allowed" : "pointer",
                      color: resendCooldown > 0 ? "#475569" : "#00F5FF",
                      fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6
                    }}>
                    <RefreshCw size={12} />
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                  </button>
                </div>
              )}

              {error && <div className="auth2-error"><span>⚠</span>{error}</div>}

              <button type="submit" disabled={loading || otp.length !== 6} className="auth2-submit relative overflow-hidden group">
                <span className="absolute inset-0 w-[200%] -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 pointer-events-none" />
                {loading
                  ? <><Loader2 size={16} className="auth2-btn-spin" /> Verifying...</>
                  : <><Check size={16} /> Verify Code</>}
              </button>

              <button type="button" onClick={() => { setStep(1); setError(""); setOtp("") }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b",
                  fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center",
                  gap: 6, justifyContent: "center", marginTop: 4 }}>
                <ArrowLeft size={13} /> Back to email
              </button>
            </form>
          )}

          {/* ── STEP 3 ── */}
          {step === 3 && (
            <form onSubmit={handleReset} className="auth2-form">
              <div className="auth2-field">
                <label className="auth2-label">New Password</label>
                <div className="auth2-input-wrap">
                  <input
                    type={showPwd ? "text" : "password"}
                    placeholder="Min 6 chars · upper · lower · number · symbol"
                    value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    required autoComplete="new-password" className="auth2-input focus:shadow-[0_0_15px_rgba(6,182,212,0.25)] focus:border-cyan-400 focus:outline-none transition-all duration-200"
                    style={{ paddingRight: "2.75rem" }}
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="auth2-eye">
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <StrengthBar password={newPassword} />
              </div>

              <div className="auth2-field">
                <label className="auth2-label">Confirm Password</label>
                <div className="auth2-input-wrap">
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat new password"
                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    required autoComplete="new-password"
                    className={`auth2-input focus:shadow-[0_0_15px_rgba(6,182,212,0.25)] focus:border-cyan-400 focus:outline-none transition-all duration-200 ${confirmPassword && confirmPassword !== newPassword ? "auth2-input--err" : confirmPassword && confirmPassword === newPassword ? "auth2-input--ok" : ""}`}
                    style={{ paddingRight: "2.75rem" }}
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

              <button type="submit" disabled={loading} className="auth2-submit relative overflow-hidden group">
                <span className="absolute inset-0 w-[200%] -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 pointer-events-none" />
                {loading
                  ? <><Loader2 size={16} className="auth2-btn-spin" /> Resetting...</>
                  : <><KeyRound size={16} /> Reset Password</>}
              </button>
            </form>
          )}

          <Link to="/login" style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            marginTop: "1.5rem", color: "#475569", textDecoration: "none",
            fontSize: 13, fontWeight: 600, transition: "color 0.2s"
          }}
            onMouseEnter={e => e.currentTarget.style.color = "#00F5FF"}
            onMouseLeave={e => e.currentTarget.style.color = "#475569"}>
            <ArrowLeft size={13} /> Back to Login
          </Link>
        </div>

        <div className="auth2-badges">
          <span className="auth2-badge">🔒 256-bit encrypted · Secure reset flow</span>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
