const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const labController = require('../controllers/labController');

router.get('/',                              labController.getAllLabs);
router.get('/:labId/completion-status', auth, labController.getCompletionStatus);
router.get('/:labId',                        labController.getLabById);
router.post('/start/:labId',            auth, labController.startLab);
router.post('/stop/:labId',             auth, labController.stopLab);
router.get('/status/:labId',            auth, labController.getLabStatus);
router.post('/:labId/complete',         auth, labController.completeLab);

module.exports = router;
