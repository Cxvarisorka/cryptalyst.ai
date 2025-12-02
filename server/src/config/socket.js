const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const notificationService = require('../services/notification.service');

/**
 * Initialize Socket.io server
 * @param {Object} httpServer - HTTP server instance
 * @returns {Object} Socket.io instance
 */
function initializeSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  // Authentication middleware for Socket.io
  io.use((socket, next) => {
    try {
      // Try to get token from cookies first (httpOnly cookie)
      let token = null;

      if (socket.handshake.headers.cookie) {
        const cookies = cookie.parse(socket.handshake.headers.cookie);
        token = cookies.token;
      }

      // Fallback to auth header if cookie not found
      if (!token && socket.handshake.auth.token) {
        token = socket.handshake.auth.token;
      }

      if (!token) {
        console.error('Socket auth failed: No token provided');
        return next(new Error('Authentication error: No token provided'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      console.log(`Socket authenticated for user: ${socket.userId}`);
      next();
    } catch (error) {
      console.error('Socket authentication error:', error.message);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Handle socket connections
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user to their own room (for targeted notifications)
    socket.join(socket.userId);

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Set Socket.io instance in notification service
  notificationService.setSocketIO(io);

  return io;
}

module.exports = { initializeSocket };
