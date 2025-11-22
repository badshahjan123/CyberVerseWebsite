import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { apiCall } from "../config/api"
import { ModernButton } from "../components/ui/modern-button"
import { Shield, Loader2, Check, ArrowLeft, KeyRound } from "lucide-react"

const ForgotPassword = () => {
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [twoFactorCode, setTwoFactorCode] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [step, setStep] = useState(1) // 1: Email, 2: 2FA + New Password
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [resetToken, setResetToken] = useState("")

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

    const handlePasswordReset = async (e) => {
        e.preventDefault()
        setError("")

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters")
            return
        }

        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(newPassword)) {
            setError("Password must contain uppercase, lowercase, number, and special character")
            return
        }

        setLoading(true)

        try {
            await apiCall("/auth/reset-password-2fa", {
                method: "POST",
                body: JSON.stringify({
                    email,
                    twoFactorCode,
                    newPassword
                })
            })

            // Success - redirect to login
            navigate("/login", {
                state: { message: "Password reset successfully! Please login with your new password." }
            })
        } catch (err) {
            setError(err.message || "Failed to reset password. Please check your 2FA code.")
        } finally {
            setLoading(false)
        }
    }

    const getPasswordStrength = () => {
        if (!newPassword) return { strength: 0, label: "", color: "" }

        let strength = 0
        if (newPassword.length >= 6) strength++
        if (newPassword.length >= 10) strength++
        if (/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)) strength++
        if (/\d/.test(newPassword)) strength++
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) strength++

        if (strength <= 2) return { strength, label: "Weak", color: "bg-red-500" }
        if (strength <= 3) return { strength, label: "Fair", color: "bg-yellow-500" }
        if (strength <= 4) return { strength, label: "Good", color: "bg-blue-500" }
        return { strength, label: "Strong", color: "bg-green-500" }
    }

    const passwordStrength = getPasswordStrength()

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
                    <div className="text-center mb-6">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
                            <KeyRound className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-white mb-1">Reset Password</h1>
                        <p className="text-gray-300 text-sm">
                            {step === 1 ? "Enter your email to begin" : "Verify with 2FA and set new password"}
                        </p>
                    </div>

                    {step === 1 ? (
                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full h-11 px-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                                <p className="mt-2 text-xs text-gray-400">
                                    Note: You must have Google Authenticator 2FA enabled to reset your password
                                </p>
                            </div>

                            {error && (
                                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                                    {error}
                                </p>
                            )}

                            <ModernButton
                                variant="primary"
                                size="sm"
                                type="submit"
                                disabled={loading}
                                className="w-full h-11"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Checking...
                                    </>
                                ) : (
                                    "Continue"
                                )}
                            </ModernButton>
                        </form>
                    ) : (
                        <form onSubmit={handlePasswordReset} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Google Authenticator Code
                                </label>
                                <input
                                    type="text"
                                    placeholder="000000"
                                    value={twoFactorCode}
                                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    required
                                    maxLength={6}
                                    className="w-full h-11 px-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-center text-2xl tracking-widest"
                                />
                                <p className="mt-2 text-xs text-gray-400">
                                    Enter the 6-digit code from your authenticator app
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    className="w-full h-11 px-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                                {newPassword && (
                                    <div className="mt-2">
                                        <div className="flex items-center justify-between text-xs mb-1">
                                            <span className="text-gray-400">Password Strength:</span>
                                            <span className={`font-semibold ${passwordStrength.strength >= 4 ? 'text-green-400' : passwordStrength.strength >= 3 ? 'text-blue-400' : 'text-yellow-400'}`}>
                                                {passwordStrength.label}
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${passwordStrength.color} transition-all duration-300`}
                                                style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full h-11 px-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>

                            {error && (
                                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                                    {error}
                                </p>
                            )}

                            <ModernButton
                                variant="primary"
                                size="sm"
                                type="submit"
                                disabled={loading}
                                className="w-full h-11"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Resetting...
                                    </>
                                ) : (
                                    "Reset Password"
                                )}
                            </ModernButton>

                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-full text-sm text-gray-400 hover:text-gray-300 transition-colors flex items-center justify-center gap-1"
                            >
                                <ArrowLeft className="h-3 w-3" />
                                Back to email
                            </button>
                        </form>
                    )}

                    <div className="mt-6 text-center text-sm">
                        <Link
                            to="/login"
                            className="text-blue-400 hover:text-blue-300 transition-colors flex items-center justify-center gap-1"
                        >
                            <ArrowLeft className="h-3 w-3" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword
