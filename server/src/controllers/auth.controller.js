const User = require('../models/user.model');
const PortfolioCollection = require('../models/portfolioCollection.model');
const { sendTokenResponse, clearTokenCookie } = require('../utils/token.helper');
const emailVerificationService = require('../services/emailVerification.service');
const { getCategoryTranslations } = require('../utils/emailTranslations');

// Sign up new user with email and password
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user (not verified yet)
    const user = await User.create({
      name,
      email,
      password,
      isEmailVerified: false
    });

    // Create default portfolio collection for new user
    await PortfolioCollection.create({
      user: user._id,
      name: 'My Portfolio',
      description: 'Your default portfolio collection',
      isDefault: true,
      visibility: 'private',
      color: '#10b981',
      icon: 'briefcase'
    });

    // Generate verification token and send email
    const token = await emailVerificationService.createVerificationToken(user._id);
    await emailVerificationService.sendVerificationEmail(user, token);

    // Don't log in the user - require email verification first
    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please check your email to verify your account.',
      requiresVerification: true,
      email: user.email
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login user with email and password
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email and include password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if password matches
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if email is verified (only for manual signup users, not OAuth)
    if (!user.oauthProvider && !user.isEmailVerified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in. Check your inbox for the verification link.',
        requiresVerification: true,
        email: user.email
      });
    }

    // Generate token, set cookie, and send response
    sendTokenResponse(user, 200, 'Logged in successfully', res);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Logout user by clearing cookie
const logout = async (req, res) => {
  try {
    // Clear the token cookie
    clearTokenCookie(res);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get current logged in user
const getCurrentUser = async (req, res) => {
  try {
    // req.user is set by auth middleware
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('👤 getCurrentUser called for:', user.email);
    console.log('📊 User subscription:', JSON.stringify(user.subscription, null, 2));

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        oauthProvider: user.oauthProvider,
        settings: user.settings,
        subscription: user.subscription // Include subscription data
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify email with token
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    const result = await emailVerificationService.verifyEmail(token);

    if (!result.success) {
      const userLang = 'en'; // Default language for error messages
      const t = getCategoryTranslations(userLang, 'emailVerification');

      if (result.error === 'alreadyVerified') {
        return res.status(400).json({ message: t.alreadyVerified });
      }
      return res.status(400).json({ message: t.invalidToken });
    }

    res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now log in.',
      verified: true
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Resend verification email
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a verification link has been sent.'
      });
    }

    if (user.oauthProvider) {
      return res.status(400).json({
        message: 'This account uses social login. No email verification needed.'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        message: 'This email is already verified. You can log in.'
      });
    }

    // Generate new token and send email
    const token = await emailVerificationService.createVerificationToken(user._id);
    await emailVerificationService.sendVerificationEmail(user, token, true);

    res.status(200).json({
      success: true,
      message: 'Verification email has been sent. Please check your inbox.'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  signup,
  login,
  logout,
  getCurrentUser,
  verifyEmail,
  resendVerificationEmail
};
