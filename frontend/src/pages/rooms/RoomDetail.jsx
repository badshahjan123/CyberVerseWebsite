import React, { useState, useEffect, Fragment } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../../contexts/app-context";
import { getRoomBySlug } from "../../services/rooms";
import {
  getRoomProgress,
  joinRoom,
  submitExercise,
  submitQuiz,
  completeRoom,
  resetRoomProgress,
} from "../../services/roomProgress";
import { useToast } from "../../contexts/toast-context";
import { useRealtime } from "../../contexts/realtime-context";
import { useActivity } from "../../contexts/activity-context";
import {
  Play,
  Lock,
  CheckCircle,
  Clock,
  Trophy,
  Users,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Terminal,
  HelpCircle,
  Sparkles,
  Award,
  X,
  RefreshCw,
  Zap,
  Shield,
  Target,
  BookOpen,
  Crown,
  Calendar,
  Share2,
  Bookmark,
  Circle,
  CircleDot,
  Check,
  Copy
} from "lucide-react";
import { clearQuizCache } from "../../utils/clearQuizCache";
import { shuffleCompleteQuiz } from "../../utils/shuffleQuestions";

const CAT_IMG = {
  Web: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=800",
  Networking: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=800",
  Development: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=800",
  DevOps: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?auto=format&fit=crop&q=80&w=800",
  Misc: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=800",
};
const ULTIMATE_FALLBACK = "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800";

/**
 * VISUAL REPRESENTATION BLOCKS
 */

const VisualCard = ({ url, caption }) => (
  <div className="rdp-visual-card rdp-fade-in">
    <img src={url} alt={caption} className="rdp-visual-img" />
    {caption && <span className="rdp-visual-caption">{caption}</span>}
  </div>
);

const FlowDiagram = ({ steps }) => (
  <div className="rdp-flow rdp-fade-in">
    {steps.map((step, idx) => (
      <Fragment key={idx}>
        <div className="rdp-flow-step">{step}</div>
        {idx < steps.length - 1 && <ArrowRight size={16} className="rdp-flow-arrow" />}
      </Fragment>
    ))}
  </div>
);

const HierarchyTree = ({ data }) => {
  if (!data) return null;
  const renderNode = (node, idx) => (
    <div key={idx} className="rdp-tree-node">
      <div className="rdp-tree-item">
        <Target size={12} className="text-primary mr-2" />
        {node.name}
      </div>
      {node.children && node.children.length > 0 && (
        <div className="rdp-tree-children">
          {node.children.map((child, cIdx) => renderNode(child, cIdx))}
        </div>
      )}
    </div>
  );
  return <div className="rdp-tree rdp-fade-in">{renderNode(data, 0)}</div>;
};

const TerminalBlock = ({ code }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    const cleanCode = code.replace(/^\$ /gm, '');
    navigator.clipboard.writeText(cleanCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="rdp-terminal rdp-fade-in">
      <div className="rdp-terminal-head">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
        </div>
        <button onClick={handleCopy} className="rdp-copy-btn">
          {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
        </button>
      </div>
      <div className="rdp-terminal-body">
        {code.split('\n').map((line, lidx) => (
          <div key={lidx}>
            <span className="rdp-terminal-prompt">$</span>
            {line.replace(/^\$ /, '')}
          </div>
        ))}
      </div>
    </div>
  );
};

const EnhancedContentRenderer = ({ content, title }) => {
  if (!content) return null;

  const renderText = (text) => {
    if (typeof text !== 'string') return text;
    const html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-black">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-primary italic">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-primary font-mono text-[0.9em]">$1</code>');
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  };

  const blocks = content.split('\n\n');
  const items = [];
  let smartVisualInjected = false;

  // Detect Smart Visual based on task title or content keywords
  let smartVisual = null;
  const taskTitle = title?.toLowerCase() || '';
  if (taskTitle.includes('api') || taskTitle.includes('http')) {
    smartVisual = { url: '/api-flow.png', caption: 'API Request / Response Cycle' };
  } else if (taskTitle.includes('domain') || taskTitle.includes('dns') || taskTitle.includes('hierarchy')) {
    smartVisual = { url: '/domain-hierarchy.png', caption: 'Domain Hierarchy Structure' };
  }

  blocks.forEach((block, idx) => {
    const trimmed = block.trim();
    if (!trimmed) return;

    // 1. Terminal / Code Detection
    if (trimmed.startsWith('[TERMINAL]') || trimmed.startsWith('$ ')) {
      const code = trimmed.replace('[TERMINAL]', '').trim();
      items.push(<TerminalBlock key={idx} code={code} />);
      return;
    }

    // 2. Flow marker
    if (trimmed.startsWith('[FLOW]')) {
      const steps = trimmed.replace('[FLOW]', '').split('|').map(s => s.trim());
      items.push(<FlowDiagram key={idx} steps={steps} />);
      return;
    }

    // 3. Diagram marker
    if (trimmed.startsWith('[DIAGRAM]')) {
      const [url, caption] = trimmed.replace('[DIAGRAM]', '').split('|').map(s => s.trim());
      items.push(<VisualCard key={idx} url={url} caption={caption} />);
      return;
    }

    // 4. Tree marker
    if (trimmed.startsWith('[TREE]')) {
      const parts = trimmed.replace('[TREE]', '').split('|');
      const rootName = parts[0]?.trim();
      const children = parts[1]?.split(',').map(c => ({ name: c.trim() })) || [];
      items.push(<HierarchyTree key={idx} data={{ name: rootName, children }} />);
      return;
    }

    // 5. Headings (Simple detection)
    if (trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
      const cleanH = trimmed.replace(/^#+ /, '');
      items.push(<h3 key={idx} className="text-xl font-black text-white mt-8 mb-6 italic tracking-tight">{renderText(cleanH)}</h3>);
      
      // Auto-inject visual after the first heading
      if (!smartVisualInjected && smartVisual) {
        items.push(<VisualCard key={`sv-${idx}`} url={smartVisual.url} caption={smartVisual.caption} />);
        smartVisualInjected = true;
      }
      return;
    }

    // 6. Default Paragraph
    items.push(<p key={idx} className="mb-4 leading-relaxed">{renderText(trimmed)}</p>);
  });

  return <div className="rdp-prose">{items}</div>;
};



const CodeSection = ({ code, language }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="rdp-code-wrap">
      <div className="rdp-code-head">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
          </div>
          <span className="rdp-code-lang">{language || 'terminal'}</span>
        </div>
        <button onClick={handleCopy} className="rdp-copy-btn">
           {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
        </button>
      </div>
      <div className="rdp-code-body">
        <code className="rdp-code">{code}</code>
      </div>
    </div>
  );
};

const RoomDetail = () => {
  const { slug: roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useApp();
  const { userStats, applyUpdate, requestLeaderboardUpdate } = useRealtime();
  const { markRoomAccessed, resetRoomProgress: resetActivityProgress } =
    useActivity();

  // State Management
  const [room, setRoom] = useState(null);
  const [userProgress, setUserProgress] = useState({
    joined: false,
    completedTasks: [],
    taskAnswers: {},
    roomCompleted: false,
    totalXP: 0,
  });
  const [expandedTasks, setExpandedTasks] = useState([]); // Array of expanded task IDs
  const [taskAnswers, setTaskAnswers] = useState({}); // Current input values
  const [quizAnswers, setQuizAnswers] = useState({}); // Quiz answer values
  const [showQuiz, setShowQuiz] = useState(false); // Show quiz after tasks
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [submissionStatus, setSubmissionStatus] = useState({}); // { [taskId]: 'idle'|'submitting'|'success'|'error' }
  const [shuffledQuestions, setShuffledQuestions] = useState([]); // Shuffled quiz questions
  const [heroImg, setHeroImg] = useState("");

  // Handle page exit detection for resume flow
  useEffect(() => {
    const handleBeforeUnload = () => {
      // If user has progress but hasn't completed, they're exiting halfway
      if (
        userProgress.joined &&
        !userProgress.roomCompleted &&
        userProgress.completedTasks.length > 0
      ) {
        // Store exit state for resume flow
        localStorage.setItem(
          `room_exit_${roomId}`,
          JSON.stringify({
            exitedAt: new Date().toISOString(),
            progress: userProgress.completedTasks.length,
            total: room?.tasks?.length || 0,
          })
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [roomId, userProgress, room]);

  // Load room data and user progress
  useEffect(() => {
    const loadRoomData = async () => {
      try {
        // Fetch room data from API using existing service
        const roomData = await getRoomBySlug(roomId);

        // Transform backend data to match task structure
        // Backend has 'topics' field with different structure, transform to 'tasks'
        if (!roomData.tasks) {
          // Check if backend has 'topics' (new structure)
          if (roomData.topics && roomData.topics.length > 0) {
            roomData.tasks = roomData.topics.map((topic, index) => {
              // Find matching exercise by topic id, not by index
              const matchingExercise =
                roomData.exercises?.find((ex) => ex.id === topic.id) ||
                roomData.exercises?.[index];
              return {
                id: topic.id || index + 1,
                title: topic.title,
                content: topic.content_markdown || topic.content || "",
                codeSnippet: topic.codeSnippet,
                codeLanguage: topic.codeLanguage,
                hint: topic.hint,
                question:
                  matchingExercise?.description_markdown ||
                  `Complete the task for ${topic.title}`,
                answer:
                  matchingExercise?.expected_flag ||
                  matchingExercise?.answer ||
                  matchingExercise?.correctAnswer ||
                  "",
                xp: matchingExercise?.points || 100,
              };
            });
          }
          // Or check if backend has 'lectures' (old structure)
          else if (roomData.lectures && roomData.lectures.length > 0) {
            roomData.tasks = roomData.lectures.map((lecture, index) => ({
              id: lecture.id || index + 1,
              title: lecture.title,
              content: lecture.content,
              codeSnippet: lecture.codeSnippet,
              codeLanguage: lecture.codeLanguage,
              hint: lecture.hint,
              question:
                lecture.exercise?.question ||
                `Complete the task for ${lecture.title}`,
              answer: lecture.exercise?.correctAnswer?.toString() || "",
              xp: lecture.xp || 100,
            }));
          }
        }

        setRoom(roomData);
        setHeroImg(roomData.cover_image_url || CAT_IMG[roomData.category] || ULTIMATE_FALLBACK);

        // Shuffle quiz questions for this user (if user is authenticated and quiz exists)
        const userId = user?.id || user?._id;
        console.log('🔍 Checking shuffle conditions:', {
          hasUser: !!user,
          userId: userId,
          hasQuizzes: !!(roomData.quizzes && roomData.quizzes.length > 0),
          quizCount: roomData.quizzes?.length || 0
        });

        if (userId && roomData.quizzes && roomData.quizzes.length > 0) {
          const quiz = roomData.quizzes[0];
          console.log('🎯 Quiz data:', {
            quizId: quiz.id,
            questionCount: quiz.questions?.length || 0
          });

          if (quiz.questions && quiz.questions.length > 0) {
            const shuffled = shuffleCompleteQuiz(quiz.questions, userId, roomId);
            setShuffledQuestions(shuffled);
            console.log(`🔀 ✅ Shuffled ${shuffled.length} quiz questions for user ${userId.toString().substring(0, 8)}...`);
            console.log('📋 Original question order:', quiz.questions.map(q => q.id));
            console.log('🔄 Shuffled question order:', shuffled.map(q => q.id));
          } else {
            console.log('⚠️ No quiz questions found to shuffle');
          }
        } else {
          console.log('⚠️ Skipping shuffle:', {
            reason: !userId ? 'No user ID' : 'No quizzes'
          });
        }

        console.log("🚀 Room loaded:", roomData.title);
        console.log("📊 Room has tasks:", roomData.tasks?.length);

        // Load user progress if authenticated
        if (user) {
          try {
            const progressData = await getRoomProgress(roomId);
            console.log("📥 Progress data from backend:", progressData);
            console.log(
              "👤 User joined status:",
              progressData.progress?.joined
            );

            // If backend returns the default object (no real progress), keep joined as false
            // The backend returns a default when user hasn't joined yet
            const hasRealProgress =
              progressData.progress?.completedLectures?.length > 0 ||
              progressData.progress?.quizCompleted ||
              progressData.progress?.joined === true;

            console.log("✅ Has real progress:", hasRealProgress);

            const totalTasks = roomData.tasks?.length || 0;
            const completedTasks =
              progressData.progress?.completedLectures || [];
            const allTasksComplete =
              completedTasks.length === totalTasks && totalTasks > 0;

            // FIX: Only mark room as complete if ALL conditions met:
            // 1. All tasks are done
            // 2. Quiz was completed (if room has quiz)
            // 3. Backend says completed
            const backendCompleted = progressData.progress?.completed === true;
            const quizCompleted = progressData.progress?.quizCompleted === true;
            const hasQuiz = roomData.quizzes && roomData.quizzes.length > 0;

            // Room is complete if:
            // - All tasks done AND
            // - (No quiz OR quiz completed)
            const isRoomActuallyComplete =
              allTasksComplete && (!hasQuiz || quizCompleted);

            setUserProgress({
              joined: progressData.progress?.joined === true ? true : false,
              completedTasks: completedTasks,
              taskAnswers: progressData.progress?.exerciseAnswers || {},
              roomCompleted: isRoomActuallyComplete,
              totalXP: progressData.progress?.totalPointsEarned || 0,
            });

            console.log(
              "🎯 Final joined state:",
              progressData.progress?.joined === true ? true : false
            );
            console.log(
              "✅ All tasks complete:",
              allTasksComplete,
              `(${completedTasks.length}/${totalTasks})`
            );
            console.log("❓ Has quiz:", hasQuiz);
            console.log("🧪 Quiz completed:", quizCompleted);
            console.log("🏁 Backend completed:", backendCompleted);
            console.log("🏆 Room actually completed:", isRoomActuallyComplete);

            // Auto-expand first task if user has joined
            if (progressData.progress?.joined === true) {
              setExpandedTasks([1]);
            }

            // Check if all tasks completed to show quiz
            if (allTasksComplete) {
              setShowQuiz(true);
            }

            // FIX: Validate quiz cache - only restore if tasks are complete
            const savedQuizData = localStorage.getItem(
              `quiz_results_${roomId}`
            );
            if (savedQuizData) {
              try {
                const { results, submitted, answers } =
                  JSON.parse(savedQuizData);

                // VALIDATION: Only restore quiz state if tasks are actually completed
                if (allTasksComplete) {
                  setQuizResults(results);
                  setQuizSubmitted(submitted);
                  setQuizAnswers(answers);
                  if (results.passed) {
                    setShowQuiz(true);
                  }
                  console.log("✅ Restored quiz cache (tasks complete)");
                } else {
                  // Clear stale cache if tasks aren't done
                  localStorage.removeItem(`quiz_results_${roomId}`);
                  console.log("🧹 Cleared stale quiz cache (tasks incomplete)");
                }
              } catch (e) {
                // Invalid cache data, remove it
                localStorage.removeItem(`quiz_results_${roomId}`);
                console.error("❌ Invalid quiz cache, removed:", e);
              }
            }
          } catch (error) {
            console.error("Failed to load progress:", error);
            // If error loading progress, keep default (not joined)
            console.log("⚠️ Using default state (not joined)");
          }
        } else {
          console.log("🔒 No user logged in");
        }
      } catch (error) {
        console.error("Failed to load room:", error);
        setRoom(null);
      } finally {
        setLoading(false);
      }
    };

    loadRoomData();
  }, [roomId, user]);

  // Calculate progress percentage
  const totalComponents = (room?.tasks?.length || 0) + (room?.quizzes?.length > 0 ? 1 : 0);
  const completedComponents = userProgress.completedTasks.length + (userProgress.roomCompleted ? 1 : 0);
  const progressPercentage = totalComponents > 0
    ? (completedComponents / totalComponents) * 100
    : 0;

  // Handle Join Room
  const handleJoinRoom = async () => {
    try {
      await joinRoom(roomId);
      setUserProgress((prev) => ({ ...prev, joined: true }));
      setExpandedTasks([1]); // Expand first task

      // Add room to recent activity so it shows in dashboard
      markRoomAccessed(roomId, {
        title: room.title,
        category: room.category,
        difficulty: room.difficulty,
        totalTasks: room.tasks?.length || 0,
      });
    } catch (error) {
      console.error("Failed to join room:", error);
      alert("Failed to join room. Please try again.");
    }
  };

  // Toggle task expansion
  const toggleTask = (taskId) => {
    if (!userProgress.joined) return;

    // Spec Requirement: No locking system. Allow clicking any task.
    setExpandedTasks([taskId]); // Only expand one at a time for focus
  };

  // Submit task answer
  const handleTaskSubmit = async (taskId, taskIndex) => {
    const answer = taskAnswers[taskId];
    if (!answer || !room?.tasks?.[taskIndex]) return;

    // Get the task data before using it
    const task = room.tasks[taskIndex];

    try {
      // Prevent double submissions
      setSubmissionStatus((prev) => ({ ...prev, [taskId]: "submitting" }));

      // Submit to backend (backend will validate)
      const response = await submitExercise(roomId, taskIndex, answer);
      console.log("🔍 Backend response:", response);
      console.log("✅ isCorrect:", response.correct);
      console.log("📝 Your answer:", answer);
      console.log("🎯 Task index:", taskIndex, "| Task ID:", taskId);
      const isCorrect = response.correct;

      if (isCorrect) {
        // Calculate points earned (defined BEFORE using it)
        const pointsEarned = response.pointsEarned || task.xp || 100;

        // Immediate UI feedback
        setSubmissionStatus((prev) => ({ ...prev, [taskId]: "success" }));

        // Update user progress immediately so SPA navigation or soft refreshes reflect completion
        setUserProgress((prev) => {
          if (prev.completedTasks.includes(taskIndex)) return prev;
          return {
            ...prev,
            completedTasks: [...prev.completedTasks, taskIndex],
            taskAnswers: { ...prev.taskAnswers, [taskId]: answer },
          };
        });

        // Update global store directly from backend response
        if (response.userStats) {
          applyUpdate(response.userStats);
        }
        
        // Invalidate leaderboard data
        requestLeaderboardUpdate();

        // Show points toast/animation with enhanced info
        try {
          toast({
            title: `+${pointsEarned} XP`,
            description: `Correct Answer! ${response.userStats?.points
              ? `Total: ${response.userStats.points} pts`
              : ""
              }`,
          });
        } catch (e) {
          // toast is optional; ignore if not available
        }

        // Wait before auto-advancing (keep UX pause)
        setTimeout(() => {
          // Clear input
          setTaskAnswers((prev) => ({ ...prev, [taskId]: "" }));

          // Auto-expand next task (stay user friendly)
          if (taskIndex < room.tasks.length - 1) {
            const nextTaskId = room.tasks[taskIndex + 1].id;
            setExpandedTasks([nextTaskId]);
          } else {
            // Last task completed
            if (room.quizzes && room.quizzes.length > 0) {
              setShowQuiz(true);
            } else {
              // No quiz - room completed after last task
              const finalXP = (userProgress.totalXP || 0) + pointsEarned;
              
              // Persist completion to backend
              completeRoom(roomId, 100, finalXP)
                .then(res => {
                  if (res.userStats) applyUpdate(res.userStats);
                  requestLeaderboardUpdate();
                  console.log("✅ Room marked complete (no quiz path)");
                })
                .catch(err => {
                  console.error("Delayed completion failure:", err);
                });
 
              const updatedProgress = {
                ...userProgress,
                roomCompleted: true,
                totalXP: finalXP,
                completed: true,
                completedAt: new Date().toISOString(),
              };
              setUserProgress(updatedProgress);
 
              // Refresh global stats via Realtime fallback
              if (window.triggerRealtimeUpdate) window.triggerRealtimeUpdate();

              // Dispatch completion event for dashboard updates
              window.dispatchEvent(
                new CustomEvent("roomCompleted", {
                  detail: {
                    roomId,
                    totalXP: finalXP,
                  },
                })
              );

              // Navigate to completion screen
              setTimeout(() => {
                navigate(`/rooms/${roomId}/completed`);
              }, 1500);
            }
          }

          // Mark submission status as done
          setSubmissionStatus((prev) => ({ ...prev, [taskId]: "done" }));

          // Trigger real-time update fallback
          if (window.triggerRealtimeUpdate) window.triggerRealtimeUpdate();
        }, 1500);
      } else {
        // Incorrect answer: show inline error feedback
        setSubmissionStatus((prev) => ({ ...prev, [taskId]: "error" }));
        try {
          toast({ title: "Incorrect", description: "Try again!" });
        } catch (e) { }
      }
    } catch (error) {
      console.error("Failed to submit task:", error);
      setSubmissionStatus((prev) => ({ ...prev, [taskId]: "error" }));
      try {
        toast({ title: "Submission failed", description: "Please try again." });
      } catch (e) { }
    }
  };

  // Handle Try Again - Reset all progress
  const handleTryAgain = async () => {
    try {
      // Reset backend progress
      await resetRoomProgress(roomId);

      // Reset local state
      setUserProgress({
        joined: true, // Keep joined status
        completedTasks: [],
        taskAnswers: {},
        roomCompleted: false,
      });

      // Reset UI state
      setTaskAnswers({});
      setQuizAnswers({});
      setQuizResults(null);
      setQuizSubmitted(false);
      setShowQuiz(false);
      setSubmissionStatus({});
      setExpandedTasks([1]); // Expand first task

      // Clear quiz cache
      localStorage.removeItem(`quiz_results_${roomId}`);

      // Reset activity context progress
      resetActivityProgress(roomId);

      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });

      toast({
        title: "Progress Reset",
        description: "You can now start fresh!",
      });
    } catch (error) {
      console.error("Failed to reset progress:", error);
      toast({ title: "Reset Failed", description: "Please try again." });
    }
  };

  // Submit quiz
  const handleQuizSubmit = async () => {
    if (!room.quizzes || room.quizzes.length === 0) return;

    const quiz = room.quizzes[0];
    try {
      const response = await submitQuiz(roomId, quiz.id, quizAnswers);
      setQuizResults(response);
      setQuizSubmitted(true);

      // Store quiz results in localStorage to persist across refreshes
      localStorage.setItem(
        `quiz_results_${roomId}`,
        JSON.stringify({
          results: response,
          submitted: true,
          answers: quizAnswers,
        })
      );

      // If passed, complete the room
      if (response.passed) {
        const finalTotalXP = userProgress.totalXP + response.earnedPoints;

        // FIX: Validate all tasks are complete before calling completeRoom
        const allTasksComplete =
          userProgress.completedTasks.length === room.tasks.length;

        if (!allTasksComplete) {
          console.error(
            "❌ Cannot complete room - not all tasks done:",
            userProgress.completedTasks.length,
            "/",
            room.tasks.length
          );
          alert(
            "Error: Quiz passed but not all tasks are complete. Please contact support."
          );
          return;
        }

        setTimeout(async () => {
          // Call backend to mark room as complete and update leaderboard
          try {
            const completeResponse = await completeRoom(roomId, response.percentage, finalTotalXP);
            if (completeResponse.userStats) {
               applyUpdate(completeResponse.userStats);
            }
            requestLeaderboardUpdate();
            console.log("✅ Room marked complete on backend");
          } catch (error) {
            console.error("Failed to mark room as complete:", error);
            // Don't block UI if backend fails, but log it
          }

          const updatedProgress = {
            ...userProgress,
            roomCompleted: true,
            totalXP: finalTotalXP,
            completed: true,
            completedAt: new Date().toISOString(),
          };

          setUserProgress(updatedProgress);

          // Dispatch completion event for dashboard updates
          window.dispatchEvent(
            new CustomEvent("roomCompleted", {
              detail: {
                roomId,
                totalXP: finalTotalXP,
                score: response.percentage,
              },
            })
          );

          // Navigate to completion screen
          setTimeout(() => {
            navigate(`/rooms/${roomId}/completed`);
          }, 1000);
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      alert("Failed to submit quiz. Please try again.");
    }
  };

  // Task status helper
  const getTaskStatus = (taskIndex) => {
    const taskId = room.tasks?.[taskIndex]?.id;
    if (userProgress.completedTasks.includes(taskIndex)) return "completed";
    if (expandedTasks.includes(taskId)) return "in-progress";
    return "not-started";
  };

  /* ── Topic Icons Helper ── */
  const getTopicIcon = (title) => {
    const t = title.toLowerCase();
    if (t.includes('web') || t.includes('http')) return <Zap size={14} />;
    if (t.includes('net') || t.includes('ip') || t.includes('port')) return <Shield size={14} />;
    if (t.includes('dev') || t.includes('code') || t.includes('api')) return <Terminal size={14} />;
    if (t.includes('hack') || t.includes('vuln') || t.includes('exp')) return <Target size={14} />;
    return <BookOpen size={14} />;
  };

  /* ── Topic Image Helper ── */
  const getTopicImg = (title, category) => {
    const t = title.toLowerCase();
    if (t.includes('web')) return "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&q=80&w=800";
    if (t.includes('network')) return "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800";
    if (t.includes('linux')) return "https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&q=80&w=800";
    if (t.includes('code') || t.includes('api')) return "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800";
    return "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800";
  };

  if (!room) {
    return (
      <div className="rdp-root flex items-center justify-center p-20">
        <div className="text-center">
          <p className="text-slate-400 mb-6">Room not found or failed to load</p>
          <button onClick={() => navigate("/rooms")} className="rdp-back-btn">
            <ArrowLeft size={16} /> Back to Rooms
          </button>
        </div>
      </div>
    );
  }

  const activeTaskId = expandedTasks[0] || 1;
  const activeTask = room.tasks?.find(t => t.id === activeTaskId) || room.tasks?.[0];
  const activeTaskIndex = room.tasks?.findIndex(t => t.id === activeTaskId) ?? 0;

  return (
    <div className="rdp-root">
      <div className="rdp-bg-glow" />

      {/* ── STICKY NAV ── */}
      <nav className="rdp-nav">
        <div className="rdp-nav-content">
          <div className="rdp-nav-left">
            <button onClick={() => navigate("/rooms")} className="rdp-back-btn">
              <ArrowLeft size={16} /> <span className="hidden sm:inline">Back</span>
            </button>
            <div className="h-6 w-px bg-slate-800 hidden sm:block" />
            <div className="flex flex-col">
              <h4 className="font-bold text-white text-xs lg:text-sm truncate max-w-[200px] leading-tight">{room.title}</h4>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{room.category} // SYSTEM_READY</span>
            </div>
          </div>

          <div className="rdp-prog-wrap">
            <div className="flex justify-between items-center mb-1">
              <span className="rdp-prog-text">Your Progress</span>
              <span className="text-[10px] font-bold text-slate-500">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="rdp-prog-track">
              <div className="rdp-prog-fill" style={{ width: `${progressPercentage}%` }} />
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total XP</span>
                <span className="text-primary font-bold">{userStats.totalXP}</span>
             </div>
             <button className="rdp-back-btn p-2"><Share2 size={16}/></button>
          </div>
        </div>
      </nav>

      <div className="rdp-wrap">
        {/* ── HERO ── */}
        <section className="rdp-hero rdp-fade-in">
          <div className="rdp-hero-info">
            <div className="rdp-cat-pill" style={{ background: 'rgba(139,92,246,0.1)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.2)' }}>
              <Shield size={14} /> {room.category}
            </div>
            <h1 className="rdp-title">{room.title}</h1>
            <p className="rdp-desc">{room.description}</p>
            
            <div className="rdp-meta">
              <div className="rdp-m-item">
                <div className="flex flex-col">
                  <span className="rdp-m-lbl text-success">Difficulty</span>
                  <div className="flex items-center gap-2">
                    <Shield size={12} className="text-success" />
                    <span className="rdp-m-val">{room.difficulty}</span>
                  </div>
                </div>
              </div>
              <div className="rdp-m-item">
                <div className="flex flex-col">
                  <span className="rdp-m-lbl">Duration</span>
                  <span className="rdp-m-val">{room.estimatedTime || room.estimated_time_minutes + "m"}</span>
                </div>
              </div>
              <div className="rdp-m-item">
                <div className="flex flex-col">
                  <span className="rdp-m-lbl">Points</span>
                  <span className="rdp-m-val text-primary">{room.points} XP</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rdp-hero-card">
            <div className="rdp-hero-img-wrap">
              <img
                src={heroImg}
                className="rdp-hero-img"
                alt=""
                onError={() => {
                  const fallback = CAT_IMG[room.category] || ULTIMATE_FALLBACK;
                  if (heroImg !== fallback) setHeroImg(fallback);
                }}
              />
              <div className="rdp-hero-overlay" />
            </div>
            <div className="rdp-hero-actions">
              {!userProgress.joined ? (
                <button onClick={handleJoinRoom} className="rdp-main-btn">
                  <Play size={18} fill="currentColor" /> Start Challenge
                </button>
              ) : (
                <button 
                  onClick={() => {
                    const firstIncomp = room.tasks?.findIndex((t, i) => !userProgress.completedTasks.includes(i));
                    toggleTask(room.tasks[firstIncomp === -1 ? 0 : firstIncomp].id);
                  }} 
                  className="rdp-main-btn"
                >
                  <Zap size={18} fill="currentColor" /> {userProgress.roomCompleted ? "Review Room" : "Continue"}
                </button>
              )}
              <div className="flex gap-2">
                <button className="rdp-back-btn flex-1 justify-center"><Bookmark size={14}/> Save</button>
                <button onClick={handleTryAgain} className="rdp-back-btn flex-1 justify-center"><RefreshCw size={14}/> Reset</button>
              </div>
            </div>
          </div>
        </section>

        {/* ── MAIN LAYOUT ── */}
        <div className="rdp-layout">
          
          {/* Side: Task Browser */}
          <aside className="rdp-sidebar">
            <div className="rdp-s-title">
              <Terminal size={18} className="text-slate-500" />
              Challenge Tasks
            </div>
            <div className="rdp-s-list">
              {room.tasks?.map((t, idx) => {
                const status = getTaskStatus(idx);
                const isActive = activeTaskId === t.id;
                return (
                  <button 
                    key={t.id}
                    onClick={() => toggleTask(t.id)}
                    className={`rdp-t-item ${isActive ? 'rdp-t-item--active' : ''} ${status === 'completed' ? 'rdp-t-item--done' : ''}`}
                  >
                    <div className="rdp-t-icon">
                      {status === 'completed' ? (
                        <Check size={14} className="text-success" />
                      ) : status === 'in-progress' ? (
                        <CircleDot size={14} className="text-primary animate-pulse" />
                      ) : (
                        <Circle size={14} className="text-slate-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="rdp-t-title">{t.title}</div>
                      <div className="text-[10px] font-bold text-slate-500">{t.xp || 100} XP</div>
                    </div>
                  </button>
                );
              })}
              {room.quizzes?.length > 0 && (
                 <button 
                    onClick={() => setShowQuiz(true)}
                    disabled={!showQuiz && userProgress.completedTasks.length < room.tasks?.length}
                    className={`rdp-t-item ${showQuiz ? 'rdp-t-item--active' : ''} ${quizSubmitted ? 'rdp-t-item--done' : ''}`}
                 >
                    <div className="rdp-t-icon">
                      <Trophy size={16}/>
                    </div>
                    <span className="rdp-t-title">Final Quiz</span>
                 </button>
              )}
            </div>
          </aside>

          {/* Main: Active Task Content */}
          <main className="rdp-content">
            {userProgress.roomCompleted && (
              <div className="p-6 rounded-2xl bg-success/10 border border-success/30 flex items-center justify-between rdp-fade-in shadow-[0_0_30px_rgba(57,255,20,0.1)]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                    <Trophy className="text-success" size={24}/>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">Mission Successful</h3>
                    <p className="text-sm text-success/80 font-bold uppercase tracking-widest">Sector Cleared | {userStats.totalXP} XP Collected</p>
                  </div>
                </div>
                <button onClick={() => navigate("/dashboard")} className="rdp-back-btn border-success/30 hover:bg-success/20 text-white font-black">Open Archive</button>
              </div>
            )}

            {showQuiz ? (
              /* QUIZ UI */
              <div className="rdp-card rdp-fade-in">
                <div className="rdp-card-head">
                  <h2 className="rdp-card-title">Final Knowledge Check</h2>
                  <Trophy size={20} className="text-warning" />
                </div>
                <div className="rdp-card-body space-y-10">
                   {(() => {
                      const questions = shuffledQuestions.length > 0 ? shuffledQuestions : room.quizzes[0].questions;
                      return questions.map((q, qi) => (
                        <div key={q.id} className="rdp-quiz-q">
                           <h4 className="text-white font-bold mb-4 flex gap-3">
                              <span className="text-slate-600">{qi + 1}.</span> {q.question_text}
                           </h4>
                           <div className="grid gap-3">
                              {q.options.map((opt, oi) => (
                                <label key={oi} className={`rdp-t-item font-medium transition-all ${quizAnswers[q.id] === opt ? 'bg-primary/20 border-primary/40 text-white' : ''} ${quizSubmitted ? 'pointer-events-none' : ''}`}>
                                   <input 
                                      type="radio" 
                                      name={`q-${q.id}`} 
                                      className="sr-only"
                                      checked={quizAnswers[q.id] === opt}
                                      onChange={() => !quizSubmitted && setQuizAnswers(p => ({ ...p, [q.id]: opt }))}
                                   />
                                   <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${quizAnswers[q.id] === opt ? 'border-primary' : 'border-slate-700'}`}>
                                      {quizAnswers[q.id] === opt && <div className="w-2.5 h-2.5 bg-primary rounded-full"/>}
                                   </div>
                                   {opt}
                                </label>
                              ))}
                           </div>
                           {quizSubmitted && quizResults?.results && (
                              <div className={`mt-4 p-4 rounded-xl flex gap-3 ${quizResults.results.find(r => r.questionId === q.id)?.correct ? 'bg-success/10 text-success border border-success/20' : 'bg-danger/10 text-danger border border-danger/20'}`}>
                                 {quizResults.results.find(r => r.questionId === q.id)?.correct ? <CheckCircle size={18}/> : <X size={18}/>}
                                 <div className="text-sm">
                                    <span className="font-bold underline">{quizResults.results.find(r => r.questionId === q.id)?.correct ? 'Correct' : 'Incorrect'}</span>
                                    {q.explanation && <p className="mt-1 opacity-80">{q.explanation}</p>}
                                 </div>
                              </div>
                           )}
                        </div>
                      ));
                   })()}

                   {!quizSubmitted ? (
                      <button 
                        onClick={handleQuizSubmit}
                        disabled={Object.keys(quizAnswers).length < room.quizzes[0].questions.length}
                        className="rdp-main-btn py-5"
                      >
                         Submit Results
                      </button>
                   ) : (
                      <div className={`p-8 rounded-2xl text-center border-2 ${quizResults?.passed ? 'bg-success/10 border-success/30' : 'bg-danger/10 border-danger/30'}`}>
                         <h2 className={`text-2xl font-black mb-2 ${quizResults?.passed ? 'text-success' : 'text-danger'}`}>
                            {quizResults?.passed ? "MISSION SUCCESSFUL" : "MISSION FAILED"}
                         </h2>
                         <p className="text-white font-bold text-xl mb-4">{quizResults?.percentage}% Success Rate</p>
                         {quizResults?.passed ? (
                            <div className="space-y-4">
                               <p className="text-slate-400">The sector is secured. You have earned {quizResults.earnedPoints} XP bonus.</p>
                               <button onClick={() => navigate("/rooms")} className="rdp-main-btn">Return to Base</button>
                            </div>
                         ) : (
                            <button onClick={handleTryAgain} className="rdp-main-btn" style={{ background: '#ef4444' }}>Retake Mission</button>
                         )}
                      </div>
                   )}
                </div>
              </div>
            ) : (
              /* TASK UI */
              <div className="rdp-card rdp-fade-in" key={activeTaskId}>
                <div className="rdp-card-head">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-primary">
                      {getTopicIcon(activeTask.title)}
                    </div>
                    <div>
                      <h2 className="rdp-card-title">{activeTask.title}</h2>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">+ {activeTask.xp || 100} XP</span>
                    </div>
                  </div>
                  {userProgress.completedTasks.includes(activeTaskIndex) && (
                    <div className="flex items-center gap-2 text-success font-bold text-sm bg-success/10 px-3 py-1.5 rounded-lg border border-success/20">
                      <CheckCircle size={14}/> Completed
                    </div>
                  )}
                </div>

                <div className="rdp-task-vis h-[240px] w-full relative">
                   <img src={getTopicImg(activeTask.title, room.category)} className="w-full h-full object-cover" alt=""/>
                   <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1A] via-transparent to-transparent opacity-60"/>
                </div>

                <div className="rdp-card-body">
                  <EnhancedContentRenderer content={activeTask.content} title={activeTask.title} />

                  {activeTask.codeSnippet && (
                    <CodeSection code={activeTask.codeSnippet} language={activeTask.codeLanguage} />
                  )}

                  {activeTask.hint && (
                    <div className="mt-8 border-t border-slate-800 pt-6">
                      <button 
                         onClick={() => {
                           if(confirm("Using a hint will deduct 25 XP. Proceed?")) {
                             // XP Deduction simulation
                             setUserProgress(p => ({ ...p, totalXP: Math.max(0, p.totalXP - 25) }));
                             setExpandedTasks(p => [...p, `${activeTask.id}_hint`]); // Use different key to show hint
                           }
                         }}
                         className="flex items-center gap-2 text-warning font-bold text-xs uppercase tracking-widest hover:text-white transition-colors"
                      >
                         <HelpCircle size={14}/> Unlock Technical Intel (-25 XP)
                      </button>
                      
                      {(expandedTasks.includes(`${activeTask.id}_hint`) || userProgress.completedTasks.includes(activeTaskIndex)) && (
                        <div className="mt-4 p-4 bg-amber-500/5 rounded-xl text-sm italic text-amber-200/70 border border-amber-500/10 rdp-fade-in">
                          <span className="font-bold text-amber-500 not-italic mr-2">INTEL_RECOVERED:</span>
                          {activeTask.hint}
                        </div>
                      )}
                    </div>
                  )}

                  {!userProgress.completedTasks.includes(activeTaskIndex) && (
                    <div className="rdp-ans-section">
                      <div className="flex items-center justify-between mb-3">
                        <label className="rdp-ans-lbl m-0">{activeTask.question}</label>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Input Flag Below</span>
                      </div>
                      <div className="rdp-ans-row">
                        <input 
                          type="text" 
                          className="rdp-inp font-mono" 
                          placeholder="CV{flag_here}..."
                          value={taskAnswers[activeTask.id] || ""}
                          onChange={(e) => setTaskAnswers(p => ({ ...p, [activeTask.id]: e.target.value }))}
                          onKeyPress={(e) => e.key === 'Enter' && handleTaskSubmit(activeTask.id, activeTaskIndex)}
                        />
                        <button 
                          onClick={() => handleTaskSubmit(activeTask.id, activeTaskIndex)}
                          disabled={!taskAnswers[activeTask.id] || submissionStatus[activeTask.id] === 'submitting'}
                          className="rdp-submit"
                        >
                          {submissionStatus[activeTask.id] === 'submitting' ? <RefreshCw className="animate-spin" size={18}/> : 'Submit Flag'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>

          {/* Right: Room Stats / Creator */}
          <aside className="rdp-info">
             <div className="rdp-info-sec">
                <span className="rdp-info-lbl">Room Intel</span>
                <div className="rdp-info-box space-y-4">
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Enrollment</span>
                      <div className="flex items-center gap-1.5">
                         <Users size={12} className="text-primary"/>
                         <span className="text-white font-bold">{room.enrollmentCount || room.participants || 0}</span>
                      </div>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Avg. Time</span>
                      <span className="text-white font-bold">{room.estimatedTime || room.estimated_time_minutes + "m"}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Rating</span>
                      <div className="flex items-center gap-1 text-warning font-bold">
                         ★ {room.rating || "4.8"}
                      </div>
                   </div>
                   <div className="h-px bg-slate-800"/>
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                         <Terminal size={18} className="text-primary"/>
                      </div>
                      <div className="flex flex-col">
                         <span className="text-[10px] font-bold text-slate-500 uppercase">Creator</span>
                         <span className="text-xs font-bold text-white">{room.creator || "CyberVerse Admin"}</span>
                      </div>
                   </div>
                </div>
             </div>

             <div className="rdp-info-sec">
                <span className="rdp-info-lbl">Tags & Skills</span>
                <div className="flex flex-wrap gap-2">
                   {room.tags?.map(t => (
                      <span key={t} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] font-bold text-slate-400 capitalize"># {t}</span>
                   ))}
                </div>
             </div>

             {userProgress.roomCompleted && (
                <div className="p-5 rounded-2xl bg-primary/10 border border-primary/20 text-center space-y-3">
                   <Trophy size={32} className="mx-auto text-primary"/>
                   <h5 className="text-white font-black text-xs uppercase tracking-widest">Sector Cleared</h5>
                   <p className="text-[11px] text-slate-400">You have successfully dominated this room and gathered all available intel.</p>
                </div>
             )}
          </aside>
        </div>
      </div>

      {/* ── Completion Modal ── */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[1000] p-4">
          <div className="max-w-md w-full text-center space-y-8 rdp-fade-in">
             <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                   <Award size={48} className="text-primary"/>
                </div>
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full -z-10 animate-pulse"/>
             </div>
             
             <div className="space-y-2">
                <h1 className="text-4xl font-black text-white italic tracking-tighter">MISSION COMPLETE</h1>
                <p className="text-slate-400">System breach detected... Data harvested successfully.</p>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                   <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">XP EARNED</span>
                   <span className="text-2xl font-black text-primary">+{userProgress.totalXP}</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                   <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">SCORE</span>
                   <span className="text-2xl font-black text-white">{quizResults?.percentage || 100}%</span>
                </div>
             </div>

             <div className="flex gap-4">
                <button onClick={() => navigate("/rooms")} className="flex-1 rdp-back-btn justify-center py-4 bg-transparent border-slate-700">Back to Rooms</button>
                <button onClick={() => navigate("/dashboard")} className="flex-1 rdp-main-btn py-4">Dashboard</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomDetail;
