# Authentication Setup Guide

This server includes a complete authentication system with JWT tokens, cookies, and OAuth support.

## Features

- Email/Password signup and login
- JWT token authentication with HTTP-only cookies
- Google OAuth integration
- GitHub OAuth integration
- Protected routes with middleware
- Admin role support

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
# Required
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret_key_here

# Optional - for OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/oauth/google/callback

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:5000/api/oauth/github/callback

CLIENT_URL=http://localhost:3000
```

## API Endpoints

### Authentication Routes

**POST /api/auth/signup**
- Sign up with email and password
- Body: `{ name, email, password }`
- Returns: User data and sets auth cookie

**POST /api/auth/login**
- Login with email and password
- Body: `{ email, password }`
- Returns: User data and sets auth cookie

**POST /api/auth/logout**
- Logout user
- Clears auth cookie

**GET /api/auth/me**
- Get current logged in user
- Requires: Authentication (cookie)
- Returns: Current user data

### OAuth Routes

**GET /api/oauth/google**
- Get Google OAuth authorization URL
- Returns: `{ url: "google_auth_url" }`

**GET /api/oauth/google/callback**
- Google OAuth callback (used by Google)
- Redirects to frontend after login

**GET /api/oauth/github**
- Get GitHub OAuth authorization URL
- Returns: `{ url: "github_auth_url" }`

**GET /api/oauth/github/callback**
- GitHub OAuth callback (used by GitHub)
- Redirects to frontend after login

## Using Protected Routes

To protect a route, use the `protect` middleware:

```javascript
const { protect, adminOnly } = require('./src/middleware/authMiddleware');

// Protect a route - requires login
router.get('/profile', protect, (req, res) => {
  // req.user contains the logged in user
  res.json({ user: req.user });
});

// Admin only route
router.delete('/users/:id', protect, adminOnly, (req, res) => {
  // Only admins can access this
});
```

## How OAuth Works

1. Frontend calls `/api/oauth/google` to get auth URL
2. Frontend redirects user to that URL
3. User logs in with Google
4. Google redirects back to `/api/oauth/google/callback`
5. Server creates/finds user and sets auth cookie
6. Server redirects user to frontend

## Setting up OAuth

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add redirect URI: `http://localhost:5000/api/oauth/google/callback`
6. Copy Client ID and Secret to `.env`

### GitHub OAuth
1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Set callback URL: `http://localhost:5000/api/oauth/github/callback`
4. Copy Client ID and Secret to `.env`

## Security Features

- Passwords are hashed with bcrypt
- JWT tokens stored in HTTP-only cookies (cannot be accessed by JavaScript)
- CSRF protection with SameSite cookies
- Secure cookies in production (HTTPS only)
- Token expiration (7 days)
- User role-based access control

## File Structure

```
src/
├── models/
│   └── User.js              # User database schema
├── controllers/
│   ├── authController.js    # Signup, login, logout functions
│   └── oauthController.js   # Google and GitHub OAuth
├── middleware/
│   └── authMiddleware.js    # Protect routes and check admin
├── routes/
│   ├── authRoutes.js        # Auth API routes
│   └── oauthRoutes.js       # OAuth API routes
├── utils/
│   └── tokenHelper.js       # JWT token generation and cookies
└── config/
    └── database.js          # MongoDB connection
```

## Testing with Postman/Thunder Client

1. **Signup**: POST to `http://localhost:5000/api/auth/signup`
2. **Login**: POST to `http://localhost:5000/api/auth/login`
3. **Get User**: GET to `http://localhost:5000/api/auth/me` (cookie sent automatically)
4. **Logout**: POST to `http://localhost:5000/api/auth/logout`

Make sure to enable cookies in your API client!
