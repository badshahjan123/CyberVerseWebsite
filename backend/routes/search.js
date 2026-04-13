const express = require('express');
const { auth } = require('../middleware/auth');
const searchController = require('../controllers/searchController');
const router = express.Router();

// @route   GET /api/search
router.get('/', auth, searchController.globalSearch);

module.exports = router;