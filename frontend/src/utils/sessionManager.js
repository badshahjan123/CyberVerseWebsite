// Session timeout configuration (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

class SessionManager {
  constructor() {
    this.timeoutId = null;
    this.lastActivity = Date.now();
    this.onTimeout = null;
    this.isActive = false;
  }

  // Initialize session tracking
  init(onTimeoutCallback) {
    this.onTimeout = onTimeoutCallback;
    this.isActive = true;
    this.updateActivity();
    this.setupActivityListeners();
    this.startTimer();
  }

  // Update last activity timestamp
  updateActivity() {
    this.lastActivity = Date.now();
    localStorage.setItem('lastActivity', this.lastActivity.toString());
    this.resetTimer();
  }

  // Setup event listeners for user activity
  setupActivityListeners() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, this.handleActivity.bind(this), true);
    });
  }

  // Handle user activity
  handleActivity() {
    if (this.isActive) {
      this.updateActivity();
    }
  }

  // Start/restart the timeout timer
  startTimer() {
    this.resetTimer();
  }

  // Reset the timeout timer
  resetTimer() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    this.timeoutId = setTimeout(() => {
      this.handleTimeout();
    }, SESSION_TIMEOUT);
  }

  // Handle session timeout
  handleTimeout() {
    if (this.onTimeout && this.isActive) {
      this.isActive = false;
      this.onTimeout();
    }
  }

  // Check if session is expired based on stored activity
  isSessionExpired() {
    const lastActivity = localStorage.getItem('lastActivity');
    if (!lastActivity) return true;
    
    const timeSinceActivity = Date.now() - parseInt(lastActivity);
    return timeSinceActivity > SESSION_TIMEOUT;
  }

  // Cleanup session manager
  cleanup() {
    this.isActive = false;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.removeEventListener(event, this.handleActivity.bind(this), true);
    });
  }

  // Get remaining session time
  getRemainingTime() {
    const timeSinceActivity = Date.now() - this.lastActivity;
    return Math.max(0, SESSION_TIMEOUT - timeSinceActivity);
  }
}

export default new SessionManager();