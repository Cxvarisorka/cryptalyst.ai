const axios = require('axios');

class NewsService {
  constructor() {
    // Using Marketaux.com for financial and crypto news
    // Free tier: 100 requests/month
    this.marketauxApiKey = process.env.MARKETAUX_API_KEY || '';
    this.marketauxApiUrl = 'https://api.marketaux.com/v1';

    // Cache for news articles (15 minutes TTL)
    this.newsCache = new Map();
    this.cacheTTL = 15 * 60 * 1000; // 15 minutes
  }

  /**
   * Get news for a cryptocurrency
   * @param {string} symbol - Crypto symbol (e.g., 'BTC', 'ETH')
   * @param {number} limit - Number of articles to fetch
   * @returns {Promise<Array>} Array of news articles
   */
  async getCryptoNews(symbol, limit = 10) {
    const cacheKey = `crypto_${symbol}_${limit}`;

    // Check cache first
    const cached = this.getCachedNews(cacheKey);
    if (cached) {
      console.log(`✅ Crypto news for ${symbol} found in cache`);
      return cached;
    }

    try {
      // Try Marketaux if API key is available
      if (this.marketauxApiKey) {
        const marketauxResults = await this.fetchFromMarketaux(symbol, 'crypto', limit);
        if (marketauxResults && marketauxResults.length > 0) {
          this.cacheNews(cacheKey, marketauxResults);
          console.log(`✅ Fetched ${marketauxResults.length} news from Marketaux for ${symbol}`);
          return marketauxResults;
        }
      } else {
        console.warn('⚠️ MARKETAUX_API_KEY not configured');
      }

      // Fallback to mock data
      console.log(`⚠️ Using mock news for ${symbol}`);
      const mockNews = this.getMockCryptoNews(symbol, limit);
      this.cacheNews(cacheKey, mockNews);
      return mockNews;
    } catch (error) {
      console.error(`❌ Error fetching crypto news for ${symbol}:`, error.message);
      return this.getMockCryptoNews(symbol, limit);
    }
  }

  /**
   * Get news for a stock
   * @param {string} symbol - Stock symbol (e.g., 'AAPL', 'TSLA')
   * @param {string} companyName - Company name for better search results
   * @param {number} limit - Number of articles to fetch
   * @returns {Promise<Array>} Array of news articles
   */
  async getStockNews(symbol, companyName = '', limit = 10) {
    const cacheKey = `stock_${symbol}_${limit}`;

    // Check cache first
    const cached = this.getCachedNews(cacheKey);
    if (cached) {
      console.log(`✅ Stock news for ${symbol} found in cache`);
      return cached;
    }

    try {
      if (this.marketauxApiKey) {
        const marketauxResults = await this.fetchFromMarketaux(symbol, 'stock', limit, companyName);

        if (marketauxResults && marketauxResults.length > 0) {
          this.cacheNews(cacheKey, marketauxResults);
          console.log(`✅ Fetched ${marketauxResults.length} news from Marketaux for ${symbol}`);
          return marketauxResults;
        }
      }

      // Return mock data if API key not available or no results
      console.log(`⚠️ Using mock news for ${symbol}`);
      const mockNews = this.getMockStockNews(symbol, companyName, limit);
      this.cacheNews(cacheKey, mockNews);
      return mockNews;
    } catch (error) {
      console.error(`❌ Error fetching stock news for ${symbol}:`, error.message);
      return this.getMockStockNews(symbol, companyName, limit);
    }
  }

  /**
   * Fetch news from Marketaux.com
   */
  async fetchFromMarketaux(symbol, type, limit, companyName = '') {
    try {
      const endpoint = `${this.marketauxApiUrl}/news/all`;

      // Build parameters based on type
      const params = {
        api_token: this.marketauxApiKey,
        language: 'en',
        limit: Math.min(limit, 100), // Marketaux max limit per request
        sort: 'published_at'
      };

      if (type === 'crypto') {
        // For crypto: just use search (entity_types filter doesn't work well for crypto)
        params.search = symbol;
      } else {
        // For stocks: use symbols parameter for ticker symbol
        params.symbols = symbol.toUpperCase();
        params.entity_types = 'equity';

        // If company name provided, use it in search for better relevance
        if (companyName) {
          params.search = companyName;
        }
      }

      console.log(`📰 Fetching news from Marketaux for ${symbol}:`, params);

      const response = await axios.get(endpoint, {
        params: params,
        timeout: 15000
      });

      console.log(`📰 Marketaux response status: ${response.status}, articles found: ${response.data?.data?.length || 0}`);

      if (response.data && response.data.data && response.data.data.length > 0) {
        const articles = response.data.data.map(article => ({
          title: article.title,
          description: article.description || article.snippet || '',
          url: article.url,
          image: article.image_url || null,
          publishedAt: article.published_at,
          source: article.source || 'Unknown',
          author: article.source || 'Unknown'
        }));

        return articles.slice(0, limit);
      }

      console.log(`⚠️ No articles found from Marketaux for ${symbol}`);
      return [];
    } catch (error) {
      console.error('❌ Error fetching from Marketaux:', error.message);
      if (error.response) {
        console.error('Marketaux API Status:', error.response.status);
        console.error('Marketaux API Response:', error.response.data);
      }
      // Don't throw - return empty array to allow fallback to other sources
      return [];
    }
  }

  /**
   * Get cached news if available and not expired
   */
  getCachedNews(key) {
    const cached = this.newsCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }
    return null;
  }

  /**
   * Cache news articles
   */
  cacheNews(key, data) {
    this.newsCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Mock crypto news for fallback
   */
  getMockCryptoNews(symbol, limit) {
    const mockArticles = [
      {
        title: `${symbol} Shows Strong Market Performance`,
        description: `Recent analysis shows ${symbol} demonstrating resilience in volatile market conditions.`,
        url: '#',
        image: null,
        publishedAt: new Date().toISOString(),
        source: 'Crypto News',
        author: 'Market Analyst'
      },
      {
        title: `What Investors Need to Know About ${symbol}`,
        description: `Key insights and trends for ${symbol} investors in the current market environment.`,
        url: '#',
        image: null,
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        source: 'Financial Times',
        author: 'Investment Team'
      }
    ];

    return mockArticles.slice(0, limit);
  }

  /**
   * Mock stock news for fallback
   */
  getMockStockNews(symbol, companyName, limit) {
    const name = companyName || symbol;
    const mockArticles = [
      {
        title: `${name} Reports Quarterly Earnings`,
        description: `${name} announces latest quarterly results, showing growth across key metrics.`,
        url: '#',
        image: null,
        publishedAt: new Date().toISOString(),
        source: 'Business News',
        author: 'Financial Reporter'
      },
      {
        title: `Analysts Update ${name} Price Target`,
        description: `Market analysts revise outlook for ${name} based on recent performance.`,
        url: '#',
        image: null,
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        source: 'Market Watch',
        author: 'Stock Analysis'
      }
    ];

    return mockArticles.slice(0, limit);
  }

  /**
   * Clear expired cache entries (run periodically)
   */
  clearExpiredCache() {
    const now = Date.now();
    for (const [key, value] of this.newsCache.entries()) {
      if (now - value.timestamp >= this.cacheTTL) {
        this.newsCache.delete(key);
      }
    }
  }
}

// Create singleton instance
const newsService = new NewsService();

// Clear expired cache every 30 minutes
setInterval(() => {
  newsService.clearExpiredCache();
}, 30 * 60 * 1000);

module.exports = newsService;
