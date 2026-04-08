import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Shield, Zap, Trophy, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { replayRoom } from '../../services/roomProgress';

/**
 * ReplayModal
 *
 * Props:
 *   roomId      – string
 *   roomTitle   – string
 *   onConfirm   – () => void  called after backend reset succeeds
 *   onClose     – () => void
 */
const ReplayModal = ({ roomId, roomTitle, onConfirm, onClose }) => {
  // 'confirm' | 'resetting' | 'done' | 'error'
  const [phase, setPhase] = useState('confirm');
  const [resetStep, setResetStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const STEPS = [
    { label: 'Clearing task progress…',   icon: <RefreshCw size={14} /> },
    { label: 'Resetting quiz state…',      icon: <Trophy size={14} />    },
    { label: 'Preserving your XP…',        icon: <Zap size={14} />       },
    { label: 'Preserving your badges…',    icon: <Shield size={14} />    },
    { label: 'Ready to replay!',           icon: <CheckCircle size={14} /> },
  ];

  // Drive the step animation while the API call runs in parallel
  useEffect(() => {
    if (phase !== 'resetting') return;
    if (resetStep >= STEPS.length - 1) return;
    const t = setTimeout(() => setResetStep(s => s + 1), 420);
    return () => clearTimeout(t);
  }, [phase, resetStep]);

  const handleConfirm = useCallback(async () => {
    setPhase('resetting');
    setResetStep(0);
    try {
      const res = await replayRoom(roomId);
      if (!res?.success) throw new Error(res?.message || 'Reset failed');
      // Wait for animation to finish before calling onConfirm
      const remaining = (STEPS.length - 1) * 420 + 300;
      setTimeout(() => {
        setPhase('done');
        setTimeout(onConfirm, 600);
      }, remaining);
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
      setPhase('error');
    }
  }, [roomId, onConfirm]);

  // Close on backdrop click only from confirm/error phase
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget && (phase === 'confirm' || phase === 'error')) {
      onClose();
    }
  };

  return (
    <div className="rpl-overlay" onClick={handleBackdrop} role="dialog" aria-modal="true" aria-label="Replay room">
      <div className="rpl-modal">

        {/* ── Decorative glow ── */}
        <div className="rpl-glow" aria-hidden="true" />

        {/* ── PHASE: confirm ── */}
        {phase === 'confirm' && (
          <>
            <button className="rpl-close" onClick={onClose} aria-label="Cancel"><X size={16} /></button>

            <div className="rpl-icon rpl-icon--warn">
              <RefreshCw size={28} />
            </div>

            <h2 className="rpl-title">Replay Room?</h2>
            <p className="rpl-sub">
              You're about to replay <strong>{roomTitle}</strong>.
              Your task progress will be reset so you can start fresh.
            </p>

            <div className="rpl-preserved">
              <div className="rpl-preserved-title">What's preserved</div>
              <div className="rpl-preserved-grid">
                <div className="rpl-preserved-item">
                  <Zap size={13} style={{ color: '#FACC15' }} />
                  <span>All earned XP</span>
                </div>
                <div className="rpl-preserved-item">
                  <Shield size={13} style={{ color: '#8B5CF6' }} />
                  <span>All badges</span>
                </div>
                <div className="rpl-preserved-item">
                  <Trophy size={13} style={{ color: '#00F5FF' }} />
                  <span>Leaderboard rank</span>
                </div>
                <div className="rpl-preserved-item">
                  <CheckCircle size={13} style={{ color: '#39FF14' }} />
                  <span>Completion record</span>
                </div>
              </div>
            </div>

            <div className="rpl-actions">
              <button className="rpl-btn rpl-btn--cancel" onClick={onClose}>
                Cancel
              </button>
              <button className="rpl-btn rpl-btn--confirm" onClick={handleConfirm}>
                <RefreshCw size={15} />
                Yes, Replay
              </button>
            </div>
          </>
        )}

        {/* ── PHASE: resetting ── */}
        {phase === 'resetting' && (
          <>
            <div className="rpl-icon rpl-icon--spin">
              <RefreshCw size={28} className="rpl-spin" />
            </div>
            <h2 className="rpl-title">Resetting…</h2>
            <p className="rpl-sub">Preparing your fresh start</p>

            <div className="rpl-steps">
              {STEPS.map((s, i) => (
                <div
                  key={i}
                  className={`rpl-step ${i < resetStep ? 'rpl-step--done' : ''} ${i === resetStep ? 'rpl-step--active' : ''}`}
                >
                  <span className="rpl-step-icon">{s.icon}</span>
                  <span className="rpl-step-label">{s.label}</span>
                  {i < resetStep && <CheckCircle size={12} className="rpl-step-check" />}
                </div>
              ))}
            </div>

            <div className="rpl-progress-track">
              <div
                className="rpl-progress-fill"
                style={{ width: `${((resetStep + 1) / STEPS.length) * 100}%` }}
              />
            </div>
          </>
        )}

        {/* ── PHASE: done ── */}
        {phase === 'done' && (
          <>
            <div className="rpl-icon rpl-icon--success">
              <CheckCircle size={28} />
            </div>
            <h2 className="rpl-title rpl-title--success">Ready!</h2>
            <p className="rpl-sub">Room has been reset. Starting fresh…</p>
          </>
        )}

        {/* ── PHASE: error ── */}
        {phase === 'error' && (
          <>
            <button className="rpl-close" onClick={onClose} aria-label="Close"><X size={16} /></button>
            <div className="rpl-icon rpl-icon--error">
              <AlertTriangle size={28} />
            </div>
            <h2 className="rpl-title rpl-title--error">Reset Failed</h2>
            <p className="rpl-sub">{errorMsg}</p>
            <div className="rpl-actions">
              <button className="rpl-btn rpl-btn--cancel" onClick={onClose}>Close</button>
              <button className="rpl-btn rpl-btn--confirm" onClick={handleConfirm}>
                <RefreshCw size={15} /> Try Again
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default ReplayModal;
