const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
  }

  // Shared HTML wrapper
  _wrap(content) {
    return `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#0d1117;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#00d1ff 0%,#7c3aed 100%);padding:28px 32px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:26px;letter-spacing:2px;">⚡ CYBERVERSE</h1>
          <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;letter-spacing:1px;">SECURE OPERATIONS CENTER</p>
        </div>
        <div style="padding:36px 32px;background:#0d1117;color:#e2e8f0;">
          ${content}
        </div>
        <div style="background:#161b22;padding:18px 32px;text-align:center;border-top:1px solid #21262d;">
          <p style="color:#475569;margin:0;font-size:11px;">© 2024 CyberVerse · This is an automated security message · Do not reply</p>
        </div>
      </div>`;
  }

  // OTP code block
  _otpBlock(otp, expiresMinutes = 10) {
    return `
      <div style="background:#161b22;border:1px solid #21262d;border-radius:10px;padding:28px;text-align:center;margin:24px 0;">
        <p style="color:#64748b;font-size:12px;letter-spacing:2px;margin:0 0 12px;text-transform:uppercase;">Your Verification Code</p>
        <div style="font-size:38px;font-weight:900;color:#00d1ff;letter-spacing:10px;font-family:monospace;">${otp}</div>
        <p style="color:#475569;font-size:12px;margin:12px 0 0;">Expires in <strong style="color:#f59e0b;">${expiresMinutes} minutes</strong></p>
      </div>`;
  }

  async sendOTP(email, otp, expiresAt) {
    const mins = Math.round((new Date(expiresAt) - Date.now()) / 60000);
    const html = this._wrap(`
      <h2 style="color:#fff;margin:0 0 8px;">Two-Factor Authentication</h2>
      <p style="color:#94a3b8;margin:0 0 4px;">A sign-in attempt was made to your CyberVerse account.</p>
      ${this._otpBlock(otp, mins)}
      <p style="color:#64748b;font-size:13px;">If you didn't request this, please secure your account immediately.</p>
    `);

    return this._send(email, '🔐 CyberVerse — Your 2FA Verification Code', html);
  }

  async sendForgotPasswordOTP(email, otp, name) {
    const html = this._wrap(`
      <h2 style="color:#fff;margin:0 0 8px;">Password Reset Request</h2>
      <p style="color:#94a3b8;margin:0 0 4px;">Hey <strong style="color:#00d1ff;">${name || 'Agent'}</strong>, we received a request to reset your CyberVerse password.</p>
      ${this._otpBlock(otp, 10)}
      <div style="background:#1a1f2e;border-left:3px solid #f59e0b;padding:14px 18px;border-radius:6px;margin:20px 0;">
        <p style="color:#f59e0b;margin:0;font-size:13px;">⚠️ If you did not request a password reset, ignore this email. Your password will remain unchanged.</p>
      </div>
      <p style="color:#64748b;font-size:13px;">This code is valid for <strong>10 minutes</strong> and can only be used once.</p>
    `);

    return this._send(email, '🔑 CyberVerse — Password Reset Code', html);
  }

  async _send(to, subject, html) {
    try {
      await this.transporter.sendMail({
        from: `"CyberVerse Security" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        html
      });
      return { success: true };
    } catch (error) {
      console.error('Email send error:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
