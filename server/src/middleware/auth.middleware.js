const jwt = require('jsonwebtoken');
const User = require('../models/user.model.js');

// Middleware to protect routes - requires user to be logged in
const protect = async (req, res, next) => {
  try {
    // Get token from httpOnly cookie ONLY (no Authorization header support for security)
    const token = req.cookies.token;

    // Check if token exists in cookie
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, please login' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database (without password)
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Check if user account is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Attach user to request object
    req.user = user;
    next(); // Continue to next middleware or route handler
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired, please login again' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Middleware to restrict routes to admin only
const adminOnly = (req, res, next) => {
  // Check if user is admin (protect middleware must run before this)
  if (req.user && req.user.role === 'admin') {
    next(); // User is admin, continue
  } else {
    res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};

// Middleware to restrict routes to admin or moderator
const adminOrModerator = (req, res, next) => {
  // Check if user is admin or moderator (protect middleware must run before this)
  if (req.user && (req.user.role === 'admin' || req.user.role === 'moderator')) {
    next(); // User is admin or moderator, continue
  } else {
    res.status(403).json({ message: 'Access denied. Admin or moderator only.' });
  }
};

// Optional auth middleware - attaches user if token exists, but doesn't fail if it doesn't
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    // If no token, just continue without attaching user
    if (!token) {
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database (without password)
    const user = await User.findById(decoded.id).select('-password');

    // Attach user if found and active
    if (user && user.isActive) {
      req.user = user;
    }

    next();
  } catch (error) {
    // If token is invalid or expired, just continue without user
    next();
  }
};

module.exports = {
  protect,
  adminOnly,
  adminOrModerator,
  optionalAuth
};
