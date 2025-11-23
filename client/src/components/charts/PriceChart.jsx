import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar, ReferenceLine } from "recharts";
import { TrendingUp, TrendingDown, Loader2, Activity } from "lucide-react";
import { getPriceHistory } from "@/services/analysisService";
import { applyIndicators } from "@/utils/technicalIndicators";

export default function PriceChart({ currentPrice, change24h, assetName, assetSymbol, assetType, assetId }) {
  const { t } = useTranslation();
  const [timeframe, setTimeframe] = useState("1M");
  const [priceData, setPriceData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Technical indicators state
  const [indicators, setIndicators] = useState({
    sma: false,
    ema: false,
    rsi: false,
    macd: false
  });

  const [chartData, setChartData] = useState([]);
  const [currentPeriods, setCurrentPeriods] = useState({
    sma: 20,
    ema: 12,
    rsi: 14,
    macdDisplay: '12,26,9'
  });

  // Fetch price data from server
  useEffect(() => {
    fetchPriceData();
  }, [timeframe, assetId]);

  // Recalculate indicators when data or indicator settings change
  useEffect(() => {
    if (priceData.length > 0) {
      // Adaptive periods based on available data
      const dataLength = priceData.length;

      // Use shorter periods for limited data
      let smaPeriod = 20;
      let emaPeriod = 12;
      let rsiPeriod = 14;
      let macdFast = 12;
      let macdSlow = 26;
      let macdSignal = 9;

      // Adjust for short timeframes
      if (dataLength < 50) {
        smaPeriod = Math.min(10, Math.floor(dataLength / 2));
        emaPeriod = Math.min(7, Math.floor(dataLength / 3));
        rsiPeriod = Math.min(9, Math.floor(dataLength / 2));
        macdFast = Math.min(6, Math.floor(dataLength / 4));
        macdSlow = Math.min(12, Math.floor(dataLength / 2));
        macdSignal = Math.min(5, Math.floor(dataLength / 6));
      }

      const data = applyIndicators(priceData, {
        sma: indicators.sma,
        ema: indicators.ema,
        rsi: indicators.rsi,
        macd: indicators.macd,
        smaPeriod,
        emaPeriod,
        rsiPeriod,
        macdFast,
        macdSlow,
        macdSignal
      });
      setChartData(data);

      // Update current periods for display
      setCurrentPeriods({
        sma: smaPeriod,
        ema: emaPeriod,
        rsi: rsiPeriod,
        macdDisplay: `${macdFast},${macdSlow},${macdSignal}`
      });
    }
  }, [priceData, indicators]);

  const fetchPriceData = async () => {
    setLoading(true);
    try {
      const response = await getPriceHistory(assetType, assetId, timeframe);
      setPriceData(response.priceData);
      setStats(response.stats);
    } catch (error) {
      console.error('Error fetching price data:', error);
      // Fallback to empty data
      setPriceData([]);
      setStats({ min: 0, max: 0, average: 0, rangePercent: 0 });
    }
    setLoading(false);
  };

  const toggleIndicator = (indicator) => {
    setIndicators(prev => ({
      ...prev,
      [indicator]: !prev[indicator]
    }));
  };

  const isPositive = change24h >= 0;

  // Format price for display
  const formatPrice = (price) => {
    if (price >= 1) {
      return `$${parseFloat(price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${parseFloat(price).toFixed(6)}`;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-2 sm:p-3 shadow-lg min-w-[150px]">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">
            {data.date || data.time}
          </p>
          <div className="space-y-1">
            <p className="text-sm sm:text-base font-bold text-foreground">
              Price: {formatPrice(data.price)}
            </p>
            {indicators.sma && data.sma && (
              <p className="text-xs text-blue-500">
                SMA: {formatPrice(data.sma)}
              </p>
            )}
            {indicators.ema && data.ema && (
              <p className="text-xs text-purple-500">
                EMA: {formatPrice(data.ema)}
              </p>
            )}
            {indicators.rsi && data.rsi && (
              <p className="text-xs text-orange-500">
                RSI: {data.rsi.toFixed(2)}
              </p>
            )}
            {indicators.macd && data.macd && (
              <div className="text-xs text-pink-500 space-y-0.5">
                <p>MACD: {data.macd.toFixed(4)}</p>
                {data.signal && <p>Signal: {data.signal.toFixed(4)}</p>}
              </div>
            )}
          </div>
          {data.volume && (
            <p className="text-xs text-muted-foreground mt-1 pt-1 border-t border-border">
              Vol: {(data.volume / 1e6).toFixed(2)}M
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Determine chart color based on trend
  const chartColor = isPositive ? "#22c55e" : "#ef4444";
  const gradientId = `gradient-${assetSymbol}`;

  return (
    <Card className="bg-card border-border/60">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-base sm:text-lg md:text-xl">{assetName} Price Chart</span>
              <div className={`flex items-center gap-1 text-xs sm:text-sm font-semibold ${
                isPositive ? 'text-green-500' : 'text-red-500'
              }`}>
                {isPositive ? <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />}
                {isPositive ? '+' : ''}{change24h.toFixed(2)}%
              </div>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Historical price movement with technical indicators
            </CardDescription>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-2xl sm:text-3xl font-bold text-foreground">
              {formatPrice(currentPrice)}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Current Price
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Timeframe Selector */}
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
          <div className="flex gap-1 sm:gap-2">
            {["24H", "7D", "1M", "1Y"].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  timeframe === tf
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Technical Indicators Toggles */}
        <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-border/60">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <Activity size={16} />
            <span className="font-medium">Indicators:</span>
          </div>
          <Button
            size="sm"
            variant={indicators.sma ? "default" : "outline"}
            onClick={() => toggleIndicator('sma')}
            className={`text-xs h-7 ${indicators.sma ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
          >
            SMA({currentPeriods.sma})
          </Button>
          <Button
            size="sm"
            variant={indicators.ema ? "default" : "outline"}
            onClick={() => toggleIndicator('ema')}
            className={`text-xs h-7 ${indicators.ema ? 'bg-purple-500 hover:bg-purple-600' : ''}`}
          >
            EMA({currentPeriods.ema})
          </Button>
          <Button
            size="sm"
            variant={indicators.rsi ? "default" : "outline"}
            onClick={() => toggleIndicator('rsi')}
            className={`text-xs h-7 ${indicators.rsi ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
          >
            RSI({currentPeriods.rsi})
          </Button>
          <Button
            size="sm"
            variant={indicators.macd ? "default" : "outline"}
            onClick={() => toggleIndicator('macd')}
            className={`text-xs h-7 ${indicators.macd ? 'bg-pink-500 hover:bg-pink-600' : ''}`}
          >
            MACD
          </Button>
        </div>

        {/* Price Chart */}
        <div className="w-full h-[250px] sm:h-[350px] md:h-[400px] mt-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis
                  dataKey={timeframe === "24H" ? "time" : "date"}
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                  tickLine={{ stroke: '#9ca3af' }}
                  interval="preserveStartEnd"
                  minTickGap={30}
                />
                <YAxis
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                  tickLine={{ stroke: '#9ca3af' }}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                  domain={['auto', 'auto']}
                  width={60}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={chartColor}
                  strokeWidth={2}
                  fill={`url(#${gradientId})`}
                  animationDuration={1000}
                />
                {indicators.sma && (
                  <Line
                    type="monotone"
                    dataKey="sma"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    name="SMA(20)"
                  />
                )}
                {indicators.ema && (
                  <Line
                    type="monotone"
                    dataKey="ema"
                    stroke="#a855f7"
                    strokeWidth={2}
                    dot={false}
                    name="EMA(12)"
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* RSI Chart */}
        {indicators.rsi && !loading && chartData.length > 0 && (
          <div className="w-full h-[150px] mt-6">
            <div className="text-sm font-medium text-muted-foreground mb-2">RSI ({currentPeriods.rsi})</div>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis
                  dataKey={timeframe === "24H" ? "time" : "date"}
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                  tickLine={{ stroke: '#9ca3af' }}
                  interval="preserveStartEnd"
                  minTickGap={30}
                />
                <YAxis
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                  tickLine={{ stroke: '#9ca3af' }}
                  domain={[0, 100]}
                  ticks={[0, 30, 50, 70, 100]}
                  width={40}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  formatter={(value) => value?.toFixed(2)}
                />
                <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Overbought', fill: '#ef4444', fontSize: 10 }} />
                <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="3 3" label={{ value: 'Oversold', fill: '#22c55e', fontSize: 10 }} />
                <Line
                  type="monotone"
                  dataKey="rsi"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* MACD Chart */}
        {indicators.macd && !loading && chartData.length > 0 && (
          <div className="w-full h-[150px] mt-6">
            <div className="text-sm font-medium text-muted-foreground mb-2">MACD ({currentPeriods.macdDisplay})</div>
            {chartData.some(d => d.macd !== null) ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis
                    dataKey={timeframe === "24H" ? "time" : "date"}
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    tickLine={{ stroke: '#9ca3af' }}
                    interval="preserveStartEnd"
                    minTickGap={30}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    tickLine={{ stroke: '#9ca3af' }}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                    formatter={(value) => value?.toFixed(4)}
                  />
                  <ReferenceLine y={0} stroke="#9ca3af" />
                  <Bar
                    dataKey="histogram"
                    fill="#ec4899"
                    opacity={0.6}
                  />
                  <Line
                    type="monotone"
                    dataKey="macd"
                    stroke="#ec4899"
                    strokeWidth={2}
                    dot={false}
                    name="MACD"
                  />
                  <Line
                    type="monotone"
                    dataKey="signal"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={false}
                    name="Signal"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground border border-border/40 rounded-lg">
                Insufficient data for MACD. Try selecting 1M or 1Y timeframe.
              </div>
            )}
          </div>
        )}

        {/* Price Statistics */}
        {!loading && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Period High</div>
              <div className="text-sm sm:text-base md:text-lg font-semibold text-green-500 break-all">
                {formatPrice(stats.max)}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Period Low</div>
              <div className="text-sm sm:text-base md:text-lg font-semibold text-red-500 break-all">
                {formatPrice(stats.min)}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Average</div>
              <div className="text-sm sm:text-base md:text-lg font-semibold text-foreground break-all">
                {formatPrice(stats.average)}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Volatility</div>
              <div className="text-sm sm:text-base md:text-lg font-semibold text-foreground">
                {stats.rangePercent}%
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
