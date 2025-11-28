import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Get auth token from cookie or localStorage
const getAuthToken = () => {
  // Try to get from cookie first
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'token') {
      return value;
    }
  }
  // Fallback to localStorage if needed
  return localStorage.getItem('token');
};

// Create axios instance with auth interceptor
const apiClient = axios.create({
  baseURL: `${API_URL}/portfolio`,
  withCredentials: true, // Send cookies with requests
  timeout: 10000
});

// Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Get all portfolio items for the authenticated user
 * @param {string} collectionId - Optional collection ID to filter by
 * @returns {Promise<Array>} Array of portfolio items with current market data
 */
export const getPortfolio = async (collectionId) => {
  try {
    const params = collectionId ? { collection: collectionId } : {};
    const response = await apiClient.get('/', { params });

    if (response.data && response.data.success) {
      console.log(`✅ Portfolio fetched: ${response.data.count} items`);
      return response.data.data;
    }

    throw new Error('Failed to fetch portfolio');
  } catch (error) {
    console.error('❌ Error fetching portfolio:', error.message);

    // Return empty array instead of throwing to allow graceful handling
    if (error.response?.status === 401) {
      console.warn('⚠️ User not authenticated');
    }

    return [];
  }
};

/**
 * Add an asset to the portfolio
 * @param {Object} asset - Asset data
 * @param {string} asset.id - Asset ID (crypto id or stock symbol)
 * @param {string} asset.type - Asset type ('crypto' or 'stock')
 * @param {number} asset.quantity - Quantity to add (default: 1)
 * @param {number} asset.price - Current price (stored as purchase price)
 * @param {string} asset.symbol - Asset symbol
 * @param {string} asset.name - Asset name
 * @param {string} asset.image - Asset image URL
 * @param {string} asset.collectionId - Optional collection ID
 * @returns {Promise<Object>} Added portfolio item
 */
export const addAsset = async (asset) => {
  try {
    const response = await apiClient.post('/', {
      assetId: asset.id,
      assetType: asset.type,
      quantity: asset.quantity || 1,
      purchasePrice: asset.price,
      symbol: asset.symbol,
      name: asset.name,
      image: asset.image,
      collection: asset.collectionId
    });

    if (response.data && response.data.success) {
      console.log(`✅ Asset added to portfolio: ${asset.symbol}`);
      return response.data.data;
    }

    throw new Error('Failed to add asset to portfolio');
  } catch (error) {
    console.error(`❌ Error adding asset ${asset.symbol}:`, error.message);

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    throw error;
  }
};

/**
 * Update asset quantity or purchase price
 * @param {string} id - Portfolio item ID
 * @param {Object} updates - Fields to update
 * @param {number} updates.quantity - New quantity
 * @param {number} updates.purchasePrice - New purchase price
 * @returns {Promise<Object>} Updated portfolio item
 */
export const updateAsset = async (id, updates) => {
  try {
    const response = await apiClient.put(`/${id}`, updates);

    if (response.data && response.data.success) {
      console.log(`✅ Portfolio item updated: ${id}`);
      return response.data.data;
    }

    throw new Error('Failed to update portfolio item');
  } catch (error) {
    console.error(`❌ Error updating portfolio item ${id}:`, error.message);
    throw error;
  }
};

/**
 * Remove an asset from the portfolio
 * @param {string} id - Portfolio item ID
 * @returns {Promise<Object>} Removed portfolio item
 */
export const removeAsset = async (id) => {
  try {
    const response = await apiClient.delete(`/${id}`);

    if (response.data && response.data.success) {
      console.log(`✅ Asset removed from portfolio`);
      return response.data.data;
    }

    throw new Error('Failed to remove asset from portfolio');
  } catch (error) {
    console.error(`❌ Error removing portfolio item ${id}:`, error.message);
    throw error;
  }
};

/**
 * Clear entire portfolio
 * @returns {Promise<Object>} Result of clear operation
 */
export const clearPortfolio = async () => {
  try {
    const response = await apiClient.delete('/');

    if (response.data && response.data.success) {
      console.log(`✅ Portfolio cleared: ${response.data.deletedCount} items deleted`);
      return response.data;
    }

    throw new Error('Failed to clear portfolio');
  } catch (error) {
    console.error('❌ Error clearing portfolio:', error.message);
    throw error;
  }
};
