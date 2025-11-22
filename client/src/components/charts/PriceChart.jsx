import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { getPriceHistory } from "@/services/analysisService";

export default function PriceChart({ currentPrice, change24h, assetName, assetSymbol, assetType, assetId }) {
  const { t } = useTranslation();
  const [timeframe, setTimeframe] = useState("1M");
  const [priceData, setPriceData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch price data from server
  useEffect(() => {
    fetchPriceData();
  }, [timeframe, assetId]);

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
        <div className="bg-card border border-border rounded-lg p-2 sm:p-3 shadow-lg">
          <p className="text-xs sm:text-sm text-muted-foreground">
            {data.date || data.time}
          </p>
          <p className="text-sm sm:text-base md:text-lg font-bold text-foreground break-all">
            {formatPrice(data.price)}
          </p>
          {data.volume && (
            <p className="text-xs text-muted-foreground">
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
              Historical price movement
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
        <div className="flex gap-1 sm:gap-2 mb-4 overflow-x-auto">
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

        {/* Chart */}
        <div className="w-full h-[250px] sm:h-[350px] md:h-[400px] mt-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={priceData}>
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
            </AreaChart>
          </ResponsiveContainer>
          )}
        </div>

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
