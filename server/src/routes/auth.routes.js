const express = require('express');
const { signup, login, logout, getCurrentUser, verifyEmail, resendVerificationEmail } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes - no authentication required

// POST /api/auth/signup - Create new user account
router.post('/signup', signup);

// POST /api/auth/login - Login with email and password
router.post('/login', login);

// POST /api/auth/logout - Logout user
router.post('/logout', logout);

// GET /api/auth/verify-email - Verify email with token
router.get('/verify-email', verifyEmail);

// POST /api/auth/resend-verification - Resend verification email
router.post('/resend-verification', resendVerificationEmail);

// Protected routes - requires authentication

// GET /api/auth/me - Get current logged in user
router.get('/me', protect, getCurrentUser);

module.exports = router;
