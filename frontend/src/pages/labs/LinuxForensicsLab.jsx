import { useState, useEffect } from 'react';
import { Lock, Unlock, Terminal, Play, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { apiCall } from '../../config/api';

const LinuxForensicsLab = () => {
    // State management - TryHackMe workflow
    const [labStarted, setLabStarted] = useState(false);
    const [machineStarted, setMachineStarted] = useState(false);
    const [labCompleted, setLabCompleted] = useState(false);
    const [terminalUrl, setTerminalUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [userAnswers, setUserAnswers] = useState({});
    const [completedTasks, setCompletedTasks] = useState([]);

    // Lab configuration
    const labConfig = {
        title: 'Linux File Forensics: Hidden Secrets',
        difficulty: 'Beginner',
        points: 100,
        estimatedTime: '30-45 minutes'
    };

    // Check if user has already completed this lab on mount
    useEffect(() => {
        checkCompletionStatus();
    }, []);

    const checkCompletionStatus = async () => {
        try {
            console.log('🔍 Checking lab completion status...');
            const response = await apiCall('/labs/linux-forensics/completion-status');

            console.log('📡 Completion status response:', response);

            if (response.success && response.completed) {
                // User has already completed this lab
                console.log('✅ Lab already completed on:', response.completionData?.completedAt);
                console.log('🏆 Lab points:', response.labPoints);
                setLabCompleted(true);
                setLabStarted(true);
                setMachineStarted(false); // Don't auto-start machine
                setCompletedTasks(tasks.map(t => t.id)); // Mark all tasks as complete
            } else {
                console.log('ℹ️ Lab not yet completed');
            }
        } catch (err) {
            console.error('❌ Error checking completion status:', err);
            console.error('Error details:', err.message);
            // Silently fail - let user proceed normally
        }
    };

    // Tasks WITHOUT answers (answers hidden from UI)
    const tasks = [
        {
            id: 1,
            title: 'Hidden File Discovery',
            instructions: 'Navigate to the evidence directory and list all files including hidden ones.',
            commands: ['cd /home/labuser/evidence', 'ls -a'],
            question: 'What is the name of the hidden file you discovered?',
            hint: 'Hidden files in Linux start with a dot (.)',
            correctAnswer: '.secret_note'
        },
        {
            id: 2,
            title: 'File Content Examination',
            instructions: 'Read the content of the hidden file you discovered.',
            commands: ['cat .secret_note'],
            question: 'What message is written inside the hidden file?',
            hint: 'Use the cat command to read file contents',
            correctAnswer: 'The password is hidden in the binary'
        },
        {
            id: 3,
            title: 'Binary File Investigation',
            instructions: 'There is a file called mystery.bin. Check its file type and decode it.',
            commands: ['file mystery.bin', 'base64 -d mystery.bin'],
            question: 'What is the decoded message from mystery.bin?',
            hint: 'The file is Base64 encoded. Use base64 -d to decode it',
            correctAnswer: 'SECRET_KEY_12345'
        },
        {
            id: 4,
            title: 'Command History Analysis',
            instructions: 'Examine the bash command history to find suspicious activity.',
            commands: ['cat ~/.bash_history'],
            question: 'What suspicious command appears in the history?',
            hint: 'Look for commands involving flags or secrets',
            correctAnswer: 'echo "FLAG" > /tmp/flag_storage'
        },
        {
            id: 5,
            title: 'Final Flag Extraction',
            instructions: 'Search the entire home directory for files containing the word "FLAG".',
            commands: ['grep -R "FLAG" /home/labuser 2>/dev/null', 'cat ~/.backup_flag.txt'],
            question: 'What is the final flag?',
            hint: 'The flag is stored in a hidden backup file',
            correctAnswer: 'FLAG{FORENSIC_DISCOVERY_COMPLETE}'
        }
    ];

    // Handle Start Lab (Step 1)
    const handleStartLab = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiCall('/labs/start/linux-forensics', {
                method: 'POST'
            });

            if (response.success) {
                setLabStarted(true);
            } else {
                throw new Error(response.message || 'Failed to start lab');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle Start Machine (Step 2)
    const handleStartMachine = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiCall('/labs/start/linux-forensics', {
                method: 'POST'
            });

            if (response.success) {
                setMachineStarted(true);
                setTerminalUrl(response.webTerminalUrl);
            } else {
                throw new Error(response.message || 'Failed to start machine');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle answer submission
    const handleSubmitAnswer = async (taskId, answer) => {
        const task = tasks.find(t => t.id === taskId);

        if (!answer.trim()) {
            setError('Please enter an answer');
            return false;
        }

        // Check if answer is correct (case-insensitive)
        if (task.correctAnswer && answer.trim().toUpperCase() === task.correctAnswer.toUpperCase()) {
            const updatedCompletedTasks = [...completedTasks, taskId];
            setCompletedTasks(updatedCompletedTasks);
            setUserAnswers({ ...userAnswers, [taskId]: answer });
            setError(null);

            // If it's the final task, mark lab as complete and call backend
            if (taskId === tasks.length) {
                // IMPORTANT: Check if all previous tasks are completed
                const allPreviousTasksCompleted = updatedCompletedTasks.length === tasks.length;

                if (!allPreviousTasksCompleted) {
                    setError(`You must complete all previous tasks (Tasks 1-${tasks.length - 1}) before completing the lab.`);
                    return false;
                }

                setLabCompleted(true);

                // Call backend to update score and leaderboard
                try {
                    console.log('🎯 Calling lab completion API...');
                    const response = await apiCall('/labs/linux-forensics/complete', {
                        method: 'POST',
                        body: JSON.stringify({
                            tasksCompleted: tasks.length,
                            timeSpent: 0,
                            finalScore: labConfig.points
                        })
                    });

                    console.log('📡 Completion API Response:', response);

                    if (response.success) {
                        console.log('✅ Lab completion recorded:', response.data);
                        console.log(`🏆 Points earned: +${response.data.pointsEarned}`);
                        console.log(`📊 Total points: ${response.data.totalPoints}`);

                        if (response.data.streakIncreased) {
                            console.log(`🔥 Streak updated: ${response.data.currentStreak} day${response.data.currentStreak !== 1 ? 's' : ''}!`);
                            if (response.data.currentStreak === response.data.longestStreak) {
                                console.log(`🌟 New longest streak! ${response.data.longestStreak} days!`);
                            }
                        }
                    } else {
                        console.error('❌ Completion API returned success:false', response);
                    }
                } catch (err) {
                    console.error('❌ Error recording lab completion:', err);
                    console.error('Error details:', err.message);
                    // Don't block UI completion even if API fails
                }
            }

            return true;
        } else {
            setError(`Incorrect answer for Task ${taskId}. Please try again.`);
            return false;
        }
    };

    return (
        <div className="page-container bg-[rgb(8,12,16)] text-text min-h-screen pb-32">
            <div className="container mx-auto px-4 max-w-6xl py-8">

                {/* Header - Always visible */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <Terminal className="w-8 h-8 text-primary" />
                        <h1 className="text-4xl font-bold gradient-text">{labConfig.title}</h1>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted">
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full">
                            {labConfig.difficulty}
                        </span>
                        <span>⏱️ {labConfig.estimatedTime}</span>
                        <span>🏆 {labConfig.points} points</span>
                    </div>
                </div>

                {/* Introduction - Always visible */}
                <div className="glass-effect rounded-xl p-6 mb-6 border border-white/10">
                    <h2 className="text-2xl font-bold text-text mb-4">🧩 Introduction</h2>
                    <p className="text-muted mb-4">
                        Welcome to <strong>Linux File Forensics: Hidden Secrets</strong> lab.
                    </p>
                    <p className="text-muted mb-4">
                        In this mission, you're investigating a suspicious folder left behind by an unknown developer.
                        The folder contains hidden files, altered timestamps, and encrypted messages. Your job is to
                        uncover the truth by exploring the Linux filesystem and using simple forensic techniques.
                    </p>
                    <p className="text-muted">
                        This lab teaches real-world investigation skills used by cybersecurity analysts.
                    </p>
                </div>

                {/* Learning Objectives - Always visible */}
                <div className="glass-effect rounded-xl p-6 mb-6 border border-white/10">
                    <h2 className="text-2xl font-bold text-text mb-4">🎯 What You Will Learn</h2>
                    <ul className="space-y-2 text-muted">
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <span>Understanding hidden files (<code className="text-primary">ls -a</code>)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <span>Reading metadata using <code className="text-primary">stat</code></span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <span>Searching inside files using <code className="text-primary">grep</code></span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <span>Identifying file types using <code className="text-primary">file</code></span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <span>Recovering data from history files</span>
                        </li>
                    </ul>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="glass-effect rounded-xl p-4 mb-6 border border-red-500/30 bg-red-500/10">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-red-400 font-semibold">Error</p>
                                <p className="text-sm text-red-300">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* STATE 1: Not Started - Show "Start Lab" button ONLY */}
                {!labStarted && !labCompleted && (
                    <div className="glass-effect rounded-xl p-8 mb-6 border border-white/10 text-center">
                        <Lock className="w-16 h-16 text-muted mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-text mb-2">Ready to Begin?</h3>
                        <p className="text-muted mb-6">Click the button below to start the lab</p>

                        <button
                            onClick={handleStartLab}
                            disabled={loading}
                            className="btn-primary flex items-center gap-2 mx-auto"
                        >
                            {loading ? (
                                <>
                                    <Loader className="w-5 h-5 animate-spin" />
                                    Starting Lab...
                                </>
                            ) : (
                                <>
                                    <Play className="w-5 h-5" />
                                    Start Lab
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* STATE 2: Lab Started but Machine Not Started - Show "Start Machine" button */}
                {labStarted && !machineStarted && !labCompleted && (
                    <div className="glass-effect rounded-xl p-8 mb-6 border border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 text-center">
                        <Unlock className="w-16 h-16 text-primary mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-text mb-2">✅ Lab Started Successfully</h3>
                        <p className="text-muted mb-6">Now start the virtual machine to access the terminal</p>

                        <button
                            onClick={handleStartMachine}
                            disabled={loading}
                            className="btn-primary flex items-center gap-2 mx-auto"
                        >
                            {loading ? (
                                <>
                                    <Loader className="w-5 h-5 animate-spin" />
                                    Starting Machine...
                                </>
                            ) : (
                                <>
                                    <Terminal className="w-5 h-5" />
                                    Start Machine
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* STATE 3: Machine Started - Show Terminal and Tasks (NO ANSWERS) */}
                {machineStarted && !labCompleted && (
                    <>
                        {/* Terminal Section */}
                        <div className="glass-effect rounded-xl p-6 mb-6 border border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <Terminal className="w-6 h-6 text-primary" />
                                    <h3 className="text-xl font-bold text-text">Lab Environment</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="text-sm text-muted">Machine Running</span>
                                </div>
                            </div>

                            {terminalUrl && (
                                <div className="space-y-4">
                                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                                        <iframe
                                            src={terminalUrl}
                                            className="absolute top-0 left-0 w-full h-full rounded-lg border border-white/20"
                                            title="Lab Terminal"
                                            allow="clipboard-read; clipboard-write"
                                        />
                                    </div>
                                    <p className="text-sm text-muted text-center">
                                        💻 Use the terminal above to complete the tasks below
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Progress Tracker */}
                        <div className="glass-effect rounded-xl p-4 mb-6 border border-white/10">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-text">Progress:</span>
                                <span className="text-sm text-muted">{completedTasks.length} / {tasks.length} tasks completed</span>
                            </div>
                            <div className="mt-2 w-full bg-background/50 rounded-full h-2">
                                <div
                                    className="bg-primary h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${(completedTasks.length / tasks.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Tasks Section - Questions ONLY, NO answers */}
                        <div className="glass-effect rounded-xl p-6 mb-6 border border-white/10">
                            <h2 className="text-2xl font-bold text-text mb-6">🔓 Lab Tasks</h2>

                            <div className="space-y-6">
                                {tasks.map((task) => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        isCompleted={completedTasks.includes(task.id)}
                                        onSubmit={handleSubmitAnswer}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Auto-complete check if all tasks are done */}
                        {completedTasks.length === tasks.length && !labCompleted && (
                            <div className="glass-effect rounded-xl p-6 mb-6 border border-primary/30 bg-primary/10 text-center">
                                <p className="text-white mb-4">
                                    🎉 All tasks completed! Click below to finalize your lab completion.
                                </p>
                                <button
                                    onClick={async () => {
                                        setLabCompleted(true);
                                        try {
                                            const response = await apiCall('/labs/linux-forensics/complete', {
                                                method: 'POST',
                                                body: JSON.stringify({
                                                    tasksCompleted: tasks.length,
                                                    timeSpent: 0,
                                                    finalScore: labConfig.points
                                                })
                                            });
                                            if (response.success) {
                                                console.log('✅ Lab manually completed:', response.data);
                                            }
                                        } catch (err) {
                                            console.error('Error:', err);
                                        }
                                    }}
                                    className="btn-primary mx-auto"
                                >
                                    Complete Lab & Claim Points
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* STATE 4: Lab Completed */}
                {labCompleted && (
                    <div className="space-y-6">
                        {/* Completion Badge */}
                        <div className="glass-effect rounded-xl p-8 border border-green-500/30 bg-gradient-to-br from-green-500/10 to-primary/5 text-center">
                            <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4 animate-pulse" />
                            <h2 className="text-3xl font-bold text-text mb-4">🏁 Lab Complete!</h2>
                            <p className="text-lg text-muted mb-4">
                                Congratulations! You successfully detected, investigated, and extracted hidden evidence
                                from a suspicious Linux environment.
                            </p>
                            <p className="text-muted mb-6">
                                You now understand: Hidden files, File metadata, Searching with grep, File type identification,
                                and Basic forensic workflow.
                            </p>
                            <div className="inline-block px-8 py-4 bg-primary/20 border border-primary/30 rounded-lg">
                                <p className="text-primary font-bold text-2xl">+{labConfig.points} Points Earned 🎉</p>
                            </div>
                        </div>

                        {/* View Content Option (Like TryHackMe) */}
                        <div className="glass-effect rounded-xl p-6 border border-white/10">
                            <h3 className="text-xl font-bold text-text mb-4">📚 Review Lab Content</h3>
                            <p className="text-muted mb-4">
                                You can review the lab tasks and learning objectives below, but you cannot re-submit answers.
                            </p>

                            {/* Show all tasks in read-only mode */}
                            <div className="space-y-4">
                                {tasks.map((task) => (
                                    <div key={task.id} className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                                        <div className="flex items-start gap-2 mb-2">
                                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                            <h4 className="text-md font-bold text-text">
                                                Task {task.id} — {task.title}
                                            </h4>
                                        </div>
                                        <p className="text-sm text-muted ml-7">{task.instructions}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div >
    );
};

// Task Card Component - Shows questions ONLY, no answers
const TaskCard = ({ task, isCompleted, onSubmit }) => {
    const [answer, setAnswer] = useState('');
    const [showHint, setShowHint] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const success = onSubmit(task.id, answer);
        if (success) {
            setAnswer('');
        }
        setSubmitting(false);
    };

    return (
        <div className={`p-5 rounded-lg border transition-all duration-300 ${isCompleted
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-background/50 border-white/10'
            }`}>
            <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-text flex items-center gap-2">
                    {isCompleted && <CheckCircle className="w-5 h-5 text-green-400" />}
                    🧠 Task {task.id} — {task.title}
                </h3>
            </div>

            <p className="text-muted mb-3">{task.instructions}</p>

            {task.commands && task.commands.length > 0 && (
                <div className="mb-3">
                    <p className="text-sm text-muted mb-2">💻 Commands to try:</p>
                    {task.commands.map((cmd, idx) => (
                        <code key={idx} className="block bg-black/50 p-2 rounded text-primary text-sm mb-1 font-mono">
                            {cmd}
                        </code>
                    ))}
                </div>
            )}

            <div className="mb-3 p-3 bg-accent/10 rounded border border-accent/20">
                <p className="text-sm font-semibold text-accent mb-1">📌 Question:</p>
                <p className="text-text">{task.question}</p>
            </div>

            {task.hint && (
                <div className="mb-4">
                    <button
                        onClick={() => setShowHint(!showHint)}
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                        {showHint ? '🔽 Hide Hint' : '💡 Need a Hint?'}
                    </button>
                    {showHint && (
                        <p className="text-sm text-muted mt-2 p-3 bg-primary/10 rounded border border-primary/20">
                            💡 {task.hint}
                        </p>
                    )}
                </div>
            )}

            {!isCompleted && (
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Enter your answer..."
                        className="flex-1 px-4 py-2 bg-slate-900 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={submitting || !answer.trim()}
                        className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Checking...' : 'Submit'}
                    </button>
                </form>
            )}

            {isCompleted && (
                <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded border border-green-500/30">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="font-semibold text-green-400">✅ Task Completed</span>
                </div>
            )}
        </div>
    );
};

export default LinuxForensicsLab;
