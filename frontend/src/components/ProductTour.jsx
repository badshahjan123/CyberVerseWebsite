import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../contexts/app-context";
import { apiCall } from "../config/api";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, X, Play } from "lucide-react";

const MAIN_TOUR_STEPS = [
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

const LAB_TOUR_STEPS = [
  {
    id: "lab-welcome",
    title: "Tactical Lab Briefing",
    content: "Welcome to the Lab Sandbox interface. Let's walk you through how to deploy your virtual environment, access the terminal, and submit your flag payloads to solve this lab.",
    target: null,
  },
  {
    id: "lab-briefing",
    title: "Step 01 // Academic Foundation",
    content: "Start by reading the conceptual foundation. This explains what you'll learn, why it matters in real-world scenarios, and the underlying cybersecurity concepts involved.",
    target: "#tour-lab-briefing",
  },
  {
    id: "lab-video",
    title: "Step 02 // Preparatory Video",
    content: "Watch the video tutorial to see a live demonstration of relevant scanning, scripting, or exploitation techniques before spinning up the target VM.",
    target: "#tour-lab-video",
  },
  {
    id: "lab-commands",
    title: "Step 03 // Cheatsheet Handbooks",
    content: "Use these copyable command cheatsheets as tactical templates showing standard syntax for tools like Nmap, Netstat, or Grep.",
    target: "#tour-lab-commands",
  },
  {
    id: "lab-sandbox",
    title: "Step 04 // Deploy Sandbox VM",
    content: "Click 'Initialize Sandbox VM' or 'Start Mission' to boot up your dedicated container instance. Once booted, you can access the live, fully interactive command shell directly inside the embedded web terminal.",
    target: "#tour-lab-sandbox",
  },
  {
    id: "lab-tasks",
    title: "Step 05 // Submit Payloads",
    content: "Each lab has specific operational objectives. Expand a task card to see copyable commands, custom hints, and submit the flags or decryption keys found in the sandbox to verify completion.",
    target: "#tour-lab-tasks",
  },
  {
    id: "lab-progress",
    title: "Operation Status HUD",
    content: "Track your real-time sync level and progress percentage. Achieving 100% grants clearance and issues immediate XP rewards.",
    target: "#tour-lab-progress",
  },
  {
    id: "lab-ai",
    title: "CyberVerse Intel AI",
    content: "If you get stuck, use the built-in Intel AI assistant. Ask questions about error messages, request hints, or clarify command structures without leaving the page.",
    target: "#tour-lab-ai",
  },
  {
    id: "lab-finish",
    title: "Briefing Complete!",
    content: "You are now ready to commence your mission, Operator. Initialize your virtual sandbox, open the shell, and capture the flags!",
    target: null,
  }
];

export default function ProductTour() {
  const { isAuthenticated, loading, user, updateUserProfile } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [tourType, setTourType] = useState("main"); // "main" or "lab"
  
  const hasAttemptedMainAutoStart = useRef(false);
  const hasAttemptedLabAutoStart = useRef(false);

  const [tourState, setTourState] = useState({
    placement: "bottom",
    popTop: 0,
    popLeft: 0,
    popWidth: 300,
    arrowLeft: 150,
    arrowTop: 100,
    spotlightRect: null,
    elementFound: false,
  });

  const steps = tourType === "lab" ? LAB_TOUR_STEPS : MAIN_TOUR_STEPS;

  // Auto-start logic for Main Tour
  useEffect(() => {
    if (loading || !isAuthenticated) return;
    if (hasAttemptedMainAutoStart.current) return;

    const isCompletedBefore = 
      user?.tourCompleted === true || 
      localStorage.getItem("cyberverse_tour_completed") === "true";

    if (isCompletedBefore) {
      hasAttemptedMainAutoStart.current = true;
      return;
    }

    if (location.pathname === "/dashboard") {
      hasAttemptedMainAutoStart.current = true;
      setTourType("main");
      const timer = setTimeout(() => {
        setIsActive(true);
        setCurrentStepIndex(0);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, loading, location.pathname, user]);

  // Auto-start logic for Lab Tour
  useEffect(() => {
    if (loading || !isAuthenticated) return;
    
    const isLabDetailPage = /^\/labs\/[a-zA-Z0-9_-]+$/.test(location.pathname);
    if (!isLabDetailPage) return;

    if (hasAttemptedLabAutoStart.current) return;

    const isCompletedBefore = 
      user?.labTourCompleted === true || 
      localStorage.getItem("cyberverse_lab_tour_completed") === "true";

    if (isCompletedBefore) {
      hasAttemptedLabAutoStart.current = true;
      return;
    }

    hasAttemptedLabAutoStart.current = true;
    setTourType("lab");
    const timer = setTimeout(() => {
      setIsActive(true);
      setCurrentStepIndex(0);
    }, 1500);
    return () => clearTimeout(timer);
  }, [isAuthenticated, loading, location.pathname, user]);

  // Listen to manual start request
  useEffect(() => {
    const handleManualStart = () => {
      setTourType("main");
      setIsActive(true);
      setCurrentStepIndex(0);
      const firstStep = MAIN_TOUR_STEPS[0];
      if (firstStep.route && location.pathname !== firstStep.route) {
        navigate(firstStep.route);
      }
    };

    const handleLabManualStart = () => {
      setTourType("lab");
      setIsActive(true);
      setCurrentStepIndex(0);
    };

    window.addEventListener("startProductTour", handleManualStart);
    window.addEventListener("startLabTour", handleLabManualStart);
    return () => {
      window.removeEventListener("startProductTour", handleManualStart);
      window.removeEventListener("startLabTour", handleLabManualStart);
    };
  }, [location.pathname, navigate]);

  // Positioning alignment engine
  const alignTour = useCallback((forceScroll = false) => {
    if (!isActive) return;
    const currentSteps = tourType === "lab" ? LAB_TOUR_STEPS : MAIN_TOUR_STEPS;
    const step = currentSteps[currentStepIndex];
    if (!step || !step.target) {
      setTourState({
        placement: "center",
        popTop: 0,
        popLeft: 0,
        popWidth: 300,
        arrowLeft: 150,
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

    const popWidth = Math.min(300, viewportWidth - 32);
    const estimatedHeight = 160 + Math.ceil(step.content.length * 0.4);
    const popHeight = estimatedHeight;

    let placement = "bottom";

    if (viewportWidth >= 1024) {
      if (docHeight > viewportHeight - 200) {
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
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        if (spaceBelow >= popHeight + 32 || docTop < popHeight + 100) {
          placement = "bottom";
        } else {
          placement = "top";
        }
      }
    } else {
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

    if (popLeft < 16) {
      popLeft = 16;
    } else if (popLeft + popWidth > viewportWidth - 16) {
      popLeft = viewportWidth - popWidth - 16;
    }

    if (popTop < 80 && (placement === "top" || placement === "left" || placement === "right")) {
      popTop = Math.max(16, rect.bottom + 16);
      placement = "bottom";
    } else if (popTop + popHeight > viewportHeight - 16 && placement === "bottom") {
      popTop = Math.max(16, rect.top - popHeight - 16);
      placement = "top";
    }

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

      const maxScrollY = document.documentElement.scrollHeight - viewportHeight;
      const maxScrollX = document.documentElement.scrollWidth - viewportWidth;

      targetScrollY = Math.max(0, Math.min(targetScrollY, maxScrollY));
      targetScrollX = Math.max(0, Math.min(targetScrollX, maxScrollX));

      if (targetScrollY > 10) {
        targetScrollY = Math.max(0, targetScrollY - 20);
      }

      window.scrollTo({
        top: targetScrollY,
        left: targetScrollX,
        behavior: "smooth",
      });
    }
  }, [isActive, currentStepIndex, tourType]);

  // Handle page transitions & retry loops
  useEffect(() => {
    if (!isActive) return;

    alignTour(true);

    let retries = 0;
    const retryInterval = setInterval(() => {
      const currentSteps = tourType === "lab" ? LAB_TOUR_STEPS : MAIN_TOUR_STEPS;
      const step = currentSteps[currentStepIndex];
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
        if (retries > 30) {
          clearInterval(retryInterval);
        }
      }
    }, 150);

    return () => clearInterval(retryInterval);
  }, [isActive, currentStepIndex, tourType]);

  // Event listener configuration for updates on scroll/resize
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
    if (nextIdx < steps.length) {
      const nextStep = steps[nextIdx];
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
      const prevStep = steps[prevIdx];
      if (prevStep.route && location.pathname !== prevStep.route) {
        navigate(prevStep.route);
      }
      setCurrentStepIndex(prevIdx);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    setIsActive(false);
    
    if (tourType === "lab") {
      localStorage.setItem("cyberverse_lab_tour_completed", "true");
      if (isAuthenticated && user) {
        try {
          const response = await apiCall("/users/profile", {
            method: "PUT",
            body: JSON.stringify({ labTourCompleted: true }),
          });
          if (response?.user) {
            updateUserProfile(response.user);
          }
        } catch (err) {
          console.error("Failed to save lab tour completion state:", err);
        }
      }
    } else {
      localStorage.setItem("cyberverse_tour_completed", "true");
      if (isAuthenticated && user) {
        try {
          const response = await apiCall("/users/profile", {
            method: "PUT",
            body: JSON.stringify({ tourCompleted: true }),
          });
          if (response?.user) {
            updateUserProfile(response.user);
          }
        } catch (err) {
          console.error("Failed to save product tour completion state:", err);
        }
      }
      if (location.pathname !== "/dashboard") {
        navigate("/dashboard");
      }
    }
  };

  if (!isActive) return null;

  const step = steps[currentStepIndex];
  const isCentered = !step.target || !tourState.elementFound;

  const tooltipStyle = isCentered
    ? {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "min(300px, 90vw)",
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
        className="bg-[#080d1a]/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-4 sm:p-5 shadow-[0_0_40px_rgba(0,0,0,0.8)] z-[9995] pointer-events-auto font-mono text-xs text-slate-300 flex flex-col gap-3 sm:gap-4 select-none"
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
          <span className="text-[10px] font-black text-cyan-400 tracking-wider uppercase">
            <span className="inline sm:hidden">{tourType === "lab" ? "LAB" : "SYS"} BRIEF // {currentStepIndex + 1}/{steps.length}</span>
            <span className="hidden sm:inline">{tourType === "lab" ? "LAB SESSION BRIEFING" : "SYSTEM BRIEFING"} // STEP {currentStepIndex + 1} OF {steps.length}</span>
          </span>
          <button
            onClick={handleSkip}
            className="text-slate-500 hover:text-white transition-colors p-1"
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
            className="text-slate-500 hover:text-slate-300 text-[10px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap"
          >
            Skip
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {currentStepIndex > 0 && (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 border border-white/10 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors font-bold uppercase text-[9px] tracking-wider whitespace-nowrap"
              >
                Prev
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-1.5 bg-cyan-400 hover:bg-cyan-300 text-black rounded-lg transition-colors font-black uppercase text-[9px] tracking-wider whitespace-nowrap"
            >
              {currentStepIndex === steps.length - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
