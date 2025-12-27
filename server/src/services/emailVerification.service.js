const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/user.model');
const { getCategoryTranslations } = require('../utils/emailTranslations');

class EmailVerificationService {
  constructor() {
    this.emailTransporter = null;
    this.initializeEmailTransporter();
  }

  initializeEmailTransporter() {
    // Configure email transporter using provided SMTP settings
    // IMAP/POP/SMTP Hostname: mail.hostedemail.com or mail.emailhome.com
    // SMTP Port: 465 (SSL) or 587 (TLS)

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const emailConfig = {
        host: process.env.EMAIL_HOST || 'mail.hostedemail.com',
        port: parseInt(process.env.EMAIL_PORT) || 465,
        secure: parseInt(process.env.EMAIL_PORT) === 465, // true for 465, false for 587
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      };

      console.log('📧 Email config:', {
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure,
        user: emailConfig.auth.user
      });

      this.emailTransporter = nodemailer.createTransport(emailConfig);
      console.log('✅ Email verification transporter initialized');
    } else {
      console.warn('⚠️ Email credentials not found. Email verification will be disabled.');
    }
  }

  // Generate a secure random token
  generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Generate token expiration (24 hours from now)
  generateTokenExpiration() {
    return new Date(Date.now() + 24 * 60 * 60 * 1000);
  }

  // Send verification email
  async sendVerificationEmail(user, token, isResend = false) {
    if (!this.emailTransporter) {
      console.warn('Email transporter not configured, skipping verification email');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      // Get user's language preference (default to English)
      const userLang = user.settings?.language || 'en';
      const t = getCategoryTranslations(userLang, 'emailVerification');

      // Build verification URL
      const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

      const mailOptions = {
        from: `"Cryptalyst" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: isResend ? t.resendSubject : t.subject,
        html: this.getEmailTemplate(user, verificationUrl, t)
      };

      await this.emailTransporter.sendMail(mailOptions);
      console.log(`Verification email sent to ${user.email} in ${userLang} language`);
      return { success: true };
    } catch (error) {
      console.error(`Error sending verification email to ${user.email}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Email HTML template - Modern minimalist design
  getEmailTemplate(user, verificationUrl, t) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; min-height: 100vh;">
            <tr>
              <td align="center" style="padding: 60px 20px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 440px;">

                  <!-- Logo -->
                  <tr>
                    <td align="center" style="padding-bottom: 40px;">
                      <span style="font-size: 24px; font-weight: 700; color: #10b981; letter-spacing: -0.5px;">Cryptalyst</span>
                    </td>
                  </tr>

                  <!-- Icon -->
                  <tr>
                    <td align="center" style="padding-bottom: 32px;">
                      <div style="width: 64px; height: 64px; background-color: #f0fdf4; border-radius: 50%; display: inline-block; line-height: 64px; text-align: center;">
                        <span style="font-size: 28px;">✓</span>
                      </div>
                    </td>
                  </tr>

                  <!-- Title -->
                  <tr>
                    <td align="center" style="padding-bottom: 16px;">
                      <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #111827; letter-spacing: -0.5px;">${t.title}</h1>
                    </td>
                  </tr>

                  <!-- Greeting & Message -->
                  <tr>
                    <td align="center" style="padding-bottom: 40px;">
                      <p style="margin: 0; font-size: 16px; color: #6b7280; line-height: 1.6;">
                        ${t.greeting}, ${user.name}.<br>
                        ${t.message}
                      </p>
                    </td>
                  </tr>

                  <!-- Button -->
                  <tr>
                    <td align="center" style="padding-bottom: 32px;">
                      <a href="${verificationUrl}" style="display: inline-block; padding: 14px 48px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">${t.verifyButton}</a>
                    </td>
                  </tr>

                  <!-- Expires -->
                  <tr>
                    <td align="center" style="padding-bottom: 48px;">
                      <p style="margin: 0; font-size: 13px; color: #9ca3af;">${t.expiresIn}</p>
                    </td>
                  </tr>

                  <!-- Divider -->
                  <tr>
                    <td style="padding-bottom: 24px;">
                      <div style="height: 1px; background-color: #f3f4f6;"></div>
                    </td>
                  </tr>

                  <!-- Ignore Message -->
                  <tr>
                    <td align="center" style="padding-bottom: 24px;">
                      <p style="margin: 0; font-size: 13px; color: #9ca3af; line-height: 1.5;">${t.ignoreMessage}</p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td align="center">
                      <p style="margin: 0; font-size: 12px; color: #d1d5db;">&copy; ${new Date().getFullYear()} Cryptalyst</p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }

  // Create verification token and save to user
  async createVerificationToken(userId) {
    const token = this.generateVerificationToken();
    const expires = this.generateTokenExpiration();

    await User.findByIdAndUpdate(userId, {
      emailVerificationToken: token,
      emailVerificationTokenExpires: expires
    });

    return token;
  }

  // Verify email with token
  async verifyEmail(token) {
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationTokenExpires: { $gt: new Date() }
    });

    if (!user) {
      return { success: false, error: 'invalidToken' };
    }

    if (user.isEmailVerified) {
      return { success: false, error: 'alreadyVerified' };
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerifiedAt = new Date();
    user.emailVerificationToken = null;
    user.emailVerificationTokenExpires = null;
    await user.save();

    return { success: true, user };
  }

  // Resend verification email
  async resendVerificationEmail(email) {
    const user = await User.findOne({ email });

    if (!user) {
      return { success: false, error: 'userNotFound' };
    }

    if (user.isEmailVerified) {
      return { success: false, error: 'alreadyVerified' };
    }

    // Check if user signed up with OAuth (no need for email verification)
    if (user.oauthProvider) {
      return { success: false, error: 'oauthUser' };
    }

    // Generate new token
    const token = await this.createVerificationToken(user._id);

    // Send email
    const result = await this.sendVerificationEmail(user, token, true);
    return result;
  }
}

// Create singleton instance
const emailVerificationService = new EmailVerificationService();

module.exports = emailVerificationService;
