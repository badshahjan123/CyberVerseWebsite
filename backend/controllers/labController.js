const { startLab, stopLab, getLabStatus } = require('../utils/k8sManager');
const Lab = require('../models/Lab');
const User = require('../models/User');
const WeeklyStats = require('../models/WeeklyStats');
const mongoose = require('mongoose');

// Helper: resolve lab by id or slug
async function resolveLab(idOrSlug) {
    return mongoose.Types.ObjectId.isValid(idOrSlug)
        ? Lab.findById(idOrSlug)
        : Lab.findOne({ $or: [{ slug: idOrSlug }, { dockerId: idOrSlug }] });
}

// @desc  Get all labs
// @route GET /api/labs
exports.getAllLabs = async (req, res) => {
    try {
        const query = { isActive: true };
        if (req.query.category) query.category = req.query.category;
        if (req.query.difficulty) query.difficulty = req.query.difficulty;

        const labs = await Lab.find(query)
            .select('-content -tasks')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        const data = labs.map((lab) => ({
            id:          lab._id,
            slug:        lab.slug,
            dockerId:    lab.dockerId,
            title:       lab.title,
            description: lab.description,
            difficulty:  lab.difficulty,
            category:    lab.category,
            points:      lab.points,
            isPremium:   lab.isPremium,
            participants: lab.completedBy?.length || 0,
            duration:    `${lab.estimatedTime} min`,
            estimatedTime: lab.estimatedTime,
            coverImage:  lab.coverImage || 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=1000',
            tags:        lab.tags,
            creator:     lab.createdBy?.name || 'CyberVerse',
        }));

        res.json({ success: true, data });
    } catch {
        res.status(500).json({ success: false, message: 'Failed to fetch labs' });
    }
};

// @desc  Get single lab with full data (tasks, objectives, etc.)
// @route GET /api/labs/:labId
exports.getLabById = async (req, res) => {
    try {
        const lab = await resolveLab(req.params.labId);
        if (!lab || !lab.isActive) {
            return res.status(404).json({ success: false, message: 'Lab not found' });
        }

        res.json({
            success: true,
            data: {
                id:                  lab._id,
                slug:                lab.slug,
                dockerId:            lab.dockerId,
                title:               lab.title,
                description:         lab.description,
                content:             lab.content,
                difficulty:          lab.difficulty,
                category:            lab.category,
                points:              lab.points,
                isPremium:           lab.isPremium,
                estimatedTime:       lab.estimatedTime,
                participants:        lab.completedBy?.length || 0,
                tags:                lab.tags,
                prerequisites:       lab.prerequisites,
                learningObjectives:  lab.learningObjectives,
                tasks:               lab.tasks || [],
                resources:           lab.resources || [],
                coverImage:          lab.coverImage || 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=1000',
            },
        });
    } catch {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc  Start a lab container
// @route POST /api/labs/start/:labId
exports.startLab = async (req, res) => {
    console.log('[DEBUG] startLab controller triggered for labId:', req.params.labId);
    try {
        const result = await startLab(req.params.labId);
        if (result.success === false) {
            return res.status(400).json(result);
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc  Stop a lab container
// @route POST /api/labs/stop/:labId
exports.stopLab = async (req, res) => {
    try {
        const result = await stopLab(req.params.labId);
        if (result.success === false) {
            return res.status(400).json(result);
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc  Get machine status
// @route GET /api/labs/status/:labId
exports.getLabStatus = async (req, res) => {
    try {
        const result = await getLabStatus(req.params.labId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc  Get lab completion status
// @route GET /api/labs/:labId/completion-status
exports.getCompletionStatus = async (req, res) => {
    try {
        const lab = await resolveLab(req.params.labId);
        if (!lab) return res.status(404).json({ success: false, message: 'Lab not found' });

        const completion = lab.completedBy.find(
            (e) => e.userId?.toString() === req.user.id
        );
        res.json({
            success: true,
            completed: !!completion,
            completionData: completion || null,
            labPoints: lab.points,
            labTitle: lab.title,
            labId: lab._id,
        });
    } catch {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc  Mark lab as completed
// @route POST /api/labs/:labId/complete
exports.completeLab = async (req, res) => {
    const { finalScore } = req.body;
    try {
        const lab = await resolveLab(req.params.labId);
        if (!lab) return res.status(404).json({ success: false, message: 'Lab not found' });

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const alreadyCompleted = lab.completedBy.some(
            (e) => e.userId?.toString() === req.user.id
        );
        if (alreadyCompleted) {
            return res.status(400).json({ success: false, message: 'Already completed' });
        }

        user.completedLabs = (user.completedLabs || 0) + 1;
        user.points += lab.points;
        user.lastStreakDate = new Date();
        await user.save();

        lab.completedBy.push({ userId: user._id, completedAt: new Date(), score: finalScore || lab.points });
        await lab.save();

        await WeeklyStats.recordActivity(user._id, 'lab', lab.points, true);

        const io = req.app.get('io');
        if (io) {
            io.emit('leaderboard:update');
            const rank = await user.calculateRank();
            io.to(`user:${user._id}`).emit('user:stats:update', {
                points: user.points,
                level: user.level,
                rank,
            });
        }

        let badgesAwarded = [];
        try {
            const badgeService = require('../services/badge.service');
            badgesAwarded = await badgeService.awardBadgesOnLabCompletion(
                req.user.id,
                lab._id.toString(),
                { score: finalScore || 100, perfectScore: (finalScore || 100) === 100, difficulty: lab.difficulty, category: lab.category }
            );
        } catch { /* badge errors are non-fatal */ }

        res.json({
            success: true,
            message: 'Lab completed',
            data: {
                labId: lab._id,
                pointsEarned: lab.points,
                totalPoints: user.points,
                ...(badgesAwarded.length > 0 && { badgesAwarded }),
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
