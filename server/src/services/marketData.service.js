const axios = require('axios');

class MarketDataService {
  constructor() {
    this.cryptoCache = [];
    this.stockCache = [];
    this.lastCryptoUpdate = null;
    this.lastStockUpdate = null;
    this.updateInterval = 10000; // 10 seconds
    this.isUpdatingCrypto = false;
    this.isUpdatingStocks = false;

    // CoinGecko API configuration
    this.coinGeckoAPI = 'https://api.coingecko.com/api/v3';
    this.coinGeckoApiKey = process.env.COINGECKO_API_KEY;

    // Finnhub API configuration
    this.finnhubAPI = 'https://finnhub.io/api/v1';
    this.finnhubApiKey = process.env.FINNHUB_API_KEY;
    this.stockSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'TSMC', 'V'];
  }

  /**
   * Start the periodic data update
   */
  startPeriodicUpdate() {
    console.log('📊 Starting market data service with 10s update interval...');

    // Initial fetch for both crypto and stocks
    this.updateCryptoData();
    this.updateStockData();

    // Set up interval for updates
    this.cryptoIntervalId = setInterval(() => {
      this.updateCryptoData();
    }, this.updateInterval);

    this.stockIntervalId = setInterval(() => {
      this.updateStockData();
    }, this.updateInterval);
  }

  /**
   * Stop the periodic update
   */
  stopPeriodicUpdate() {
    if (this.cryptoIntervalId) {
      clearInterval(this.cryptoIntervalId);
    }
    if (this.stockIntervalId) {
      clearInterval(this.stockIntervalId);
    }
    console.log('📊 Market data service stopped');
  }

  /**
   * Fetch and cache crypto data from CoinGecko
   */
  async updateCryptoData() {
    if (this.isUpdatingCrypto) {
      console.log('⏳ Crypto update already in progress, skipping...');
      return;
    }

    this.isUpdatingCrypto = true;

    try {
      const headers = {};
      if (this.coinGeckoApiKey) {
        headers['x-cg-demo-api-key'] = this.coinGeckoApiKey;
      }

      const response = await axios.get(`${this.coinGeckoAPI}/coins/markets`, {
        headers,
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 10,
          page: 1,
          sparkline: false,
          price_change_percentage: '24h'
        },
        timeout: 5000
      });

      if (response.data && response.data.length > 0) {
        this.cryptoCache = response.data.map(coin => ({
          id: coin.id,
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          price: coin.current_price,
          change24h: coin.price_change_percentage_24h,
          marketCap: coin.market_cap,
          volume24h: coin.total_volume,
          image: coin.image,
          type: 'crypto'
        }));

        this.lastCryptoUpdate = new Date();
        console.log(`✅ Crypto data updated: ${this.cryptoCache.length} coins at ${this.lastCryptoUpdate.toLocaleTimeString()}`);
      } else {
        console.warn('⚠️ No crypto data received from CoinGecko');
      }
    } catch (error) {
      console.error('❌ Error updating crypto data:', error.message);

      // If cache is empty, use fallback data
      if (this.cryptoCache.length === 0) {
        console.log('📦 Using fallback crypto data');
        this.cryptoCache = this.getFallbackCryptoData();
        this.lastCryptoUpdate = new Date();
      }
    } finally {
      this.isUpdatingCrypto = false;
    }
  }

  /**
   * Fetch and cache stock data from Finnhub
   */
  async updateStockData() {
    if (this.isUpdatingStocks) {
      console.log('⏳ Stock update already in progress, skipping...');
      return;
    }

    this.isUpdatingStocks = true;

    try {
      const stockPromises = this.stockSymbols.map(async (symbol) => {
        try {
          const [quoteResponse, profileResponse] = await Promise.all([
            axios.get(`${this.finnhubAPI}/quote`, {
              params: { symbol, token: this.finnhubApiKey },
              timeout: 5000
            }),
            axios.get(`${this.finnhubAPI}/stock/profile2`, {
              params: { symbol, token: this.finnhubApiKey },
              timeout: 5000
            })
          ]);

          const quote = quoteResponse.data;
          const profile = profileResponse.data;

          if (quote.c && quote.c > 0) {
            return {
              id: symbol,
              symbol: symbol,
              name: profile.name || symbol,
              price: quote.c,
              change24h: quote.dp,
              marketCap: profile.marketCapitalization ? profile.marketCapitalization * 1000000 : 0,
              volume24h: quote.v || 0,
              type: 'stock'
            };
          }
          return null;
        } catch (error) {
          console.error(`❌ Error fetching ${symbol}:`, error.message);
          return null;
        }
      });

      const results = await Promise.all(stockPromises);
      const validResults = results.filter(stock => stock !== null && stock.price > 0);

      if (validResults.length > 0) {
        this.stockCache = validResults;
        this.lastStockUpdate = new Date();
        console.log(`✅ Stock data updated: ${this.stockCache.length} stocks at ${this.lastStockUpdate.toLocaleTimeString()}`);
      } else {
        console.warn('⚠️ No valid stock data from Finnhub');

        // If cache is empty, use fallback data
        if (this.stockCache.length === 0) {
          console.log('📦 Using fallback stock data');
          this.stockCache = this.getFallbackStockData();
          this.lastStockUpdate = new Date();
        }
      }
    } catch (error) {
      console.error('❌ Error updating stock data:', error.message);

      // If cache is empty, use fallback data
      if (this.stockCache.length === 0) {
        console.log('📦 Using fallback stock data');
        this.stockCache = this.getFallbackStockData();
        this.lastStockUpdate = new Date();
      }
    } finally {
      this.isUpdatingStocks = false;
    }
  }

  /**
   * Get cached crypto data
   */
  getCryptoData(limit = 5) {
    return {
      data: this.cryptoCache.slice(0, limit),
      lastUpdate: this.lastCryptoUpdate,
      cached: true
    };
  }

  /**
   * Get cached stock data
   */
  getStockData(limit = 5) {
    return {
      data: this.stockCache.slice(0, limit),
      lastUpdate: this.lastStockUpdate,
      cached: true
    };
  }

  /**
   * Get all cached market data
   */
  getAllMarketData() {
    return {
      crypto: this.cryptoCache.slice(0, 5),
      stocks: this.stockCache.slice(0, 5),
      lastUpdate: this.lastCryptoUpdate || this.lastStockUpdate
    };
  }

  /**
   * Fallback crypto data when API is unavailable
   */
  getFallbackCryptoData() {
    return [
      { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', price: 43250.00, change24h: 2.5, marketCap: 846000000000, volume24h: 25000000000, image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png', type: 'crypto' },
      { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', price: 2280.50, change24h: 1.8, marketCap: 274000000000, volume24h: 12000000000, image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png', type: 'crypto' },
      { id: 'tether', symbol: 'USDT', name: 'Tether', price: 1.00, change24h: 0.01, marketCap: 91000000000, volume24h: 45000000000, image: 'https://assets.coingecko.com/coins/images/325/large/Tether.png', type: 'crypto' },
      { id: 'binancecoin', symbol: 'BNB', name: 'BNB', price: 312.40, change24h: -0.5, marketCap: 48000000000, volume24h: 1500000000, image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png', type: 'crypto' },
      { id: 'solana', symbol: 'SOL', name: 'Solana', price: 98.75, change24h: 3.2, marketCap: 43000000000, volume24h: 2000000000, image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png', type: 'crypto' },
    ];
  }

  /**
   * Fallback stock data when API is unavailable
   */
  getFallbackStockData() {
    return [
      { id: 'AAPL', symbol: 'AAPL', name: 'Apple Inc.', price: 178.25, change24h: 2.34, marketCap: 2800000000000, volume24h: 50000000, type: 'stock' },
      { id: 'MSFT', symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.91, change24h: 1.87, marketCap: 2810000000000, volume24h: 22000000, type: 'stock' },
      { id: 'GOOGL', symbol: 'GOOGL', name: 'Alphabet Inc.', price: 141.80, change24h: -0.45, marketCap: 1780000000000, volume24h: 18000000, type: 'stock' },
      { id: 'AMZN', symbol: 'AMZN', name: 'Amazon.com Inc.', price: 151.94, change24h: 1.23, marketCap: 1570000000000, volume24h: 35000000, type: 'stock' },
      { id: 'TSLA', symbol: 'TSLA', name: 'Tesla Inc.', price: 242.84, change24h: -2.15, marketCap: 771000000000, volume24h: 95000000, type: 'stock' },
    ];
  }
}

// Create singleton instance
const marketDataService = new MarketDataService();

module.exports = marketDataService;
