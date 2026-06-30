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

    // Find associated badge using the registry evaluator logic
    const badgeRegistry = require("../utils/badgeRegistry");
    const badgeReward = badgeRegistry.find(b => {
      try {
        return b.evaluator({}, { type: "room_completion", roomId: slug });
      } catch (e) {
        return false;
      }
    });

    const roomData = {
      ...room.toObject(),
      topics: room.topics || [],
      exercises: room.exercises || [],
      quizzes: room.quizzes || [],
      prerequisites: room.prerequisites || [],
      learning_objectives: room.learning_objectives || [],
      tags: room.tags || [],
      badgeReward: badgeReward || null,
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
        // Only award points if not already awarded for this exercise
        const rp = user.roomProgress.find(p => p.roomId === req.params.slug);
        const alreadyAwarded = rp?.exerciseAnswers?.[req.params.exerciseId]?.correct === true;
        if (!alreadyAwarded) {
          if (rp) {
            if (!rp.exerciseAnswers) rp.exerciseAnswers = {};
            rp.exerciseAnswers[req.params.exerciseId] = { correct: true };
          }
          user.points = (user.points || 0) + exercise.points;
          user.updateStreak("room", req.params.slug);
          await user.save();
        }
        const rank = await user.calculateRank();
        return res.json({
          success: true, correct: true, points: alreadyAwarded ? 0 : exercise.points,
          userStats: { ...user.toObject(), rank, pointsToNextLevel: user.getPointsToNextLevel() },
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

    const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const passed = percentage >= (quiz.pass_percentage || 70);
    const PASS_BONUS = 50; // bonus XP for passing

    const user = await User.findById(req.user.id);
    if (user) {
      let roomProgress = user.roomProgress.find((rp) => rp.roomId === room.slug);

      // Best-score logic: only award points that IMPROVE on previous best
      const prevBestPoints = roomProgress?.quizScore?.pointsEarned || 0;
      const extraPoints = Math.max(0, earnedPoints - prevBestPoints);

      // Pass bonus only on first-ever pass
      const firstTimePass = passed && !(roomProgress?.quizCompleted);
      const totalEarned = extraPoints + (firstTimePass ? PASS_BONUS : 0);

      user.points = (user.points || 0) + totalEarned;

      if (passed) {
        if (!roomProgress) {
          user.roomProgress.push({
            roomId: room.slug,
            joined: true,
            completed: true,
            completedAt: new Date(),
            quizCompleted: true,
            totalPointsEarned: earnedPoints,
            quizScore: { pointsEarned: earnedPoints, maxPoints: totalPoints, percentage },
          });
          user.updateStreak("room", room.slug);
        } else {
          if (!roomProgress.completed) {
            roomProgress.completed = true;
            roomProgress.completedAt = new Date();
            user.updateStreak("room", room.slug);
          }
          roomProgress.quizCompleted = true;
          if (earnedPoints > prevBestPoints) {
            roomProgress.quizScore = { pointsEarned: earnedPoints, maxPoints: totalPoints, percentage };
            roomProgress.totalPointsEarned = (roomProgress.totalPointsEarned || 0) + extraPoints;
          }
        }
      }

      await user.save();
      await WeeklyStats.recordActivity(user._id, 'room', totalEarned, firstTimePass);

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
        percentage: Math.round(percentage),
        earnedPoints: totalEarned,
        quizPoints: earnedPoints,
        passBonus: firstTimePass ? PASS_BONUS : 0,
        totalPoints,
        results,
      });
    }
  } catch (error) {
    console.error("Submit quiz error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
