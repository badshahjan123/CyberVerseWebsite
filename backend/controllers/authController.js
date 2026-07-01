const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const NotificationService = require('../utils/notificationHelper');
const speakeasy = require('speakeasy');
const { OAuth2Client } = require('google-auth-library');
const logger = require('../utils/logger');
const { HTTP_STATUS, MESSAGES, AUTH } = require('../config/constants');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Generate JWT authentication token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: AUTH.JWT_EXPIRY
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: 'User already exists with this email'
      });
    }

    const user = new User({
      name,
      email,
      password,
      twoFactorEnabled: false
    });

    await user.save();

    // Trigger event-driven badge check
    try {
      const { badgeEmitter } = require('../services/badgeEventService');
      badgeEmitter.emit('USER_REGISTERED', { userId: user._id });
    } catch (badgeError) {
      logger.error('Error emitting USER_REGISTERED event:', badgeError);
    }

    try {
      await NotificationService.notifyWelcome(user._id, user.name);
    } catch (notificationError) {
      logger.error('Welcome notification error:', notificationError);
    }

    if (global.broadcastAdminActivity) {
      global.broadcastAdminActivity({
        type: 'user',
        message: `New user registered: ${user.name}`,
        timestamp: 'Just now'
      })
    }

    logger.info('New user registered', { email: user.email, name: user.name });

    res.status(HTTP_STATUS.CREATED).json({
      message: MESSAGES.REGISTER_SUCCESS,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        twoFactorEnabled: false,
        tourCompleted: false,
        labTourCompleted: false
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR
    });
  }
};

// @desc    User login
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password +twoFactorSecret');
    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        message: MESSAGES.INVALID_CREDENTIALS
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        message: MESSAGES.INVALID_CREDENTIALS
      });
    }

    if (user.isActive === false) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        message: 'Your account has been blocked. Please contact support for assistance.'
      });
    }

    if (user.twoFactorEnabled && user.twoFactorSecret) {
      return res.json({
        requiresTwoFactor: true,
        message: 'Two-factor authentication required',
        email: user.email,
        userId: user._id,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          twoFactorEnabled: true,
          tourCompleted: user.tourCompleted,
          labTourCompleted: user.labTourCompleted
        }
      });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        twoFactorEnabled: false,
        tourCompleted: user.tourCompleted,
        labTourCompleted: user.labTourCompleted
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR
    });
  }
};

// @desc    Verify 2FA code
// @route   POST /api/auth/verify-2fa
exports.verify2FA = async (req, res) => {
  try {
    const { userId, code } = req.body;
    if (!userId || !code) return res.status(400).json({ message: 'Missing fields' });

    const user = await User.findById(userId).select('+twoFactorSecret');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code.toString(),
      window: 4,
      step: 30
    });

    if (!isValid) return res.status(401).json({ message: 'Invalid code' });

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        twoFactorEnabled: true,
        tourCompleted: user.tourCompleted,
        labTourCompleted: user.labTourCompleted
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Google OAuth Login/Signup
// @route   POST /api/auth/google
exports.googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const { sub: googleId, email, name, picture } = ticket.getPayload();
    let user = await User.findOne({ email });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        await user.save();
      }
    } else {
      user = new User({
        name,
        email,
        googleId,
        authProvider: 'google',
        avatar: picture || '',
        twoFactorEnabled: false
      });
      await user.save();

      // Trigger event-driven badge check for Google signup
      try {
        const { badgeEmitter } = require('../services/badgeEventService');
        badgeEmitter.emit('USER_REGISTERED', { userId: user._id });
      } catch (badgeError) {
        logger.error('Error emitting USER_REGISTERED event for Google:', badgeError);
      }

      await NotificationService.notifyWelcome(user._id, user.name);
    }

    const token = generateToken(user._id);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        twoFactorEnabled: user.twoFactorEnabled,
        tourCompleted: user.tourCompleted,
        labTourCompleted: user.labTourCompleted
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Google auth failed' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const xpConfig = require('../utils/xpConfig');
    const levelInfo = xpConfig.getLevelProgressInfo(user.points || 0);

    res.json({ 
      user: {
        ...user.toObject(),
        level: levelInfo.currentLevel,
        title: levelInfo.title,
        titleColor: levelInfo.color,
        nextTitle: levelInfo.nextTitle,
        nextTitleLevel: levelInfo.nextTitleLevel,
        xpProgress: levelInfo.xpProgress,
        baseXP: levelInfo.baseXP,
        nextLevelXP: levelInfo.nextLevelXP,
        pointsToNextLevel: levelInfo.xpNeeded
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Forgot password — send OTP to email
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select('+twoFactorSecret');
    // Always return success to prevent email enumeration
    if (!user) return res.json({ success: true, message: 'If this email exists, a code has been sent.' });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    user.emailOTP = { code: otp, expiresAt, attempts: 0, maxAttempts: 3 };
    await user.save();

    const emailService = require('../services/email.service');
    await emailService.sendForgotPasswordOTP(email, otp, user.name);

    // Tell frontend what 2FA methods are available
    res.json({
      success: true,
      message: 'Reset code sent to your email.',
      has2FA: user.twoFactorEnabled,
      hasTOTP: !!(user.twoFactorEnabled && user.twoFactorSecret),
      email
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify reset OTP (email based)
// @route   POST /api/auth/verify-reset-otp
exports.verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const emailOTP = user.emailOTP;
    if (!emailOTP?.code) return res.status(400).json({ message: 'No OTP requested. Please request a new code.' });
    if (new Date() > new Date(emailOTP.expiresAt)) return res.status(400).json({ message: 'Code expired. Please request a new one.' });
    if (emailOTP.attempts >= emailOTP.maxAttempts) return res.status(400).json({ message: 'Too many attempts. Please request a new code.' });

    if (emailOTP.code !== otp.toString()) {
      user.emailOTP.attempts += 1;
      await user.save();
      return res.status(400).json({ message: 'Invalid code. Please try again.' });
    }

    // OTP valid — generate a short-lived reset token
    const resetToken = jwt.sign({ id: user._id, purpose: 'reset' }, process.env.JWT_SECRET, { expiresIn: '15m' });
    user.emailOTP = {}; // clear OTP
    await user.save();

    res.json({ success: true, resetToken });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reset password with token
// @route   POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ message: 'Reset link expired. Please start over.' });
    }
    if (decoded.purpose !== 'reset') return res.status(400).json({ message: 'Invalid reset token.' });

    const user = await User.findById(decoded.id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify TOTP for password reset
// @route   POST /api/auth/verify-totp-reset
exports.verifyTOTPReset = async (req, res) => {
  try {
    const { email, totpCode } = req.body;
    const user = await User.findOne({ email }).select('+twoFactorSecret');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: totpCode.toString(),
      window: 4,
      step: 30
    });

    if (!isValid) return res.status(401).json({ message: 'Invalid authenticator code.' });

    const resetToken = jwt.sign({ id: user._id, purpose: 'reset' }, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.json({ success: true, resetToken });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reset password using 2FA
// @route   POST /api/auth/reset-password-2fa
exports.resetPassword2FA = async (req, res) => {
  try {
    const { email, twoFactorCode, newPassword } = req.body;
    const user = await User.findOne({ email }).select('+twoFactorSecret +password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: twoFactorCode.toString(),
      window: 4,
      step: 30
    });

    if (!isValid) return res.status(401).json({ message: 'Invalid code' });

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password reset' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
