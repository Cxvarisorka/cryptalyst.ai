import api from './api';

const API_URL = '/news';

export const newsService = {
  // Get news by category
  getNews: async (category = 'all', limit = 30) => {
    try {
      const response = await api.get(`${API_URL}`, {
        params: {
          category,
          limit,
        },
      });
      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch news'
      );
    }
  },

  // Get news by specific symbols/tickers
  getNewsBySymbols: async (symbols, limit = 20) => {
    try {
      const response = await api.get(`${API_URL}/symbols`, {
        params: {
          symbols: symbols.join(','),
          limit,
        },
      });
      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch news by symbols'
      );
    }
  },

  // Search news
  searchNews: async (query, limit = 20) => {
    try {
      const response = await api.get(`${API_URL}/search`, {
        params: {
          q: query,
          limit,
        },
      });
      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to search news'
      );
    }
  },
};
