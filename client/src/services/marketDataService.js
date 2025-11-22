import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Fetch cryptocurrency data from server (updates every 10s on server)
export const getCryptoData = async (limit = 5) => {
  try {
    const response = await axios.get(`${API_URL}/market/crypto`, {
      params: { limit },
      timeout: 5000
    });

    if (response.data && response.data.success && response.data.data) {
      console.log('✅ Crypto data fetched from server:', response.data.data.length, 'coins');
      console.log('📅 Last updated:', new Date(response.data.lastUpdate).toLocaleTimeString());
      return response.data.data;
    }

    throw new Error('No crypto data received from server');
  } catch (error) {
    console.error('❌ Error fetching crypto data from server:', error.message);
    console.warn('⚠️ Using mock crypto data as fallback');
    return getMockCryptoData(limit);
  }
};

// Mock crypto data as fallback
const getMockCryptoData = (limit = 5) => {
  const mockCrypto = [
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', price: 43250.00, change24h: 2.5, marketCap: 846000000000, image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png', type: 'crypto' },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', price: 2280.50, change24h: 1.8, marketCap: 274000000000, image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png', type: 'crypto' },
    { id: 'tether', symbol: 'USDT', name: 'Tether', price: 1.00, change24h: 0.01, marketCap: 91000000000, image: 'https://assets.coingecko.com/coins/images/325/large/Tether.png', type: 'crypto' },
    { id: 'binancecoin', symbol: 'BNB', name: 'BNB', price: 312.40, change24h: -0.5, marketCap: 48000000000, image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png', type: 'crypto' },
    { id: 'solana', symbol: 'SOL', name: 'Solana', price: 98.75, change24h: 3.2, marketCap: 43000000000, image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png', type: 'crypto' },
  ];

  return mockCrypto.slice(0, limit);
};

// Fetch stock data from server (updates every 10s on server)
export const getStockData = async (limit = 5) => {
  try {
    const response = await axios.get(`${API_URL}/market/stocks`, {
      params: { limit },
      timeout: 5000
    });

    if (response.data && response.data.success && response.data.data) {
      console.log('✅ Stock data fetched from server:', response.data.data.length, 'stocks');
      console.log('📅 Last updated:', new Date(response.data.lastUpdate).toLocaleTimeString());
      return response.data.data;
    }

    throw new Error('No stock data received from server');
  } catch (error) {
    console.error('❌ Error fetching stock data from server:', error.message);
    console.warn('⚠️ Using mock stock data as fallback');
    return getMockStockData(limit);
  }
};

// Mock stock data as fallback
const getMockStockData = (limit = 5) => {
  const mockStocks = [
    {
      id: 'AAPL',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 178.25,
      change24h: 2.34,
      marketCap: 2800000000000,
      type: 'stock',
      image: 'https://logo.clearbit.com/apple.com'
    },
    {
      id: 'MSFT',
      symbol: 'MSFT',
      name: 'Microsoft Corp.',
      price: 378.91,
      change24h: 1.87,
      marketCap: 2810000000000,
      type: 'stock',
      image: 'https://logo.clearbit.com/microsoft.com'
    },
    {
      id: 'GOOGL',
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      price: 141.80,
      change24h: -0.45,
      marketCap: 1780000000000,
      type: 'stock',
      image: 'https://logo.clearbit.com/google.com'
    },
    {
      id: 'AMZN',
      symbol: 'AMZN',
      name: 'Amazon.com Inc.',
      price: 151.94,
      change24h: 1.23,
      marketCap: 1570000000000,
      type: 'stock',
      image: 'https://logo.clearbit.com/amazon.com'
    },
    {
      id: 'TSLA',
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      price: 242.84,
      change24h: -2.15,
      marketCap: 771000000000,
      type: 'stock',
      image: 'https://logo.clearbit.com/tesla.com'
    },
    {
      id: 'META',
      symbol: 'META',
      name: 'Meta Platforms',
      price: 484.03,
      change24h: 3.12,
      marketCap: 1230000000000,
      type: 'stock',
      image: 'https://logo.clearbit.com/meta.com'
    },
    {
      id: 'NVDA',
      symbol: 'NVDA',
      name: 'NVIDIA Corp.',
      price: 495.22,
      change24h: 4.67,
      marketCap: 1220000000000,
      type: 'stock',
      image: 'https://logo.clearbit.com/nvidia.com'
    },
  ];

  return mockStocks.slice(0, limit);
};

// Combined market data - fetch all from server
export const getMarketData = async () => {
  try {
    // Try to get all data from server first
    const response = await axios.get(`${API_URL}/market/all`, {
      timeout: 5000
    });

    if (response.data && response.data.success && response.data.data) {
      console.log('✅ All market data fetched from server');
      console.log('📅 Last updated:', new Date(response.data.lastUpdate).toLocaleTimeString());
      return response.data.data;
    }

    // Fallback to individual fetches
    const [cryptoData, stockData] = await Promise.all([
      getCryptoData(5),
      getStockData(5)
    ]);

    return {
      crypto: cryptoData,
      stocks: stockData
    };
  } catch (error) {
    console.error('❌ Error fetching market data from server:', error.message);

    // Final fallback: try individual fetches
    try {
      const [cryptoData, stockData] = await Promise.all([
        getCryptoData(5),
        getStockData(5)
      ]);

      return {
        crypto: cryptoData,
        stocks: stockData
      };
    } catch (fallbackError) {
      console.error('Error fetching market data:', fallbackError);
      return {
        crypto: getMockCryptoData(5),
        stocks: getMockStockData(5)
      };
    }
  }
};

/**
 * Get single cryptocurrency by ID
 * @param {string} id - Cryptocurrency ID (e.g., 'bitcoin')
 * @returns {Promise} Cryptocurrency data
 */
export const getCryptoById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/market/crypto/${id}`, {
      timeout: 10000
    });

    if (response.data && response.data.success) {
      console.log(`✅ Crypto data fetched for ${id}`);
      return response.data.data;
    }

    throw new Error('Failed to get crypto data');
  } catch (error) {
    console.error(`❌ Error fetching crypto ${id}:`, error.message);
    throw error;
  }
};

/**
 * Get single stock by symbol
 * @param {string} symbol - Stock symbol (e.g., 'AAPL')
 * @returns {Promise} Stock data
 */
export const getStockBySymbol = async (symbol) => {
  try {
    const response = await axios.get(`${API_URL}/market/stock/${symbol}`, {
      timeout: 10000
    });

    if (response.data && response.data.success) {
      console.log(`✅ Stock data fetched for ${symbol}`);
      return response.data.data;
    }

    throw new Error('Failed to get stock data');
  } catch (error) {
    console.error(`❌ Error fetching stock ${symbol}:`, error.message);
    throw error;
  }
};

/**
 * Search for cryptocurrencies globally
 * @param {string} query - Search query
 * @returns {Promise} Array of matching cryptocurrencies
 */
export const searchCrypto = async (query) => {
  try {
    const response = await axios.get(`${API_URL}/market/crypto/search`, {
      params: { q: query },
      timeout: 15000
    });

    if (response.data && response.data.success) {
      console.log(`✅ Found ${response.data.count} crypto results for "${query}"`);
      return response.data.data;
    }

    return [];
  } catch (error) {
    console.error(`❌ Error searching crypto "${query}":`, error.message);
    return [];
  }
};

/**
 * Search for stocks globally
 * @param {string} query - Search query
 * @returns {Promise} Array of matching stocks
 */
export const searchStocks = async (query) => {
  try {
    const response = await axios.get(`${API_URL}/market/stocks/search`, {
      params: { q: query },
      timeout: 15000
    });

    if (response.data && response.data.success) {
      console.log(`✅ Found ${response.data.count} stock results for "${query}"`);
      return response.data.data;
    }

    return [];
  } catch (error) {
    console.error(`❌ Error searching stocks "${query}":`, error.message);
    return [];
  }
};
