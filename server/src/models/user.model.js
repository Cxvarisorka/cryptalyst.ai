const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: function() {
      return !this.oauthProvider;
    },
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  oauthProvider: {
    type: String,
    enum: ['google', 'github', null],
    default: null
  },
  oauthId: {
    type: String,
    default: null
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscription: {
    stripeCustomerId: {
      type: String,
      default: null
    },
    stripeSubscriptionId: {
      type: String,
      default: null
    },
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['trialing', 'active', 'canceled', 'past_due', 'unpaid', 'incomplete', 'incomplete_expired'],
      default: null
    },
    trialEndsAt: {
      type: Date,
      default: null
    },
    currentPeriodStart: {
      type: Date,
      default: null
    },
    currentPeriodEnd: {
      type: Date,
      default: null
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false
    }
  },
  settings: {
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'AUD', 'CAD'],
      default: 'USD'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    dateFormat: {
      type: String,
      enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
      default: 'MM/DD/YYYY'
    },
    notifications: {
      email: {
        priceAlerts: { type: Boolean, default: true },
        newsUpdates: { type: Boolean, default: true },
        portfolioUpdates: { type: Boolean, default: true },
        weeklyReport: { type: Boolean, default: false }
      },
      push: {
        priceAlerts: { type: Boolean, default: false },
        newsUpdates: { type: Boolean, default: false }
      }
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'private'
      },
      showPortfolio: { type: Boolean, default: false },
      dataSharing: { type: Boolean, default: false }
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    language: {
      type: String,
      enum: ['en', 'ka'], // en = English, ka = Georgian
      default: 'en'
    }
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
