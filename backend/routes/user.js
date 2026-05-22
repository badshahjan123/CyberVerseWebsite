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
    const Certificate = require('../models/Certificate');
    const Track = require('../models/Track');
    const certDocs = await Certificate.find({ userId: req.user.id }).populate('trackId');

    const certificates = certDocs.map((cert) => {
      const track = cert.trackId;
      return {
        _id: cert._id,
        title: track ? track.name : 'Unknown Track',
        category: track ? (track.description || 'Specialization') : 'Cybersecurity',
        type: 'path', // Specialization track
        credentialId: cert.credentialId,
        slug: track ? track.slug : 'unknown-track',
        difficulty: 'Advanced',
        issueDate: cert.issueDate,
        earnedDate: cert.issueDate,
        verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${cert.credentialId}`,
        score: 100, // Tracks completed = 100%
        earned: true,
        completed: true,
        requirement: `Complete all rooms in ${track ? track.name : 'track'}`,
      };
    });

    res.json({ certificates });
  } catch (error) {
    console.error("Get certificates error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/user/certificates/:credentialId/download
router.get("/certificates/:credentialId/download", auth, async (req, res) => {
  try {
    const PDFDocument = require('pdfkit');
    const QRCode = require('qrcode');
    const Certificate = require('../models/Certificate');
    const { credentialId } = req.params;
    
    const cert = await Certificate.findOne({ credentialId, userId: req.user.id }).populate('trackId');
    if (!cert) {
      return res.status(404).json({ message: 'Certificate not found or not owned by user' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const track = cert.trackId;
    const trackTitle = track ? track.name : 'Cybersecurity Specialist';
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${cert.credentialId}`;

    // Generate real scannable QR Code buffer
    const qrBuffer = await QRCode.toBuffer(verificationUrl, {
      margin: 1,
      width: 150,
      color: {
        dark: '#00F5FF', // Cyan QR code modules
        light: '#0B1528' // Matches certificate background
      }
    });

    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="CyberVerse-${track?.slug || 'certificate'}.pdf"`);
    doc.pipe(res);

    const W = 841.89, H = 595.28;

    // 1. Background Fill
    doc.rect(0, 0, W, H).fill('#0B1528');

    // Subtle Grid lines
    doc.strokeColor('rgba(255, 255, 255, 0.02)').lineWidth(0.5);
    for (let y = 0; y < H; y += 30) {
      doc.moveTo(0, y).lineTo(W, y).stroke();
    }
    for (let x = 0; x < W; x += 30) {
      doc.moveTo(x, 0).lineTo(x, H).stroke();
    }

    // Ambient background glows (using radial-like circles)
    doc.save();
    doc.circle(W, 0, 180).fillColor('rgba(0, 245, 255, 0.03)').fill();
    doc.circle(0, H, 150).fillColor('rgba(139, 92, 246, 0.02)').fill();
    doc.restore();

    // 2. Main Outer Card Border
    doc.roundedRect(40, 40, W - 80, H - 80, 24)
       .lineWidth(1)
       .strokeColor('rgba(255, 255, 255, 0.08)')
       .stroke();

    // 3. Top Left Section: Header & Title
    doc.fontSize(10).fillColor('#00D1FF').font('Courier-Bold')
       .text('CYBERVERSE ACQUIRED', 75, 80, { characterSpacing: 2 });

    doc.fontSize(32).fillColor('#FFFFFF').font('Helvetica-Bold')
       .text(trackTitle, 75, 105, { width: 500 });

    // 4. Top Right Section: Gold Medal Vector
    const medalX = W - 100;
    const medalY = 90;
    doc.save();
    // Ribbons
    doc.moveTo(medalX - 8, medalY + 12).lineTo(medalX - 14, medalY + 36).lineTo(medalX - 4, medalY + 32).lineTo(medalX - 8, medalY + 12).fillColor('#FF6B00').fill();
    doc.moveTo(medalX + 8, medalY + 12).lineTo(medalX + 14, medalY + 36).lineTo(medalX + 4, medalY + 32).lineTo(medalX + 8, medalY + 12).fillColor('#FF6B00').fill();
    // Outer Gold circle
    doc.circle(medalX, medalY, 18).lineWidth(2).strokeColor('#FFB800').stroke();
    doc.circle(medalX, medalY, 15).fillColor('#FFD700').fill();
    // Inner star representation
    doc.circle(medalX, medalY, 6).fillColor('#FFB800').fill();
    doc.restore();

    // 5. Middle Left Section: Recipient Operator
    doc.fontSize(10).fillColor('#64748B').font('Courier-Bold')
       .text('RECIPIENT OPERATOR', 75, 255, { characterSpacing: 1.5 });

    doc.fontSize(26).fillColor('#FFFFFF').font('Helvetica-Bold')
       .text(user.name.toUpperCase(), 75, 275);

    // 6. Middle Right Section: Working QR Code Container
    const qX = W - 185;
    const qY = 220;
    const qSize = 110;
    const cL = 12; // corner length

    // Dotted inner frame
    doc.save();
    doc.rect(qX, qY, qSize, qSize).dash(4, { space: 4 }).lineWidth(0.5).strokeColor('rgba(0, 245, 255, 0.25)').stroke();
    doc.restore();

    // Corner highlights
    doc.strokeColor('#00D1FF').lineWidth(1.5);
    // Top-Left
    doc.moveTo(qX, qY + cL).lineTo(qX, qY).lineTo(qX + cL, qY).stroke();
    // Top-Right
    doc.moveTo(qX + qSize - cL, qY).lineTo(qX + qSize, qY).lineTo(qX + qSize, qY + cL).stroke();
    // Bottom-Left
    doc.moveTo(qX, qY + qSize - cL).lineTo(qX, qY + qSize).lineTo(qX + cL, qY + qSize).stroke();
    // Bottom-Right
    doc.moveTo(qX + qSize - cL, qY + qSize).lineTo(qX + qSize, qY + qSize).lineTo(qX + qSize, qY + qSize - cL).stroke();

    // Embed generated QR Code Image
    doc.image(qrBuffer, qX + 10, qY + 10, { width: 90, height: 90 });

    // 7. Divider Line
    doc.moveTo(75, H - 150).lineTo(W - 75, H - 150).lineWidth(0.5).strokeColor('rgba(255, 255, 255, 0.05)').stroke();

    // 8. Bottom Section
    // Bottom Left
    doc.fontSize(10).fillColor('#64748B').font('Courier-Bold')
       .text('VERIFICATION CODE', 75, H - 125, { characterSpacing: 1 });
    doc.fontSize(12).fillColor('#94A3B8').font('Courier')
       .text(credentialId, 75, H - 105);

    // Bottom Right
    doc.fontSize(10).fillColor('#64748B').font('Courier-Bold')
       .text('OFFICIAL SEAL', W - 250, H - 125, { width: 175, align: 'right', characterSpacing: 1 });
    doc.fontSize(12).fillColor('#39FF14').font('Courier-Bold')
       .text('SECURE SIGNED', W - 250, H - 105, { width: 175, align: 'right', characterSpacing: 1 });

    doc.end();
  } catch (error) {
    console.error('Certificate download error:', error);
    res.status(500).json({ message: 'Failed to generate certificate' });
  }
});

// @route   GET /api/user/certificates/verify/:credentialId
// @desc    Verify a certificate publicly (no auth required)
// @access  Public
router.get("/certificates/verify/:credentialId", async (req, res) => {
  try {
    const Certificate = require('../models/Certificate');
    const { credentialId } = req.params;
    
    // Search case-insensitively for the credentialId
    const cert = await Certificate.findOne({ 
      credentialId: { $regex: new RegExp(`^${credentialId}$`, 'i') } 
    }).populate('userId trackId');

    if (!cert) {
      return res.json({ success: false, message: 'No cryptographically matching record located in database.' });
    }

    res.json({
      success: true,
      title: cert.trackId ? cert.trackId.name : 'Cybersecurity Specialization',
      recipient: cert.userId ? cert.userId.name : 'Accredited Operator',
      issueDate: cert.issueDate,
      hash: cert.verificationHash
    });
  } catch (error) {
    console.error('Certificate verification route error:', error);
    res.status(500).json({ success: false, message: 'Server error during verification.' });
  }
});

module.exports = router;
