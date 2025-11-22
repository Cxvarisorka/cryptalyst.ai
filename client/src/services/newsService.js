import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Get news for a cryptocurrency
 * @param {string} symbol - Crypto symbol (e.g., 'BTC', 'ETH')
 * @param {number} limit - Number of articles to fetch
 * @returns {Promise<Array>} Array of news articles
 */
export const getCryptoNews = async (symbol, limit = 10) => {
  try {
    const response = await axios.get(`${API_URL}/news/crypto/${symbol}`, {
      params: { limit },
      timeout: 10000
    });

    if (response.data && response.data.success) {
      console.log(`✅ Fetched ${response.data.count} news articles for ${symbol}`);
      return response.data.data;
    }

    return [];
  } catch (error) {
    console.error(`❌ Error fetching crypto news for ${symbol}:`, error.message);
    return [];
  }
};

/**
 * Get news for a stock
 * @param {string} symbol - Stock symbol (e.g., 'AAPL', 'TSLA')
 * @param {string} companyName - Company name for better search results
 * @param {number} limit - Number of articles to fetch
 * @returns {Promise<Array>} Array of news articles
 */
export const getStockNews = async (symbol, companyName = '', limit = 10) => {
  try {
    const response = await axios.get(`${API_URL}/news/stock/${symbol}`, {
      params: { companyName, limit },
      timeout: 10000
    });

    if (response.data && response.data.success) {
      console.log(`✅ Fetched ${response.data.count} news articles for ${symbol}`);
      return response.data.data;
    }

    return [];
  } catch (error) {
    console.error(`❌ Error fetching stock news for ${symbol}:`, error.message);
    return [];
  }
};
