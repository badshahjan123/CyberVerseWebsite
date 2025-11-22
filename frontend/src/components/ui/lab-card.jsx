"use client"

import { Link } from "react-router-dom"
import { Clock, Users, Trophy, Lock, Play, Award, CheckCircle2 } from "lucide-react"
import { GlassCard, GlassCardContent, GlassCardHeader } from "./glass-card"
import { ModernButton } from "./modern-button"
import { Badge } from "./badge"

export function LabCard({
  lab,
  isPremium = false,
  userProgress = 0,
  isCompleted = false,
  isLocked = false
}) {
  const getDifficultyConfig = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
      case 'easy':
        return {
          className: 'bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 border border-green-500/30',
          dotColor: 'bg-green-400'
        }
      case 'intermediate':
      case 'medium':
        return {
          className: 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-400 border border-yellow-500/30',
          dotColor: 'bg-yellow-400'
        }
      case 'advanced':
      case 'hard':
        return {
          className: 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-400 border border-orange-500/30',
          dotColor: 'bg-orange-400'
        }
      case 'expert':
      case 'insane':
        return {
          className: 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 border border-red-500/30',
          dotColor: 'bg-red-400'
        }
      default:
        return {
          className: 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-400 border border-gray-500/30',
          dotColor: 'bg-gray-400'
        }
    }
  }

  const difficultyConfig = getDifficultyConfig(lab.difficulty)

  return (
    <GlassCard className="group hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 overflow-hidden">
      <GlassCardHeader className="relative p-5 pb-3 bg-gradient-to-br from-white/5 to-transparent">
        {/* Premium Badge */}
        {isPremium && (
          <Badge className="absolute top-3 right-3 bg-gradient-to-r from-warning/20 to-warning/10 text-warning border border-warning/30 text-xs font-semibold px-2 py-1">
            <Trophy className="w-3 h-3 mr-1" />
            PRO
          </Badge>
        )}

        {/* Completed Badge */}
        {isCompleted && !isLocked && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-success/20 to-success/10 text-success border border-success/30 text-xs font-semibold px-2 py-1 rounded-md flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </div>
        )}

        {/* Locked Overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md rounded-t-lg flex flex-col items-center justify-center z-10">
            <Lock className="w-10 h-10 text-primary/50 mb-2" />
            <span className="text-xs text-muted font-semibold">Premium Only</span>
          </div>
        )}

        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-text mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {lab.title}
            </h3>
            <Badge className={`text-xs font-semibold px-2.5 py-1 ${difficultyConfig.className}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${difficultyConfig.dotColor} mr-1.5`}></span>
              {lab.difficulty}
            </Badge>
          </div>
        </div>
      </GlassCardHeader>

      <GlassCardContent className="p-5 pt-3 space-y-4">
        <p className="text-text-secondary text-sm line-clamp-2 leading-relaxed">
          {lab.description}
        </p>

        {/* Progress Bar */}
        {userProgress > 0 && !isCompleted && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted font-medium">Progress</span>
              <span className="text-primary font-semibold">{userProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(155,255,0,0.3)]"
                style={{ width: `${userProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="flex items-center gap-4 text-xs text-muted">
          <div className="flex items-center gap-1.5 hover:text-text transition-colors">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-medium">{lab.duration}</span>
          </div>
          <div className="flex items-center gap-1.5 hover:text-text transition-colors">
            <Users className="w-3.5 h-3.5" />
            <span className="font-medium">{lab.participants}</span>
          </div>
          <div className="flex items-center gap-1.5 hover:text-primary transition-colors">
            <Trophy className="w-3.5 h-3.5 text-primary" />
            <span className="font-semibold text-primary">{lab.points} pts</span>
          </div>
        </div>

        {/* Action Button */}
        <ModernButton
          variant={isCompleted ? "ghost" : "primary"}
          size="sm"
          className="w-full font-semibold"
          asChild
          disabled={isLocked}
        >
          <Link to={`/labs/${lab.id}`} className="flex items-center justify-center gap-2">
            {isCompleted ? (
              <>
                <Award className="w-4 h-4" />
                Review Lab
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                {userProgress > 0 ? 'Continue' : 'Start Lab'}
              </>
            )}
          </Link>
        </ModernButton>
      </GlassCardContent>
    </GlassCard>
  )
}