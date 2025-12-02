# Redis Caching Setup Guide

This guide explains how to configure Redis caching for Cryptalyst.

## Overview

The application now uses Redis for caching market data and news, providing:
- **Faster response times** - Data served from cache instead of API calls
- **Real-time updates** - Socket.io broadcasts price updates to all connected clients
- **Reduced API usage** - Fewer calls to external APIs (CoinGecko, Finnhub, Marketaux)
- **Scalability** - Shared cache across multiple server instances

## Required Environment Variables

Add these variables to your `server/.env` file:

```env
# Redis Configuration (Cloud Redis)
REDIS_HOST=your-redis-host.cloud.redislabs.com
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_USERNAME=default              # Optional: For Redis 6+ ACL
REDIS_TLS=true                      # Set to 'true' for cloud Redis with TLS
```

## Cloud Redis Providers

### Option 1: Redis Cloud (Recommended)
1. Sign up at [Redis Cloud](https://redis.com/try-free/)
2. Create a free database (30MB free tier)
3. Copy the connection details:
   - **Endpoint** → REDIS_HOST (e.g., `redis-12345.c123.us-east-1-1.ec2.cloud.redislabs.com`)
   - **Port** → REDIS_PORT (usually `6379`)
   - **Password** → REDIS_PASSWORD
4. Enable TLS: Set `REDIS_TLS=true`

### Option 2: Upstash
1. Sign up at [Upstash](https://upstash.com/)
2. Create a Redis database
3. Copy connection details from the dashboard
4. Set `REDIS_TLS=true`

### Option 3: AWS ElastiCache
1. Create an ElastiCache Redis cluster
2. Use the primary endpoint as REDIS_HOST
3. If using auth: Set REDIS_PASSWORD
4. If in VPC: Ensure your server can access it

### Option 4: Local Redis (Development Only)
```env
REDIS_HOST=localhost
REDIS_PORT=6379
# No password needed for local development
# REDIS_TLS not needed
```

Install Redis locally:
- **Windows**: Download from [redis.io](https://redis.io/download) or use WSL
- **Mac**: `brew install redis && brew services start redis`
- **Linux**: `sudo apt-get install redis-server`

## Cache Keys Structure

The application uses these Redis key patterns:

### Market Data
- `market:crypto:all` - All cryptocurrency data (250 coins)
- `market:stock:all` - All stock data (20 stocks)
- `market:crypto:lastUpdate` - Last update timestamp for crypto
- `market:stock:lastUpdate` - Last update timestamp for stocks

### News Data
- `news:crypto:{symbol}:{limit}` - Crypto news (e.g., `news:crypto:BTC:10`)
- `news:stock:{symbol}:{limit}` - Stock news (e.g., `news:stock:AAPL:10`)

## Cache TTL (Time to Live)

- **Market Data**: 1 hour (3600 seconds)
- **News Data**: 15 minutes (900 seconds)

Redis automatically removes expired keys.

## Real-Time Updates

### Server Side
The market data service:
1. Fetches fresh data from APIs every 10 seconds
2. Updates Redis cache
3. Emits Socket.io events to all connected clients

### Client Side
Components listen for Socket.io events:
- `market:crypto:update` - Crypto price updates
- `market:stock:update` - Stock price updates

Updated components:
- `Dashboard.jsx` - Portfolio and market data
- `MarketOverview.jsx` - Home page market overview

## Testing the Setup

1. Start your server with Redis configured:
   ```bash
   cd server
   npm run dev
   ```

2. Look for these console messages:
   ```
   ✅ Redis client connected to cloud instance
   ✅ Redis client ready
   ✅ Socket.io instance set in MarketDataService
   ```

3. Open the client and watch the browser console:
   ```bash
   cd client
   npm run dev
   ```

4. You should see:
   ```
   ✅ Socket.io connected successfully
   📡 Received crypto price update
   📡 Received stock price update
   ```

## Monitoring Redis

### Check cache status
You can use a Redis GUI client:
- [RedisInsight](https://redis.com/redis-enterprise/redis-insight/) (Free, official)
- [AnotherRedisDesktopManager](https://github.com/qishibo/AnotherRedisDesktopManager)

### CLI commands
```bash
# Connect to Redis
redis-cli -h your-host -p 6379 -a your-password

# View all keys
KEYS *

# Check specific key
GET "market:crypto:all"

# Check TTL
TTL "market:crypto:all"

# Clear all cache (use with caution!)
FLUSHALL
```

## Troubleshooting

### Connection errors
```
❌ Redis client error: getaddrinfo ENOTFOUND
```
**Solution**: Check REDIS_HOST is correct

### Authentication errors
```
❌ Redis client error: WRONGPASS invalid username-password pair
```
**Solution**: Verify REDIS_PASSWORD is correct

### TLS errors
```
❌ Redis client error: unable to verify the first certificate
```
**Solution**: Set `REDIS_TLS=true` for cloud Redis

### Socket.io not emitting updates
**Check**:
1. Redis is connected
2. Market data service is running
3. Socket.io initialization succeeded
4. Client is authenticated (needs valid JWT token)

## Production Considerations

1. **Use a persistent Redis instance** - Don't use in-memory mode
2. **Enable eviction policies** - Set `maxmemory-policy allkeys-lru`
3. **Monitor memory usage** - Ensure your tier has enough capacity
4. **Use connection pooling** - ioredis handles this automatically
5. **Enable TLS** - Always use encrypted connections for cloud Redis
6. **Backup your Redis data** - Most cloud providers offer automatic backups

## Next Steps

Once Redis is working:
1. Monitor cache hit rates in production
2. Adjust TTL values based on your API rate limits
3. Consider caching additional data:
   - User portfolio calculations
   - Technical analysis results
   - AI-generated insights

## Support

If you encounter issues:
1. Check server logs for Redis connection errors
2. Verify environment variables are loaded: `console.log(process.env.REDIS_HOST)`
3. Test Redis connection with `redis-cli` or RedisInsight
4. Ensure firewall allows connections to Redis port
