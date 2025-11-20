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

  // Cookie options - httpOnly for maximum security
  const cookieOptions = {
    httpOnly: true, // Cannot be accessed by JavaScript (XSS protection)
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-origin in production
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/' // Cookie available on all paths
  };

  console.log('🍪 Setting cookie with options:', { ...cookieOptions, NODE_ENV: process.env.NODE_ENV });

  // Set token in HTTP-only cookie
  res.cookie('token', token, cookieOptions);

  // Remove password from user object
  user.password = undefined;

  // Send response with user data only (NO token in response body for security)
  return res.status(statusCode).json({
    success: true,
    message: message,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || null
    }
  });
};

// Set token cookie only (for OAuth - no response sent, no token returned)
const setTokenCookie = (user, res) => {
  // Generate token
  const token = generateToken(user._id);

  // Cookie options - configured for OAuth redirects
  const cookieOptions = {
    httpOnly: true, // Cannot be accessed by JavaScript (XSS protection)
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-origin in production
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/' // Cookie available on all paths
  };

  console.log('🍪 Setting OAuth cookie with options:', { ...cookieOptions, NODE_ENV: process.env.NODE_ENV });

  // Set token in HTTP-only cookie
  res.cookie('token', token, cookieOptions);

  // DO NOT return token - it should only exist in httpOnly cookie
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
