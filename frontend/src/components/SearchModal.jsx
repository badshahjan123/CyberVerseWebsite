import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, X, FileText, MessageSquare, User, CornerDownLeft, 
  Loader2, Crown, Terminal, Shield, Cpu, Activity, Globe, Zap, Clock, Key, AlertTriangle, Trophy
} from 'lucide-react';
import { apiCall } from '../config/api';
import { useDebounce } from '../hooks/useDebounce';

const getIcon = (type) => {
  switch (type) {
    case 'lab': return <Cpu className="w-4 h-4 text-cyan-400" />;
    case 'room': return <Terminal className="w-4 h-4 text-orange-500" />;
    case 'user': return <User className="w-4 h-4 text-[#10b981]" />;
    default: return <Shield className="w-4 h-4 text-cyan-400" />;
  }
};

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [activeCategory, setActiveCategory] = useState('all');
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(query, 300);

  // ── Typing Placeholder Simulator ──
  const placeholders = useMemo(() => [
    "Search live sandbox labs...",
    "Search active operators...",
    "Search rooms and pathways...",
    "Search verifiable certificates...",
    "Search vulnerabilities..."
  ], []);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [currentPlaceholder, setCurrentPlaceholder] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer;
    const fullText = placeholders[placeholderIndex];
    
    const handleType = () => {
      setCurrentPlaceholder(prev => {
        if (isDeleting) {
          if (prev.length === 0) {
            setIsDeleting(false);
            setPlaceholderIndex(curr => (curr + 1) % placeholders.length);
            return '';
          }
          return prev.slice(0, -1);
        } else {
          if (prev.length === fullText.length) {
            timer = setTimeout(() => setIsDeleting(true), 2200);
            return prev;
          }
          return fullText.slice(0, prev.length + 1);
        }
      });
    };

    timer = setTimeout(handleType, isDeleting ? 30 : 60);
    return () => clearTimeout(timer);
  }, [currentPlaceholder, isDeleting, placeholderIndex, placeholders]);

  // ── Keyboard shortcut listener ──
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Since modal control is managed by navbar.jsx, we let normal click launch it.
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Search API call
  useEffect(() => {
    const searchContent = async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const catFilter = activeCategory !== 'all' ? `&type=${activeCategory}` : '';
        const response = await apiCall(`/search?q=${encodeURIComponent(debouncedQuery)}&limit=10${catFilter}`);
        setResults(response.results || []);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    searchContent();
  }, [debouncedQuery, activeCategory]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [results]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex(prev => prev > -1 ? prev - 1 : -1);
      } else if (event.key === 'Enter' && selectedIndex >= 0) {
        event.preventDefault();
        handleResultClick(results[selectedIndex].path);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose, results, selectedIndex]);

  const handleResultClick = (path) => {
    onClose();
    navigate(path);
  };

  const quickActions = [
    { title: "Launch Linux Forensics", path: "/labs", category: "lab", icon: <Terminal className="w-4 h-4 text-cyan-400" /> },
    { title: "Resume Malware Analysis", path: "/labs", category: "lab", icon: <Cpu className="w-4 h-4 text-orange-500" /> },
    { title: "Open Web Exploitation Path", path: "/rooms", category: "room", icon: <Shield className="w-4 h-4 text-emerald-400" /> },
    { title: "View Global Leaderboard", path: "/leaderboard", category: "ops", icon: <Trophy className="w-4 h-4 text-yellow-500" /> },
    { title: "Start Sandbox Environment", path: "/labs", category: "lab", icon: <Globe className="w-4 h-4 text-purple-400" /> },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-md z-[1000] flex justify-center pt-24 px-4" 
        onClick={onClose}
      >
        {/* Subtle Horizontal scanning sweep across fullscreen overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#00d1ff]/5 to-transparent opacity-20" />

        <motion.div 
          initial={{ opacity: 0, y: -40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.98 }}
          transition={{ duration: 0.4, cubicBezier: [0.16, 1, 0.3, 1] }}
          className="bg-[#080d19]/95 border border-[#00d1ff]/20 rounded-xl max-w-2xl w-full h-fit shadow-2xl relative overflow-hidden corner-brackets"
          onClick={(e) => e.stopPropagation()}
          style={{
            boxShadow: "0 10px 50px rgba(0, 209, 255, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)"
          }}
        >
          {/* Scanline Sweep inside the console panel */}
          <div className="absolute inset-0 bg-linear-scanlines pointer-events-none opacity-20" />

          {/* Search Input Bar */}
          <div className="flex items-center border-b border-white/[0.08] p-5 bg-[#090e1a]/95 relative z-10">
            <Search className="w-5 h-5 text-cyan-400 mr-4 shrink-0" style={{ filter: "drop-shadow(0 0 4px #00d1ff)" }} />
            <input
              type="text"
              autoFocus
              placeholder={currentPlaceholder}
              className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none font-mono text-sm leading-relaxed"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            
            {/* Shortcut helper */}
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-white/[0.04] border border-white/[0.08] rounded-md text-[9px] font-mono text-slate-500 uppercase mr-4 tracking-widest shrink-0">
              <Key size={10} /><span>ESC</span>
            </div>

            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Real-time Status Bar Below Input */}
          <div className="flex items-center gap-6 px-6 py-2.5 bg-black/40 border-b border-white/[0.06] font-mono text-[9px] text-slate-500 tracking-wider">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span>154 OPERATORS ONLINE</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>12 ACTIVE SANDBOX LABS</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              <span>4 ACTIVE CTR MISSIONS</span>
            </div>
          </div>

          {/* Categories Filter Pills */}
          <div className="flex flex-wrap gap-2 px-6 pt-5 pb-3 bg-[#080d19] border-b border-white/[0.04] relative z-10">
            {['all', 'lab', 'room', 'user'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all ${
                  activeCategory === cat 
                    ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400 font-bold shadow-[0_0_8px_rgba(0,209,255,0.15)]' 
                    : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                {cat === 'all' ? 'All Assets' : cat === 'lab' ? 'Labs' : cat === 'room' ? 'Rooms' : 'Operators'}
              </button>
            ))}
          </div>

          {/* Command Console Screen Body */}
          <div className="max-h-96 overflow-y-auto bg-[#070b16] relative z-10">
            {loading && (
              <div className="flex flex-col items-center justify-center py-16 gap-3 font-mono">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" style={{ filter: "drop-shadow(0 0 6px #00d1ff)" }} />
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">Compiling database assets...</span>
              </div>
            )}
            
            {/* Search Results Display */}
            {!loading && query && results.length > 0 && (
              <div className="p-3 flex flex-col gap-2">
                {results.map((item, index) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleResultClick(item.path)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center justify-between p-3.5 rounded-lg cursor-pointer border transition-all duration-300 group ${
                      selectedIndex === index 
                        ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_12px_rgba(0,209,255,0.15)]' 
                        : 'bg-white/[0.01] border-white/[0.04] hover:border-white/[0.1]'
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="p-2 bg-white/[0.02] border border-white/[0.08] rounded-md shrink-0">
                        {getIcon(item.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-mono text-xs font-bold truncate">{item.title}</span>
                          {item.isPremium && <Crown className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />}
                        </div>
                        {item.description && (
                          <p className="text-[11px] text-slate-400 truncate leading-snug">{item.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1.5 font-mono text-[9px]">
                          {item.difficulty && (
                            <span className={`px-2 py-0.5 rounded border uppercase tracking-widest ${
                              item.difficulty === 'Beginner' ? 'border-green-500/20 text-green-400 bg-green-500/10' :
                              item.difficulty === 'Intermediate' ? 'border-yellow-500/20 text-yellow-400 bg-yellow-500/10' :
                              item.difficulty === 'Advanced' ? 'border-red-500/20 text-red-400 bg-red-500/10' :
                              'border-red-700/20 text-red-600 bg-red-700/10'
                            }`}>
                              {item.difficulty}
                            </span>
                          )}
                          {item.category && (
                            <span className="text-slate-500 uppercase">{item.category}</span>
                          )}
                          {item.points && (
                            <span className="text-cyan-400 font-bold">+{item.points} PTS</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pl-4">
                      <span className="text-[9px] font-mono text-slate-600 uppercase group-hover:text-cyan-400 transition-colors">EXECUTE</span>
                      <CornerDownLeft className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Empty results state */}
            {!loading && query && results.length === 0 && query.length >= 2 && (
              <div className="text-center py-12 font-mono">
                <AlertTriangle className="w-10 h-10 text-orange-500 mx-auto mb-3 animate-pulse" />
                <p className="text-slate-400 text-sm">NO OPERATIONAL ASSETS LOCATED</p>
                <p className="text-[10px] text-slate-500 mt-1 max-w-[280px] mx-auto">Vulnerability databases return null. Refine your query keywords.</p>
              </div>
            )}
            
            {/* Quick Actions (Console Welcome State) */}
            {!query && (
              <div className="p-5 flex flex-col gap-4">
                <div className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase px-1">
                  ⚔️ Quick Terminal Intercepts
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {quickActions.map((act, i) => (
                    <div
                      key={i}
                      onClick={() => handleResultClick(act.path)}
                      className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.04] hover:border-[#00d1ff]/30 rounded-xl cursor-pointer hover:translate-y-[-2px] transition-all"
                    >
                      <div className="p-2 bg-white/[0.03] border border-white/[0.08] rounded-lg">
                        {act.icon}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-bold text-white">{act.title}</span>
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">{act.category} operation</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col items-center justify-center border-t border-white/[0.04] pt-8 pb-4 text-center">
                  <div className="relative w-12 h-12 flex items-center justify-center mb-3">
                    <div className="absolute inset-0 border border-cyan-400/20 rounded-full animate-ping" />
                    <Search className="w-6 h-6 text-cyan-400" />
                  </div>
                  <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">Search the CyberVerse network</p>
                  <p className="text-[10px] text-slate-500 mt-1 max-w-[320px]">Input keywords to index virtual classrooms, active sandbox servers, and operator certificates.</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SearchModal;
