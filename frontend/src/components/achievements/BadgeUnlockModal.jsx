import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, X, Sparkles, ChevronRight } from 'lucide-react';
import BadgeIcon from './BadgeIcon';
import confetti from 'canvas-confetti';

const BadgeUnlockModal = ({ badge, onClose }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (badge) {
      setShow(true);
      
      // Trigger confetti
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      // Sound effect (optional if audio assets exist)
      try {
        const audio = new Audio('/sounds/achievement.mp3'); 
        audio.volume = 0.4;
        audio.play().catch(() => {});
      } catch (err) {}

      return () => clearInterval(interval);
    }
  }, [badge]);

  if (!badge) return null;

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl pointer-events-auto"
            onClick={() => {
              setShow(false);
              setTimeout(onClose, 500);
            }}
          />

          {/* Card Container */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotateY: 90 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 15, stiffness: 100 }}
            className="bg-[#0B0F1A] border-2 border-[#00F5FF]/30 rounded-2xl w-full max-w-md p-8 relative overflow-hidden pointer-events-auto shadow-[0_0_50px_rgba(0,245,255,0.2)]"
          >
            {/* Cyber Grid Background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                 style={{ backgroundImage: 'linear-gradient(#00F5FF 1px, transparent 1px), linear-gradient(90deg, #00F5FF 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
            
            {/* Glow Orbs */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-[#00F5FF] blur-[100px] opacity-20" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#8B5CF6] blur-[100px] opacity-20" />

            {/* Header */}
            <div className="text-center relative z-10">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 bg-[#00F5FF]/10 border border-[#00F5FF]/40 px-4 py-1.5 rounded-full mb-6"
              >
                <Sparkles className="w-4 h-4 text-[#00F5FF]" />
                <span className="text-[#00F5FF] text-xs font-black tracking-[0.2em] uppercase italic">Achievement Inbound</span>
              </motion.div>

              <div className="flex justify-center mb-8 relative">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                  >
                    <BadgeIcon 
                        name={badge.name} 
                        iconName={badge.icon} 
                        difficulty={badge.difficulty} 
                        earned={true} 
                        size={160} 
                    />
                  </motion.div>
                  {/* Rays animation */}
                  <div className="absolute inset-0 flex items-center justify-center -z-10 bg-radial-glow opacity-40 animate-pulse" />
              </div>

              <motion.h2 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-4xl font-extrabold text-white italic mb-2 tracking-tight"
              >
                {badge.name}
              </motion.h2>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-slate-400 text-sm mb-8 leading-relaxed px-4"
              >
                {badge.description}
              </motion.p>

              {/* Reward Block */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="bg-[#1e293b]/50 border border-white/5 rounded-xl p-6 flex flex-col items-center gap-4"
              >
                <div className="flex items-center gap-10">
                    <div className="text-center">
                        <div className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">XP Reward</div>
                        <div className="text-2xl font-black text-[#9BFF00] tracking-tight">+{badge.xpReward}</div>
                    </div>
                    <div className="h-10 w-[1px] bg-slate-800" />
                    <div className="text-center">
                        <div className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">Difficulty</div>
                        <div className="text-2xl font-black text-white uppercase italic tracking-tighter" style={{ color: 
                            badge.difficulty === 'rare' ? '#FFD700' : 
                            badge.difficulty === 'hard' ? '#FF1414' : 
                            badge.difficulty === 'medium' ? '#00F5FF' : '#9BFF00' 
                        }}>
                            {badge.difficulty}
                        </div>
                    </div>
                </div>

                <button 
                  onClick={() => {
                    setShow(false);
                    setTimeout(onClose, 500);
                  }}
                  className="mt-4 group flex items-center gap-2 bg-white text-black px-10 py-3 rounded-full font-black text-sm uppercase tracking-wider hover:bg-[#00F5FF] hover:scale-105 transition-all duration-300"
                >
                  Confirm Operations
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BadgeUnlockModal;
