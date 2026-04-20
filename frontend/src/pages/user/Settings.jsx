import { useState, useEffect, useCallback, memo } from 'react'
import { 
  User, Lock, CreditCard, Shield, Upload, 
  Check, Key, Settings as SettingsIcon,
  Mail, Globe, Twitter, AlertTriangle, 
  Trash2, ChevronRight, Zap, Fingerprint,
  Lock as LockIcon, Crown as CrownIcon, Terminal,
  ShieldAlert
} from 'lucide-react'
import { useApp } from '../../contexts/app-context'
import { apiCall } from '../../config/api'
import { useNavigate } from 'react-router-dom'
import TwoFactorSettings from '../../components/two-factor/TwoFactorSettings'
import './Settings.css'

const Settings = memo(() => {
  const { user, updateUserProfile, logout } = useApp()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    website: '',
    twitter: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        displayName: user.name || '',
        bio: user.bio || '',
        website: user.website || '',
        twitter: user.twitter || ''
      }))
    }
  }, [user])

  const tabs = [
    { id: 'profile', label: 'Operational ID', icon: Fingerprint, color: 'cyan' },
    { id: 'security', label: 'Security Protocols', icon: Shield, color: 'orange' },
    { id: 'account', label: 'Core Access', icon: LockIcon, color: 'cyan' },
    { id: 'subscription', label: 'Service Tier', icon: Zap, color: 'orange' }
  ]

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const showSuccessToast = (message) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await apiCall('/users/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: formData.displayName,
          bio: formData.bio,
          website: formData.website,
          twitter: formData.twitter
        })
      })
      if (response) {
        updateUserProfile(response.user)
        showSuccessToast('Operational ID Synchronized')
      }
    } catch (error) {
      showSuccessToast('Sync Failed: Biometric Mismatch')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (formData.newPassword !== formData.confirmPassword) {
      showSuccessToast('Encryption keys do not match')
      return
    }
    setLoading(true)
    try {
      await apiCall('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      })
      showSuccessToast('Access Cyphers Rotated')
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }))
    } catch (error) {
      showSuccessToast('Rotation Failed: Invalid Key')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true)
    try {
      const data = new FormData()
      data.append('avatar', file)
      const response = await apiCall('/users/upload-avatar', {
        method: 'POST',
        body: data
      })
      if (response?.user) {
        updateUserProfile({ ...response.user, avatarTimestamp: Date.now() })
        showSuccessToast('Visual ID Updated')
      }
    } catch (error) {
      showSuccessToast('Upload Aborted')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = () => {
    if (window.confirm('WARNING: Initializing account erasure. All mission data will be purged. Proceed?')) {
      logout()
      navigate('/')
    }
  }

  if (!user) return (
    <div className="set-page min-h-screen flex items-center justify-center">
      <div className="set-spinner" />
    </div>
  )

  return (
    <div className="set-page min-h-screen relative overflow-x-hidden text-white">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none set-page__grid" />
      <div className="absolute inset-0 z-0 pointer-events-none set-page__overlay" />

      <div className="relative z-10 pt-16">
        
        {/* ═══ HEADER ═══ */}
        <div className="max-w-6xl mx-auto px-6 mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="set-hero-icon-box">
              <SettingsIcon size={24} className="text-[#00D1FF]" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white uppercase">Manage Account</h1>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Configure Operational Parameters & Security</p>
            </div>
          </div>
        </div>

        {/* ═══ MAIN GRID ═══ */}
        <div className="max-w-6xl mx-auto px-6 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* SIDEBAR NAVIGATION */}
          <div className="lg:col-span-3 space-y-4">
            <div className="set-nav-card p-2 rounded-2xl">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`set-nav-btn ${activeTab === tab.id ? 'set-nav-btn--active' : ''}`}
                >
                  <div className={`set-nav-btn__icon set-nav-btn__icon--${tab.color}`}>
                    <tab.icon size={18} />
                  </div>
                  <span className="flex-1 text-left text-[11px] font-black uppercase tracking-wider">{tab.label}</span>
                  {activeTab === tab.id && <ChevronRight size={14} className="opacity-50" />}
                </button>
              ))}
            </div>

            {/* Premium Callout */}
            {!user.isPremium && (
              <div className="set-card set-card--premium group cursor-pointer" onClick={() => navigate('/premium')}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFB800] to-[#FF6B00] flex items-center justify-center text-white shadow-lg">
                    <Zap size={16} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white">Go Premium</p>
                </div>
                <p className="text-[10px] font-bold text-slate-400 leading-relaxed mb-4">Unlock private labs, elite certifications, and detailed operational telemetry.</p>
                <div className="text-[10px] font-black text-[#FF6B00] uppercase tracking-widest flex items-center justify-end gap-2 group-hover:gap-3 transition-all">
                  Request Access <ChevronRight size={12} />
                </div>
              </div>
            )}
          </div>

          {/* CONTENT MODULE */}
          <div className="lg:col-span-9">
            <div className="set-content-card">
              
              {/* TAB 1: OPERATIONAL ID */}
              {activeTab === 'profile' && (
                <form onSubmit={handleSaveProfile} className="set-fade-in space-y-10">
                  <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                    <Fingerprint size={20} className="set-text-cyan" />
                    <h2 className="text-sm font-black uppercase tracking-[0.25em] text-white">Profile Identity</h2>
                  </div>
                  
                  {/* Avatar Section */}
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="relative group">
                      <div className="set-avatar-wrap">
                        <img 
                          src={user.avatar ? (user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}?t=${user.avatarTimestamp || Date.now()}`) : `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                          className="set-avatar-img"
                          alt="Biometric ID"
                        />
                      </div>
                      <div className="set-avatar-overlay" onClick={() => document.getElementById('avatar-upload').click()}>
                        <Upload size={24} />
                      </div>
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-3">
                      <input type="file" id="avatar-upload" className="hidden" onChange={handleAvatarUpload} />
                      <button type="button" onClick={() => document.getElementById('avatar-upload').click()} className="set-btn-secondary">
                        <Upload size={14} /> Update Visual ID
                      </button>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Supports PNG, JPG (MAX 2MB)</p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 space-y-2">
                      <label className="set-label">Operative Alias</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={16} />
                        <input name="displayName" value={formData.displayName} onChange={handleChange} className="set-input pl-12" placeholder="Commander" />
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label className="set-label">Field Dossier (Bio)</label>
                      <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} className="set-input !py-4 h-32 resize-none" placeholder="Strategic intelligence summary..." />
                    </div>

                    <div className="space-y-2">
                      <label className="set-label">Network Node (Website)</label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={16} />
                        <input type="url" name="website" value={formData.website} onChange={handleChange} className="set-input pl-12" placeholder="https://..." />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="set-label">Twitter Frequency</label>
                      <div className="relative">
                        <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={16} />
                        <input name="twitter" value={formData.twitter} onChange={handleChange} className="set-input pl-12" placeholder="@alias" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 border-t border-white/5">
                    <button type="submit" disabled={loading} className="set-btn-primary">
                      {loading ? 'Synchronizing...' : 'Commit Protocol Changes'}
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: SECURITY PROTOCOLS */}
              {activeTab === 'security' && (
                <div className="set-fade-in space-y-10">
                  <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                    <ShieldCheck size={20} className="text-[#88E636]" />
                    <h2 className="text-sm font-black uppercase tracking-[0.25em] text-white">Security Protocol</h2>
                  </div>
                  <TwoFactorSettings user={user} onUpdate={() => updateUserProfile(user)} />
                </div>
              )}

              {/* TAB 3: CORE ACCESS */}
              {activeTab === 'account' && (
                <div className="set-fade-in space-y-12">
                  <form onSubmit={handleChangePassword}>
                    <div className="flex items-center gap-3 pb-4 border-b border-white/5 mb-8">
                      <LockIcon size={20} className="set-text-orange" />
                      <h2 className="text-sm font-black uppercase tracking-[0.25em] text-white">Access Key Management</h2>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="set-label">Current Access Cypher</label>
                        <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} className="set-input" placeholder="••••••••" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="set-label">New Access Cypher</label>
                          <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} className="set-input" placeholder="••••••••" />
                        </div>
                        <div className="space-y-2">
                          <label className="set-label">Verify New Cypher</label>
                          <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="set-input" placeholder="••••••••" />
                        </div>
                      </div>
                    </div>
                    <div className="mt-10 flex justify-end">
                      <button type="submit" disabled={loading} className="set-btn-primary set-btn-primary--orange">
                        Rotate Access Keys
                      </button>
                    </div>
                  </form>

                  <div className="set-danger-zone">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertTriangle size={20} className="text-red-500" />
                      <h2 className="text-xs font-black uppercase tracking-[0.25em] text-red-500">Danger Zone</h2>
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 leading-relaxed max-w-2xl mb-6">
                      Initializing account deletion will permanently purge your mission logs, earned badges, and server access. This operation is non-reversible and final.
                    </p>
                    <button onClick={handleDeleteAccount} className="set-btn-danger">
                      <Trash2 size={14} /> Initialize Self-Destruct
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: SERVICE TIER */}
              {activeTab === 'subscription' && (
                <div className="set-fade-in space-y-10">
                  <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                    <Zap size={20} className="set-text-orange" />
                    <h2 className="text-sm font-black uppercase tracking-[0.25em] text-white">Operational Service Tier</h2>
                  </div>
                  
                  <div className="set-tier-card">
                    <div className="set-tier-card__visual">
                      <CrownIcon size={40} className={user.isPremium ? "text-[#FFB800]" : "text-white/10"} />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-2xl font-black text-white">{user.isPremium ? 'Elite Operative' : 'Standard Member'}</h3>
                          <div className={`text-[9px] font-black uppercase tracking-[0.2em] mt-1 ${user.isPremium ? 'text-[#00D1FF]' : 'text-slate-500'}`}>
                            Status: {user.isPremium ? 'FULL ACCESS AUTHORIZED' : 'RESTRICTED CLEARANCE'}
                          </div>
                        </div>
                        <div className="text-3xl font-black text-white italic">
                          {user.isPremium ? '$9.99' : '$0.00'}
                          <span className="text-xs font-bold text-slate-500 not-italic ml-1">/ mo</span>
                        </div>
                      </div>

                      {!user.isPremium ? (
                        <div className="space-y-6">
                          <p className="text-[11px] font-bold text-slate-400 leading-relaxed">
                            Upgrade to Elite status to gain full access to private mission environments, advanced offensive security laboratories, and international certification paths.
                          </p>
                          <button onClick={() => navigate('/premium')} className="set-btn-primary">
                            Request Elite Access Override
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                          <div className="set-stat-mini">
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Billing Protocol</p>
                            <p className="text-sm font-black text-white uppercase">{user.premiumSubscription?.status || 'Active'}</p>
                          </div>
                          <div className="set-stat-mini">
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Deployment Cycle</p>
                            <p className="text-sm font-black text-white uppercase">{user.premiumSubscription?.plan || 'Monthly'}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* TOAST SYSTEM (Hacker style) */}
      {showToast && (
        <div className="set-toast">
           <div className="set-toast__icon"><Check size={14} /></div>
           <div className="set-toast__content">
             <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">System Message</p>
             <p className="text-[10px] font-black text-white uppercase tracking-widest">{toastMessage}</p>
           </div>
        </div>
      )}
    </div>
  )
})

const ShieldCheck = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

Settings.displayName = "Settings";
export default Settings