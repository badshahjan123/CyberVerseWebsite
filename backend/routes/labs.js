const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const labController = require('../controllers/labController');

router.get('/',                              labController.getAllLabs);
router.post('/start/:labId',            auth, labController.startLab);
router.post('/stop/:labId',             auth, labController.stopLab);
router.get('/status/:labId',            auth, labController.getLabStatus);
router.get('/:labId/completion-status', auth, labController.getCompletionStatus);
router.post('/:labId/complete',         auth, labController.completeLab);
router.get('/:labId',                        labController.getLabById);

module.exports = router;
