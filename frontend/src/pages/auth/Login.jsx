import { useState, useCallback } from "react";
import "./Auth.css";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Shield, Eye, EyeOff, ArrowRight, Check, Loader2, Lock, Flame, Trophy, Zap
} from "lucide-react";
import { useApp } from "../../contexts/app-context";
import TwoFactorAuth from "../../components/two-factor/TwoFactorAuth";
import { GoogleLogin } from "@react-oauth/google";

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, loginWithGoogle, verify2FA, isAuthenticated, user, loading: authLoading } = useApp();

  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [loading, setLoading]           = useState(false);
  const [success, setSuccess]           = useState(false);
  const [error, setError]               = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState(null);

  const isTimeout = searchParams.get("timeout") === "true";

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
    const deviceInfo = { userAgent: navigator.userAgent, ipAddress: "client-ip", deviceName: navigator.platform, location: "Unknown" };
    const result = await login(email, password, deviceInfo);
    if (result.success) {
      if (result.requiresTwoFactor) {
        setTwoFactorData({ email: result.email, userId: result.userId });
        setShowTwoFactor(true);
      } else {
        setSuccess(true);
        navigate("/dashboard", { replace: true });
      }
    } else {
      setError(result.message || "Invalid credentials. Please try again.");
    }
    setLoading(false);
  }, [email, password, login, navigate]);

  const handle2FAVerify = useCallback(async (userId, code) => {
    try {
      const response = await verify2FA(userId, code);
      if (response.success) { setSuccess(true); setShowTwoFactor(false); window.location.href = "/dashboard"; }
      return response;
    } catch (err) { return { success: false, message: err.message || "Verification failed" }; }
  }, [verify2FA]);

  const handle2FACancel = useCallback(() => { setShowTwoFactor(false); setTwoFactorData(null); }, []);

  if (authLoading) return (
    <div className="auth2-bg"><div className="auth2-loader"><Loader2 className="auth2-spin-icon" /><p>Initializing secure session...</p></div></div>
  );
  if (showTwoFactor && twoFactorData) return (
    <TwoFactorAuth email={twoFactorData.email} userId={twoFactorData.userId} onVerify={handle2FAVerify} onCancel={handle2FACancel} />
  );
  if (isAuthenticated && user) return (
    <div className="auth2-bg"><div className="auth2-loader">
      <Check className="auth2-check-icon" />
      <h2 style={{ fontFamily: "'Orbitron',sans-serif", color: "#F0F6FC" }}>Already Signed In</h2>
      <p style={{ color: "#64748B" }}>Logged in as <strong style={{ color: "#00F5FF" }}>{user.name}</strong></p>
      <Link to={user.role === "admin" ? "/secure-admin-dashboard" : "/dashboard"} className="auth2-already-btn">
        Go to Dashboard <ArrowRight size={15} />
      </Link>
    </div></div>
  );

  return (
    <div className="auth2-bg">
      {/* Background layers */}
      <div className="auth2-glow auth2-glow--cyan" aria-hidden="true" />
      <div className="auth2-glow auth2-glow--purple" aria-hidden="true" />
      <div className="auth2-grid" aria-hidden="true" />

      <div className="auth2-card-wrap">
        {/* Logo above card */}
        <Link to="/" className="auth2-logo">
          <div className="auth2-logo-icon"><Shield size={18} style={{ color: "#00F5FF" }} /></div>
          <span className="auth2-logo-text">CyberVerse</span>
        </Link>

        {/* Card */}
        <div className="auth2-card">
          {/* Header */}
          <div className="auth2-card-header">
            {isTimeout && (
              <div className="auth2-timeout-badge">⚠ Session Expired</div>
            )}
            <h1 className="auth2-card-title">
              {isTimeout ? "Sign In Again" : "Welcome Back"}
            </h1>
            <p className="auth2-card-sub">
              {isTimeout
                ? "Your session expired due to inactivity."
                : "Sign in to access your hacker dashboard"}
            </p>
          </div>

          {/* Google */}
          <div className="auth2-google-wrap">
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError}
              theme="filled_black" size="large" text="continue_with" width="100%" />
          </div>

          {/* Divider */}
          <div className="auth2-divider">
            <span className="auth2-divider-line" />
            <span className="auth2-divider-text">or continue with email</span>
            <span className="auth2-divider-line" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth2-form">
            <div className="auth2-field">
              <label className="auth2-label">Email Address</label>
              <input id="login-email" type="email" placeholder="hacker@cyberverse.io"
                value={email} onChange={e => setEmail(e.target.value)}
                required autoComplete="email" className="auth2-input" />
            </div>

            <div className="auth2-field">
              <div className="auth2-label-row">
                <label className="auth2-label">Password</label>
                <button type="button" onClick={() => navigate("/forgot-password")} className="auth2-forgot">
                  Forgot password?
                </button>
              </div>
              <div className="auth2-input-wrap">
                <input id="login-password" type={showPassword ? "text" : "password"}
                  placeholder="••••••••" value={password}
                  onChange={e => setPassword(e.target.value)}
                  required autoComplete="current-password" className="auth2-input" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="auth2-eye" aria-label="Toggle password">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && <div className="auth2-error"><span>⚠</span>{error}</div>}

            <button type="submit" id="login-submit" disabled={loading || success} className="auth2-submit">
              {success ? <><Check size={16} /> Authenticated!</>
                : loading ? <><Loader2 size={16} className="auth2-btn-spin" /> Verifying...</>
                : <>Sign In <ArrowRight size={16} /></>}
            </button>
          </form>

          {/* Footer */}
          <p className="auth2-switch">
            Don't have an account?{" "}
            <button type="button" onClick={() => navigate("/signup")} className="auth2-switch-link">
              Create one free →
            </button>
          </p>
        </div>

        {/* Trust badges */}
        <div className="auth2-badges">
          <span className="auth2-badge"><Trophy size={11} style={{ color: "#FACC15" }} /> 23K+ Hackers</span>
          <span className="auth2-badge"><Flame size={11} style={{ color: "#00F5FF" }} /> 86 Live Labs</span>
          <span className="auth2-badge"><Lock size={11} style={{ color: "#39FF14" }} /> End-to-end encrypted</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
