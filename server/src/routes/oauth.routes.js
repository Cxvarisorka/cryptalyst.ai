const express = require('express');
const {
  getGoogleAuthUrl,
  googleCallback,
  getGithubAuthUrl,
  githubCallback
} = require('../controllers/oauth.controller');

const router = express.Router();

// Google OAuth routes

// GET /api/oauth/google - Get Google authorization URL
router.get('/google', getGoogleAuthUrl);

// GET /api/oauth/google/callback - Handle Google callback
router.get('/google/callback', googleCallback);

// GitHub OAuth routes

// GET /api/oauth/github - Get GitHub authorization URL
router.get('/github', getGithubAuthUrl);

// GET /api/oauth/github/callback - Handle GitHub callback
router.get('/github/callback', githubCallback);

module.exports = router;
