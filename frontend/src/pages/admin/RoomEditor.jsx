import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Upload,
  X,
  Eye,
  Zap,
  Trophy,
  CheckCircle,
  FileWarning,
  AlertTriangle,
  HelpCircle,
  Code,
} from "lucide-react";

const API = "http://localhost:5000/api/admin";
const token = () => localStorage.getItem("token");
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token()}`,
});

const EMPTY_TASK = () => ({
  id: Date.now(),
  title: "",
  subtitle: "",
  icon: "target",
  image: "",
  difficulty: "Beginner",
  xp: 100,
  scenario: { title: "", text: "", impact: "" },
  content: [],
  questions: [],
  animation: { type: "none", data: "" },
});

const EMPTY_QUESTION = () => ({
  id: Date.now(),
  text: "",
  answerType: "text",
  answer: "",
  options: [],
  hint: "",
});

const EMPTY_BADGE = () => ({
  id: Date.now(),
  name: "",
  icon: "award",
  type: "milestone",
  xpReward: 0,
  unlockReason: "",
});

const EMPTY_CONTENT_BLOCK = () => ({
  id: Date.now(),
  type: "paragraph",
  content: "",
});

const inp =
  "w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:border-cyan-500 focus:outline-none";

const Field = ({ label, children, hint }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
      {label}
    </label>
    {children}
    {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
  </div>
);

const Tab = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      active
        ? "bg-cyan-600 text-white"
        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
    }`}
  >
    {children}
  </button>
);

// Preview Components
const PreviewTaskHeader = ({ task }) => (
  <div className="mb-6 space-y-2">
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 bg-cyan-600/20 border border-cyan-500/50 rounded-lg flex items-center justify-center text-cyan-400 text-lg">
        🎯
      </div>
      <div>
        <h3 className="text-xl font-bold text-white">
          {task.title || "Untitled Task"}
        </h3>
        <p className="text-sm text-slate-400">{task.subtitle}</p>
      </div>
    </div>
    <div className="flex items-center gap-2 flex-wrap">
      <span className="px-2 py-1 bg-slate-700/50 border border-slate-600 rounded text-xs font-medium text-slate-300">
        {task.difficulty}
      </span>
      <span className="px-2 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs font-medium text-yellow-400 flex items-center gap-1">
        <Zap size={12} /> +{task.xp} XP
      </span>
    </div>
  </div>
);

const PreviewScenario = ({ scenario }) => {
  if (!scenario?.title) return null;
  return (
    <div className="mb-6 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
      <div className="flex items-start gap-2 mb-2">
        <FileWarning
          size={16}
          className="text-orange-400 flex-shrink-0 mt-0.5"
        />
        <div className="font-semibold text-slate-300">Mission Scenario</div>
      </div>
      <h4 className="font-bold text-white mb-2">{scenario.title}</h4>
      <p className="text-sm text-slate-300 mb-3">{scenario.text}</p>
      {scenario.impact && (
        <div className="flex items-start gap-2 mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded">
          <AlertTriangle
            size={14}
            className="text-red-400 flex-shrink-0 mt-0.5"
          />
          <span className="text-sm text-slate-300">{scenario.impact}</span>
        </div>
      )}
    </div>
  );
};

const PreviewQuestions = ({ questions }) => {
  if (!questions || questions.length === 0) return null;
  return (
    <div className="mb-6 p-4 bg-slate-800/30 border border-slate-700 rounded-lg space-y-4">
      <div className="flex items-center gap-2">
        <HelpCircle size={16} className="text-slate-400" />
        <span className="font-semibold text-slate-300">
          Knowledge Check ({questions.length})
        </span>
      </div>
      {questions.map((q, i) => (
        <div
          key={q.id}
          className="p-3 bg-slate-900 rounded border border-slate-700"
        >
          <p className="text-sm text-slate-300">
            <span className="text-slate-500">Q{i + 1}:</span> {q.text}
          </p>
          {q.hint && (
            <p className="text-xs text-slate-500 mt-2">💡 Hint: {q.hint}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default function RoomEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openTask, setOpenTask] = useState(null);
  const [activePreviewTask, setActivePreviewTask] = useState(0);
  const [taskTab, setTaskTab] = useState("content");
  const [mainTab, setMainTab] = useState("basic");
  const [imagePreview, setImagePreview] = useState(null);

  const [basic, setBasic] = useState({
    title: "",
    description: "",
    difficulty: "Beginner",
    category: "Web",
    duration: "60 min",
    totalXP: 100,
    enrollments: 0,
    rating: 4.5,
    creator: "CyberVerse Admin",
    tags: "",
    image: "",
    passPercentage: 70,
    quizBonusXP: 500,
  });
  const [tasks, setTasks] = useState([]);
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    fetch(`${API}/rooms/${id}`, {
      headers: authHeaders(),
      credentials: "include",
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((room) => {
        setBasic({
          title: room.title || "",
          description: room.short_description || room.description || "",
          difficulty: room.difficulty || "Beginner",
          category: room.category || "Web",
          duration: room.duration || "60 min",
          totalXP: room.totalXP || 100,
          enrollments: room.enrollments || 0,
          rating: room.rating || 4.5,
          creator: room.creator || "CyberVerse Admin",
          tags: (room.tags || []).join(", "),
          image: room.image || "",
          passPercentage: room.passPercentage || 70,
          quizBonusXP: room.quizBonusXP || 500,
        });

        const mapped = (room.topics || []).map((t, i) => ({
          id: t.id || i + 1,
          title: t.title || "",
          subtitle: t.subtitle || "",
          icon: t.icon || "target",
          image: t.image || "",
          difficulty: t.difficulty || "Beginner",
          xp: room.exercises?.[i]?.points || 100,
          scenario: t.scenario || { title: "", text: "", impact: "" },
          content: t.content || [],
          questions: t.questions || [],
          animation: t.animation || { type: "none", data: "" },
        }));
        setTasks(mapped.length ? mapped : [EMPTY_TASK()]);
        setBadges(room.badges || []);
        setLoading(false);
      })
      .catch(() => {
        alert("Failed to load room");
        navigate("/secure-admin-dashboard");
      });
  }, [id]);

  const handleImageUpload = (e, isTaskImage = false, taskIndex = null) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result;
      if (isTaskImage && taskIndex !== null) {
        setTask(taskIndex, "image", base64);
      } else {
        setBasic((p) => ({ ...p, image: base64 }));
        setImagePreview(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const setTask = (i, field, val) =>
    setTasks((prev) =>
      prev.map((t, idx) => (idx === i ? { ...t, [field]: val } : t)),
    );
  const setScenario = (i, field, val) =>
    setTask(i, "scenario", { ...tasks[i].scenario, [field]: val });
  const setAnimation = (i, field, val) =>
    setTask(i, "animation", { ...tasks[i].animation, [field]: val });

  const updateQuestion = (taskIdx, questionIdx, field, val) => {
    setTasks((prev) =>
      prev.map((t, idx) => {
        if (idx !== taskIdx) return t;
        const questions = [...t.questions];
        questions[questionIdx] = { ...questions[questionIdx], [field]: val };
        return { ...t, questions };
      }),
    );
  };

  const addQuestion = (taskIdx) => {
    setTask(taskIdx, "questions", [
      ...(tasks[taskIdx].questions || []),
      EMPTY_QUESTION(),
    ]);
  };

  const removeQuestion = (taskIdx, questionIdx) => {
    const questions = tasks[taskIdx].questions.filter(
      (_, i) => i !== questionIdx,
    );
    setTask(taskIdx, "questions", questions);
  };

  const addContentBlock = (taskIdx) => {
    setTask(taskIdx, "content", [
      ...(tasks[taskIdx].content || []),
      EMPTY_CONTENT_BLOCK(),
    ]);
  };

  const removeContentBlock = (taskIdx, blockIdx) => {
    const blocks = tasks[taskIdx].content.filter((_, i) => i !== blockIdx);
    setTask(taskIdx, "content", blocks);
  };

  const updateContentBlock = (taskIdx, blockIdx, field, val) => {
    const blocks = [...tasks[taskIdx].content];
    blocks[blockIdx] = { ...blocks[blockIdx], [field]: val };
    setTask(taskIdx, "content", blocks);
  };

  const addBadge = () => setBadges([...badges, EMPTY_BADGE()]);
  const removeBadge = (idx) => setBadges(badges.filter((_, i) => i !== idx));
  const updateBadge = (idx, field, val) => {
    const b = [...badges];
    b[idx] = { ...b[idx], [field]: val };
    setBadges(b);
  };

  const handleSave = async () => {
    if (!basic.title.trim()) return setError("Title is required.");
    if (!basic.description.trim()) return setError("Description is required.");
    if (tasks.some((t) => !t.title.trim()))
      return setError("All tasks must have a title.");
    setError("");
    setSaving(true);

    // Extract minutes from duration string (e.g., "60 min" -> 60)
    const durationMatch = basic.duration.match(/\d+/);
    const estimatedMinutes = durationMatch ? parseInt(durationMatch[0]) : 60;

    // Generate slug from title (convert to lowercase, replace spaces with hyphens, remove special chars)
    const slug = basic.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    const payload = {
      slug: slug,
      title: basic.title,
      short_description: basic.description,
      long_description_markdown: basic.description,
      difficulty: basic.difficulty,
      category: basic.category,
      estimated_time_minutes: estimatedMinutes,
      creator: basic.creator,
      tags: basic.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      cover_image_url: basic.image,
      isActive: true,
      topics: tasks.map((t, i) => ({
        id: i + 1,
        order: i + 1,
        title: t.title,
        estimated_time_minutes: Math.ceil(estimatedMinutes / tasks.length),
        content_markdown: t.subtitle || "",
      })),
      exercises: tasks.map((t, i) => ({
        id: i + 1,
        order: i + 1,
        title: t.title,
        description_markdown: t.title,
        points: Number(t.xp),
        type: "static",
        auto_validate: true,
      })),
      quizzes: tasks.some((t) => t.questions.length)
        ? [
            {
              id: 1,
              title: "Final Assessment",
              pass_percentage: Number(basic.passPercentage),
              questions: tasks.flatMap((t, i) =>
                t.questions.map((q, qi) => ({
                  id: qi + 1,
                  question_text: q.text,
                  type: q.answerType === "multiple" ? "multiple" : "text",
                  options: q.options.length > 0 ? q.options : [q.answer],
                  correct_answer: q.answer,
                  points: 10,
                  explanation: q.hint,
                })),
              ),
            },
          ]
        : [],
    };

    try {
      const res = await fetch(`${API}/rooms/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.errors?.join(", ") || err.message || "Save failed");
      }
      navigate("/secure-admin-dashboard");
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500" />
      </div>
    );

  const activeTask = tasks[activePreviewTask];

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/secure-admin-dashboard")}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-bold text-white">Enhanced Room Editor</h1>
            <p className="text-xs text-slate-400">
              {basic.title || "Untitled"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {}}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 rounded-lg text-sm font-semibold transition-colors"
          >
            <Save size={15} /> {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {error && (
        <div className="px-6 py-3 bg-red-500/10 border-b border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Left Editor Panel */}
        <div className="flex-1 overflow-y-auto border-r border-slate-700">
          <div className="max-w-2xl mx-auto p-8 space-y-8">
            {/* Main Tabs */}
            <div className="flex gap-2">
              <Tab
                active={mainTab === "basic"}
                onClick={() => setMainTab("basic")}
              >
                Basic Info
              </Tab>
              <Tab
                active={mainTab === "tasks"}
                onClick={() => setMainTab("tasks")}
              >
                Tasks
              </Tab>
              <Tab
                active={mainTab === "badges"}
                onClick={() => setMainTab("badges")}
              >
                Badges
              </Tab>
              <Tab
                active={mainTab === "quiz"}
                onClick={() => setMainTab("quiz")}
              >
                Quiz Settings
              </Tab>
            </div>

            {/* ── BASIC INFO TAB ── */}
            {mainTab === "basic" && (
              <div className="space-y-4">
                <Field label="Room Title">
                  <input
                    className={inp}
                    value={basic.title}
                    onChange={(e) =>
                      setBasic((p) => ({ ...p, title: e.target.value }))
                    }
                    placeholder="Room title"
                  />
                </Field>
                <Field label="Description">
                  <textarea
                    className={inp}
                    rows={3}
                    value={basic.description}
                    onChange={(e) =>
                      setBasic((p) => ({ ...p, description: e.target.value }))
                    }
                    placeholder="Description"
                  />
                </Field>

                <Field label="Room Image">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-cyan-500 transition-colors">
                        <Upload size={16} className="text-slate-400" />
                        <span className="text-sm text-slate-400">Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, false)}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {(basic.image || imagePreview) && (
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-700">
                        <img
                          src={basic.image || imagePreview}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => {
                            setBasic((p) => ({ ...p, image: "" }));
                            setImagePreview(null);
                          }}
                          className="absolute top-1 right-1 p-1 bg-red-600 rounded hover:bg-red-700"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Difficulty">
                    <select
                      className={inp}
                      value={basic.difficulty}
                      onChange={(e) =>
                        setBasic((p) => ({ ...p, difficulty: e.target.value }))
                      }
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </Field>
                  <Field label="Category">
                    <select
                      className={inp}
                      value={basic.category}
                      onChange={(e) =>
                        setBasic((p) => ({ ...p, category: e.target.value }))
                      }
                    >
                      <option>Web</option>
                      <option>Networking</option>
                      <option>Development</option>
                      <option>DevOps</option>
                      <option>Misc</option>
                    </select>
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Duration">
                    <input
                      className={inp}
                      value={basic.duration}
                      onChange={(e) =>
                        setBasic((p) => ({ ...p, duration: e.target.value }))
                      }
                      placeholder="e.g. 60 min"
                    />
                  </Field>
                  <Field label="Total XP">
                    <input
                      className={inp}
                      type="number"
                      min={10}
                      value={basic.totalXP}
                      onChange={(e) =>
                        setBasic((p) => ({ ...p, totalXP: e.target.value }))
                      }
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Enrollments">
                    <input
                      className={inp}
                      type="number"
                      min={0}
                      value={basic.enrollments}
                      onChange={(e) =>
                        setBasic((p) => ({ ...p, enrollments: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Rating">
                    <input
                      className={inp}
                      type="number"
                      min={0}
                      max={5}
                      step={0.1}
                      value={basic.rating}
                      onChange={(e) =>
                        setBasic((p) => ({ ...p, rating: e.target.value }))
                      }
                    />
                  </Field>
                </div>

                <Field label="Creator">
                  <input
                    className={inp}
                    value={basic.creator}
                    onChange={(e) =>
                      setBasic((p) => ({ ...p, creator: e.target.value }))
                    }
                  />
                </Field>

                <Field label="Tags (comma-separated)">
                  <input
                    className={inp}
                    value={basic.tags}
                    onChange={(e) =>
                      setBasic((p) => ({ ...p, tags: e.target.value }))
                    }
                  />
                </Field>
              </div>
            )}

            {/* ── TASKS TAB ── */}
            {mainTab === "tasks" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-slate-300">
                    Tasks ({tasks.length})
                  </h3>
                  <button
                    onClick={() => {
                      setTasks((p) => [...p, EMPTY_TASK()]);
                      setOpenTask(tasks.length);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
                  >
                    <Plus size={14} /> Add Task
                  </button>
                </div>

                {tasks.map((task, i) => (
                  <div
                    key={task.id}
                    className="border border-slate-700 rounded-lg overflow-hidden"
                  >
                    <button
                      className="w-full flex items-center justify-between px-4 py-3 bg-slate-800 hover:bg-slate-750 text-left"
                      onClick={() => {
                        setOpenTask(openTask === i ? null : i);
                        setActivePreviewTask(i);
                        setTaskTab("content");
                      }}
                    >
                      <span className="text-sm font-medium text-white">
                        <span className="text-slate-500 mr-2">#{i + 1}</span>
                        {task.title || "Untitled"}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-cyan-400">
                          {task.xp} XP
                        </span>
                        <span className="text-xs text-slate-500">
                          {task.questions.length}Q
                        </span>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setTasks((p) => p.filter((_, idx) => idx !== i));
                          }}
                          className="p-1 text-red-400 hover:bg-red-500/20 rounded cursor-pointer transition-colors"
                        >
                          <Trash2 size={13} />
                        </div>
                        {openTask === i ? (
                          <ChevronUp size={15} className="text-slate-400" />
                        ) : (
                          <ChevronDown size={15} className="text-slate-400" />
                        )}
                      </div>
                    </button>

                    {openTask === i && (
                      <div className="px-4 py-4 bg-slate-900 space-y-4">
                        {/* Task Tabs */}
                        <div className="flex gap-2 border-b border-slate-700 pb-3">
                          <Tab
                            active={taskTab === "content"}
                            onClick={() => setTaskTab("content")}
                          >
                            Content
                          </Tab>
                          <Tab
                            active={taskTab === "questions"}
                            onClick={() => setTaskTab("questions")}
                          >
                            Questions
                          </Tab>
                          <Tab
                            active={taskTab === "animation"}
                            onClick={() => setTaskTab("animation")}
                          >
                            Animation
                          </Tab>
                        </div>

                        {taskTab === "content" && (
                          <div className="space-y-4">
                            <Field label="Task Title">
                              <input
                                className={inp}
                                value={task.title}
                                onChange={(e) =>
                                  setTask(i, "title", e.target.value)
                                }
                                placeholder="Task title"
                              />
                            </Field>
                            <Field label="Subtitle">
                              <input
                                className={inp}
                                value={task.subtitle}
                                onChange={(e) =>
                                  setTask(i, "subtitle", e.target.value)
                                }
                                placeholder="Subtitle"
                              />
                            </Field>
                            <div className="grid grid-cols-2 gap-4">
                              <Field label="Icon">
                                <input
                                  className={inp}
                                  value={task.icon}
                                  onChange={(e) =>
                                    setTask(i, "icon", e.target.value)
                                  }
                                  placeholder="icon name"
                                />
                              </Field>
                              <Field label="Difficulty">
                                <select
                                  className={inp}
                                  value={task.difficulty}
                                  onChange={(e) =>
                                    setTask(i, "difficulty", e.target.value)
                                  }
                                >
                                  <option>Beginner</option>
                                  <option>Intermediate</option>
                                  <option>Advanced</option>
                                </select>
                              </Field>
                            </div>
                            <Field label="XP Points">
                              <input
                                className={inp}
                                type="number"
                                min={10}
                                value={task.xp}
                                onChange={(e) =>
                                  setTask(i, "xp", e.target.value)
                                }
                              />
                            </Field>

                            <div className="border border-slate-700 rounded-lg p-4 space-y-3">
                              <h4 className="text-sm font-semibold text-slate-300">
                                Scenario
                              </h4>
                              <Field label="Scenario Title">
                                <input
                                  className={inp}
                                  value={task.scenario.title}
                                  onChange={(e) =>
                                    setScenario(i, "title", e.target.value)
                                  }
                                />
                              </Field>
                              <Field label="Scenario Description">
                                <textarea
                                  className={inp}
                                  rows={3}
                                  value={task.scenario.text}
                                  onChange={(e) =>
                                    setScenario(i, "text", e.target.value)
                                  }
                                />
                              </Field>
                              <Field label="Impact">
                                <input
                                  className={inp}
                                  value={task.scenario.impact}
                                  onChange={(e) =>
                                    setScenario(i, "impact", e.target.value)
                                  }
                                />
                              </Field>
                            </div>

                            <div className="border border-slate-700 rounded-lg p-4 space-y-3">
                              <div className="flex justify-between items-center">
                                <h4 className="text-sm font-semibold text-slate-300">
                                  Content Blocks
                                </h4>
                                <button
                                  onClick={() => addContentBlock(i)}
                                  className="flex items-center gap-1 px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs"
                                >
                                  <Plus size={12} /> Add Block
                                </button>
                              </div>
                              {task.content.map((block, bi) => (
                                <div
                                  key={block.id}
                                  className="p-3 bg-slate-800 rounded space-y-2"
                                >
                                  <select
                                    className={`${inp} text-xs`}
                                    value={block.type}
                                    onChange={(e) =>
                                      updateContentBlock(
                                        i,
                                        bi,
                                        "type",
                                        e.target.value,
                                      )
                                    }
                                  >
                                    <option value="paragraph">Paragraph</option>
                                    <option value="code">Code</option>
                                    <option value="list">List</option>
                                  </select>
                                  <textarea
                                    className={`${inp} text-xs`}
                                    rows={3}
                                    value={block.content}
                                    onChange={(e) =>
                                      updateContentBlock(
                                        i,
                                        bi,
                                        "content",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Block content"
                                  />
                                  <button
                                    onClick={() => removeContentBlock(i, bi)}
                                    className="text-red-400 text-xs hover:text-red-300"
                                  >
                                    🗑️ Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {taskTab === "questions" && (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <h4 className="text-sm font-semibold text-slate-300">
                                Questions ({task.questions.length})
                              </h4>
                              <button
                                onClick={() => addQuestion(i)}
                                className="flex items-center gap-1 px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs"
                              >
                                <Plus size={12} /> Add Q
                              </button>
                            </div>
                            {task.questions.map((q, qi) => (
                              <div
                                key={q.id}
                                className="p-3 bg-slate-800 rounded space-y-2"
                              >
                                <div className="flex gap-2">
                                  <input
                                    className={`${inp} text-xs flex-1`}
                                    value={q.text}
                                    onChange={(e) =>
                                      updateQuestion(
                                        i,
                                        qi,
                                        "text",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Question text"
                                  />
                                  <button
                                    onClick={() => removeQuestion(i, qi)}
                                    className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                                <select
                                  className={`${inp} text-xs`}
                                  value={q.answerType}
                                  onChange={(e) =>
                                    updateQuestion(
                                      i,
                                      qi,
                                      "answerType",
                                      e.target.value,
                                    )
                                  }
                                >
                                  <option value="text">Text Answer</option>
                                  <option value="multiple">
                                    Multiple Choice
                                  </option>
                                </select>
                                <input
                                  className={`${inp} text-xs`}
                                  value={q.answer}
                                  onChange={(e) =>
                                    updateQuestion(
                                      i,
                                      qi,
                                      "answer",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Correct answer"
                                />
                                <input
                                  className={`${inp} text-xs`}
                                  value={q.hint}
                                  onChange={(e) =>
                                    updateQuestion(
                                      i,
                                      qi,
                                      "hint",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Hint (optional)"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {taskTab === "animation" && (
                          <div className="space-y-4">
                            <Field label="Animation Type">
                              <select
                                className={inp}
                                value={task.animation.type}
                                onChange={(e) =>
                                  setAnimation(i, "type", e.target.value)
                                }
                              >
                                <option value="none">None</option>
                                <option value="fadeIn">Fade In</option>
                                <option value="slideIn">Slide In</option>
                                <option value="pulse">Pulse</option>
                                <option value="bounce">Bounce</option>
                              </select>
                            </Field>
                            <Field
                              label="Animation Data (JSON)"
                              hint="Optional: Custom animation data"
                            >
                              <textarea
                                className={inp}
                                rows={4}
                                value={task.animation.data}
                                onChange={(e) =>
                                  setAnimation(i, "data", e.target.value)
                                }
                                placeholder='{"duration": 0.5}'
                              />
                            </Field>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── BADGES TAB ── */}
            {mainTab === "badges" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-slate-300">
                    Badges ({badges.length})
                  </h3>
                  <button
                    onClick={addBadge}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
                  >
                    <Plus size={14} /> Add Badge
                  </button>
                </div>

                {badges.map((badge, i) => (
                  <div
                    key={badge.id}
                    className="p-4 bg-slate-800 rounded-lg border border-slate-700 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-white">
                        {badge.name || "Unnamed Badge"}
                      </h4>
                      <button
                        onClick={() => removeBadge(i)}
                        className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Name">
                        <input
                          className={inp}
                          value={badge.name}
                          onChange={(e) =>
                            updateBadge(i, "name", e.target.value)
                          }
                          placeholder="Badge name"
                        />
                      </Field>
                      <Field label="Icon">
                        <select
                          className={inp}
                          value={badge.icon}
                          onChange={(e) =>
                            updateBadge(i, "icon", e.target.value)
                          }
                        >
                          <option value="award">Award</option>
                          <option value="star">Star</option>
                          <option value="shield">Shield</option>
                          <option value="crown">Crown</option>
                          <option value="zap">Zap</option>
                        </select>
                      </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Type">
                        <select
                          className={inp}
                          value={badge.type}
                          onChange={(e) =>
                            updateBadge(i, "type", e.target.value)
                          }
                        >
                          <option value="milestone">Milestone</option>
                          <option value="achievement">Achievement</option>
                          <option value="mastery">Mastery</option>
                          <option value="bonus">Bonus</option>
                        </select>
                      </Field>
                      <Field label="XP Reward">
                        <input
                          className={inp}
                          type="number"
                          min={0}
                          value={badge.xpReward}
                          onChange={(e) =>
                            updateBadge(i, "xpReward", e.target.value)
                          }
                        />
                      </Field>
                    </div>
                    <Field label="Unlock Reason">
                      <textarea
                        className={inp}
                        rows={2}
                        value={badge.unlockReason}
                        onChange={(e) =>
                          updateBadge(i, "unlockReason", e.target.value)
                        }
                        placeholder="Why this badge is earned"
                      />
                    </Field>
                  </div>
                ))}
              </div>
            )}

            {/* ── QUIZ SETTINGS TAB ── */}
            {mainTab === "quiz" && (
              <div className="space-y-4">
                <Field label="Pass Percentage">
                  <input
                    className={inp}
                    type="number"
                    min={1}
                    max={100}
                    value={basic.passPercentage}
                    onChange={(e) =>
                      setBasic((p) => ({
                        ...p,
                        passPercentage: e.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="Quiz Bonus XP">
                  <input
                    className={inp}
                    type="number"
                    min={0}
                    value={basic.quizBonusXP}
                    onChange={(e) =>
                      setBasic((p) => ({ ...p, quizBonusXP: e.target.value }))
                    }
                  />
                </Field>
                <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <p className="text-sm text-slate-300">📊 Quiz Statistics</p>
                  <p className="text-xs text-slate-500 mt-2">
                    Total Questions:{" "}
                    {tasks.reduce((sum, t) => sum + t.questions.length, 0)}
                  </p>
                  <p className="text-xs text-slate-500">
                    Tasks with Questions:{" "}
                    {tasks.filter((t) => t.questions.length > 0).length}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Preview Panel */}
        <div className="w-96 border-l border-slate-700 bg-slate-850 overflow-y-auto">
          <div className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase">
              Live Preview
            </h3>

            {activeTask && (
              <div className="space-y-4">
                <PreviewTaskHeader task={activeTask} />
                <PreviewScenario scenario={activeTask.scenario} />
                <PreviewQuestions questions={activeTask.questions} />

                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <p className="text-xs font-semibold text-slate-400 uppercase mb-2">
                    Content Blocks ({activeTask.content.length})
                  </p>
                  {activeTask.content.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      No content blocks yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {activeTask.content.map((block, i) => (
                        <div
                          key={block.id}
                          className="p-2 bg-slate-900 rounded text-xs text-slate-400"
                        >
                          <span className="font-mono">
                            [{block.type.toUpperCase()}]
                          </span>{" "}
                          {block.content.substring(0, 40)}...
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
