const { exec } = require('child_process');
const path = require('path');
const Lab = require('../models/Lab');
const User = require('../models/User');
const WeeklyStats = require('../models/WeeklyStats');
const mongoose = require('mongoose');
const { getLabXP } = require('../utils/xpConfig');

// Helper: resolve lab by id or slug
async function resolveLab(idOrSlug) {
    if (!idOrSlug) return null;
    
    // 1. Try direct ID or Slug match
    let lab = mongoose.Types.ObjectId.isValid(idOrSlug)
        ? await Lab.findById(idOrSlug)
        : await Lab.findOne({ $or: [{ slug: idOrSlug }, { dockerId: idOrSlug }] });
        
    // 2. Fallback: Robust Case-Insensitive Search
    if (!lab && typeof idOrSlug === 'string') {
        const cleanId = idOrSlug.trim();
        lab = await Lab.findOne({ 
            $or: [
                { slug: { $regex: new RegExp(`^${cleanId}$`, 'i') } },
                { dockerId: { $regex: new RegExp(`^${cleanId}$`, 'i') } }
            ]
        });
    }
    
    return lab;
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
            return res.status(404).json({ 
                success: false, 
                message: 'Lab not found',
                debug: {
                    requestedId: req.params.labId,
                    found: !!lab,
                    isActive: lab ? lab.isActive : 'N/A'
                }
            });
        }

        // Find associated badge using the registry evaluator logic
        const badgeRegistry = require("../utils/badgeRegistry");
        const badgeReward = badgeRegistry.find(b => {
          try {
            return b.evaluator({}, { type: "lab_completion", labId: lab.slug });
          } catch (e) {
            return false;
          }
        });

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
                badgeReward:         badgeReward || null,
            },
        });
    } catch {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc  Start a lab container (Kubernetes)
// @route POST /api/labs/start/:labId
exports.startLab = async (req, res) => {
    try {
        const { labId } = req.params;
        const lab = await resolveLab(labId);
        
        if (!lab) {
            return res.status(404).json({ success: false, message: 'Lab definition not found in database' });
        }

        const yamlFile = lab.k8sYaml || `${lab.slug}.yaml`;
        const yamlPath = path.join(__dirname, '..', 'k8s-labs', yamlFile);

        // Execute kubectl apply
        exec(`kubectl apply -f "${yamlPath}"`, (error, stdout, stderr) => {
            if (error) {
                return res.status(500).json({ success: false, message: stderr || error.message });
            }

            // Return URL from DB or fallback to hardcoded mapping for safety
            let labUrl = lab.k8sUrl;
            if (!labUrl) {
                if (lab.slug === "linux-forensics") labUrl = "http://localhost:32083";
                else if (lab.slug === "malware")    labUrl = "http://localhost:32230";
                else if (lab.slug === "web-security") labUrl = "http://localhost:32235";
                else if (lab.slug === "active-directory") labUrl = "http://localhost:32240";
                else if (lab.slug === "container-breakout") labUrl = "http://localhost:32245";
                else if (lab.slug === "hidden-data-discovery") labUrl = "http://localhost:32250";
                else labUrl = "http://localhost:32083";
            }

            res.json({ success: true, labUrl });
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc  Stop a lab container (Kubernetes)
// @route POST /api/labs/stop/:labId
exports.stopLab = async (req, res) => {
    try {
        const { labId } = req.params;
        const lab = await resolveLab(labId);
        
        const yamlFile = lab?.k8sYaml || `${labId}.yaml`;
        const yamlPath = path.join(__dirname, '..', 'k8s-labs', yamlFile);

        exec(`kubectl delete -f "${yamlPath}"`, (error, stdout, stderr) => {
            if (error) {
                return res.status(500).json({ success: false, message: stderr || error.message });
            }
            res.json({ success: true, message: "Lab stopped successfully" });
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc  Get machine status
// @route GET /api/labs/status/:labId
exports.getLabStatus = async (req, res) => {
    try {
        const lab = await resolveLab(req.params.labId);
        const k8sLabel = lab?.dockerId || req.params.labId;
        exec(`kubectl get pods -l lab-id=${k8sLabel} --field-selector=status.phase=Running -o name`, (err, stdout) => {
            if (!err && stdout.trim().length > 0) {
                res.json({ status: "running" });
            } else {
                res.json({ status: "stopped" });
            }
        });
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

        // Centralized XP: use config as source of truth, fall back to lab.points for legacy data
        const xpToAward = getLabXP(lab.difficulty) || lab.points;

        const oldLevel = user.level;
        
        user.completedLabs = (user.completedLabs || 0) + 1;
        user.points += xpToAward;
        user.lastStreakDate = new Date();
        await user.save();

        if (user.level > oldLevel) {
            const NotificationService = require('../utils/notificationHelper');
            await NotificationService.notifyLevelUp(user._id, user.level);
        }

        lab.completedBy.push({ userId: user._id, completedAt: new Date(), score: finalScore || xpToAward });
        await lab.save();

        await WeeklyStats.recordActivity(user._id, 'lab', xpToAward, true);

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
                pointsEarned: xpToAward,
                totalPoints: user.points,
                ...(badgesAwarded.length > 0 && { badgesAwarded }),
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
