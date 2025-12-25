const logger = require('../utils/logger');

// Initialize Stripe only if API key is provided
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} else {
  logger.warn('⚠️  STRIPE_SECRET_KEY not found. Stripe features will be disabled.');
  logger.warn('   Please add STRIPE_SECRET_KEY to your .env file to enable subscriptions.');
}

// AI Usage Limits per plan
const AI_USAGE_LIMITS = {
  free: {
    dailyLimit: 2,      // 1-2 analyses per day (using max)
    monthlyLimit: 50,   // Max 50 per month
    portfolioWeight: 2  // Portfolio analysis counts as 2 credits
  },
  basic: {
    dailyLimit: 5,      // 5 analyses per day
    monthlyLimit: 150,  // Max 150 per month
    portfolioWeight: 2  // Portfolio analysis counts as 2 credits
  },
  premium: {
    dailyLimit: 40,     // 40 analyses per day
    monthlyLimit: 1000, // Max 1000 per month
    portfolioWeight: 3  // Portfolio analysis counts as 3 credits
  }
};

// Analysis types that count towards AI usage
const ANALYSIS_TYPES = {
  CRYPTO: 'crypto',
  STOCK: 'stock',
  PORTFOLIO: 'portfolio',
  SCALPING: 'scalping'
};

// Subscription plans configuration
const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free Plan',
    price: 0,
    priceId: null,
    features: [
      'Basic crypto tracking',
      'Up to 5 portfolio holdings',
      `${AI_USAGE_LIMITS.free.dailyLimit} AI analyses per day`,
      `${AI_USAGE_LIMITS.free.monthlyLimit} AI analyses per month`,
      'Basic price alerts',
      'Community features'
    ],
    aiLimits: AI_USAGE_LIMITS.free
  },
  basic: {
    name: 'Basic Plan',
    price: 10,
    priceId: process.env.STRIPE_BASIC_PRICE_ID,
    features: [
      'Access to basic crypto analysis',
      'Real-time price tracking',
      'Up to 10 portfolio holdings',
      `${AI_USAGE_LIMITS.basic.dailyLimit} AI analyses per day`,
      `${AI_USAGE_LIMITS.basic.monthlyLimit} AI analyses per month`,
      'Basic technical indicators',
      'Email support'
    ],
    aiLimits: AI_USAGE_LIMITS.basic
  },
  premium: {
    name: 'Premium Plan',
    price: 25,
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
    features: [
      'All Basic features',
      'Advanced AI-powered analysis',
      'Unlimited portfolio holdings',
      `${AI_USAGE_LIMITS.premium.dailyLimit} AI analyses per day`,
      `${AI_USAGE_LIMITS.premium.monthlyLimit} AI analyses per month`,
      'Advanced technical indicators',
      'Custom alerts and notifications',
      'Priority support',
      'Market sentiment analysis',
      'Advanced charting tools'
    ],
    aiLimits: AI_USAGE_LIMITS.premium
  }
};

// Free trial duration in days
const FREE_TRIAL_DAYS = 3;

module.exports = {
  stripe,
  SUBSCRIPTION_PLANS,
  FREE_TRIAL_DAYS,
  AI_USAGE_LIMITS,
  ANALYSIS_TYPES
};
