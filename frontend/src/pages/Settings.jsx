import { useState, useEffect } from 'react'
import { User, Lock, CreditCard, Shield, Upload, Trash2, Check, Key } from 'lucide-react'
import { useApp } from '../contexts/app-context'
import { apiCall, API_BASE_URL } from '../config/api'
import { useNavigate } from 'react-router-dom'
import TwoFactorSettings from '../components/TwoFactorSettings'

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
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'account', label: 'Account', icon: Lock },
    { id: 'subscription', label: 'Subscription', icon: CreditCard }
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
      const token = localStorage.getItem('token')
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
        showSuccessToast('Profile updated successfully!')
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
      showSuccessToast('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()

    if (formData.newPassword !== formData.confirmPassword) {
      showSuccessToast('Passwords do not match')
      return
    }

    if (formData.newPassword.length < 6) {
      showSuccessToast('Password must be at least 6 characters')
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

      showSuccessToast('Password updated successfully!')
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
    } catch (error) {
      console.error('Failed to change password:', error)
      showSuccessToast(error.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      showSuccessToast('Please select an image file')
      return
    }
    
    if (file.size > 2 * 1024 * 1024) {
      showSuccessToast('File size must be less than 2MB')
      return
    }

    setLoading(true)
    
    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await apiCall('/users/upload-avatar', {
        method: 'POST',
        body: formData
      })

      if (response?.user) {
        // Add timestamp to force image refresh (cache busting)
        const updatedUser = {
          ...response.user,
          avatarTimestamp: Date.now()
        }
        updateUserProfile(updatedUser)
        showSuccessToast('Avatar updated successfully!')
        e.target.value = '' // Clear input
      }
    } catch (error) {
      console.error('Avatar upload error:', error)
      showSuccessToast('Failed to upload avatar')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // API call to delete account
      logout()
      navigate('/')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="page-container bg-[rgb(8,12,16)] text-text min-h-screen pb-32">
      <div className="container mx-auto px-4 max-w-7xl py-8">
        <h1 className="text-3xl font-bold gradient-text mb-8">Account Settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Tabs */}
          <div className="lg:col-span-3">
            <div className="glass-effect rounded-xl p-4 space-y-2 border border-white/10">
              {tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w - full flex items - center gap - 3 px - 4 py - 3 rounded - lg text - left transition - all ${activeTab === tab.id
                      ? 'bg-primary text-white'
                      : 'text-muted hover:bg-white/5 hover:text-text'
                      } `}
                  >
                    <Icon size={18} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right Content - Form Area */}
          <div className="lg:col-span-9">
            <div className="glass-effect rounded-xl p-6 border border-white/10">
              {/* Tab 1: Profile Settings */}
              {activeTab === 'profile' && (
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-text mb-1">Profile Settings</h2>
                    <p className="text-sm text-muted">Update your public profile information</p>
                  </div>

                  {/* Avatar Uploader */}
                  <div className="border-b border-white/10 pb-6">
                    <label className="block text-sm font-medium text-text mb-3">Profile Picture</label>
                    <div className="flex items-center gap-6">
                      <div className="relative group">
                        <img
                          src={user.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${API_BASE_URL}${user.avatar}?t=${user.avatarTimestamp || Date.now()}`) : `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                          alt="Avatar"
                          className="w-24 h-24 rounded-full border-2 border-primary/50 object-cover"
                        />
                        <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => document.getElementById('avatar-upload').click()}>
                          <Upload className="w-6 h-6 text-white" />
                        </div>
                      </div >
                      <div>
                        <input
                          type="file"
                          id="avatar-upload"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarUpload}
                        />
                        <button
                          type="button"
                          onClick={() => document.getElementById('avatar-upload').click()}
                          className="btn-ghost text-sm mb-2"
                        >
                          Change Avatar
                        </button>
                        <p className="text-xs text-muted">JPG, PNG or GIF. Max size 2MB.</p>
                      </div>
                    </div >
                  </div >

                  {/* Form Fields */}
                  < div className="space-y-4" >
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">Display Name</label>
                      <input
                        type="text"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text mb-2">Bio</label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Tell us about yourself..."
                        className="w-full px-4 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-primary transition-colors resize-none"
                      />
                      <p className="mt-1 text-xs text-muted">Brief description for your profile</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">Website URL</label>
                        <input
                          type="url"
                          name="website"
                          value={formData.website}
                          onChange={handleChange}
                          placeholder="https://example.com"
                          className="w-full px-4 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text mb-2">Twitter Handle</label>
                        <input
                          type="text"
                          name="twitter"
                          value={formData.twitter}
                          onChange={handleChange}
                          placeholder="@username"
                          className="w-full px-4 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                    </div>
                  </div >

                  <div className="flex justify-end pt-4">
                    <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check size={18} />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form >
              )}

              {/* Tab 2: Security & 2FA */}
              {
                activeTab === 'security' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-text mb-1">Security Settings</h2>
                      <p className="text-sm text-muted">Manage two-factor authentication and security options</p>
                    </div>

                    {/* Use existing TwoFactorSettings component */}
                    <TwoFactorSettings user={user} onUpdate={() => updateUserProfile(user)} />
                  </div>
                )
              }

              {/* Tab 3: Account & Password */}
              {
                activeTab === 'account' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-text mb-1">Account Security</h2>
                      <p className="text-sm text-muted">Manage your password and account security</p>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">Current Password</label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleChange}
                          className="w-full px-4 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text mb-2">New Password</label>
                        <input
                          type="password"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                          className="w-full px-4 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="w-full px-4 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <button type="submit" disabled={loading} className="btn-primary">
                          {loading ? 'Updating...' : 'Update Password'}
                        </button>
                      </div>
                    </form>

                    {/* Danger Zone */}
                    <div className="mt-8 pt-6 border-t border-white/10">
                      <div className="border-2 border-danger/30 bg-danger/5 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-danger mb-2">Danger Zone</h3>
                        <p className="text-sm text-muted mb-4">
                          Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <button
                          onClick={handleDeleteAccount}
                          className="bg-danger hover:bg-danger/80 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Trash2 size={18} />
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                )
              }

              {/* Tab 4: Subscription */}
              {
                activeTab === 'subscription' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-text mb-1">Subscription</h2>
                      <p className="text-sm text-muted">Manage your billing details and subscription</p>
                    </div>

                    <div className="space-y-4">
                      <div className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/30 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-text">
                              {user.isPremium ? 'Premium Plan' : 'Free Plan'}
                            </h3>
                            <p className="text-sm text-muted">
                              {user.isPremium
                                ? 'Full access to all premium features'
                                : 'Limited access to basic features'
                              }
                            </p>
                          </div>
                          <div className="text-3xl font-bold gradient-text">
                            {user.isPremium ? '$9.99' : '$0'}
                          </div>
                        </div>
                        {!user.isPremium && (
                          <button onClick={() => navigate('/premium')} className="btn-primary w-full">
                            Upgrade to Premium
                          </button>
                        )}
                      </div>

                      {user.isPremium && user.premiumSubscription && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-4 glass-effect rounded-lg border border-white/10">
                            <span className="text-sm text-muted">Status</span>
                            <span className="text-sm font-semibold text-primary capitalize">{user.premiumSubscription.status}</span>
                          </div>
                          <div className="flex items-center justify-between p-4 glass-effect rounded-lg border border-white/10">
                            <span className="text-sm text-muted">Plan</span>
                            <span className="text-sm font-semibold text-text capitalize">{user.premiumSubscription.plan}</span>
                          </div>
                          {user.premiumSubscription.startDate && (
                            <div className="flex items-center justify-between p-4 glass-effect rounded-lg border border-white/10">
                              <span className="text-sm text-muted">Member since</span>
                              <span className="text-sm font-semibold text-text">
                                {new Date(user.premiumSubscription.startDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              }
            </div >
          </div >
        </div >
      </div >

      {/* Toast Notification */}
      {
        showToast && (
          <div className="fixed bottom-8 right-8 glass-effect border border-primary/30 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-up z-50">
            <Check className="w-5 h-5 text-primary" />
            <span className="font-medium text-text">{toastMessage}</span>
          </div>
        )
      }
    </div >
  )
}

export default Settings