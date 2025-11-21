import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Get technical analysis for a cryptocurrency
 * @param {string} id - Cryptocurrency ID
 * @returns {Promise} Technical analysis data
 */
export const getCryptoAnalysis = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/analysis/crypto/${id}`, {
      timeout: 5000
    });

    if (response.data && response.data.success) {
      return response.data.data;
    }

    throw new Error('Failed to get crypto analysis');
  } catch (error) {
    console.error('Error fetching crypto analysis:', error);
    throw error;
  }
};

/**
 * Get technical analysis for a stock
 * @param {string} symbol - Stock symbol
 * @returns {Promise} Technical analysis data
 */
export const getStockAnalysis = async (symbol) => {
  try {
    const response = await axios.get(`${API_URL}/analysis/stock/${symbol}`, {
      timeout: 5000
    });

    if (response.data && response.data.success) {
      return response.data.data;
    }

    throw new Error('Failed to get stock analysis');
  } catch (error) {
    console.error('Error fetching stock analysis:', error);
    throw error;
  }
};

/**
 * Get price history for an asset
 * @param {string} type - Asset type ('crypto' or 'stock')
 * @param {string} id - Asset ID or symbol
 * @param {string} timeframe - Timeframe ('24H', '7D', '1M', '1Y')
 * @returns {Promise} Price history data
 */
export const getPriceHistory = async (type, id, timeframe = '1M') => {
  try {
    const response = await axios.get(`${API_URL}/analysis/price-history/${type}/${id}`, {
      params: { timeframe },
      timeout: 5000
    });

    if (response.data && response.data.success) {
      return response.data.data;
    }

    throw new Error('Failed to get price history');
  } catch (error) {
    console.error('Error fetching price history:', error);
    throw error;
  }
};

/**
 * Get complete analysis (asset + technical + price history)
 * @param {string} type - Asset type ('crypto' or 'stock')
 * @param {string} id - Asset ID or symbol
 * @param {string} timeframe - Timeframe for price history
 * @returns {Promise} Complete analysis data
 */
export const getCompleteAnalysis = async (type, id, timeframe = '1M') => {
  try {
    const response = await axios.get(`${API_URL}/analysis/complete/${type}/${id}`, {
      params: { timeframe },
      timeout: 5000
    });

    if (response.data && response.data.success) {
      return response.data.data;
    }

    throw new Error('Failed to get complete analysis');
  } catch (error) {
    console.error('Error fetching complete analysis:', error);
    throw error;
  }
};
