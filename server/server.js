require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./src/config/database');

// Import routes
const authRoutes = require('./src/routes/auth.routes');
const oauthRoutes = require('./src/routes/oauth.routes');
const marketRoutes = require('./src/routes/market.routes');
const analysisRoutes = require('./src/routes/analysis.routes');
const portfolioRoutes = require('./src/routes/portfolio.routes');
const newsRoutes = require('./src/routes/news.routes');
const settingsRoutes = require('./src/routes/settings.routes');

// Import services
const marketDataService = require('./src/services/marketData.service');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL, // Allow frontend URL
  credentials: true // Allow cookies to be sent
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parse cookies from requests

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Cryptalyst API' });
});

// API routes
app.use('/api/auth', authRoutes); // Authentication routes
app.use('/api/oauth', oauthRoutes); // OAuth routes
app.use('/api/market', marketRoutes); // Market data routes
app.use('/api/analysis', analysisRoutes); // Analysis routes (technical & price history)
app.use('/api/portfolio', portfolioRoutes); // Portfolio routes
app.use('/api/news', newsRoutes); // News routes
app.use('/api/settings', settingsRoutes); // User settings routes

// Start market data service
marketDataService.startPeriodicUpdate();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  marketDataService.stopPeriodicUpdate();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  marketDataService.stopPeriodicUpdate();
  process.exit(0);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
