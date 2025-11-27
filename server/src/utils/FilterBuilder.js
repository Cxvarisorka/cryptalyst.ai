/**
 * FilterBuilder Class
 * Generic, reusable filter builder for MongoDB queries
 * Can be extended for specific models (Posts, Users, Comments, etc.)
 */
class FilterBuilder {
  constructor(query = {}) {
    this.query = query;
    this.filters = {};
    this.sortOptions = {};
    this.paginationOptions = {
      page: 1,
      limit: 10
    };
    this.populateFields = [];
    this.selectFields = null;
  }

  /**
   * Add a filter condition
   * @param {string} field - Field name
   * @param {*} value - Filter value
   * @param {string} operator - Comparison operator (eq, ne, gt, gte, lt, lte, in, regex)
   * @returns {FilterBuilder} - Chainable instance
   */
  addFilter(field, value, operator = 'eq') {
    if (value === undefined || value === null || value === '') {
      return this;
    }

    switch (operator) {
      case 'eq':
        this.filters[field] = value;
        break;
      case 'ne':
        this.filters[field] = { $ne: value };
        break;
      case 'gt':
        this.filters[field] = { $gt: value };
        break;
      case 'gte':
        this.filters[field] = { $gte: value };
        break;
      case 'lt':
        this.filters[field] = { $lt: value };
        break;
      case 'lte':
        this.filters[field] = { $lte: value };
        break;
      case 'in':
        this.filters[field] = { $in: Array.isArray(value) ? value : [value] };
        break;
      case 'nin':
        this.filters[field] = { $nin: Array.isArray(value) ? value : [value] };
        break;
      case 'regex':
        this.filters[field] = { $regex: new RegExp(value, 'i') };
        break;
      case 'exists':
        this.filters[field] = { $exists: value };
        break;
      default:
        this.filters[field] = value;
    }

    return this;
  }

  /**
   * Add OR conditions
   * @param {Array<Object>} conditions - Array of filter objects
   * @returns {FilterBuilder} - Chainable instance
   */
  addOrConditions(conditions) {
    if (!conditions || conditions.length === 0) {
      return this;
    }

    this.filters.$or = conditions;
    return this;
  }

  /**
   * Add AND conditions
   * @param {Array<Object>} conditions - Array of filter objects
   * @returns {FilterBuilder} - Chainable instance
   */
  addAndConditions(conditions) {
    if (!conditions || conditions.length === 0) {
      return this;
    }

    this.filters.$and = conditions;
    return this;
  }

  /**
   * Set sorting
   * @param {string} field - Field to sort by
   * @param {string|number} order - Sort order ('asc'|'desc'|1|-1)
   * @returns {FilterBuilder} - Chainable instance
   */
  setSort(field, order = 'desc') {
    if (!field) return this;

    const sortValue = order === 'asc' || order === 1 ? 1 : -1;
    this.sortOptions[field] = sortValue;
    return this;
  }

  /**
   * Add multiple sort fields
   * @param {Object} sortFields - Object with field names and sort directions
   * @returns {FilterBuilder} - Chainable instance
   */
  addSorts(sortFields) {
    if (!sortFields || typeof sortFields !== 'object') {
      return this;
    }

    Object.entries(sortFields).forEach(([field, order]) => {
      this.setSort(field, order);
    });

    return this;
  }

  /**
   * Set pagination
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @param {number} maxLimit - Maximum allowed limit
   * @returns {FilterBuilder} - Chainable instance
   */
  setPagination(page = 1, limit = 10, maxLimit = 100) {
    this.paginationOptions = {
      page: Math.max(1, parseInt(page) || 1),
      limit: Math.min(maxLimit, Math.max(1, parseInt(limit) || 10))
    };
    return this;
  }

  /**
   * Add field to populate (for Mongoose populate)
   * @param {string|Object} field - Field to populate or populate options
   * @param {string} select - Fields to select from populated document
   * @returns {FilterBuilder} - Chainable instance
   */
  addPopulate(field, select = null) {
    if (typeof field === 'string') {
      this.populateFields.push(select ? { path: field, select } : field);
    } else {
      this.populateFields.push(field);
    }
    return this;
  }

  /**
   * Set fields to select
   * @param {string|Array<string>} fields - Fields to select
   * @returns {FilterBuilder} - Chainable instance
   */
  setSelect(fields) {
    if (typeof fields === 'string') {
      this.selectFields = fields;
    } else if (Array.isArray(fields)) {
      this.selectFields = fields.join(' ');
    }
    return this;
  }

  /**
   * Get the filter object
   * @returns {Object} - MongoDB filter object
   */
  getFilters() {
    return this.filters;
  }

  /**
   * Get sort options
   * @returns {Object} - MongoDB sort object
   */
  getSortOptions() {
    return this.sortOptions;
  }

  /**
   * Get pagination options
   * @returns {Object} - Pagination options with skip calculated
   */
  getPaginationOptions() {
    const { page, limit } = this.paginationOptions;
    return {
      page,
      limit,
      skip: (page - 1) * limit
    };
  }

  /**
   * Get populate fields
   * @returns {Array} - Fields to populate
   */
  getPopulateFields() {
    return this.populateFields;
  }

  /**
   * Get select fields
   * @returns {string|null} - Fields to select
   */
  getSelectFields() {
    return this.selectFields;
  }

  /**
   * Build complete query options
   * @returns {Object} - Complete query configuration
   */
  build() {
    return {
      filters: this.getFilters(),
      sort: this.getSortOptions(),
      pagination: this.getPaginationOptions(),
      populate: this.getPopulateFields(),
      select: this.getSelectFields()
    };
  }

  /**
   * Execute query on a Mongoose model
   * @param {Model} Model - Mongoose model to query
   * @param {boolean} lean - Whether to return plain JavaScript objects
   * @returns {Promise<Object>} - Query results with pagination
   */
  async execute(Model, lean = true) {
    const { filters, sort, pagination, populate, select } = this.build();

    // Build the query
    let query = Model.find(filters);

    // Apply sorting
    if (Object.keys(sort).length > 0) {
      query = query.sort(sort);
    }

    // Apply pagination
    query = query.skip(pagination.skip).limit(pagination.limit);

    // Apply field selection
    if (select) {
      query = query.select(select);
    }

    // Apply population
    populate.forEach(field => {
      query = query.populate(field);
    });

    // Apply lean if requested
    if (lean) {
      query = query.lean();
    }

    // Execute queries in parallel
    const [documents, total] = await Promise.all([
      query.exec(),
      Model.countDocuments(filters)
    ]);

    return {
      data: documents,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        pages: Math.ceil(total / pagination.limit),
        hasMore: pagination.page < Math.ceil(total / pagination.limit)
      }
    };
  }

  /**
   * Get summary of current filter configuration
   * @returns {Object} - Configuration summary
   */
  getSummary() {
    return {
      filters: this.filters,
      sort: this.sortOptions,
      pagination: this.paginationOptions,
      populate: this.populateFields,
      select: this.selectFields
    };
  }

  /**
   * Reset all filters
   * @returns {FilterBuilder} - Chainable instance
   */
  reset() {
    this.filters = {};
    this.sortOptions = {};
    this.paginationOptions = { page: 1, limit: 10 };
    this.populateFields = [];
    this.selectFields = null;
    return this;
  }

  /**
   * Clone the filter builder
   * @returns {FilterBuilder} - New instance with same configuration
   */
  clone() {
    const cloned = new FilterBuilder(this.query);
    cloned.filters = { ...this.filters };
    cloned.sortOptions = { ...this.sortOptions };
    cloned.paginationOptions = { ...this.paginationOptions };
    cloned.populateFields = [...this.populateFields];
    cloned.selectFields = this.selectFields;
    return cloned;
  }
}

module.exports = FilterBuilder;
