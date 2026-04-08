import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, ArrowRight, Zap, Award, Trophy, CheckCircle, Clock, Users, Star, Lock,
  FileWarning, Radio, HelpCircle, AlertTriangle, RefreshCw, X,
  Network, CodeXml, Target, ShieldCheck, BrainCircuit, Timer, Crown, Footprints
} from "lucide-react";
import { KnowledgeCheck, ContentBlock } from "../../components/rooms/InteractiveRoomComponents";
import ReplayModal from "../../components/rooms/ReplayModal";
import { getRoomProgress, joinRoom, submitExercise, completeRoom } from "../../services/roomProgress";
import "../../components/rooms/AnimationBox.css";
import { useApp } from "../../contexts/app-context";
import { useRealtime } from "../../contexts/realtime-context";
import "./RoomModule.css";

/* ── Inline badge icon renderer — maps icon string to Lucide component ── */
const BADGE_ICON_MAP = {
  'network':       <Network size={16} />,
  'code-xml':      <CodeXml size={16} />,
  'target-lock':   <Target size={16} />,
  'shield-check':  <ShieldCheck size={16} />,
  'brain-circuit': <BrainCircuit size={16} />,
  'timer':         <Timer size={16} />,
  'crown':         <Crown size={16} />,
  'footprints':    <Footprints size={16} />,
  'zap':           <Zap size={16} />,
};

const BadgeIconInline = ({ icon, type }) => {
  const COLOR = type === 'bonus' ? '#FACC15' : type === 'milestone' ? '#8B5CF6' : '#00F5FF';
  const el = BADGE_ICON_MAP[icon] || <ShieldCheck size={16} />;
  return (
    <div className="wpr-badge-icon-inline" style={{ '--bic': COLOR }}>
      {React.cloneElement(el, { color: COLOR })}
    </div>
  );
};

const InteractiveRoomBase = ({ 
  data, 
  badges, 
  quiz, 
  getAnimation,
  getIcon
}) => {
  const navigate = useNavigate();
  const { user, refreshUser } = useApp();
  const { refreshUserStats, applyUpdate } = useRealtime();
  const [activeTask, setActiveTask] = useState(0);
  const [taskProgress, setTaskProgress] = useState({});
  const [questionAnswers, setQuestionAnswers] = useState({});
  const [questionStatus, setQuestionStatus] = useState({});
  const [showHint, setShowHint] = useState({});
  const [showAnswer, setShowAnswer] = useState({});
  const [earnedXP, setEarnedXP] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [showBadgeToast, setShowBadgeToast] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [loading, setLoading] = useState(true);
  // ── Replay state ──
  const [showReplayModal, setShowReplayModal]   = useState(false);
  const [showReplayBanner, setShowReplayBanner] = useState(false);
  const [isReplayMode, setIsReplayMode]         = useState(false);
  // ── Badge state ──
  const [newlyEarnedBadges, setNewlyEarnedBadges] = useState([]);
  const [hintsUsed, setHintsUsed]               = useState(false);
  const contentRef  = useRef(null);
  const earnedXPRef = useRef(0); // tracks live XP to avoid stale closure in handleQuizSubmit

  const roomId       = data.id || data.slug;
  const roomCategory = data.category || 'Misc';

  // Keep earnedXPRef in sync with earnedXP state
  useEffect(() => { earnedXPRef.current = earnedXP; }, [earnedXP]);

  // Sync with backend on mount
  useEffect(() => {
    const initRoom = async () => {
      if (!roomId) return;
      setLoading(true);
      try {
        // Calculate total possible XP from tasks if not explicitly provided
        const calculatedTotalXP = data.tasks?.reduce((sum, t) => sum + (t.xp || 0), 0) || 0;
        
        // 1. Get current progress
        const progressRes = await getRoomProgress(roomId);
        
        if (progressRes.success && progressRes.progress) {
          const prog = progressRes.progress;

          // Detect stale record: quizCompleted stuck true but room never completed
          // This happens from the old buggy backend. Treat it as a fresh start.
          const isStaleRecord =
            prog.quizCompleted === true &&
            prog.completed !== true &&
            (prog.completedLectures?.length || 0) === 0;

          if (!prog.joined || isStaleRecord) {
            // Not joined yet, or stale record — join fresh
            await joinRoom(roomId);
            console.log(`📡 Joined room: ${roomId}${isStaleRecord ? ' (cleared stale record)' : ''}`);
            setLoading(false);
            return;
          }

          // Detect replay mode: joined but nothing completed yet after a previous completion
          if (prog.replayCount > 0 && !prog.completed && prog.completedLectures?.length === 0) {
            setIsReplayMode(true);
            setShowReplayBanner(true);
          }

          // Map backend task progress to local state
          const newProgress = {};
          let currentXP = 0;
          if (prog.completedLectures) {
            prog.completedLectures.forEach(idx => {
              if (data.tasks[idx]) {
                newProgress[data.tasks[idx].id] = 'completed';
                currentXP += data.tasks[idx].xp || 0;
              }
            });
          }
          setTaskProgress(newProgress);
          
          // If already completed, show full XP or existing completion data
          if (prog.completed) {
            setEarnedXP(data.totalXP || calculatedTotalXP);
            setEarnedBadges(badges.map(b => b.id));
          } else {
            setEarnedXP(currentXP);
          }
        } else {
          // No progress record at all — join fresh
          await joinRoom(roomId);
          console.log(`📡 Joined room: ${roomId}`);
        }
      } catch (err) {
        console.error("Failed to sync room progress:", err);
      } finally {
        setLoading(false);
      }
    };

    initRoom();
  }, [roomId, data.tasks, badges, data.totalXP]);

  const task = data.tasks[activeTask];
  const completedCount = useMemo(() => 
    Object.keys(taskProgress).filter(k => taskProgress[k] === 'completed').length,
    [taskProgress]
  );
  const totalComponents = (data.tasks?.length || 0) + (quiz?.length > 0 ? 1 : 0);
  const completedComponents = completedCount + (quizSubmitted && quizResults?.passed ? 1 : 0);
  const progressPct = totalComponents > 0 ? (completedComponents / totalComponents) * 100 : 0;

  const handleCheckAnswer = (questionId, acceptableAnswers) => {
    const userAnswer = (questionAnswers[questionId] || '').trim().toLowerCase();
    const isCorrect = acceptableAnswers.some(a => userAnswer.includes(a.toLowerCase()));

    // Update status synchronously in a local variable so we can use it immediately
    const updatedStatus = { ...questionStatus, [questionId]: isCorrect ? 'correct' : 'incorrect' };
    setQuestionStatus(updatedStatus);

    if (isCorrect) {
      // Check if ALL questions on this task are now correct using the updated status
      const allAnswered = task.questions.every(q =>
        updatedStatus[q.id] === 'correct'
      );

      if (allAnswered) {
        const taskId  = task.id;
        const taskIdx = activeTask;

        setTaskProgress(prev => ({ ...prev, [taskId]: 'completed' }));
        setEarnedXP(prev => prev + task.xp);

        // Persist task completion to backend
        submitExercise(roomId, taskIdx, 'COMPLETED', task.xp).then((res) => {
          if (res?.userStats) {
            if (typeof applyUpdate === 'function') applyUpdate(res.userStats);
          }
          if (typeof refreshUser === 'function') refreshUser();
        }).catch(err => {
          console.error('Backend sync failed for task:', err);
        });

        refreshUserStats();

        // Local sidebar badge unlock
        if (task.id <= badges.length) {
          const badge = badges[task.id - 1];
          if (badge && !earnedBadges.includes(badge.id)) {
            setEarnedBadges(prev => [...prev, badge.id]);
            setShowBadgeToast(badge);
            setTimeout(() => setShowBadgeToast(null), 3000);
          }
        }
      }
    }
  };

  const switchTask = (idx) => {
    setShowQuiz(false);
    setActiveTask(idx);
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuizSubmit = () => {
    const results = quiz.map(q => ({
      questionId: q.id,
      correct: quizAnswers[q.id] === q.correctAnswer
    }));
    const correctCount = results.filter(r => r.correct).length;
    const percentage = Math.round((correctCount / quiz.length) * 100);
    const passed = percentage >= 70;
    const bonusXP = passed ? 500 : 0;

    setQuizResults({ results, percentage, passed, earnedPoints: bonusXP });
    setQuizSubmitted(true);

    if (passed) {
      setEarnedXP(prev => prev + bonusXP);

      // Use ref to get the live XP value — state is stale inside this closure
      const totalXPNow = earnedXPRef.current + bonusXP;
      completeRoom(roomId, percentage, totalXPNow, data.tasks.length, roomCategory, !hintsUsed, percentage === 100).then(res => {
          if (res.userStats) {
              if (typeof applyUpdate === 'function') applyUpdate(res.userStats);
              else refreshUserStats();
              if (typeof refreshUser === 'function') refreshUser();
          }
          // Capture newly awarded badges for the completion modal
          if (res.newBadges?.length > 0) {
            setNewlyEarnedBadges(res.newBadges);
          }
          // Dispatch global event so Dashboard + Leaderboard update instantly
          window.dispatchEvent(new CustomEvent('roomCompleted', {
            detail: { roomId, points: totalXPNow }
          }));
          if (window.triggerRealtimeUpdate) window.triggerRealtimeUpdate();
      }).catch(err => {
          console.error("Final room completion sync failed:", err);
          window.dispatchEvent(new CustomEvent('roomCompleted', {
            detail: { roomId, points: totalXPNow }
          }));
      });

      setTimeout(() => setShowCompletionModal(true), 1500);
    }
  };

  const handleRetakeQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizResults(null);
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const allTasksCompleted = completedCount === data.tasks.length;

  // ── Replay: called by ReplayModal after backend reset succeeds ──
  const handleReplayConfirm = useCallback(() => {
    // Reset all local UI state to a clean slate
    setTaskProgress({});
    setQuestionAnswers({});
    setQuestionStatus({});
    setShowHint({});
    setShowAnswer({});
    setEarnedXP(0);
    earnedXPRef.current = 0;
    setShowQuiz(false);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizResults(null);
    setShowCompletionModal(false);
    setActiveTask(0);
    setIsReplayMode(true);
    setShowReplayBanner(true);
    setShowReplayModal(false);
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="wpr-root">
      <div className="wpr-bg-grid" />
      <div className="wpr-bg-glow" />
      
      {showBadgeToast && (
        <div className="wpr-badge-toast">
          <div className="wpr-badge-toast-icon">{showBadgeToast.icon}</div>
          <div><div className="wpr-badge-toast-title">Badge Unlocked!</div><div className="wpr-badge-toast-name">{showBadgeToast.name}</div></div>
        </div>
      )}

      <nav className="wpr-topnav">
        <div className="wpr-topnav-inner">
          <div className="wpr-topnav-left">
            <button onClick={() => navigate('/rooms')} className="wpr-back-btn"><ArrowLeft size={16} /> <span>Exit Room</span></button>
            <div className="wpr-topnav-divider" />
            <div className="wpr-topnav-info"><h4>{data.title}</h4><span>{data.category || data.tags[0]} // PROTECTED</span></div>
          </div>
          <div className="wpr-topnav-progress">
             <div className="wpr-topnav-prog-header"><span>Mission Progress</span><span className="wpr-topnav-pct">{Math.round(progressPct)}%</span></div>
             <div className="wpr-prog-track"><div className="wpr-prog-fill" style={{ width: `${progressPct}%` }} /></div>
          </div>
          <div className="wpr-topnav-right">
            <div className="wpr-xp-display"><Zap size={14} /><span>{earnedXP} <span className="wpr-xp-label">XP</span></span></div>
            <div className="wpr-badge-count"><Award size={14} /><span>{earnedBadges.length}</span></div>
            {/* Replay button — only shown once the room has been completed */}
            {allTasksCompleted && quizSubmitted && quizResults?.passed && (
              <button
                className="wpr-back-btn"
                style={{ color: '#F59E0B', borderColor: 'rgba(245,158,11,0.2)' }}
                onClick={() => setShowReplayModal(true)}
                title="Replay this room"
              >
                <RefreshCw size={14} />
                <span>Replay</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="wpr-main-layout">
        <aside className={`wpr-sidebar ${sidebarCollapsed ? 'wpr-sidebar--collapsed' : ''}`}>
           <div className="wpr-sidebar-header"><Radio size={14} /><span>Mission Control</span></div>
           <div className="wpr-task-list">
             {data.tasks.map((t, i) => (
               <button key={t.id} className={`wpr-task-item ${activeTask === i ? 'wpr-task--active' : ''} ${taskProgress[t.id] === 'completed' ? 'wpr-task--completed' : ''}`} onClick={() => switchTask(i)}>
                 <div className="wpr-task-indicator">{taskProgress[t.id] === 'completed' ? <CheckCircle size={14}/> : activeTask === i ? <div className="wpr-task-active-dot" /> : <span className="wpr-task-num">{i + 1}</span>}</div>
                 <div className="wpr-task-meta"><span className="wpr-task-name">{t.title}</span><span className="wpr-task-xp">+{t.xp} XP</span></div>
               </button>
             ))}
             {allTasksCompleted && (
                <button onClick={() => {setShowQuiz(true); contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });}} className={`wpr-task-item ${showQuiz ? 'wpr-task--active' : ''}`} style={{ marginTop: '4px' }}>
                    <div className="wpr-task-indicator" style={{ background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)' }}><Trophy size={14} style={{ color: '#F59E0B' }} /></div>
                    <div className="wpr-task-meta"><span className="wpr-task-name" style={{ color: '#F59E0B' }}>Final Quiz</span><span className="wpr-task-xp">+500 XP Bonus</span></div>
                </button>
             )}
           </div>
           <div className="wpr-sidebar-badges">
             <div className="wpr-sidebar-header"><Award size={14} /><span>Badges</span></div>
             <div className="wpr-badge-grid">{badges.map(b => (<div key={b.id} className={`wpr-badge ${earnedBadges.includes(b.id) ? 'wpr-badge--earned' : ''}`} title={b.name}><span>{b.icon}</span></div>))}</div>
           </div>
           <div className="wpr-room-stats">
             <div className="wpr-stat-row"><Users size={12} /><span>{(data.enrollments || data.participants || 0).toLocaleString()}</span></div>
             <div className="wpr-stat-row"><Clock size={12} /><span>{data.duration || data.estimatedTime}</span></div>
             <div className="wpr-stat-row"><Star size={12} /><span>{data.rating} ★</span></div>
           </div>
        </aside>

        <main className="wpr-content" ref={contentRef}>
          {/* Replay banner — shown after a successful reset */}
          {showReplayBanner && (
            <div className="rpl-banner">
              <div className="rpl-banner-icon"><RefreshCw size={16} /></div>
              <div className="rpl-banner-text">
                <div className="rpl-banner-title">Room progress has been reset. You can replay this room.</div>
                <div className="rpl-banner-sub">Your XP, badges, and leaderboard rank are fully preserved.</div>
              </div>
              <button className="rpl-banner-dismiss" onClick={() => setShowReplayBanner(false)} aria-label="Dismiss">
                <X size={14} />
              </button>
            </div>
          )}
          {showQuiz ? (
            <div className="wpr-quiz-container">
               <div className="wpr-task-hero" style={{ marginBottom: '2rem' }}>
                <div className="wpr-task-hero-img" style={{ height: '180px', background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(139,92,246,0.15))' }}>
                  <div className="wpr-task-hero-overlay" style={{ background: 'linear-gradient(to top, rgba(11,15,26,0.98), rgba(11,15,26,0.4))' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '1.5rem' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trophy size={28} style={{ color: '#F59E0B' }} /></div>
                      <div><div style={{ fontSize: '10px', fontWeight: 900, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Final Assessment</div><div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', fontFamily: "'Orbitron', sans-serif" }}>Final Knowledge Check</div></div>
                    </div>
                  </div>
                </div>
                <div className="wpr-task-hero-info">
                  <div className="wpr-task-pills"><span className="wpr-pill" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>{quiz.length} Questions</span><span className="wpr-pill wpr-pill--xp"><Zap size={12} /> +500 XP Bonus</span><span className="wpr-pill" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>70% to Pass</span></div>
                  <p className="wpr-task-subtitle">Answer all questions to prove your mastery and earn the final badge.</p>
                </div>
              </div>
              <div className="wpr-questions-section">
                <div className="wpr-questions-header"><Trophy size={20} style={{ color: '#F59E0B' }} /><h3>Final Assessment</h3><span className="wpr-q-count">{Object.keys(quizAnswers).length}/{quiz.length} answered</span></div>
                {quiz.map((q, qi) => (
                  <div key={q.id} className={`wpr-question ${quizSubmitted ? (quizResults.results.find(r => r.questionId === q.id).correct ? 'wpr-question--correct' : 'wpr-question--incorrect') : ''}`}>
                    <div className="wpr-q-header"><span className="wpr-q-num">{qi + 1}</span><p className="wpr-q-text">{q.question}</p></div>
                    <div className="wpr-quiz-options">{q.options.map((opt, oi) => (<label key={oi} className={`wpr-quiz-option ${quizAnswers[q.id] === opt ? 'wpr-quiz-option--selected' : ''} ${quizSubmitted ? 'wpr-quiz-option--locked' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers(prev => ({ ...prev, [q.id]: opt }))}><div className={`wpr-quiz-radio ${quizAnswers[q.id] === opt ? 'wpr-quiz-radio--on' : ''}`}>{quizAnswers[q.id] === opt && <div className="wpr-quiz-radio-dot" />}</div><span>{opt}</span></label>))}</div>
                    {quizSubmitted && (<div className={`wpr-q-feedback ${quizResults.results.find(r => r.questionId === q.id).correct ? 'wpr-q-feedback--correct' : 'wpr-q-feedback--incorrect'}`} style={{ marginTop: '0.75rem' }}>{quizResults.results.find(r => r.questionId === q.id).correct ? <CheckCircle size={14} /> : <X size={14} />}<div><strong>{quizResults.results.find(r => r.questionId === q.id).correct ? 'Correct!' : 'Incorrect'}</strong><p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: '11px' }}>{q.explanation}</p></div></div>)}
                  </div>
                ))}
                {!quizSubmitted ? (<button onClick={handleQuizSubmit} disabled={Object.keys(quizAnswers).length < quiz.length} className="wpr-q-submit" style={{ width: '100%', padding: '16px', borderRadius: '14px', marginTop: '1rem' }}>Submit Results</button>) : (
                  <div className={`wpr-quiz-result ${quizResults.passed ? 'wpr-quiz-result--pass' : 'wpr-quiz-result--fail'}`}>
                    <div className="wpr-quiz-result-icon">{quizResults.passed ? <Trophy size={36} /> : <AlertTriangle size={36} />}</div>
                    <h2>{quizResults.passed ? 'MISSION SUCCESSFUL' : 'MISSION FAILED'}</h2>
                    <p className="wpr-quiz-result-pct">{quizResults.percentage}% Success Rate</p>
                    {quizResults.passed ? (<button onClick={() => navigate('/rooms')} className="wpr-nav-btn wpr-nav-complete" style={{ width: '100%', justifyContent: 'center' }}><Trophy size={16} /> Return to Base</button>) : (<button onClick={handleRetakeQuiz} className="wpr-nav-btn" style={{ width: '100%', justifyContent: 'center', background: '#EF4444', color: '#fff' }}><RefreshCw size={16} /> Retake Mission</button>)}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="wpr-task-hero">
                <div className="wpr-task-hero-img">
                  <img src={task.image} alt={task.title} />
                  <div className="wpr-task-hero-overlay"><div className="wpr-task-hero-badge">{getIcon(task.icon)}<span>Task {activeTask + 1} of {data.tasks.length}</span></div></div>
                </div>
                <div className="wpr-task-hero-info">
                  <div className="wpr-task-pills"><span className="wpr-pill wpr-pill--difficulty">{task.difficulty}</span><span className="wpr-pill wpr-pill--xp"><Zap size={12} /> +{task.xp} XP</span></div>
                  <h1 className="wpr-task-title">{task.title}</h1><p className="wpr-task-subtitle">{task.subtitle}</p>
                </div>
              </div>
              {task.scenario && (
                <div className="wpr-scenario">
                  <div className="wpr-scenario-header"><FileWarning size={14} /> <span>Mission Scenario</span></div>
                  <h4>{task.scenario.title}</h4><p>{task.scenario.text}</p>
                  {task.scenario.impact && <div className="wpr-scenario-impact"><AlertTriangle size={14} /> <span>{task.scenario.impact}</span></div>}
                </div>
              )}
              {getAnimation(task.id) && (
                <div className="wpr-anim-section">
                  {getAnimation(task.id)}
                </div>
              )}
              <div className="wpr-content-body">
                {task.content.map((block, idx) => (
                  <ContentBlock 
                    key={idx} 
                    block={block} 
                    index={idx} 
                    animations={{ requestFlow: getAnimation(task.id) }} 
                  />
                ))}
              </div>
              <div className="wpr-questions-section">
                <div className="wpr-questions-header"><HelpCircle size={20} /> <h3>Knowledge Check</h3></div>
                {task.questions.map((q, qi) => (
                  <KnowledgeCheck 
                    key={q.id} 
                    question={q} 
                    index={qi} 
                    status={questionStatus[q.id]}
                    answer={questionAnswers[q.id]}
                    showHint={showHint[q.id]}
                    showAnswer={showAnswer[q.id]}
                    onAnswerChange={(qid, val) => setQuestionAnswers(prev => ({ ...prev, [qid]: val }))}
                    onCheck={handleCheckAnswer}
                    onToggleHint={(qid) => { setShowHint(prev => ({ ...prev, [qid]: !prev[qid] })); setHintsUsed(true); }}
                    onToggleAnswer={(qid) => setShowAnswer(prev => ({ ...prev, [qid]: !prev[qid] }))}
                  />
                ))}
              </div>
              <div className="wpr-nav-buttons">
                <button onClick={() => switchTask(Math.max(0, activeTask - 1))} disabled={activeTask === 0} className="wpr-nav-btn wpr-nav-prev"><ArrowLeft size={16} /> Previous</button>
                {activeTask < data.tasks.length - 1 ? (
                  <button onClick={() => switchTask(activeTask + 1)} className="wpr-nav-btn wpr-nav-next">Next Task <ArrowRight size={16} /></button>
                ) : allTasksCompleted ? (
                   <button onClick={() => {setShowQuiz(true); contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });}} className="wpr-nav-btn wpr-nav-complete"><Trophy size={16} /> Start Final Assessment</button>
                ) : (
                  <button className="wpr-nav-btn wpr-nav-complete" disabled><Lock size={16} /> Complete All Tasks</button>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {showCompletionModal && (
        <div className="wpr-completion-overlay">
          <div className="wpr-completion-modal">
            <div className="wpr-completion-glow" />
            <div className="wpr-completion-icon"><Award size={48} style={{ color: '#FACC15' }} /></div>
            <h1 className="wpr-completion-title" style={{ background: 'linear-gradient(to right, #fff, #FACC15)' }}>MISSION SUCCESS</h1>
            <p className="wpr-completion-sub">Certification criteria met. Mastery status granted for <strong>{data.title}</strong>.</p>
            <div className="wpr-completion-stats">
              <div className="wpr-completion-stat"><span>XP EARNED</span><div className="wpr-completion-stat-val">+{earnedXP}</div></div>
              <div className="wpr-completion-stat"><span>ACCURACY</span><div className="wpr-completion-stat-val">{quizResults?.percentage}%</div></div>
            </div>

            {/* Badges earned this session */}
            {newlyEarnedBadges.length > 0 && (
              <div className="wpr-completion-badges">
                <div className="wpr-completion-badges-title">
                  <Award size={14} style={{ color: '#FACC15' }} />
                  Badge{newlyEarnedBadges.length > 1 ? 's' : ''} Unlocked
                </div>
                {newlyEarnedBadges.map((badge, i) => (
                  <div
                    key={i}
                    className={`wpr-earned-badge wpr-earned-badge--${badge.badgeType}`}
                    style={{ animationDelay: `${i * 0.12}s` }}
                  >
                    <div className="wpr-earned-badge__icon-wrap">
                      <BadgeIconInline icon={badge.icon} type={badge.badgeType} />
                    </div>
                    <div className="wpr-earned-badge__info">
                      <div className="wpr-earned-badge__name">{badge.name}</div>
                      <div className="wpr-earned-badge__reason">
                        {badge.unlockReason || 'Awarded for completing this room'}
                      </div>
                    </div>
                    {badge.xpReward > 0 && (
                      <div className="wpr-earned-badge__xp">+{badge.xpReward} XP</div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="wpr-completion-actions">
              <button onClick={() => navigate('/rooms')} className="wpr-nav-btn wpr-nav-prev" style={{ flex: 1, justifyContent: 'center' }}>To Archive</button>
              <button onClick={() => navigate('/dashboard')} className="wpr-nav-btn wpr-nav-next" style={{ flex: 1, justifyContent: 'center', background: '#FACC15', color: '#000' }}>Dashboard</button>
            </div>
            {/* Replay option inside completion modal */}
            <button
              onClick={() => { setShowCompletionModal(false); setShowReplayModal(true); }}
              className="wpr-nav-btn"
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#F59E0B' }}
            >
              <RefreshCw size={14} /> Replay Room
            </button>
          </div>
        </div>
      )}

      {/* Replay confirmation modal */}
      {showReplayModal && (
        <ReplayModal
          roomId={roomId}
          roomTitle={data.title}
          onConfirm={handleReplayConfirm}
          onClose={() => setShowReplayModal(false)}
        />
      )}
    </div>
  );
};

export default InteractiveRoomBase;
