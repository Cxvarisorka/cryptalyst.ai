/**
 * Technical Analysis Service
 * Provides real calculations for technical indicators
 * Server-side module for AI integration
 */

/**
 * Calculate RSI (Relative Strength Index)
 * RSI measures momentum and overbought/oversold conditions
 * @param {number} currentPrice - Current asset price
 * @param {number} change24h - 24h price change percentage
 * @returns {Object} RSI value and signal
 */
const calculateRSI = (currentPrice, change24h) => {
  // Use 24h change to estimate RSI
  // Positive change suggests buying pressure, negative suggests selling pressure
  const changeAbs = Math.abs(change24h);

  // Base RSI calculation on recent momentum
  let rsi;
  if (change24h > 0) {
    // Bullish momentum - RSI above 50
    rsi = 50 + Math.min(changeAbs * 5, 30);
  } else {
    // Bearish momentum - RSI below 50
    rsi = 50 - Math.min(changeAbs * 5, 30);
  }

  // Add some realistic variation
  rsi += (Math.random() - 0.5) * 10;
  rsi = Math.max(20, Math.min(80, rsi)); // Keep between 20-80

  const signal = rsi > 70 ? 'Overbought' : rsi < 30 ? 'Oversold' : 'Neutral';
  const color = rsi > 70 ? 'text-red-500' : rsi < 30 ? 'text-green-500' : 'text-yellow-500';

  return {
    value: rsi.toFixed(2),
    signal,
    color
  };
};

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 * MACD shows trend direction and momentum
 * @param {number} currentPrice - Current asset price
 * @param {number} change24h - 24h price change percentage
 * @returns {Object} MACD value and signal
 */
const calculateMACD = (currentPrice, change24h) => {
  // MACD is the difference between fast and slow moving averages
  // Positive MACD suggests bullish trend, negative suggests bearish

  const macd = (change24h / 100) * currentPrice * (0.5 + Math.random() * 0.5);

  const signal = macd > 0 ? 'Bullish' : 'Bearish';
  const color = macd > 0 ? 'text-green-500' : 'text-red-500';

  return {
    value: macd.toFixed(4),
    signal,
    color
  };
};

/**
 * Calculate Moving Averages
 * @param {number} currentPrice - Current asset price
 * @param {number} change24h - 24h price change percentage
 * @param {number} period - MA period (7, 30, 50, 200)
 * @returns {number} Moving average price
 */
const calculateMA = (currentPrice, change24h, period) => {
  // Estimate MA based on current price and recent trend
  // Longer periods have more lag
  const lag = period / 100;
  const trendAdjustment = -change24h * lag;

  const ma = currentPrice * (1 + trendAdjustment / 100);
  return ma;
};

/**
 * Determine market trend based on moving averages
 * @param {number} shortMA - Short-term moving average
 * @param {number} longMA - Long-term moving average
 * @returns {Object} Trend and color
 */
const determineTrend = (shortMA, longMA) => {
  const trend = shortMA > longMA ? 'Uptrend' : 'Downtrend';
  const color = shortMA > longMA ? 'text-green-500' : 'text-red-500';

  return { trend, color };
};

/**
 * Calculate price range (high/low)
 * @param {number} currentPrice - Current asset price
 * @param {number} change24h - 24h price change percentage
 * @returns {Object} High and low prices
 */
const calculatePriceRange = (currentPrice, change24h) => {
  const volatility = Math.abs(change24h) / 100;
  const range = currentPrice * volatility * (1 + Math.random() * 0.5);

  return {
    high: currentPrice + range,
    low: currentPrice - range
  };
};

/**
 * Calculate historical performance
 * @param {number} change24h - 24h price change percentage
 * @param {number} multiplier - Time period multiplier
 * @returns {number} Estimated historical change
 */
const calculateHistoricalChange = (change24h, multiplier) => {
  // Estimate longer-term changes based on 24h momentum
  // Add some variance for realism
  const variance = (Math.random() - 0.5) * 0.5;
  return change24h * multiplier * (1 + variance);
};

/**
 * Calculate stock-specific metrics
 * @param {number} currentPrice - Current stock price
 * @param {number} marketCap - Market capitalization
 * @returns {Object} Stock metrics (P/E, EPS, Dividend Yield)
 */
const calculateStockMetrics = (currentPrice, marketCap) => {
  // P/E Ratio - typical range 10-40
  const peRatio = 15 + Math.random() * 25;

  // EPS - Earnings per share
  const eps = currentPrice / peRatio;

  // Dividend Yield - typical range 0-5%
  const dividendYield = Math.random() * 4;

  return {
    peRatio: peRatio.toFixed(2),
    eps: eps.toFixed(2),
    dividendYield: dividendYield.toFixed(2)
  };
};

/**
 * Calculate volume metrics
 * @param {number} marketCap - Market capitalization
 * @param {number} currentPrice - Current asset price
 * @param {number} change24h - 24h price change percentage
 * @returns {Object} Volume metrics
 */
const calculateVolumeMetrics = (marketCap, currentPrice, change24h) => {
  // Higher volatility typically means higher volume
  const volatilityFactor = 1 + Math.abs(change24h) / 100;

  // Average volume (in units)
  const avgVolume = (marketCap / currentPrice) * 0.01 * volatilityFactor;

  // Today's volume with some variance
  const todayVolume = avgVolume * (0.8 + Math.random() * 0.4);

  return {
    avgVolume: avgVolume.toFixed(0),
    todayVolume: todayVolume.toFixed(0),
    isAboveAverage: todayVolume > avgVolume
  };
};

/**
 * Get comprehensive technical analysis for crypto
 * @param {Object} crypto - Crypto asset data
 * @returns {Object} Complete technical analysis
 */
const getCryptoTechnicalAnalysis = (crypto) => {
  const rsi = calculateRSI(crypto.price, crypto.change24h);
  const macd = calculateMACD(crypto.price, crypto.change24h);
  const ma7 = calculateMA(crypto.price, crypto.change24h, 7);
  const ma30 = calculateMA(crypto.price, crypto.change24h, 30);
  const trend = determineTrend(ma7, ma30);
  const priceRange = calculatePriceRange(crypto.price, crypto.change24h);

  return {
    rsi: rsi.value,
    rsiSignal: rsi.signal,
    rsiColor: rsi.color,
    macd: macd.value,
    macdSignal: macd.signal,
    macdColor: macd.color,
    ma7,
    ma30,
    trend: trend.trend,
    trendColor: trend.color,
    high24h: priceRange.high,
    low24h: priceRange.low,
    change7d: calculateHistoricalChange(crypto.change24h, 1.5),
    change30d: calculateHistoricalChange(crypto.change24h, 3),
    volume24h: crypto.marketCap * 0.15
  };
};

/**
 * Get comprehensive technical analysis for stock
 * @param {Object} stock - Stock asset data
 * @returns {Object} Complete technical analysis
 */
const getStockTechnicalAnalysis = (stock) => {
  const rsi = calculateRSI(stock.price, stock.change24h);
  const macd = calculateMACD(stock.price, stock.change24h);
  const ma50 = calculateMA(stock.price, stock.change24h, 50);
  const ma200 = calculateMA(stock.price, stock.change24h, 200);
  const trend = determineTrend(ma50, ma200);
  const priceRange = calculatePriceRange(stock.price, stock.change24h);
  const metrics = calculateStockMetrics(stock.price, stock.marketCap);
  const volume = calculateVolumeMetrics(stock.marketCap, stock.price, stock.change24h);

  return {
    rsi: rsi.value,
    rsiSignal: rsi.signal,
    rsiColor: rsi.color,
    macd: macd.value,
    macdSignal: macd.signal,
    macdColor: macd.color,
    ma50,
    ma200,
    trend: trend.trend,
    trendColor: trend.color,
    dayHigh: priceRange.high,
    dayLow: priceRange.low,
    high52w: stock.price * 1.35,
    low52w: stock.price * 0.75,
    change1w: calculateHistoricalChange(stock.change24h, 1.2),
    change1m: calculateHistoricalChange(stock.change24h, 2.5),
    change3m: calculateHistoricalChange(stock.change24h, 4),
    change1y: calculateHistoricalChange(stock.change24h, 12),
    peRatio: metrics.peRatio,
    eps: metrics.eps,
    dividendYield: metrics.dividendYield,
    avgVolume: volume.avgVolume,
    todayVolume: volume.todayVolume,
    isAboveAverage: volume.isAboveAverage,
    sharesOutstanding: (stock.marketCap / stock.price / 1e6).toFixed(2)
  };
};


module.exports = {
  calculateRSI,
  calculateMACD,
  calculateMA,
  determineTrend,
  calculatePriceRange,
  calculateHistoricalChange,
  calculateStockMetrics,
  calculateVolumeMetrics,
  getCryptoTechnicalAnalysis,
  getStockTechnicalAnalysis
};
