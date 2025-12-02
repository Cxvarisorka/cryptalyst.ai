import axios from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific error codes
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          break;
        case 403:
          console.error('Access forbidden');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error('API Error:', error.response.data);
      }
    }
    return Promise.reject(error);
  }
);

// API endpoint functions
export const cryptoAPI = {
  // Get cryptocurrency list
  getCryptos: async (params = {}) => {
    const response = await api.get('/crypto/list', { params });
    return response.data;
  },

  // Get specific cryptocurrency data
  getCryptoById: async (id) => {
    const response = await api.get(`/crypto/${id}`);
    return response.data;
  },

  // Get market data
  getMarketData: async (symbol) => {
    const response = await api.get(`/crypto/market/${symbol}`);
    return response.data;
  },

  // Get AI analysis
  getAIAnalysis: async (symbol) => {
    const response = await api.get(`/ai/analysis/${symbol}`);
    return response.data;
  },
};

export const portfolioAPI = {
  // Get user portfolio
  getPortfolio: async () => {
    const response = await api.get('/portfolio');
    return response.data;
  },

  // Add asset to portfolio
  addAsset: async (assetData) => {
    const response = await api.post('/portfolio/add', assetData);
    return response.data;
  },

  // Update asset in portfolio
  updateAsset: async (assetId, assetData) => {
    const response = await api.put(`/portfolio/${assetId}`, assetData);
    return response.data;
  },

  // Remove asset from portfolio
  removeAsset: async (assetId) => {
    const response = await api.delete(`/portfolio/${assetId}`);
    return response.data;
  },
};

export const userAPI = {
  // Login
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Register
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await api.put('/user/profile', userData);
    return response.data;
  },
};

export default api;
