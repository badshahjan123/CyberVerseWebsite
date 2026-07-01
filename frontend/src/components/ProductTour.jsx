import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../contexts/app-context";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, X, Play, Target, HelpCircle } from "lucide-react";

const TOUR_STEPS = [
  {
    id: "welcome",
    title: "Welcome to CyberVerse!",
    content: "Greetings, Operator. Welcome to CyberVerse — your ultimate gamified command center for hands-on cybersecurity training. Let’s take a 1-minute tactical briefing to get you oriented.",
    target: null,
    route: "/dashboard",
  },
  {
    id: "dashboard",
    title: "Command Telemetry HUD",
    content: "Your Dashboard HUD displays your combat standing in real-time. Monitor your Level, total XP progress, and active streak multiplier.",
    target: "#tour-dashboard-hud",
    route: "/dashboard",
  },
  {
    id: "labs",
    title: "Isolated Sandbox Labs",
    content: "This is the Labs section. Here, you get access to live, isolated container sandboxes. Run real Linux/terminal commands to locate hidden data flags, exploit vulnerability matrices, and practice hands-on hacking safely.",
    target: "#tour-labs-first-card",
    route: "/labs",
  },
  {
    id: "rooms",
    title: "Threat Pathways",
    content: "Missions Control organizes training labs into themed rooms and step-by-step pathways (e.g., Web App Pentesting, API Security). Complete them to acquire specialized badges and certifications.",
    target: "#tour-rooms-first-card",
    route: "/rooms",
  },
  {
    id: "leaderboard",
    title: "Elite Leaderboard Roster",
    content: "Track your standing against cybersecurity operators worldwide. Accumulate XP points from sandbox intrusions to rise to the top of the global ranks.",
    target: "#tour-leaderboard-table",
    route: "/leaderboard",
  },
  {
    id: "badges",
    title: "Combat Achievements",
    content: "Unlock unique achievement badges for completing key milestones, establishing streaks, or deploying advanced container breakouts.",
    target: "#tour-badges-stats",
    route: "/badges",
  },
  {
    id: "certificates",
    title: "Cryptographic Credentials",
    content: "Earning path certifications grants official CyberVerse Certificates. Each is cryptographically signed and verifiable via QR code to showcase your industry credentials.",
    target: "#tour-certificates-stats",
    route: "/certificates",
  },
  {
    id: "profile",
    title: "Operator Terminal Menu",
    content: "Manage your active sessions, adjust theme styles, view saved items, or restart this Product Tour anytime from your Profile menu.",
    target: "#tour-profile-avatar",
    route: "/certificates",
  },
  {
    id: "finish",
    title: "Briefing Complete!",
    content: "Congratulations, Operator. You are fully briefed and cleared for deployment. Launch your first lab and claim your place in the arena!",
    target: null,
    route: "/dashboard",
  }
];

export default function ProductTour() {
  const { isAuthenticated, loading } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState(null);
  const [elementFound, setElementFound] = useState(false);

  // Auto-start logic on first login
  useEffect(() => {
    if (loading || !isAuthenticated) return;

    // Check if user has completed the tour before
    const isCompletedBefore = localStorage.getItem("cyberverse_tour_completed") === "true";
    
    // We auto-start when they land on dashboard and haven't completed the tour
    if (!isCompletedBefore && location.pathname === "/dashboard") {
      // Delay slightly for render completion
      const timer = setTimeout(() => {
        setIsActive(true);
        setCurrentStepIndex(0);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, loading, location.pathname]);

  // Listen to manual start request
  useEffect(() => {
    const handleManualStart = () => {
      setIsActive(true);
      setCurrentStepIndex(0);
      const firstStep = TOUR_STEPS[0];
      if (firstStep.route && location.pathname !== firstStep.route) {
        navigate(firstStep.route);
      }
    };

    window.addEventListener("startProductTour", handleManualStart);
    return () => window.removeEventListener("startProductTour", handleManualStart);
  }, [location.pathname, navigate]);

  // Calculate spotlight position
  const updateSpotlight = useCallback(() => {
    if (!isActive) return;
    const step = TOUR_STEPS[currentStepIndex];
    if (!step || !step.target) {
      setSpotlightRect(null);
      setElementFound(false);
      return;
    }

    const el = document.querySelector(step.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      
      // Auto scroll to make sure it's nicely visible, especially on mobile
      const isOffscreen = rect.top < 80 || rect.bottom > window.innerHeight - 80;
      if (isOffscreen) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      setSpotlightRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
      setElementFound(true);
    } else {
      setElementFound(false);
      setSpotlightRect(null);
    }
  }, [isActive, currentStepIndex]);

  // Polling position tracking
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(updateSpotlight, 150);
    window.addEventListener("resize", updateSpotlight);
    window.addEventListener("scroll", updateSpotlight, true);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", updateSpotlight);
      window.removeEventListener("scroll", updateSpotlight, true);
    };
  }, [isActive, currentStepIndex, updateSpotlight]);

  const handleNext = () => {
    const nextIdx = currentStepIndex + 1;
    if (nextIdx < TOUR_STEPS.length) {
      const nextStep = TOUR_STEPS[nextIdx];
      if (nextStep.route && location.pathname !== nextStep.route) {
        navigate(nextStep.route);
      }
      setCurrentStepIndex(nextIdx);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    const prevIdx = currentStepIndex - 1;
    if (prevIdx >= 0) {
      const prevStep = TOUR_STEPS[prevIdx];
      if (prevStep.route && location.pathname !== prevStep.route) {
        navigate(prevStep.route);
      }
      setCurrentStepIndex(prevIdx);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setIsActive(false);
    localStorage.setItem("cyberverse_tour_completed", "true");
    
    // Go to dashboard on finish if desired
    if (location.pathname !== "/dashboard") {
      navigate("/dashboard");
    }
  };

  if (!isActive) return null;

  const step = TOUR_STEPS[currentStepIndex];
  const isCentered = !step.target || !elementFound;

  // Collision detection for tooltip placement
  const getTooltipPosition = () => {
    if (!spotlightRect) return {};

    const { top, left, width, height } = spotlightRect;
    const tooltipWidth = 320;
    const tooltipHeight = 200; // estimate
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Default: try placing it below the target
    let tooltipTop = top + height + 16;
    let tooltipLeft = left + width / 2 - tooltipWidth / 2;

    // Switch to above if it overflows the bottom
    if (tooltipTop + tooltipHeight > viewportHeight - 16) {
      tooltipTop = top - tooltipHeight - 16;
    }

    // Keep within horizontal margins
    if (tooltipLeft < 16) {
      tooltipLeft = 16;
    } else if (tooltipLeft + tooltipWidth > viewportWidth - 16) {
      tooltipLeft = viewportWidth - tooltipWidth - 16;
    }

    // Edge case safety
    if (tooltipTop < 80) {
      tooltipTop = Math.max(16, top + height + 16);
    }

    return {
      position: "fixed",
      top: `${tooltipTop}px`,
      left: `${tooltipLeft}px`,
      width: `${Math.min(tooltipWidth, viewportWidth - 32)}px`,
    };
  };

  const tooltipStyle = isCentered
    ? {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "min(340px, 90vw)",
      }
    : getTooltipPosition();

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Dimmed backdrop blocking mouse clicks to page behind the tour */}
      <div className="absolute inset-0 bg-black/45 pointer-events-auto z-[9990]" style={{ cursor: "default" }} />

      {/* Glow Spotlight */}
      <AnimatePresence>
        {spotlightRect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed pointer-events-none rounded-xl border border-cyan-400/80 shadow-[0_0_0_9999px_rgba(3,7,18,0.75),0_0_15px_rgba(0,209,255,0.3)] z-[9992]"
            style={{
              top: spotlightRect.top - 8,
              left: spotlightRect.left - 8,
              width: spotlightRect.width + 16,
              height: spotlightRect.height + 16,
            }}
          />
        )}
      </AnimatePresence>

      {/* Tooltip Card */}
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        style={tooltipStyle}
        className="bg-[#080d1a]/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-5 shadow-[0_0_40px_rgba(0,0,0,0.8)] z-[9995] pointer-events-auto font-mono text-xs text-slate-300 flex flex-col gap-4 select-none"
      >
        {/* Step indicator header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <span className="text-[10px] font-black text-cyan-400 tracking-wider">
            SYSTEM BRIEFING // STEP {currentStepIndex + 1} OF {TOUR_STEPS.length}
          </span>
          <button 
            onClick={handleSkip} 
            className="text-slate-500 hover:text-white transition-colors"
            title="Skip Tour"
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-pulse" />
            {step.title}
          </h3>
          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            {step.content}
          </p>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <button
            onClick={handleSkip}
            className="text-slate-500 hover:text-slate-300 text-[10px] font-bold uppercase tracking-wider transition-colors"
          >
            Skip
          </button>

          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1 px-3 py-1.5 border border-white/10 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors font-bold uppercase text-[9px] tracking-wider"
              >
                Prev
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-4 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-black rounded-lg transition-colors font-black uppercase text-[9px] tracking-wider"
            >
              {currentStepIndex === TOUR_STEPS.length - 1 ? "Finish" : "Next"}
              <ArrowRight size={10} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
