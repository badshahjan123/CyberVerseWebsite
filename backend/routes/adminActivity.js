const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Room = require('../models/Room');
const Lab = require('../models/Lab');

// Get recent admin activity
router.get('/activity', async (req, res) => {
  try {
    const activities = [];
    
    // Get recent user registrations
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name createdAt');
    
    recentUsers.forEach(user => {
      activities.push({
        type: 'user',
        message: `New user registered: ${user.name}`,
        timestamp: getTimeAgo(user.createdAt)
      });
    });

    // Get recent rooms created
    const recentRooms = await Room.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('name title createdAt');
    
    recentRooms.forEach(room => {
      activities.push({
        type: 'room',
        message: `New room created: ${room.name || room.title}`,
        timestamp: getTimeAgo(room.createdAt)
      });
    });

    // Get recent labs created
    const recentLabs = await Lab.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('title createdAt');
    
    recentLabs.forEach(lab => {
      activities.push({
        type: 'lab',
        message: `New lab published: ${lab.title}`,
        timestamp: getTimeAgo(lab.createdAt)
      });
    });

    // Sort all activities by most recent (mock sorting since we don't have actual timestamps)
    activities.reverse();

    res.json({ activities: activities.slice(0, 10) });
  } catch (error) {
    console.error('Error fetching admin activity:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

function getTimeAgo(date) {
  const now = new Date();
  const diffInMs = now - new Date(date);
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days ago`;
}

module.exports = router;