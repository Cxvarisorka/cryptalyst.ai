import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with credentials
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important: allows cookies to be sent
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Store authentication token in localStorage
 * @param {string} token - JWT token
 */
export const setToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  }
};

/**
 * Get authentication token from localStorage
 * @returns {string|null} JWT token or null
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Remove authentication token from localStorage
 */
export const removeToken = () => {
  localStorage.removeItem('token');
};

/**
 * Handle OAuth callback - extract and store token from URL
 * @returns {boolean} True if token was found and stored
 */
export const handleOAuthCallback = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const authStatus = urlParams.get('auth');

  if (token && authStatus === 'success') {
    setToken(token);
    console.log('✅ OAuth token stored successfully');

    // Clean URL by removing query parameters
    window.history.replaceState({}, document.title, window.location.pathname);
    return true;
  }

  return false;
};

/**
 * Sign up a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.name - User's full name
 * @param {string} userData.email - User's email
 * @param {string} userData.password - User's password
 * @returns {Promise<Object>} Response with user data
 */
export const signup = async (userData) => {
  try {
    const response = await api.post('/auth/signup', userData);

    // Store token if provided in response
    if (response.data.token) {
      setToken(response.data.token);
    }

    console.log('✅ Signup successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Signup error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Network error. Please try again.' };
  }
};

/**
 * Login user
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User's email
 * @param {string} credentials.password - User's password
 * @returns {Promise<Object>} Response with user data
 */
export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);

    // Store token if provided in response
    if (response.data.token) {
      setToken(response.data.token);
    }

    console.log('✅ Login successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Login error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Network error. Please try again.' };
  }
};

/**
 * Logout user
 * @returns {Promise<Object>} Response confirming logout
 */
export const logout = async () => {
  try {
    const response = await api.post('/auth/logout');

    // Remove token from localStorage
    removeToken();

    console.log('✅ Logout successful');
    return response.data;
  } catch (error) {
    console.error('❌ Logout error:', error.response?.data || error.message);

    // Remove token even if logout fails
    removeToken();

    throw error.response?.data || { message: 'Network error. Please try again.' };
  }
};

/**
 * Get current logged in user
 * @returns {Promise<Object>} Response with current user data
 */
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    console.log('✅ Current user fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Get current user error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Not authenticated' };
  }
};

export default {
  signup,
  login,
  logout,
  getCurrentUser,
  setToken,
  getToken,
  removeToken,
  handleOAuthCallback,
};
