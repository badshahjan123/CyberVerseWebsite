import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { Play, RotateCcw, ArrowLeft, Clock, Target, BookOpen, Info } from "lucide-react"
import { getRoomBySlug } from "../services/rooms"
import { getRoomProgress } from "../services/roomProgress"
import { useApp } from "../contexts/app-context"

const RoomResume = () => {
  const { slug: roomId } = useParams()
  const navigate = useNavigate()
  const { user } = useApp()
  const [room, setRoom] = useState(null)
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [roomData, progressData] = await Promise.all([
          getRoomBySlug(roomId),
          getRoomProgress(roomId)
        ])
        // Transform backend data to match task structure
        if (!roomData.tasks) {
          if (roomData.topics && roomData.topics.length > 0) {
            roomData.tasks = roomData.topics.map((topic, index) => ({
              id: topic.id || index + 1,
              title: topic.title,
              content: topic.content_markdown || topic.content || ''
            }))
          }
        }
        setRoom(roomData)
        setProgress(progressData.progress)
      } catch (error) {
        console.error('Failed to load room resume data:', error)
        navigate('/rooms')
      } finally {
        setLoading(false)
      }
    }

    if (user) loadData()
  }, [roomId, user, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!room || !progress?.joined) {
    navigate('/rooms')
    return null
  }

  const totalTasks = room.tasks?.length || 0
  const completedTasks = progress.completedLectures?.length || 0
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const remainingTasks = totalTasks - completedTasks

  return (
    <div className="min-h-screen bg-slate-950 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        
        <div className="mb-6">
          <Link to="/rooms" className="text-primary hover:text-primary-hover flex items-center gap-2 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back to Rooms
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-accent to-accent-2 rounded-full flex items-center justify-center mx-auto mb-6">
            <Play className="h-10 w-10 text-black" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Resume Your Progress</h1>
          <p className="text-xl text-slate-300">Continue where you left off in <span className="text-accent font-semibold">{room.title}</span></p>
        </div>

        <div className="card p-8 mb-8">
          <div className="text-center mb-6">
            <div className="text-6xl font-bold text-accent mb-2">{progressPercent}%</div>
            <p className="text-slate-400">Current Progress</p>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-400">Progress</span>
              <span className="text-accent font-semibold">{completedTasks} of {totalTasks} tasks completed</span>
            </div>
            <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent to-accent-2 transition-all duration-500 shadow-[0_0_12px_rgba(34,197,94,0.5)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-4 bg-slate-800/50 rounded-lg">
              <Target className="h-8 w-8 text-success mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{completedTasks}</div>
              <div className="text-sm text-slate-400">Tasks Completed</div>
            </div>
            <div className="text-center p-4 bg-slate-800/50 rounded-lg">
              <BookOpen className="h-8 w-8 text-warning mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{remainingTasks}</div>
              <div className="text-sm text-slate-400">Tasks Remaining</div>
            </div>
            <div className="text-center p-4 bg-slate-800/50 rounded-lg">
              <Clock className="h-8 w-8 text-info mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{room.estimated_time_minutes || 30}m</div>
              <div className="text-sm text-slate-400">Est. Time Left</div>
            </div>
          </div>
        </div>

        <div className="card p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Info className="h-5 w-5 text-accent" />
            What's Left to Complete
          </h3>
          <div className="space-y-3">
            {remainingTasks > 0 && (
              <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span className="text-slate-300">Complete {remainingTasks} remaining task{remainingTasks !== 1 ? 's' : ''}</span>
              </div>
            )}
            {room.quizzes && room.quizzes.length > 0 && !progress.quizCompleted && (
              <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
                <div className="w-2 h-2 bg-warning rounded-full"></div>
                <span className="text-slate-300">Pass the final quiz (70% required)</span>
              </div>
            )}
            <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-slate-300">Earn up to {room.points || 500} XP points</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to={`/rooms/${roomId}`} 
            className="btn-primary px-12 py-4 text-xl flex items-center justify-center gap-3 shadow-lg hover:shadow-primary/50 transition-shadow"
          >
            <Play className="h-6 w-6" />
            Resume Room
          </Link>
          <Link 
            to={`/rooms/${roomId}?restart=true`} 
            className="btn-ghost px-8 py-4 text-lg flex items-center justify-center gap-2"
          >
            <RotateCcw className="h-5 w-5" />
            Restart Room
          </Link>
        </div>
      </div>
    </div>
  )
}

export default RoomResume