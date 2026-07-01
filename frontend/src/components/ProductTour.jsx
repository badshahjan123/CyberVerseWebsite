import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../contexts/app-context";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, X, Play } from "lucide-react";

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

  const [tourState, setTourState] = useState({
    placement: "bottom",
    popTop: 0,
    popLeft: 0,
    popWidth: 320,
    arrowLeft: 160,
    arrowTop: 100,
    spotlightRect: null,
    elementFound: false,
  });

  // Auto-start logic on first login
  useEffect(() => {
    if (loading || !isAuthenticated) return;

    const isCompletedBefore = localStorage.getItem("cyberverse_tour_completed") === "true";
    if (!isCompletedBefore && location.pathname === "/dashboard") {
      const timer = setTimeout(() => {
        setIsActive(true);
        setCurrentStepIndex(0);
      }, 1200);
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

  // Positioning alignment engine
  const alignTour = useCallback((forceScroll = false) => {
    if (!isActive) return;
    const step = TOUR_STEPS[currentStepIndex];
    if (!step || !step.target) {
      setTourState({
        placement: "center",
        popTop: 0,
        popLeft: 0,
        popWidth: 340,
        arrowLeft: 170,
        arrowTop: 100,
        spotlightRect: null,
        elementFound: false,
      });
      return;
    }

    const el = document.querySelector(step.target);
    if (!el) {
      setTourState((prev) => ({ ...prev, elementFound: false, spotlightRect: null }));
      return;
    }

    const rect = el.getBoundingClientRect();
    const docTop = rect.top + window.scrollY;
    const docLeft = rect.left + window.scrollX;
    const docWidth = rect.width;
    const docHeight = rect.height;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const popWidth = Math.min(320, viewportWidth - 32);
    // Dynamic height estimate based on character count to assist initial placement bounds
    const estimatedHeight = 160 + Math.ceil(step.content.length * 0.4);
    const popHeight = estimatedHeight;

    let placement = "bottom";

    // Strategic positioning based on screen size and space availability
    if (viewportWidth >= 1024) {
      // Desktop / Large screen: choose top, bottom, left, or right
      if (docHeight > viewportHeight - 200) {
        // Very tall elements: prioritize side placements to prevent overlapping
        const spaceRight = viewportWidth - rect.right;
        const spaceLeft = rect.left;
        if (spaceRight >= popWidth + 32) {
          placement = "right";
        } else if (spaceLeft >= popWidth + 32) {
          placement = "left";
        } else {
          placement = "bottom";
        }
      } else {
        // Prefer top/bottom spacing
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        if (spaceBelow >= popHeight + 32 || docTop < popHeight + 100) {
          placement = "bottom";
        } else {
          placement = "top";
        }
      }
    } else {
      // Mobile / Tablet: always top or bottom to respect width constraints
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      if (spaceBelow >= popHeight + 16) {
        placement = "bottom";
      } else if (spaceAbove >= popHeight + 16) {
        placement = "top";
      } else {
        placement = spaceBelow >= spaceAbove ? "bottom" : "top";
      }
    }

    // Coordinate math (viewport-relative)
    let popTop = 0;
    let popLeft = 0;

    if (placement === "bottom") {
      popTop = rect.bottom + 16;
      popLeft = rect.left + rect.width / 2 - popWidth / 2;
    } else if (placement === "top") {
      popTop = rect.top - popHeight - 16;
      popLeft = rect.left + rect.width / 2 - popWidth / 2;
    } else if (placement === "right") {
      popTop = rect.top + rect.height / 2 - popHeight / 2;
      popLeft = rect.right + 16;
    } else if (placement === "left") {
      popTop = rect.top + rect.height / 2 - popHeight / 2;
      popLeft = rect.left - popWidth - 16;
    }

    // Keep popover inside safe horizontal margins
    if (popLeft < 16) {
      popLeft = 16;
    } else if (popLeft + popWidth > viewportWidth - 16) {
      popLeft = viewportWidth - popWidth - 16;
    }

    // Prevent clipping against top navbar (height 80px) or bottom screen boundary
    if (popTop < 80 && (placement === "top" || placement === "left" || placement === "right")) {
      popTop = Math.max(16, rect.bottom + 16);
      placement = "bottom";
    } else if (popTop + popHeight > viewportHeight - 16 && placement === "bottom") {
      popTop = Math.max(16, rect.top - popHeight - 16);
      placement = "top";
    }

    // Precise pointer arrow targeting offset calculation
    let arrowLeft = popWidth / 2;
    let arrowTop = popHeight / 2;

    if (placement === "bottom" || placement === "top") {
      const targetCenter = rect.left + rect.width / 2;
      const popoverCenter = popLeft + popWidth / 2;
      arrowLeft = popWidth / 2 + (targetCenter - popoverCenter);
      arrowLeft = Math.max(16, Math.min(arrowLeft, popWidth - 16));
    } else if (placement === "left" || placement === "right") {
      const targetCenterY = rect.top + rect.height / 2;
      const popoverCenterY = popTop + popHeight / 2;
      arrowTop = popHeight / 2 + (targetCenterY - popoverCenterY);
      arrowTop = Math.max(16, Math.min(arrowTop, popHeight - 16));
    }

    setTourState({
      placement,
      popTop,
      popLeft,
      popWidth,
      arrowLeft,
      arrowTop,
      spotlightRect: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      },
      elementFound: true,
    });

    // Auto-scroll centers the combined span (target + popover) perfectly in the viewport
    if (forceScroll) {
      const docPopTop = popTop + window.scrollY;
      const docPopLeft = popLeft + window.scrollX;

      const minY = Math.min(docTop, docPopTop);
      const maxY = Math.max(docTop + docHeight, docPopTop + popHeight);
      const minX = Math.min(docLeft, docPopLeft);
      const maxX = Math.max(docLeft + docWidth, docPopLeft + popWidth);

      const spanHeight = maxY - minY;
      const spanWidth = maxX - minX;

      let targetScrollY = minY - (viewportHeight - spanHeight) / 2;
      let targetScrollX = minX - (viewportWidth - spanWidth) / 2;

      // Ensure we don't scroll past document bounds
      const maxScrollY = document.documentElement.scrollHeight - viewportHeight;
      const maxScrollX = document.documentElement.scrollWidth - viewportWidth;

      targetScrollY = Math.max(0, Math.min(targetScrollY, maxScrollY));
      targetScrollX = Math.max(0, Math.min(targetScrollX, maxScrollX));

      // Leave a top-padding clearance for sticky headers
      if (targetScrollY > 10) {
        targetScrollY = Math.max(0, targetScrollY - 20);
      }

      window.scrollTo({
        top: targetScrollY,
        left: targetScrollX,
        behavior: "smooth",
      });
    }
  }, [isActive, currentStepIndex]);

  // Handle page transitions & lazy-loading retry loop
  useEffect(() => {
    if (!isActive) return;

    // Trigger scroll immediately for fast renders
    alignTour(true);

    let retries = 0;
    const retryInterval = setInterval(() => {
      const step = TOUR_STEPS[currentStepIndex];
      if (!step || !step.target) {
        clearInterval(retryInterval);
        return;
      }
      const el = document.querySelector(step.target);
      if (el) {
        alignTour(true);
        clearInterval(retryInterval);
      } else {
        retries++;
        if (retries > 30) { // Keep polling up to 4.5 seconds
          clearInterval(retryInterval);
        }
      }
    }, 150);

    return () => clearInterval(retryInterval);
  }, [isActive, currentStepIndex]);

  // Window resize/scroll dynamic position recalculation
  useEffect(() => {
    if (!isActive) return;

    const handleUpdate = () => {
      alignTour(false);
    };

    window.addEventListener("resize", handleUpdate);
    window.addEventListener("scroll", handleUpdate, true);

    return () => {
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate, true);
    };
  }, [isActive, alignTour]);

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
    if (location.pathname !== "/dashboard") {
      navigate("/dashboard");
    }
  };

  if (!isActive) return null;

  const step = TOUR_STEPS[currentStepIndex];
  const isCentered = !step.target || !tourState.elementFound;

  const tooltipStyle = isCentered
    ? {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "min(340px, 90vw)",
      }
    : {
        position: "fixed",
        top: `${tourState.popTop}px`,
        left: `${tourState.popLeft}px`,
        width: `${tourState.popWidth}px`,
      };

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Dimmed backdrop blocking mouse clicks to page behind the tour */}
      <div className="absolute inset-0 bg-black/45 pointer-events-auto z-[9990]" style={{ cursor: "default" }} />

      {/* Spotlight box */}
      <AnimatePresence>
        {tourState.spotlightRect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed pointer-events-none rounded-xl border border-cyan-400/80 shadow-[0_0_0_9999px_rgba(3,7,18,0.75),0_0_15px_rgba(0,209,255,0.3)] z-[9992]"
            style={{
              top: tourState.spotlightRect.top - 8,
              left: tourState.spotlightRect.left - 8,
              width: tourState.spotlightRect.width + 16,
              height: tourState.spotlightRect.height + 16,
            }}
          />
        )}
      </AnimatePresence>

      {/* Popover Card */}
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        style={tooltipStyle}
        className="bg-[#080d1a]/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-5 shadow-[0_0_40px_rgba(0,0,0,0.8)] z-[9995] pointer-events-auto font-mono text-xs text-slate-300 flex flex-col gap-4 select-none"
      >
        {/* Dynamic pointing arrow pointer */}
        {!isCentered && (
          <div
            className="absolute w-3 h-3 bg-[#080d1a] border-cyan-500/30 rotate-45 z-[9996] transition-all duration-150"
            style={{
              top: tourState.placement === "bottom" ? -6 : tourState.placement === "top" ? "auto" : tourState.arrowTop,
              bottom: tourState.placement === "top" ? -6 : "auto",
              left: (tourState.placement === "bottom" || tourState.placement === "top") ? tourState.arrowLeft : tourState.placement === "right" ? -6 : "auto",
              right: tourState.placement === "left" ? -6 : "auto",
              borderTopWidth: (tourState.placement === "bottom" || tourState.placement === "left") ? 1 : 0,
              borderLeftWidth: (tourState.placement === "bottom" || tourState.placement === "right") ? 1 : 0,
              borderBottomWidth: (tourState.placement === "top" || tourState.placement === "right") ? 1 : 0,
              borderRightWidth: (tourState.placement === "top" || tourState.placement === "left") ? 1 : 0,
            }}
          />
        )}

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
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
