const axios = require('axios');
const { cache } = require('../config/redis');

class NewsService {
  constructor() {
    // Using Marketaux.com for financial and crypto news
    // Free tier: 100 requests/month
    this.marketauxApiKey = process.env.MARKETAUX_API_KEY || '';
    this.marketauxApiUrl = 'https://api.marketaux.com/v1';

    // Redis cache TTL for news articles (15 minutes)
    this.cacheTTL = 15 * 60; // 15 minutes in seconds for Redis
  }

  /**
   * Get news for a cryptocurrency
   * @param {string} symbol - Crypto symbol (e.g., 'BTC', 'ETH')
   * @param {number} limit - Number of articles to fetch
   * @returns {Promise<Array>} Array of news articles
   */
  async getCryptoNews(symbol, limit = 10) {
    const cacheKey = `news:crypto:${symbol}:${limit}`;

    // Check Redis cache first
    const cached = await cache.get(cacheKey);
    if (cached) {
      console.log(`✅ Crypto news for ${symbol} found in Redis cache`);
      return cached;
    }

    try {
      // Try Marketaux if API key is available
      if (this.marketauxApiKey) {
        const marketauxResults = await this.fetchFromMarketaux(symbol, 'crypto', limit);
        if (marketauxResults && marketauxResults.length > 0) {
          await cache.set(cacheKey, marketauxResults, this.cacheTTL);
          console.log(`✅ Fetched ${marketauxResults.length} news from Marketaux for ${symbol}`);
          return marketauxResults;
        }
      } else {
        console.warn('⚠️ MARKETAUX_API_KEY not configured');
      }

      // Fallback to mock data
      console.log(`⚠️ Using mock news for ${symbol}`);
      const mockNews = this.getMockCryptoNews(symbol, limit);
      await cache.set(cacheKey, mockNews, this.cacheTTL);
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
    const cacheKey = `news:stock:${symbol}:${limit}`;

    // Check Redis cache first
    const cached = await cache.get(cacheKey);
    if (cached) {
      console.log(`✅ Stock news for ${symbol} found in Redis cache`);
      return cached;
    }

    try {
      if (this.marketauxApiKey) {
        const marketauxResults = await this.fetchFromMarketaux(symbol, 'stock', limit, companyName);

        if (marketauxResults && marketauxResults.length > 0) {
          await cache.set(cacheKey, marketauxResults, this.cacheTTL);
          console.log(`✅ Fetched ${marketauxResults.length} news from Marketaux for ${symbol}`);
          return marketauxResults;
        }
      }

      // Return mock data if API key not available or no results
      console.log(`⚠️ Using mock news for ${symbol}`);
      const mockNews = this.getMockStockNews(symbol, companyName, limit);
      await cache.set(cacheKey, mockNews, this.cacheTTL);
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
   * Get general news by category
   * @param {string} category - Category: 'all', 'crypto', 'stocks', 'political'
   * @param {number} limit - Number of articles to fetch
   * @returns {Promise<Array>} Array of news articles
   */
  async getNewsByCategory(category = 'all', limit = 30) {
    const cacheKey = `news:category:${category}:${limit}`;

    // Check Redis cache first
    const cached = await cache.get(cacheKey);
    if (cached) {
      console.log(`✅ News for category ${category} found in Redis cache`);
      return cached;
    }

    try {
      if (this.marketauxApiKey) {
        const endpoint = `${this.marketauxApiUrl}/news/all`;

        const params = {
          api_token: this.marketauxApiKey,
          language: 'en',
          limit: Math.min(limit, 100),
          sort: 'published_at'
        };

        // Set filter based on category
        switch (category) {
          case 'crypto':
            params.filter_entities = 'true';
            params.entity_types = 'crypto';
            break;
          case 'stock':
          case 'stocks':
            params.filter_entities = 'true';
            params.entity_types = 'equity';
            break;
          case 'political':
            params.search = 'politics OR government OR election OR policy';
            params.countries = 'us,gb,eu';
            break;
          case 'all':
          default:
            // General financial news
            params.filter_entities = 'true';
            break;
        }

        console.log(`📰 Fetching category news from Marketaux:`, params);

        const response = await axios.get(endpoint, {
          params: params,
          timeout: 15000
        });

        if (response.data && response.data.data && response.data.data.length > 0) {
          const articles = response.data.data.map(article => ({
            uuid: article.uuid,
            title: article.title,
            description: article.description || article.snippet || '',
            snippet: article.snippet || '',
            url: article.url,
            image_url: article.image_url || null,
            published_at: article.published_at,
            source: article.source || 'Unknown',
            entities: article.entities || [],
            sentiment: article.sentiment || null
          }));

          await cache.set(cacheKey, articles, this.cacheTTL);
          console.log(`✅ Fetched ${articles.length} articles for category ${category}`);
          return articles;
        }
      } else {
        console.warn('⚠️ MARKETAUX_API_KEY not configured');
      }

      // Fallback to mock data
      const mockNews = this.getMockNewsByCategory(category, limit);
      await cache.set(cacheKey, mockNews, this.cacheTTL);
      return mockNews;
    } catch (error) {
      console.error(`❌ Error fetching news for category ${category}:`, error.message);
      return this.getMockNewsByCategory(category, limit);
    }
  }

  /**
   * Get news by specific symbols
   * @param {Array<string>} symbols - Array of symbols
   * @param {number} limit - Number of articles to fetch
   * @returns {Promise<Array>} Array of news articles
   */
  async getNewsBySymbols(symbols, limit = 20) {
    if (!symbols || symbols.length === 0) {
      return [];
    }

    const cacheKey = `news:symbols:${symbols.join(',')}:${limit}`;

    // Check Redis cache first
    const cached = await cache.get(cacheKey);
    if (cached) {
      console.log(`✅ News for symbols found in Redis cache`);
      return cached;
    }

    try {
      if (this.marketauxApiKey) {
        const endpoint = `${this.marketauxApiUrl}/news/all`;

        const params = {
          api_token: this.marketauxApiKey,
          language: 'en',
          symbols: symbols.join(','),
          limit: Math.min(limit, 100),
          sort: 'published_at'
        };

        const response = await axios.get(endpoint, {
          params: params,
          timeout: 15000
        });

        if (response.data && response.data.data && response.data.data.length > 0) {
          const articles = response.data.data.map(article => ({
            uuid: article.uuid,
            title: article.title,
            description: article.description || article.snippet || '',
            snippet: article.snippet || '',
            url: article.url,
            image_url: article.image_url || null,
            published_at: article.published_at,
            source: article.source || 'Unknown',
            entities: article.entities || [],
            sentiment: article.sentiment || null
          }));

          await cache.set(cacheKey, articles, this.cacheTTL);
          return articles;
        }
      }

      return [];
    } catch (error) {
      console.error(`❌ Error fetching news for symbols:`, error.message);
      return [];
    }
  }

  /**
   * Search news
   * @param {string} query - Search query
   * @param {number} limit - Number of articles to fetch
   * @returns {Promise<Array>} Array of news articles
   */
  async searchNews(query, limit = 20) {
    if (!query) {
      return [];
    }

    const cacheKey = `news:search:${query}:${limit}`;

    // Check Redis cache first
    const cached = await cache.get(cacheKey);
    if (cached) {
      console.log(`✅ Search results found in Redis cache`);
      return cached;
    }

    try {
      if (this.marketauxApiKey) {
        const endpoint = `${this.marketauxApiUrl}/news/all`;

        const params = {
          api_token: this.marketauxApiKey,
          language: 'en',
          search: query,
          limit: Math.min(limit, 100),
          sort: 'published_at'
        };

        const response = await axios.get(endpoint, {
          params: params,
          timeout: 15000
        });

        if (response.data && response.data.data && response.data.data.length > 0) {
          const articles = response.data.data.map(article => ({
            uuid: article.uuid,
            title: article.title,
            description: article.description || article.snippet || '',
            snippet: article.snippet || '',
            url: article.url,
            image_url: article.image_url || null,
            published_at: article.published_at,
            source: article.source || 'Unknown',
            entities: article.entities || [],
            sentiment: article.sentiment || null
          }));

          await cache.set(cacheKey, articles, this.cacheTTL);
          return articles;
        }
      }

      return [];
    } catch (error) {
      console.error(`❌ Error searching news:`, error.message);
      return [];
    }
  }

  /**
   * Mock news by category for fallback
   */
  getMockNewsByCategory(category, limit) {
    const mockArticles = [
      {
        uuid: 'mock-1',
        title: `${category === 'crypto' ? 'Cryptocurrency' : category === 'stocks' ? 'Stock Market' : 'Financial'} Markets Show Positive Trends`,
        description: 'Latest market analysis shows encouraging signs across major indices and assets.',
        snippet: 'Market analysis shows encouraging signs...',
        url: '#',
        image_url: null,
        published_at: new Date().toISOString(),
        source: 'Financial News',
        entities: [],
        sentiment: 'positive'
      },
      {
        uuid: 'mock-2',
        title: 'Economic Outlook: What Investors Need to Know',
        description: 'Expert analysis on current economic conditions and their impact on investment strategies.',
        snippet: 'Expert analysis on current economic conditions...',
        url: '#',
        image_url: null,
        published_at: new Date(Date.now() - 3600000).toISOString(),
        source: 'Market Watch',
        entities: [],
        sentiment: 'neutral'
      },
      {
        uuid: 'mock-3',
        title: 'Breaking: Major Developments in Global Markets',
        description: 'Recent announcements and events shaping the financial landscape.',
        snippet: 'Recent announcements and events...',
        url: '#',
        image_url: null,
        published_at: new Date(Date.now() - 7200000).toISOString(),
        source: 'Bloomberg',
        entities: [],
        sentiment: 'neutral'
      }
    ];

    return mockArticles.slice(0, limit);
  }

}

// Create singleton instance
const newsService = new NewsService();

module.exports = newsService;
