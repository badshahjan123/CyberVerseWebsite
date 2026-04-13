const Room = require("../models/Room");
const User = require("../models/User");
const WeeklyStats = require("../models/WeeklyStats");

// @desc    Get all active rooms
// @route   GET /api/rooms
exports.getAllRooms = async (req, res) => {
  try {
    const { category, difficulty, tags, limit, sort } = req.query;
    let filter = { isActive: true };

    if (category && category !== "all") filter.category = category;
    if (difficulty && difficulty !== "all") filter.difficulty = difficulty;
    if (tags) filter.tags = { $in: tags.split(",") };

    console.log("📊 Room filter:", filter);

    let query = Room.find(filter).select(
      "-exercises.expected_flag -quizzes.questions.correct_answer",
    );

    // Handle sorting
    if (sort === "createdAt") {
      query = query.sort({ createdAt: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    // Handle limit
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const rooms = await query.exec();

    console.log(`✅ Found ${rooms.length} rooms`);
    rooms.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.title} (${r.slug}) - Active: ${r.isActive}`);
    });

    res.json({ success: true, data: rooms });
  } catch (error) {
    console.error("❌ getAllRooms Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Get room by slug
// @route   GET /api/rooms/:slug
exports.getRoomBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const room = await Room.findOne({ slug, isActive: true }).select(
      "-exercises.expected_flag -quizzes.questions.correct_answer",
    );

    if (!room)
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });

    const roomData = {
      ...room.toObject(),
      topics: room.topics || [],
      exercises: room.exercises || [],
      quizzes: room.quizzes || [],
      prerequisites: room.prerequisites || [],
      learning_objectives: room.learning_objectives || [],
      tags: room.tags || [],
    };

    res.json({ success: true, data: roomData });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Submit exercise answer
// @route   POST /api/rooms/:slug/exercises/:exerciseId/submit
exports.submitExercise = async (req, res) => {
  try {
    const { answer } = req.body;
    const room = await Room.findOne({ slug: req.params.slug });
    if (!room)
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });

    const exercise = room.exercises.find(
      (ex) => ex.id === parseInt(req.params.exerciseId),
    );
    if (!exercise)
      return res
        .status(404)
        .json({ success: false, message: "Exercise not found" });

    const isCorrect =
      answer.trim().toLowerCase() === exercise.expected_flag.toLowerCase();

    if (isCorrect) {
      const user = await User.findById(req.user.id);
      if (user) {
        user.points = (user.points || 0) + exercise.points;
        user.updateStreak("room", req.params.slug);
        await user.save();

        const rank = await user.calculateRank();
        return res.json({
          success: true,
          correct: true,
          points: exercise.points,
          userStats: {
            ...user.toObject(),
            rank,
            pointsToNextLevel: user.getPointsToNextLevel(),
          },
        });
      }
    }

    res.json({
      success: true,
      correct: false,
      points: 0,
      message: "Incorrect answer",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Submit quiz answers
// @route   POST /api/rooms/:slug/quizzes/:quizId/submit
exports.submitQuiz = async (req, res) => {
  try {
    const { answers, completionTimeMs = 0, hintsUsed = 0 } = req.body;
    const room = await Room.findOne({ slug: req.params.slug });
    if (!room)
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });

    const quiz = room.quizzes.find((q) => q.id === parseInt(req.params.quizId));
    if (!quiz)
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });

    let totalPoints = 0;
    let earnedPoints = 0;
    const results = [];

    quiz.questions.forEach((question) => {
      totalPoints += question.points;
      const userAnswer = answers[question.id];
      let isCorrect = false;

      // Logic for single, multi, short answers...
      // (Reusing existing logic)
      if (question.type === "single")
        isCorrect =
          (typeof userAnswer === "number"
            ? question.options[userAnswer]
            : userAnswer) === question.correct_answer;
      else if (question.type === "short")
        isCorrect =
          userAnswer?.toLowerCase().trim() ===
          question.correct_answer.toLowerCase().trim();

      if (isCorrect) earnedPoints += question.points;
      results.push({
        questionId: question.id,
        correct: isCorrect,
        points: isCorrect ? question.points : 0,
      });
    });

    const percentage = (earnedPoints / totalPoints) * 100;
    const passed = percentage >= quiz.pass_percentage;

    const user = await User.findById(req.user.id);
    if (user) {
      // Update user points and progress logic here...
      // (Delegating to seeder/utils later if too complex)
      user.points = (user.points || 0) + earnedPoints;

      // If passed, mark as room completed and update completedRooms count
      if (passed) {
        // Update room progress
        let roomProgress = user.roomProgress.find(
          (rp) => rp.roomId === room.slug,
        );
        if (!roomProgress) {
          user.roomProgress.push({
            roomId: room.slug,
            joined: true,
            completed: true,
            completedAt: new Date(),
            totalPointsEarned: earnedPoints,
            quizScore: {
              pointsEarned: earnedPoints,
              maxPoints: totalPoints,
              percentage: percentage,
            },
          });
        } else {
          roomProgress.completed = true;
          roomProgress.completedAt = new Date();
          roomProgress.quizScore = {
            pointsEarned: earnedPoints,
            maxPoints: totalPoints,
            percentage: percentage,
          };
        }

        // Increment completed rooms counter
        user.completedRooms = (user.completedRooms || 0) + 1;

        // Update streak
        user.updateStreak("room", room.slug);
      }

      await user.save();

      // Award badges on room completion
      if (passed) {
        const badgeService = require("../services/badge.service");
        const badgeContext = {
          durationMs: completionTimeMs,
          hintsUsed: hintsUsed,
          score: percentage,
          perfectScore: percentage === 100,
          difficulty: room.difficulty,
          category: room.category,
        };

        try {
          const awardedBadges = await badgeService.awardBadgesOnRoomCompletion(
            req.user.id,
            room.slug,
            badgeContext,
          );

          // Attach badges to response if any were awarded
          if (awardedBadges && awardedBadges.length > 0) {
            res.json({
              success: true,
              passed,
              percentage,
              earnedPoints,
              totalPoints,
              results,
              badgesAwarded: awardedBadges,
              message: `Room completed! ${awardedBadges.length} badge(s) earned!`,
            });
            return;
          }
        } catch (badgeError) {
          console.error("Error awarding badges:", badgeError);
          // Continue with response even if badge award fails
        }
      }

      res.json({
        success: true,
        passed,
        percentage,
        earnedPoints,
        totalPoints,
        results,
      });
    }
  } catch (error) {
    console.error("Submit quiz error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
