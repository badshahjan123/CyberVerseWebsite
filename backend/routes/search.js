const express = require('express');
const Room = require('../models/Room');
const Lab = require('../models/Lab');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/search
// @desc    Search across rooms, labs, and users
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { q, type, limit = 10 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({ results: [] });
    }

    const searchQuery = q.trim();
    const searchLimit = Math.min(parseInt(limit), 20);
    const results = [];

    // Search rooms
    if (!type || type === 'room') {
      const rooms = await Room.find({
        $or: [
          { name: { $regex: searchQuery, $options: 'i' } },
          { title: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } },
          { tags: { $in: [new RegExp(searchQuery, 'i')] } }
        ]
      })
      .select('name title slug description difficulty category points isPremium')
      .limit(searchLimit);

      rooms.forEach(room => {
        results.push({
          type: 'room',
          id: room._id,
          title: room.name || room.title,
          description: room.description,
          path: `/rooms/${room.slug || room._id}`,
          difficulty: room.difficulty,
          category: room.category,
          points: room.points,
          isPremium: room.isPremium
        });
      });
    }

    // Search labs
    if (!type || type === 'lab') {
      const labs = await Lab.find({
        $or: [
          { title: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } },
          { tags: { $in: [new RegExp(searchQuery, 'i')] } }
        ]
      })
      .select('title description difficulty category points isPremium')
      .limit(searchLimit);

      labs.forEach(lab => {
        results.push({
          type: 'lab',
          id: lab._id,
          title: lab.title,
          description: lab.description,
          path: `/labs/${lab._id}`,
          difficulty: lab.difficulty,
          category: lab.category,
          points: lab.points,
          isPremium: lab.isPremium
        });
      });
    }

    // Search users (only if admin or specific permission)
    if ((!type || type === 'user') && req.user.role === 'admin') {
      const users = await User.find({
        $or: [
          { name: { $regex: searchQuery, $options: 'i' } },
          { email: { $regex: searchQuery, $options: 'i' } }
        ]
      })
      .select('name email level points completedRooms completedLabs')
      .limit(searchLimit);

      users.forEach(user => {
        results.push({
          type: 'user',
          id: user._id,
          title: user.name,
          description: `Level ${user.level} • ${user.points} points`,
          path: `/profile/${user._id}`,
          level: user.level,
          points: user.points
        });
      });
    }

    // Sort results by relevance (exact matches first, then partial)
    results.sort((a, b) => {
      const aExact = a.title.toLowerCase().includes(searchQuery.toLowerCase());
      const bExact = b.title.toLowerCase().includes(searchQuery.toLowerCase());
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return 0;
    });

    res.json({
      results: results.slice(0, searchLimit),
      query: searchQuery,
      total: results.length
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Search failed' });
  }
});

module.exports = router;