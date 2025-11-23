/**
 * Technical Analysis Indicators
 * Calculations for SMA, EMA, RSI, MACD
 */

/**
 * Calculate Simple Moving Average (SMA)
 * @param {Array} data - Array of price data
 * @param {number} period - Period for calculation (default: 20)
 * @returns {Array} Array with SMA values
 */
export const calculateSMA = (data, period = 20) => {
  if (!data || data.length < period) return [];

  const result = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push({ ...data[i], sma: null });
      continue;
    }

    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].price;
    }

    result.push({
      ...data[i],
      sma: sum / period
    });
  }

  return result;
};

/**
 * Calculate Exponential Moving Average (EMA)
 * @param {Array} data - Array of price data
 * @param {number} period - Period for calculation (default: 12)
 * @returns {Array} Array with EMA values
 */
export const calculateEMA = (data, period = 12) => {
  if (!data || data.length < period) return [];

  const multiplier = 2 / (period + 1);
  const result = [];

  // Calculate initial SMA for first EMA value
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i].price;
    result.push({ ...data[i], ema: null });
  }

  let ema = sum / period;
  result[period - 1] = { ...data[period - 1], ema };

  // Calculate EMA for remaining data
  for (let i = period; i < data.length; i++) {
    ema = (data[i].price - ema) * multiplier + ema;
    result.push({ ...data[i], ema });
  }

  return result;
};

/**
 * Calculate Relative Strength Index (RSI)
 * @param {Array} data - Array of price data
 * @param {number} period - Period for calculation (default: 14)
 * @returns {Array} Array with RSI values
 */
export const calculateRSI = (data, period = 14) => {
  if (!data || data.length < period + 1) return [];

  const result = [];
  let gains = [];
  let losses = [];

  // Calculate price changes
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      result.push({ ...data[i], rsi: null });
      continue;
    }

    const change = data[i].price - data[i - 1].price;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);

    if (i < period) {
      result.push({ ...data[i], rsi: null });
      continue;
    }

    // Calculate average gain and loss
    const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;

    // Calculate RS and RSI
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    result.push({ ...data[i], rsi });
  }

  return result;
};

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 * @param {Array} data - Array of price data
 * @param {number} fastPeriod - Fast EMA period (default: 12)
 * @param {number} slowPeriod - Slow EMA period (default: 26)
 * @param {number} signalPeriod - Signal line period (default: 9)
 * @returns {Array} Array with MACD values
 */
export const calculateMACD = (data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) => {
  if (!data || data.length < slowPeriod + signalPeriod) return [];

  // Calculate fast and slow EMAs
  const fastMultiplier = 2 / (fastPeriod + 1);
  const slowMultiplier = 2 / (slowPeriod + 1);

  let fastEMA = data.slice(0, fastPeriod).reduce((sum, d) => sum + d.price, 0) / fastPeriod;
  let slowEMA = data.slice(0, slowPeriod).reduce((sum, d) => sum + d.price, 0) / slowPeriod;

  const macdLine = [];
  const result = [];

  for (let i = 0; i < data.length; i++) {
    if (i < slowPeriod - 1) {
      result.push({ ...data[i], macd: null, signal: null, histogram: null });
      continue;
    }

    // Update EMAs
    if (i >= fastPeriod) {
      fastEMA = (data[i].price - fastEMA) * fastMultiplier + fastEMA;
    }
    if (i >= slowPeriod) {
      slowEMA = (data[i].price - slowEMA) * slowMultiplier + slowEMA;
    }

    // Calculate MACD line
    const macd = fastEMA - slowEMA;
    macdLine.push(macd);

    // Calculate signal line (EMA of MACD)
    let signal = null;
    let histogram = null;

    if (macdLine.length >= signalPeriod) {
      if (macdLine.length === signalPeriod) {
        signal = macdLine.reduce((sum, val) => sum + val, 0) / signalPeriod;
      } else {
        const signalMultiplier = 2 / (signalPeriod + 1);
        const prevSignal = result[i - 1].signal;
        signal = (macd - prevSignal) * signalMultiplier + prevSignal;
      }
      histogram = macd - signal;
    }

    result.push({ ...data[i], macd, signal, histogram });
  }

  return result;
};

/**
 * Apply all indicators to price data
 * @param {Array} data - Array of price data
 * @param {Object} indicators - Object with indicator settings
 * @returns {Array} Array with all indicator values
 */
export const applyIndicators = (data, indicators = {}) => {
  if (!data || data.length === 0) return [];

  let result = [...data];

  // Apply SMA
  if (indicators.sma) {
    const smaData = calculateSMA(data, indicators.smaPeriod || 20);
    if (smaData.length > 0) {
      result = smaData;
    }
  }

  // Apply EMA (merge with existing result)
  if (indicators.ema) {
    const emaData = calculateEMA(data, indicators.emaPeriod || 12);
    if (emaData.length > 0) {
      result = result.map((item, index) => ({
        ...item,
        ema: emaData[index]?.ema || null
      }));
    }
  }

  // Apply RSI (merge with existing result)
  if (indicators.rsi) {
    const rsiData = calculateRSI(data, indicators.rsiPeriod || 14);
    if (rsiData.length > 0) {
      result = result.map((item, index) => ({
        ...item,
        rsi: rsiData[index]?.rsi || null
      }));
    }
  }

  // Apply MACD (merge with existing result)
  if (indicators.macd) {
    const macdData = calculateMACD(
      data,
      indicators.macdFast || 12,
      indicators.macdSlow || 26,
      indicators.macdSignal || 9
    );
    if (macdData.length > 0) {
      result = result.map((item, index) => ({
        ...item,
        macd: macdData[index]?.macd || null,
        signal: macdData[index]?.signal || null,
        histogram: macdData[index]?.histogram || null
      }));
    }
  }

  return result;
};
