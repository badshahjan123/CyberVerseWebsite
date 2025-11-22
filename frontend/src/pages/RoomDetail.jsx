import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useApp } from "../contexts/app-context"
import { getRoomBySlug } from "../services/rooms"
import { getRoomProgress, joinRoom, submitExercise, submitQuiz, completeRoom } from "../services/roomProgress"
import { useToast } from "../hooks/use-toast"
import { Play, Lock, CheckCircle, Clock, Trophy, Users, ArrowRight, ArrowLeft, ChevronDown, ChevronUp, Terminal, HelpCircle, Sparkles, Award, X, RefreshCw } from "lucide-react"
import { clearQuizCache } from "../utils/clearQuizCache"

const RoomDetail = () => {
  const { slug: roomId } = useParams()
  const navigate = useNavigate()
  const { user } = useApp()

  // State Management
  const [room, setRoom] = useState(null)
  const [userProgress, setUserProgress] = useState({
    joined: false,
    completedTasks: [],
    taskAnswers: {},
    roomCompleted: false,
    totalXP: 0
  })
  const [expandedTasks, setExpandedTasks] = useState([]) // Array of expanded task IDs
  const [taskAnswers, setTaskAnswers] = useState({}) // Current input values
  const [quizAnswers, setQuizAnswers] = useState({}) // Quiz answer values
  const [showQuiz, setShowQuiz] = useState(false) // Show quiz after tasks
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizResults, setQuizResults] = useState(null)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const [submissionStatus, setSubmissionStatus] = useState({}) // { [taskId]: 'idle'|'submitting'|'success'|'error' }

  // Load room data and user progress
  useEffect(() => {
    const loadRoomData = async () => {
      try {
        // Fetch room data from API using existing service
        const roomData = await getRoomBySlug(roomId)

        // Transform backend data to match task structure
        // Backend has 'topics' field with different structure, transform to 'tasks'
        if (!roomData.tasks) {
          // Check if backend has 'topics' (new structure)
          if (roomData.topics && roomData.topics.length > 0) {
            roomData.tasks = roomData.topics.map((topic, index) => {
              // Find matching exercise by topic id, not by index
              const matchingExercise = roomData.exercises?.find(ex => ex.id === topic.id) || roomData.exercises?.[index]
              return {
                id: topic.id || index + 1,
                title: topic.title,
                content: topic.content_markdown || topic.content || '',
                codeSnippet: topic.codeSnippet,
                codeLanguage: topic.codeLanguage,
                hint: topic.hint,
                question: matchingExercise?.description_markdown || `Complete the task for ${topic.title}`,
                answer: matchingExercise?.expected_flag || matchingExercise?.answer || matchingExercise?.correctAnswer || '',
                xp: matchingExercise?.points || 100
              }
            })
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
              question: lecture.exercise?.question || `Complete the task for ${lecture.title}`,
              answer: lecture.exercise?.correctAnswer?.toString() || '',
              xp: lecture.xp || 100
            }))
          }
        }
        setRoom(roomData)

        console.log('🚀 Room loaded:', roomData.title)
        console.log('📊 Room has tasks:', roomData.tasks?.length)

        // Load user progress if authenticated
        if (user) {
          try {
            const progressData = await getRoomProgress(roomId)
            console.log('📥 Progress data from backend:', progressData)
            console.log('👤 User joined status:', progressData.progress?.joined)

            // If backend returns the default object (no real progress), keep joined as false
            // The backend returns a default when user hasn't joined yet
            const hasRealProgress = progressData.progress?.completedLectures?.length > 0 ||
              progressData.progress?.quizCompleted ||
              progressData.progress?.joined === true

            console.log('✅ Has real progress:', hasRealProgress)

            const totalTasks = roomData.tasks?.length || 0
            const completedTasks = progressData.progress?.completedLectures || []
            const allTasksComplete = completedTasks.length === totalTasks && totalTasks > 0

            // FIX: Only mark room as complete if ALL conditions met:
            // 1. Backend says completed
            // 2. Quiz was completed
            // 3. All tasks are actually done
            const isRoomActuallyComplete = progressData.progress?.completed &&
              progressData.progress?.quizCompleted &&
              allTasksComplete

            setUserProgress({
              joined: progressData.progress?.joined === true ? true : false,
              completedTasks: completedTasks,
              taskAnswers: progressData.progress?.exerciseAnswers || {},
              roomCompleted: isRoomActuallyComplete || false,
              totalXP: progressData.progress?.totalXP || 0
            })

            console.log('🎯 Final joined state:', progressData.progress?.joined === true ? true : false)
            console.log('✅ All tasks complete:', allTasksComplete, `(${completedTasks.length}/${totalTasks})`)
            console.log('🏆 Room completed:', isRoomActuallyComplete)

            // Auto-expand first task if user has joined
            if (progressData.progress?.joined === true) {
              setExpandedTasks([1])
            }

            // Check if all tasks completed to show quiz
            if (allTasksComplete) {
              setShowQuiz(true)
            }

            // FIX: Validate quiz cache - only restore if tasks are complete
            const savedQuizData = localStorage.getItem(`quiz_results_${roomId}`)
            if (savedQuizData) {
              try {
                const { results, submitted, answers } = JSON.parse(savedQuizData)

                // VALIDATION: Only restore quiz state if tasks are actually completed
                if (allTasksComplete) {
                  setQuizResults(results)
                  setQuizSubmitted(submitted)
                  setQuizAnswers(answers)
                  if (results.passed) {
                    setShowQuiz(true)
                  }
                  console.log('✅ Restored quiz cache (tasks complete)')
                } else {
                  // Clear stale cache if tasks aren't done
                  localStorage.removeItem(`quiz_results_${roomId}`)
                  console.log('🧹 Cleared stale quiz cache (tasks incomplete)')
                }
              } catch (e) {
                // Invalid cache data, remove it
                localStorage.removeItem(`quiz_results_${roomId}`)
                console.error('❌ Invalid quiz cache, removed:', e)
              }
            }
          } catch (error) {
            console.error('Failed to load progress:', error)
            // If error loading progress, keep default (not joined)
            console.log('⚠️ Using default state (not joined)')
          }
        } else {
          console.log('🔒 No user logged in')
        }
      } catch (error) {
        console.error('Failed to load room:', error)
        setRoom(null)
      } finally {
        setLoading(false)
      }
    }

    loadRoomData()
  }, [roomId, user])

  // Calculate progress percentage
  const progressPercentage = room?.tasks?.length
    ? (userProgress.completedTasks.length / room.tasks.length) * 100
    : 0

  // Handle Join Room
  const handleJoinRoom = async () => {
    try {
      await joinRoom(roomId)
      setUserProgress(prev => ({ ...prev, joined: true }))
      setExpandedTasks([1])  // Expand first task
    } catch (error) {
      console.error('Failed to join room:', error)
      alert('Failed to join room. Please try again.')
    }
  }

  // Toggle task expansion
  const toggleTask = (taskId) => {
    if (!userProgress.joined) return

    // Check if task is unlocked
    const taskIndex = taskId - 1
    if (taskIndex > 0 && !userProgress.completedTasks.includes(taskIndex)) {
      return // Task is locked
    }

    setExpandedTasks(prev =>
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    )
  }

  // Submit task answer
  const handleTaskSubmit = async (taskId, taskIndex) => {
    const answer = taskAnswers[taskId]
    if (!answer || !room?.tasks?.[taskIndex]) return

    // Get the task data before using it
    const task = room.tasks[taskIndex]

    try {
      // Prevent double submissions
      setSubmissionStatus(prev => ({ ...prev, [taskId]: 'submitting' }))

      // Submit to backend (backend will validate)
      const response = await submitExercise(roomId, taskIndex, answer)
      console.log('🔍 Backend response:', response)
      console.log('✅ isCorrect:', response.correct)
      console.log('📝 Your answer:', answer)
      console.log('🎯 Task index:', taskIndex, '| Task ID:', taskId)
      const isCorrect = response.correct

      if (isCorrect) {
        // Calculate points earned (defined BEFORE using it)
        const pointsEarned = response.pointsEarned || task.xp || 100

        // Immediate UI feedback
        setSubmissionStatus(prev => ({ ...prev, [taskId]: 'success' }))

        // Update user progress immediately so SPA navigation or soft refreshes reflect completion
        setUserProgress(prev => {
          if (prev.completedTasks.includes(taskIndex)) return prev
          return {
            ...prev,
            completedTasks: [...prev.completedTasks, taskIndex],
            taskAnswers: { ...prev.taskAnswers, [taskId]: answer },
            totalXP: prev.totalXP + pointsEarned
          }
        })

        // Show points toast/animation
        try {
          toast({ title: `+${pointsEarned} XP`, description: 'Correct Answer!' })
        } catch (e) {
          // toast is optional; ignore if not available
        }

        // Wait before auto-advancing (keep UX pause)
        setTimeout(() => {
          // Clear input
          setTaskAnswers(prev => ({ ...prev, [taskId]: '' }))

          // Auto-expand next task (unlock)
          if (taskIndex < room.tasks.length - 1) {
            const nextTaskId = room.tasks[taskIndex + 1].id
            setExpandedTasks(prev => Array.from(new Set([...(prev || []), nextTaskId])))
          } else {
            // Last task completed
            if (room.quizzes && room.quizzes.length > 0) {
              setShowQuiz(true)
            } else {
              setUserProgress(prev => ({ ...prev, roomCompleted: true }))
              setShowCompletionModal(true)
            }
          }

          // Mark submission status as done
          setSubmissionStatus(prev => ({ ...prev, [taskId]: 'done' }))

          // Trigger real-time update
          if (window.triggerRealtimeUpdate) window.triggerRealtimeUpdate()
        }, 1500)
      } else {
        // Incorrect answer: show inline error feedback
        setSubmissionStatus(prev => ({ ...prev, [taskId]: 'error' }))
        try {
          toast({ title: 'Incorrect', description: 'Try again!' })
        } catch (e) { }
      }
    } catch (error) {
      console.error('Failed to submit task:', error)
      setSubmissionStatus(prev => ({ ...prev, [taskId]: 'error' }))
      try {
        toast({ title: 'Submission failed', description: 'Please try again.' })
      } catch (e) { }
    }
  }

  // Submit quiz
  const handleQuizSubmit = async () => {
    if (!room.quizzes || room.quizzes.length === 0) return

    const quiz = room.quizzes[0]
    try {
      const response = await submitQuiz(roomId, quiz.id, quizAnswers)
      setQuizResults(response)
      setQuizSubmitted(true)

      // Store quiz results in localStorage to persist across refreshes
      localStorage.setItem(`quiz_results_${roomId}`, JSON.stringify({
        results: response,
        submitted: true,
        answers: quizAnswers
      }))

      // If passed, complete the room
      if (response.passed) {
        const finalTotalXP = userProgress.totalXP + response.earnedPoints

        // FIX: Validate all tasks are complete before calling completeRoom
        const allTasksComplete = userProgress.completedTasks.length === room.tasks.length

        if (!allTasksComplete) {
          console.error('❌ Cannot complete room - not all tasks done:', userProgress.completedTasks.length, '/', room.tasks.length)
          alert('Error: Quiz passed but not all tasks are complete. Please contact support.')
          return
        }

        setTimeout(async () => {
          // Call backend to mark room as complete and update leaderboard
          try {
            await completeRoom(roomId, Date.now(), finalTotalXP)
            console.log('✅ Room marked complete on backend')
          } catch (error) {
            console.error('Failed to mark room as complete:', error)
            // Don't block UI if backend fails, but log it
          }

          setUserProgress(prev => ({
            ...prev,
            roomCompleted: true,
            totalXP: finalTotalXP
          }))
          setShowCompletionModal(true)
        }, 2000)
      }
    } catch (error) {
      console.error('Failed to submit quiz:', error)
      alert('Failed to submit quiz. Please try again.')
    }
  }

  // Task status helper
  const getTaskStatus = (taskIndex) => {
    if (userProgress.completedTasks.includes(taskIndex)) return 'completed'
    if (taskIndex === 0 || userProgress.completedTasks.includes(taskIndex - 1)) return 'available'
    return 'locked'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white">Loading room...</p>
        </div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">Room not found or failed to load</p>
          <button onClick={() => navigate('/rooms')} className="btn-primary px-4 py-2">
            Back to Rooms
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Sticky Progress Bar */}
      <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/rooms')} className="text-primary hover:text-primary-hover flex items-center gap-2 text-sm">
                <ArrowLeft className="h-4 w-4" />
                Back to Rooms
              </button>
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={() => {
                    clearQuizCache(roomId)
                    setQuizResults(null)
                    setQuizSubmitted(false)
                    setQuizAnswers({})
                    toast({ title: 'Quiz cache cleared', description: 'You can now retake the quiz' })
                  }}
                  className="text-slate-400 hover:text-slate-300 flex items-center gap-2 text-xs"
                >
                  <RefreshCw className="h-3 w-3" />
                  Clear Quiz Cache
                </button>
              )}
            </div>
            <div className="text-sm text-slate-400">
              {userProgress.completedTasks.length} / {room.tasks?.length || 0} Tasks Completed
            </div>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 shadow-[0_0_12px_rgba(155,255,0,0.5)]"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Room Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-3">{room.title}</h1>
              <p className="text-lg text-slate-300 mb-4">{room.description}</p>
              <div className="flex items-center gap-6 text-sm text-slate-400">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {room.estimatedTime || room.estimated_time_minutes + ' min'}
                </span>
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {room.participants} completed
                </span>
                <span className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-primary">{room.points} XP</span>
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${room.difficulty === 'Beginner' || room.difficulty === 'Easy'
                  ? 'bg-success/20 text-success border border-success/30'
                  : room.difficulty === 'Intermediate' || room.difficulty === 'Medium'
                    ? 'bg-warning/20 text-warning border border-warning/30'
                    : 'bg-danger/20 text-danger border border-danger/30'
                  }`}>
                  {room.difficulty}
                </span>
              </div>
            </div>

            {/* Join/Resume/Review Room Button */}
            {!userProgress.joined ? (
              // Not joined yet - Show Join button
              <button
                onClick={handleJoinRoom}
                className="btn-primary px-8 py-4 text-lg flex items-center gap-2 shadow-lg hover:shadow-primary/50 transition-shadow"
              >
                <Play className="h-5 w-5" />
                Join Room
              </button>
            ) : !userProgress.roomCompleted ? (
              // Joined but not completed - Show Resume button
              <button
                onClick={() => {
                  // Scroll to current progress
                  const firstIncompleteTask = room.tasks?.findIndex((t, idx) =>
                    !userProgress.completedTasks.includes(idx)
                  )
                  if (firstIncompleteTask !== -1) {
                    setExpandedTasks([firstIncompleteTask + 1])
                  }
                  // Scroll to tasks section
                  setTimeout(() => {
                    window.scrollTo({ top: 400, behavior: 'smooth' })
                  }, 100)
                }}
                className="btn-secondary px-8 py-4 text-lg flex items-center gap-2 shadow-lg hover:shadow-accent/50 transition-shadow"
              >
                <Play className="h-5 w-5" />
                Resume Room
              </button>
            ) : (
              // Completed - Show Review button
              <button
                onClick={() => {
                  // Allow review by expanding all tasks
                  const allTaskIds = room.tasks?.map(t => t.id) || []
                  setExpandedTasks(allTaskIds)
                  window.scrollTo({ top: 400, behavior: 'smooth' })
                }}
                className="btn-ghost px-8 py-4 text-lg flex items-center gap-2"
              >
                <CheckCircle className="h-5 w-5" />
                Review Room
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content: Sidebar + Task Scroll */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT SIDEBAR - Task Navigator (30%) */}
          <div className="lg:col-span-3">
            <div className="sticky top-24 card p-5 space-y-3">
              <h3 className="font-bold text-lg text-white mb-4">Tasks</h3>
              {room.tasks?.map((task, index) => {
                const status = getTaskStatus(index)
                return (
                  <button
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    disabled={status === 'locked'}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${status === 'completed'
                      ? 'bg-success/10 border border-success/30'
                      : status === 'available'
                        ? expandedTasks.includes(task.id)
                          ? 'bg-primary/10 border border-primary/30'
                          : 'bg-white/5 hover:bg-white/10 border border-white/10'
                        : 'bg-slate-800/50 border border-slate-700/50 opacity-50 cursor-not-allowed'
                      }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${status === 'completed' ? 'bg-success' :
                      status === 'available' ? 'bg-primary' : 'bg-slate-600'
                      }`}>
                      {status === 'completed' ? (
                        <CheckCircle className="h-5 w-5 text-white" />
                      ) : status === 'locked' ? (
                        <Lock className="h-4 w-4 text-white" />
                      ) : (
                        <span className="text-white text-sm font-bold">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${status === 'completed' ? 'text-success' :
                        status === 'available' ? 'text-primary' : 'text-slate-500'
                        }`}>
                        Task {index + 1}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{task.title}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* RIGHT CONTENT - Task Cards (70%) */}
          <div className="lg:col-span-9 space-y-6">
            {!userProgress.joined && (
              <div className="card p-8 text-center border-2 border-primary/30 bg-primary/5">
                <Lock className="w-16 h-16 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Join this room to unlock tasks</h3>
                <p className="text-slate-400 mb-6">Click the "Join Room" button above to start your learning journey</p>
              </div>
            )}

            {room.tasks?.map((task, index) => {
              const status = getTaskStatus(index)
              const isExpanded = expandedTasks.includes(task.id)
              const isCompleted = userProgress.completedTasks.includes(index)

              return (
                <div
                  key={task.id}
                  className={`card overflow-hidden transition-all ${!userProgress.joined ? 'blur-sm opacity-50 pointer-events-none' : ''
                    } ${isCompleted ? 'border-success/30' : isExpanded ? 'border-primary/30' : ''}`}
                >
                  {/* Task Header - Always Visible */}
                  <div
                    onClick={() => toggleTask(task.id)}
                    className={`p-6 cursor-pointer flex items-center justify-between ${status === 'locked' ? 'cursor-not-allowed opacity-50' : 'hover:bg-white/5'
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCompleted ? 'bg-success' : status === 'locked' ? 'bg-slate-600' : 'bg-primary'
                        }`}>
                        {isCompleted ? (
                          <CheckCircle className="h-6 w-6 text-white" />
                        ) : status === 'locked' ? (
                          <Lock className="h-5 w-5 text-white" />
                        ) : (
                          <span className="text-white font-bold">{index + 1}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{task.title}</h3>
                        {isCompleted && (
                          <p className="text-sm text-success">Completed • +{task.xp || 100} XP</p>
                        )}
                      </div>
                    </div>
                    {status !== 'locked' && (
                      isExpanded ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />
                    )}
                  </div>

                  {/* Task Content - Collapsible */}
                  {isExpanded && status !== 'locked' && (
                    <div className="border-t border-slate-700">
                      {/* Learning Content */}
                      <div className="p-6 prose prose-invert max-w-none">
                        <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                          {task.content}
                        </div>

                        {/* Code Snippet (if exists) */}
                        {task.codeSnippet && (
                          <div className="mt-6 bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border-b border-slate-700">
                              <Terminal className="w-4 h-4 text-primary" />
                              <span className="text-xs text-slate-400 font-mono">{task.codeLanguage || 'code'}</span>
                            </div>
                            <pre className="p-4 overflow-x-auto">
                              <code className="text-sm text-green-400 font-mono">{task.codeSnippet}</code>
                            </pre>
                          </div>
                        )}

                        {/* Hint (if exists) */}
                        {task.hint && (
                          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                            <div className="flex items-start gap-2">
                              <HelpCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-semibold text-blue-400 mb-1">Hint</p>
                                <p className="text-sm text-slate-300">{task.hint}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Answer Section (Footer) */}
                      {!isCompleted && (
                        <div className="p-6 bg-slate-900/50 border-t border-slate-700">
                          <label className="block text-sm font-semibold text-white mb-3">
                            {task.question}
                          </label>
                          <div className="flex gap-3">
                            <input
                              type="text"
                              value={taskAnswers[task.id] || ''}
                              onChange={(e) => setTaskAnswers(prev => ({ ...prev, [task.id]: e.target.value }))}
                              placeholder="Enter your answer..."
                              className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleTaskSubmit(task.id, index)
                                }
                              }}
                            />
                            <button
                              onClick={() => handleTaskSubmit(task.id, index)}
                              disabled={!taskAnswers[task.id] || submissionStatus[task.id] === 'submitting' || submissionStatus[task.id] === 'success'}
                              className="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Submit
                            </button>
                          </div>
                          {/* Inline submission feedback */}
                          {submissionStatus[task.id] === 'success' && (
                            <div className="mt-3 flex items-center gap-2 text-success">
                              <CheckCircle className="h-5 w-5" />
                              <p className="text-sm font-semibold">Correct Answer!</p>
                            </div>
                          )}

                          {submissionStatus[task.id] === 'error' && (
                            <div className="mt-3 flex items-center gap-2 text-danger">
                              <X className="h-5 w-5" />
                              <p className="text-sm font-semibold">Incorrect answer. Try again.</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Completed State */}
                      {isCompleted && (
                        <div className="p-6 bg-success/10 border-t border-success/30">
                          <div className="flex items-center gap-3 text-success">
                            <CheckCircle className="h-6 w-6" />
                            <div>
                              <p className="font-semibold">Correct Answer!</p>
                              <p className="text-sm">You earned {task.xp || 100} XP</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            {/* QUIZ SECTION - Shows after all tasks completed */}
            {showQuiz && room.quizzes && room.quizzes.length > 0 && (
              <div className="card overflow-hidden border-primary/30">
                <div className="p-6 bg-gradient-to-r from-purple-900/40 to-blue-900/40">
                  <div className="flex items-center gap-3 mb-2">
                    <Trophy className="h-8 w-8 text-warning" />
                    <h2 className="text-2xl font-bold text-white">Final Quiz</h2>
                  </div>
                  <p className="text-slate-300">Test your knowledge to complete the room!</p>
                  {room.quizzes[0].pass_percentage && (
                    <p className="text-sm text-slate-400 mt-2">
                      Pass mark: {room.quizzes[0].pass_percentage}%
                    </p>
                  )}
                </div>

                <div className="p-6 space-y-6">
                  {room.quizzes[0].questions.map((question, qIndex) => (
                    <div key={question.id} className="pb-6 border-b border-slate-700 last:border-0">
                      <p className="font-semibold text-white mb-4">
                        {qIndex + 1}. {question.question_text}
                      </p>

                      {question.type === 'single' && (
                        <div className="space-y-2">
                          {question.options.map((option, optIndex) => (
                            <label
                              key={optIndex}
                              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${quizAnswers[question.id] === option
                                ? 'bg-primary/20 border border-primary/40'
                                : 'bg-white/5 hover:bg-white/10 border border-white/10'
                                } ${quizSubmitted ? 'pointer-events-none' : ''}`}
                            >
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                checked={quizAnswers[question.id] === option}
                                onChange={() => setQuizAnswers(prev => ({ ...prev, [question.id]: option }))}
                                disabled={quizSubmitted}
                                className="w-4 h-4 text-primary"
                              />
                              <span className="text-slate-300">{option}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {/* Show result if quiz submitted */}
                      {quizSubmitted && quizResults?.results && (
                        <div className="mt-3">
                          {quizResults.results.find(r => r.questionId === question.id)?.correct ? (
                            <div className="flex items-start gap-2 p-3 bg-success/10 border border-success/30 rounded-lg">
                              <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-semibold text-success">Correct!</p>
                                {question.explanation && (
                                  <p className="text-xs text-slate-300 mt-1">{question.explanation}</p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start gap-2 p-3 bg-danger/10 border border-danger/30 rounded-lg">
                              <X className="h-5 w-5 text-danger flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-semibold text-danger">Incorrect</p>
                                {question.explanation && (
                                  <p className="text-xs text-slate-300 mt-1">{question.explanation}</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Quiz Submit/Results */}
                  {!quizSubmitted ? (
                    <button
                      onClick={handleQuizSubmit}
                      disabled={Object.keys(quizAnswers).length < room.quizzes[0].questions.length}
                      className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit Quiz
                    </button>
                  ) : quizResults && (
                    <div className={`p-6 rounded-lg border-2 ${quizResults.passed
                      ? 'bg-success/10 border-success/30'
                      : 'bg-danger/10 border-danger/30'
                      }`}>
                      <div className="text-center">
                        <p className={`text-2xl font-bold mb-2 ${quizResults.passed ? 'text-success' : 'text-danger'
                          }`}>
                          {quizResults.passed ? '🎉 Quiz Passed!' : '❌ Quiz Failed'}
                        </p>
                        <p className="text-lg text-white mb-4">
                          Score: {quizResults.percentage}% ({quizResults.earnedPoints}/{quizResults.totalPoints} points)
                        </p>
                        {quizResults.passed ? (
                          <p className="text-slate-300">Great job! You've completed the room!</p>
                        ) : (
                          <button
                            onClick={() => {
                              setQuizSubmitted(false)
                              setQuizAnswers({})
                              setQuizResults(null)
                            }}
                            className="btn-ghost px-6 py-2 mt-2"
                          >
                            Try Again
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full text-center p-8 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Trophy className="h-10 w-10 text-black" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Room Completed!</h2>
            <p className="text-lg text-slate-300 mb-4">Congratulations on completing {room.title}</p>

            {/* Score Breakdown */}
            <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-4xl font-bold text-primary mb-3">
                <Sparkles className="h-8 w-8" />
                <span>{userProgress.totalXP} XP</span>
                <Sparkles className="h-8 w-8" />
              </div>
              <div className="text-sm text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Tasks Completed:</span>
                  <span className="text-primary font-semibold">
                    {userProgress.completedTasks.length} × {room.tasks?.[0]?.xp || 100} = {userProgress.completedTasks.length * (room.tasks?.[0]?.xp || 100)} XP
                  </span>
                </div>
                {quizResults && (
                  <div className="flex justify-between">
                    <span>Quiz Bonus:</span>
                    <span className="text-accent font-semibold">+{quizResults.earnedPoints} XP</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/rooms')}
                className="flex-1 btn-ghost py-3"
              >
                Back to Rooms
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 btn-primary py-3"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RoomDetail