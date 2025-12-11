require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./src/config/database');
const { initializeSocket } = require('./src/config/socket');

// Import routes
const authRoutes = require('./src/routes/auth.routes');
const oauthRoutes = require('./src/routes/oauth.routes');
const marketRoutes = require('./src/routes/market.routes');
const analysisRoutes = require('./src/routes/analysis.routes');
const portfolioRoutes = require('./src/routes/portfolio.routes');
const portfolioCollectionRoutes = require('./src/routes/portfolioCollection.routes');
const newsRoutes = require('./src/routes/news.routes');
const settingsRoutes = require('./src/routes/settings.routes');
const userRoutes = require('./src/routes/user.routes');
const postRoutes = require('./src/routes/post.routes');
const commentRoutes = require('./src/routes/comment.routes');
const likeRoutes = require('./src/routes/like.routes');
const followRoutes = require('./src/routes/follow.routes');
const notificationRoutes = require('./src/routes/notification.routes');
const priceAlertRoutes = require('./src/routes/priceAlert.routes');
const adminRoutes = require('./src/routes/admin.routes');
const webhookRoutes = require('./src/routes/webhook.routes');
const subscriptionRoutes = require('./src/routes/subscription.routes');
const courseRoutes = require('./src/routes/course.routes');

// Import services
const marketDataService = require('./src/services/marketData.service');
const priceAlertService = require('./src/services/priceAlert.service');
const { shutdown: redisShutdown } = require('./src/config/redis');

const app = express();
const httpServer = http.createServer(app);

// Connect to database
connectDB();

// Initialize Socket.io
const io = initializeSocket(httpServer);

// Set Socket.io instance in market data service for real-time updates
marketDataService.setSocketIO(io);

// Middleware
app.use(helmet());

// Webhook routes MUST come before CORS and body parsing
// Stripe webhooks need raw body and don't need CORS
app.use('/api/webhooks', webhookRoutes);

app.use(cors({
  origin: process.env.CLIENT_URL, // Allow frontend URL
  credentials: true // Allow cookies to be sent
}));
app.use(morgan('dev'));

app.use(express.json({ limit: '50mb' })); // Increase limit for large requests
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Increase limit
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
app.use('/api/portfolio-collections', portfolioCollectionRoutes); // Portfolio collections routes
app.use('/api/news', newsRoutes); // News routes
app.use('/api/settings', settingsRoutes); // User settings routes
app.use('/api/users', userRoutes); // User profile routes
app.use('/api/posts', postRoutes); // Post routes
app.use('/api', commentRoutes); // Comment routes
app.use('/api', likeRoutes); // Like routes
app.use('/api', followRoutes); // Follow routes
app.use('/api', notificationRoutes); // Notification routes
app.use('/api/price-alerts', priceAlertRoutes); // Price alert routes
app.use('/api/admin', adminRoutes); // Admin routes
app.use('/api/courses', courseRoutes); // Course/Learning routes

// Public subscription routes (no auth required)
const subscriptionController = require('./src/controllers/subscription.controller');
app.get('/api/subscription/plans', subscriptionController.getPlans); // Public route for plans

app.use('/api/subscription', subscriptionRoutes); // Subscription routes

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start market data service
marketDataService.startPeriodicUpdate();

// Start price alert service (check every 5 minutes)
priceAlertService.startPriceChecking(5);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  marketDataService.stopPeriodicUpdate();
  priceAlertService.stopPriceChecking();
  await redisShutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  marketDataService.stopPeriodicUpdate();
  priceAlertService.stopPriceChecking();
  await redisShutdown();
  process.exit(0);
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io initialized`);
});
