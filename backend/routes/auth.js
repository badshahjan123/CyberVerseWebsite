const express = require('express');
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();

// @route   POST /api/auth/register
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/)
], authController.register);

// @route   POST /api/auth/login
router.post('/login', authController.login);

// @route   POST /api/auth/verify-2fa
router.post('/verify-2fa', authController.verify2FA);

// @route   POST /api/auth/google
router.post('/google', authController.googleAuth);

// @route   GET /api/auth/me
router.get('/me', auth, authController.getMe);

// @route   POST /api/auth/reset-password-2fa
router.post('/reset-password-2fa', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('twoFactorCode').isLength({ min: 6, max: 6 }),
  body('newPassword').isLength({ min: 6 })
], authController.resetPassword2FA);

module.exports = router;