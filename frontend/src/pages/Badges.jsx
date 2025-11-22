import { useState, useEffect } from 'react'
import { Award, Trophy, Star, Calendar } from 'lucide-react'
import { useApp } from '../contexts/app-context'

const Badges = () => {
    const { user } = useApp()
    const [badges, setBadges] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchBadges = async () => {
            try {
                const token = localStorage.getItem('token')
                const response = await fetch('http://localhost:5000/api/user/badges', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                if (response.ok) {
                    const data = await response.json()
                    setBadges(data.badges || [])
                }
            } catch (error) {
                console.error('Failed to fetch badges:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchBadges()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-text mb-2">My Badges</h1>
                <p className="text-muted">Track your achievements and milestones</p>
            </div>

            {badges.length === 0 ? (
                <div className="card p-12 text-center">
                    <Award className="w-16 h-16 text-muted mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-text mb-2">No Badges Yet</h3>
                    <p className="text-muted">Complete challenges and rooms to earn badges!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {badges.map((badge, index) => (
                        <div
                            key={index}
                            className="card p-6 hover:border-primary/50 transition-all group"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                                    {badge.icon ? (
                                        <span className="text-3xl">{badge.icon}</span>
                                    ) : (
                                        <Trophy className="w-8 h-8 text-white" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-text group-hover:text-primary transition-colors">
                                        {badge.name}
                                    </h3>
                                    <p className="text-xs text-muted flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(badge.earnedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-muted">{badge.description}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Badges
