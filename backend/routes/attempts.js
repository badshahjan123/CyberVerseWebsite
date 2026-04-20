const express = require('express');
const router = express.Router();
const { startAttempt, completeAttempt, getItemStats } = require('../controllers/attemptController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.post('/start', startAttempt);
router.post('/:id/complete', completeAttempt);
router.get('/stats/:itemType/:itemId', getItemStats);

module.exports = router;
