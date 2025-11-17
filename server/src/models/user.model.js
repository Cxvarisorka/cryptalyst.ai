const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User schema - defines structure of user data in database
const userSchema = new mongoose.Schema({
  // User's name
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },

  // User's email - must be unique
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },

  // Password - only required for local signup (not OAuth)
  password: {
    type: String,
    required: function() {
      // Password only required if not using OAuth
      return !this.oauthProvider;
    },
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password in queries by default
  },

  // OAuth provider info (google, github, etc.)
  oauthProvider: {
    type: String,
    enum: ['google', 'github', null],
    default: null
  },

  // OAuth provider's user ID
  oauthId: {
    type: String,
    default: null
  },

  // User's profile picture
  avatar: {
    type: String,
    default: null
  },

  // User role for permissions
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },

  // Account status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt
});

// Hash password before saving to database
userSchema.pre('save', async function(next) {
  // Only hash password if it was modified
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  // Generate salt and hash password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed password
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to get user data without sensitive info
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
