import { memo, useState, useEffect, useCallback } from "react"
import { useApp } from "../../contexts/app-context"
import { apiCall } from "../../config/api"
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
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => setDownloading(false), 2000);
  };

  const handleVerify = () => {
    navigator.clipboard.writeText(certificate.credentialId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLinkedInShare = () => {
    const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(certificate.title)}&organizationName=CyberVerse&issueYear=${new Date(certificate.issueDate).getFullYear()}&issueMonth=${new Date(certificate.issueDate).getMonth() + 1}&certUrl=${encodeURIComponent(certificate.verificationUrl)}&certId=${certificate.credentialId}`;
    window.open(linkedInUrl, '_blank');
  };

  return (
    <div className="cp-cert-card rcp-fade-in">
      <div className={`cp-cert-preview ${!certificate.earned ? 'cp-cert-preview--locked' : ''}`}>
        <div className="cp-cert-border" />
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-primary" />
            <span className="text-[10px] font-black text-primary tracking-widest uppercase">CyberVerse Protocol</span>
          </div>
          {certificate.earned && <Award size={20} className="text-yellow-500" />}
        </div>

        <div className="cp-cert-meta">{certificate.category}</div>
        <h3 className="cp-cert-title">{certificate.title}</h3>

        {certificate.earned ? (
          <>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
               <Calendar size={12} /> Issued: {new Date(certificate.issueDate).toLocaleDateString()}
            </div>
            <div className="cp-cert-score">SCORE: {certificate.score}%</div>
            <div className="cp-cert-seal">
               <Trophy size={28} className="text-primary/30" />
            </div>
          </>
        ) : (
          <div className="mt-12 flex flex-col items-center gap-3">
             <Lock size={32} className="text-slate-700" />
             <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-relaxed">
                Objective Locked: <br/> {certificate.requirement}
             </p>
          </div>
        )}

        {/* Verification Overlay */}
        {certificate.earned && (
          <div className="cp-overlay">
             <div className="bg-primary/10 border border-primary/20 px-3 py-1 rounded text-[10px] font-black text-primary uppercase tracking-widest mb-4">Verifiable ID</div>
             <p className="text-white font-mono text-xs mb-6 opacity-80">{certificate.credentialId}</p>
             <button 
                onClick={handleVerify}
                className="rcp-primary-btn !py-2 !px-4 !text-[11px] mb-2"
             >
                {copied ? <CheckCircle2 size={14} className="mr-2"/> : <Copy size={14} className="mr-2"/>}
                {copied ? 'ID Copied' : 'Copy Credential ID'}
             </button>
          </div>
        )}
      </div>

      {certificate.earned && (
        <div className="cp-cert-actions">
           <button onClick={handleLinkedInShare} className="cp-linkedin-btn">
              <Linkedin size={16} /> Add to Intel Profile
           </button>
           <button onClick={handleDownload} disabled={downloading} className="cp-download-btn">
              {downloading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" /> : <Download size={16} className="mr-2"/>}
              {downloading ? 'Extracting PDF...' : 'Download Export'}
           </button>
        </div>
      )}
    </div>
  );
});

CertificateCard.displayName = 'CertificateCard';

const CertificatesPage = memo(() => {
  const { user } = useApp();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCertificates = useCallback(async (bypassLoading = false) => {
    try {
      if (!bypassLoading) setLoading(true);
      const response = await apiCall('/user/certificates');
      const formattedCertificates = response.certificates.map(cert => ({
        id: cert._id,
        title: cert.title,
        category: cert.category || (cert.type === 'path' ? 'Mastery Path' : 'Specialist Operative'),
        type: cert.type,
        credentialId: cert.credentialId,
        issueDate: cert.issueDate || cert.earnedDate,
        verificationUrl: cert.verificationUrl || `https://cyberverse.com/verify/${cert.credentialId}`,
        score: cert.score || 0,
        earned: cert.earned || cert.completed,
        requirement: cert.requirement || `Eliminate all objectives in ${cert.title}`
      }));
      setCertificates(formattedCertificates);
    } catch (error) {
      console.error("Extraction Failed:", error);
      setCertificates([]);
    } finally {
      if (!bypassLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  // Real-time listener
  useEffect(() => {
    const handleSync = () => fetchCertificates(true);
    window.addEventListener("roomCompleted", handleSync);
    window.addEventListener("labCompleted", handleSync);
    return () => {
      window.removeEventListener("roomCompleted", handleSync);
      window.removeEventListener("labCompleted", handleSync);
    };
  }, [fetchCertificates]);

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || cert.type === filter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: certificates.length,
    earned: certificates.filter(c => c.earned).length,
    paths: certificates.filter(c => c.type === 'path').length,
    rooms: certificates.filter(c => c.type === 'room').length
  };

  return (
    <div className="cp-root">
      <div className="cp-grid" />
      <div className="cp-bg-glow" />

      <div className="container mx-auto px-4 max-w-7xl pb-40">
        <header className="cp-hero">
           <div className="pp-tag mb-4 rcp-fade-in">
              <Award size={14} className="text-primary animate-pulse" />
              <span>Verified Qualifications Grid</span>
           </div>
           <h1 className="pp-title rcp-fade-in">
              Service <span className="gradient-text italic font-black">Records</span>
           </h1>
           <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium leading-relaxed rcp-fade-in">
              A comprehensive ledger of your cybersecurity achievements. 
              Showcase your verifiable credentials to the global network.
           </p>
        </header>

        {/* STATS MODULE */}
        <div className="cp-stat-grid rcp-fade-in">
           <div className="cp-stat-card">
              <div className="cp-stat-icon text-primary bg-primary/5">
                 <Shield size={24} />
              </div>
              <div>
                 <div className="cp-stat-val">{stats.earned}</div>
                 <div className="cp-stat-label">Credentials Earned</div>
              </div>
           </div>
           <div className="cp-stat-card">
              <div className="cp-stat-icon text-yellow-500 bg-yellow-500/5">
                 <Trophy size={24} />
              </div>
              <div>
                 <div className="cp-stat-val">{stats.paths}</div>
                 <div className="cp-stat-label">Mastery Paths</div>
              </div>
           </div>
           <div className="cp-stat-card">
              <div className="cp-stat-icon text-primary bg-primary/5">
                 <Star size={24} />
              </div>
              <div>
                 <div className="cp-stat-val">{stats.rooms}</div>
                 <div className="cp-stat-label">Room Operations</div>
              </div>
           </div>
           <div className="cp-stat-card">
              <div className="cp-stat-icon text-slate-600 bg-slate-600/5">
                 <Lock size={24} />
              </div>
              <div>
                 <div className="cp-stat-val">{stats.total - stats.earned}</div>
                 <div className="cp-stat-label">Remaining Objectives</div>
              </div>
           </div>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 rcp-fade-in">
           <div className="flex-1 relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input 
                 type="text" 
                 placeholder="Search registry for credentials..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-900/50 border border-white/5 text-white placeholder-slate-600 focus:border-primary/50 outline-none transition-all font-bold"
              />
           </div>

           <div className="cp-nav-pills">
              <button 
                 onClick={() => setFilter('all')}
                 className={`cp-nav-pill ${filter === 'all' ? 'cp-nav-pill--active' : ''}`}
              >
                 All Intel
              </button>
              <button 
                 onClick={() => setFilter('path')}
                 className={`cp-nav-pill ${filter === 'path' ? 'cp-nav-pill--active' : ''}`}
              >
                 Paths
              </button>
              <button 
                 onClick={() => setFilter('room')}
                 className={`cp-nav-pill ${filter === 'room' ? 'cp-nav-pill--active' : ''}`}
              >
                 Rooms
              </button>
           </div>
        </div>

        {/* GRID */}
        {loading ? (
          <div className="text-center py-40">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
             <p className="text-slate-600 font-black uppercase tracking-[0.3em] text-[10px]">Accessing Database...</p>
          </div>
        ) : filteredCertificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {filteredCertificates.map(c => (
               <CertificateCard key={c.id} certificate={c} />
             ))}
          </div>
        ) : (
          <div className="text-center py-40 bg-slate-900/20 rounded-3xl border border-dashed border-white/5">
             <Shield size={48} className="text-slate-800 mx-auto mb-6" />
             <h3 className="text-xl font-black text-slate-700 uppercase italic">No Credentials Recorded</h3>
             <p className="text-slate-600 mt-2 font-bold mb-8">Deploy to operational rooms to earn official service records.</p>
             <a href="/rooms" className="rcp-primary-btn mx-auto !w-fit">View Active Rooms</a>
          </div>
        )}

        {/* LINKEDIN FOOTER */}
        {stats.earned > 0 && (
          <div className="mt-32 p-10 rounded-[32px] bg-gradient-to-br from-[#0077B5]/10 to-transparent border border-[#0077B5]/20 flex flex-col md:flex-row items-center gap-10 rcp-fade-in">
             <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">Social Validation</h3>
                <p className="text-slate-500 font-medium">Add your CyberVerse credentials to your LinkedIn professional pipeline to showcase your skills to the global security network.</p>
             </div>
             <button className="cp-linkedin-btn !mb-0 !py-4 !px-8 !w-fit">
                <Linkedin size={20} /> Bulk Sync LinkedIn
             </button>
          </div>
        )}
      </div>
    </div>
  );
});

CertificatesPage.displayName = 'CertificatesPage';
export default CertificatesPage;