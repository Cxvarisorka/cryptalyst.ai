const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

// Get user settings
const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      settings: user.settings || {},
      profile: {
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update profile settings (name, email, avatar)
const updateProfile = async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is being changed and if new email already exists
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = email;
    }

    // Update fields if provided
    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar; // Allow setting to null

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        settings: user.settings
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update password
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    // Get user with password field
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has a password (not OAuth user)
    if (!user.password) {
      return res.status(400).json({ 
        message: 'Cannot change password for OAuth accounts' 
      });
    }

    // Verify current password
    const isPasswordCorrect = await user.comparePassword(currentPassword);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user preferences (currency, timezone, dateFormat, theme, language)
const updatePreferences = async (req, res) => {
  try {
    const { currency, timezone, dateFormat, theme, language } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize settings if it doesn't exist
    if (!user.settings) {
      user.settings = {};
    }

    // Update preferences if provided
    if (currency) user.settings.currency = currency;
    if (timezone) user.settings.timezone = timezone;
    if (dateFormat) user.settings.dateFormat = dateFormat;
    if (theme) user.settings.theme = theme;
    if (language) user.settings.language = language;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      settings: user.settings
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update notification settings
const updateNotifications = async (req, res) => {
  try {
    const { notifications } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize settings and notifications if they don't exist
    if (!user.settings) {
      user.settings = {};
    }
    if (!user.settings.notifications) {
      user.settings.notifications = { email: {}, push: {} };
    }

    // Update notification settings
    if (notifications.email) {
      user.settings.notifications.email = {
        ...user.settings.notifications.email,
        ...notifications.email
      };
    }
    if (notifications.push) {
      user.settings.notifications.push = {
        ...user.settings.notifications.push,
        ...notifications.push
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Notification settings updated successfully',
      notifications: user.settings.notifications
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update privacy settings
const updatePrivacy = async (req, res) => {
  try {
    const { privacy } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize settings and privacy if they don't exist
    if (!user.settings) {
      user.settings = {};
    }
    if (!user.settings.privacy) {
      user.settings.privacy = {};
    }

    // Update privacy settings
    user.settings.privacy = {
      ...user.settings.privacy,
      ...privacy
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Privacy settings updated successfully',
      privacy: user.settings.privacy
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete user account
const deleteAccount = async (req, res) => {
  try {
    const { password, confirmDelete } = req.body;
    
    if (!confirmDelete) {
      return res.status(400).json({ 
        message: 'Please confirm account deletion' 
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify password for non-OAuth users
    if (user.password) {
      if (!password) {
        return res.status(400).json({ message: 'Password is required to delete account' });
      }

      const isPasswordCorrect = await user.comparePassword(password);
      if (!isPasswordCorrect) {
        return res.status(401).json({ message: 'Incorrect password' });
      }
    }

    // Soft delete by deactivating the account
    user.isActive = false;
    await user.save();

    // Clear cookie
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getSettings,
  updateProfile,
  updatePassword,
  updatePreferences,
  updateNotifications,
  updatePrivacy,
  deleteAccount
};
