import { useState, useEffect } from 'react';
import { Clock, RefreshCw } from 'lucide-react';
import sessionManager from '../utils/sessionManager';

const SessionTimeoutWarning = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const checkTimeLeft = () => {
      const remaining = sessionManager.getRemainingTime();
      const minutes = Math.floor(remaining / (1000 * 60));
      
      // Show warning when 5 minutes or less remaining
      if (minutes <= 5 && minutes > 0) {
        setShowWarning(true);
        setTimeLeft(minutes);
      } else {
        setShowWarning(false);
      }
    };

    // Check every minute
    const interval = setInterval(checkTimeLeft, 60000);
    checkTimeLeft(); // Initial check

    return () => clearInterval(interval);
  }, []);

  const handleExtendSession = () => {
    sessionManager.updateActivity();
    setShowWarning(false);
  };

  if (!showWarning) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-warning/90 backdrop-blur-sm border border-warning/30 rounded-lg p-4 shadow-lg max-w-sm">
      <div className="flex items-start gap-3">
        <Clock className="w-5 h-5 text-warning-foreground flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-warning-foreground mb-1">
            Session Expiring Soon
          </h4>
          <p className="text-sm text-warning-foreground/80 mb-3">
            Your session will expire in {timeLeft} minute{timeLeft !== 1 ? 's' : ''}. 
            Click to extend your session.
          </p>
          <button
            onClick={handleExtendSession}
            className="flex items-center gap-2 px-3 py-1.5 bg-warning-foreground/20 hover:bg-warning-foreground/30 rounded text-sm font-medium text-warning-foreground transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Extend Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutWarning;