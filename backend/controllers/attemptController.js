const Attempt = require('../models/Attempt');
const Lab = require('../models/Lab');
const User = require('../models/User');
const Room = require('../models/Room');
const WeeklyStats = require('../models/WeeklyStats');

// @desc    Start/Initialize a new attempt
// @route   POST /api/attempts/start
exports.startAttempt = async (req, res) => {
  const { itemId, itemType, maxScore } = req.body;
  try {
    const attempt = await Attempt.create({
      user: req.user.id,
      itemId,
      itemType,
      maxScore,
      startedAt: new Date()
    });
    res.status(201).json({ success: true, attemptId: attempt._id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Complete an attempt and update scoring logic
// @route   POST /api/attempts/:id/complete
exports.completeAttempt = async (req, res) => {
  const { score, completionTime, taskStates } = req.body;
  const attemptId = req.params.id;

  try {
    const attempt = await Attempt.findById(attemptId);
    if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found' });
    if (attempt.completed) return res.status(400).json({ success: false, message: 'Attempt already finalized' });

    // 1. Finalize current attempt
    attempt.score = score;
    attempt.completionTime = completionTime;
    attempt.taskStates = taskStates;
    attempt.completed = true;
    attempt.completedAt = new Date();
    await attempt.save();

    const user = await User.findById(req.user.id);
    const itemType = attempt.itemType;
    const itemId = attempt.itemId;

    // 2. Determine if this is a NEW BEST score
    const allAttempts = await Attempt.find({ user: user._id, itemId, completed: true });
    const bestAttempt = allAttempts.reduce((prev, curr) => (prev.score > curr.score) ? prev : curr, attempt);
    
    const isNewBest = bestAttempt._id.toString() === attempt._id.toString();
    const isFirstCompletion = allAttempts.length === 1;

    let pointsToAdd = 0;

    if (isFirstCompletion) {
        // First time completing: add full score
        pointsToAdd = attempt.score;
        if (itemType === 'lab') user.completedLabs = (user.completedLabs || 0) + 1;
        else user.completedRooms = (user.completedRooms || 0) + 1;
    } else if (isNewBest) {
        // Not first time, but better score: add the difference
        // We find the second best to see how much we improved by
        const sorted = allAttempts.sort((a, b) => b.score - a.score);
        const secondBestScore = sorted[1] ? sorted[1].score : 0;
        pointsToAdd = attempt.score - secondBestScore;
    }

    if (pointsToAdd > 0) {
        user.points += pointsToAdd;
        await WeeklyStats.recordActivity(user._id, itemType, pointsToAdd, isFirstCompletion);
    }

    // Update persistent lab completion for the UI
    if (itemType === 'lab') {
        const labIdStr = itemId.toString();
        const completedTaskIds = attempt.taskStates
            ? attempt.taskStates.filter(ts => ts.completed).map(ts => ts.taskId)
            : [];
            
        let progress = user.labProgress.find(lp => lp.labId === labIdStr);
        if (!progress) {
            user.labProgress.push({
                labId: labIdStr,
                completed: true,
                completedAt: new Date(),
                score: attempt.score,
                completedTasks: completedTaskIds
            });
        } else {
            progress.completed = true;
            progress.completedTasks = Array.from(new Set([...(progress.completedTasks || []), ...completedTaskIds]));
            if (attempt.score > (progress.score || 0)) {
                progress.score = attempt.score;
                progress.completedAt = new Date();
            }
        }
    }

    user.lastStreakDate = new Date();
    await user.save();

    // 3. Emit updates for UI
    const io = req.app.get('io');
    if (io) {
      io.emit('leaderboard:update');
      const rank = await user.calculateRank();
      io.to(`user:${user._id}`).emit('user:stats:update', {
        points: user.points,
        level: user.level,
        rank
      });
    }

    res.json({
      success: true,
      data: {
        score: attempt.score,
        isNewBest,
        bestScore: bestAttempt.score,
        pointsEarned: pointsToAdd,
        totalPoints: user.points,
        attemptsCount: allAttempts.length
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get user stats for a specific item
// @route   GET /api/attempts/stats/:itemType/:itemId
exports.getItemStats = async (req, res) => {
  try {
    const attempts = await Attempt.find({ 
      user: req.user.id, 
      itemId: req.params.itemId, 
      itemType: req.params.itemType,
      completed: true 
    }).sort({ score: -1 });

    const bestScore = attempts.length > 0 ? attempts[0].score : 0;
    const bestTime = attempts.length > 0 ? Math.min(...attempts.map(a => a.completionTime || 999999)) : 0;

    res.json({
      success: true,
      bestScore,
      bestTime,
      attemptsCount: attempts.length,
      history: attempts.slice(0, 5) // Recent 5 best
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Internal Global Scoring Utility (Shared between Labs and Rooms)
exports.processFinishedSession = async (user, itemType, itemId, finalScore, completionTime, taskStates = []) => {
    const attempt = await Attempt.create({
      user: user._id,
      itemType,
      itemId,
      score: finalScore,
      maxScore: finalScore, 
      completed: true,
      completionTime,
      taskStates,
      completedAt: new Date()
    });

    const allAttempts = await Attempt.find({ user: user._id, itemId, completed: true });
    const bestAttempt = allAttempts.reduce((prev, curr) => (prev.score > curr.score) ? prev : curr, attempt);
    
    const isNewBest = bestAttempt._id.toString() === attempt._id.toString();
    const isFirstCompletion = allAttempts.length === 1;

    let pointsToAdd = 0;

    if (isFirstCompletion) {
        pointsToAdd = attempt.score;
        if (itemType === 'lab') user.completedLabs = (user.completedLabs || 0) + 1;
        else user.completedRooms = (user.completedRooms || 0) + 1;
    } else if (isNewBest) {
        const sorted = allAttempts.sort((a, b) => b.score - a.score);
        const secondBestScore = sorted[1] ? sorted[1].score : 0;
        pointsToAdd = attempt.score - secondBestScore;
    }

    if (pointsToAdd > 0) {
        user.points += pointsToAdd;
        await WeeklyStats.recordActivity(user._id, itemType, pointsToAdd, isFirstCompletion);
    }

    user.lastStreakDate = new Date();
    await user.save();

    return {
        attempt,
        isNewBest,
        bestScore: bestAttempt.score,
        pointsEarned: pointsToAdd,
        totalPoints: user.points,
        attemptsCount: allAttempts.length
    };
};
