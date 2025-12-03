import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { Trophy, Star, Clock, Target, ArrowRight, RotateCcw, Home } from "lucide-react"
import { getRoomBySlug } from "../services/rooms"
import { getRoomProgress, resetRoomProgress } from "../services/roomProgress"
import { useApp } from "../contexts/app-context"
import { useActivity } from "../contexts/activity-context"
import { useToast } from "../hooks/use-toast"

const RoomCompleted = () => {
  const { slug: roomId } = useParams()
  const navigate = useNavigate()
  const { user } = useApp()
  const { resetRoomProgress: resetActivityProgress } = useActivity()
  const { toast } = useToast()
  const [room, setRoom] = useState(null)
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [roomData, progressData] = await Promise.all([
          getRoomBySlug(roomId),
          getRoomProgress(roomId)
        ])
        setRoom(roomData)
        setProgress(progressData.progress)
      } catch (error) {
        console.error('Failed to load room completion data:', error)
        navigate('/rooms')
      } finally {
        setLoading(false)
      }
    }

    if (user) loadData()
  }, [roomId, user, navigate])

  const handleTryAgain = async () => {
    try {
      setResetting(true)
      await resetRoomProgress(roomId)
      resetActivityProgress(roomId)
      toast({ title: 'Progress Reset', description: 'Starting fresh!' })
      navigate(`/rooms/${roomId}`)
    } catch (error) {
      console.error('Failed to reset progress:', error)
      toast({ title: 'Reset Failed', description: 'Please try again.' })
    } finally {
      setResetting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!room || !progress?.completed) {
    navigate('/rooms')
    return null
  }

  const stats = {
    score: progress.finalScore && progress.finalScore > 1000000000000 ? 
      (progress.quizScore?.percentage || 100) : (progress.finalScore || progress.quizScore?.percentage || 100),
    xp: progress.totalPointsEarned || (progress.taskScores?.reduce((sum, task) => sum + (task.pointsEarned || 0), 0) + (progress.quizScore?.pointsEarned || 0)) || room.points || 500,
    timeSpent: "15 min",
    tasksCompleted: progress.completedLectures?.length || 0
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Trophy className="h-12 w-12 text-black" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Room Completed!</h1>
          <p className="text-xl text-slate-300">Congratulations on completing <span className="text-primary font-semibold">{room.title}</span></p>
        </div>

        <div className="card p-8 mb-8">
          <div className="text-center mb-6">
            <div className="text-6xl font-bold text-primary mb-2">100%</div>
            <p className="text-slate-400">Full Progress Achieved</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center p-4 bg-slate-800/50 rounded-lg">
              <Star className="h-8 w-8 text-warning mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.score}%</div>
              <div className="text-sm text-slate-400">Final Score</div>
            </div>
            <div className="text-center p-4 bg-slate-800/50 rounded-lg">
              <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">{stats.xp}</div>
              <div className="text-sm text-slate-400">XP Earned</div>
            </div>
            <div className="text-center p-4 bg-slate-800/50 rounded-lg">
              <Clock className="h-8 w-8 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.timeSpent}</div>
              <div className="text-sm text-slate-400">Time Taken</div>
            </div>
            <div className="text-center p-4 bg-slate-800/50 rounded-lg">
              <Target className="h-8 w-8 text-success mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.tasksCompleted}</div>
              <div className="text-sm text-slate-400">Tasks Done</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Achievements Unlocked
            </h3>
            <div className="flex flex-wrap gap-3">
              <div className="px-3 py-1 bg-primary/20 border border-primary/30 text-primary rounded-full text-sm font-semibold">
                Room Completed
              </div>
              {stats.score >= 90 && (
                <div className="px-3 py-1 bg-warning/20 border border-warning/30 text-warning rounded-full text-sm font-semibold">
                  High Scorer
                </div>
              )}
              <div className="px-3 py-1 bg-success/20 border border-success/30 text-success rounded-full text-sm font-semibold">
                All Tasks Complete
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">What's Next?</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700 hover:border-primary/30 transition-colors">
              <h4 className="font-semibold text-white mb-2">Similar Rooms</h4>
              <p className="text-sm text-slate-400 mb-3">Continue with {room.category} challenges</p>
              <Link to={`/rooms?category=${room.category}`} className="text-primary hover:text-primary-hover text-sm font-semibold flex items-center gap-1">
                Explore More <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700 hover:border-accent/30 transition-colors">
              <h4 className="font-semibold text-white mb-2">Next Difficulty</h4>
              <p className="text-sm text-slate-400 mb-3">Ready for harder challenges?</p>
              <Link to="/rooms?difficulty=Hard" className="text-accent hover:text-accent-hover text-sm font-semibold flex items-center gap-1">
                Level Up <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/rooms" className="btn-primary px-8 py-3 text-lg flex items-center justify-center gap-2">
            <Target className="h-5 w-5" />
            Continue More
          </Link>
          <Link to="/dashboard" className="btn-secondary px-8 py-3 text-lg flex items-center justify-center gap-2">
            <Home className="h-5 w-5" />
            Go to Dashboard
          </Link>
          <Link to={`/rooms/${roomId}`} className="btn-ghost px-6 py-3 text-lg flex items-center justify-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Review Room
          </Link>
          <button 
            onClick={handleTryAgain}
            disabled={resetting}
            className="btn-secondary px-6 py-3 text-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RotateCcw className={`h-5 w-5 ${resetting ? 'animate-spin' : ''}`} />
            {resetting ? 'Resetting...' : 'Try Again'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default RoomCompleted