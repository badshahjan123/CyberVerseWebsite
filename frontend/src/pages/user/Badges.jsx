import { useState, useEffect, useCallback, useMemo, memo } from "react";
import {
  Award,
  Trophy,
  Calendar,
  Lock,
  Zap,
  Star,
  Shield,
  Target,
  Users,
  Flame,
  ArrowRight
} from "lucide-react";
import { useApp } from "../../contexts/app-context";
import { useRealtime } from "../../contexts/realtime-context";
import { apiCall } from "../../config/api";
import { getLevelProgressInfo } from "../../utils/xpConfig";
import BadgeIcon from "../../components/achievements/BadgeIcon";
import "./Badges.css";

/* ── Difficulty colour map ── */
const DIFF_COLOR = {
  common: { color: "#39FF14", label: "Common" },
  uncommon: { color: "#00D1FF", label: "Uncommon" },
  rare: { color: "#A855F7", label: "Rare" },
  legendary: { color: "#FFB800", label: "Legendary" },
};

/* ── Badge type pill ── */
const TypePill = ({ type }) => {
  const map = {
    primary: { label: "Primary", color: "#00D1FF", bg: "rgba(0,209,255,0.1)", border: "rgba(0,209,255,0.2)" },
    bonus: { label: "Bonus", color: "#FFB800", bg: "rgba(255,184,0,0.1)", border: "rgba(255,184,0,0.25)" },
    milestone: { label: "Milestone", color: "#A855F7", bg: "rgba(168,85,247,0.1)", border: "rgba(168,85,247,0.2)" },
  };
  const s = map[type] || map.milestone;
  return (
    <span className="bdg-type-pill" style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>
      {type === "bonus" ? <Star size={8} /> : type === "primary" ? <Shield size={8} /> : <Target size={8} />}
      {s.label}
    </span>
  );
};

/* ── Single badge card ── */
const BadgeCard = memo(({ badge, index }) => {
  const diff = DIFF_COLOR[badge.difficulty] || DIFF_COLOR.common;
  const isBonus = badge.badgeType === "bonus";

  const rarityClass = badge.earned
    ? badge.difficulty === "legendary"
      ? "badge-card-legendary"
      : badge.difficulty === "rare" || badge.difficulty === "epic"
      ? "badge-card-rare"
      : "badge-card-common"
    : "bdg-card--locked";

  return (
    <div className={`bdg-card ${badge.earned ? "bdg-card--earned" : ""} ${rarityClass}`} style={{ animationDelay: `${index * 50}ms` }}>
      {/* Accent glow for legendary/special badges */}
      {badge.earned && badge.difficulty === "legendary" && <div className="bdg-card__legendary-glow" />}
      <div className="bdg-card__accent-line" style={{ background: diff.color }} />

      <div className="bdg-card__top">
        <div className="bdg-card__icon-wrap">
          <BadgeIcon
            name={badge.name}
            iconName={badge.icon}
            difficulty={badge.difficulty}
            earned={badge.earned}
            size={56}
          />
        </div>
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
          {!badge.earned && <Lock size={12} className="opacity-40" />}
          {badge.earned ? badge.name : "Encrypted Badge"}
        </h3>
        <p className="bdg-card__desc">
          {badge.earned ? badge.description : badge.unlockReason}
        </p>
      </div>

      <div className="bdg-card__footer">
        {badge.earned ? (
          <>
            <div className="bdg-card__stat">
              <Calendar size={10} /> {new Date(badge.earnedAt).toLocaleDateString()}
            </div>
            {badge.xpReward > 0 && (
              <div className="bdg-card__stat bdg-card__stat--xp">
                <Zap size={10} /> +{badge.xpReward} XP
              </div>
            )}
          </>
        ) : (
          <div className="bdg-card__unlock-hint">Locked Achievement</div>
        )}
      </div>
    </div>
  );
});

/* ── Filters ── */
const TABS = [
  { id: "all", label: "All Records" },
  { id: "earned", label: "Earned" },
  { id: "locked", label: "Locked" },
  { id: "milestone", label: "Milestones" },
  { id: "skill", label: "Skills" },
  { id: "streak", label: "Streaks" },
];

const Badges = () => {
  const { user } = useApp();
  const { userStats } = useRealtime();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");

  const fetchBadges = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiCall("/user/badges");
      if (res?.badges) setBadges(res.badges);
    } catch (e) {
      console.error("Badge fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBadges(); }, [fetchBadges]);

  const filtered = useMemo(() => {
    switch (tab) {
      case "earned": return badges.filter(b => b.earned);
      case "locked": return badges.filter(b => !b.earned);
      case "milestone": return badges.filter(b => b.category === "milestone" || b.badgeType === "milestone");
      case "skill": return badges.filter(b => b.category === "skill" || b.badgeType === "skill");
      case "streak": return badges.filter(b => b.category === "streak" || b.badgeType === "streak");
      default: return badges;
    }
  }, [badges, tab]);

  const earnedCount = badges.filter(b => b.earned).length;
  const totalCount = badges.length;
  const bonusCount = badges.filter(b => b.earned && b.badgeType === "bonus").length;
  const pct = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;
  const xpCount = userStats?.totalXP || user?.points || 0;
  const levelInfo = getLevelProgressInfo(xpCount);

  if (loading) return (
    <div className="bdg-page bdg-page--loading min-h-screen flex items-center justify-center">
      <div className="bdg-spinner" />
    </div>
  );

  return (
    <div className="bdg-page min-h-screen relative overflow-x-hidden text-white">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none bdg-page__grid" />
      <div className="absolute inset-0 z-0 pointer-events-none bdg-page__overlay" />

      <div className="relative z-10">
        {/* ═══ HERO ═══ */}
        <div className="bdg-hero relative overflow-hidden">
          <div className="bdg-hero__glow-orange" />
          <div className="bdg-hero__glow-cyan" />

          <div className="relative max-w-6xl mx-auto px-6 pt-12 pb-14">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bdg-hero__icon-box">
                    <Trophy size={24} className="bdg-text-orange" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.2em] bdg-text-cyan">
                    Combat Merit
                  </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">
                  Achievement <span className="bdg-text-orange">Badges</span>
                </h1>
                <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
                  Military-grade awards granted for technical mastery, field operations, and consistent dedication to the CyberVerse training protocols.
                </p>
              </div>

              {/* Stats Strip */}
              <div className="bdg-stats-card flex items-center p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
                <div className="flex items-center gap-8 px-2">
                  <div className="text-center">
                    <p className="text-3xl font-black text-white">{earnedCount}<span className="text-xs text-slate-500 ml-1">/{totalCount}</span></p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Earned</p>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="text-center">
                    <p className="text-3xl font-black bdg-text-orange">{bonusCount}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Bonus</p>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="text-center font-mono">
                    <p className="text-3xl font-black text-white">{levelInfo.currentLevel}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Combat Level</p>
                  </div>
                  <div className="text-left font-mono ml-4 max-w-[140px]">
                    <p className="text-sm font-black" style={{ color: levelInfo.color }}>{levelInfo.title.toUpperCase()}</p>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-1 mb-1">
                      <div className="h-full rounded-full transition-all" style={{ width: `${levelInfo.xpProgress}%`, backgroundColor: levelInfo.color }} />
                    </div>
                    <p className="text-[9px] font-bold text-slate-400">{levelInfo.xpNeeded.toLocaleString()} XP to {levelInfo.nextTitle}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-10">
          {/* ═══ TOOLBAR ═══ */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12">
            <div className="bdg-tab-group w-full lg:w-auto">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`bdg-tab ${tab === t.id ? "bdg-tab--active" : ""}`}
                >
                  {t.label}
                  {t.id === "earned" && earnedCount > 0 && <span className="bdg-tab-count ml-2">{earnedCount}</span>}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <Flame size={14} className="bdg-text-orange" /> Active Season: 1
            </div>
          </div>

          {/* ═══ GRID SECTIONS ═══ */}
          <div className="space-y-16">
            {/* Earned Section */}
            {(tab === "all" || tab === "earned") && filtered.filter(b => b.earned).length > 0 && (
              <section>
                {(tab === "all") && (
                  <div className="flex items-center gap-3 mb-8">
                    <Award size={16} className="text-emerald-400" />
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400/70">Verified Achievements — {filtered.filter(b => b.earned).length}</h2>
                    <div className="flex-1 h-px bg-emerald-400/10" />
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filtered.filter(b => b.earned).map((badge, i) => (
                    <BadgeCard key={badge.name} badge={badge} index={i} />
                  ))}
                </div>
              </section>
            )}

            {/* Locked Section */}
            {(tab === "all" || tab === "locked") && filtered.filter(b => !b.earned).length > 0 && (
              <section>
                {(tab === "all") && (
                  <div className="flex items-center gap-3 mb-8">
                    <Lock size={16} className="text-slate-600" />
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-600">Classified Intel — {filtered.filter(b => !b.earned).length}</h2>
                    <div className="flex-1 h-px bg-white/5" />
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filtered.filter(b => !b.earned).map((badge, i) => (
                    <BadgeCard key={badge.name} badge={badge} index={i + 10} />
                  ))}
                </div>
              </section>
            )}

            {/* Non-all Empty State */}
            {tab !== "all" && filtered.length === 0 && (
              <div className="bdg-empty-state py-24 flex flex-col items-center border border-dashed border-white/10 rounded-3xl bg-white/5">
                <Target size={40} className="text-slate-600 mb-4" />
                <p className="text-xl font-bold text-white mb-2">Target Empty</p>
                <p className="text-sm text-slate-400 mb-8">No results found in this achievement category.</p>
                <button onClick={() => setTab("all")} className="bdg-btn-orange">Reset Filter</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Badges;
