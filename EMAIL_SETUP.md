# Email Setup Guide for Price Alerts

This guide explains how to configure email notifications for price alerts in Cryptalyst.

## Overview

Price alerts can send notifications via:
- **In-app notifications** - Always available through the notification system
- **Email notifications** - Requires email configuration (optional)

## Email Configuration

To enable email notifications, you need to add email credentials to your `.env` file.

### Required Environment Variables

Add these to your `server/.env` file:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Using Gmail

If you're using Gmail, you'll need to create an **App Password**:

1. Go to your Google Account settings: https://myaccount.google.com/
2. Click on "Security" in the left sidebar
3. Under "How you sign in to Google", enable **2-Step Verification** (if not already enabled)
4. After enabling 2-Step Verification, return to Security settings
5. Under "How you sign in to Google", click on **App passwords**
6. Select "Mail" as the app and "Other" as the device
7. Enter "Cryptalyst" as the device name
8. Click "Generate"
9. Copy the 16-character password
10. Use this password in your `EMAIL_PASS` environment variable

### Using Other Email Providers

#### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

#### Yahoo Mail
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=465
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
```
*Note: Yahoo also requires an app password. Generate one at: https://login.yahoo.com/account/security*

#### Custom SMTP Server
```env
EMAIL_HOST=smtp.yourdomain.com
EMAIL_PORT=587  # or 465 for SSL
EMAIL_USER=your-email@yourdomain.com
EMAIL_PASS=your-password
```

## Testing Email Configuration

After configuring your email settings:

1. Restart your server: `npm run dev` (in the server directory)
2. Check the server logs for: `Email transporter initialized`
3. Create a test price alert from the frontend
4. Wait for the alert to trigger, or manually trigger it by adjusting the target price
5. Check your email inbox for the price alert notification

## Troubleshooting

### "Email transporter not configured" in logs
- Make sure you've added the email environment variables to your `.env` file
- Restart the server after adding the variables
- Verify the variables are set correctly (no extra spaces, quotes, etc.)

### Not receiving emails
- Check your spam/junk folder
- Verify your email credentials are correct
- Make sure 2-Step Verification and App Passwords are set up correctly (for Gmail)
- Check server logs for any email sending errors
- Verify your SMTP settings (host, port) are correct for your provider

### "Invalid login" or "Authentication failed" errors
- For Gmail: Make sure you're using an App Password, not your regular Gmail password
- For other providers: Verify your credentials are correct
- Check if your email provider requires App Passwords or has security settings blocking access

### Emails are delayed
- The price alert service checks prices every 5 minutes by default
- Email sending is asynchronous and may take a few seconds to arrive
- Some email providers may have rate limits or delays

## Disabling Email Notifications

If you don't want to set up email notifications:
- Email notifications are optional
- In-app notifications will still work without email configuration
- Users can disable email notifications per alert in the alert creation form
- The server will log a warning but continue to function normally without email credentials

## Security Best Practices

- Never commit your `.env` file to version control
- Use App Passwords instead of regular passwords when possible
- Rotate your email credentials periodically
- Use environment-specific credentials (different for dev/staging/production)
- Consider using a dedicated email account for sending automated emails
- Monitor your email sending limits to avoid hitting rate limits

## Price Alert Service Details

The price alert service:
- Runs every 5 minutes by default (configurable in `server.js`)
- Checks all active, non-triggered alerts
- Fetches current prices from the market data service
- Triggers alerts when conditions are met
- Sends both in-app and email notifications (if configured)
- Marks alerts as triggered to prevent duplicate notifications
- Can be manually tested using the API endpoint: `GET /api/price-alerts/:id/check`

## Email Template Customization

The email template is located in:
`server/src/services/priceAlert.service.js` in the `sendEmailNotification` method

You can customize:
- Email subject line
- HTML template design
- Colors and styling
- Additional information to include
- Footer content

## Support

If you encounter issues with email notifications:
1. Check this documentation first
2. Review server logs for error messages
3. Test your SMTP settings using an online SMTP tester
4. Verify your email provider's documentation for SMTP settings
5. Contact your email provider's support if authentication continues to fail
