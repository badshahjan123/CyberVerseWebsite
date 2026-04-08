import React, { createContext, useContext, useState, useEffect } from 'react';
import BadgeUnlockModal from '../components/achievements/BadgeUnlockModal';
import { useRealtime } from './realtime-context';

const AchievementContext = createContext();

export const AchievementProvider = ({ children }) => {
  const { socket } = useRealtime();
  const [earnedBadge, setEarnedBadge] = useState(null);

  useEffect(() => {
    if (!socket) return;

    const handleBadgeEarned = (badge) => {
      console.log('Badge earned event received:', badge);
      setEarnedBadge(badge);
    };

    socket.on('badge:earned', handleBadgeEarned);

    return () => {
      socket.off('badge:earned', handleBadgeEarned);
    };
  }, [socket]);

  const closeBadgeModal = () => {
    setEarnedBadge(null);
  };

  return (
    <AchievementContext.Provider value={{ earnedBadge, setEarnedBadge }}>
      {children}
      {earnedBadge && (
        <BadgeUnlockModal 
          badge={earnedBadge} 
          onClose={closeBadgeModal} 
        />
      )}
    </AchievementContext.Provider>
  );
};

export const useAchievements = () => {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error('useAchievements must be used within an AchievementProvider');
  }
  return context;
};
