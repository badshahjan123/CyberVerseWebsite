import { useState, useEffect, useCallback, useMemo } from 'react'
import { Award, Trophy, Calendar, Lock, Zap, Star, Shield, Target } from 'lucide-react'
import { useApp } from '../../contexts/app-context'
import { useRealtime } from '../../contexts/realtime-context'
import { apiCall } from '../../config/api'
import BadgeIcon from '../../components/achievements/BadgeIcon'
import './Badges.css'

/* ── Difficulty colour map ── */
const DIFF_COLOR = {
  common:    { color: '#39FF14', label: 'Common'    },
  uncommon:  { color: '#00F5FF', label: 'Uncommon'  },
  rare:      { color: '#8B5CF6', label: 'Rare'      },
  legendary: { color: '#FACC15', label: 'Legendary' },
}

/* ── Badge type pill ── */
const TypePill = ({ type }) => {
  const map = {
    primary:   { label: 'Primary',   bg: 'rgba(0,245,255,0.1)',   color: '#00F5FF',  border: 'rgba(0,245,255,0.25)'  },
    bonus:     { label: 'Bonus',     bg: 'rgba(250,204,21,0.1)',  color: '#FACC15',  border: 'rgba(250,204,21,0.3)'  },
    milestone: { label: 'Milestone', bg: 'rgba(139,92,246,0.1)', color: '#8B5CF6',  border: 'rgba(139,92,246,0.25)' },
  }
  const s = map[type] || map.milestone
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 5,
      fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em',
      background: s.bg, color: s.color, border: `1px solid ${s.border}`
    }}>
      {type === 'bonus' ? <Star size={8} /> : type === 'primary' ? <Shield size={8} /> : <Target size={8} />}
      {s.label}
    </span>
  )
}

/* ── Single badge card ── */
const BadgeCard = ({ badge, index }) => {
  const diff = DIFF_COLOR[badge.difficulty] || DIFF_COLOR.common
  const isBonus = badge.badgeType === 'bonus'

  return (
    <div
      className={`bdg-card ${badge.earned ? 'bdg-card--earned' : 'bdg-card--locked'} ${isBonus && badge.earned ? 'bdg-card--bonus' : ''}`}
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      {/* Top accent line for earned bonus badges */}
      {badge.earned && isBonus && <div className="bdg-card__accent" />}

      <div className="bdg-card__top">
        <BadgeIcon
          name={badge.name}
          iconName={badge.icon}
          difficulty={badge.difficulty}
          earned={badge.earned}
          size={64}
        />
        <div className="bdg-card__meta">
          <TypePill type={badge.badgeType} />
          <div className="bdg-card__diff" style={{ color: diff.color }}>
            <span className="bdg-card__diff-dot" style={{ background: diff.color }} />
            {diff.label}
          </div>
        </div>
      </div>

      <div className="bdg-card__body">
        <h3 className="bdg-card__name">
          {badge.earned ? badge.name : <><Lock size={12} style={{ display:'inline', marginRight:5, opacity:0.4 }} />Locked</>}
        </h3>
        <p className="bdg-card__desc">
          {badge.earned ? badge.description : badge.unlockReason}
        </p>
      </div>

      <div className="bdg-card__footer">
        {badge.earned ? (
          <>
            <div className="bdg-card__earned-at">
              <Calendar size={10} />
              {new Date(badge.earnedAt).toLocaleDateString()}
            </div>
            {badge.xpReward > 0 && (
              <div className="bdg-card__xp">
                <Zap size={10} />
                +{badge.xpReward} XP
              </div>
            )}
          </>
        ) : (
          <div className="bdg-card__unlock-hint">
            {badge.unlockReason}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Filter tabs ── */
const TABS = [
  { id: 'all',       label: 'All'       },
  { id: 'earned',    label: 'Earned'    },
  { id: 'locked',    label: 'Locked'    },
  { id: 'room',      label: 'Room'      },
  { id: 'milestone', label: 'Milestone' },
]

/* ── Main page ── */
const Badges = () => {
  const { user } = useApp()
  const { userStats } = useRealtime()
  const [badges, setBadges]   = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState('all')

  const fetchBadges = useCallback(async () => {
    try {
      setLoading(true)
      const res = await apiCall('/user/badges')
      if (res?.badges) setBadges(res.badges)
    } catch (e) {
      console.error('Badge fetch error:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchBadges() }, [fetchBadges])

  const filtered = useMemo(() => {
    switch (tab) {
      case 'earned':    return badges.filter(b => b.earned)
      case 'locked':    return badges.filter(b => !b.earned)
      case 'room':      return badges.filter(b => b.category === 'room')
      case 'milestone': return badges.filter(b => b.category === 'milestone' || b.category === 'streak')
      default:          return badges
    }
  }, [badges, tab])

  const earned    = badges.filter(b => b.earned).length
  const total     = badges.length
  const bonusEarned = badges.filter(b => b.earned && b.badgeType === 'bonus').length
  const pct       = total > 0 ? Math.round((earned / total) * 100) : 0
  const points    = userStats?.totalXP || user?.points || 0

  if (loading) return (
    <div className="bdg-root bdg-root--loading">
      <div className="bdg-spinner" />
    </div>
  )

  return (
    <div className="bdg-root">
      <div className="bdg-bg-grid" aria-hidden="true" />
      <div className="bdg-bg-glow" aria-hidden="true" />

      <div className="bdg-wrap">

        {/* ── Header ── */}
        <header className="bdg-header">
          <div className="bdg-header__left">
            <div className="bdg-header__icon"><Trophy size={20} /></div>
            <div>
              <h1 className="bdg-header__title">Badges</h1>
              <p className="bdg-header__sub">
                Verified achievements earned through field operations in CyberVerse.
              </p>
            </div>
          </div>

          {/* Stats strip */}
          <div className="bdg-stats">
            <div className="bdg-stat">
              <div className="bdg-stat__val" style={{ color: '#00F5FF' }}>{earned}<span className="bdg-stat__total">/{total}</span></div>
              <div className="bdg-stat__label">Earned</div>
            </div>
            <div className="bdg-stat-divider" />
            <div className="bdg-stat">
              <div className="bdg-stat__val" style={{ color: '#FACC15' }}>{bonusEarned}</div>
              <div className="bdg-stat__label">Bonus</div>
            </div>
            <div className="bdg-stat-divider" />
            <div className="bdg-stat">
              <div className="bdg-stat__val" style={{ color: '#39FF14' }}>{points.toLocaleString()}</div>
              <div className="bdg-stat__label">Total XP</div>
            </div>
            {/* Progress ring */}
            <div className="bdg-ring-wrap">
              <svg width="56" height="56" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                <circle
                  cx="28" cy="28" r="22" fill="none"
                  stroke="#00F5FF" strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 22}`}
                  strokeDashoffset={`${2 * Math.PI * 22 * (1 - pct / 100)}`}
                  transform="rotate(-90 28 28)"
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
              </svg>
              <span className="bdg-ring-pct">{pct}%</span>
            </div>
          </div>
        </header>

        {/* ── Tabs ── */}
        <div className="bdg-tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`bdg-tab ${tab === t.id ? 'bdg-tab--active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
              {t.id === 'earned' && earned > 0 && (
                <span className="bdg-tab__count">{earned}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Earned section ── */}
        {(tab === 'all' || tab === 'earned') && filtered.filter(b => b.earned).length > 0 && (
          <section className="bdg-section">
            {tab === 'all' && (
              <div className="bdg-section__header">
                <Award size={14} style={{ color: '#39FF14' }} />
                <span>Earned — {filtered.filter(b => b.earned).length}</span>
              </div>
            )}
            <div className="bdg-grid">
              {filtered.filter(b => b.earned).map((badge, i) => (
                <BadgeCard key={badge.name} badge={badge} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* ── Locked section ── */}
        {(tab === 'all' || tab === 'locked') && filtered.filter(b => !b.earned).length > 0 && (
          <section className="bdg-section">
            {tab === 'all' && (
              <div className="bdg-section__header bdg-section__header--locked">
                <Lock size={14} style={{ color: '#475569' }} />
                <span>Locked — {filtered.filter(b => !b.earned).length}</span>
              </div>
            )}
            <div className="bdg-grid">
              {filtered.filter(b => !b.earned).map((badge, i) => (
                <BadgeCard key={badge.name} badge={badge} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* ── Filtered (non-all tabs) ── */}
        {tab !== 'all' && tab !== 'earned' && tab !== 'locked' && (
          <section className="bdg-section">
            {filtered.length === 0 ? (
              <div className="bdg-empty">
                <Award size={40} style={{ color: '#1E293B' }} />
                <p>No badges in this category yet.</p>
              </div>
            ) : (
              <div className="bdg-grid">
                {filtered.map((badge, i) => (
                  <BadgeCard key={badge.name} badge={badge} index={i} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── All empty ── */}
        {filtered.length === 0 && tab === 'all' && (
          <div className="bdg-empty">
            <Award size={40} style={{ color: '#1E293B' }} />
            <p>Complete rooms to earn your first badge.</p>
          </div>
        )}

      </div>
    </div>
  )
}

export default Badges
