const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const router = express.Router();

// GET /api/2fa/status - Check if 2FA is enabled for logged-in user
router.get('/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      enabled: user.twoFactorEnabled || false,
      method: user.twoFactorMethod || null
    });
  } catch (error) {
    console.error('2FA status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/2fa/setup - Generate and return QR code or OTP secret
router.post('/setup', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Generate TOTP secret with proper configuration
    const secret = speakeasy.generateSecret({
      name: `CyberVerse (${user.email})`,
      issuer: 'CyberVerse',
      length: 20 // Standard length for better compatibility
    });
    
    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);
    
    // Store secret temporarily (not enabled yet)
    user.twoFactorSecret = secret.base32;
    await user.save();

    res.status(200).json({
      qrCode,
      secret: secret.base32,
      manualEntryKey: secret.base32
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/2fa/verify - Verify OTP code and enable 2FA
router.post('/verify', async (req, res) => {
  try {
    const { userId, code } = req.body;
    
    if (!userId || !code || code.length !== 6) {
      return res.status(400).json({ message: 'Please provide a user ID and 6-digit code' });
    }

    const user = await User.findById(userId).select('+twoFactorSecret');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.twoFactorSecret) {
      return res.status(400).json({ message: '2FA setup required first' });
    }

    // Verify TOTP code with generous window for reliability
    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code.toString(),
      window: 10, // 5-minute window for reliability
      step: 30
    });

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid authenticator code' });
    }

    // Enable 2FA if not already enabled
    if (!user.twoFactorEnabled) {
      user.twoFactorEnabled = true;
      user.twoFactorMethod = 'totp';
      await user.save();
    }

    // Generate token after successful verification
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: '2FA verification successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        twoFactorEnabled: true
      }
    });
  } catch (error) {
    console.error('2FA verify error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/2fa/verify-login - Verify 2FA during login
router.post('/verify-login', async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required' });
    }

    if (code.length !== 6) {
      return res.status(400).json({ message: 'Code must be 6 digits' });
    }

    const user = await User.findOne({ email }).select('+twoFactorSecret');
    
    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    // Verify TOTP code
    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code.toString(),
      window: 4,
      step: 30
    });

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    res.status(200).json({
      message: '2FA verification successful',
      verified: true
    });
  } catch (error) {
    console.error('2FA login verify error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/2fa/generate-backup-codes - Generate backup codes for 2FA
router.post('/generate-backup-codes', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA must be enabled first' });
    }

    // Generate 10 backup codes
    const backupCodes = [];
    for (let i = 0; i < 10; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      backupCodes.push({
        code: await require('bcryptjs').hash(code, 10), // Store hashed
        used: false,
        createdAt: new Date()
      });
    }

    // Store hashed codes
    user.twoFactorBackupCodes = backupCodes;
    await user.save();

    // Return unhashed codes to user (only shown once)
    const plainCodes = [];
    for (let i = 0; i < 10; i++) {
      plainCodes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }

    res.json({
      message: 'Backup codes generated successfully',
      codes: plainCodes,
      warning: 'Save these codes securely. They will only be shown once.'
    });
  } catch (error) {
    console.error('Generate backup codes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/2fa/verify-backup-code - Verify backup code during login
router.post('/verify-backup-code', async (req, res) => {
  try {
    const { userId, code } = req.body;
    
    if (!userId || !code) {
      return res.status(400).json({ message: 'User ID and backup code are required' });
    }

    const user = await User.findById(userId);
    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    if (!user.twoFactorBackupCodes || user.twoFactorBackupCodes.length === 0) {
      return res.status(400).json({ message: 'No backup codes available' });
    }

    // Find matching unused backup code
    let codeMatched = false;
    for (let i = 0; i < user.twoFactorBackupCodes.length; i++) {
      const backupCode = user.twoFactorBackupCodes[i];
      if (!backupCode.used) {
        const isMatch = await require('bcryptjs').compare(code, backupCode.code);
        if (isMatch) {
          // Mark code as used
          user.twoFactorBackupCodes[i].used = true;
          await user.save();
          codeMatched = true;
          break;
        }
      }
    }

    if (!codeMatched) {
      return res.status(401).json({ message: 'Invalid or already used backup code' });
    }

    // Generate auth token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Backup code verified successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        twoFactorEnabled: true
      }
    });
  } catch (error) {
    console.error('Verify backup code error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/2fa/backup-codes-status - Check how many backup codes remain
router.get('/backup-codes-status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    const totalCodes = user.twoFactorBackupCodes?.length || 0;
    const usedCodes = user.twoFactorBackupCodes?.filter(c => c.used).length || 0;
    const remainingCodes = totalCodes - usedCodes;

    res.json({
      total: totalCodes,
      used: usedCodes,
      remaining: remainingCodes
    });
  } catch (error) {
    console.error('Backup codes status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/2fa/trusted-devices - List trusted devices
router.get('/trusted-devices', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      devices: user.trustedDevices?.map(device => ({
        deviceId: device.deviceId,
        deviceName: device.deviceName,
        lastUsed: device.lastUsed,
        createdAt: device.createdAt
      })) || []
    });
  } catch (error) {
    console.error('Get trusted devices error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/2fa/disable - Disable 2FA
router.post('/disable', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    user.twoFactorEnabled = false;
    user.twoFactorMethod = null;
    user.twoFactorSecret = null;
    user.trustedDevices = [];
    
    await user.save();

    res.status(200).json({
      message: '2FA disabled successfully'
    });
  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;