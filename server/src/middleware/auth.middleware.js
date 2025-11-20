const jwt = require('jsonwebtoken');
const User = require('../models/user.model.js');

// Middleware to protect routes - requires user to be logged in
const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from cookie first (preferred)
    token = req.cookies.token;

    // If no cookie token, try Authorization header as backup
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
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

module.exports = {
  protect,
  adminOnly
};
