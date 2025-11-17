/**
 * Application constants and configuration
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 10000,
};

// Application Routes
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  ABOUT: '/about',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
};

// LocalStorage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
  THEME: 'theme',
  PORTFOLIO: 'portfolio',
};

// Cryptocurrency symbols
export const CRYPTO_SYMBOLS = {
  BITCOIN: 'BTC',
  ETHEREUM: 'ETH',
  CARDANO: 'ADA',
  SOLANA: 'SOL',
  POLKADOT: 'DOT',
  CHAINLINK: 'LINK',
};

// Chart time intervals
export const TIME_INTERVALS = {
  '1H': '1h',
  '24H': '24h',
  '7D': '7d',
  '30D': '30d',
  '1Y': '1y',
  ALL: 'all',
};

// Theme options
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

// Toast notification duration (ms)
export const TOAST_DURATION = 5000;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// API request status
export const REQUEST_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};
