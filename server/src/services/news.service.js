const axios = require('axios');

class NewsService {
  constructor() {
    // Using NewsAPI.org for financial and crypto news
    // Free tier: 100 requests/day, 30 days of historical data
    this.newsApiKey = process.env.NEWS_API_KEY || '';
    this.newsApiUrl = 'https://newsapi.org/v2';

    // Fallback to CryptoCompare for crypto-specific news
    this.cryptoCompareUrl = 'https://min-api.cryptocompare.com/data/v2/news';

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
      // Always try CryptoCompare first (free, no API key needed, works in production)
      try {
        const cryptoCompareResults = await this.fetchFromCryptoCompare(symbol, limit);
        if (cryptoCompareResults && cryptoCompareResults.length > 0) {
          this.cacheNews(cacheKey, cryptoCompareResults);
          console.log(`✅ Fetched ${cryptoCompareResults.length} news from CryptoCompare for ${symbol}`);
          return cryptoCompareResults;
        }
      } catch (ccError) {
        console.warn(`CryptoCompare failed for ${symbol}:`, ccError.message);
      }

      // Try NewsAPI as backup if API key is available (only works on localhost)
      if (this.newsApiKey) {
        const newsApiResults = await this.fetchFromNewsAPI(symbol, 'crypto', limit);
        if (newsApiResults && newsApiResults.length > 0) {
          this.cacheNews(cacheKey, newsApiResults);
          console.log(`✅ Fetched ${newsApiResults.length} news from NewsAPI for ${symbol}`);
          return newsApiResults;
        }
      }

      // Final fallback to mock data
      console.log(`⚠️ Using mock news for ${symbol}`);
      return this.getMockCryptoNews(symbol, limit);
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
      if (this.newsApiKey) {
        // Use both company name AND symbol for better results
        const searchQuery = companyName ? `${companyName} ${symbol}` : symbol;
        const newsApiResults = await this.fetchFromNewsAPI(searchQuery, 'stock', limit);

        if (newsApiResults && newsApiResults.length > 0) {
          this.cacheNews(cacheKey, newsApiResults);
          return newsApiResults;
        }
      }

      // Return mock data if API key not available or no results
      const mockNews = this.getMockStockNews(symbol, companyName, limit);
      this.cacheNews(cacheKey, mockNews);
      return mockNews;
    } catch (error) {
      console.error(`❌ Error fetching stock news for ${symbol}:`, error.message);
      return this.getMockStockNews(symbol, companyName, limit);
    }
  }

  /**
   * Fetch news from NewsAPI.org
   */
  async fetchFromNewsAPI(query, type, limit) {
    try {
      const endpoint = `${this.newsApiUrl}/everything`;

      // Make search queries more specific with the actual company/crypto name
      let searchQuery;
      if (type === 'crypto') {
        // For crypto, search for the symbol in crypto context
        searchQuery = `${query} AND (cryptocurrency OR crypto OR blockchain)`;
      } else {
        // For stocks, be VERY specific - require the query term in title or description
        // Use "in:title" to search only in titles for better relevance
        searchQuery = `"${query.split(' ')[0]}"`;  // Use the company name (first part)
      }

      const response = await axios.get(endpoint, {
        params: {
          q: searchQuery,
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: limit * 2,  // Fetch more then filter for better results
          apiKey: this.newsApiKey
        },
        timeout: 10000
      });

      if (response.data && response.data.articles) {
        let articles = response.data.articles.map(article => ({
          title: article.title,
          description: article.description,
          url: article.url,
          image: article.urlToImage,
          publishedAt: article.publishedAt,
          source: article.source.name,
          author: article.author
        }));

        // For stocks, filter articles to ensure they actually mention the company
        if (type === 'stock' && query) {
          const keywords = query.toLowerCase().split(' ');
          articles = articles.filter(article => {
            const text = `${article.title} ${article.description}`.toLowerCase();
            // Article must mention at least one keyword from the query
            return keywords.some(keyword => text.includes(keyword));
          });
        }

        return articles.slice(0, limit);
      }

      return [];
    } catch (error) {
      console.error('Error fetching from NewsAPI:', error.message);
      // Don't throw - return empty array to allow fallback to other sources
      return [];
    }
  }

  /**
   * Fetch crypto news from CryptoCompare
   */
  async fetchFromCryptoCompare(symbol, limit) {
    try {
      const response = await axios.get(this.cryptoCompareUrl, {
        params: {
          categories: symbol,
          lang: 'EN'
        },
        timeout: 10000
      });

      if (response.data && response.data.Data) {
        return response.data.Data.slice(0, limit).map(article => ({
          title: article.title,
          description: article.body,
          url: article.url,
          image: article.imageurl,
          publishedAt: new Date(article.published_on * 1000).toISOString(),
          source: article.source,
          author: article.source
        }));
      }

      return [];
    } catch (error) {
      console.error('Error fetching from CryptoCompare:', error.message);
      throw error;
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
