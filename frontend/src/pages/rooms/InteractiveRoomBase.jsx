import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, ArrowRight, Zap, Award, Trophy, CheckCircle, Lock,
  FileWarning, HelpCircle, AlertTriangle, RefreshCw, X,
  Network, CodeXml, Target, ShieldCheck, BrainCircuit, Timer, Crown, Footprints, ChevronDown
} from "lucide-react";
import { KnowledgeCheck, ContentBlock } from "../../components/rooms/InteractiveRoomComponents";
import ReplayModal from "../../components/rooms/ReplayModal";
import { getRoomProgress, joinRoom, submitExercise, completeRoom } from "../../services/roomProgress";
import "../../components/rooms/AnimationBox.css";
import { useApp } from "../../contexts/app-context";
import { useRealtime } from "../../contexts/realtime-context";
import axios from "../../api/axios";
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
  const [activeTask, setActiveTask] = useState(null);
  const [shuffledTaskOrder, setShuffledTaskOrder] = useState([]);
  const [taskProgress, setTaskProgress] = useState({});
  const [questionAnswers, setQuestionAnswers] = useState({});
  const [questionStatus, setQuestionStatus] = useState({});
  const [showHint, setShowHint] = useState({});
  const [showAnswer, setShowAnswer] = useState({});
  const [earnedXP, setEarnedXP] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState([]);

  const shuffledTasks = useMemo(() => {
    if (!data.tasks) return [];
    const tasksWithIdx = data.tasks.map((t, idx) => ({ ...t, originalIndex: idx }));
    if (shuffledTaskOrder && shuffledTaskOrder.length === data.tasks.length) {
      return shuffledTaskOrder.map(idx => tasksWithIdx[idx]).filter(Boolean);
    }
    return tasksWithIdx;
  }, [data.tasks, shuffledTaskOrder]);
  const [showBadgeToast, setShowBadgeToast] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [roomBadgeReward, setRoomBadgeReward] = useState(null);
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
  const quizBonusXP  = data.quizBonusXP || 50;

  // Keep earnedXPRef in sync with earnedXP state
  useEffect(() => { earnedXPRef.current = earnedXP; }, [earnedXP]);

  // Scroll to active task when it opens
  useEffect(() => {
    if (activeTask !== null) {
      // Delay specifically to wait for the previous task to collapse (0.4s transition)
      // This prevents the "moving floor" problem where the scroll target shifts.
      const timer = setTimeout(() => {
        const el = document.getElementById(`task-item-${activeTask}`);
        if (el) {
          const yOffset = -70; // Header offset
          const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 450); 
      return () => clearTimeout(timer);
    }
  }, [activeTask]);

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
            const freshProgRes = await getRoomProgress(roomId);
            if (freshProgRes.success && freshProgRes.progress) {
              if (freshProgRes.progress.shuffledTaskOrder) {
                setShuffledTaskOrder(freshProgRes.progress.shuffledTaskOrder);
              }
            }
            setLoading(false);
            return;
          }

          if (prog.shuffledTaskOrder) {
            setShuffledTaskOrder(prog.shuffledTaskOrder);
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
          const freshProgRes = await getRoomProgress(roomId);
          if (freshProgRes.success && freshProgRes.progress) {
            if (freshProgRes.progress.shuffledTaskOrder) {
              setShuffledTaskOrder(freshProgRes.progress.shuffledTaskOrder);
            }
          }
        }
      } catch (err) {
        console.error("Failed to sync room progress:", err);
      } finally {
        // Also fetch badge reward info for this room
        try {
          const res = await axios.get(`/rooms/${roomId}`);
          if (res.data?.success && res.data?.data?.badgeReward) {
            setRoomBadgeReward(res.data.data.badgeReward);
          }
        } catch (e) {
          console.error("Failed to fetch room badge reward:", e);
        }
        setLoading(false);
      }
    };

    initRoom();
  }, [roomId, data.tasks, badges, data.totalXP]);

  const task = activeTask !== null ? shuffledTasks[activeTask] : null;
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
        // Find the specific task index from the data
        const currentTask = task; 
        if (!currentTask) return;

        // Check if ALL questions on this task are now correct using the updated status
        const allAnswered = currentTask.questions.every(q =>
          updatedStatus[q.id] === 'correct'
        );

        if (allAnswered) {
          const taskId  = currentTask.id;
          const taskIdx = currentTask.originalIndex;

          setTaskProgress(prev => ({ ...prev, [taskId]: 'completed' }));
          setEarnedXP(prev => prev + currentTask.xp);

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
    setActiveTask(prev => prev === idx ? null : idx);
    // Optional: add scroll logic for opening
  };

  const handleQuizSubmit = () => {
    const results = quiz.map(q => ({
      questionId: q.id,
      correct: quizAnswers[q.id] === q.correctAnswer
    }));
    const correctCount = results.filter(r => r.correct).length;
    const percentage = Math.round((correctCount / quiz.length) * 100);
    const passed = percentage >= 70;
    const bonusXP = passed ? quizBonusXP : 0;

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

      {/* ── TOP NAV ── */}
      <nav className="irb-topnav">
        <div className="irb-topnav-inner">
          <div className="irb-topnav-left">
            <button onClick={() => navigate('/rooms')} className="irb-back-btn"><ArrowLeft size={16} /> <span>Exit</span></button>
            <div className="irb-topnav-divider" />
            <span className="irb-room-name">{data.title}</span>
          </div>
          <div className="irb-topnav-center">
            <div className="irb-prog-header"><span>Progress</span><span>{Math.round(progressPct)}%</span></div>
            <div className="irb-prog-track"><div className="irb-prog-fill" style={{ width: `${progressPct}%` }} /></div>
          </div>
          <div className="irb-topnav-right">
            <div className="irb-xp-chip"><Zap size={13} />{earnedXP} XP</div>
            <div className="irb-badge-chip"><Award size={13} />{earnedBadges.length}</div>
            {allTasksCompleted && quizSubmitted && quizResults?.passed && (
              <button className="irb-replay-btn" onClick={() => setShowReplayModal(true)} title="Replay this room">
                <RefreshCw size={14} />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ── SINGLE-COLUMN CONTENT ── */}
      <div className="irb-main" ref={contentRef}>
        {/* Replay banner */}
        {showReplayBanner && (
          <div className="rpl-banner">
            <div className="rpl-banner-icon"><RefreshCw size={16} /></div>
            <div className="rpl-banner-text">
              <div className="rpl-banner-title">Room progress has been reset. You can replay this room.</div>
              <div className="rpl-banner-sub">Your XP, badges, and leaderboard rank are fully preserved.</div>
            </div>
            <button className="rpl-banner-dismiss" onClick={() => setShowReplayBanner(false)} aria-label="Dismiss"><X size={14} /></button>
          </div>
        )}

        {/* ── TARGET/EARNED BADGE ── */}
        {roomBadgeReward && (
          <div className={`p-4 mb-6 rounded-xl border flex items-center justify-between rdp-fade-in ${allTasksCompleted && quizSubmitted && quizResults?.passed ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-amber-500/20 bg-amber-500/5'}`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg border flex items-center justify-center shadow-inner relative overflow-hidden ${allTasksCompleted && quizSubmitted && quizResults?.passed ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' : 'bg-[#0b121e] border-slate-700 text-amber-500'}`}>
                <div className={`absolute inset-0 ${allTasksCompleted && quizSubmitted && quizResults?.passed ? 'bg-emerald-500/10' : 'bg-amber-500/10 animate-pulse'}`} />
                <Award size={24} className="relative z-10" />
              </div>
              <div>
                <h4 className={`text-xs font-black uppercase tracking-wider mb-1 ${allTasksCompleted && quizSubmitted && quizResults?.passed ? 'text-emerald-400' : 'text-white'}`}>
                  {allTasksCompleted && quizSubmitted && quizResults?.passed ? "Earned Achievement: " : "Target Achievement: "} 
                  <span className={allTasksCompleted && quizSubmitted && quizResults?.passed ? 'text-emerald-400' : 'text-amber-500'}>{roomBadgeReward.name}</span>
                </h4>
                <p className="text-[10px] text-slate-400">
                  {roomBadgeReward.description}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="px-2 py-1 rounded bg-slate-900/50 text-[10px] font-black text-amber-500 uppercase tracking-widest border border-white/5 inline-block">
                +{roomBadgeReward.xpReward} XP Reward
              </div>
              <div className="text-[9px] text-slate-500 uppercase font-bold mt-2 tracking-widest">
                Rarity: {roomBadgeReward.difficulty}
              </div>
            </div>
          </div>
        )}

        {/* ── ACCORDION TASK SYSTEM ── */}
        {showQuiz ? (
          /* ── QUIZ VIEW ── */
          <div className="irb-card irb-fade-in">
            <div className="irb-card-header">
              <Trophy size={16} style={{ color: '#F59E0B' }}/>
              <span>Mission Assessment</span>
              <span className="irb-q-answered">{Object.keys(quizAnswers).length}/{quiz.length} answered</span>
              <button onClick={() => setShowQuiz(false)} className="irb-back-link">← Back to Tasks</button>
            </div>
            <div className="irb-card-body">
              <div className="irb-quiz-meta">
                <span className="irb-pill" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>{quiz.length} Questions</span>
                {quizBonusXP > 0 && (
                  <span className="irb-pill" style={{ background: 'rgba(0,245,255,0.08)', color: '#00F5FF', border: '1px solid rgba(0,245,255,0.2)' }}><Zap size={12}/> +{quizBonusXP} XP Bonus</span>
                )}
                <span className="irb-pill" style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>70% to Pass</span>
              </div>
              {quiz.map((q, qi) => (
                <div key={q.id} className={`irb-quiz-question ${quizSubmitted ? (quizResults.results.find(r => r.questionId === q.id).correct ? 'irb-quiz-question--correct' : 'irb-quiz-question--incorrect') : ''}`}>
                  <p className="irb-quiz-q-text"><span className="irb-quiz-q-num">{qi + 1}.</span> {q.question}</p>
                  <div className="irb-quiz-options">
                    {q.options.map((opt, oi) => (
                      <label key={oi} className={`irb-quiz-option ${quizAnswers[q.id] === opt ? 'irb-quiz-option--selected' : ''} ${quizSubmitted ? 'irb-quiz-option--locked' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers(prev => ({ ...prev, [q.id]: opt }))}>
                        <div className={`irb-radio ${quizAnswers[q.id] === opt ? 'irb-radio--active' : ''}`}>{quizAnswers[q.id] === opt && <div className="irb-radio-dot" />}</div>
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                  {quizSubmitted && (
                    <div className={`irb-q-feedback ${quizResults.results.find(r => r.questionId === q.id).correct ? 'irb-q-feedback--correct' : 'irb-q-feedback--incorrect'}`}>
                      {quizResults.results.find(r => r.questionId === q.id).correct ? <CheckCircle size={14} /> : <X size={14} />}
                      <div><strong>{quizResults.results.find(r => r.questionId === q.id).correct ? 'Correct!' : 'Incorrect'}</strong><p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: '11px' }}>{q.explanation}</p></div>
                    </div>
                  )}
                </div>
              ))}
              {!quizSubmitted ? (
                <button onClick={handleQuizSubmit} disabled={Object.keys(quizAnswers).length < quiz.length} className="irb-submit-quiz">Submit Assessment</button>
              ) : (
                <div className={`irb-quiz-result ${quizResults.passed ? 'irb-quiz-result--pass' : 'irb-quiz-result--fail'}`}>
                  <div className="irb-quiz-result-icon">{quizResults.passed ? <Trophy size={36} /> : <AlertTriangle size={36} />}</div>
                  <h2>{quizResults.passed ? 'MISSION SUCCESSFUL' : 'MISSION FAILED'}</h2>
                  <p className="irb-quiz-result-pct">{quizResults.percentage}% Success Rate</p>
                  {quizResults.passed ? (
                    <button onClick={() => navigate('/rooms')} className="irb-result-action irb-result-action--pass"><Trophy size={16} /> Return to Rooms</button>
                  ) : (
                    <button onClick={handleRetakeQuiz} className="irb-result-action irb-result-action--fail"><RefreshCw size={16} /> Retake</button>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="irb-accordion-container">
            {shuffledTasks.map((t, i) => {
              const isActive = activeTask === i;
              const isCompleted = taskProgress[t.id] === 'completed';
              
              return (
                <div key={t.id} id={`task-item-${i}`} className={`irb-task-item ${isActive ? 'irb-task-item--active' : ''} ${isCompleted ? 'irb-task-item--completed' : ''}`}>
                  <div className="irb-task-item-header" onClick={() => switchTask(i)}>
                    <div className="irb-task-item-header-left">
                      <div className="irb-task-item-number">
                        {isCompleted ? <CheckCircle size={16} /> : <span>{i + 1}</span>}
                      </div>
                      <div className="irb-task-item-info">
                        <h3 className="irb-task-item-title">{t.title}</h3>
                        <span className="irb-task-item-subtitle">{t.subtitle}</span>
                      </div>
                    </div>
                    <div className="irb-task-item-header-right">
                      {isCompleted && <span className="irb-pill irb-pill--done" style={{ margin: 0 }}><CheckCircle size={12}/> Done</span>}
                      <span className="irb-task-item-xp">+{t.xp} XP</span>
                      <ChevronDown className="irb-task-item-chevron" size={18} />
                    </div>
                  </div>
                  
                  <div className="irb-task-item-content">
                    <div className="irb-task-item-content-inner">
                      {/* Scenario */}
                      {t.scenario && (
                        <div className="irb-scenario">
                          <div className="irb-scenario-header"><FileWarning size={14} /> <span>Mission Scenario</span></div>
                          <h4>{t.scenario.title}</h4><p>{t.scenario.text}</p>
                          {t.scenario.impact && <div className="irb-scenario-impact"><AlertTriangle size={14} /> <span>{t.scenario.impact}</span></div>}
                        </div>
                      )}

                      {/* Animation */}
                      {getAnimation(t.id) && (
                        <div className="irb-anim-section">{getAnimation(t.id)}</div>
                      )}

                      {/* Learning Content */}
                      <div className="irb-card">
                        <div className="irb-card-body">
                          {t.content.map((block, bIdx) => (
                            <ContentBlock key={bIdx} block={block} index={bIdx} animations={{ requestFlow: getAnimation(t.id) }} />
                          ))}
                        </div>
                      </div>

                      {/* Knowledge Check */}
                      <div className="irb-card" style={{ marginBottom: 0 }}>
                        <div className="irb-card-header"><HelpCircle size={16} /> <span>Knowledge Check</span></div>
                        <div className="irb-card-body">
                          {t.questions.map((q, qi) => (
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
                      </div>

                      {/* Inline Next Navigation */}
                      {i < shuffledTasks.length - 1 && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                          <button onClick={() => switchTask(i + 1)} className="irb-nav-bottom-btn irb-nav-bottom-btn--next">Next Task: {shuffledTasks[i+1].title} →</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Quiz Trigger Card */}
            <div 
              className={`irb-quiz-card-trigger ${!allTasksCompleted ? 'irb-quiz-card-trigger--locked' : ''}`}
              onClick={() => {
                if (allTasksCompleted) {
                  setShowQuiz(true);
                  contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
            >
              <div className="irb-quiz-card-icon"><Trophy size={40} /></div>
              <h2 className="irb-quiz-card-title">Final Assessment</h2>
              <p className="irb-quiz-card-subtitle">
                {!allTasksCompleted 
                  ? `Complete all ${data.tasks.length} tasks to unlock the final quiz.`
                  : "You've mastered the theory. Now prove your skills in the final evaluation."
                }
              </p>
              <button className="irb-quiz-card-btn" disabled={!allTasksCompleted}>
                {!allTasksCompleted ? <Lock size={14} style={{ marginRight: '8px' }} /> : <Zap size={14} style={{ marginRight: '8px' }} />}
                {allTasksCompleted ? "Start Mission Assessment" : "Locked"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Completion Modal ── */}
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

            {newlyEarnedBadges.length > 0 && (
              <div className="wpr-completion-badges">
                <div className="wpr-completion-badges-title"><Award size={14} style={{ color: '#FACC15' }} /> Badge{newlyEarnedBadges.length > 1 ? 's' : ''} Unlocked</div>
                {newlyEarnedBadges.map((badge, i) => (
                  <div key={i} className={`wpr-earned-badge wpr-earned-badge--${badge.badgeType}`} style={{ animationDelay: `${i * 0.12}s` }}>
                    <div className="wpr-earned-badge__icon-wrap"><BadgeIconInline icon={badge.icon} type={badge.badgeType} /></div>
                    <div className="wpr-earned-badge__info"><div className="wpr-earned-badge__name">{badge.name}</div><div className="wpr-earned-badge__reason">{badge.unlockReason || 'Awarded for completing this room'}</div></div>
                    {badge.xpReward > 0 && <div className="wpr-earned-badge__xp">+{badge.xpReward} XP</div>}
                  </div>
                ))}
              </div>
            )}
            <div className="wpr-completion-actions">
              <button onClick={() => navigate('/rooms')} className="wpr-nav-btn wpr-nav-prev" style={{ flex: 1, justifyContent: 'center' }}>To Archive</button>
              <button onClick={() => navigate('/dashboard')} className="wpr-nav-btn wpr-nav-next" style={{ flex: 1, justifyContent: 'center', background: '#FACC15', color: '#000' }}>Dashboard</button>
            </div>
            <button onClick={() => { setShowCompletionModal(false); setShowReplayModal(true); }} className="wpr-nav-btn" style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#F59E0B' }}>
              <RefreshCw size={14} /> Replay Room
            </button>
          </div>
        </div>
      )}

      {showReplayModal && (
        <ReplayModal roomId={roomId} roomTitle={data.title} onConfirm={handleReplayConfirm} onClose={() => setShowReplayModal(false)} />
      )}
    </div>
  );
};

export default InteractiveRoomBase;
