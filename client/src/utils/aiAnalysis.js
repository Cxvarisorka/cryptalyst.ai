/**
 * AI Analysis Simulator
 * Generates mock AI-powered analysis based on technical indicators, news, and price data
 */

/**
 * Analyze sentiment from news articles
 */
const analyzeNewsSentiment = (news) => {
  if (!news || news.length === 0) {
    return { score: 50, sentiment: 'neutral', confidence: 0 };
  }

  // Simulate sentiment analysis based on news count and keywords
  const positiveWords = ['growth', 'surge', 'gain', 'profit', 'success', 'bullish', 'up', 'high'];
  const negativeWords = ['loss', 'decline', 'drop', 'fall', 'bearish', 'down', 'crash', 'risk'];

  let positiveCount = 0;
  let negativeCount = 0;

  news.forEach(article => {
    const text = (article.title + ' ' + article.description).toLowerCase();
    positiveWords.forEach(word => {
      if (text.includes(word)) positiveCount++;
    });
    negativeWords.forEach(word => {
      if (text.includes(word)) negativeCount++;
    });
  });

  const total = positiveCount + negativeCount;
  const score = total > 0 ? (positiveCount / total) * 100 : 50;

  let sentiment = 'neutral';
  if (score > 65) sentiment = 'bullish';
  else if (score < 35) sentiment = 'bearish';

  return {
    score: Math.round(score),
    sentiment,
    confidence: Math.min(news.length * 10, 95),
    newsCount: news.length
  };
};

/**
 * Analyze technical indicators
 */
const analyzeTechnicalIndicators = (chartData, currentPrice) => {
  if (!chartData || chartData.length === 0) {
    return { score: 50, signals: [], trend: 'neutral' };
  }

  const signals = [];
  let bullishCount = 0;
  let bearishCount = 0;

  // Get latest data point with indicators
  const latest = chartData[chartData.length - 1];
  const previous = chartData[chartData.length - 2];

  // SMA Analysis
  if (latest.sma) {
    if (currentPrice > latest.sma) {
      signals.push({ indicator: 'SMA', signal: 'Bullish', description: 'Price above moving average' });
      bullishCount++;
    } else {
      signals.push({ indicator: 'SMA', signal: 'Bearish', description: 'Price below moving average' });
      bearishCount++;
    }
  }

  // EMA Analysis
  if (latest.ema) {
    if (currentPrice > latest.ema) {
      signals.push({ indicator: 'EMA', signal: 'Bullish', description: 'Price above exponential MA' });
      bullishCount++;
    } else {
      signals.push({ indicator: 'EMA', signal: 'Bearish', description: 'Price below exponential MA' });
      bearishCount++;
    }
  }

  // RSI Analysis
  if (latest.rsi) {
    if (latest.rsi > 70) {
      signals.push({ indicator: 'RSI', signal: 'Overbought', description: `RSI at ${latest.rsi.toFixed(1)} - potential reversal` });
      bearishCount++;
    } else if (latest.rsi < 30) {
      signals.push({ indicator: 'RSI', signal: 'Oversold', description: `RSI at ${latest.rsi.toFixed(1)} - potential bounce` });
      bullishCount++;
    } else {
      signals.push({ indicator: 'RSI', signal: 'Neutral', description: `RSI at ${latest.rsi.toFixed(1)} - balanced` });
    }
  }

  // MACD Analysis
  if (latest.macd && latest.signal && previous?.macd && previous?.signal) {
    const currentCross = latest.macd - latest.signal;
    const previousCross = previous.macd - previous.signal;

    if (previousCross < 0 && currentCross > 0) {
      signals.push({ indicator: 'MACD', signal: 'Bullish Crossover', description: 'MACD crossed above signal line' });
      bullishCount += 2; // Crossovers are stronger signals
    } else if (previousCross > 0 && currentCross < 0) {
      signals.push({ indicator: 'MACD', signal: 'Bearish Crossover', description: 'MACD crossed below signal line' });
      bearishCount += 2;
    } else if (latest.macd > latest.signal) {
      signals.push({ indicator: 'MACD', signal: 'Bullish', description: 'MACD above signal line' });
      bullishCount++;
    } else {
      signals.push({ indicator: 'MACD', signal: 'Bearish', description: 'MACD below signal line' });
      bearishCount++;
    }
  }

  const total = bullishCount + bearishCount;
  const score = total > 0 ? (bullishCount / total) * 100 : 50;

  let trend = 'neutral';
  if (score > 60) trend = 'bullish';
  else if (score < 40) trend = 'bearish';

  return {
    score: Math.round(score),
    signals,
    trend,
    bullishCount,
    bearishCount
  };
};

/**
 * Calculate price targets and support/resistance levels
 */
const calculatePriceTargets = (priceHistory, currentPrice, stats) => {
  // Safe defaults
  const rangePercent = typeof stats?.rangePercent === 'number' ? stats.rangePercent : 10;
  const max = typeof stats?.max === 'number' ? stats.max : currentPrice * 1.1;
  const min = typeof stats?.min === 'number' ? stats.min : currentPrice * 0.9;

  const volatility = rangePercent / 100;

  // Calculate targets based on volatility and recent range
  const upside = currentPrice * (1 + (volatility * 0.5));
  const downside = currentPrice * (1 - (volatility * 0.5));

  return {
    currentPrice,
    resistance1: Math.min(upside, max * 0.98),
    resistance2: max,
    support1: Math.max(downside, min * 1.02),
    support2: min,
    targetPrice: currentPrice * (1 + (volatility * 0.3))
  };
};

/**
 * Assess risk level
 */
const assessRisk = (volatility, sentiment, technical) => {
  let riskScore = 0;

  // Safe volatility value
  const vol = typeof volatility === 'number' ? volatility : 10;

  // Volatility contributes to risk
  if (vol > 20) riskScore += 40;
  else if (vol > 10) riskScore += 25;
  else riskScore += 10;

  // Sentiment contributes to risk (extreme sentiment = higher risk)
  const sentimentScore = typeof sentiment?.score === 'number' ? sentiment.score : 50;
  const sentimentExtreme = Math.abs(sentimentScore - 50);
  riskScore += sentimentExtreme * 0.3;

  // Technical uncertainty contributes to risk
  const technicalScore = typeof technical?.score === 'number' ? technical.score : 50;
  const technicalUncertainty = Math.abs(technicalScore - 50);
  riskScore += (50 - technicalUncertainty) * 0.4;

  let level = 'Low';
  if (riskScore > 60) level = 'High';
  else if (riskScore > 35) level = 'Medium';

  return {
    level,
    score: Math.min(Math.round(riskScore), 100)
  };
};

/**
 * Generate recommendation
 */
const generateRecommendation = (sentiment, technical, risk) => {
  const overallScore = (sentiment.score + technical.score) / 2;

  let action = 'HOLD';
  let confidence = 0;
  let reasoning = [];

  if (overallScore > 65 && risk.level !== 'High') {
    action = 'BUY';
    confidence = Math.min(Math.round((overallScore - 50) * 1.5), 95);
    reasoning.push('Strong technical indicators');
    if (sentiment.sentiment === 'bullish') reasoning.push('Positive market sentiment');
  } else if (overallScore < 35) {
    action = 'SELL';
    confidence = Math.min(Math.round((50 - overallScore) * 1.5), 95);
    reasoning.push('Weak technical indicators');
    if (sentiment.sentiment === 'bearish') reasoning.push('Negative market sentiment');
  } else {
    action = 'HOLD';
    confidence = Math.min(60 + Math.abs(overallScore - 50), 75);
    reasoning.push('Mixed signals in the market');
    reasoning.push('Wait for clearer trend');
  }

  return {
    action,
    confidence,
    reasoning,
    overallScore: Math.round(overallScore)
  };
};

/**
 * Main analysis function
 */
export const generateAIAnalysis = ({
  assetName,
  assetSymbol,
  assetType,
  currentPrice,
  change24h,
  priceHistory,
  stats,
  news,
  chartData
}) => {
  // Analyze different aspects
  const sentiment = analyzeNewsSentiment(news);
  const technical = analyzeTechnicalIndicators(chartData, currentPrice);
  const priceTargets = calculatePriceTargets(priceHistory, currentPrice, stats);
  const risk = assessRisk(stats.rangePercent, sentiment, technical);
  const recommendation = generateRecommendation(sentiment, technical, risk);

  // Generate insights
  const insights = [];

  if (sentiment.sentiment === 'bullish') {
    insights.push(`Recent news coverage shows ${sentiment.confidence}% positive sentiment`);
  } else if (sentiment.sentiment === 'bearish') {
    insights.push(`Market sentiment appears cautious with ${100 - sentiment.score}% negative indicators`);
  }

  if (technical.trend === 'bullish') {
    insights.push(`Technical analysis shows ${technical.bullishCount} bullish signals`);
  } else if (technical.trend === 'bearish') {
    insights.push(`${technical.bearishCount} bearish technical indicators detected`);
  }

  const rangePercent = typeof stats?.rangePercent === 'number' ? stats.rangePercent : 10;
  insights.push(`Current volatility at ${rangePercent.toFixed(1)}% suggests ${risk.level.toLowerCase()} risk profile`);

  if (Math.abs(change24h) > 5) {
    insights.push(`Strong ${change24h > 0 ? 'upward' : 'downward'} momentum with ${Math.abs(change24h).toFixed(1)}% daily change`);
  }

  return {
    metadata: {
      assetName,
      assetSymbol,
      assetType,
      currentPrice,
      change24h,
      generatedAt: new Date().toISOString(),
      timeframe: '24H - 1Y Analysis'
    },
    sentiment,
    technical,
    priceTargets,
    risk,
    recommendation,
    insights,
    summary: `Based on comprehensive analysis of technical indicators, market sentiment, and price action, ${assetName} shows a ${recommendation.action} signal with ${recommendation.confidence}% confidence. ${insights[0]}`
  };
};

/**
 * Format analysis for display
 */
export const formatAnalysisForDisplay = (analysis) => {
  return {
    ...analysis,
    formattedPrice: `$${analysis.metadata.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    formattedChange: `${analysis.metadata.change24h >= 0 ? '+' : ''}${analysis.metadata.change24h.toFixed(2)}%`,
    formattedDate: new Date(analysis.metadata.generatedAt).toLocaleString()
  };
};
