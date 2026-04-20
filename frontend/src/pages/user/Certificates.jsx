import { memo, useState, useEffect, useCallback } from "react"
import { useApp } from "../../contexts/app-context"
import { apiCall } from "../../config/api"
import {
  Award, Download, Calendar, CheckCircle, Lock,
  Trophy, Search, Linkedin, Copy, Shield, FileText,
  CheckCircle2, ExternalLink, Star, Zap, Users,
  ArrowRight
} from "lucide-react"
import "./Certificates.css"

/* ─── Certificate Card ─── */
const CertificateCard = memo(({ certificate }) => {
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const handleCopyId = (e) => {
    e.preventDefault(); e.stopPropagation();
    navigator.clipboard.writeText(certificate.credentialId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = async (e) => {
    e.preventDefault(); e.stopPropagation();
    setDownloading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/user/certificates/${certificate.credentialId}/download`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `CyberVerse-Certificate-${certificate.credentialId}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download failed:', err)
    } finally {
      setDownloading(false)
    }
  }

  const handleLinkedIn = (e) => {
    e.preventDefault(); e.stopPropagation();
    const issueDate = new Date(certificate.issueDate);
    const url = new URL('https://www.linkedin.com/profile/add');
    url.searchParams.set('startTask', 'CERTIFICATION_NAME');
    url.searchParams.set('name', certificate.title);
    url.searchParams.set('organizationName', 'CyberVerse');
    url.searchParams.set('issueYear', issueDate.getFullYear());
    url.searchParams.set('issueMonth', issueDate.getMonth() + 1);
    url.searchParams.set('certUrl', certificate.verificationUrl);
    url.searchParams.set('certId', certificate.credentialId);
    window.open(url.toString(), '_blank', 'noopener,noreferrer');
  }

  if (!certificate.earned) {
    return (
      <div className="cert-card cert-card--locked relative rounded-2xl p-6 flex flex-col border border-dashed">
        <div className="cert-card__locked-overlay" />
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-800/50 mb-4 border border-white/5 relative z-10">
          <Lock size={20} className="text-slate-500" />
        </div>
        <div className="relative z-10">
          <h3 className="font-bold text-slate-400 mb-1 truncate">{certificate.title}</h3>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-3">{certificate.category}</p>
          <div className="bg-white/5 rounded-lg px-3 py-2 text-xs text-slate-500 leading-relaxed">
            {certificate.requirement}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cert-card group relative rounded-2xl overflow-hidden flex flex-col transition-all duration-400">
      {/* Top accent line */}
      <div className="cert-card__accent-line" />

      {/* ── Visual Section ── */}
      <div className="cert-card__hero relative h-48 p-6 flex flex-col justify-between overflow-hidden">
        {/* Dynamic decorative BG */}
        <div className="cert-card__hero-gradient" />
        <div className="cert-card__hero-glow" />

        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-400/20 flex items-center justify-center border border-cyan-400/20 shadow-[0_0_10px_rgba(0,209,255,0.1)]">
                <Shield size={14} className="cert-text-cyan" />
              </div>
              <span className="text-[10px] font-black tracking-[0.15em] uppercase cert-text-cyan">CyberVerse Verified</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 opacity-70">{certificate.category}</p>
            <h3 className="text-lg font-bold text-white leading-tight group-hover:cert-text-cyan transition-colors duration-300">
              {certificate.title}
            </h3>
          </div>
          <div className="cert-card__medal-box flex-shrink-0">
            <Award size={20} className="text-white" />
          </div>
        </div>

        <div className="relative z-10 flex items-end justify-between border-t border-white/10 pt-4">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
            <Calendar size={12} className="opacity-50" />
            <span>{new Date(certificate.issueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={12} className="text-emerald-400" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Graded: {certificate.score}%</span>
          </div>
        </div>
      </div>

      {/* ── Details Section ── */}
      <div className="cert-card__body p-5 space-y-4">
        <div>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 opacity-60">Authentication ID</p>
          <div className="cert-credential-box">
            <code className="text-xs font-mono text-slate-400 truncate">{certificate.credentialId}</code>
            <button onClick={handleCopyId} className={`cert-icon-btn ${copied ? "cert-icon-btn--active" : ""}`}>
              {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleDownload} disabled={downloading} className="cert-btn cert-btn--cyan flex-1">
            {downloading ? <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Download size={14} />}
            {downloading ? "Preparing..." : "Download PDF"}
          </button>
          <button
            onClick={handleLinkedIn}
            className="cert-btn cert-btn--link flex-shrink-0 flex items-center gap-1.5"
            title="Add to LinkedIn Profile"
          >
            <Linkedin size={14} />
            <span className="text-[11px] font-bold">LinkedIn</span>
          </button>
        </div>
      </div>
    </div>
  )
})
CertificateCard.displayName = "CertificateCard"

/* ─── Skeleton Card ─── */
const SkeletonCard = () => (
  <div className="cert-card cert-card--skeleton rounded-2xl overflow-hidden animate-pulse border border-white/5">
    <div className="h-48 bg-white/5" />
    <div className="p-5 space-y-4">
      <div className="space-y-2">
        <div className="h-2 w-16 bg-white/5 rounded" />
        <div className="h-3 w-full bg-white/10 rounded" />
      </div>
      <div className="h-10 bg-white/5 rounded-xl" />
    </div>
  </div>
)

const CertificatesPage = memo(() => {
  const { user } = useApp()
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchCertificates = useCallback(async (bypassLoading = false) => {
    try {
      if (!bypassLoading) setLoading(true)
      const response = await apiCall("/user/certificates")
      setCertificates(response.certificates.map(cert => ({
        id: cert._id,
        title: cert.title,
        category: cert.category || (cert.type === "path" ? "Learning Path" : "Room Completion"),
        type: cert.type,
        credentialId: cert.credentialId,
        issueDate: cert.issueDate || cert.earnedDate,
        verificationUrl: cert.verificationUrl || `https://cyberverse.com/verify/${cert.credentialId}`,
        score: cert.score || 0,
        earned: cert.earned || cert.completed,
        requirement: cert.requirement || `Complete ${cert.title}`,
      })))
    } catch (err) {
      setCertificates([])
    } finally {
      if (!bypassLoading) setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCertificates() }, [fetchCertificates])

  useEffect(() => {
    const sync = () => fetchCertificates(true)
    window.addEventListener("roomCompleted", sync)
    window.addEventListener("labCompleted", sync)
    return () => {
      window.removeEventListener("roomCompleted", sync)
      window.removeEventListener("labCompleted", sync)
    }
  }, [fetchCertificates])

  const filtered = certificates.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchFilter = filter === "all" || c.type === filter
    return matchSearch && matchFilter
  })

  const earnedCount = certificates.filter(c => c.earned).length
  const pathsCount  = certificates.filter(c => c.type === "path").length
  const roomsCount  = certificates.filter(c => c.type === "room").length

  return (
    <div className="cert-page min-h-screen relative overflow-x-hidden text-white">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none cert-page__grid" />
      <div className="absolute inset-0 z-0 pointer-events-none cert-page__overlay" />

      <div className="relative z-10">
        {/* ═══ HERO ═══ */}
        <div className="cert-hero relative overflow-hidden">
          <div className="cert-hero__glow-orange" />
          <div className="cert-hero__glow-cyan" />

          <div className="relative max-w-6xl mx-auto px-6 pt-12 pb-14">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="cert-hero__icon-box">
                    <Award size={24} className="cert-text-orange" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.2em] cert-text-cyan">
                    Member Credentials
                  </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">
                  Academic <span className="cert-text-orange">Certificates</span>
                </h1>
                <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
                  Your verified cybersecurity achievements, professional designations, and technical credentials earned throughout the CyberVerse ecosystem.
                </p>
              </div>

              {/* Stats Strip */}
              <div className="cert-stats-card flex items-center p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
                <div className="flex items-center gap-8 px-2">
                  <div className="text-center">
                    <p className="text-3xl font-black text-white">{earnedCount}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Earned</p>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="text-center">
                    <p className="text-3xl font-black text-white">{roomsCount}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Rooms</p>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="text-center">
                    <p className="text-3xl font-black text-white">{pathsCount}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Paths</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-10">
          {/* ═══ TOOLBAR ═══ */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12">
            <div className="cert-tab-group w-full sm:w-auto">
              {[
                { key: "all",  label: "All Records" },
                { key: "room", label: "Room Assets" },
                { key: "path", label: "Specializations" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`cert-tab ${filter === key ? "cert-tab--active" : ""}`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text"
                placeholder="Search credentials…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="cert-search-input"
              />
            </div>
          </div>

          {/* ═══ GRID ═══ */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="cert-empty-state py-24 flex flex-col items-center border border-dashed border-white/10 rounded-3xl bg-white/5">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/5">
                <Award size={40} className="text-slate-600" />
              </div>
              <p className="text-xl font-bold text-white mb-2">No certificates found</p>
              <p className="text-sm text-slate-400 mb-8 max-w-xs text-center">Complete training rooms and learning paths to unlock your official credentials.</p>
              <a href="/rooms" className="cert-btn cert-btn--orange px-8">
                Explore Training <ArrowRight size={14} />
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map(c => <CertificateCard key={c.id} certificate={c} />)}
            </div>
          )}

          {/* ═══ LINKEDIN FOOTER ═══ */}
          {earnedCount > 0 && (
            <div className="cert-footer mt-16 group relative overflow-hidden rounded-3xl p-10 border border-white/10 bg-[#0077B5]/5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#0077B5]/10 rounded-full -mr-32 -mt-32 blur-3xl" />
              <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                  <div className="w-16 h-16 rounded-2xl bg-[#0077B5]/20 flex items-center justify-center border border-[#0077B5]/20 shadow-xl shadow-[#0077B5]/10">
                    <Linkedin size={32} className="text-[#0077B5]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white mb-2">Professional Recognition</h3>
                    <p className="text-slate-400 max-w-md leading-relaxed">
                      Boost your professional profile by sharing your verified CyberVerse certifications directly to your LinkedIn network.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    // Add all earned certificates to LinkedIn — open first one
                    const first = certificates.find(c => c.earned);
                    if (!first) return;
                    const issueDate = new Date(first.issueDate);
                    const url = new URL('https://www.linkedin.com/profile/add');
                    url.searchParams.set('startTask', 'CERTIFICATION_NAME');
                    url.searchParams.set('name', first.title);
                    url.searchParams.set('organizationName', 'CyberVerse');
                    url.searchParams.set('issueYear', issueDate.getFullYear());
                    url.searchParams.set('issueMonth', issueDate.getMonth() + 1);
                    url.searchParams.set('certUrl', first.verificationUrl);
                    url.searchParams.set('certId', first.credentialId);
                    window.open(url.toString(), '_blank', 'noopener,noreferrer');
                  }}
                  className="cert-btn cert-btn--linkedin px-10 h-14 text-base"
                >
                  <Linkedin size={18} /> Add to LinkedIn Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

CertificatesPage.displayName = "CertificatesPage"
export default CertificatesPage
