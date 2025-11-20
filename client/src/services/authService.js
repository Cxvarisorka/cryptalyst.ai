import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with credentials
// Cookies are automatically sent with every request (withCredentials: true)
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Automatically send httpOnly cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// NO request interceptor - tokens are in httpOnly cookies, not localStorage
// NO Authorization header needed - server reads token from cookie automatically

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

    // Token is automatically set in httpOnly cookie by server
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

    // Token is automatically set in httpOnly cookie by server
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

    // Cookie is automatically cleared by server
    console.log('✅ Logout successful');
    return response.data;
  } catch (error) {
    console.error('❌ Logout error:', error.response?.data || error.message);
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
};
