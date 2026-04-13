import { useState, useEffect, memo, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Lock,
  Unlock,
  Terminal,
  Play,
  CheckCircle,
  AlertCircle,
  Loader,
  ArrowLeft,
  ArrowRight,
  Monitor,
  Trophy,
  Users,
  Clock,
  Zap,
  RotateCcw,
  BookOpen,
  Info,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Star,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { labsService } from "../../services/labs";
import "./LabPage.css";

/* ─── Difficulty Badge ─── */
const DifficultyBadge = ({ level }) => {
  const config = {
    Beginner: {
      bg: "bg-cyan-500/20",
      text: "text-cyan-400",
      border: "border-cyan-500/30",
    },
    Intermediate: {
      bg: "bg-yellow-500/20",
      text: "text-yellow-400",
      border: "border-yellow-500/30",
    },
    Advanced: {
      bg: "bg-orange-500/20",
      text: "text-orange-400",
      border: "border-orange-500/30",
    },
    Expert: {
      bg: "bg-red-500/20",
      text: "text-red-400",
      border: "border-red-500/30",
    },
  };
  const style = config[level] || config.Beginner;
  return (
    <span
      className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border ${style.bg} ${style.text} ${style.border}`}
    >
      {level}
    </span>
  );
};

/* ─── Lab Task Component ─── */
const LabTask = memo(({ task, isCompleted, onSubmit }) => {
  const [expanded, setExpanded] = useState(!isCompleted);
  const [answer, setAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return;
    setSubmitting(true);
    const success = await onSubmit(task.id, answer);
    if (success) {
      setAnswer("");
      setExpanded(false);
    }
    setSubmitting(false);
  };

  const handleCopyCommand = (cmd) => {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`lab-task mb-4 rounded-xl transition-all duration-300 ${
        isCompleted ? "lab-task--completed" : "lab-task--pending"
      }`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="lab-task__header"
      >
        <div className="lab-task__title-section">
          <div
            className={`lab-task__badge ${isCompleted ? "lab-task__badge--completed" : ""}`}
          >
            {isCompleted ? <CheckCircle size={18} /> : task.id}
          </div>
          <div>
            <p
              className={`lab-task__label ${isCompleted ? "lab-task__label--completed" : ""}`}
            >
              Task {task.id}
            </p>
            <h3 className="lab-task__title">{task.title}</h3>
          </div>
        </div>
        <div className="lab-task__actions">
          {isCompleted && (
            <span className="lab-task__status-badge">Completed</span>
          )}
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>

      {expanded && (
        <div className="lab-task__content">
          <div className="lab-task__divider" />

          <div className="lab-task__instructions">
            <p>{task.instructions}</p>
          </div>

          {task.commands && task.commands.length > 0 && (
            <div className="lab-task__commands">
              <p className="lab-task__commands-label">Target Commands</p>
              <div className="lab-task__commands-list">
                {task.commands.map((cmd, i) => (
                  <div key={i} className="lab-task__command-item">
                    <code>$ {cmd}</code>
                    <button
                      type="button"
                      onClick={() => handleCopyCommand(cmd)}
                      className="lab-task__copy-btn"
                      title="Copy command"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="lab-task__answer-section">
            <div className="lab-task__question">
              <HelpCircle size={16} />
              <p>{task.question}</p>
            </div>

            <form onSubmit={handleSubmit} className="lab-task__form">
              <div className="lab-task__input-wrapper">
                <input
                  type="text"
                  placeholder={
                    isCompleted ? "Answer submitted" : "Enter flag or answer..."
                  }
                  className="lab-task__input"
                  value={isCompleted ? "**********" : answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={isCompleted}
                />
                {isCompleted && (
                  <CheckCircle size={16} className="lab-task__input-check" />
                )}
              </div>

              <button
                type="submit"
                className={`lab-task__submit-btn ${isCompleted ? "lab-task__submit-btn--disabled" : ""}`}
                disabled={isCompleted || submitting || !answer.trim()}
              >
                {submitting ? "Checking..." : "Submit"}
              </button>

              {!isCompleted && task.hint && (
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className={`lab-task__hint-btn ${showHint ? "lab-task__hint-btn--active" : ""}`}
                  title="Show Hint"
                >
                  <Info size={18} />
                </button>
              )}
            </form>

            {showHint && task.hint && (
              <div className="lab-task__hint">
                <Zap size={12} />
                HINT: {task.hint}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

/* ─── Main LabPage Component ─── */
const LabPage = () => {
  const { labId } = useParams();
  const navigate = useNavigate();

  const [lab, setLab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [labStarted, setLabStarted] = useState(false);
  const [machineStarted, setMachineStarted] = useState(false);
  const [terminalUrl, setTerminalUrl] = useState(null);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [labCompleted, setLabCompleted] = useState(false);
  const [operationLoading, setOperationLoading] = useState(false);
  const [operationError, setOperationError] = useState(null);
  const [splitView, setSplitView] = useState(false);

  // Auto-enable split view when machine starts
  useEffect(() => {
    if (machineStarted) {
      setSplitView(true);
    } else {
      setSplitView(false);
    }
  }, [machineStarted]);

  /* ─── Fetch Lab Data ─── */
  useEffect(() => {
    const fetchLab = async () => {
      try {
        setLoading(true);
        setError(null);
        const labData = await labsService.getLabById(labId);
        setLab(labData);
        await checkCompletionStatus(labId);
        await checkMachineStatus(labId);
      } catch (err) {
        setError(err.message || "Failed to load lab");
        console.error("Lab fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (labId) {
      fetchLab();
    }
  }, [labId]);

  /* ─── Check Machine Status ─── */
  const checkMachineStatus = async (id) => {
    try {
      const response = await labsService.getLabStatus(id);
      if (response.status === "running") {
        setMachineStarted(true);
        // If it's running, we can also try to start it just to get the URL
        const startResponse = await labsService.startLab(id);
        if (startResponse.success) {
           setTerminalUrl(startResponse.webTerminalUrl);
        }
      }
    } catch (err) {
      console.error("Machine status check error:", err);
    }
  };

  /* ─── Check Completion Status ─── */
  const checkCompletionStatus = async (id) => {
    try {
      const response = await labsService.getCompletionStatus(id);
      if (response.success && response.completed) {
        setLabCompleted(true);
        setLabStarted(true);
        if (lab?.tasks) {
          setCompletedTasks(lab.tasks.map((t) => t.id));
        }
      }
    } catch (err) {
      console.error("Completion status check error:", err);
    }
  };

  /* ─── Start Lab ─── */
  const handleStartLab = async () => {
    setOperationLoading(true);
    setOperationError(null);
    try {
      const response = await labsService.startLab(labId);
      if (response.success) {
        setLabStarted(true);
      } else {
        throw new Error(response.message || "Failed to start lab");
      }
    } catch (err) {
      setOperationError(err.message);
    } finally {
      setOperationLoading(false);
    }
  };

  /* ─── Start Machine ─── */
  const handleStartMachine = async () => {
    setOperationLoading(true);
    setOperationError(null);
    try {
      const response = await labsService.startLab(labId);
      if (response.success) {
        setMachineStarted(true);
        setTerminalUrl(response.webTerminalUrl);
      } else {
        throw new Error(response.message || "Failed to start machine");
      }
    } catch (err) {
      setOperationError(err.message);
    } finally {
      setOperationLoading(false);
    }
  };

  /* ─── Stop Lab ─── */
  const handleStopLab = async () => {
    setOperationLoading(true);
    setOperationError(null);
    try {
      const response = await labsService.stopLab(labId);
      if (response.success) {
        setLabStarted(false);
        setMachineStarted(false);
        setTerminalUrl(null);
      } else {
        throw new Error(response.message || "Failed to stop lab");
      }
    } catch (err) {
      setOperationError(err.message);
    } finally {
      setOperationLoading(false);
    }
  };

  /* ─── Submit Answer ─── */
  const handleSubmitAnswer = async (taskId, answer) => {
    setOperationError(null);
    const task = lab?.tasks?.find((t) => Number(t.id) === Number(taskId));
    if (
      task &&
      task.correctAnswer &&
      answer.trim().toUpperCase() === task.correctAnswer.toUpperCase()
    ) {
      const updatedCompletedTasks = [...completedTasks, taskId];
      setCompletedTasks(updatedCompletedTasks);

      if (updatedCompletedTasks.length === lab.tasks.length) {
        setLabCompleted(true);
        try {
          await labsService.completeLab(labId, lab.points);
          if (window.triggerRealtimeUpdate) window.triggerRealtimeUpdate();
        } catch (err) {
          console.error("Record completion error:", err);
        }
      }
      return true;
    } else {
      setOperationError(`Incorrect answer for Task ${taskId}. Try again!`);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="lab-page lab-page--loading">
        <div className="lab-page__spinner" />
      </div>
    );
  }

  if (error || !lab) {
    return (
      <div className="lab-page">
        <div className="lab-page__error">
          <AlertCircle size={48} />
          <h2>Failed to Load Lab</h2>
          <p>{error || "Lab not found"}</p>
          <Link to="/labs" className="lab-page__error-btn">
            Back to Labs
          </Link>
        </div>
      </div>
    );
  }

  const progressPct = lab.tasks
    ? Math.round((completedTasks.length / lab.tasks.length) * 100)
    : 0;

  return (
    <div className="lab-page">
      {/* ─── Top Navbar Clearance ─── */}
      <div className="lab-page__navbar-clearance" />

      {/* ─── Main Content ─── */}
      <div className="lab-page__main">
        <div className="lab-page__container">
          <div className="lab-page__grid">
            {/* Left: Description + Tasks */}
            <div className="lab-page__content">
              {/* Description */}
              <section className="lab-page__section">
                <h2 className="lab-page__section-title">
                  <BookOpen size={20} />
                  Lab Overview
                </h2>
                <p className="lab-page__description">{lab.description}</p>
              </section>

              {/* Error Alert */}
              {operationError && (
                <div className="lab-page__alert lab-page__alert--error">
                  <AlertCircle size={16} />
                  <p>{operationError}</p>
                </div>
              )}

              {/* Tasks */}
              {lab.tasks && lab.tasks.length > 0 && (
                <section className="lab-page__section">
                  <h2 className="lab-page__section-title">
                    <CheckCircle size={20} />
                    Tasks ({completedTasks.length} / {lab.tasks.length})
                  </h2>
                  <div className="lab-page__tasks">
                    {lab.tasks.map((task) => (
                      <LabTask
                        key={task.id}
                        task={task}
                        isCompleted={completedTasks.includes(task.id)}
                        onSubmit={handleSubmitAnswer}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right: Sidebar */}
            <aside className="lab-page__sidebar">
              {/* Start/Stop Controls */}
              <div className="lab-page__card">
                <h3 className="lab-page__card-title">
                  <Terminal size={16} />
                  Machine Control
                </h3>

                {machineStarted && terminalUrl ? (
                  <>
                    <div className="lab-page__machine-status lab-page__machine-status--active">
                      <div className="lab-page__status-indicator" />
                      <span>Machine Running</span>
                    </div>
                    <a
                      href={terminalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="lab-page__button lab-page__button--primary"
                    >
                      <ExternalLink size={16} />
                      Open Terminal
                    </a>
                    <button
                      onClick={handleStopLab}
                      disabled={operationLoading}
                      className="lab-page__button lab-page__button--secondary"
                    >
                      {operationLoading ? (
                        <Loader size={16} />
                      ) : (
                        <RotateCcw size={16} />
                      )}
                      Stop Machine
                    </button>
                  </>
                ) : (
                  <>
                    <div className="lab-page__machine-status">
                      <div className="lab-page__status-indicator-inactive" />
                      <span>Machine Stopped</span>
                    </div>
                    <button
                      onClick={handleStartMachine}
                      disabled={operationLoading}
                      className="lab-page__button lab-page__button--primary"
                    >
                      {operationLoading ? (
                        <Loader size={16} />
                      ) : (
                        <Play size={16} />
                      )}
                      Start Machine
                    </button>
                  </>
                )}
              </div>

              {/* Lab Info */}
              <div className="lab-page__card">
                <h3 className="lab-page__card-title">
                  <Info size={16} />
                  Lab Details
                </h3>
                <div className="lab-page__info-item text-secondary">
                   <span>Difficulty</span>
                   <DifficultyBadge level={lab.difficulty} />
                </div>
                <div className="lab-page__info-item text-secondary">
                  <span>Points</span>
                  <span className="text-primary font-bold">{lab.points} XP</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabPage;
