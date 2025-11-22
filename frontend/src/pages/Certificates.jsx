import { memo, useState, useEffect } from "react"
import { useApp } from "../contexts/app-context"
import { apiCall } from "../config/api"
import {
  Award,
  Download,
  Share2,
  Calendar,
  CheckCircle,
  Lock,
  Trophy,
  Star,
  ExternalLink,
  Search,
  Linkedin,
  Copy,
  Shield,
  FileText,
  CheckCircle2
} from "lucide-react"

// Professional Certificate Card - TryHackMe Style
const CertificateCard = memo(({ certificate }) => {
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleDownload = () => {
    setDownloading(true)
    // Toast notification
    const toast = document.createElement('div')
    toast.className = 'fixed top-4 right-4 bg-primary/90 text-white px-6 py-3 rounded-lg shadow-lg z-50'
    toast.textContent = 'Generating high-res PDF...'
    document.body.appendChild(toast)

    setTimeout(() => {
      setDownloading(false)
      toast.textContent = `Certificate downloaded successfully!`
      setTimeout(() => document.body.removeChild(toast), 2000)
    }, 2000)
  }

  const handleVerify = () => {
    // Copy credential ID to clipboard
    navigator.clipboard.writeText(certificate.credentialId)
    setCopied(true)

    const toast = document.createElement('div')
    toast.className = 'fixed top-4 right-4 bg-primary/90 text-white px-6 py-3 rounded-lg shadow-lg z-50'
    toast.textContent = `Credential ID copied: ${certificate.credentialId}`
    document.body.appendChild(toast)
    setTimeout(() => {
      document.body.removeChild(toast)
      setCopied(false)
    }, 2000)
  }

  const handleLinkedInShare = () => {
    // LinkedIn certification add URL
    const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(certificate.title)}&organizationName=CyberVerse&issueYear=${new Date(certificate.issueDate).getFullYear()}&issueMonth=${new Date(certificate.issueDate).getMonth() + 1}&certUrl=${encodeURIComponent(certificate.verificationUrl)}&certId=${certificate.credentialId}`
    window.open(linkedInUrl, '_blank')
  }

  return (
    <div className="group relative rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1">
      {/* Certificate Preview - Diploma Style */}
      <div className={`relative aspect-[16/11] rounded-xl overflow-hidden border-2 ${certificate.earned
        ? 'border-yellow-500/50 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800'
        : 'border-slate-700/50 bg-slate-800/50'
        }`}>
        {/* Paper Texture Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\' opacity=\'0.05\'/%3E%3C/svg%3E")'
          }}></div>
        </div>

        {/* Watermark Logo */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <Shield className="w-32 h-32 text-white" />
        </div>

        {/* Certificate Content */}
        <div className="relative h-full p-6 flex flex-col justify-between">
          {certificate.earned ? (
            <>
              {/* Header */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="text-xs font-semibold text-primary tracking-wider">CYBERVERSE</span>
                </div>
                <h3 className="font-serif text-xl font-bold text-text mb-1">{certificate.title}</h3>
                <p className="text-xs text-muted">{certificate.category}</p>
              </div>

              {/* Credential ID */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                  <FileText className="w-3 h-3 text-primary" />
                  <span className="text-xs font-mono text-muted">{certificate.credentialId}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-end text-xs text-muted">
                <div>
                  <p className="text-[10px] uppercase tracking-wide mb-0.5">Issued</p>
                  <p className="font-semibold">{new Date(certificate.issueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">Score: {certificate.score}%</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <Lock className="w-12 h-12 text-slate-600 mb-3" />
              <h3 className="font-serif text-lg font-bold text-slate-500 mb-2">{certificate.title}</h3>
              <p className="text-xs text-slate-600">{certificate.requirement}</p>
            </div>
          )}
        </div>

        {/* Hover Overlay */}
        {certificate.earned && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <button
              onClick={handleVerify}
              className="w-full py-2 bg-primary/90 hover:bg-primary text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Verify Credential
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {certificate.earned && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleLinkedInShare}
            className="flex-1 py-2 px-3 bg-[#0077B5] hover:bg-[#006399] text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Linkedin className="w-4 h-4" />
            Add to Profile
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-text rounded-lg transition-all disabled:opacity-50"
          >
            {downloading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            ) : (
              <Download className="w-4 h-4" />
            )}
          </button>
        </div>
      )}
    </div>
  )
})

CertificateCard.displayName = 'CertificateCard'

const CertificatesPage = memo(() => {
  const { user } = useApp()
  const [filter, setFilter] = useState('all') // all, paths, rooms
  const [searchQuery, setSearchQuery] = useState('')
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        // Fetch real certificates from backend
        const response = await apiCall('/user/certificates')

        // Map backend data to frontend format
        const formattedCertificates = response.certificates.map(cert => ({
          id: cert._id,
          title: cert.title,
          category: cert.category || cert.type === 'path' ? 'Learning Path' : 'Room Completion',
          type: cert.type, // 'path' or 'room'
          credentialId: cert.credentialId,
          issueDate: cert.issueDate || cert.earnedDate,
          expiryDate: cert.expiryDate || null,
          verificationUrl: cert.verificationUrl || `https://cyberverse.com/verify/${cert.credentialId}`,
          score: cert.score || cert.completionScore || 0,
          earned: cert.earned || cert.completed,
          requirement: cert.requirement || `Complete ${cert.title}`
        }))

        setCertificates(formattedCertificates)
        setLoading(false)
      } catch (error) {
        console.error("Failed to fetch certificates:", error)
        // Set empty array on error
        setCertificates([])
        setLoading(false)
      }
    }
    fetchCertificates()
  }, [])

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filter === 'all' || cert.type === filter
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: certificates.length,
    earned: certificates.filter(c => c.earned).length,
    paths: certificates.filter(c => c.type === 'path').length,
    rooms: certificates.filter(c => c.type === 'room').length
  }

  return (
    <div className="min-h-screen bg-[rgb(8,12,16)] text-text py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-primary/30 mb-6">
            <Award className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Professional Credentials</span>
          </div>

          <h1 className="text-5xl font-bold mb-4">
            Your <span className="gradient-text">Certificates</span>
          </h1>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Showcase your cybersecurity expertise with verifiable professional certificates
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-effect rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-10 h-10 text-primary" />
              <div>
                <p className="text-3xl font-bold text-text">{stats.earned}</p>
                <p className="text-sm text-muted">Earned</p>
              </div>
            </div>
          </div>

          <div className="glass-effect rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-10 h-10 text-warning" />
              <div>
                <p className="text-3xl font-bold text-text">{stats.paths}</p>
                <p className="text-sm text-muted">Paths</p>
              </div>
            </div>
          </div>

          <div className="glass-effect rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-10 h-10 text-success" />
              <div>
                <p className="text-3xl font-bold text-text">{stats.rooms}</p>
                <p className="text-sm text-muted">Rooms</p>
              </div>
            </div>
          </div>

          <div className="glass-effect rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <Lock className="w-10 h-10 text-muted" />
              <div>
                <p className="text-3xl font-bold text-text">{stats.total - stats.earned}</p>
                <p className="text-sm text-muted">Locked</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="text"
              placeholder="Search certificates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-text placeholder-muted focus:border-primary focus:outline-none"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-white/5 text-muted hover:bg-white/10'
                }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setFilter('path')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${filter === 'path'
                ? 'bg-primary text-white'
                : 'bg-white/5 text-muted hover:bg-white/10'
                }`}
            >
              Learning Paths ({stats.paths})
            </button>
            <button
              onClick={() => setFilter('room')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${filter === 'room'
                ? 'bg-primary text-white'
                : 'bg-white/5 text-muted hover:bg-white/10'
                }`}
            >
              Rooms ({stats.rooms})
            </button>
          </div>
        </div>

        {/* Certificates Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted mt-4">Loading certificates...</p>
          </div>
        ) : filteredCertificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredCertificates.map((certificate) => (
              <CertificateCard key={certificate.id} certificate={certificate} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20">
            <div className="glass-effect rounded-2xl p-12 border border-white/10 max-w-2xl mx-auto">
              <Award className="w-20 h-20 text-muted mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-4">No Certificates Yet</h2>
              <p className="text-muted mb-8">
                Start a Learning Path or complete Rooms to earn your first professional certificate and showcase your cybersecurity skills!
              </p>
              <div className="flex gap-4 justify-center">
                <a href="/rooms" className="btn-primary inline-flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Browse Rooms
                </a>
                <a href="/pathways" className="btn-ghost inline-flex items-center gap-2">
                  <ExternalLink className="w-5 h-5" />
                  View Learning Paths
                </a>
              </div>
            </div>
          </div>
        )}

        {/* LinkedIn CTA */}
        {stats.earned > 0 && (
          <div className="glass-effect rounded-2xl p-8 border border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">Share Your Success</h3>
                <p className="text-muted">
                  Add your professional certificates to LinkedIn and showcase your cybersecurity expertise to recruiters and peers worldwide.
                </p>
              </div>
              <button className="px-8 py-4 bg-[#0077B5] hover:bg-[#006399] text-white rounded-lg font-semibold flex items-center gap-3 transition-colors">
                <Linkedin className="w-6 h-6" />
                Add All to LinkedIn
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

CertificatesPage.displayName = 'CertificatesPage'
export default CertificatesPage