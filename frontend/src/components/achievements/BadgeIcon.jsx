import React from 'react';
import { motion } from 'framer-motion';
import { 
  Target, Footprints, ShieldCheck, Timer, CodeXml, 
  DatabaseZap, Network, Target as TargetIcon, 
  BrainCircuit, Zap, Crown, Lock
} from 'lucide-react';

const BadgeIcon = ({ name, iconName, difficulty, earned, size = 64 }) => {
  const getColors = () => {
    if (!earned) return {
      primary: '#1e293b',
      secondary: '#0f172a',
      accent: '#334155',
      glow: 'transparent'
    };

    switch (difficulty) {
      case 'easy': // Green
        return { primary: '#9BFF00', secondary: '#0B0F1A', accent: 'rgba(155, 255, 0, 0.2)', glow: 'rgba(155, 255, 0, 0.4)' };
      case 'medium': // Blue
        return { primary: '#00F5FF', secondary: '#0B0F1A', accent: 'rgba(0, 245, 255, 0.2)', glow: 'rgba(0, 245, 255, 0.4)' };
      case 'hard': // Red
        return { primary: '#FF1414', secondary: '#0B0F1A', accent: 'rgba(255, 20, 20, 0.2)', glow: 'rgba(255, 20, 20, 0.4)' };
      case 'rare': // Gold
        return { primary: '#FFD700', secondary: '#0B0F1A', accent: 'rgba(255, 215, 0, 0.2)', glow: 'rgba(255, 215, 0, 0.4)' };
      case 'legendary': // Purple/Diamond
        return { primary: '#B547FF', secondary: '#0B0F1A', accent: 'rgba(181, 71, 255, 0.2)', glow: 'rgba(181, 71, 255, 0.4)' };
      default:
        return { primary: '#00F5FF', secondary: '#0B0F1A', accent: 'rgba(0, 245, 255, 0.2)', glow: 'rgba(0, 245, 255, 0.4)' };
    }
  };

  const colors = getColors();

  const renderIcon = () => {
    const props = { size: size * 0.5, color: colors.primary };
    switch (iconName) {
      case 'target-lock': return <Target {...props} />;
      case 'footprints': return <Footprints {...props} />;
      case 'shield-check': return <ShieldCheck {...props} />;
      case 'timer': return <Timer {...props} />;
      case 'code-xml': return <CodeXml {...props} />;
      case 'database-zap': return <DatabaseZap {...props} />;
      case 'network': return <Network {...props} />;
      case 'target': return <TargetIcon {...props} />;
      case 'brain-circuit': return <BrainCircuit {...props} />;
      case 'zap': return <Zap {...props} />;
      case 'crown': return <Crown {...props} />;
      default: return <ShieldCheck {...props} />;
    }
  };

  return (
    <div className={`relative flex items-center justify-center bdg-icon-wrapper bdg-${difficulty}`} style={{ width: size, height: size }}>
      {/* Background Glow */}
      {earned && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.6, scale: 1 }}
          className="absolute inset-0 rounded-xl blur-lg transition-all duration-500 bdg-glow-anim"
          style={{ background: colors.glow }}
        />
      )}

      {/* Futuristic Emblem Shape */}
      <svg
        viewBox="0 0 100 100"
        className={`absolute inset-0 w-full h-full drop-shadow-2xl ${earned && (difficulty === 'legendary' || difficulty === 'rare') ? 'bdg-legendary-shield' : ''}`}
        style={{ filter: earned ? `drop-shadow(0 0 8px ${colors.primary})` : 'none' }}
      >
        <path
          d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z"
          fill={colors.secondary}
          stroke={colors.primary}
          strokeWidth="3"
          className="transition-colors duration-500"
        />
        <path
          d="M50 12 L82 28 L82 72 L50 88 L18 72 L18 28 Z"
          fill="none"
          stroke={colors.accent}
          strokeWidth="1"
          strokeDasharray="4 2"
        />
        {earned && (difficulty === 'legendary' || difficulty === 'rare') && (
           <path d="M50 5 L90 25 L50 95 Z" fill="rgba(255,255,255,0.08)" className="bdg-shine-path" />
        )}
      </svg>

      {/* Icon */}
      <div className={`relative z-10 ${earned && (difficulty === 'rare' || difficulty === 'legendary') ? 'bdg-pulse-anim' : ''}`}>
        {earned ? renderIcon() : <Lock size={size * 0.4} color="#334155" opacity={0.6} />}
      </div>

      {/* Corner Accents */}
      {earned && (
        <div className="absolute inset-0 pointer-events-none">
          <motion.div 
            animate={{ opacity: [0.2, 1, 0.2], height: [4, 12, 4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px]" 
            style={{ background: colors.primary }} 
          />
          <motion.div 
            animate={{ opacity: [0.2, 1, 0.2], height: [4, 12, 4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[2px]" 
            style={{ background: colors.primary }} 
          />
        </div>
      )}
    </div>
  );
};

export default BadgeIcon;
