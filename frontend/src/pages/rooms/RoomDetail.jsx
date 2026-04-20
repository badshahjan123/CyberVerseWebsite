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
  submitTaskQuestion,
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
  Copy,
} from "lucide-react";
import { clearQuizCache } from "../../utils/clearQuizCache";
import { shuffleCompleteQuiz } from "../../utils/shuffleQuestions";
import { attemptsService } from "../../services/attempts";
import "./RoomModule.css";

const CAT_IMG = {
  Web: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=800",
  Networking:
    "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=800",
  Development:
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=800",
  DevOps:
    "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?auto=format&fit=crop&q=80&w=800",
  Misc: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=800",
};
const ULTIMATE_FALLBACK =
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800";

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
        {idx < steps.length - 1 && (
          <ArrowRight size={16} className="rdp-flow-arrow" />
        )}
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
    const cleanCode = code.replace(/^\$ /gm, "");
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
          {copied ? (
            <Check size={14} className="text-success" />
          ) : (
            <Copy size={14} />
          )}
        </button>
      </div>
      <div className="rdp-terminal-body">
        {code.split("\n").map((line, lidx) => (
          <div key={lidx}>
            <span className="rdp-terminal-prompt">$</span>
            {line.replace(/^\$ /, "")}
          </div>
        ))}
      </div>
    </div>
  );
};

const EnhancedContentRenderer = ({ content, title }) => {
  if (!content) return null;

  const renderText = (text) => {
    if (typeof text !== "string") return text;
    const html = text
      .replace(
        /\*\*(.*?)\*\*/g,
        '<strong class="text-white font-black">$1</strong>',
      )
      .replace(/\*(.*?)\*/g, '<em class="text-primary italic">$1</em>')
      .replace(
        /`(.*?)`/g,
        '<code class="bg-white/10 px-1.5 py-0.5 rounded text-primary font-mono text-[0.9em]">$1</code>',
      );
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  };

  const blocks = content.split("\n\n");
  const items = [];
  let smartVisualInjected = false;

  // Detect Smart Visual based on task title or content keywords
  let smartVisual = null;
  const taskTitle = title?.toLowerCase() || "";
  if (taskTitle.includes("api") || taskTitle.includes("http")) {
    smartVisual = {
      url: "/api-flow.png",
      caption: "API Request / Response Cycle",
    };
  } else if (
    taskTitle.includes("domain") ||
    taskTitle.includes("dns") ||
    taskTitle.includes("hierarchy")
  ) {
    smartVisual = {
      url: "/domain-hierarchy.png",
      caption: "Domain Hierarchy Structure",
    };
  }

  blocks.forEach((block, idx) => {
    const trimmed = block.trim();
    if (!trimmed) return;

    // 1. Terminal / Code Detection
    if (trimmed.startsWith("[TERMINAL]") || trimmed.startsWith("$ ")) {
      const code = trimmed.replace("[TERMINAL]", "").trim();
      items.push(<TerminalBlock key={idx} code={code} />);
      return;
    }

    // 2. Flow marker
    if (trimmed.startsWith("[FLOW]")) {
      const steps = trimmed
        .replace("[FLOW]", "")
        .split("|")
        .map((s) => s.trim());
      items.push(<FlowDiagram key={idx} steps={steps} />);
      return;
    }

    // 3. Diagram marker
    if (trimmed.startsWith("[DIAGRAM]")) {
      const [url, caption] = trimmed
        .replace("[DIAGRAM]", "")
        .split("|")
        .map((s) => s.trim());
      items.push(<VisualCard key={idx} url={url} caption={caption} />);
      return;
    }

    // 4. Tree marker
    if (trimmed.startsWith("[TREE]")) {
      const parts = trimmed.replace("[TREE]", "").split("|");
      const rootName = parts[0]?.trim();
      const children =
        parts[1]?.split(",").map((c) => ({ name: c.trim() })) || [];
      items.push(
        <HierarchyTree key={idx} data={{ name: rootName, children }} />,
      );
      return;
    }

    // 5. Headings (Simple detection)
    if (
      trimmed.startsWith("### ") ||
      trimmed.startsWith("## ") ||
      trimmed.startsWith("# ")
    ) {
      const cleanH = trimmed.replace(/^#+ /, "");
      items.push(
        <h3
          key={idx}
          className="text-xl font-black text-white mt-8 mb-6 italic tracking-tight"
        >
          {renderText(cleanH)}
        </h3>,
      );

      // Auto-inject visual after the first heading
      if (!smartVisualInjected && smartVisual) {
        items.push(
          <VisualCard
            key={`sv-${idx}`}
            url={smartVisual.url}
            caption={smartVisual.caption}
          />,
        );
        smartVisualInjected = true;
      }
      return;
    }

    // 6. Default Paragraph
    items.push(
      <p key={idx} className="mb-4 leading-relaxed">
        {renderText(trimmed)}
      </p>,
    );
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
          <span className="rdp-code-lang">{language || "terminal"}</span>
        </div>
        <button onClick={handleCopy} className="rdp-copy-btn">
          {copied ? (
            <Check size={14} className="text-success" />
          ) : (
            <Copy size={14} />
          )}
        </button>
      </div>
      <div className="rdp-code-body">
        <code className="rdp-code">{code}</code>
      </div>
    </div>
  );
};

const RoomDetail = () => {
  const { id: roomId } = useParams();
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
  const [submissionStatus, setSubmissionStatus] = useState({});
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [tqAnswers, setTqAnswers] = useState({});  // { "topicId_qId": string }
  const [tqStatus, setTqStatus] = useState({});    // { "topicId_qId": 'correct'|'wrong' }
  const [heroImg, setHeroImg] = useState("");
  
  // Replay & Scoring States
  const [attemptId, setAttemptId] = useState(null);
  const [bestScore, setBestScore] = useState(0);
  const [attemptsCount, setAttemptsCount] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [newHighScore, setNewHighScore] = useState(false);

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
          }),
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
              const matchingExercise =
                roomData.exercises?.find((ex) => ex.id === topic.id) ||
                roomData.exercises?.[index];
              return {
                id: topic.id || index + 1,
                title: topic.title,
                content: Array.isArray(topic.content) && topic.content.length > 0
                  ? topic.content
                  : topic.content_markdown || "",
                hint: topic.hint || matchingExercise?.hint || "",
                taskQuestions: topic.taskQuestions || [],
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
        setHeroImg(
          roomData.cover_image_url ||
            CAT_IMG[roomData.category] ||
            ULTIMATE_FALLBACK,
        );

        // Shuffle quiz questions for this user (if user is authenticated and quiz exists)
        const userId = user?.id || user?._id;
        console.log("🔍 Checking shuffle conditions:", {
          hasUser: !!user,
          userId: userId,
          hasQuizzes: !!(roomData.quizzes && roomData.quizzes.length > 0),
          quizCount: roomData.quizzes?.length || 0,
        });

        if (userId && roomData.quizzes && roomData.quizzes.length > 0) {
          const quiz = roomData.quizzes[0];
          console.log("🎯 Quiz data:", {
            quizId: quiz.id,
            questionCount: quiz.questions?.length || 0,
          });

          if (quiz.questions && quiz.questions.length > 0) {
            const shuffled = shuffleCompleteQuiz(
              quiz.questions,
              userId,
              roomId,
            );
            setShuffledQuestions(shuffled);
            console.log(
              `🔀 ✅ Shuffled ${shuffled.length} quiz questions for user ${userId.toString().substring(0, 8)}...`,
            );
            console.log(
              "📋 Original question order:",
              quiz.questions.map((q) => q.id),
            );
            console.log(
              "🔄 Shuffled question order:",
              shuffled.map((q) => q.id),
            );
          } else {
            console.log("⚠️ No quiz questions found to shuffle");
          }
        } else {
          console.log("⚠️ Skipping shuffle:", {
            reason: !userId ? "No user ID" : "No quizzes",
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
              progressData.progress?.joined,
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
              progressData.progress?.joined === true ? true : false,
            );
            console.log(
              "✅ All tasks complete:",
              allTasksComplete,
              `(${completedTasks.length}/${totalTasks})`,
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
              `quiz_results_${roomId}`,
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
        // Load Best Scores & Attempt History
        // Use roomData._id (ObjectId) instead of roomId (slug) for database internal tracking
        const statsData = await attemptsService.getItemStats('room', roomData._id);
        setBestScore(statsData.bestScore);
        setAttemptsCount(statsData.attemptsCount);

        // Start NEW Attempt for Replay
        const attemptRes = await attemptsService.startAttempt(roomData._id, 'room', roomData.points || 1000);
        setAttemptId(attemptRes.attemptId);
        setStartTime(Date.now());

      } catch (error) {
        console.error("Failed to load room:", error);
        setRoom(null);
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
        loadRoomData();
    }
  }, [roomId, user]);

  // Calculate progress percentage
  const totalTasks = room?.tasks?.length || 0;
  const totalComponents = totalTasks + (room?.quizzes?.length > 0 ? 1 : 0);
  const completedTaskCount = room?.tasks
    ? room.tasks.filter((t, i) =>
        userProgress.completedTasks.includes(i) ||
        (t.taskQuestions?.length > 0 && t.taskQuestions.every(q => tqStatus[`${t.id}_${q.id}`] === "correct"))
      ).length
    : 0;
  const completedComponents = completedTaskCount + (userProgress.roomCompleted ? 1 : 0);
  const progressPercentage = totalComponents > 0 ? (completedComponents / totalComponents) * 100 : 0;

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
            description: `Correct Answer! ${
              response.userStats?.points
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
                .then((res) => {
                  if (res.userStats) applyUpdate(res.userStats);
                  requestLeaderboardUpdate();
                  console.log("✅ Room marked complete (no quiz path)");
                })
                .catch((err) => {
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
                }),
              );

              // Finalize Attempt session
              const completionTime = Math.floor((Date.now() - startTime) / 1000);
              attemptsService.completeAttempt(
                attemptId,
                finalXP,
                completionTime,
                [{ taskId: 'room_completion', completed: true, completedAt: new Date() }]
              ).then(result => {
                if (result.isNewBest) {
                  setNewHighScore(true);
                  setBestScore(result.bestScore);
                }
                setAttemptsCount(result.attemptsCount);
              });

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
        } catch (e) {}
      }
    } catch (error) {
      console.error("Failed to submit task:", error);
      setSubmissionStatus((prev) => ({ ...prev, [taskId]: "error" }));
      try {
        toast({ title: "Submission failed", description: "Please try again." });
      } catch (e) {}
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
      setTqAnswers({});
      setTqStatus({});
      setExpandedTasks([1]);

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
        }),
      );

      // If passed, complete the room
      if (response.passed) {
        const finalTotalXP = userProgress.totalXP + response.earnedPoints;
        const allTasksComplete = allTasksDone;

        if (!allTasksComplete) {
          console.error(
            "❌ Cannot complete room - not all tasks done:",
            userProgress.completedTasks.length,
            "/",
            room.tasks.length,
          );
          alert(
            "Error: Quiz passed but not all tasks are complete. Please contact support.",
          );
          return;
        }

        setTimeout(async () => {
          // Call backend to mark room as complete and update leaderboard
          try {
            const completionTime = Math.floor((Date.now() - startTime) / 1000);
            const attemptResult = await attemptsService.completeAttempt(
              attemptId,
              response.earnedPoints + (userProgress.totalXP || 0),
              completionTime,
              userProgress.completedTasks.map(id => ({ taskId: id, completed: true, completedAt: new Date() }))
            );

            if (attemptResult.isNewBest) {
              setNewHighScore(true);
              setBestScore(attemptResult.bestScore);
            }
            setAttemptsCount(attemptResult.attemptsCount);

            const completeResponse = await completeRoom(
              roomId,
              response.percentage,
              finalTotalXP,
            );
            if (completeResponse.userStats) {
              applyUpdate(completeResponse.userStats);
            }
            requestLeaderboardUpdate();
            console.log("✅ Room marked complete on backend (Attempt finalized)");
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
            }),
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
    if (t.includes("web") || t.includes("http")) return <Zap size={14} />;
    if (t.includes("net") || t.includes("ip") || t.includes("port"))
      return <Shield size={14} />;
    if (t.includes("dev") || t.includes("code") || t.includes("api"))
      return <Terminal size={14} />;
    if (t.includes("hack") || t.includes("vuln") || t.includes("exp"))
      return <Target size={14} />;
    return <BookOpen size={14} />;
  };

  /* ── Topic Image Helper ── */
  const getTopicImg = (title, category) => {
    const t = title.toLowerCase();
    if (t.includes("web"))
      return "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&q=80&w=800";
    if (t.includes("network"))
      return "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800";
    if (t.includes("linux"))
      return "https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&q=80&w=800";
    if (t.includes("code") || t.includes("api"))
      return "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800";
    return "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800";
  };

  if (!room) {
    return (
      <div className="rdp-root flex items-center justify-center p-20">
        <div className="text-center">
          <p className="text-slate-400 mb-6">
            Room not found or failed to load
          </p>
          <button onClick={() => navigate("/rooms")} className="rdp-back-btn">
            <ArrowLeft size={16} /> Back to Rooms
          </button>
        </div>
      </div>
    );
  }

  const activeTaskId = expandedTasks[0] || 1;
  const activeTask = room.tasks?.find((t) => t.id === activeTaskId) || room.tasks?.[0];
  const activeTaskIndex = room.tasks?.findIndex((t) => t.id === activeTaskId) ?? 0;

  // For admin rooms using taskQuestions, a task is "done" when all its questions are answered correctly
  const isTaskDone = (task, taskIndex) => {
    if (userProgress.completedTasks.includes(taskIndex)) return true;
    if (!task.taskQuestions?.length) return false;
    return task.taskQuestions.every((q) => tqStatus[`${task.id}_${q.id}`] === "correct");
  };
  const allTasksDone = room.tasks?.length > 0 && room.tasks.every((t, i) => isTaskDone(t, i));

  return (
    <div className="rdp-root">
      {/* ── TOP NAV ── */}
      <nav className="rdp-nav-v2">
        <div className="rdp-nav-inner">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/rooms")}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="h-4 w-px bg-slate-800" />
            <span className="text-xs font-black text-white uppercase tracking-tighter truncate max-w-[300px]">
              {room.title}
            </span>
          </div>

          <div className="flex-1 max-w-md mx-8 hidden md:block">
            <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase mb-1">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-[9px] font-bold text-slate-500 uppercase">
                Total XP
              </div>
              <div className="text-xs font-black text-primary leading-none">
                {userStats.totalXP}
              </div>
            </div>
            <button
              onClick={() => {}}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </nav>

      <div className="rdp-main-wrap rdp-fade-in">
        {/* ── ROOM HEADER ── */}
        <header className="rdp-header-v2">
          <div className="flex items-center gap-2 mb-2">
            <div className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {room.category}
            </div>
            <div className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
              {room.difficulty}
            </div>
            <div className="ml-auto flex items-center gap-3">
              <span className="text-[10px] font-bold text-slate-500">
                ★ {room.rating || "4.8"}
              </span>
              <span className="text-[10px] font-bold text-slate-500">
                {room.tasks?.length || 0} TASKS
              </span>
            </div>
          </div>
          <h1 className="text-3xl font-black text-white leading-tight mb-2 uppercase tracking-tighter italic">
            {room.title}
          </h1>
          <p className="text-sm text-slate-500 max-w-3xl leading-relaxed">
            {room.description}
          </p>
        </header>

        {/* ── COMPLETION BANNER ── */}
        {userProgress.roomCompleted && (
          <div className="p-4 rounded-xl bg-success/5 border border-success/20 flex items-center justify-between rdp-fade-in">
            <div className="flex items-center gap-3">
              <Trophy className="text-success" size={20} />
              <div>
                <h4 className="text-xs font-black text-white uppercase">
                  Sector Clear
                </h4>
                <p className="text-[10px] text-success/70 font-bold uppercase">
                  {userStats.totalXP} XP Collected
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-[10px] font-black text-white px-3 py-1.5 rounded bg-success/20 border border-success/20"
            >
              Dashboard →
            </button>
          </div>
        )}

        {/* ── TASK SELECTOR BAR ── */}
        {userProgress.joined && (
          <div className="rdp-task-bar">
            <div className="rdp-task-bar-left">
              <select
                className="rdp-task-select"
                value={showQuiz ? "quiz" : String(activeTaskId)}
                onChange={(e) => {
                  if (e.target.value === "quiz") {
                    if (allTasksDone) setShowQuiz(true);
                  } else {
                    setShowQuiz(false);
                    toggleTask(Number(e.target.value));
                  }
                }}
              >
                {room.tasks?.map((t, idx) => (
                  <option key={t.id} value={t.id}>
                    {userProgress.completedTasks.includes(idx) ? "✓" : `${idx + 1}.`} {t.title}
                  </option>
                ))}
                {room.quizzes?.length > 0 && (
                  <option value="quiz" disabled={!allTasksDone}>
                    {allTasksDone ? "🏆 Final Quiz" : "🔒 Final Quiz (complete tasks first)"}
                  </option>
                )}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => activeTaskIndex > 0 && toggleTask(room.tasks[activeTaskIndex - 1].id)}
                disabled={showQuiz || activeTaskIndex === 0}
                className="rdp-nav-arrow"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                onClick={() => activeTaskIndex < room.tasks.length - 1 && toggleTask(room.tasks[activeTaskIndex + 1].id)}
                disabled={showQuiz || activeTaskIndex === room.tasks.length - 1}
                className="rdp-nav-arrow"
              >
                <ArrowRight size={16} />
              </button>
              {room.quizzes?.length > 0 && (
                <button
                  onClick={() => allTasksDone && setShowQuiz(true)}
                  disabled={!allTasksDone}
                  className="rdp-quiz-trigger"
                  title={!allTasksDone ? "Complete all tasks first" : ""}
                >
                  {allTasksDone ? <Trophy size={14} /> : <Lock size={14} />} Final Quiz
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── MISSION GRID ── */}
        <div className="rdp-grid-v2">
          <div className="rdp-content-col">
            {!userProgress.joined ? (
              /* JOIN PROMPT */
              <div className="rdp-card-v2 py-12 text-center">
                <Shield size={32} className="text-primary mx-auto mb-3" />
                <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2 italic">
                  Ready to Begin?
                </h3>
                <p className="text-sm text-slate-500 mb-6 px-12">
                  Join this room to start completing tasks and earning XP.
                </p>
                <button
                  onClick={handleJoinRoom}
                  className="px-8 py-3 rounded-lg bg-primary text-white font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform inline-flex items-center gap-3"
                >
                  <Play size={16} /> Start Investigation
                </button>
              </div>
            ) : showQuiz ? (
              /* QUIZ VIEW */
              <div className="rdp-card-v2 rdp-fade-in">
                <div className="rdp-card-header-v2 flex justify-between items-center">
                  <span>Final Assessment</span>
                  <button
                    onClick={() => setShowQuiz(false)}
                    className="text-[10px] text-primary hover:underline"
                  >
                    ← Back to Tasks
                  </button>
                </div>
                <div className="p-8 space-y-8">
                  {(() => {
                    const questions =
                      shuffledQuestions.length > 0
                        ? shuffledQuestions
                        : room.quizzes[0].questions;
                    return questions.map((q, qi) => (
                      <div key={q.id} className="rdp-quiz-q">
                        <p className="text-sm font-bold text-white mb-4">
                          <span className="text-slate-600 mr-2">{qi + 1}.</span>{" "}
                          {q.question_text}
                        </p>
                        <div className="grid gap-2">
                          {q.options.map((opt, oi) => (
                            <label
                              key={oi}
                              className={`px-4 py-3 rounded border text-[11px] font-medium transition-all flex items-center gap-3 cursor-pointer ${quizAnswers[q.id] === opt ? "bg-primary/10 border-primary text-white" : "bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700 shadow-sm"} ${quizSubmitted ? "pointer-events-none" : ""}`}
                            >
                              <input
                                type="radio"
                                name={`q-${q.id}`}
                                className="sr-only"
                                checked={quizAnswers[q.id] === opt}
                                onChange={() =>
                                  !quizSubmitted &&
                                  setQuizAnswers((p) => ({ ...p, [q.id]: opt }))
                                }
                              />
                              <div
                                className={`w-3.5 h-3.5 rounded-full border shrink-0 ${quizAnswers[q.id] === opt ? "border-primary" : "border-slate-700"}`}
                              >
                                {quizAnswers[q.id] === opt && (
                                  <div className="w-full h-full scale-50 bg-primary rounded-full" />
                                )}
                              </div>
                              {opt}
                            </label>
                          ))}
                        </div>
                      </div>
                    ));
                  })()}
                  {!quizSubmitted ? (
                    <button
                      onClick={handleQuizSubmit}
                      className="w-full py-4 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                    >
                      Submit Evaluation
                    </button>
                  ) : (
                    <div
                      className={`p-8 rounded-xl text-center shadow-xl ${quizResults?.passed ? "bg-success/5 border border-success/20" : "bg-danger/5 border border-danger/20"}`}
                    >
                      <h3
                        className={`text-xl font-black mb-1 italic tracking-tighter ${quizResults?.passed ? "text-success" : "text-danger"}`}
                      >
                        {quizResults?.passed
                          ? "MISSION SUCCESSFUL"
                          : "MISSION FAILED"}
                      </h3>
                      <p className="text-sm text-slate-400 mb-6">
                        Score: {quizResults?.percentage}%
                      </p>
                      <button
                        onClick={handleTryAgain}
                        className="px-6 py-2 rounded-lg bg-slate-800 text-white text-[10px] font-black border border-slate-700 uppercase tracking-widest hover:bg-slate-700 transition-colors"
                      >
                        Restart Sector
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* TASK VIEW */
              <div className="rdp-fade-in" key={activeTaskId}>
                {/* Task Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-primary border border-slate-700 shadow-xl">
                      {getTopicIcon(activeTask.title)}
                    </div>
                    <h2 className="text-xl font-black text-white italic tracking-tighter">
                      {activeTask.title}
                    </h2>
                  </div>
                  {userProgress.completedTasks.includes(activeTaskIndex) && (
                    <span className="px-3 py-1 rounded bg-success/10 border border-success/20 text-success text-[10px] font-black uppercase tracking-widest">
                      COMPLETED
                    </span>
                  )}
                </div>

                {/* Task Content Card */}
                <div className="rdp-card-v2">
                  <div className="p-8">
                    {/* Render content blocks saved by admin editor */}
                    {Array.isArray(activeTask.content) && activeTask.content.length > 0 ? (
                      <div className="space-y-4">
                        {activeTask.content.map((block, bi) => {
                          if (block.type === "code") return (
                            <CodeSection key={bi} code={block.content} language="terminal" />
                          );
                          if (block.type === "image") return (
                            <div key={bi} className="rdp-visual-card rdp-fade-in">
                              <img src={block.content} alt="" className="rdp-visual-img" />
                            </div>
                          );
                          return (
                            <div key={bi} className="rdp-prose">
                              <EnhancedContentRenderer content={block.content} title={activeTask.title} />
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <EnhancedContentRenderer content={activeTask.content} title={activeTask.title} />
                    )}

                    {activeTask.codeSnippet && (
                      <div className="mt-8">
                        <CodeSection
                          code={activeTask.codeSnippet}
                          language={activeTask.codeLanguage}
                        />
                      </div>
                    )}

                    {/* Task Questions from admin editor */}
                    {activeTask.taskQuestions?.length > 0 ? (
                      <div className="mt-8 space-y-6">
                        {activeTask.taskQuestions.map((q) => {
                          const key = `${activeTask.id}_${q.id}`;
                          const status = tqStatus[key];
                          return (
                            <div key={key} className="rdp-ans-section">
                              <p className="text-sm font-bold text-white mb-2 leading-relaxed">{q.question_text}</p>
                              {q.hint && (
                                <p className="text-xs text-slate-500 italic mb-3">Hint: {q.hint}</p>
                              )}
                              {status === "correct" ? (
                                <div className="flex items-center gap-2 text-success text-xs font-black">
                                  <Check size={14} /> Correct! +{q.points || 10} XP
                                </div>
                              ) : (
                                <div className="rdp-ans-row">
                                  <input
                                    type="text"
                                    className={`rdp-inp ${status === "wrong" ? "border-red-500" : ""}`}
                                    placeholder="Your answer..."
                                    value={tqAnswers[key] || ""}
                                    onChange={(e) => setTqAnswers((p) => ({ ...p, [key]: e.target.value }))}
                                    onKeyPress={async (e) => {
                                      if (e.key !== "Enter") return;
                                      const res = await submitTaskQuestion(roomId, activeTask.id, q.id, tqAnswers[key] || "");
                                      setTqStatus((p) => ({ ...p, [key]: res.correct ? "correct" : "wrong" }));
                                      if (res.correct) toast({ title: `+${res.pointsEarned} XP`, description: "Correct!" });
                                    }}
                                  />
                                  <button
                                    className="rdp-submit"
                                    onClick={async () => {
                                      const res = await submitTaskQuestion(roomId, activeTask.id, q.id, tqAnswers[key] || "");
                                      setTqStatus((p) => ({ ...p, [key]: res.correct ? "correct" : "wrong" }));
                                      if (res.correct) toast({ title: `+${res.pointsEarned} XP`, description: "Correct!" });
                                    }}
                                  >Submit</button>
                                </div>
                              )}
                              {status === "wrong" && (
                                <p className="text-xs text-red-400 mt-1">Incorrect, try again.</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* fallback: old single-answer exercise */
                      !userProgress.completedTasks.includes(activeTaskIndex) && (
                        <div className="rdp-ans-section">
                          <label className="rdp-ans-lbl">Mission Objective</label>
                          <p className="text-sm font-bold text-white mb-6 leading-relaxed">{activeTask.question}</p>
                          <div className="rdp-ans-row">
                            <input
                              type="text"
                              className="rdp-inp"
                              placeholder="Decrypt flag..."
                              value={taskAnswers[activeTask.id] || ""}
                              onChange={(e) => setTaskAnswers((p) => ({ ...p, [activeTask.id]: e.target.value }))}
                              onKeyPress={(e) => e.key === "Enter" && handleTaskSubmit(activeTask.id, activeTaskIndex)}
                            />
                            <button onClick={() => handleTaskSubmit(activeTask.id, activeTaskIndex)} className="rdp-submit">Submit</button>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Bottom Nav */}
                <div className="flex justify-between items-center mt-8">
                  <button
                    onClick={() =>
                      activeTaskIndex > 0 &&
                      toggleTask(room.tasks[activeTaskIndex - 1].id)
                    }
                    disabled={activeTaskIndex === 0}
                    className="text-[10px] font-black text-slate-500 hover:text-white disabled:opacity-0 transition-colors tracking-widest"
                  >
                    ← PREVIOUS
                  </button>
                  <button
                    onClick={() => {
                      if (activeTaskIndex < room.tasks.length - 1) {
                        toggleTask(room.tasks[activeTaskIndex + 1].id);
                      } else if (room.quizzes?.length > 0 && allTasksDone) {
                        setShowQuiz(true);
                      }
                    }}
                    disabled={
                      activeTaskIndex === room.tasks.length - 1 &&
                      !(room.quizzes?.length > 0 && allTasksDone)
                    }
                    className="text-[10px] font-black text-slate-500 hover:text-white disabled:opacity-0 transition-colors tracking-widest"
                  >
                    {activeTaskIndex === room.tasks.length - 1 && room.quizzes?.length > 0
                      ? "GO TO EVALUATION →"
                      : "NEXT →"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <aside className="rdp-sidebar-v2 rdp-fade-in-right">
            {newHighScore && (
              <div className="bg-success/10 border border-success/20 p-6 rounded-2xl mb-4 animate-bounce flex items-center gap-4 text-success font-black text-xs">
                <Trophy size={20} /> NEW HIGH SCORE! 🎉
              </div>
            )}

            <div className="rdp-card-v2">
              <div className="rdp-card-header-v2">Mission Metrics</div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-bold uppercase tracking-tighter">Best Rank</span>
                  <span className="text-success font-black">{bestScore} XP</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-bold uppercase tracking-tighter">Attempts</span>
                  <span className="text-white font-black">{attemptsCount}</span>
                </div>
              </div>
            </div>

            <div className="rdp-card-v2">
              <div className="rdp-card-header-v2">Intelligence</div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-bold uppercase tracking-tighter">Target</span>
                  <span className="text-white font-bold">{room.category}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-bold uppercase tracking-tighter">Risk Level</span>
                  <span className="text-primary font-bold uppercase">{room.difficulty}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ── Completion Modal ── */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[1000] p-4">
          <div className="max-w-md w-full text-center space-y-8 rdp-fade-in">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center animate-bounce">
                <Award size={48} className="text-primary" />
              </div>
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full -z-10" />
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">
                Mission Accomplished
              </h1>
              <p className="text-slate-400">
                Security breach successful. Data extracted.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="block text-[10px] font-black text-slate-500 uppercase mb-1">
                  XP COLLECTED
                </span>
                <span className="text-2xl font-black text-primary">
                  +{userProgress.totalXP}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="block text-[10px] font-black text-slate-500 uppercase mb-1">
                  SCORE
                </span>
                <span className="text-2xl font-black text-white">
                  {quizResults?.percentage || 100}%
                </span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate("/rooms")}
                className="flex-1 py-4 rounded-xl bg-slate-900 border border-slate-800 text-white font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-colors"
              >
                Marketplace
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="flex-1 py-4 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform"
              >
                Terminal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomDetail;
