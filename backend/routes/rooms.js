const express = require('express');
const { auth } = require('../middleware/auth');
const roomController = require('../controllers/roomController');
const router = express.Router();

// @route   GET /api/rooms
router.get('/', roomController.getAllRooms);

// @route   GET /api/rooms/:slug
router.get('/:slug', roomController.getRoomBySlug);

// @route   POST /api/rooms/:slug/exercises/:exerciseId/submit
router.post('/:slug/exercises/:exerciseId/submit', auth, roomController.submitExercise);

// @route   POST /api/rooms/:slug/quizzes/:quizId/submit
router.post('/:slug/quizzes/:quizId/submit', auth, roomController.submitQuiz);

module.exports = router;