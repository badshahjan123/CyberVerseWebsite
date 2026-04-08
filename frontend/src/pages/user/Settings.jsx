import { useState, useEffect } from 'react'
import { User, Lock, CreditCard, Shield, Upload, Trash2, Check, Key } from 'lucide-react'
import { useApp } from '../../contexts/app-context'
import { apiCall, API_BASE_URL } from '../../config/api'
import { useNavigate } from 'react-router-dom'
import TwoFactorSettings from '../../components/two-factor/TwoFactorSettings'

const Settings = () => {
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
    { id: 'profile', label: 'Operational ID', icon: User },
    { id: 'security', label: 'Cypher Locks', icon: Shield },
    { id: 'account', label: 'Core Access', icon: Lock },
    { id: 'subscription', label: 'Service Tier', icon: CreditCard }
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

  if (!user) {
    return (
      <div className="ms-root flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="ms-root">
      <div className="ms-grid" />
      
      <div className="container mx-auto px-4 max-w-7xl pt-12 pb-32">
        <header className="ms-header rcp-fade-in">
           <h1 className="ms-title italic"><span className="gradient-text">Command</span> Console</h1>
           <p className="ms-subtitle">Secure Administrative Directives // User: {user.name}</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* NAVIGATION SIDEBAR */}
          <div className="lg:col-span-3 rcp-fade-in">
            <div className="ms-nav-card">
              {tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`ms-nav-btn ${activeTab === tab.id ? 'ms-nav-btn--active' : ''}`}
                  >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* CONTENT MODULE */}
          <div className="lg:col-span-9 rcp-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="ms-content-card">
              
              {/* TAB 1: OPERATIONAL ID */}
              {activeTab === 'profile' && (
                <form onSubmit={handleSaveProfile}>
                  <h2 className="ms-tab-title"><User className="text-primary" /> Identity Synchronizer</h2>
                  
                  <div className="ms-biometric-wrap">
                    <div className="ms-avatar-container">
                      <img
                        src={user.avatar ? (user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}?t=${user.avatarTimestamp || Date.now()}`) : `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                        className="ms-avatar-img"
                        alt="Biometric ID"
                      />
                      <div className="ms-avatar-overlay" onClick={() => document.getElementById('avatar-upload').click()}>
                        <Upload size={24} className="text-white" />
                      </div>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                       <input type="file" id="avatar-upload" className="hidden" onChange={handleAvatarUpload} />
                       <button type="button" onClick={() => document.getElementById('avatar-upload').click()} className="rcp-primary-btn !w-fit mb-2">
                          Update Visual ID
                       </button>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Biometric Uplink: Active // PNG, JPG // MAX 2MB</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="ms-input-group">
                      <label className="ms-label">Operative Alias</label>
                      <input name="displayName" value={formData.displayName} onChange={handleChange} className="ms-input" />
                    </div>
                    <div className="ms-input-group">
                      <label className="ms-label">Field Dossier (Bio)</label>
                      <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} className="ms-input resize-none" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="ms-input-group">
                          <label className="ms-label">Network Node (Website)</label>
                          <input type="url" name="website" value={formData.website} onChange={handleChange} className="ms-input" placeholder="https://..." />
                       </div>
                       <div className="ms-input-group">
                          <label className="ms-label">Twitter Frequency</label>
                          <input name="twitter" value={formData.twitter} onChange={handleChange} className="ms-input" placeholder="@alias" />
                       </div>
                    </div>
                  </div>

                  <div className="mt-10 flex justify-end">
                    <button type="submit" disabled={loading} className="rcp-primary-btn !w-fit !px-10">
                      {loading ? 'Synchronizing...' : 'Commit Changes'}
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: CYPHER LOCKS (2FA) */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="ms-tab-title"><Shield className="text-primary" /> Security Protocol</h2>
                  <TwoFactorSettings user={user} onUpdate={() => updateUserProfile(user)} />
                </div>
              )}

              {/* TAB 3: CORE ACCESS (PASSWORD/DELETE) */}
              {activeTab === 'account' && (
                <div className="space-y-12">
                  <form onSubmit={handleChangePassword}>
                    <h2 className="ms-tab-title"><Lock className="text-primary" /> Cypher Rotation</h2>
                    <div className="space-y-6">
                       <div className="ms-input-group">
                          <label className="ms-label">Legacy Cypher</label>
                          <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} className="ms-input" />
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="ms-input-group">
                             <label className="ms-label">Next-Gen Cypher</label>
                             <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} className="ms-input" />
                          </div>
                          <div className="ms-input-group">
                             <label className="ms-label">Verify New Cypher</label>
                             <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="ms-input" />
                          </div>
                       </div>
                    </div>
                    <div className="mt-8 flex justify-end">
                       <button type="submit" disabled={loading} className="rcp-primary-btn !w-fit">
                          Rotate Access Keys
                       </button>
                    </div>
                  </form>

                  <div className="ms-danger-zone">
                     <h3 className="ms-danger-title">CRITICAL: Account Termination</h3>
                     <p className="text-slate-500 text-xs font-bold leading-relaxed">
                        Initializing account deletion will permanently purge your mission logs, badges, and server access. This operation is non-reversible.
                     </p>
                     <button onClick={handleDeleteAccount} className="ms-danger-btn">
                        Initialize Self-Destruct
                     </button>
                  </div>
                </div>
              )}

              {/* TAB 4: SERVICE TIER */}
              {activeTab === 'subscription' && (
                <div className="space-y-8">
                  <h2 className="ms-tab-title"><CreditCard className="text-primary" /> Operational Level</h2>
                  
                  <div className="pp-card !p-8 animate-pulse-slow">
                     <div className="flex justify-between items-start mb-6">
                        <div>
                           <h3 className="text-2xl font-black text-white italic uppercase">{user.isPremium ? 'Elite Operative' : 'Base Infiltrator'}</h3>
                           <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Status: {user.isPremium ? 'Authorized' : 'Limited Access'}</p>
                        </div>
                        <div className="text-4xl font-black gradient-text">{user.isPremium ? '$9.99' : '$0.00'}</div>
                     </div>
                     {!user.isPremium && (
                       <button onClick={() => navigate('/premium')} className="rcp-primary-btn">
                          Upgrade to Elite Tier
                       </button>
                     )}
                  </div>

                  {user.isPremium && user.premiumSubscription && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                          <div className="ms-label">Billing Status</div>
                          <div className="text-primary font-black uppercase text-sm mt-1">{user.premiumSubscription.status}</div>
                       </div>
                       <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                          <div className="ms-label">Active Cycle</div>
                          <div className="text-white font-black uppercase text-sm mt-1">{user.premiumSubscription.plan}</div>
                       </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* TOAST SYSTEM */}
      {showToast && (
        <div className="ms-toast">
           <Check size={18} className="text-primary" />
           <span className="text-xs font-black text-white uppercase tracking-widest">{toastMessage}</span>
        </div>
      )}
    </div>
  )
}

export default Settings