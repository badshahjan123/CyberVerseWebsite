import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Plus, Trash2, Upload, X, ChevronDown, ChevronUp } from "lucide-react";

const API = "http://localhost:5000/api/admin";
const token = () => localStorage.getItem("token");
const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token()}` });

const VALID_CATS  = ["Web", "Networking", "Development", "DevOps", "Misc"];
const VALID_DIFFS = ["Beginner", "Intermediate", "Advanced"];

const inp = "w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:border-cyan-500 focus:outline-none";

const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
    {children}
  </div>
);

const emptyTask = () => ({ _key: Date.now(), title: "", hint: "", blocks: [], taskQuestions: [] });
const emptyBlock = (type = "paragraph") => ({ _key: Date.now(), type, content: "" });
const emptyTaskQuestion = () => ({ _key: Date.now(), text: "", hint: "", answer: "", points: 10 });
const emptyQuizQuestion = () => ({ _key: Date.now(), text: "", options: ["", "", "", ""], answer: "", points: 10 });

export default function RoomEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openTask, setOpenTask] = useState(0);

  const [originalSlug, setOriginalSlug] = useState("");
  const [basic, setBasic] = useState({
    title: "", description: "", difficulty: "Beginner",
    category: "Web", duration: "60", creator: "CyberVerse Admin",
    tags: "", image: "", passPercentage: 70,
  });
  const [tasks, setTasks] = useState([emptyTask()]);
  const [quizQuestions, setQuizQuestions] = useState([]);

  /* ── Load existing room ── */
  useEffect(() => {
    fetch(`${API}/rooms/${id}`, { headers: authHeaders(), credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((room) => {
        setOriginalSlug(room.slug || "");
        setBasic({
          title: room.title || "",
          description: room.short_description || "",
          difficulty: VALID_DIFFS.includes(room.difficulty) ? room.difficulty : "Beginner",
          category: VALID_CATS.includes(room.category) ? room.category : "Web",
          duration: String(room.estimated_time_minutes || 60),
          creator: room.creator || "CyberVerse Admin",
          tags: (room.tags || []).join(", "),
          image: room.cover_image_url || "",
          passPercentage: room.quizzes?.[0]?.pass_percentage || 70,
        });

        const quizQs = room.quizzes?.[0]?.questions || [];

        const mapped = (room.topics || []).map((t, i) => {
          const ex = room.exercises?.[i] || {};
          // rebuild blocks from content_markdown (paragraphs) + code stored in content array
          let rawContent = t.content || [];
          if (typeof rawContent === 'string') { try { rawContent = JSON.parse(rawContent); } catch { rawContent = []; } }
          const blocks = rawContent.map((b) => ({ _key: Date.now() + Math.random(), type: b.type || "paragraph", content: b.content || "" }));
          if (!blocks.length && t.content_markdown) {
            blocks.push({ _key: Date.now(), type: "paragraph", content: t.content_markdown });
          }
          const taskQuestions = (t.taskQuestions || []).map((q) => ({
            _key: q.id || Date.now() + Math.random(),
            text: q.question_text || "",
            hint: q.hint || "",
            answer: q.correct_answer || "",
            points: q.points || 10,
          }));
          return { _key: t.id || i, title: t.title || "", hint: t.hint || ex.hint || "", blocks, taskQuestions };
        });

        const mappedQuiz = quizQs.map((q) => ({
          _key: q.id || Date.now() + Math.random(),
          text: q.question_text || "",
          options: q.options?.length ? q.options : ["", "", "", ""],
          answer: String(q.correct_answer || ""),
          points: q.points || 10,
        }));
        setTasks(mapped.length ? mapped : [emptyTask()]);
        setQuizQuestions(mappedQuiz);
        setLoading(false);
      })
      .catch(() => { alert("Failed to load room"); navigate("/secure-admin-dashboard"); });
  }, [id]);

  /* ── Image upload ── */
  const uploadImage = async (file) => {
    const fd = new FormData();
    fd.append("image", file);
    const res = await fetch(`${API}/rooms/upload-image`, {
      method: "POST", headers: { Authorization: `Bearer ${token()}` },
      credentials: "include", body: fd,
    });
    if (!res.ok) throw new Error("Upload failed");
    const { url } = await res.json();
    return `http://localhost:5000${url}`;
  };

  /* ── Task helpers ── */
  const updateTask = (i, field, val) =>
    setTasks((p) => p.map((t, idx) => idx === i ? { ...t, [field]: val } : t));

  const addBlock = (ti, type) =>
    updateTask(ti, "blocks", [...tasks[ti].blocks, emptyBlock(type)]);

  const updateBlock = (ti, bi, field, val) => {
    const blocks = tasks[ti].blocks.map((b, idx) => idx === bi ? { ...b, [field]: val } : b);
    updateTask(ti, "blocks", blocks);
  };

  const removeBlock = (ti, bi) =>
    updateTask(ti, "blocks", tasks[ti].blocks.filter((_, idx) => idx !== bi));

  const addTaskQuestion = (ti) =>
    updateTask(ti, "taskQuestions", [...tasks[ti].taskQuestions, emptyTaskQuestion()]);

  const updateTaskQuestion = (ti, qi, field, val) => {
    const taskQuestions = tasks[ti].taskQuestions.map((q, idx) => idx === qi ? { ...q, [field]: val } : q);
    updateTask(ti, "taskQuestions", taskQuestions);
  };

  const removeTaskQuestion = (ti, qi) =>
    updateTask(ti, "taskQuestions", tasks[ti].taskQuestions.filter((_, idx) => idx !== qi));

  /* ── Quiz helpers ── */
  const addQuizQuestion = () => setQuizQuestions((p) => [...p, emptyQuizQuestion()]);

  const updateQuizQuestion = (qi, field, val) =>
    setQuizQuestions((p) => p.map((q, idx) => idx === qi ? { ...q, [field]: val } : q));

  const updateQuizOption = (qi, oi, val) =>
    setQuizQuestions((p) => p.map((q, idx) => {
      if (idx !== qi) return q;
      const options = q.options.map((o, i) => i === oi ? val : o);
      return { ...q, options };
    }));

  const removeQuizQuestion = (qi) =>
    setQuizQuestions((p) => p.filter((_, idx) => idx !== qi));

  /* ── Save ── */
  const handleSave = async () => {
    if (!basic.title.trim()) return setError("Title is required.");
    if (!basic.description.trim()) return setError("Description is required.");
    if (tasks.some((t) => !t.title.trim())) return setError("All tasks need a title.");
    setError(""); setSaving(true);

    const mins = Math.max(5, parseInt(basic.duration) || 60);
    const slug = originalSlug ||
      basic.title.toLowerCase().trim()
        .replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-") || `room-${Date.now()}`;

    const payload = {
      slug,
      title: basic.title.trim(),
      short_description: basic.description.trim().slice(0, 200),
      long_description_markdown: basic.description.trim(),
      difficulty: VALID_DIFFS.includes(basic.difficulty) ? basic.difficulty : "Beginner",
      category: VALID_CATS.includes(basic.category) ? basic.category : "Misc",
      estimated_time_minutes: mins,
      creator: basic.creator || "CyberVerse Admin",
      tags: basic.tags.split(",").map((t) => t.trim()).filter(Boolean),
      cover_image_url: basic.image || "",
      isActive: true,
      topics: tasks.map((t, i) => ({
        id: i + 1, order: i + 1,
        title: t.title,
        estimated_time_minutes: Math.max(1, Math.ceil(mins / tasks.length)),
        content_markdown: t.blocks.filter((b) => b.type === "paragraph").map((b) => b.content).join("\n\n"),
        hint: t.hint || "",
        content: t.blocks.map((b) => ({ type: b.type, content: b.content })),
        taskQuestions: t.taskQuestions.map((q, qi) => ({
          id: qi + 1,
          question_text: q.text,
          hint: q.hint,
          correct_answer: q.answer,
          points: Number(q.points) || 10,
        })),
      })),
      exercises: tasks.map((t, i) => ({
        id: i + 1, order: i + 1,
        title: t.title,
        description_markdown: t.hint || t.title,
        points: 100, type: "static", auto_validate: true,
      })),
      quizzes: quizQuestions.length > 0
        ? [{
            id: 1, title: "Final Assessment", order: 1,
            time_limit_seconds: 300,
            pass_percentage: Number(basic.passPercentage) || 70,
            questions: quizQuestions.map((q, qi) => ({
              id: qi + 1,
              question_text: q.text || "Question",
              type: "single",
              options: q.options.filter(Boolean),
              correct_answer: q.answer,
              points: Number(q.points) || 10,
              explanation: "",
            })),
          }]
        : [],
    };

    try {
      const res = await fetch(`${API}/rooms/${id}`, {
        method: "PUT", headers: authHeaders(), credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = Array.isArray(data.errors) ? data.errors.join(", ") : (data.message || "Save failed");
        throw new Error(msg);
      }
      const savedId = data.room?._id?.toString();
      if (savedId && savedId !== id) navigate(`/admin/rooms/${savedId}/edit`, { replace: true });
      else navigate("/secure-admin-dashboard");
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/secure-admin-dashboard")}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-bold text-white text-sm">Room Editor</h1>
            <p className="text-xs text-slate-400">{basic.title || "Untitled"}</p>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 rounded-lg text-sm font-semibold transition-colors">
          <Save size={15} /> {saving ? "Saving…" : "Save Room"}
        </button>
      </div>

      {error && (
        <div className="px-6 py-3 bg-red-500/10 border-b border-red-500/30 text-red-400 text-sm flex items-center justify-between">
          {error}
          <button onClick={() => setError("")}><X size={14} /></button>
        </div>
      )}

      <div className="max-w-3xl mx-auto p-8 space-y-8">

        {/* ── BASIC INFO ── */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400">Basic Info</h2>

          <Field label="Room Title">
            <input className={inp} value={basic.title}
              onChange={(e) => setBasic((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Web App Pentesting" />
          </Field>

          <Field label="Description (max 200 chars)">
            <textarea className={inp} rows={3} maxLength={200} value={basic.description}
              onChange={(e) => setBasic((p) => ({ ...p, description: e.target.value }))}
              placeholder="Short description shown on the room card" />
            <p className="text-xs text-slate-500 mt-1">{basic.description.length}/200</p>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Difficulty">
              <select className={inp} value={basic.difficulty}
                onChange={(e) => setBasic((p) => ({ ...p, difficulty: e.target.value }))}>
                {VALID_DIFFS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Category">
              <select className={inp} value={basic.category}
                onChange={(e) => setBasic((p) => ({ ...p, category: e.target.value }))}>
                {VALID_CATS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Duration (minutes)">
              <input className={inp} type="number" min={5} value={basic.duration}
                onChange={(e) => setBasic((p) => ({ ...p, duration: e.target.value }))} />
            </Field>
            <Field label="Quiz Pass % (0–100)">
              <input className={inp} type="number" min={1} max={100} value={basic.passPercentage}
                onChange={(e) => setBasic((p) => ({ ...p, passPercentage: e.target.value }))} />
            </Field>
          </div>

          <Field label="Tags (comma separated)">
            <input className={inp} value={basic.tags}
              onChange={(e) => setBasic((p) => ({ ...p, tags: e.target.value }))}
              placeholder="e.g. web, xss, owasp" />
          </Field>

          <Field label="Cover Image">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-cyan-500 transition-colors text-sm text-slate-400">
                <Upload size={15} /> Upload Image
                <input type="file" accept="image/*" className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const url = await uploadImage(file);
                      setBasic((p) => ({ ...p, image: url }));
                    } catch { setError("Image upload failed"); }
                  }} />
              </label>
              {basic.image && (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-700">
                  <img src={basic.image} alt="cover" className="w-full h-full object-cover" />
                  <button onClick={() => setBasic((p) => ({ ...p, image: "" }))}
                    className="absolute top-1 right-1 p-0.5 bg-red-600 rounded">
                    <X size={11} />
                  </button>
                </div>
              )}
            </div>
          </Field>
        </section>

        {/* ── TASKS ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400">Tasks ({tasks.length})</h2>
            <button onClick={() => { setTasks((p) => [...p, emptyTask()]); setOpenTask(tasks.length); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-semibold transition-colors">
              <Plus size={13} /> Add Task
            </button>
          </div>

          {tasks.map((task, ti) => (
            <div key={task._key} className="border border-slate-700 rounded-xl overflow-hidden">
              {/* Task header */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-800 cursor-pointer"
                onClick={() => setOpenTask(openTask === ti ? null : ti)}>
                <span className="text-sm font-semibold text-white">
                  <span className="text-slate-500 mr-2">#{ti + 1}</span>
                  {task.title || "Untitled Task"}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">{task.taskQuestions.length}Q · {task.blocks.length} blocks</span>
                  <button onClick={(e) => { e.stopPropagation(); setTasks((p) => p.filter((_, i) => i !== ti)); }}
                    className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors">
                    <Trash2 size={13} />
                  </button>
                  {openTask === ti ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                </div>
              </div>

              {openTask === ti && (
                <div className="p-5 bg-slate-900 space-y-5">

                  <Field label="Task Title">
                    <input className={inp} value={task.title}
                      onChange={(e) => updateTask(ti, "title", e.target.value)}
                      placeholder="e.g. Understanding XSS" />
                  </Field>

                  <Field label="Hint (shown to user)">
                    <input className={inp} value={task.hint}
                      onChange={(e) => updateTask(ti, "hint", e.target.value)}
                      placeholder="Optional hint for this task" />
                  </Field>

                  {/* Content Blocks */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Content Blocks</span>
                      <div className="flex gap-2">
                        <button onClick={() => addBlock(ti, "paragraph")}
                          className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs font-semibold transition-colors">
                          + Paragraph
                        </button>
                        <button onClick={() => addBlock(ti, "code")}
                          className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs font-semibold transition-colors">
                          + Code
                        </button>
                        <button onClick={() => addBlock(ti, "image")}
                          className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs font-semibold transition-colors">
                          + Image
                        </button>
                      </div>
                    </div>

                    {task.blocks.length === 0 && (
                      <p className="text-xs text-slate-600 italic">No content blocks yet. Add a paragraph, code block, or image.</p>
                    )}

                    {task.blocks.map((block, bi) => (
                      <div key={block._key} className="p-3 bg-slate-800 rounded-lg space-y-2 border border-slate-700">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase text-cyan-500 tracking-wider">{block.type}</span>
                          <button onClick={() => removeBlock(ti, bi)} className="text-red-400 hover:text-red-300">
                            <X size={13} />
                          </button>
                        </div>

                        {block.type === "paragraph" && (
                          <textarea className={`${inp} text-xs`} rows={4} value={block.content}
                            onChange={(e) => updateBlock(ti, bi, "content", e.target.value)}
                            placeholder="Write your explanation here. Use **bold**, *italic*, `code` for formatting." />
                        )}

                        {block.type === "code" && (
                          <textarea className={`${inp} text-xs font-mono`} rows={5} value={block.content}
                            onChange={(e) => updateBlock(ti, bi, "content", e.target.value)}
                            placeholder="Paste your code here..." />
                        )}

                        {block.type === "image" && (
                          <div className="space-y-2">
                            <input className={`${inp} text-xs`} value={block.content}
                              onChange={(e) => updateBlock(ti, bi, "content", e.target.value)}
                              placeholder="Image URL or upload below" />
                            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-cyan-400 transition-colors">
                              <Upload size={13} /> Upload image
                              <input type="file" accept="image/*" className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  try {
                                    const url = await uploadImage(file);
                                    updateBlock(ti, bi, "content", url);
                                  } catch { setError("Image upload failed"); }
                                }} />
                            </label>
                            {block.content && (
                              <img src={block.content} alt="block" className="max-h-32 rounded border border-slate-700 object-cover" />
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Task Questions (non-MCQ) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Questions</span>
                      <button onClick={() => addTaskQuestion(ti)}
                        className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs font-semibold transition-colors">
                        + Add Question
                      </button>
                    </div>

                    {task.taskQuestions.length === 0 && (
                      <p className="text-xs text-slate-600 italic">No questions yet.</p>
                    )}

                    {task.taskQuestions.map((q, qi) => (
                      <div key={q._key} className="p-3 bg-slate-800 rounded-lg space-y-2 border border-slate-700">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Q{qi + 1}</span>
                          <button onClick={() => removeTaskQuestion(ti, qi)} className="text-red-400 hover:text-red-300">
                            <X size={13} />
                          </button>
                        </div>
                        <input className={`${inp} text-xs`} value={q.text}
                          onChange={(e) => updateTaskQuestion(ti, qi, "text", e.target.value)}
                          placeholder="Question text" />
                        <input className={`${inp} text-xs`} value={q.hint}
                          onChange={(e) => updateTaskQuestion(ti, qi, "hint", e.target.value)}
                          placeholder="Hint (optional)" />
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <p className="text-[10px] text-green-400 font-semibold uppercase mb-1">Correct Answer</p>
                            <input className={`${inp} text-xs border-green-700 focus:border-green-500`} value={q.answer}
                              onChange={(e) => updateTaskQuestion(ti, qi, "answer", e.target.value)}
                              placeholder="Type the correct answer" />
                          </div>
                          <div className="w-20">
                            <p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Points</p>
                            <input className={`${inp} text-xs`} type="number" min={1} value={q.points}
                              onChange={(e) => updateTaskQuestion(ti, qi, "points", e.target.value)} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </section>

        {/* ── QUIZ ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400">Quiz ({quizQuestions.length} MCQs)</h2>
            <button onClick={addQuizQuestion}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-semibold transition-colors">
              <Plus size={13} /> Add Question
            </button>
          </div>

          {quizQuestions.length === 0 && (
            <p className="text-xs text-slate-600 italic">No quiz questions yet. Add MCQ questions for the final quiz.</p>
          )}

          {quizQuestions.map((q, qi) => (
            <div key={q._key} className="p-4 bg-slate-800 rounded-xl border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-500 uppercase">Q{qi + 1}</span>
                <button onClick={() => removeQuizQuestion(qi)} className="text-red-400 hover:text-red-300">
                  <Trash2 size={13} />
                </button>
              </div>

              <input className={`${inp} text-xs`} value={q.text}
                onChange={(e) => updateQuizQuestion(qi, "text", e.target.value)}
                placeholder="Question text" />

              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Options</span>
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <input
                      type="radio" name={`quiz-ans-${qi}`}
                      checked={q.answer === opt && opt !== ""}
                      onChange={() => opt && updateQuizQuestion(qi, "answer", opt)}
                      className="accent-cyan-500 flex-shrink-0"
                      title="Mark as correct answer"
                    />
                    <input className={`${inp} text-xs flex-1`} value={opt}
                      onChange={(e) => updateQuizOption(qi, oi, e.target.value)}
                      placeholder={`Option ${oi + 1}`} />
                  </div>
                ))}
                <p className="text-[10px] text-slate-500">Click the radio button to mark the correct answer.</p>
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-[10px] text-green-400 font-semibold uppercase mb-1">Correct Answer</p>
                  <p className="text-xs text-green-300 px-2 py-1 bg-green-900/30 border border-green-700/50 rounded">
                    {q.answer || <span className="text-slate-500 italic">Select an option above</span>}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Points</p>
                  <input className={`${inp} text-xs w-20`} type="number" min={1} value={q.points}
                    onChange={(e) => updateQuizQuestion(qi, "points", e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Save button at bottom */}
        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 rounded-lg font-semibold transition-colors">
            <Save size={16} /> {saving ? "Saving…" : "Save Room"}
          </button>
        </div>
      </div>
    </div>
  );
}
