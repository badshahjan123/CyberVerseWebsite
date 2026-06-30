import { useState, useEffect } from "react"
import { ModernButton } from "../ui-components"
import { Shield, Smartphone, Mail, QrCode, Key, Trash2, AlertTriangle, Check, RefreshCw } from "lucide-react"
import { apiCall } from "../../config/api"

const TwoFactorSettings = ({ user, onUpdate }) => {
  const [loading, setLoading] = useState(false)
  const [setupLoading, setSetupLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [twoFactorStatus, setTwoFactorStatus] = useState(null)
  const [setupData, setSetupData] = useState(null)
  const [verificationCode, setVerificationCode] = useState("")
  const [trustedDevices, setTrustedDevices] = useState([])

  useEffect(() => {
    fetchTwoFactorStatus()
    fetchTrustedDevices()
  }, [])

  const fetchTwoFactorStatus = async () => {
    try {
      const response = await apiCall('/2fa/status')
      setTwoFactorStatus(response)
    } catch (error) {
      console.error('Failed to fetch 2FA status:', error)
    }
  }

  const fetchTrustedDevices = async () => {
    try {
      const response = await apiCall('/2fa/trusted-devices')
      setTrustedDevices(response.devices || [])
    } catch (error) {
      console.error('Failed to fetch trusted devices:', error)
    }
  }

  const handleSetup2FA = async () => {
    setSetupLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await apiCall('/2fa/setup', {
        method: 'POST'
      })

      setSetupData({
        method: 'totp',
        ...response
      })
    } catch (error) {
      setError(error.message || 'Failed to setup 2FA')
    } finally {
      setSetupLoading(false)
    }
  }

  const handleVerifySetup = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter a 6-digit code")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Get user ID from the stored user data
      const userId = user?.id || localStorage.getItem('userId')

      if (!userId) {
        throw new Error('User ID not found')
      }

      const response = await apiCall('/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          code: verificationCode.trim()
        })
      })

      // Store the new token if provided
      if (response.token) {
        localStorage.setItem('token', response.token)
      }

      setSuccess("2FA enabled successfully!")
      setSetupData(null)
      setVerificationCode("")
      await fetchTwoFactorStatus()
      onUpdate?.()
    } catch (error) {
      setError(error.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDisable2FA = async () => {
    if (!confirm("Are you sure you want to disable 2FA? This will make your account less secure.")) {
      return
    }

    setLoading(true)
    setError("")

    try {
      await apiCall('/2fa/disable', { method: 'POST' })
      setSuccess("2FA disabled successfully")
      await fetchTwoFactorStatus()
      await fetchTrustedDevices()
      onUpdate?.()
    } catch (error) {
      setError(error.message || 'Failed to disable 2FA')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveDevice = async (deviceId) => {
    if (!confirm("Remove this trusted device?")) return

    try {
      await apiCall(`/2fa/trusted-devices/${deviceId}`, { method: 'DELETE' })
      await fetchTrustedDevices()
      setSuccess("Device removed successfully")
    } catch (error) {
      setError(error.message || 'Failed to remove device')
    }
  }

  const handleRemoveAllDevices = async () => {
    if (!confirm("Remove all trusted devices? You'll need to verify 2FA on all devices next time.")) return

    try {
      await apiCall('/2fa/trusted-devices', { method: 'DELETE' })
      await fetchTrustedDevices()
      setSuccess("All devices removed successfully")
    } catch (error) {
      setError(error.message || 'Failed to remove devices')
    }
  }

  if (setupData) {
    return (
      <div className="space-y-6 font-mono text-xs">
        <div className="p-6 rounded-2xl bg-[#0a1220]/60 border border-white/[0.04]">
          <h3 className="text-sm font-black uppercase tracking-[0.25em] text-white mb-6 flex items-center gap-3">
            <Shield className="h-5 w-5 text-[#00D1FF]" />
            Setup {setupData.method === 'email' ? 'Email' : 'Authenticator'} 2FA
          </h3>

          {setupData.method === 'email' ? (
            <div className="space-y-4">
              <div className="bg-[#00D1FF]/10 border border-[#00D1FF]/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-[#00D1FF]" />
                  <span className="text-[#00D1FF] font-bold uppercase tracking-widest text-[10px]">Email OTP</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  A 6-digit code has been sent to your email address. Enter it below to complete setup.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-[#88E636]/10 border border-[#88E636]/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Smartphone className="h-4 w-4 text-[#88E636]" />
                  <span className="text-[#88E636] font-bold uppercase tracking-widest text-[10px]">Authenticator App</span>
                </div>
                <p className="text-slate-400 text-[11px] mb-5 leading-relaxed">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>

                {setupData.qrCode && (
                  <div className="bg-white p-3 rounded-xl inline-block shadow-[0_0_20px_rgba(136,230,54,0.15)]">
                    <img src={setupData.qrCode} alt="QR Code" className="w-40 h-40" />
                  </div>
                )}

                <div className="mt-5 p-4 bg-black/40 rounded-xl border border-white/[0.04]">
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black mb-2">Manual Entry Key:</p>
                  <code className="text-sm text-[#00D1FF] font-mono break-all bg-[#00D1FF]/5 px-2 py-1 rounded border border-[#00D1FF]/10">{setupData.secret}</code>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8">
            <label className="set-label">
              Enter verification code
            </label>
            <input
              type="text"
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="set-input text-center text-xl font-black tracking-[0.5em]"
            />
          </div>

          {error && (
            <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-2">
              <AlertTriangle size={14} /> {error}
            </p>
          )}

          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-white/5">
            <button
              onClick={() => {
                setSetupData(null)
                setVerificationCode("")
                setError("")
              }}
              className="set-btn-secondary"
            >
              Cancel Setup
            </button>
            <button
              onClick={handleVerifySetup}
              disabled={loading || verificationCode.length !== 6}
              className="set-btn-primary flex items-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Enable Protocol
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="p-6 rounded-2xl bg-[#0a1220]/60 border border-white/[0.04]">
        <h3 className="text-sm font-black uppercase tracking-[0.25em] text-white mb-6 flex items-center gap-3">
          <Shield className="h-5 w-5 text-[#FF6B00]" />
          Two-Factor Authentication
        </h3>

        {error && (
          <p className="mb-6 text-[10px] font-bold uppercase tracking-widest text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-2">
            <AlertTriangle size={14} /> {error}
          </p>
        )}

        {success && (
          <p className="mb-6 text-[10px] font-bold uppercase tracking-widest text-[#88E636] bg-[#88E636]/10 border border-[#88E636]/20 rounded-xl p-4 flex items-center gap-2">
            <Check size={14} /> {success}
          </p>
        )}

        {twoFactorStatus?.enabled ? (
          <div className="space-y-6">
            <div className="bg-[#88E636]/10 border border-[#88E636]/20 rounded-xl p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#88E636]/20 flex items-center justify-center">
                    <Check className="h-5 w-5 text-[#88E636]" />
                  </div>
                  <div>
                    <span className="block text-[#88E636] font-black uppercase tracking-widest text-xs mb-1">2FA Enabled</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Protocol: {twoFactorStatus.method === 'email' ? 'Email OTP' : 'Authenticator App'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleDisable2FA}
                  disabled={loading}
                  className="set-btn-danger"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Disable Protocol
                    </>
                  )}
                </button>
              </div>
            </div>

            {trustedDevices.length > 0 && (
              <div className="bg-black/40 rounded-xl p-5 border border-white/[0.04]">
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/5">
                  <h4 className="font-black uppercase tracking-widest text-white text-[11px]">Trusted Devices ({trustedDevices.length})</h4>
                  <button
                    onClick={handleRemoveAllDevices}
                    className="text-[10px] font-bold text-red-400 hover:text-red-300 uppercase tracking-widest transition-colors"
                  >
                    Purge All Devices
                  </button>
                </div>
                <div className="space-y-3">
                  {trustedDevices.map((device) => (
                    <div key={device.deviceId} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/[0.04] hover:bg-white/[0.04] transition-colors">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-wider text-white mb-1">{device.deviceName}</p>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                          Last seen: {new Date(device.lastUsed).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveDevice(device.deviceId)}
                        className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="h-5 w-5 text-orange-400" />
                <span className="text-orange-400 font-black uppercase tracking-widest text-[11px]">2FA Not Enabled</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed font-bold">
                Enable two-factor authentication to add an extra layer of security to your account. This is highly recommended for all operatives.
              </p>
            </div>

            <div className="bg-black/40 rounded-xl p-6 border border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Smartphone className="h-5 w-5 text-[#88E636]" />
                  <span className="font-black text-white uppercase tracking-widest text-[11px]">Authenticator App</span>
                </div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                  Use Google Authenticator, Authy, or similar apps for secure 2FA
                </p>
              </div>
              <div className="w-full md:w-auto">
                <button
                  onClick={handleSetup2FA}
                  disabled={setupLoading}
                  className="set-btn-primary w-full md:w-auto flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  {setupLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    'Initialize Setup'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TwoFactorSettings