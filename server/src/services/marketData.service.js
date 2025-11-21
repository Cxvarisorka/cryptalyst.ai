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
    this.stockSymbols = [
      // Tech Giants
      'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'META', 'NVDA', 'TSLA', 'NFLX', 'ADBE',
      'CRM', 'ORCL', 'INTC', 'AMD', 'CSCO', 'AVGO', 'QCOM', 'TXN', 'UBER', 'LYFT',
      // Financial
      'JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'BLK', 'SCHW', 'AXP', 'V', 'MA', 'PYPL', 'SQ',
      // Healthcare & Pharma
      'JNJ', 'UNH', 'PFE', 'ABBV', 'MRK', 'TMO', 'ABT', 'DHR', 'LLY', 'BMY', 'AMGN', 'GILD',
      // Consumer & Retail
      'WMT', 'HD', 'NKE', 'MCD', 'SBUX', 'TGT', 'LOW', 'COST', 'CVS', 'KO', 'PEP', 'DIS',
      // Industrial & Energy
      'BA', 'CAT', 'GE', 'MMM', 'HON', 'UPS', 'XOM', 'CVX', 'COP', 'SLB',
      // Communication & Media
      'T', 'VZ', 'TMUS', 'CMCSA', 'CHTR', 'ATVI', 'EA', 'TTWO',
      // Other Major Companies
      'BRK.B', 'TSM', 'ASML', 'NVO', 'LLY', 'PG', 'JNJ', 'WMT', 'XOM', 'UNH'
    ];
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
          per_page: 250,
          page: 1,
          sparkline: false,
          price_change_percentage: '24h'
        },
        timeout: 10000
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
            // Generate logo URL from company domain
            const logoUrl = profile.weburl
              ? `https://logo.clearbit.com/${new URL(profile.weburl).hostname}`
              : this.getStockLogoUrl(symbol);

            return {
              id: symbol,
              symbol: symbol,
              name: profile.name || symbol,
              price: quote.c,
              change24h: quote.dp,
              marketCap: profile.marketCapitalization ? profile.marketCapitalization * 1000000 : 0,
              volume24h: quote.v || 0,
              image: logoUrl,
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
   * Get stock logo URL from Clearbit
   */
  getStockLogoUrl(symbol) {
    const logoMap = {
      // Tech Giants
      'AAPL': 'https://logo.clearbit.com/apple.com',
      'MSFT': 'https://logo.clearbit.com/microsoft.com',
      'GOOGL': 'https://logo.clearbit.com/google.com',
      'GOOG': 'https://logo.clearbit.com/google.com',
      'AMZN': 'https://logo.clearbit.com/amazon.com',
      'META': 'https://logo.clearbit.com/meta.com',
      'NVDA': 'https://logo.clearbit.com/nvidia.com',
      'TSLA': 'https://logo.clearbit.com/tesla.com',
      'NFLX': 'https://logo.clearbit.com/netflix.com',
      'ADBE': 'https://logo.clearbit.com/adobe.com',
      'CRM': 'https://logo.clearbit.com/salesforce.com',
      'ORCL': 'https://logo.clearbit.com/oracle.com',
      'INTC': 'https://logo.clearbit.com/intel.com',
      'AMD': 'https://logo.clearbit.com/amd.com',
      'CSCO': 'https://logo.clearbit.com/cisco.com',
      'AVGO': 'https://logo.clearbit.com/broadcom.com',
      'QCOM': 'https://logo.clearbit.com/qualcomm.com',
      'TXN': 'https://logo.clearbit.com/ti.com',
      'UBER': 'https://logo.clearbit.com/uber.com',
      'LYFT': 'https://logo.clearbit.com/lyft.com',
      // Financial
      'JPM': 'https://logo.clearbit.com/jpmorganchase.com',
      'BAC': 'https://logo.clearbit.com/bankofamerica.com',
      'WFC': 'https://logo.clearbit.com/wellsfargo.com',
      'GS': 'https://logo.clearbit.com/goldmansachs.com',
      'MS': 'https://logo.clearbit.com/morganstanley.com',
      'C': 'https://logo.clearbit.com/citigroup.com',
      'BLK': 'https://logo.clearbit.com/blackrock.com',
      'SCHW': 'https://logo.clearbit.com/schwab.com',
      'AXP': 'https://logo.clearbit.com/americanexpress.com',
      'V': 'https://logo.clearbit.com/visa.com',
      'MA': 'https://logo.clearbit.com/mastercard.com',
      'PYPL': 'https://logo.clearbit.com/paypal.com',
      'SQ': 'https://logo.clearbit.com/squareup.com',
      // Healthcare
      'JNJ': 'https://logo.clearbit.com/jnj.com',
      'UNH': 'https://logo.clearbit.com/unitedhealthgroup.com',
      'PFE': 'https://logo.clearbit.com/pfizer.com',
      'ABBV': 'https://logo.clearbit.com/abbvie.com',
      'MRK': 'https://logo.clearbit.com/merck.com',
      'TMO': 'https://logo.clearbit.com/thermofisher.com',
      'ABT': 'https://logo.clearbit.com/abbott.com',
      'DHR': 'https://logo.clearbit.com/danaher.com',
      'LLY': 'https://logo.clearbit.com/lilly.com',
      'BMY': 'https://logo.clearbit.com/bms.com',
      'AMGN': 'https://logo.clearbit.com/amgen.com',
      'GILD': 'https://logo.clearbit.com/gilead.com',
      // Consumer & Retail
      'WMT': 'https://logo.clearbit.com/walmart.com',
      'HD': 'https://logo.clearbit.com/homedepot.com',
      'NKE': 'https://logo.clearbit.com/nike.com',
      'MCD': 'https://logo.clearbit.com/mcdonalds.com',
      'SBUX': 'https://logo.clearbit.com/starbucks.com',
      'TGT': 'https://logo.clearbit.com/target.com',
      'LOW': 'https://logo.clearbit.com/lowes.com',
      'COST': 'https://logo.clearbit.com/costco.com',
      'CVS': 'https://logo.clearbit.com/cvshealth.com',
      'KO': 'https://logo.clearbit.com/coca-cola.com',
      'PEP': 'https://logo.clearbit.com/pepsico.com',
      'DIS': 'https://logo.clearbit.com/disney.com',
      // Industrial & Energy
      'BA': 'https://logo.clearbit.com/boeing.com',
      'CAT': 'https://logo.clearbit.com/caterpillar.com',
      'GE': 'https://logo.clearbit.com/ge.com',
      'MMM': 'https://logo.clearbit.com/3m.com',
      'HON': 'https://logo.clearbit.com/honeywell.com',
      'UPS': 'https://logo.clearbit.com/ups.com',
      'XOM': 'https://logo.clearbit.com/exxonmobil.com',
      'CVX': 'https://logo.clearbit.com/chevron.com',
      'COP': 'https://logo.clearbit.com/conocophillips.com',
      'SLB': 'https://logo.clearbit.com/slb.com',
      // Communication
      'T': 'https://logo.clearbit.com/att.com',
      'VZ': 'https://logo.clearbit.com/verizon.com',
      'TMUS': 'https://logo.clearbit.com/t-mobile.com',
      'CMCSA': 'https://logo.clearbit.com/comcast.com',
      'CHTR': 'https://logo.clearbit.com/charter.com',
      'ATVI': 'https://logo.clearbit.com/activisionblizzard.com',
      'EA': 'https://logo.clearbit.com/ea.com',
      'TTWO': 'https://logo.clearbit.com/take2games.com',
      // Other
      'BRK.B': 'https://logo.clearbit.com/berkshirehathaway.com',
      'TSM': 'https://logo.clearbit.com/tsmc.com',
      'ASML': 'https://logo.clearbit.com/asml.com',
      'NVO': 'https://logo.clearbit.com/novonordisk.com',
      'PG': 'https://logo.clearbit.com/pg.com'
    };
    return logoMap[symbol] || `https://logo.clearbit.com/${symbol.toLowerCase()}.com`;
  }

  /**
   * Fallback stock data when API is unavailable
   */
  getFallbackStockData() {
    const fallbackStocks = [
      // Tech Giants
      { id: 'AAPL', symbol: 'AAPL', name: 'Apple Inc.', price: 178.25, change24h: 2.34, marketCap: 2800000000000 },
      { id: 'MSFT', symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.91, change24h: 1.87, marketCap: 2810000000000 },
      { id: 'GOOGL', symbol: 'GOOGL', name: 'Alphabet Inc.', price: 141.80, change24h: -0.45, marketCap: 1780000000000 },
      { id: 'GOOG', symbol: 'GOOG', name: 'Alphabet Inc. Class C', price: 143.20, change24h: -0.50, marketCap: 1780000000000 },
      { id: 'AMZN', symbol: 'AMZN', name: 'Amazon.com Inc.', price: 151.94, change24h: 1.23, marketCap: 1570000000000 },
      { id: 'META', symbol: 'META', name: 'Meta Platforms', price: 484.03, change24h: 3.12, marketCap: 1230000000000 },
      { id: 'NVDA', symbol: 'NVDA', name: 'NVIDIA Corp.', price: 495.22, change24h: 4.67, marketCap: 1220000000000 },
      { id: 'TSLA', symbol: 'TSLA', name: 'Tesla Inc.', price: 242.84, change24h: -2.15, marketCap: 771000000000 },
      { id: 'NFLX', symbol: 'NFLX', name: 'Netflix Inc.', price: 485.50, change24h: 2.45, marketCap: 210000000000 },
      { id: 'ADBE', symbol: 'ADBE', name: 'Adobe Inc.', price: 562.34, change24h: 1.56, marketCap: 255000000000 },
      { id: 'CRM', symbol: 'CRM', name: 'Salesforce Inc.', price: 265.75, change24h: 0.89, marketCap: 260000000000 },
      { id: 'ORCL', symbol: 'ORCL', name: 'Oracle Corp.', price: 108.45, change24h: 1.23, marketCap: 300000000000 },
      { id: 'INTC', symbol: 'INTC', name: 'Intel Corp.', price: 43.67, change24h: -1.45, marketCap: 180000000000 },
      { id: 'AMD', symbol: 'AMD', name: 'Advanced Micro Devices', price: 138.92, change24h: 2.67, marketCap: 225000000000 },
      { id: 'CSCO', symbol: 'CSCO', name: 'Cisco Systems', price: 56.78, change24h: 0.78, marketCap: 230000000000 },
      { id: 'AVGO', symbol: 'AVGO', name: 'Broadcom Inc.', price: 865.45, change24h: 3.12, marketCap: 410000000000 },
      { id: 'QCOM', symbol: 'QCOM', name: 'Qualcomm Inc.', price: 165.89, change24h: 1.90, marketCap: 185000000000 },
      { id: 'TXN', symbol: 'TXN', name: 'Texas Instruments', price: 189.34, change24h: 0.56, marketCap: 172000000000 },
      { id: 'UBER', symbol: 'UBER', name: 'Uber Technologies', price: 71.56, change24h: 2.34, marketCap: 145000000000 },
      { id: 'LYFT', symbol: 'LYFT', name: 'Lyft Inc.', price: 13.45, change24h: -1.23, marketCap: 5000000000 },
      // Financial
      { id: 'JPM', symbol: 'JPM', name: 'JPMorgan Chase', price: 158.45, change24h: 1.45, marketCap: 465000000000 },
      { id: 'BAC', symbol: 'BAC', name: 'Bank of America', price: 34.56, change24h: 0.89, marketCap: 280000000000 },
      { id: 'WFC', symbol: 'WFC', name: 'Wells Fargo', price: 52.34, change24h: 1.12, marketCap: 195000000000 },
      { id: 'GS', symbol: 'GS', name: 'Goldman Sachs', price: 385.67, change24h: 2.34, marketCap: 130000000000 },
      { id: 'MS', symbol: 'MS', name: 'Morgan Stanley', price: 94.56, change24h: 1.56, marketCap: 155000000000 },
      { id: 'C', symbol: 'C', name: 'Citigroup Inc.', price: 58.90, change24h: 0.78, marketCap: 110000000000 },
      { id: 'BLK', symbol: 'BLK', name: 'BlackRock Inc.', price: 825.45, change24h: 2.12, marketCap: 125000000000 },
      { id: 'SCHW', symbol: 'SCHW', name: 'Charles Schwab', price: 67.89, change24h: 1.23, marketCap: 125000000000 },
      { id: 'AXP', symbol: 'AXP', name: 'American Express', price: 195.67, change24h: 1.89, marketCap: 145000000000 },
      { id: 'V', symbol: 'V', name: 'Visa Inc.', price: 267.45, change24h: 1.34, marketCap: 550000000000 },
      { id: 'MA', symbol: 'MA', name: 'Mastercard Inc.', price: 445.78, change24h: 1.67, marketCap: 425000000000 },
      { id: 'PYPL', symbol: 'PYPL', name: 'PayPal Holdings', price: 78.45, change24h: -0.89, marketCap: 85000000000 },
      { id: 'SQ', symbol: 'SQ', name: 'Block Inc.', price: 68.90, change24h: 2.34, marketCap: 40000000000 },
      // Healthcare & Pharma
      { id: 'JNJ', symbol: 'JNJ', name: 'Johnson & Johnson', price: 162.45, change24h: 0.67, marketCap: 395000000000 },
      { id: 'UNH', symbol: 'UNH', name: 'UnitedHealth Group', price: 485.90, change24h: 1.45, marketCap: 450000000000 },
      { id: 'PFE', symbol: 'PFE', name: 'Pfizer Inc.', price: 29.56, change24h: -0.34, marketCap: 165000000000 },
      { id: 'ABBV', symbol: 'ABBV', name: 'AbbVie Inc.', price: 165.78, change24h: 1.23, marketCap: 290000000000 },
      { id: 'MRK', symbol: 'MRK', name: 'Merck & Co.', price: 108.90, change24h: 0.89, marketCap: 275000000000 },
      { id: 'TMO', symbol: 'TMO', name: 'Thermo Fisher Scientific', price: 545.67, change24h: 1.56, marketCap: 215000000000 },
      { id: 'ABT', symbol: 'ABT', name: 'Abbott Laboratories', price: 115.45, change24h: 0.78, marketCap: 200000000000 },
      { id: 'DHR', symbol: 'DHR', name: 'Danaher Corp.', price: 265.90, change24h: 1.34, marketCap: 190000000000 },
      { id: 'LLY', symbol: 'LLY', name: 'Eli Lilly', price: 785.45, change24h: 2.67, marketCap: 745000000000 },
      { id: 'BMY', symbol: 'BMY', name: 'Bristol Myers Squibb', price: 58.90, change24h: -0.45, marketCap: 120000000000 },
      { id: 'AMGN', symbol: 'AMGN', name: 'Amgen Inc.', price: 285.67, change24h: 1.12, marketCap: 155000000000 },
      { id: 'GILD', symbol: 'GILD', name: 'Gilead Sciences', price: 78.45, change24h: 0.56, marketCap: 95000000000 },
      // Consumer & Retail
      { id: 'WMT', symbol: 'WMT', name: 'Walmart Inc.', price: 165.90, change24h: 1.23, marketCap: 450000000000 },
      { id: 'HD', symbol: 'HD', name: 'Home Depot', price: 345.67, change24h: 1.56, marketCap: 350000000000 },
      { id: 'NKE', symbol: 'NKE', name: 'Nike Inc.', price: 98.45, change24h: -0.78, marketCap: 155000000000 },
      { id: 'MCD', symbol: 'MCD', name: 'McDonalds Corp.', price: 289.90, change24h: 0.89, marketCap: 215000000000 },
      { id: 'SBUX', symbol: 'SBUX', name: 'Starbucks Corp.', price: 95.67, change24h: 1.12, marketCap: 110000000000 },
      { id: 'TGT', symbol: 'TGT', name: 'Target Corp.', price: 145.78, change24h: 0.67, marketCap: 67000000000 },
      { id: 'LOW', symbol: 'LOW', name: 'Lowes Companies', price: 235.45, change24h: 1.34, marketCap: 145000000000 },
      { id: 'COST', symbol: 'COST', name: 'Costco Wholesale', price: 685.90, change24h: 2.12, marketCap: 305000000000 },
      { id: 'CVS', symbol: 'CVS', name: 'CVS Health', price: 78.45, change24h: -0.45, marketCap: 100000000000 },
      { id: 'KO', symbol: 'KO', name: 'Coca-Cola Co.', price: 62.34, change24h: 0.56, marketCap: 270000000000 },
      { id: 'PEP', symbol: 'PEP', name: 'PepsiCo Inc.', price: 178.90, change24h: 0.78, marketCap: 245000000000 },
      { id: 'DIS', symbol: 'DIS', name: 'Walt Disney Co.', price: 115.67, change24h: 1.45, marketCap: 210000000000 },
      // Industrial & Energy
      { id: 'BA', symbol: 'BA', name: 'Boeing Co.', price: 178.45, change24h: -1.23, marketCap: 110000000000 },
      { id: 'CAT', symbol: 'CAT', name: 'Caterpillar Inc.', price: 295.67, change24h: 1.56, marketCap: 155000000000 },
      { id: 'GE', symbol: 'GE', name: 'General Electric', price: 145.90, change24h: 2.12, marketCap: 160000000000 },
      { id: 'MMM', symbol: 'MMM', name: '3M Company', price: 108.45, change24h: 0.67, marketCap: 60000000000 },
      { id: 'HON', symbol: 'HON', name: 'Honeywell International', price: 205.78, change24h: 1.23, marketCap: 135000000000 },
      { id: 'UPS', symbol: 'UPS', name: 'United Parcel Service', price: 165.45, change24h: 0.89, marketCap: 145000000000 },
      { id: 'XOM', symbol: 'XOM', name: 'Exxon Mobil', price: 108.90, change24h: 1.45, marketCap: 450000000000 },
      { id: 'CVX', symbol: 'CVX', name: 'Chevron Corp.', price: 155.67, change24h: 1.12, marketCap: 290000000000 },
      { id: 'COP', symbol: 'COP', name: 'ConocoPhillips', price: 115.45, change24h: 0.78, marketCap: 145000000000 },
      { id: 'SLB', symbol: 'SLB', name: 'Schlumberger', price: 48.90, change24h: 1.34, marketCap: 68000000000 },
      // Communication & Media
      { id: 'T', symbol: 'T', name: 'AT&T Inc.', price: 18.45, change24h: 0.34, marketCap: 130000000000 },
      { id: 'VZ', symbol: 'VZ', name: 'Verizon Communications', price: 42.67, change24h: 0.56, marketCap: 180000000000 },
      { id: 'TMUS', symbol: 'TMUS', name: 'T-Mobile US', price: 165.90, change24h: 1.23, marketCap: 195000000000 },
      { id: 'CMCSA', symbol: 'CMCSA', name: 'Comcast Corp.', price: 45.78, change24h: 0.67, marketCap: 165000000000 },
      { id: 'CHTR', symbol: 'CHTR', name: 'Charter Communications', price: 385.45, change24h: 1.12, marketCap: 55000000000 },
      { id: 'ATVI', symbol: 'ATVI', name: 'Activision Blizzard', price: 95.23, change24h: 0.89, marketCap: 75000000000 },
      { id: 'EA', symbol: 'EA', name: 'Electronic Arts', price: 138.67, change24h: 1.45, marketCap: 38000000000 },
      { id: 'TTWO', symbol: 'TTWO', name: 'Take-Two Interactive', price: 158.90, change24h: 2.12, marketCap: 28000000000 },
      // Other Major Companies
      { id: 'BRK.B', symbol: 'BRK.B', name: 'Berkshire Hathaway', price: 385.45, change24h: 1.12, marketCap: 850000000000 },
      { id: 'TSM', symbol: 'TSM', name: 'Taiwan Semiconductor', price: 125.67, change24h: 2.34, marketCap: 650000000000 },
      { id: 'ASML', symbol: 'ASML', name: 'ASML Holding', price: 785.90, change24h: 1.89, marketCap: 325000000000 },
      { id: 'NVO', symbol: 'NVO', name: 'Novo Nordisk', price: 125.45, change24h: 1.56, marketCap: 575000000000 },
      { id: 'PG', symbol: 'PG', name: 'Procter & Gamble', price: 165.78, change24h: 0.78, marketCap: 395000000000 }
    ];

    return fallbackStocks.map(stock => ({
      ...stock,
      volume24h: Math.floor(stock.marketCap / stock.price * 0.01),
      image: this.getStockLogoUrl(stock.symbol),
      type: 'stock'
    }));
  }
}

// Create singleton instance
const marketDataService = new MarketDataService();

module.exports = marketDataService;
