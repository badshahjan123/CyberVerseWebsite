const express = require('express');
const multer = require('multer');
const path = require('path');
const { auth } = require('../middleware/auth');
const userController = require('../controllers/userController');
const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/avatars/'),
  filename: (req, file, cb) => cb(null, `avatar-${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

// @route   GET /api/users/leaderboard
router.get('/leaderboard', userController.getLeaderboard);

// @route   GET /api/users/stats
router.get('/stats', auth, userController.getStats);

// @route   PUT /api/users/profile
router.put('/profile', auth, userController.updateProfile);

// @route   POST /api/users/upload-avatar
router.post('/upload-avatar', auth, upload.single('avatar'), userController.uploadAvatar);

module.exports = router;