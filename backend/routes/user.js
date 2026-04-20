const express = require("express");
const User = require("../models/User");
const Room = require("../models/Room");
const Badge = require("../models/Badge");
const UserBadge = require("../models/UserBadge");
const { auth } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/user/streak
// @desc    Get user's current streak
// @access  Private
router.get("/streak", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check and update streak status (handles automatic reset if broken)
    user.checkStreakStatus();
    await user.save();

    res.json({
      currentStreak: user.currentStreak || 0,
      longestStreak: user.longestStreak || 0,
      lastStreakDate: user.lastStreakDate,
    });
  } catch (error) {
    console.error("Get streak error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/user/update-streak
// @desc    Update user streak (called when user completes activity)
// @access  Private
router.post("/update-streak", auth, async (req, res) => {
  try {
    const { activityType, itemId } = req.body; // 'room' or 'lab'

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Use the proper updateStreak method which handles all the logic
    user.updateStreak(activityType || "room", itemId);
    await user.save();

    res.json({
      currentStreak: user.currentStreak || 0,
      longestStreak: user.longestStreak || 0,
      message: "Streak updated",
    });
  } catch (error) {
    console.error("Update streak error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/user/badges
// @desc    Get user's badges — earned and locked, with type and unlock reason
// @access  Private
router.get("/badges", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // All non-secret badges
    const allBadges = await Badge.find({}).lean();

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Build a fast lookup of earned badge names
    const earnedMap = {};
    user.badges.forEach((b) => {
      earnedMap[b.name] = b.earnedAt;
    });

    const badgesWithStatus = allBadges.map((badge) => {
      const isEarned = !!earnedMap[badge.name];
      return {
        _id: badge._id,
        name: badge.name,
        description: badge.isHidden && !isEarned ? "???" : badge.description,
        unlockReason:
          badge.isHidden && !isEarned
            ? "This is a hidden achievement. Keep exploring!"
            : badge.unlockReason,
        category: badge.category,
        badgeType: badge.badgeType,
        roomId: badge.roomId,
        bonusCondition: badge.bonusCondition,
        difficulty: badge.difficulty,
        xpReward: badge.xpReward,
        icon: badge.icon,
        isHidden: badge.isHidden,
        earned: isEarned,
        earnedAt: earnedMap[badge.name] || null,
      };
    });

    // Sort: earned first, then by difficulty weight
    const diffWeight = { common: 0, uncommon: 1, rare: 2, legendary: 3 };
    badgesWithStatus.sort((a, b) => {
      if (a.earned !== b.earned) return a.earned ? -1 : 1;
      return (diffWeight[b.difficulty] || 0) - (diffWeight[a.difficulty] || 0);
    });

    res.json({ badges: badgesWithStatus });
  } catch (error) {
    console.error("Get badges error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/user/saved-items
// @desc    Get user's saved items
// @access  Private
router.get("/saved-items", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "savedItems.itemId",
      select: "title description difficulty category slug",
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ savedItems: user.savedItems || [] });
  } catch (error) {
    console.error("Get saved items error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/user/save-item/:type/:id
// @desc    Toggle save/unsave an item
// @access  Private
router.post("/save-item/:type/:id", auth, async (req, res) => {
  try {
    const { type, id } = req.params;

    if (!["room", "lab"].includes(type)) {
      return res.status(400).json({ message: "Invalid item type" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if item is already saved
    const existingIndex = user.savedItems.findIndex(
      (item) => item.itemId.toString() === id && item.itemType === type,
    );

    if (existingIndex !== -1) {
      // Remove from saved
      user.savedItems.splice(existingIndex, 1);
      await user.save();
      return res.json({ message: "Item removed from saved", saved: false });
    } else {
      // Add to saved
      user.savedItems.push({
        itemType: type,
        itemId: id,
        savedAt: new Date(),
      });
      await user.save();
      return res.json({ message: "Item saved", saved: true });
    }
  } catch (error) {
    console.error("Toggle save item error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/user/badges-detailed
// @desc    Get user's badges with detailed stats
// @access  Private
router.get("/badges-detailed", auth, async (req, res) => {
  try {
    const badgeService = require("../services/badge.service");
    const result = await badgeService.getUserBadgesWithStats(req.user.id);

    if (!result.success) {
      return res.status(500).json({ message: "Error fetching badges" });
    }

    res.json(result);
  } catch (error) {
    console.error("Get badges detailed error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/user/badges-stats
// @desc    Get user's badge statistics
// @access  Private
router.get("/badges-stats", auth, async (req, res) => {
  try {
    const badgeService = require("../services/badge.service");
    const { getBadgeStats } = require("../utils/badgeHelper");
    const stats = await getBadgeStats(req.user.id);

    res.json({ stats });
  } catch (error) {
    console.error("Get badge stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/user/badge-leaderboard
// @desc    Get badge leaderboard (top users by badge count)
// @access  Private
router.get("/badge-leaderboard", auth, async (req, res) => {
  try {
    const badgeService = require("../services/badge.service");
    const limit = req.query.limit || 10;
    const leaderboard = await badgeService.getBadgeLeaderboard(parseInt(limit));

    res.json({ leaderboard });
  } catch (error) {
    console.error("Get badge leaderboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/user/certificates
// @desc    Get user's certificates
// @access  Private
router.get("/certificates", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get all completed room slugs from progress
    const completedProgress = user.roomProgress?.filter(rp => rp.completed && rp.roomId) || [];

    if (completedProgress.length === 0) {
      return res.json({ certificates: [] });
    }

    // roomId is stored as slug — find by slug
    const slugs = completedProgress.map(rp => rp.roomId);
    const completedRooms = await Room.find({ slug: { $in: slugs } });

    const certificates = completedRooms.map((room) => {
      const progress = completedProgress.find(rp => rp.roomId === room.slug);
      const score = progress?.quizScore?.percentage || progress?.finalScore || 100;
      const category = room.category || 'Cybersecurity';
      // Store slug in credentialId so download can find correct room
      const credentialId = `CV-${category.substring(0, 3).toUpperCase()}-${room.slug.toUpperCase().replace(/-/g,'').substring(0,10)}`;

      return {
        _id:             room._id,
        title:           room.title,
        category,
        type:            'room',
        credentialId,
        slug:            room.slug,
        difficulty:      room.difficulty || 'Intermediate',
        issueDate:       progress?.completedAt || new Date(),
        earnedDate:      progress?.completedAt || new Date(),
        verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${credentialId}`,
        score:           Math.round(score),
        earned:          true,
        completed:       true,
        requirement:     `Complete ${room.title}`,
      };
    });

    res.json({ certificates });
  } catch (error) {
    console.error("Get certificates error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   GET /api/user/certificates/:credentialId/download
router.get("/certificates/:credentialId/download", auth, async (req, res) => {
  try {
    const PDFDocument = require('pdfkit');
    const { credentialId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Extract slug from credentialId: CV-CAT-SLUGPART
    const parts = credentialId.split('-');
    const slugPart = parts.slice(2).join('').toLowerCase();

    // Find room by matching slug (remove hyphens for comparison)
    const rooms = await Room.find({});
    const room = rooms.find(r => r.slug.replace(/-/g, '').toUpperCase().substring(0, 10) === slugPart.toUpperCase())
      || rooms[0];

    const progress = user.roomProgress?.find(rp => rp.completed && room && rp.roomId === room.slug);
    const score = Math.round(progress?.quizScore?.percentage || progress?.finalScore || 100);
    const completedAt = new Date(progress?.completedAt || new Date()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const roomTitle = room?.title || 'Cybersecurity Training';
    const category = room?.category || 'Cybersecurity';
    const difficulty = room?.difficulty || 'Intermediate';

    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="CyberVerse-${room?.slug || 'certificate'}.pdf"`);
    doc.pipe(res);

    const W = 841.89, H = 595.28;
    const CX = W / 2;

    // ── Background ──
    doc.rect(0, 0, W, H).fill('#060D1A');

    // Subtle grid pattern (horizontal lines)
    doc.strokeColor('#0d1f35').lineWidth(0.3);
    for (let y = 0; y < H; y += 20) {
      doc.moveTo(0, y).lineTo(W, y).stroke();
    }
    for (let x = 0; x < W; x += 20) {
      doc.moveTo(x, 0).lineTo(x, H).stroke();
    }

    // ── Outer border ──
    doc.rect(18, 18, W - 36, H - 36).lineWidth(1.5).strokeColor('#00D1FF').stroke();
    doc.rect(24, 24, W - 48, H - 48).lineWidth(0.4).strokeColor('#FF6B00').stroke();

    // ── Left accent bar ──
    doc.rect(18, 18, 6, H - 36).fill('#00D1FF');
    doc.rect(W - 24, 18, 6, H - 36).fill('#00D1FF');

    // ── Top header section ──
    doc.rect(24, 24, W - 48, 90).fill('#0A1628');

    // Logo area left
    doc.circle(70, 69, 28).fill('#0d1f35').stroke();
    doc.circle(70, 69, 28).lineWidth(1).strokeColor('#00D1FF').stroke();
    doc.fontSize(7).fillColor('#00D1FF').font('Helvetica-Bold')
      .text('CV', 62, 65, { width: 16, align: 'center' });

    // Platform name center
    doc.fontSize(18).fillColor('#FFFFFF').font('Helvetica-Bold')
      .text('CYBERVERSE', 0, 38, { align: 'center', characterSpacing: 6 });
    doc.fontSize(7.5).fillColor('#00D1FF')
      .text('CYBERSECURITY TRAINING & CERTIFICATION PLATFORM', 0, 62, { align: 'center', characterSpacing: 2 });
    doc.fontSize(6.5).fillColor('#475569')
      .text('Empowering the Next Generation of Cybersecurity Professionals', 0, 76, { align: 'center' });

    // ── Certificate title ──
    doc.fontSize(9).fillColor('#94a3b8').font('Helvetica')
      .text('— OFFICIAL CERTIFICATE OF COMPLETION —', 0, 130, { align: 'center', characterSpacing: 3 });

    // ── Decorative line ──
    const lineY = 148;
    doc.moveTo(CX - 180, lineY).lineTo(CX - 20, lineY).lineWidth(0.8).strokeColor('#1e3a5f').stroke();
    doc.circle(CX, lineY, 4).fill('#00D1FF');
    doc.moveTo(CX + 20, lineY).lineTo(CX + 180, lineY).lineWidth(0.8).strokeColor('#1e3a5f').stroke();

    // ── Presented to ──
    doc.fontSize(10).fillColor('#64748b').font('Helvetica')
      .text('This is to certify that', 0, 162, { align: 'center' });

    // ── Recipient name ──
    doc.fontSize(36).fillColor('#00D1FF').font('Helvetica-Bold')
      .text(user.name, 0, 180, { align: 'center' });

    // Name underline
    const nameWidth = Math.min(user.name.length * 18, 400);
    doc.moveTo(CX - nameWidth / 2, 222).lineTo(CX + nameWidth / 2, 222)
      .lineWidth(1).strokeColor('#00D1FF').stroke();

    // ── Description ──
    doc.fontSize(10).fillColor('#94a3b8').font('Helvetica')
      .text('has successfully demonstrated proficiency and completed the training room', 0, 234, { align: 'center' });

    // ── Room title ──
    doc.fontSize(22).fillColor('#FF6B00').font('Helvetica-Bold')
      .text(roomTitle, 60, 256, { align: 'center', width: W - 120 });

    // ── Category & Difficulty pills ──
    const pillY = 292;
    const pill1X = CX - 120;
    const pill2X = CX + 10;
    doc.roundedRect(pill1X, pillY, 100, 18, 9).fill('#0d1f35').stroke();
    doc.roundedRect(pill1X, pillY, 100, 18, 9).lineWidth(0.5).strokeColor('#00D1FF').stroke();
    doc.fontSize(7).fillColor('#00D1FF').font('Helvetica-Bold')
      .text(category.toUpperCase(), pill1X, pillY + 5, { width: 100, align: 'center' });

    doc.roundedRect(pill2X, pillY, 100, 18, 9).fill('#0d1f35').stroke();
    doc.roundedRect(pill2X, pillY, 100, 18, 9).lineWidth(0.5).strokeColor('#FF6B00').stroke();
    doc.fontSize(7).fillColor('#FF6B00').font('Helvetica-Bold')
      .text(difficulty.toUpperCase(), pill2X, pillY + 5, { width: 100, align: 'center' });

    // ── Bottom section divider ──
    doc.rect(24, H - 130, W - 48, 1).fill('#0d1f35');
    doc.rect(24, H - 131, W - 48, 1).fill('#1e3a5f');

    // ── Bottom left: Issue info ──
    doc.fontSize(7).fillColor('#475569').font('Helvetica')
      .text('ISSUE DATE', 50, H - 118)
      .text('CREDENTIAL ID', 50, H - 96)
      .text('VERIFY AT', 50, H - 74);
    doc.fontSize(8).fillColor('#94a3b8').font('Helvetica-Bold')
      .text(completedAt, 160, H - 118)
      .text(credentialId, 160, H - 96)
      .text('cyberverse.io/verify/' + credentialId, 160, H - 74);

    // ── Bottom center: Score badge ──
    doc.circle(CX, H - 88, 38).fill('#0A1628');
    doc.circle(CX, H - 88, 38).lineWidth(1.5).strokeColor(score >= 90 ? '#39FF14' : score >= 70 ? '#00D1FF' : '#FF6B00').stroke();
    doc.fontSize(7).fillColor('#64748b').font('Helvetica')
      .text('SCORE', CX - 20, H - 100, { width: 40, align: 'center' });
    doc.fontSize(20).fillColor(score >= 90 ? '#39FF14' : score >= 70 ? '#00D1FF' : '#FF6B00').font('Helvetica-Bold')
      .text(`${score}%`, CX - 25, H - 90, { width: 50, align: 'center' });

    // ── Bottom right: Authorized signature area ──
    const sigX = W - 220;
    doc.moveTo(sigX, H - 80).lineTo(sigX + 160, H - 80).lineWidth(0.5).strokeColor('#1e3a5f').stroke();
    doc.fontSize(7).fillColor('#475569').font('Helvetica')
      .text('AUTHORIZED BY', sigX, H - 72, { width: 160, align: 'center' })
      .text('CyberVerse Certification Authority', sigX, H - 62, { width: 160, align: 'center' });

    // ── Corner decorations ──
    const corners = [[30, 30], [W - 30, 30], [30, H - 30], [W - 30, H - 30]];
    corners.forEach(([cx, cy]) => {
      doc.circle(cx, cy, 3).fill('#00D1FF');
    });

    doc.end();
  } catch (error) {
    console.error('Certificate download error:', error);
    res.status(500).json({ message: 'Failed to generate certificate' });
  }
});

module.exports = router;
