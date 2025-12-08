# Stripe Subscription Setup Guide

This guide will help you set up Stripe for subscription payments in your Cryptalyst application.

## Overview

The application now supports subscription-based pricing with:
- **3-day free trial** for all paid plans
- **Basic Plan**: $10/month
- **Premium Plan**: $25/month
- **Free Plan**: Forever free with limited features

## Setup Instructions

### 1. Create a Stripe Account

1. Go to [https://stripe.com](https://stripe.com) and sign up for an account
2. Complete your account setup and verification

### 2. Get Your API Keys

1. Navigate to the [Stripe Dashboard](https://dashboard.stripe.com)
2. Click on "Developers" in the left sidebar
3. Click on "API keys"
4. Copy your **Publishable key** and **Secret key**
   - For testing, use the test mode keys (starting with `pk_test_` and `sk_test_`)
   - For production, use the live mode keys (starting with `pk_live_` and `sk_live_`)

### 3. Create Subscription Products

#### Create Basic Plan ($10/month)

1. Go to [Products](https://dashboard.stripe.com/products) in your Stripe Dashboard
2. Click "Add product"
3. Fill in the details:
   - **Name**: Basic Plan
   - **Description**: Access to basic crypto analysis and tracking features
   - **Pricing**: Recurring
   - **Price**: $10.00
   - **Billing period**: Monthly
4. Click "Save product"
5. Copy the **Price ID** (starts with `price_`)

#### Create Premium Plan ($25/month)

1. Go to [Products](https://dashboard.stripe.com/products) in your Stripe Dashboard
2. Click "Add product"
3. Fill in the details:
   - **Name**: Premium Plan
   - **Description**: Advanced AI-powered analysis and unlimited features
   - **Pricing**: Recurring
   - **Price**: $25.00
   - **Billing period**: Monthly
4. Click "Save product"
5. Copy the **Price ID** (starts with `price_`)

### 4. Set Up Webhooks

Webhooks are required to handle subscription events (e.g., trial ending, payment success/failure).

#### Local Development with Stripe CLI

1. Install the Stripe CLI: [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
2. Login to Stripe CLI:
   ```bash
   stripe login
   ```
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:5000/api/webhooks/stripe
   ```
4. Copy the webhook signing secret (starts with `whsec_`)

#### Production Setup

1. Go to [Webhooks](https://dashboard.stripe.com/webhooks) in your Stripe Dashboard
2. Click "Add endpoint"
3. Enter your endpoint URL:
   ```
   https://your-domain.com/api/webhooks/stripe
   ```
4. Select the following events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `customer.subscription.trial_will_end`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. Copy the **Signing secret** (starts with `whsec_`)

### 5. Configure Environment Variables

Add the following variables to your `server/.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_BASIC_PRICE_ID=price_basic_plan_id_here
STRIPE_PREMIUM_PRICE_ID=price_premium_plan_id_here
```

Replace the placeholder values with your actual Stripe keys and price IDs.

### 6. Test the Integration

#### Test Cards

Use these test card numbers in test mode:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Require authentication**: `4000 0025 0000 3155`

Use any future expiration date, any 3-digit CVC, and any ZIP code.

#### Test Flow

1. Start your server:
   ```bash
   cd server
   npm run dev
   ```

2. Start your client:
   ```bash
   cd client
   npm run dev
   ```

3. If testing locally, start Stripe CLI webhook forwarding:
   ```bash
   stripe listen --forward-to localhost:5000/api/webhooks/stripe
   ```

4. Navigate to the pricing page: `http://localhost:3000/pricing`

5. Click "Start Free Trial" on a plan

6. Complete the checkout with a test card

7. Verify:
   - You're redirected to the success page
   - Your subscription status is updated in the database
   - You can access premium features

## Features Implemented

### Backend

1. **User Model** (`server/src/models/user.model.js`)
   - Added subscription fields to track plan, status, trial dates, and Stripe IDs

2. **Stripe Configuration** (`server/src/config/stripe.config.js`)
   - Stripe client initialization
   - Plan definitions with features
   - Free trial duration

3. **Stripe Service** (`server/src/services/stripe.service.js`)
   - Customer creation and management
   - Checkout session creation
   - Customer portal access
   - Subscription cancellation and reactivation
   - Subscription status checking

4. **Subscription Controller** (`server/src/controllers/subscription.controller.js`)
   - GET `/api/subscription/plans` - Get available plans
   - GET `/api/subscription/status` - Get current subscription status
   - POST `/api/subscription/checkout` - Create checkout session
   - POST `/api/subscription/portal` - Open customer portal
   - POST `/api/subscription/cancel` - Cancel subscription
   - POST `/api/subscription/reactivate` - Reactivate subscription

5. **Webhook Handler** (`server/src/controllers/webhook.controller.js`)
   - Handles Stripe webhook events
   - Updates subscription status in database

6. **Subscription Middleware** (`server/src/middleware/subscription.middleware.js`)
   - `requireSubscription()` - Check if user has active subscription
   - `requirePlan(minPlan)` - Check if user has specific plan level
   - `attachSubscriptionInfo()` - Add subscription info to requests

### Frontend

1. **Subscription Service** (`client/src/services/subscription.service.js`)
   - API calls for all subscription operations

2. **Pricing Page** (`client/src/pages/Pricing.jsx`)
   - Display available plans
   - Show current subscription status
   - Handle checkout flow

3. **Subscription Success Page** (`client/src/pages/SubscriptionSuccess.jsx`)
   - Confirmation page after successful subscription

4. **Routes** (`client/src/App.jsx`)
   - Added `/subscription/success` route

## Using Subscription Middleware

To protect routes that require a subscription, use the middleware in your routes:

```javascript
const { requireSubscription, requirePlan } = require('../middleware/subscription.middleware');

// Require any active subscription (basic or premium)
router.get('/premium-feature', protect, requireSubscription(['basic', 'premium']), controller);

// Require specific plan or higher
router.get('/advanced-feature', protect, requirePlan('premium'), controller);
```

## Customer Portal

Users can manage their subscriptions through the Stripe Customer Portal, which allows them to:
- Update payment methods
- View billing history
- Cancel subscriptions
- Download invoices

Access it via: POST `/api/subscription/portal`

## Troubleshooting

### Webhook Events Not Received

1. Ensure the webhook endpoint is accessible
2. Check the webhook signing secret is correct
3. Verify events are selected in Stripe Dashboard
4. Check server logs for webhook errors

### Checkout Not Working

1. Verify Stripe keys are correct
2. Check price IDs match your Stripe products
3. Ensure CLIENT_URL is set correctly in `.env`
4. Check browser console for errors

### Subscription Status Not Updating

1. Verify webhooks are working
2. Check database connection
3. Review webhook handler logs
4. Ensure user exists in database

## Going Live

Before going live:

1. Switch to live mode Stripe keys
2. Create live mode products and get their price IDs
3. Set up production webhook endpoint
4. Update environment variables with live keys
5. Test the complete flow with real cards (in small amounts)
6. Set up proper error monitoring and logging

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Subscriptions Guide](https://stripe.com/docs/billing/subscriptions/overview)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe Testing](https://stripe.com/docs/testing)

## Support

If you encounter any issues, please:
1. Check the server logs for errors
2. Verify all environment variables are set correctly
3. Test with Stripe CLI webhook forwarding
4. Review Stripe Dashboard for webhook delivery status
