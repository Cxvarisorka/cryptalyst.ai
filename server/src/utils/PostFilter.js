const FilterBuilder = require('./FilterBuilder');

/**
 * PostFilter Class
 * Specialized filter builder for Post model
 * Extends the general FilterBuilder with post-specific filtering methods
 */
class PostFilter extends FilterBuilder {
  constructor(query = {}) {
    super(query);

    // Set default sort (newest first)
    this.setSort('createdAt', 'desc');

    // Parse query parameters and apply filters
    this.parseQuery(query);
  }

  /**
   * Parse query parameters and initialize filters
   * @param {Object} query - Query parameters from request
   */
  parseQuery(query) {
    const {
      assetType,
      assetSymbol,
      userId,
      tag,
      sentiment,
      visibility,
      sortBy,
      sortOrder,
      page,
      limit,
      search
    } = query;

    // Asset filters
    if (assetType && assetType !== 'all') {
      this.filterByAssetType(assetType);
    }
    if (assetSymbol) {
      this.filterByAssetSymbol(assetSymbol);
    }

    // User filter
    if (userId) {
      this.filterByUser(userId);
    }

    // Tag filter
    if (tag) {
      this.filterByTag(tag);
    }

    // Sentiment filter
    if (sentiment && sentiment !== 'all') {
      this.filterBySentiment(sentiment);
    }

    // Visibility filter (default: public only)
    if (visibility) {
      this.filterByVisibility(visibility);
    }

    // Search filter
    if (search) {
      this.filterBySearch(search);
    }

    // Sorting
    if (sortBy) {
      this.setSorting(sortBy, sortOrder);
    }

    // Pagination
    if (page || limit) {
      this.setPagination(page, limit);
    }
  }

  /**
   * Filter by asset type (crypto/stock)
   * @param {string} assetType - Asset type to filter by
   * @returns {PostFilter} - Chainable instance
   */
  filterByAssetType(assetType) {
    return this.addFilter('asset.type', assetType);
  }

  /**
   * Filter by asset symbol
   * @param {string} symbol - Asset symbol to filter by
   * @returns {PostFilter} - Chainable instance
   */
  filterByAssetSymbol(symbol) {
    return this.addFilter('asset.symbol', symbol.toUpperCase());
  }

  /**
   * Filter by user ID
   * @param {string} userId - User ID to filter by
   * @returns {PostFilter} - Chainable instance
   */
  filterByUser(userId) {
    return this.addFilter('userId', userId);
  }

  /**
   * Filter by tag (case-insensitive)
   * @param {string} tag - Tag to filter by
   * @returns {PostFilter} - Chainable instance
   */
  filterByTag(tag) {
    return this.addFilter('tags', tag, 'regex');
  }

  /**
   * Filter by sentiment (bullish/bearish/neutral)
   * @param {string} sentiment - Sentiment to filter by
   * @returns {PostFilter} - Chainable instance
   */
  filterBySentiment(sentiment) {
    return this.addFilter('sentiment', sentiment);
  }

  /**
   * Filter by visibility (public/followers/private)
   * @param {string} visibility - Visibility to filter by
   * @returns {PostFilter} - Chainable instance
   */
  filterByVisibility(visibility) {
    return this.addFilter('visibility', visibility);
  }

  /**
   * Filter by search query (content or tags)
   * @param {string} searchQuery - Search query
   * @returns {PostFilter} - Chainable instance
   */
  filterBySearch(searchQuery) {
    const searchRegex = new RegExp(searchQuery, 'i');
    return this.addOrConditions([
      { content: searchRegex },
      { tags: searchRegex }
    ]);
  }

  /**
   * Set sorting with validation for post-specific fields
   * @param {string} sortBy - Field to sort by
   * @param {string} sortOrder - Sort order (asc/desc)
   * @returns {PostFilter} - Chainable instance
   */
  setSorting(sortBy, sortOrder = 'desc') {
    const validSortFields = ['createdAt', 'likesCount', 'commentsCount', 'sharesCount'];

    if (validSortFields.includes(sortBy)) {
      // Clear existing sorts and set new one
      this.sortOptions = {};
      this.setSort(sortBy, sortOrder);

      // Add createdAt as secondary sort if not primary
      if (sortBy !== 'createdAt') {
        this.setSort('createdAt', 'desc');
      }
    }

    return this;
  }

  /**
   * Exclude hidden posts
   * @returns {PostFilter} - Chainable instance
   */
  excludeHidden() {
    return this.addFilter('isHidden', false);
  }

  /**
   * Build query and add populate fields for posts
   * @returns {Object} - Complete query configuration
   */
  buildQuery() {
    // Add standard populate fields for posts
    this.addPopulate('userId', 'name avatar email');

    return this.build();
  }

  /**
   * Execute query on Post model with default settings
   * @param {Model} PostModel - Post Mongoose model
   * @returns {Promise<Object>} - Query results
   */
  async execute(PostModel) {
    // Ensure populate is set before execution
    if (this.populateFields.length === 0) {
      this.addPopulate('userId', 'name avatar email');
    }

    // Add populate for shared posts (reposts)
    this.addPopulate({
      path: 'sharedPost',
      populate: { path: 'userId', select: 'name avatar email' }
    });

    return super.execute(PostModel, true);
  }
}

module.exports = PostFilter;
