import { memo, useState, useEffect, useCallback } from "react"
import { useApp } from "../../contexts/app-context"
import { apiCall } from "../../config/api"
import {
  Award, Download, Calendar, CheckCircle, Lock,
  Trophy, Search, Linkedin, Copy, Shield, FileText,
  CheckCircle2, ExternalLink, Star
} from "lucide-react"

const CertificateCard = memo(({ certificate }) => {
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const handleCopyId = () => {
    navigator.clipboard.writeText(certificate.credentialId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    setDownloading(true)
    setTimeout(() => setDownloading(false), 2000)
  }

  const handleLinkedIn = () => {
    const url = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(certificate.title)}&organizationName=CyberVerse&issueYear=${new Date(certificate.issueDate).getFullYear()}&issueMonth=${new Date(certificate.issueDate).getMonth() + 1}&certUrl=${encodeURIComponent(certificate.verificationUrl)}&certId=${certificate.credentialId}`
    window.open(url, "_blank")
  }

  if (!certificate.earned) {
    return (
      <div className="bg-white dark:bg-[#111827] border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 opacity-60">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 mb-4">
          <Lock size={20} className="text-slate-400" />
        </div>
        <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1 truncate">{certificate.title}</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">{certificate.category}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
          {certificate.requirement}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-cyan-400/5 hover:-translate-y-0.5 transition-all duration-300 group">
      {/* Certificate Preview Banner */}
      <div className="relative bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 p-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(34,211,238,0.15),transparent_60%)]" />
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-cyan-400/5 rounded-full -mr-12 -mb-12" />
        <div className="relative flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-cyan-400/20 flex items-center justify-center">
                <Shield size={14} className="text-cyan-400" />
              </div>
              <span className="text-xs font-semibold text-cyan-400 tracking-wider uppercase">CyberVerse</span>
            </div>
            <p className="text-xs text-slate-400 mb-1">{certificate.category}</p>
            <h3 className="text-base font-bold text-white leading-snug">{certificate.title}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-400/30 flex-shrink-0">
            <Award size={18} className="text-white" />
          </div>
        </div>

        <div className="relative mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar size={12} />
            <span>{new Date(certificate.issueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle size={12} className="text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400">Score: {certificate.score}%</span>
          </div>
        </div>
      </div>

      {/* Credential ID */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5">Credential ID</p>
        <div className="flex items-center justify-between gap-2">
          <code className="text-xs font-mono text-slate-700 dark:text-slate-300 truncate">{certificate.credentialId}</code>
          <button
            onClick={handleCopyId}
            className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
          >
            {copied ? <CheckCircle2 size={13} className="text-emerald-500" /> : <Copy size={13} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 py-4 flex items-center gap-2">
        <button
          onClick={handleLinkedIn}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0077B5]/10 hover:bg-[#0077B5]/20 text-[#0077B5] dark:text-[#38BDF8] border border-[#0077B5]/20 dark:border-[#38BDF8]/20 text-xs font-semibold transition-all"
        >
          <Linkedin size={14} /> LinkedIn
        </button>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/50 text-xs font-semibold transition-all disabled:opacity-60"
        >
          {downloading
            ? <span className="w-3.5 h-3.5 border-2 border-cyan-400/30 border-t-cyan-500 rounded-full animate-spin" />
            : <Download size={14} />}
          {downloading ? "Downloading..." : "Download"}
        </button>
      </div>
    </div>
  )
})
CertificateCard.displayName = "CertificateCard"

const SkeletonCard = () => (
  <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-hidden animate-pulse">
    <div className="h-36 bg-slate-200 dark:bg-slate-800" />
    <div className="p-5 space-y-3">
      <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
      <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded" />
      <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-xl mt-4" />
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

  const earned = certificates.filter(c => c.earned).length
  const paths  = certificates.filter(c => c.type === "path").length
  const rooms  = certificates.filter(c => c.type === "room").length

  return (
    <div className="page-root min-h-screen">
      {/* Profile-Style Banner */}
      <div className="cv-banner">
         <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/5 rounded-full -mr-48 -mt-48 blur-3xl" />
         <div className="cv-banner-glow" />
      </div>

      <div className="container mx-auto px-6 max-w-6xl relative">
        {/* HERO CONTENT OVERLAP */}
        <div className="cv-hero-overlap flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl p-8 rounded-3xl border border-white/20 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-400/30">
                < Award size={16} className="text-white" />
              </div>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 tracking-widest uppercase">Credentials</span>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Certificates</h1>
            <p className="text-slate-500 dark:text-slate-400">Your verified cybersecurity achievements and credentials</p>
          </div>

          {/* Stats strip */}
          <div className="flex items-center gap-6 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl p-6 rounded-2xl border border-white/20 dark:border-slate-800 shadow-lg mb-0.5">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{earned}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Earned</p>
            </div>
            <div className="w-px h-10 bg-slate-200 dark:bg-slate-700" />
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{rooms}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Rooms</p>
            </div>
            <div className="w-px h-10 bg-slate-200 dark:bg-slate-700" />
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{paths}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Paths</p>
            </div>
          </div>
        </div>
      </div>

      <div className="cv-page-section container mx-auto px-6 max-w-6xl py-8">

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Certificates Earned", value: earned,  icon: <Award size={18} />,   accent: "cyan",   bg: "bg-cyan-50 dark:bg-cyan-900/20",   text: "text-cyan-600 dark:text-cyan-400"   },
            { label: "Room Completions",    value: rooms,   icon: <Shield size={18} />,  accent: "purple", bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-600 dark:text-purple-400" },
            { label: "Learning Paths",      value: paths,   icon: <Trophy size={18} />,  accent: "amber",  bg: "bg-amber-50 dark:bg-amber-900/20",   text: "text-amber-600 dark:text-amber-400"  },
            { label: "Total Credentials",   value: certificates.length, icon: <FileText size={18} />, accent: "emerald", bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600 dark:text-emerald-400" },
          ].map(({ label, value, icon, bg, text }) => (
            <div key={label} className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-xl p-5 flex items-center gap-4 hover:shadow-md transition-all">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${bg} ${text}`}>
                {icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl p-1 gap-1">
            {[
              { key: "all",  label: "All" },
              { key: "room", label: "Rooms" },
              { key: "path", label: "Paths" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  filter === key
                    ? "bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 shadow-md shadow-cyan-400/30"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search certificates..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 transition-all"
            />
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#111827] border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
            <Award size={40} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-400 font-semibold mb-1">No certificates found</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">Complete rooms and learning paths to earn certificates</p>
            <a href="/rooms" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-cyan-400/25 transition-all">
              Browse Rooms
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(c => <CertificateCard key={c.id} certificate={c} />)}
          </div>
        )}

        {/* LinkedIn Banner */}
        {earned > 0 && (
          <div className="mt-10 relative bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#0077B5]/5 to-transparent" />
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#0077B5]/5 rounded-full -mr-24 -mt-24 blur-2xl" />
            <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#0077B5]/10 flex items-center justify-center flex-shrink-0">
                  <Linkedin size={22} className="text-[#0077B5] dark:text-[#38BDF8]" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1">Share on LinkedIn</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Showcase your CyberVerse credentials to your professional network</p>
                </div>
              </div>
              <button className="flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-[#0077B5] hover:bg-[#006097] text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[#0077B5]/20">
                <Linkedin size={16} /> Add to Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

CertificatesPage.displayName = "CertificatesPage"
export default CertificatesPage
