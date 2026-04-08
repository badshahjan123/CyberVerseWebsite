const express = require('express');
const User = require('../models/User');
const Room = require('../models/Room');
const RealtimeHelper = require('../utils/realtimeHelper');
const { awardRoomBadges, checkMilestoneBadges } = require('../utils/badgeHelper');
const { auth } = require('../middleware/auth');
const router = express.Router();

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

    if (isCorrect) {
      roomProgress.exerciseAnswers[lectureIndex] = { answer, correct: true };
      if (!roomProgress.completedLectures.includes(lectureIndex)) {
        roomProgress.completedLectures.push(lectureIndex);
      }

      // Update or create task score
      if (taskScore) {
        // Deduct previous points if this is a retry
        user.points = Math.max(0, (user.points || 0) - taskScore.pointsEarned);
        roomProgress.totalPointsEarned -= taskScore.pointsEarned;
        taskScore.pointsEarned = pointsEarned;
        taskScore.percentage = 100;
      } else {
        roomProgress.taskScores.push({
          taskIndex: lectureIndex,
          pointsEarned,
          maxPoints: pointsEarned,
          percentage: 100
        });
      }

      user.points = (user.points || 0) + pointsEarned;
      roomProgress.totalPointsEarned += pointsEarned;

      console.log('✅ Task completed - points awarded:', pointsEarned, '| Total XP:', user.points);
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
      console.log('❌ Incorrect answer - progress cleared');
    }

    await user.save();

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

    // FIX: VALIDATION - Only enforce task completion if room exists in DB with topics
    const totalTasks = room ? (room.topics?.length || room.lectures?.length || 0) : 0;
    const completedTasks = roomProgress.completedLectures?.length || 0;

    if (totalTasks > 0 && completedTasks < totalTasks) {
      console.log(`⚠️ Quiz submission blocked - not all tasks complete (${completedTasks}/${totalTasks})`);
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

    // Remove previous quiz points if this is a retry
    if (isRetake && roomProgress.quizScore && roomProgress.quizScore.pointsEarned > 0) {
      user.points = Math.max(0, (user.points || 0) - roomProgress.quizScore.pointsEarned);
      roomProgress.totalPointsEarned -= roomProgress.quizScore.pointsEarned;
      console.log(`🔄 Retake detected - removed previous quiz points: ${roomProgress.quizScore.pointsEarned}`);
    }

    // Add new quiz points
    user.points = (user.points || 0) + newQuizPoints;
    roomProgress.totalPointsEarned += newQuizPoints;

    // Update quiz score tracking
    roomProgress.quizScore = {
      pointsEarned: newQuizPoints,
      maxPoints: maxQuizPoints,
      percentage: score
    };

    const passed = score >= 70;
    // For frontend-only rooms totalTasks is 0 — treat as all tasks done
    const allTasksDone = totalTasks === 0 || completedTasks >= totalTasks;
    const wasNeverCompleted = !roomProgress.completed;

    if (passed && allTasksDone && wasNeverCompleted) {
      roomProgress.completed = true;
      roomProgress.completedAt = new Date();
      roomProgress.quizCompleted = true;

      // Update streak using the proper method (handles duplicate checks and consecutive day validation)
      user.updateStreak('room', roomId);

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
    if (passed && allTasksDone && wasNeverCompleted) {
      const bonusEligible = false; // quiz route doesn't track hints
      await Promise.all([
        awardRoomBadges(user._id, roomId, bonusEligible, global.io),
        checkMilestoneBadges(user._id, global.io)
      ]);
      if (global.io) await RealtimeHelper.broadcastUserUpdate(user._id, global.io);
    }

    res.json({
      message: passed ? 'Quiz passed!' : 'Quiz failed - try again',
      passed,
      pointsEarned: newQuizPoints,
      totalPoints: user.points,
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

    // Mark room as complete (first time)
    if (!roomProgress.completed) {
      roomProgress.completed = true;
      roomProgress.completedAt = new Date();
      roomProgress.finalScore = finalScore || 100;
      roomProgress.quizCompleted = true;

      user.updateStreak('room', roomId);

      // Award skill points based on category
      const totalPoints = totalXP || roomProgress.totalPointsEarned || 500;
      user.updateSkill(roomCategory, totalPoints);

      await user.save();

      console.log(`✅ Room ${roomId} marked complete for user ${user._id}, streak: ${user.currentStreak}, XP: ${user.points}`);

      // ── Award badges (1 primary + optional 1 bonus) ──
      const bonusEligible = !!(req.body.noHintsUsed && req.body.perfectScore);
      const [roomBadges, milestoneBadges] = await Promise.all([
        awardRoomBadges(user._id, roomId, bonusEligible, global.io),
        checkMilestoneBadges(user._id, global.io)
      ]);
      const allNewBadges = [...roomBadges, ...milestoneBadges];

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

    // Reset progress state — keep joined:true so the room stays in their list
    roomProgress.completedLectures  = [];
    roomProgress.exerciseAnswers     = {};
    roomProgress.quizCompleted       = false;
    roomProgress.finalScore          = null;
    roomProgress.completed           = false;
    roomProgress.completedAt         = null;
    roomProgress.totalXP             = 0;
    roomProgress.totalPointsEarned   = 0;
    roomProgress.taskScores          = [];
    roomProgress.quizScore           = { pointsEarned: 0, maxPoints: 0, percentage: 0 };
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