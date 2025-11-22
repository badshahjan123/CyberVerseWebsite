import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Plus, Trash2, AlertTriangle, GripVertical } from 'lucide-react'

const RoomEditor = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState('basic')
    const [room, setRoom] = useState(null)
    const [duplicateWarnings, setDuplicateWarnings] = useState([])

    useEffect(() => {
        fetchRoom()
    }, [id])

    useEffect(() => {
        if (room) {
            checkDuplicates()
        }
    }, [room?.topics, room?.quizzes])

    const fetchRoom = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`http://localhost:5000/api/admin/rooms/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            })
            if (!response.ok) throw new Error('Failed to fetch room')
            const data = await response.json()
            setRoom(data)
            setLoading(false)
        } catch (error) {
            console.error('Failed to load room:', error)
            alert('Failed to load room')
            navigate('/secure-admin-dashboard')
        }
    }

    const checkDuplicates = () => {
        if (!room?.topics || !room?.quizzes?.[0]?.questions) return

        const taskQuestions = room.topics.map(t => t.title?.toLowerCase().trim())
        const warnings = []

        room.quizzes[0].questions.forEach((q, idx) => {
            const questionText = q.question_text?.toLowerCase().trim()
            if (taskQuestions.some(tq => tq === questionText || questionText?.includes(tq))) {
                warnings.push({
                    quizIndex: idx,
                    message: `Quiz question "${q.question_text}" may be duplicate of a task`
                })
            }
        })

        setDuplicateWarnings(warnings)
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`http://localhost:5000/api/admin/rooms/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include',
                body: JSON.stringify(room)
            })

            if (!response.ok) throw new Error('Failed to save room')

            alert('Room updated successfully!')
            navigate('/secure-admin-dashboard')
        } catch (error) {
            console.error('Save error:', error)
            alert('Failed to save room')
        } finally {
            setSaving(false)
        }
    }

    const addTopic = () => {
        const newTopic = {
            id: (room.topics?.length || 0) + 1,
            title: 'New Topic',
            content_markdown: '## New Topic\n\nAdd your content here...'
        }
        setRoom({
            ...room,
            topics: [...(room.topics || []), newTopic]
        })

        // Add corresponding exercise
        const newExercise = {
            id: (room.exercises?.length || 0) + 1,
            description_markdown: 'What is the answer?',
            expected_flag: 'answer',
            points: 100
        }
        setRoom(prev => ({
            ...prev,
            exercises: [...(prev.exercises || []), newExercise]
        }))
    }

    const deleteTopic = (index) => {
        if (!confirm('Delete this topic?')) return
        setRoom({
            ...room,
            topics: room.topics.filter((_, i) => i !== index),
            exercises: room.exercises.filter((_, i) => i !== index)
        })
    }

    const updateTopic = (index, field, value) => {
        const updatedTopics = [...room.topics]
        updatedTopics[index] = { ...updatedTopics[index], [field]: value }
        setRoom({ ...room, topics: updatedTopics })
    }

    const updateExercise = (index, field, value) => {
        const updatedExercises = [...room.exercises]
        updatedExercises[index] = { ...updatedExercises[index], [field]: value }
        setRoom({ ...room, exercises: updatedExercises })
    }

    const addQuizQuestion = () => {
        if (!room.quizzes || room.quizzes.length === 0) {
            // Create quiz if it doesn't exist
            setRoom({
                ...room,
                quizzes: [{
                    id: 1,
                    title: 'Final Quiz',
                    pass_percentage: 70,
                    questions: []
                }]
            })
        }

        const newQuestion = {
            id: (room.quizzes[0]?.questions?.length || 0) + 1,
            question_text: 'New question?',
            type: 'single',
            options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
            correct_answer: 'Option 1',
            points: 100
        }

        const updatedQuizzes = [...room.quizzes]
        updatedQuizzes[0].questions = [...(updatedQuizzes[0].questions || []), newQuestion]
        setRoom({ ...room, quizzes: updatedQuizzes })
    }

    const deleteQuizQuestion = (index) => {
        if (!confirm('Delete this quiz question?')) return
        const updatedQuizzes = [...room.quizzes]
        updatedQuizzes[0].questions = updatedQuizzes[0].questions.filter((_, i) => i !== index)
        setRoom({ ...room, quizzes: updatedQuizzes })
    }

    const updateQuizQuestion = (index, field, value) => {
        const updatedQuizzes = [...room.quizzes]
        updatedQuizzes[0].questions[index] = {
            ...updatedQuizzes[0].questions[index],
            [field]: value
        }
        setRoom({ ...room, quizzes: updatedQuizzes })
    }

    const updateQuizOption = (questionIndex, optionIndex, value) => {
        const updatedQuizzes = [...room.quizzes]
        updatedQuizzes[0].questions[questionIndex].options[optionIndex] = value
        setRoom({ ...room, quizzes: updatedQuizzes })
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-900">
            {/* Header */}
            <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/secure-admin-dashboard')}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Edit Room</h1>
                                <p className="text-slate-400">{room.title || room.name}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8">
                {/* Tabs */}
                <div className="flex gap-2 mb-8 border-b border-slate-700">
                    {['basic', 'tasks', 'quiz'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 font-medium transition-colors ${activeTab === tab
                                ? 'text-blue-400 border-b-2 border-blue-400'
                                : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            {tab === 'basic' ? 'Basic Info' : tab === 'tasks' ? 'Tasks/Topics' : 'Quiz Questions'}
                        </button>
                    ))}
                </div>

                {/* Basic Info Tab */}
                {activeTab === 'basic' && (
                    <div className="max-w-3xl space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                            <input
                                type="text"
                                value={room.title || room.name || ''}
                                onChange={(e) => setRoom({ ...room, title: e.target.value, name: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                            <textarea
                                rows={4}
                                value={room.description || ''}
                                onChange={(e) => setRoom({ ...room, description: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Difficulty</label>
                                <select
                                    value={room.difficulty || 'Beginner'}
                                    onChange={(e) => setRoom({ ...room, difficulty: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                    <option value="Expert">Expert</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                                <input
                                    type="text"
                                    value={room.category || ''}
                                    onChange={(e) => setRoom({ ...room, category: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Tasks Tab */}
                {activeTab === 'tasks' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Edit Tasks & Exercises</h2>
                            <button
                                onClick={addTopic}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Task
                            </button>
                        </div>

                        {room.topics?.map((topic, index) => (
                            <div key={index} className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <GripVertical className="w-5 h-5 text-slate-500" />
                                        <span className="text-slate-400 font-medium">Task {index + 1}</span>
                                    </div>
                                    <button
                                        onClick={() => deleteTopic(index)}
                                        className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Task Title</label>
                                        <input
                                            type="text"
                                            value={topic.title || ''}
                                            onChange={(e) => updateTopic(index, 'title', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Content (Markdown)</label>
                                        <textarea
                                            rows={6}
                                            value={topic.content_markdown || topic.content || ''}
                                            onChange={(e) => updateTopic(index, 'content_markdown', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono text-sm focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>

                                    {room.exercises?.[index] && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2">Exercise Question</label>
                                                <input
                                                    type="text"
                                                    value={room.exercises[index].description_markdown || ''}
                                                    onChange={(e) => updateExercise(index, 'description_markdown', e.target.value)}
                                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-300 mb-2">Correct Answer</label>
                                                    <input
                                                        type="text"
                                                        value={room.exercises[index].expected_flag || ''}
                                                        onChange={(e) => updateExercise(index, 'expected_flag', e.target.value)}
                                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-slate-300 mb-2">Points</label>
                                                    <input
                                                        type="number"
                                                        value={room.exercises[index].points || 100}
                                                        onChange={(e) => updateExercise(index, 'points', parseInt(e.target.value))}
                                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}

                        {(!room.topics || room.topics.length === 0) && (
                            <div className="text-center py-12 text-slate-400">
                                No tasks yet. Click "Add Task" to create one.
                            </div>
                        )}
                    </div>
                )}

                {/* Quiz Tab */}
                {activeTab === 'quiz' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Edit Quiz Questions</h2>
                            <button
                                onClick={addQuizQuestion}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Question
                            </button>
                        </div>

                        {duplicateWarnings.length > 0 && (
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="text-yellow-400 font-semibold mb-2">Duplicate Questions Detected</h3>
                                        <ul className="text-yellow-300 text-sm space-y-1">
                                            {duplicateWarnings.map((w, i) => (
                                                <li key={i}>• {w.message}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {room.quizzes?.[0]?.questions?.map((question, index) => {
                            const hasWarning = duplicateWarnings.some(w => w.quizIndex === index)

                            return (
                                <div
                                    key={index}
                                    className={`bg-slate-800 border rounded-xl p-6 ${hasWarning ? 'border-yellow-500/50' : 'border-slate-700'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <span className="text-slate-400 font-medium">Question {index + 1}</span>
                                        <button
                                            onClick={() => deleteQuizQuestion(index)}
                                            className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">Question Text</label>
                                            <input
                                                type="text"
                                                value={question.question_text || ''}
                                                onChange={(e) => updateQuizQuestion(index, 'question_text', e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">Question Type</label>
                                            <select
                                                value={question.type || 'single'}
                                                onChange={(e) => updateQuizQuestion(index, 'type', e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                            >
                                                <option value="single">Single Choice</option>
                                                <option value="multi">Multiple Choice</option>
                                                <option value="short">Short Answer</option>
                                            </select>
                                        </div>

                                        {question.type !== 'short' && (
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2">Options</label>
                                                {question.options?.map((option, optIdx) => (
                                                    <input
                                                        key={optIdx}
                                                        type="text"
                                                        value={option}
                                                        onChange={(e) => updateQuizOption(index, optIdx, e.target.value)}
                                                        className="w-full px-3 py-2 mb-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                                        placeholder={`Option ${optIdx + 1}`}
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">Correct Answer</label>
                                            <input
                                                type="text"
                                                value={question.correct_answer || ''}
                                                onChange={(e) => updateQuizQuestion(index, 'correct_answer', e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                                placeholder="Enter the exact correct answer"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">Points</label>
                                            <input
                                                type="number"
                                                value={question.points || 100}
                                                onChange={(e) => updateQuizQuestion(index, 'points', parseInt(e.target.value))}
                                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )
                        })}

                        {(!room.quizzes || !room.quizzes[0]?.questions || room.quizzes[0].questions.length === 0) && (
                            <div className="text-center py-12 text-slate-400">
                                No quiz questions yet. Click "Add Question" to create one.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default RoomEditor
