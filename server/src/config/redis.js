const Redis = require('ioredis');

// Redis client configuration for cloud Redis (e.g., Redis Cloud, Upstash, AWS ElastiCache)
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  username: process.env.REDIS_USERNAME || undefined, // For Redis 6+ ACL
  tls: process.env.REDIS_TLS === 'true' ? {
    rejectUnauthorized: false // Allow self-signed certificates for cloud Redis
  } : undefined,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
  connectTimeout: 10000, // 10 second connection timeout
  keepAlive: 30000 // Keep connection alive
};

// Create Redis client
const redisClient = new Redis(redisConfig);

// Event handlers
redisClient.on('connect', () => {
  console.log('✅ Redis client connected to cloud instance');
});

redisClient.on('ready', () => {
  console.log('✅ Redis client ready');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis client error:', err.message);
});

redisClient.on('close', () => {
  console.log('⚠️ Redis client connection closed');
});

redisClient.on('reconnecting', () => {
  console.log('🔄 Redis client reconnecting...');
});

// Cache helper functions
const cache = {
  /**
   * Set a value in cache with optional TTL (in seconds)
   */
  async set(key, value, ttl = null) {
    try {
      const stringValue = JSON.stringify(value);
      if (ttl) {
        await redisClient.setex(key, ttl, stringValue);
      } else {
        await redisClient.set(key, stringValue);
      }
      return true;
    } catch (error) {
      console.error(`Redis SET error for key ${key}:`, error.message);
      return false;
    }
  },

  /**
   * Get a value from cache
   */
  async get(key) {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Redis GET error for key ${key}:`, error.message);
      return null;
    }
  },

  /**
   * Delete a key from cache
   */
  async del(key) {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error(`Redis DEL error for key ${key}:`, error.message);
      return false;
    }
  },

  /**
   * Delete multiple keys matching a pattern
   */
  async delPattern(pattern) {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
      return true;
    } catch (error) {
      console.error(`Redis DEL pattern error for ${pattern}:`, error.message);
      return false;
    }
  },

  /**
   * Check if key exists
   */
  async exists(key) {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Redis EXISTS error for key ${key}:`, error.message);
      return false;
    }
  },

  /**
   * Set expiration time for a key (in seconds)
   */
  async expire(key, ttl) {
    try {
      await redisClient.expire(key, ttl);
      return true;
    } catch (error) {
      console.error(`Redis EXPIRE error for key ${key}:`, error.message);
      return false;
    }
  },

  /**
   * Get all keys matching a pattern
   */
  async keys(pattern) {
    try {
      return await redisClient.keys(pattern);
    } catch (error) {
      console.error(`Redis KEYS error for pattern ${pattern}:`, error.message);
      return [];
    }
  },

  /**
   * Flush all cache (use with caution!)
   */
  async flushAll() {
    try {
      await redisClient.flushall();
      return true;
    } catch (error) {
      console.error('Redis FLUSHALL error:', error.message);
      return false;
    }
  }
};

// Graceful shutdown
const shutdown = async () => {
  try {
    await redisClient.quit();
    console.log('✅ Redis client disconnected gracefully');
  } catch (error) {
    console.error('❌ Error during Redis shutdown:', error.message);
  }
};

module.exports = {
  redisClient,
  cache,
  shutdown
};
