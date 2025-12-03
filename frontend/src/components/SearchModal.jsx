import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, FileText, MessageSquare, User, CornerDownLeft, Loader2, Crown } from 'lucide-react';
import { apiCall } from '../config/api';
import { useDebounce } from '../hooks/useDebounce';

const getIcon = (type) => {
  switch (type) {
    case 'lab': return <FileText className="w-4 h-4 text-muted" />;
    case 'room': return <MessageSquare className="w-4 h-4 text-muted" />;
    case 'user': return <User className="w-4 h-4 text-muted" />;
    default: return <FileText className="w-4 h-4 text-muted" />;
  }
};

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(query, 300);

  // Search API call
  useEffect(() => {
    const searchContent = async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await apiCall(`/search?q=${encodeURIComponent(debouncedQuery)}&limit=10`);
        setResults(response.results || []);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    searchContent();
  }, [debouncedQuery]);

  // Reset search when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-center pt-20" onClick={onClose}>
      <div className="bg-panel w-full max-w-lg rounded-lg border border-card-border shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center border-b border-card-border p-4">
          <Search className="w-5 h-5 text-muted mr-3" />
          <input
            type="text"
            autoFocus
            placeholder="Search for labs, rooms, users..."
            className="w-full bg-transparent text-text placeholder-muted focus:outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={onClose} className="text-muted hover:text-text">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}
          
          {!loading && query && results.length > 0 && (
            <div className="p-2">
              {results.map((item, index) => (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleResultClick(item.path)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors group ${
                    selectedIndex === index ? 'bg-primary/20 border border-primary/30' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getIcon(item.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium truncate">{item.title}</span>
                        {item.isPremium && <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                      </div>
                      {item.description && (
                        <p className="text-sm text-slate-400 truncate mt-1">{item.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1">
                        {item.difficulty && (
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            item.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                            item.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {item.difficulty}
                          </span>
                        )}
                        {item.category && (
                          <span className="text-xs text-slate-500">{item.category}</span>
                        )}
                        {item.points && (
                          <span className="text-xs text-blue-400">{item.points} pts</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <CornerDownLeft className="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors flex-shrink-0" />
                </div>
              ))}
            </div>
          )}
          
          {!loading && query && results.length === 0 && query.length >= 2 && (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No results found for "{query}"</p>
              <p className="text-sm text-slate-500 mt-1">Try different keywords or check spelling</p>
            </div>
          )}
          
          {!query && (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Search for rooms, labs, and more</p>
              <p className="text-sm text-slate-500 mt-1">Type at least 2 characters to start searching</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;