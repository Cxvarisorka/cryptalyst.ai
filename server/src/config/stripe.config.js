// Initialize Stripe only if API key is provided
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} else {
  console.warn('⚠️  STRIPE_SECRET_KEY not found. Stripe features will be disabled.');
  console.warn('   Please add STRIPE_SECRET_KEY to your .env file to enable subscriptions.');
}

// Subscription plans configuration
const SUBSCRIPTION_PLANS = {
  basic: {
    name: 'Basic Plan',
    price: 10,
    priceId: process.env.STRIPE_BASIC_PRICE_ID,
    features: [
      'Access to basic crypto analysis',
      'Real-time price tracking',
      'Up to 10 portfolio holdings',
      'Basic technical indicators',
      'Email support'
    ]
  },
  premium: {
    name: 'Premium Plan',
    price: 25,
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
    features: [
      'All Basic features',
      'Advanced AI-powered analysis',
      'Unlimited portfolio holdings',
      'Advanced technical indicators',
      'Custom alerts and notifications',
      'Priority support',
      'Market sentiment analysis',
      'Advanced charting tools'
    ]
  }
};

// Free trial duration in days
const FREE_TRIAL_DAYS = 3;

module.exports = {
  stripe,
  SUBSCRIPTION_PLANS,
  FREE_TRIAL_DAYS
};
