# OAuth Setup Guide

This guide will help you set up Google and GitHub OAuth authentication for Cryptalyst.ai.

## Prerequisites

- A Google Cloud Platform account
- A GitHub account
- Your application running locally or deployed

## Google OAuth Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API for your project

### 2. Create OAuth Credentials

1. Navigate to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Configure the OAuth consent screen if prompted:
   - User Type: External
   - App name: Cryptalyst.ai
   - User support email: Your email
   - Developer contact: Your email
4. For Application type, select **Web application**
5. Add authorized redirect URIs:
   - Development: `http://localhost:5000/api/oauth/google/callback`
   - Production: `https://yourdomain.com/api/oauth/google/callback`
6. Click **Create**
7. Copy the **Client ID** and **Client Secret**

### 3. Add to Environment Variables

Add these to your `server/.env` file:

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5000/api/oauth/google/callback
```

## GitHub OAuth Setup

### 1. Create a GitHub OAuth App

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click **OAuth Apps** > **New OAuth App**
3. Fill in the application details:
   - Application name: Cryptalyst.ai
   - Homepage URL: `http://localhost:3000` (development) or your production URL
   - Authorization callback URL: `http://localhost:5000/api/oauth/github/callback`
4. Click **Register application**

### 2. Generate Client Secret

1. On your OAuth App page, click **Generate a new client secret**
2. Copy the **Client ID** and **Client Secret**

### 3. Add to Environment Variables

Add these to your `server/.env` file:

```env
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
GITHUB_REDIRECT_URI=http://localhost:5000/api/oauth/github/callback
```

## Client URL Configuration

Make sure to set the client URL in your `server/.env`:

```env
CLIENT_URL=http://localhost:3000
```

For production, update this to your production frontend URL.

## Testing OAuth

1. Start your backend server:
   ```bash
   cd server
   npm start
   ```

2. Start your frontend:
   ```bash
   cd client
   npm run dev
   ```

3. Navigate to the signup or signin page
4. Click "Continue with Google" or "Continue with GitHub"
5. You should be redirected to the OAuth provider's authorization page
6. After authorization, you'll be redirected back to your application and logged in

## Production Deployment

When deploying to production:

1. Update the redirect URIs in your Google Cloud Console and GitHub OAuth App settings
2. Update the environment variables:
   - `GOOGLE_REDIRECT_URI` to your production API URL
   - `GITHUB_REDIRECT_URI` to your production API URL
   - `CLIENT_URL` to your production frontend URL
3. Ensure HTTPS is enabled (OAuth providers require HTTPS for production)

## Troubleshooting

### "Redirect URI mismatch" Error

- Make sure the redirect URI in your OAuth provider settings exactly matches the one in your `.env` file
- Check that you're using the correct protocol (http/https)
- Verify the port number matches

### "Invalid Client" Error

- Double-check your Client ID and Client Secret
- Make sure there are no extra spaces or quotes in your `.env` file

### OAuth Works in Development but Not Production

- Verify all environment variables are set in your production environment
- Ensure redirect URIs are updated for production URLs
- Check that HTTPS is properly configured

## Security Notes

- Never commit your `.env` file to version control
- Keep your client secrets secure
- Use HTTPS in production
- Regularly rotate your OAuth credentials
- Review OAuth scopes to request only necessary permissions
