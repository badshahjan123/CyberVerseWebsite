import { useState, memo, useCallback } from "react";
import "./Auth.css";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useApp } from "../../contexts/app-context";
import { Shield, Loader2, Check, ArrowRight, Eye, EyeOff, Lock, Trophy, Zap } from "lucide-react";

/* Password strength meter */
const StrengthBar = ({ password }) => {
  if (!password) return null;
  const checks = [
    password.length >= 6,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ["", "Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
  const colors = ["", "#EF4444", "#F97316", "#FACC15", "#22C55E", "#39FF14"];
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
  );
};

const RegisterPage = memo(() => {
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useApp();

  const [username, setUsername]               = useState("");
  const [email, setEmail]                     = useState("");
  const [password, setPassword]               = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading]                 = useState(false);
  const [success, setSuccess]                 = useState(false);
  const [error, setError]                     = useState("");
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);

  const handleGoogleSuccess = useCallback(async (cred) => {
    setError("");
    const result = await loginWithGoogle(cred);
    if (!result.success) setError(result.message || "Google authentication failed");
  }, [loginWithGoogle]);

  const handleGoogleError = useCallback(() => {
    setError("Google authentication failed. Please try again.");
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (!username || username.trim().length < 2) { setError("Username must be at least 2 characters"); return setLoading(false); }
    if (!email || !email.includes("@"))          { setError("Please enter a valid email address");     return setLoading(false); }
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}$/;
    if (!strongRegex.test(password))             { setError("Password must be 6+ chars with upper, lower, number & symbol"); return setLoading(false); }
    if (password !== confirmPassword)            { setError("Passwords do not match");                return setLoading(false); }
    const result = await register(username, email, password);
    if (result.success) { setSuccess(true); setTimeout(() => navigate("/login"), 2000); }
    else setError(result.message || "Registration failed. Please try again.");
    setLoading(false);
  }, [username, email, password, confirmPassword, register, navigate]);

  return (
    <div className="auth2-bg">
      <div className="auth2-glow auth2-glow--purple" aria-hidden="true" />
      <div className="auth2-glow auth2-glow--cyan auth2-glow--bottom" aria-hidden="true" />
      <div className="auth2-grid" aria-hidden="true" />

      <div className="auth2-card-wrap">
        {/* Logo */}
        <Link to="/" className="auth2-logo">
          <div className="auth2-logo-icon auth2-logo-icon--purple"><Shield size={18} style={{ color: "#8B5CF6" }} /></div>
          <span className="auth2-logo-text">CyberVerse</span>
        </Link>

        {/* Card */}
        <div className={`auth2-card auth2-card--wide ${error ? "animate-shake" : ""}`}>
          <div className="auth2-card-header">
            <h1 className="auth2-card-title">Create Account</h1>
            <p className="auth2-card-sub">Join thousands of hackers worldwide — it's free</p>
          </div>

          <div className="auth2-google-wrap">
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError}
              theme="filled_black" size="large" text="signup_with" width="100%" />
          </div>

          <div className="auth2-divider">
            <span className="auth2-divider-line" />
            <span className="auth2-divider-text">or sign up with email</span>
            <span className="auth2-divider-line" />
          </div>

          <form onSubmit={handleSubmit} className="auth2-form auth2-form--grid">
            {/* Username */}
            <div className="auth2-field">
              <label className="auth2-label">Username</label>
              <input id="reg-username" type="text" placeholder="e.g. 0xShadow"
                value={username} onChange={e => setUsername(e.target.value)}
                required autoComplete="username" className="auth2-input auth2-input--purple focus:shadow-[0_0_15px_rgba(139,92,246,0.25)] focus:border-purple-400 focus:outline-none transition-all duration-200" />
            </div>

            {/* Email */}
            <div className="auth2-field">
              <label className="auth2-label">Gmail Address</label>
              <input id="reg-email" type="email" placeholder="hacker@gmail.com"
                value={email} onChange={e => setEmail(e.target.value)}
                required autoComplete="email" className="auth2-input auth2-input--purple focus:shadow-[0_0_15px_rgba(139,92,246,0.25)] focus:border-purple-400 focus:outline-none transition-all duration-200" />
            </div>

            {/* Password */}
            <div className="auth2-field">
              <label className="auth2-label">Password</label>
              <div className="auth2-input-wrap">
                <input id="reg-password" type={showPassword ? "text" : "password"}
                  placeholder="Min 6 chars, upper, lower, number, symbol"
                  value={password} onChange={e => setPassword(e.target.value)}
                  required autoComplete="new-password" className="auth2-input auth2-input--purple focus:shadow-[0_0_15px_rgba(139,92,246,0.25)] focus:border-purple-400 focus:outline-none transition-all duration-200" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="auth2-eye">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <StrengthBar password={password} />
            </div>

            {/* Confirm Password */}
            <div className="auth2-field">
              <label className="auth2-label">Confirm Password</label>
              <div className="auth2-input-wrap">
                <input id="reg-confirm" type={showConfirm ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  required autoComplete="new-password"
                  className={`auth2-input auth2-input--purple focus:shadow-[0_0_15px_rgba(139,92,246,0.25)] focus:border-purple-400 focus:outline-none transition-all duration-200 ${confirmPassword && confirmPassword !== password ? "auth2-input--err" : confirmPassword && confirmPassword === password ? "auth2-input--ok" : ""}`} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="auth2-eye">
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {confirmPassword && confirmPassword === password && (
                <p className="auth2-match-ok"><Check size={11} /> Passwords match</p>
              )}
            </div>

            {/* Error / Success */}
            {error   && <div className="auth2-error auth2-error--full"><span>⚠</span>{error}</div>}
            {success && <div className="auth2-success auth2-success--full"><Check size={13} /> Account created! Redirecting to login...</div>}

            <button type="submit" id="register-submit" disabled={loading || success}
              className="auth2-submit auth2-submit--purple auth2-submit--full relative overflow-hidden group">
              <span className="absolute inset-0 w-[200%] -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 pointer-events-none" />
              {success ? <><Check size={16} /> Account Created!</>
                : loading ? <><Loader2 size={16} className="auth2-btn-spin" /> Creating account...</>
                : <>Create Account <ArrowRight size={16} /></>}
            </button>

            <p className="auth2-terms auth2-terms--full">
              By signing up you agree to our{" "}
              <Link to="/terms" className="auth2-terms-link">Terms</Link> and{" "}
              <Link to="/privacy" className="auth2-terms-link">Privacy Policy</Link>.
            </p>
          </form>

          <p className="auth2-switch">
            Already have an account?{" "}
            <Link to="/login" className="auth2-switch-link">Sign in →</Link>
          </p>
        </div>

        {/* Trust badges */}
        <div className="auth2-badges">
          <span className="auth2-badge"><Trophy size={11} style={{ color: "#FACC15" }} /> Free forever</span>
          <span className="auth2-badge"><Zap size={11} style={{ color: "#8B5CF6" }} /> Instant access</span>
          <span className="auth2-badge"><Lock size={11} style={{ color: "#39FF14" }} /> End-to-end encrypted</span>
        </div>
      </div>
    </div>
  );
});

RegisterPage.displayName = "RegisterPage";
export default RegisterPage;
