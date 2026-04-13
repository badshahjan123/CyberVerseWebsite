const Room = require('../models/Room');
const Lab = require('../models/Lab');
const User = require('../models/User');

// @desc    Global search across rooms, labs, and users
// @route   GET /api/search
exports.globalSearch = async (req, res) => {
  try {
    const { q, type, limit = 10 } = req.query;
    if (!q || q.trim().length < 2) return res.json({ results: [] });

    const searchQuery = q.trim();
    const searchLimit = Math.min(parseInt(limit), 20);
    const results = [];

    // Search rooms
    if (!type || type === 'room') {
      const rooms = await Room.find({ $or: [{ name: { $regex: searchQuery, $options: 'i' } }, { title: { $regex: searchQuery, $options: 'i' } }] })
        .select('name title slug description difficulty points').limit(searchLimit);
      rooms.forEach(room => results.push({ type: 'room', id: room._id, title: room.name || room.title, path: `/rooms/${room.slug}` }));
    }

    // Search labs
    if (!type || type === 'lab') {
      const labs = await Lab.find({ title: { $regex: searchQuery, $options: 'i' } })
        .select('title points').limit(searchLimit);
      labs.forEach(lab => results.push({ type: 'lab', id: lab._id, title: lab.title, path: `/labs/${lab._id}` }));
    }

    res.json({ results: results.slice(0, searchLimit), query: searchQuery, total: results.length });
  } catch (error) {
    res.status(500).json({ message: 'Search failed' });
  }
};
