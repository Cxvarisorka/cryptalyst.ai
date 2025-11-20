const axios = require('axios');
const User = require('../models/user.model');
const { setTokenCookie } = require('../utils/token.helper');

// Google OAuth - Get authorization URL
const getGoogleAuthUrl = (req, res) => {
  console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
  console.log("GOOGLE_REDIRECT_URI:", process.env.GOOGLE_REDIRECT_URI);

  // Build Google OAuth URL
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = {
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    client_id: process.env.GOOGLE_CLIENT_ID,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ].join(' ')
  };

  const qs = new URLSearchParams(options);
  const authUrl = `${rootUrl}?${qs.toString()}`;

  res.json({ url: authUrl });
};

// Google OAuth - Handle callback
const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;

    // Exchange code for access token
    const { data } = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    });

    const { access_token } = data;

    // Get user info from Google
    const { data: profile } = await axios.get(
      'https://www.googleapis.com/oauth2/v1/userinfo',
      {
        headers: { Authorization: `Bearer ${access_token}` }
      }
    );

    // Check if user exists
    let user = await User.findOne({ email: profile.email });

    if (!user) {
      // Create new user
      user = await User.create({
        name: profile.name,
        email: profile.email,
        avatar: profile.picture,
        oauthProvider: 'google',
        oauthId: profile.id
      });
    }

    // Set cookie and get token
    const token = setTokenCookie(user, res);

    // Redirect to frontend with token in URL as backup
    const redirectUrl = new URL(process.env.CLIENT_URL || 'http://localhost:5173');
    redirectUrl.searchParams.set('token', token);
    redirectUrl.searchParams.set('auth', 'success');

    res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('Google OAuth Error:', error.message);
    const redirectUrl = new URL(process.env.CLIENT_URL || 'http://localhost:5173');
    redirectUrl.searchParams.set('error', 'oauth_failed');
    res.redirect(redirectUrl.toString());
  }
};

// GitHub OAuth - Get authorization URL
const getGithubAuthUrl = (req, res) => {
  // Build GitHub OAuth URL
  const rootUrl = 'https://github.com/login/oauth/authorize';
  const options = {
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_REDIRECT_URI,
    scope: 'read:user user:email'
  };

  const qs = new URLSearchParams(options);
  const authUrl = `${rootUrl}?${qs.toString()}`;

  res.json({ url: authUrl });
};

// GitHub OAuth - Handle callback
const githubCallback = async (req, res) => {
  try {
    const { code } = req.query;

    // Exchange code for access token
    const { data } = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        redirect_uri: process.env.GITHUB_REDIRECT_URI,
        code
      },
      {
        headers: { Accept: 'application/json' }
      }
    );

    const { access_token } = data;

    // Get user info from GitHub
    const { data: profile } = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    // Get user email if not public
    let email = profile.email;
    if (!email) {
      const { data: emails } = await axios.get('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      email = emails.find(e => e.primary)?.email;
    }

    if (!email) {
      throw new Error('No email found in GitHub account');
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = await User.create({
        name: profile.name || profile.login,
        email,
        avatar: profile.avatar_url,
        oauthProvider: 'github',
        oauthId: profile.id.toString()
      });
    }

    // Set cookie and get token
    const token = setTokenCookie(user, res);

    // Redirect to frontend with token in URL as backup
    const redirectUrl = new URL(process.env.CLIENT_URL || 'http://localhost:5173');
    redirectUrl.searchParams.set('token', token);
    redirectUrl.searchParams.set('auth', 'success');

    res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('GitHub OAuth Error:', error.message);
    const redirectUrl = new URL(process.env.CLIENT_URL || 'http://localhost:5173');
    redirectUrl.searchParams.set('error', 'oauth_failed');
    res.redirect(redirectUrl.toString());
  }
};

module.exports = {
  getGoogleAuthUrl,
  googleCallback,
  getGithubAuthUrl,
  githubCallback
};
