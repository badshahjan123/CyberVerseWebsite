const express = require('express');
const User = require('../models/User');
const Room = require('../models/Room');
const { auth } = require('../middleware/auth');
const router = express.Router();

// GET /api/room-progress/:roomId - Get user's progress for a specific room
router.get('/:roomId', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const user = await User.findById(req.user.id);

    const roomProgress = user.roomProgress.find(p => p.roomId === roomId) || {
      roomId,
      joined: false,
      currentLecture: 0,
      completedLectures: [],
      exerciseAnswers: {},
      quizCompleted: false,
      finalScore: null
    };

    res.json({ progress: roomProgress });
  } catch (error) {
    console.error('Get room progress error:', error);
    res.status(500).json({ message: 'Server error' });
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
    const { lectureIndex, answer } = req.body;

    console.log('Exercise submission:', { roomId, lectureIndex, answer, userId: req.user.id });

    // Get room to validate answer
    const room = await Room.findOne({ slug: roomId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Find exercise by task ID (lectureIndex + 1)
    const taskId = lectureIndex + 1;
    const exercise = room.exercises.find(ex => ex.id === taskId);
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    // Validate answer
    const userAnswer = answer.trim();
    const correctAnswer = (exercise.expected_flag || exercise.answer || '').trim();
    const isCorrect = exercise.caseSensitive === false
      ? userAnswer.toLowerCase() === correctAnswer.toLowerCase()
      : userAnswer === correctAnswer;

    console.log('Answer validation:', { userAnswer, correctAnswer, isCorrect, taskId });

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let roomProgress = user.roomProgress.find(p => p.roomId === roomId);

    if (!roomProgress) {
      return res.status(400).json({ message: 'Room not joined' });
    }

    // Initialize arrays if they don't exist
    if (!roomProgress.completedLectures) {
      roomProgress.completedLectures = [];
    }
    if (!roomProgress.exerciseAnswers) {
      roomProgress.exerciseAnswers = {};
    }

    // Initialize scoring arrays if they don't exist
    if (!roomProgress.taskScores) roomProgress.taskScores = [];
    if (!roomProgress.totalPointsEarned) roomProgress.totalPointsEarned = 0;

    // Find existing task score
    let taskScore = roomProgress.taskScores.find(ts => ts.taskIndex === lectureIndex);
    
    if (isCorrect) {
      roomProgress.exerciseAnswers[lectureIndex] = { answer, correct: true };
      if (!roomProgress.completedLectures.includes(lectureIndex)) {
        roomProgress.completedLectures.push(lectureIndex);
      }

      const maxPoints = exercise.points || 100;
      const pointsEarned = maxPoints; // 100% for correct answer
      
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
          maxPoints,
          percentage: 100
        });
      }
      
      // Add new points
      user.points = (user.points || 0) + pointsEarned;
      roomProgress.totalPointsEarned += pointsEarned;

      console.log('Correct answer - progress saved, points awarded:', pointsEarned);
    } else {
      // Clear any existing progress for this task
      delete roomProgress.exerciseAnswers[lectureIndex];
      const completedIndex = roomProgress.completedLectures.indexOf(lectureIndex);
      if (completedIndex > -1) {
        roomProgress.completedLectures.splice(completedIndex, 1);
      }
      
      // Remove points if task was previously completed
      if (taskScore) {
        user.points = Math.max(0, (user.points || 0) - taskScore.pointsEarned);
        roomProgress.totalPointsEarned -= taskScore.pointsEarned;
        roomProgress.taskScores = roomProgress.taskScores.filter(ts => ts.taskIndex !== lectureIndex);
      }
      
      console.log('Incorrect answer - progress cleared');
    }

    await user.save();

    // Trigger real-time update
    res.json({
      message: isCorrect ? 'Exercise submitted successfully' : 'Incorrect answer',
      correct: isCorrect,
      pointsEarned: isCorrect ? exercise.points : 0,
      userStats: {
        points: user.points,
        level: user.level,
        completedRooms: user.completedRooms,
        completedLabs: user.completedLabs
      }
    });
  } catch (error) {
    console.error('Submit exercise error:', error);
    console.error('Error stack:', error.stack);
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

    // Get room to validate task completion
    const room = await Room.findOne({ slug: roomId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // FIX: VALIDATION - Ensure all tasks are completed before allowing quiz completion
    const totalTasks = room.topics?.length || room.lectures?.length || 0;
    const completedTasks = roomProgress.completedLectures?.length || 0;

    if (completedTasks < totalTasks) {
      console.log(`⚠️ Quiz submission blocked - not all tasks complete (${completedTasks}/${totalTasks})`);
      return res.status(400).json({
        message: 'Cannot submit quiz - not all tasks are completed',
        completedTasks,
        totalTasks
      });
    }

    roomProgress.quizCompleted = true;
    roomProgress.finalScore = score;

    // Initialize scoring if not exists
    if (!roomProgress.quizScore) roomProgress.quizScore = { pointsEarned: 0, maxPoints: 0, percentage: 0 };
    if (!roomProgress.totalPointsEarned) roomProgress.totalPointsEarned = 0;

    // Calculate quiz points based on percentage
    const maxQuizPoints = 500; // Fixed max points for quiz
    const newQuizPoints = Math.round((score / 100) * maxQuizPoints);
    
    // Remove previous quiz points if this is a retry
    if (roomProgress.quizScore.pointsEarned > 0) {
      user.points = Math.max(0, (user.points || 0) - roomProgress.quizScore.pointsEarned);
      roomProgress.totalPointsEarned -= roomProgress.quizScore.pointsEarned;
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

    // FIX: ONLY mark as complete if ALL conditions met:
    // 1. All tasks are done
    // 2. Quiz is passed (score >= 70)
    const passed = score >= 70;
    if (passed && completedTasks === totalTasks) {
      roomProgress.completed = true;
      roomProgress.completedAt = new Date();
      
      // Force update streak for room completion
      user.currentStreak = (user.currentStreak || 0) + 1;
      user.lastStreakDate = new Date();
      if (user.currentStreak > (user.longestStreak || 0)) {
        user.longestStreak = user.currentStreak;
      }
      
      console.log(`✅ Room marked complete (quiz passed with ${score}%), streak: ${user.currentStreak}`);
      
      // Create notifications for achievements
      const NotificationService = require('../utils/notificationService');
      
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
    } else if (!passed) {
      console.log(`❌ Room NOT complete (quiz failed with ${score}%)`);
      // Don't mark as complete if quiz failed
    }

    await user.save();
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
    const { finalScore, totalXP } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let roomProgress = user.roomProgress.find(p => p.roomId === roomId);

    if (!roomProgress) {
      return res.status(400).json({ message: 'Room not joined' });
    }

    // FIX: VALIDATION - Verify all tasks are done and quiz is passed
    const room = await Room.findOne({ slug: roomId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const totalTasks = room.topics?.length || room.lectures?.length || 0;
    const completedTasks = roomProgress.completedLectures?.length || 0;

    if (completedTasks < totalTasks) {
      console.log(`⚠️ Room completion blocked - tasks incomplete (${completedTasks}/${totalTasks})`);
      return res.status(400).json({
        message: 'Cannot complete room - not all tasks are completed',
        completedTasks,
        totalTasks
      });
    }

    if (!roomProgress.quizCompleted) {
      console.log(`⚠️ Room completion blocked - quiz not completed`);
      return res.status(400).json({
        message: 'Cannot complete room - quiz not completed'
      });
    }

    // Mark room as complete
    if (!roomProgress.completed) {
      roomProgress.completed = true;
      roomProgress.completedAt = new Date();
      roomProgress.finalScore = finalScore;
      
      // Force update streak for room completion
      user.currentStreak = (user.currentStreak || 0) + 1;
      user.lastStreakDate = new Date();
      if (user.currentStreak > (user.longestStreak || 0)) {
        user.longestStreak = user.currentStreak;
      }
      
      // Save user to update streak and completion counts
      await user.save();

      console.log(`✅ Room ${roomId} marked complete for user ${user._id}, streak: ${user.currentStreak}`);

      res.json({
        message: 'Room completed successfully',
        userStats: {
          points: user.points,
          level: user.level,
          completedRooms: user.completedRooms,
          completedLabs: user.completedLabs,
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak
        }
      });
    } else {
      // Already completed, just update the score if it's higher
      if (finalScore > (roomProgress.finalScore || 0)) {
        roomProgress.finalScore = finalScore;
        await user.save();
      }

      res.json({
        message: 'Room already completed',
        userStats: {
          points: user.points,
          level: user.level,
          completedRooms: user.completedRooms,
          completedLabs: user.completedLabs
        }
      });
    }
  } catch (error) {
    console.error('Complete room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/room-progress/:roomId/reset - Reset room progress for Try Again
router.post('/:roomId/reset', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let roomProgress = user.roomProgress.find(p => p.roomId === roomId);

    if (!roomProgress) {
      return res.status(400).json({ message: 'Room not found in progress' });
    }

    // Deduct all points earned from this room
    if (roomProgress.totalPointsEarned) {
      user.points = Math.max(0, (user.points || 0) - roomProgress.totalPointsEarned);
    }

    // Reset all progress but keep joined status
    roomProgress.completedLectures = [];
    roomProgress.exerciseAnswers = {};
    roomProgress.quizCompleted = false;
    roomProgress.finalScore = null;
    roomProgress.completed = false;
    roomProgress.completedAt = null;
    roomProgress.totalXP = 0;
    roomProgress.totalPointsEarned = 0;
    roomProgress.taskScores = [];
    roomProgress.quizScore = { pointsEarned: 0, maxPoints: 0, percentage: 0 };

    await user.save();

    res.json({
      message: 'Room progress reset successfully',
      userStats: {
        points: user.points,
        level: user.level,
        completedRooms: user.completedRooms,
        completedLabs: user.completedLabs
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