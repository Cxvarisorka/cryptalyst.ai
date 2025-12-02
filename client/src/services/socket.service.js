import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  /**
   * Connect to Socket.io server
   */
  connect() {
    if (this.socket && this.connected) {
      console.log('Socket already connected, skipping...');
      return;
    }

    const serverUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

    console.log('Attempting to connect to Socket.io at:', serverUrl);

    // withCredentials: true will automatically send httpOnly cookies
    this.socket = io(serverUrl, {
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket.io connected successfully');
      this.connected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket.io disconnected:', reason);
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket.io connection error:', error.message);
      this.connected = false;
    });
  }

  /**
   * Disconnect from Socket.io server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  /**
   * Listen for notifications
   * @param {Function} callback - Function to call when notification is received
   */
  onNotification(callback) {
    if (!this.socket) {
      console.error('Socket not connected. Call connect() first.');
      return;
    }

    this.socket.on('notification', callback);
  }

  /**
   * Remove notification listener
   * @param {Function} callback - Function to remove
   */
  offNotification(callback) {
    if (!this.socket) {
      return;
    }

    this.socket.off('notification', callback);
  }

  /**
   * Listen for crypto price updates
   * @param {Function} callback - Function to call when crypto prices are updated
   */
  onCryptoPriceUpdate(callback) {
    if (!this.socket) {
      console.error('Socket not connected. Call connect() first.');
      return;
    }

    this.socket.on('market:crypto:update', callback);
  }

  /**
   * Remove crypto price update listener
   * @param {Function} callback - Function to remove
   */
  offCryptoPriceUpdate(callback) {
    if (!this.socket) {
      return;
    }

    this.socket.off('market:crypto:update', callback);
  }

  /**
   * Listen for stock price updates
   * @param {Function} callback - Function to call when stock prices are updated
   */
  onStockPriceUpdate(callback) {
    if (!this.socket) {
      console.error('Socket not connected. Call connect() first.');
      return;
    }

    this.socket.on('market:stock:update', callback);
  }

  /**
   * Remove stock price update listener
   * @param {Function} callback - Function to remove
   */
  offStockPriceUpdate(callback) {
    if (!this.socket) {
      return;
    }

    this.socket.off('market:stock:update', callback);
  }

  /**
   * Check if socket is connected
   */
  isConnected() {
    return this.connected;
  }
}

export default new SocketService();
