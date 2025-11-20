const jwt = require('jsonwebtoken');

// Generate JWT token for user
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId }, // Payload - user ID
    process.env.JWT_SECRET, // Secret key from .env
    { expiresIn: '7d' } // Token expires in 7 days
  );
};

// Combined function: Generate token, set cookie, and send response
const sendTokenResponse = (user, statusCode, message, res) => {
  // Generate token
  const token = generateToken(user._id);

  // Cookie options
  const cookieOptions = {
    httpOnly: true, // Cannot be accessed by JavaScript (security)
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Allow cross-site for OAuth
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  };

  // Set token in HTTP-only cookie
  res.cookie('token', token, cookieOptions);

  // Remove password from user object
  user.password = undefined;

  // Send response with user data and token
  return res.status(statusCode).json({
    success: true,
    message: message,
    token, // Include token in response for client storage as backup
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || null
    }
  });
};

// Set token cookie only (for OAuth - no response sent)
const setTokenCookie = (user, res) => {
  // Generate token
  const token = generateToken(user._id);

  // Cookie options - more permissive for OAuth redirects
  const cookieOptions = {
    httpOnly: true, // Cannot be accessed by JavaScript (security)
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Allow cross-site for OAuth
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/' // Cookie available on all paths
  };

  // Set token in HTTP-only cookie
  res.cookie('token', token, cookieOptions);

  return token; // Return token for potential redirect URL use
};

// Clear token cookie (for logout)
const clearTokenCookie = (res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0) // Set expiry to past date
  });
};

module.exports = {
  sendTokenResponse,
  setTokenCookie,
  clearTokenCookie
};
