const User = require('../models/user.model');
const PortfolioCollection = require('../models/portfolioCollection.model');
const { sendTokenResponse, clearTokenCookie } = require('../utils/token.helper');

// Sign up new user with email and password
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password
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

    // Generate token, set cookie, and send response
    sendTokenResponse(user, 201, 'User created successfully', res);
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

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        oauthProvider: user.oauthProvider,
        settings: user.settings
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  signup,
  login,
  logout,
  getCurrentUser
};
