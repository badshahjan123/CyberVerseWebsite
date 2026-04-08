const express = require('express');
const Room = require('../models/Room');
const User = require('../models/User');
const WeeklyStats = require('../models/WeeklyStats');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Test database connection
router.get('/test/connection', async (req, res) => {
  try {
    const count = await Room.countDocuments();
    const rooms = await Room.find({}).select('slug title').limit(5);
    res.json({
      message: 'Database connected',
      roomCount: count,
      sampleRooms: rooms
    });
  } catch (error) {
    res.status(500).json({
      message: 'Database error',
      error: error.message
    });
  }
});

// Get all rooms (excluding completed ones for authenticated users)
router.get('/', async (req, res) => {
  try {
    const { category, difficulty, tags } = req.query;
    let filter = { isActive: true };

    if (category && category !== 'all') {
      filter.category = category;
    }
    if (difficulty && difficulty !== 'all') {
      filter.difficulty = difficulty;
    }
    if (tags) {
      filter.tags = { $in: tags.split(',') };
    }

    let rooms = await Room.find(filter)
      .select('-exercises.expected_flag -quizzes.questions.correct_answer')
      .sort({ createdAt: -1 });

    // TEMPORARILY DISABLED: Filter out completed rooms for authenticated users
    console.log('🔍 Total rooms before filtering:', rooms.length);
    console.log('🔍 Room titles:', rooms.map(r => r.title));
    // if (req.headers.authorization) {
    //   try {
    //     const jwt = require('jsonwebtoken');
    //     const token = req.headers.authorization.split(' ')[1];
    //     const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //     const User = require('../models/User');
    //     const user = await User.findById(decoded.id);

    //     if (user) {
    //       const completedRoomIds = user.roomProgress
    //         .filter(p => p.completed)
    //         .map(p => p.roomId);

    //       rooms = rooms.filter(room => !completedRoomIds.includes(room.slug));
    //     }
    //   } catch (authError) {
    //     // If token is invalid, just return all rooms
    //     console.log('Auth token invalid, showing all rooms');
    //   }
    // }

    res.json({
      success: true,
      data: rooms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get room by slug
router.get('/:slug', async (req, res) => {
  console.log('🔍 Received request for slug:', req.params.slug);

  try {
    const { slug } = req.params;

    const room = await Room.findOne({ slug: slug, isActive: true })
      .select('-exercises.expected_flag -quizzes.questions.correct_answer');

    console.log('📦 Room found:', !!room);

    if (!room) {
      console.log('❌ Room not found for slug:', req.params.slug);
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Ensure all nested arrays exist
    const roomData = {
      ...room.toObject(),
      topics: room.topics || [],
      exercises: room.exercises || [],
      quizzes: room.quizzes || [],
      prerequisites: room.prerequisites || [],
      learning_objectives: room.learning_objectives || [],
      tags: room.tags || []
    };

    console.log('✅ Sending room data with topics:', roomData.topics?.length || 0);
    res.json({
      success: true,
      data: roomData
    });
  } catch (error) {
    console.error('❌ Database error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Create new room (admin only)
router.post('/', auth, async (req, res) => {
  try {
    const roomData = {
      ...req.body,
      createdBy: req.user.id
    };

    const room = new Room(roomData);
    await room.save();

    res.status(201).json({
      success: true,
      data: room,
      message: 'Room created successfully'
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Room slug already exists'
      });
    }
    res.status(400).json({
      success: false,
      message: 'Validation error',
      error: error.message
    });
  }
});

// Submit exercise answer
router.post('/:slug/exercises/:exerciseId/submit', auth, async (req, res) => {
  try {
    const { answer } = req.body;
    const room = await Room.findOne({ slug: req.params.slug });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    const exercise = room.exercises.find(ex => ex.id === parseInt(req.params.exerciseId));
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }

    // Simple validation (in production, use proper hashing)
    const isCorrect = answer.trim().toLowerCase() === exercise.expected_flag.toLowerCase();

    if (isCorrect) {
      // Update user progress
      const user = await User.findById(req.user.id);
      if (user) {
        user.points = (user.points || 0) + exercise.points;
        
        // Update streak on any point-earning activity
        user.updateStreak('room', req.params.slug);
        
        await user.save();

        // Calculate rank for real-time update
        const rank = await user.calculateRank();
        const userStats = {
          name: user.name,
          points: user.points,
          totalXP: user.points,
          level: user.level,
          rank: rank,
          currentStreak: user.currentStreak,
          streak: user.currentStreak,
          longestStreak: user.longestStreak,
          completedRooms: user.completedRooms,
          completedLabs: user.completedLabs,
          isPremium: user.isPremium,
          pointsToNextLevel: user.getPointsToNextLevel()
        };

        return res.json({
          success: true,
          correct: isCorrect,
          points: exercise.points,
          message: 'Correct answer!',
          userStats
        });
      }
    }

    res.json({
      success: true,
      correct: isCorrect,
      points: 0,
      message: 'Incorrect answer. Try again.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Submit quiz answers
router.post('/:slug/quizzes/:quizId/submit', auth, async (req, res) => {
  try {
    const { answers } = req.body;
    const room = await Room.findOne({ slug: req.params.slug });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    const quiz = room.quizzes.find(q => q.id === parseInt(req.params.quizId));
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    let totalPoints = 0;
    let earnedPoints = 0;
    const results = [];

    quiz.questions.forEach(question => {
      totalPoints += question.points;
      const userAnswer = answers[question.id];
      let isCorrect = false;

      if (question.type === 'single') {
        // Handle both index-based and text-based answers
        if (typeof userAnswer === 'number') {
          // Frontend sends option index
          isCorrect = question.options[userAnswer] === question.correct_answer;
        } else {
          // Direct text comparison
          isCorrect = userAnswer === question.correct_answer;
        }
      } else if (question.type === 'multi') {
        if (Array.isArray(userAnswer)) {
          // Convert indices to actual option text if needed
          const userAnswerTexts = userAnswer.map(ans =>
            typeof ans === 'number' ? question.options[ans] : ans
          );
          const correctAnswers = Array.isArray(question.correct_answer)
            ? question.correct_answer
            : [question.correct_answer];

          isCorrect = userAnswerTexts.length === correctAnswers.length &&
            userAnswerTexts.every(ans => correctAnswers.includes(ans));
        }
      } else if (question.type === 'short') {
        isCorrect = userAnswer?.toLowerCase().trim() === question.correct_answer.toLowerCase().trim();
      }

      if (isCorrect) {
        earnedPoints += question.points;
      }

      results.push({
        questionId: question.id,
        correct: isCorrect,
        points: isCorrect ? question.points : 0,
        explanation: question.explanation
      });
    });

    const percentage = (earnedPoints / totalPoints) * 100;
    const passed = percentage >= quiz.pass_percentage;

    // Update user progress with quiz completion
    const user = await User.findById(req.user.id);
    if (user) {
      // Find or create room progress
      let roomProgress = user.roomProgress.find(p => p.roomId === req.params.slug);
      if (!roomProgress) {
        user.roomProgress.push({
          roomId: req.params.slug,
          joined: true,
          completedLectures: [],
          exerciseAnswers: {},
          quizCompleted: false,
          completed: false,
          quizScore: { pointsEarned: 0, maxPoints: 0, percentage: 0 }
        });
        roomProgress = user.roomProgress[user.roomProgress.length - 1];
      }

      // Initialize quizScore if not exists
      if (!roomProgress.quizScore) {
        roomProgress.quizScore = { pointsEarned: 0, maxPoints: 0, percentage: 0 };
      }

      // FIX: Check if this is a retake and calculate/remove previous points
      const isRetake = roomProgress.quizCompleted === true;
      let previousQuizPoints = 0;

      if (isRetake) {
        // Try to get previous points from quiz Score first
        if (roomProgress.quizScore && roomProgress.quizScore.pointsEarned > 0) {
          previousQuizPoints = roomProgress.quizScore.pointsEarned;
        }
        // Fallback: Calculate from finalScore if quizScore doesn't exist (old completions)
        else if (roomProgress.finalScore) {
          const maxQuizPoints = 500;
          previousQuizPoints = Math.round((roomProgress.finalScore / 100) * maxQuizPoints);
          console.log(`📊 OLD COMPLETION - Calculating previous quiz points from finalScore: ${roomProgress.finalScore}% = ${previousQuizPoints} points`);
        }

        // Deduct previous quiz points
        if (previousQuizPoints > 0) {
          user.points = Math.max(0, (user.points || 0) - previousQuizPoints);
          console.log(`🔄 Quiz RETAKE - removed previous ${previousQuizPoints} points (user total now: ${user.points})`);
        } else {
          console.log(`⚠️ RETAKE detected but no previous points found to deduct`);
        }
      }

      // Award NEW quiz points
      const pointsBeforeQuiz = user.points;
      user.points = (user.points || 0) + earnedPoints;
      console.log(`➕ Adding ${earnedPoints} NEW quiz points: ${pointsBeforeQuiz} → ${user.points}`);

      // Initialize totalPointsEarned if not exists
      if (!roomProgress.totalPointsEarned) {
        roomProgress.totalPointsEarned = 0;
      }

      // FIX: Update totalPointsEarned to include quiz points
      // If retake, first subtract previous quiz points from total
      if (isRetake && previousQuizPoints > 0) {
        roomProgress.totalPointsEarned -= previousQuizPoints;
      }
      // Then add new quiz points
      roomProgress.totalPointsEarned += earnedPoints;
      console.log(`📊 Updated totalPointsEarned: ${roomProgress.totalPointsEarned} (includes ${earnedPoints} quiz pts)`);

      // Update quiz score tracking
      roomProgress.quizScore = {
        pointsEarned: earnedPoints,
        maxPoints: totalPoints,
        percentage: Math.round(percentage)
      };

      // FIX: Set quizCompleted flag
      roomProgress.quizCompleted = true;
      roomProgress.finalScore = percentage;

      // FIX: Only mark room complete if quiz passed AND all tasks done
      const totalTasks = room.topics?.length || room.lectures?.length || 0;
      const completedTasks = roomProgress.completedLectures?.length || 0;
      const wasNeverCompleted = !roomProgress.completed;

      if (passed && completedTasks === totalTasks && totalTasks > 0 && wasNeverCompleted) {
        roomProgress.completed = true;
        roomProgress.completedAt = new Date();

        // Update streak only on first completion
        user.updateStreak('room', req.params.slug);

        console.log(`✅ Room ${req.params.slug} marked complete for FIRST TIME (quiz: ${percentage}%)`);
      } else if (passed && isRetake) {
        console.log(`🔄 Room RETAKE (quiz: ${percentage}%) - removed ${previousQuizPoints}pts, added ${earnedPoints}pts`);
      } else if (!passed) {
        console.log(`❌ Quiz failed (${percentage}%) - room not complete`);
        roomProgress.quizCompleted = false;
        roomProgress.completed = false;
      } else {
        console.log(`⚠️ Quiz passed but not all tasks complete (${completedTasks}/${totalTasks})`);
      }


      await user.save();

      // RECORD WEEKLY ACTIVITY
      await WeeklyStats.recordActivity(user._id, 'room', earnedPoints, passed && wasNeverCompleted);

      // PREPARE UPDATED USER STATS FOR FRONTEND
      const rank = await user.calculateRank();
      const userStats = {
        name: user.name,
        points: user.points,
        totalXP: user.points,
        level: user.level,
        rank: rank,
        currentStreak: user.currentStreak,
        streak: user.currentStreak,
        longestStreak: user.longestStreak,
        completedRooms: user.completedRooms,
        completedLabs: user.completedLabs,
        isPremium: user.isPremium,
        pointsToNextLevel: user.getPointsToNextLevel()
      };

      // RETURN WITH USER STATS
      return res.json({
        success: true,
        passed,
        percentage: Math.round(percentage),
        earnedPoints,
        totalPoints,
        results,
        userStats
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Complete room
router.post('/:slug/complete', auth, async (req, res) => {
  try {
    const { timeSpent, finalScore } = req.body;
    const room = await Room.findOne({ slug: req.params.slug });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if user already completed this room
    const existingCompletionIndex = room.completedBy.findIndex(
      completion => completion.userId.toString() === req.user.id
    );

    let isReplay = false;

    if (existingCompletionIndex !== -1) {
      // Update existing completion (replay)
      isReplay = true;
      room.completedBy[existingCompletionIndex] = {
        userId: req.user.id,
        score: finalScore || 0,
        timeSpent: timeSpent || 0,
        completedAt: new Date()
      };
    } else {
      // Add new completion record
      room.completedBy.push({
        userId: req.user.id,
        score: finalScore || 0,
        timeSpent: timeSpent || 0,
        completedAt: new Date()
      });
    }

    await room.save();

    // GET UPDATED USER STATS
    const user = await User.findById(req.user.id);
    const rank = await user.calculateRank();
    const userStats = {
      name: user.name,
      points: user.points,
      totalXP: user.points,
      level: user.level,
      rank: rank,
      currentStreak: user.currentStreak,
      streak: user.currentStreak,
      longestStreak: user.longestStreak,
      completedRooms: user.completedRooms,
      completedLabs: user.completedLabs,
      isPremium: user.isPremium,
      pointsToNextLevel: user.getPointsToNextLevel()
    };

    res.json({
      success: true,
      message: isReplay ? 'Room replayed successfully!' : 'Room completed successfully!',
      userStats,
      data: {
        completedAt: new Date(),
        score: finalScore || 0,
        timeSpent: timeSpent || 0,
        isReplay
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;