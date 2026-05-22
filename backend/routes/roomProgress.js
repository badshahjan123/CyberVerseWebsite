const express = require('express');
const User = require('../models/User');
const Room = require('../models/Room');
const RealtimeHelper = require('../utils/realtimeHelper');
const WeeklyStats = require('../models/WeeklyStats');
const { awardRoomBadges, checkMilestoneBadges } = require('../utils/badgeHelper');
const { auth } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/room-progress/active
// @desc    Get user's active (in-progress) rooms with real progress %
// @access  Private
router.get('/active', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const inProgress = (user.roomProgress || []).filter(rp => rp.joined && !rp.completed);
    if (!inProgress.length) return res.json({ rooms: [] });

    const slugs = inProgress.map(rp => rp.roomId);
    const rooms = await Room.find({ slug: { $in: slugs } }).select('slug title topics');

    const result = inProgress.map(rp => {
      const room = rooms.find(r => r.slug === rp.roomId);
      
      // Fallback counts for rooms with frontend-defined content (Tasks/Topics only)
      const ROOM_REGISTRY_FALLBACK = {
        'networking-fundamentals': 5,
        'web-app-pentesting': 5,
        'rest-api-mastery': 5,
        'sql-injection-fundamentals': 4,
        'linux-fundamentals': 5,
        'authentication-session-attacks': 5,
        'osint-investigation': 5,
        'python-pickle-deserialization': 5,
        'cryptography-basics': 5,
        'reverse-engineering-basics': 5
      };

      // Base tasks from all sources
      let baseTasks = room?.topics?.length || 
                      room?.tasks?.length || 
                      room?.exercises?.length || 
                      ROOM_REGISTRY_FALLBACK[rp.roomId] || 0;

      // Every room in the registry has a final quiz, plus DB check
      const hasQuiz = (room?.quizzes?.length > 0) || !!ROOM_REGISTRY_FALLBACK[rp.roomId];
      const totalTasks = baseTasks + (hasQuiz ? 1 : 0);

      // Convert exerciseAnswers to plain object
      const answers = rp.exerciseAnswers
        ? (typeof rp.exerciseAnswers.toObject === 'function'
            ? rp.exerciseAnswers.toObject()
            : Object.fromEntries(
                rp.exerciseAnswers instanceof Map ? rp.exerciseAnswers : Object.entries(rp.exerciseAnswers)
              ))
        : {};

      // 1. Progress from tasks
      const completedLectures = rp.completedLectures?.length || 0;

      // 2. Progress from taskQuestions (admin rooms)
      let tqCompleted = 0;
      const topicsOrTasks = room?.topics || room?.tasks || [];
      if (topicsOrTasks.length) {
        tqCompleted = topicsOrTasks.filter(item => {
          const questions = item.taskQuestions || item.questions || [];
          if (!questions.length) return false;
          return questions.every(q => {
            const key = `tq_${item.id}_${q.id}`;
            const val = answers[key] || answers[item.id-1];
            return val?.correct === true;
          });
        }).length;
      }

      // 3. Quiz Completion
      const quizDone = rp.quizCompleted ? 1 : 0;

      // 4. Combined count
      let completedCount = Math.max(completedLectures, tqCompleted) + quizDone;
      
      // 5. Partial Progress Calculation
      const tqAnsweredCount = Object.keys(answers).filter(k => 
        (k.startsWith('tq_') || !isNaN(k)) && answers[k]?.correct
      ).length;

      let progress = 0;
      if (totalTasks > 0) {
        if (completedCount > 0) {
          progress = Math.min(100, Math.round((completedCount / totalTasks) * 100));
        } else if (tqAnsweredCount > 0) {
          const totalQuestions = topicsOrTasks.reduce((sum, item) => 
            sum + (item.taskQuestions?.length || item.questions?.length || 1), 0
          ) || (baseTasks || 1);
          
          // Progress within tasks portion (scaled to totalTasks)
          const taskProgressWeight = baseTasks / totalTasks;
          const questionWeight = (tqAnsweredCount / totalQuestions) * 100;
          progress = Math.min(Math.round(questionWeight * taskProgressWeight), 99);
          if (progress < 5) progress = 5;
        }
      }

      return {
        id: rp.roomId,
        title: room?.title || rp.roomId,
        progress,
        completedCount,
        totalTasks,
      };
    });

    res.json({ rooms: result });
  } catch (error) {
    console.error('Active rooms error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/room-progress/:roomId - Get user's progress for a specific room
router.get('/:roomId', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const user = await User.findById(req.user.id);

    const existing = user.roomProgress.find(p => p.roomId === roomId);

    // Always return success:true so the frontend can reliably branch on it
    const roomProgress = existing || {
      roomId,
      joined: false,
      currentLecture: 0,
      completedLectures: [],
      exerciseAnswers: {},
      quizCompleted: false,
      finalScore: null,
      completed: false
    };

    res.json({ success: true, progress: roomProgress });
  } catch (error) {
    console.error('Get room progress error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/room-progress/:roomId/join - Join a room
router.post('/:roomId/join', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const user = await User.findById(req.user.id);

    if (!user.roomProgress) {
      user.roomProgress = [];
    }

    let roomProgress = user.roomProgress.find(p => p.roomId === roomId);

    if (!roomProgress) {
      user.roomProgress.push({
        roomId,
        joined: true,
        currentLecture: 0,
        completedLectures: [],
        exerciseAnswers: {},
        quizCompleted: false,
        finalScore: null,
        completed: false
      });
    } else {
      roomProgress.joined = true;
      // Ensure all required fields exist
      if (!roomProgress.completedLectures) roomProgress.completedLectures = [];
      if (!roomProgress.exerciseAnswers) roomProgress.exerciseAnswers = {};
      if (roomProgress.quizCompleted === undefined) roomProgress.quizCompleted = false;
      if (roomProgress.completed === undefined) roomProgress.completed = false;
    }

    await user.save();
    res.json({ message: 'Room joined successfully' });
  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/room-progress/:roomId/exercise - Submit exercise answer
router.post('/:roomId/exercise', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { lectureIndex, answer, points: clientPoints } = req.body;

    console.log('Exercise submission:', { roomId, lectureIndex, answer, clientPoints, userId: req.user.id });

    // Get room from DB (optional for interactive rooms)
    const room = await Room.findOne({ slug: roomId });
    // Note: room may be null for frontend-only rooms — that's OK

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let roomProgress = user.roomProgress.find(p => p.roomId === roomId);
    if (!roomProgress) {
      return res.status(400).json({ message: 'Room not joined' });
    }

    // Initialize arrays if they don't exist
    if (!roomProgress.completedLectures) roomProgress.completedLectures = [];
    if (!roomProgress.exerciseAnswers) roomProgress.exerciseAnswers = {};
    if (!roomProgress.taskScores) roomProgress.taskScores = [];
    if (!roomProgress.totalPointsEarned) roomProgress.totalPointsEarned = 0;

    // TASK SEQUENCE ENFORCEMENT
    if (lectureIndex > 0) {
      const previousTaskCompleted = roomProgress.completedLectures.includes(lectureIndex - 1);
      if (!previousTaskCompleted) {
        return res.status(400).json({ 
          message: 'Please complete the previous task first',
          requiredTask: lectureIndex,
          currentTask: lectureIndex + 1
        });
      }
    }

    // Find exercise by task ID (lectureIndex + 1) — may be null for interactive/local rooms
    const taskId = lectureIndex + 1;
    const exercise = room ? room.exercises.find(ex => ex.id === taskId) : null;

    // Determine if correct
    let isCorrect = false;
    let pointsEarned = 0;

    if (exercise) {
      // DB-backed exercise: validate answer against expected_flag
      const userAnswer = answer.trim();
      const correctAnswer = (exercise.expected_flag || exercise.answer || '').trim();
      isCorrect = exercise.caseSensitive === false
        ? userAnswer.toLowerCase() === correctAnswer.toLowerCase()
        : userAnswer === correctAnswer;
      pointsEarned = exercise.points || 100;
    } else if (answer === 'COMPLETED') {
      // Interactive/local room: frontend validated, trust it
      isCorrect = true;
      pointsEarned = clientPoints || 100;
      console.log(`📡 Interactive task completion (no DB exercise): task ${taskId}, points ${pointsEarned}`);
    } else {
      // Unknown exercise but not a COMPLETED signal — still allow with 0 points
      console.log(`⚠️ Exercise ${taskId} not found in DB for room ${roomId}, skipping validation`);
      isCorrect = false;
      pointsEarned = 0;
    }

    // Find existing task score
    let taskScore = roomProgress.taskScores.find(ts => ts.taskIndex === lectureIndex);
    const alreadyCompleted = roomProgress.completedLectures.includes(lectureIndex);

    if (isCorrect) {
      roomProgress.exerciseAnswers[lectureIndex] = { answer, correct: true };
      if (!alreadyCompleted) {
        roomProgress.completedLectures.push(lectureIndex);
      }

      // Only award points on first-ever completion, not on replay
      if (!alreadyCompleted) {
        if (!taskScore) {
          roomProgress.taskScores.push({ taskIndex: lectureIndex, pointsEarned, maxPoints: pointsEarned, percentage: 100 });
        }
        user.points = (user.points || 0) + pointsEarned;
        roomProgress.totalPointsEarned += pointsEarned;
        await WeeklyStats.recordActivity(user._id, 'room', pointsEarned, false);
        console.log('✅ Task completed (first time) - points awarded:', pointsEarned);
      } else {
        console.log('✅ Task re-completed (replay) - no extra points');
      }
    } else {
      // Clear any existing progress for this task
      delete roomProgress.exerciseAnswers[lectureIndex];
      const completedIndex = roomProgress.completedLectures.indexOf(lectureIndex);
      if (completedIndex > -1) {
        roomProgress.completedLectures.splice(completedIndex, 1);
      }
      if (taskScore) {
        user.points = Math.max(0, (user.points || 0) - taskScore.pointsEarned);
        roomProgress.totalPointsEarned -= taskScore.pointsEarned;
        roomProgress.taskScores = roomProgress.taskScores.filter(ts => ts.taskIndex !== lectureIndex);
      }
      
      // Increment incorrect attempts map
      if (!roomProgress.incorrectAttempts) roomProgress.incorrectAttempts = {};
      roomProgress.incorrectAttempts[lectureIndex] = (roomProgress.incorrectAttempts[lectureIndex] || 0) + 1;
      user.markModified('roomProgress');
      console.log('❌ Incorrect answer - progress cleared, incorrect attempt recorded');
    }

    await user.save();

    // Trigger TASK_SUBMITTED event if correct
    if (isCorrect) {
      try {
        const { badgeEmitter } = require('../services/badgeEventService');
        badgeEmitter.emit('TASK_SUBMITTED', { userId: user._id, roomId, taskId: lectureIndex });
      } catch (badgeError) {
        console.error('Error emitting TASK_SUBMITTED event:', badgeError);
      }
    }

    // Broadcast real-time update to all user sessions
    if (global.io) {
      await RealtimeHelper.broadcastUserUpdate(user._id, global.io);
    }

    res.json({
      message: isCorrect ? 'Exercise submitted successfully' : 'Incorrect answer',
      correct: isCorrect,
      pointsEarned: isCorrect ? pointsEarned : 0,
      userStats: {
        points: user.points,
        level: user.level,
        completedRooms: user.completedRooms,
        completedLabs: user.completedLabs,
        currentStreak: user.currentStreak,
        rank: await user.calculateRank()
      }
    });
  } catch (error) {
    console.error('Submit exercise error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/room-progress/:roomId/task-question - Submit a task question answer
router.post('/:roomId/task-question', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { topicId, questionId, answer } = req.body;

    const room = await Room.findOne({ slug: roomId });
    if (!room) return res.status(404).json({ message: 'Room not found' });

    const topic = room.topics.find(t => t.id === topicId);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    const question = topic.taskQuestions.find(q => q.id === questionId);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    const isCorrect = (answer || '').trim().toLowerCase() === (question.correct_answer || '').trim().toLowerCase();
    const pointsEarned = isCorrect ? (question.points || 10) : 0;

    if (isCorrect) {
      const user = await User.findById(req.user.id);
      const key = `tq_${topicId}_${questionId}`;
      let rp = user.roomProgress.find(p => p.roomId === roomId);
      if (!rp) {
        user.roomProgress.push({ roomId, joined: true, completedLectures: [], exerciseAnswers: {}, totalPointsEarned: 0 });
        rp = user.roomProgress[user.roomProgress.length - 1];
      }
      if (!rp.exerciseAnswers) rp.exerciseAnswers = {};
      // Only award points once ever — not on replays
      const alreadyAwarded = rp.exerciseAnswers[key]?.correct === true;
      if (!alreadyAwarded) {
        rp.exerciseAnswers[key] = { answer, correct: true };
        user.points = (user.points || 0) + pointsEarned;
        rp.totalPointsEarned = (rp.totalPointsEarned || 0) + pointsEarned;
        await WeeklyStats.recordActivity(user._id, 'room', pointsEarned, false);
        await user.save();
        if (global.io) await RealtimeHelper.broadcastUserUpdate(user._id, global.io);
      }
    }

    res.json({
      correct: isCorrect,
      pointsEarned,
      message: isCorrect ? 'Correct!' : 'Incorrect, try again.',
    });
  } catch (error) {
    console.error('Task question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/room-progress/:roomId/quiz/validate - Validate individual quiz question answer
router.post('/:roomId/quiz/validate', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { questionId, answer } = req.body;

    // Get room to check quiz questions
    const room = await Room.findOne({ slug: roomId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Find the quiz and question
    let question = null;
    for (const quiz of room.quizzes || []) {
      question = quiz.questions.find(q => q.id === questionId);
      if (question) break;
    }

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Validate answer based on question type
    let isCorrect = false;
    if (question.type === 'single') {
      isCorrect = answer === question.correct_answer;
    } else if (question.type === 'multi') {
      isCorrect = JSON.stringify(answer.sort()) === JSON.stringify(question.correct_answer.sort());
    } else if (question.type === 'short') {
      isCorrect = answer.toLowerCase().trim() === question.correct_answer.toLowerCase().trim();
    }

    res.json({
      correct: isCorrect,
      explanation: !isCorrect ? (question.explanation || 'Please review the material and try again.') : null,
      correctAnswer: !isCorrect ? question.correct_answer : null,
      points: isCorrect ? question.points : 0
    });
  } catch (error) {
    console.error('Validate quiz question error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/room-progress/:roomId/quiz - Submit final quiz
router.post('/:roomId/quiz', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { score } = req.body;
    const user = await User.findById(req.user.id);

    let roomProgress = user.roomProgress.find(p => p.roomId === roomId);

    if (!roomProgress) {
      return res.status(400).json({ message: 'Room not joined' });
    }

    // Get room to validate task completion (optional for frontend-only rooms)
    const room = await Room.findOne({ slug: roomId });

    // Only enforce task completion for rooms using the old exercise system
    // Admin rooms using taskQuestions don't populate completedLectures
    const usesExercises = room && room.exercises?.some(ex => ex.expected_flag);
    const totalTasks = usesExercises ? (room.topics?.length || 0) : 0;
    const completedTasks = roomProgress.completedLectures?.length || 0;

    if (totalTasks > 0 && completedTasks < totalTasks) {
      return res.status(400).json({
        message: 'Cannot submit quiz - not all tasks are completed',
        completedTasks,
        totalTasks
      });
    }

    roomProgress.finalScore = score;

    // Initialize scoring if not exists
    if (!roomProgress.quizScore) roomProgress.quizScore = { pointsEarned: 0, maxPoints: 0, percentage: 0 };
    if (!roomProgress.totalPointsEarned) roomProgress.totalPointsEarned = 0;

    // Calculate quiz points based on percentage
    const maxQuizPoints = 500;
    const newQuizPoints = Math.round((score / 100) * maxQuizPoints);

    // Check if this is a retake BEFORE setting quizCompleted
    const isRetake = roomProgress.quizCompleted === true;
    const prevBestScore = roomProgress.quizScore?.percentage || 0;
    const isNewBest = score > prevBestScore;

    // Only award points if this is a new best score — never inflate from replays
    if (isNewBest) {
      const prevBestPoints = roomProgress.quizScore?.pointsEarned || 0;
      const extraPoints = newQuizPoints - prevBestPoints; // only the improvement
      user.points = (user.points || 0) + extraPoints;
      roomProgress.totalPointsEarned = (roomProgress.totalPointsEarned || 0) + extraPoints;
      await WeeklyStats.recordActivity(user._id, 'room', extraPoints, false);
      roomProgress.quizScore = { pointsEarned: newQuizPoints, maxPoints: maxQuizPoints, percentage: score };
    }

    const passed = score >= 70;
    // For frontend-only rooms totalTasks is 0 — treat as all tasks done
    const allTasksDone = totalTasks === 0 || completedTasks >= totalTasks;
    const wasNeverCompleted = !roomProgress.completed;

    if (passed && allTasksDone && wasNeverCompleted) {
      roomProgress.completed = true;
      roomProgress.completedAt = new Date();
      roomProgress.quizCompleted = true;

      // Update streak using the proper method
      user.updateStreak('room', roomId);

      // Record first-time room completion for weekly stats
      await WeeklyStats.recordActivity(user._id, 'room', 0, true);

      console.log(`✅ Room marked complete for FIRST TIME (quiz passed with ${score}%), streak: ${user.currentStreak}`);

      // Create notifications for achievements
      const NotificationService = require('../utils/notificationHelper');

      // Check for level up
      const oldLevel = user.level;
      const newLevel = Math.floor(user.points / 1000) + 1;
      if (newLevel > oldLevel) {
        user.level = newLevel;
        await NotificationService.notifyLevelUp(user._id, newLevel);
      }

      // Check for streak milestones
      if (user.currentStreak > 0 && user.currentStreak % 7 === 0) {
        await NotificationService.notifyStreak(user._id, user.currentStreak);
      }

      // The pre-save hook will calculate unique completed rooms
    } else if (passed && isRetake) {
      // Room was already completed, just update the quiz score
      roomProgress.quizCompleted = true;
      roomProgress.finalScore = score;
      console.log(`🔄 Room RETAKE (previous completion kept) - quiz passed with ${score}%, score updated`);
    } else if (!passed) {
      console.log(`❌ Quiz failed with ${score}% - try again`);
      roomProgress.quizCompleted = false;
    } else {
      // passed but tasks not all done (DB-backed room with strict task count)
      console.log(`⚠️ Quiz passed but tasks incomplete (${completedTasks}/${totalTasks}) - not marking complete`);
      roomProgress.quizCompleted = true;
    }

    await user.save();

    // Award badges and broadcast on first-time completion via quiz route
    let newCertificates = [];
    let celebrate = false;
    if (passed && allTasksDone && wasNeverCompleted) {
      const bonusEligible = false; // quiz route doesn't track hints
      await Promise.all([
        awardRoomBadges(user._id, roomId, bonusEligible, global.io),
        checkMilestoneBadges(user._id, global.io)
      ]);

      try {
        const { checkAndIssueTrackCertificate } = require('../services/certificate.service');
        const certResult = await checkAndIssueTrackCertificate(user._id, roomId);
        if (certResult.success) {
          newCertificates = certResult.certificates;
          celebrate = certResult.celebrate;
        }
      } catch (certError) {
        console.error('Error issuing track certificate during quiz:', certError);
      }

      // Emit ROOM_COMPLETED event for Event-Driven Badge System
      try {
        const { badgeEmitter } = require('../services/badgeEventService');
        badgeEmitter.emit('ROOM_COMPLETED', { userId: user._id, roomId });
      } catch (badgeError) {
        console.error('Error emitting ROOM_COMPLETED event during quiz:', badgeError);
      }

      if (global.io) await RealtimeHelper.broadcastUserUpdate(user._id, global.io);
    }

    res.json({
      message: passed ? 'Quiz passed!' : 'Quiz failed - try again',
      passed,
      pointsEarned: isNewBest ? Math.round((score / 100) * 500) - (roomProgress.quizScore?.pointsEarned || 0) : 0,
      isNewBest,
      bestScore: roomProgress.quizScore?.percentage || score,
      totalPoints: user.points,
      newCertificates,
      celebrate,
      userStats: {
        points: user.points,
        level: user.level,
        completedRooms: user.completedRooms,
        completedLabs: user.completedLabs,
        rank: await user.calculateRank()
      }
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/room-progress/:roomId/complete - Mark room as complete
router.post('/:roomId/complete', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { finalScore, totalXP, tasksCompleted, totalTasks: clientTotalTasks, category } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Auto-join if not already joined (handles edge cases)
    if (!user.roomProgress) user.roomProgress = [];
    let roomProgress = user.roomProgress.find(p => p.roomId === roomId);
    if (!roomProgress) {
      user.roomProgress.push({
        roomId,
        joined: true,
        completedLectures: [],
        exerciseAnswers: {},
        quizCompleted: false,
        completed: false,
        totalPointsEarned: 0
      });
      roomProgress = user.roomProgress[user.roomProgress.length - 1];
    }

    // Validate task completion using client-provided counts (new rooms are frontend-only)
    // Fall back to DB room data if available
    let dbTotalTasks = 0;
    let roomCategory = category || 'Misc';
    const room = await Room.findOne({ slug: roomId });
    if (room) {
      dbTotalTasks = room.topics?.length || room.exercises?.length || 0;
      roomCategory = room.category || roomCategory;
    }

    // Use client-provided task counts for new interactive rooms (no DB exercises)
    const effectiveTotalTasks = dbTotalTasks > 0 ? dbTotalTasks : (clientTotalTasks || 0);
    const effectiveCompleted = roomProgress.completedLectures?.length || tasksCompleted || 0;

    if (effectiveTotalTasks > 0 && effectiveCompleted < effectiveTotalTasks) {
      console.log(`⚠️ Room completion blocked - tasks incomplete (${effectiveCompleted}/${effectiveTotalTasks})`);
      return res.status(400).json({
        message: 'Cannot complete room - not all tasks are completed',
        completedTasks: effectiveCompleted,
        totalTasks: effectiveTotalTasks
      });
    }

    // Mark room as complete (first time only)
    if (!roomProgress.completed) {
      roomProgress.completed = true;
      roomProgress.completedAt = new Date();
      roomProgress.finalScore = finalScore || 100;
      roomProgress.quizCompleted = true;

      user.updateStreak('room', roomId);

      // Award skill points based on category
      const totalPoints = totalXP || roomProgress.totalPointsEarned || 500;
      user.updateSkill(roomCategory, totalPoints);

      // Record first-time room completion for weekly stats
      await WeeklyStats.recordActivity(user._id, 'room', totalPoints, true);

      await user.save();

      console.log(`✅ Room ${roomId} marked complete for user ${user._id}, streak: ${user.currentStreak}, XP: ${user.points}`);

      // ── Award badges (1 primary + optional 1 bonus) ──
      const bonusEligible = !!(req.body.noHintsUsed && req.body.perfectScore);
      const [roomBadges, milestoneBadges] = await Promise.all([
        awardRoomBadges(user._id, roomId, bonusEligible, global.io),
        checkMilestoneBadges(user._id, global.io)
      ]);
      const allNewBadges = [...roomBadges, ...milestoneBadges];

      // TRIGGER TRACK CERTIFICATE CHECK!
      let newCertificates = [];
      let celebrate = false;
      try {
        const { checkAndIssueTrackCertificate } = require('../services/certificate.service');
        const certResult = await checkAndIssueTrackCertificate(user._id, roomId);
        if (certResult.success) {
          newCertificates = certResult.certificates;
          celebrate = certResult.celebrate;
        }
      } catch (certError) {
        console.error('Error issuing track certificate during complete:', certError);
      }

      // Emit ROOM_COMPLETED event for Event-Driven Badge System
      try {
        const { badgeEmitter } = require('../services/badgeEventService');
        badgeEmitter.emit('ROOM_COMPLETED', { userId: user._id, roomId });
      } catch (badgeError) {
        console.error('Error emitting ROOM_COMPLETED event during complete:', badgeError);
      }

      // Broadcast real-time update
      if (global.io) {
        await RealtimeHelper.broadcastUserUpdate(user._id, global.io);
      }

      const rank = await user.calculateRank();
      return res.json({
        success: true,
        message: 'Room completed successfully',
        newBadges: allNewBadges.map(b => ({
          name: b.name,
          description: b.description,
          icon: b.icon,
          difficulty: b.difficulty,
          badgeType: b.badgeType,
          unlockReason: b.unlockReason,
          xpReward: b.xpReward
        })),
        newCertificates,
        celebrate,
        userStats: {
          points: user.points,
          totalXP: user.points,
          level: user.level,
          rank,
          completedRooms: user.completedRooms,
          completedLabs: user.completedLabs,
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
          isPremium: user.isPremium,
          pointsToNextLevel: user.getPointsToNextLevel()
        }
      });
    } else {
      // Already completed — update score if higher
      if ((finalScore || 0) > (roomProgress.finalScore || 0)) {
        roomProgress.finalScore = finalScore;
        await user.save();
      }

      const rank = await user.calculateRank();
      return res.json({
        success: true,
        message: 'Room already completed',
        userStats: {
          points: user.points,
          totalXP: user.points,
          level: user.level,
          rank,
          completedRooms: user.completedRooms,
          completedLabs: user.completedLabs,
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
          isPremium: user.isPremium,
          pointsToNextLevel: user.getPointsToNextLevel()
        }
      });
    }
  } catch (error) {
    console.error('Complete room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/room-progress/:roomId/reset - Replay: reset progress only, XP is kept (Option A)
router.post('/:roomId/reset', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let roomProgress = user.roomProgress.find(p => p.roomId === roomId);

    if (!roomProgress) {
      // Nothing to reset — treat as a fresh join
      user.roomProgress.push({
        roomId,
        joined: true,
        completedLectures: [],
        exerciseAnswers: {},
        quizCompleted: false,
        finalScore: null,
        completed: false,
        totalPointsEarned: 0,
        taskScores: [],
        quizScore: { pointsEarned: 0, maxPoints: 0, percentage: 0 }
      });
      await user.save();
      return res.json({ success: true, message: 'Room joined for replay', isReplay: false });
    }

    // ── OPTION A: Keep all earned XP — replay is for practice only ──
    // We do NOT touch user.points, user.level, or leaderboard position.
    // Only the progress state for this specific room is cleared.

    const wasCompleted = roomProgress.completed;

    // Preserve best scores — replay should not reset high scores
    const bestQuizScore    = roomProgress.quizScore || { pointsEarned: 0, maxPoints: 0, percentage: 0 };
    const bestFinalScore   = roomProgress.finalScore || 0;
    // Preserve task question answers so points aren't re-awarded
    const prevAnswers      = roomProgress.exerciseAnswers || {};
    const tqAnswers        = {};
    Object.keys(prevAnswers).forEach(k => {
      if (k.startsWith('tq_')) tqAnswers[k] = prevAnswers[k]; // keep task question answers
    });

    // Reset progress state — keep joined:true, preserve best scores
    roomProgress.completedLectures  = [];
    roomProgress.exerciseAnswers     = tqAnswers;  // keep tq_ answers, clear task progress
    roomProgress.quizCompleted       = false;
    roomProgress.finalScore          = bestFinalScore;  // keep best
    roomProgress.completed           = false;
    roomProgress.completedAt         = null;
    roomProgress.totalXP             = 0;
    roomProgress.totalPointsEarned   = 0;
    roomProgress.taskScores          = [];
    roomProgress.quizScore           = bestQuizScore;  // keep best quiz score
    roomProgress.joined              = true;
    roomProgress.replayCount         = (roomProgress.replayCount || 0) + 1;
    roomProgress.lastReplayAt        = new Date();

    await user.save();

    console.log(`🔄 REPLAY - Room ${roomId} reset for user ${user._id} (replay #${roomProgress.replayCount}). XP preserved: ${user.points}`);

    const rank = await user.calculateRank();
    res.json({
      success: true,
      message: 'Room progress reset for replay. Your XP and badges are preserved.',
      isReplay: wasCompleted,
      replayCount: roomProgress.replayCount,
      // Return current stats so frontend can confirm nothing changed
      userStats: {
        points: user.points,
        totalXP: user.points,
        level: user.level,
        rank,
        completedRooms: user.completedRooms,
        completedLabs: user.completedLabs,
        currentStreak: user.currentStreak,
        isPremium: user.isPremium,
        pointsToNextLevel: user.getPointsToNextLevel()
      }
    });
  } catch (error) {
    console.error('Reset room progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fix user completion counts (utility route)
router.post('/fix-counts', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Recalculate correct counts
    const uniqueCompletedRooms = user.roomProgress ? user.roomProgress.filter(rp => rp.completed && rp.roomId).length : 0;
    const uniqueCompletedLabs = user.labProgress ? user.labProgress.filter(lp => lp.completed && lp.labId).length : 0;

    user.completedRooms = uniqueCompletedRooms;
    user.completedLabs = uniqueCompletedLabs;

    await user.save();

    res.json({
      message: 'Counts fixed successfully',
      completedRooms: user.completedRooms,
      completedLabs: user.completedLabs
    });
  } catch (error) {
    console.error('Fix counts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;