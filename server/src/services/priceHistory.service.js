/**
 * Price History Service
 * Generates realistic historical price data for charts
 * Server-side module for AI integration
 */

/**
 * Generate historical price data based on current price and trend
 * @param {number} currentPrice - Current asset price
 * @param {number} change24h - 24h price change percentage
 * @param {number} days - Number of days of history to generate
 * @returns {Array} Array of price data points {date, price, volume}
 */
const generatePriceHistory = (currentPrice, change24h, days = 30) => {
  const data = [];
  const now = new Date();

  // Calculate starting price based on current trend
  const dailyChange = change24h / 100;
  const volatility = Math.abs(dailyChange) * 2; // Volatility factor

  // Starting price (working backwards from current)
  let price = currentPrice;

  // Generate data from oldest to newest
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Add some randomness to price movement
    const randomChange = (Math.random() - 0.5) * volatility;
    const trendInfluence = dailyChange * 0.3; // Trend has 30% influence

    // Calculate price change for this day
    const dayChange = trendInfluence + randomChange;
    price = price * (1 - dayChange);

    // Ensure price doesn't go negative
    price = Math.max(price * 0.5, price);

    // Generate volume (higher on volatile days)
    const baseVolume = currentPrice * 1000000;
    const volumeMultiplier = 1 + Math.abs(dayChange) * 10;
    const volume = baseVolume * volumeMultiplier * (0.8 + Math.random() * 0.4);

    data.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(price.toFixed(2)),
      volume: parseInt(volume),
      timestamp: date.getTime()
    });
  }

  return data;
};

/**
 * Generate intraday price data (hourly for last 24h)
 * @param {number} currentPrice - Current asset price
 * @param {number} change24h - 24h price change percentage
 * @returns {Array} Array of hourly price data points
 */
const generateIntradayData = (currentPrice, change24h) => {
  const data = [];
  const now = new Date();
  const hours = 24;

  const hourlyChange = change24h / hours / 100;
  const volatility = Math.abs(hourlyChange) * 3;

  let price = currentPrice / (1 + change24h / 100); // Starting price 24h ago

  for (let i = hours; i >= 0; i--) {
    const date = new Date(now);
    date.setHours(date.getHours() - i);

    const randomChange = (Math.random() - 0.5) * volatility;
    const trendInfluence = hourlyChange;

    price = price * (1 + trendInfluence + randomChange);

    // Format time
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    data.push({
      time: timeStr,
      price: parseFloat(price.toFixed(2)),
      timestamp: date.getTime()
    });
  }

  return data;
};

/**
 * Generate weekly price data (daily for last 7 days)
 * @param {number} currentPrice - Current asset price
 * @param {number} change24h - 24h price change percentage
 * @returns {Array} Array of daily price data points
 */
const generateWeeklyData = (currentPrice, change24h) => {
  return generatePriceHistory(currentPrice, change24h, 7);
};

/**
 * Generate monthly price data (daily for last 30 days)
 * @param {number} currentPrice - Current asset price
 * @param {number} change24h - 24h price change percentage
 * @returns {Array} Array of daily price data points
 */
const generateMonthlyData = (currentPrice, change24h) => {
  return generatePriceHistory(currentPrice, change24h, 30);
};

/**
 * Generate yearly price data (weekly for last year)
 * @param {number} currentPrice - Current asset price
 * @param {number} change24h - 24h price change percentage
 * @returns {Array} Array of weekly price data points
 */
const generateYearlyData = (currentPrice, change24h) => {
  const data = [];
  const now = new Date();
  const weeks = 52;

  const weeklyChange = (change24h * 7) / 100; // Approximate weekly change
  const volatility = Math.abs(weeklyChange) * 1.5;

  // Calculate starting price from 52 weeks ago
  // Work backwards from current price to estimate historical starting point
  const totalChange = weeklyChange * weeks * 0.3;
  let price = currentPrice / (1 + totalChange);

  for (let i = weeks; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - (i * 7));

    const randomChange = (Math.random() - 0.5) * volatility;
    const trendInfluence = weeklyChange * 0.3;

    // Move forward in time by adding the change
    price = price * (1 + (trendInfluence + randomChange));
    price = Math.max(price * 0.1, price); // Ensure price stays positive

    data.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(price.toFixed(2)),
      timestamp: date.getTime()
    });
  }

  return data;
};

/**
 * Calculate price statistics from history
 * @param {Array} priceData - Array of price data points
 * @returns {Object} Statistics (min, max, average, volatility)
 */
const calculatePriceStats = (priceData) => {
  if (!priceData || priceData.length === 0) {
    return { min: 0, max: 0, average: 0, volatility: 0 };
  }

  const prices = priceData.map(d => d.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const average = prices.reduce((a, b) => a + b, 0) / prices.length;

  // Calculate volatility (standard deviation)
  const squareDiffs = prices.map(price => Math.pow(price - average, 2));
  const variance = squareDiffs.reduce((a, b) => a + b, 0) / prices.length;
  const volatility = Math.sqrt(variance);

  return {
    min: min.toFixed(2),
    max: max.toFixed(2),
    average: average.toFixed(2),
    volatility: volatility.toFixed(2),
    range: (max - min).toFixed(2),
    rangePercent: (((max - min) / min) * 100).toFixed(2)
  };
};


module.exports = {
  generatePriceHistory,
  generateIntradayData,
  generateWeeklyData,
  generateMonthlyData,
  generateYearlyData,
  calculatePriceStats
};
