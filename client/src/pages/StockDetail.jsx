import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/magicui/fade-in";
import { ArrowLeft, TrendingUp, TrendingDown, Loader2, BarChart3, LineChart, PieChart, Activity, DollarSign } from "lucide-react";
import { getStockBySymbol } from "@/services/marketDataService";
import { getPriceHistory } from "@/services/analysisService";
import { getStockNews } from "@/services/newsService";
import PriceChart from "@/components/charts/PriceChart";
import NewsSection from "@/components/news/NewsSection";
import AIAnalysis from "@/components/analysis/AIAnalysis";
import CreatePriceAlertButton from "@/components/alerts/CreatePriceAlertButton";
import AssetPriceAlerts from "@/components/alerts/AssetPriceAlerts";
import Hero from "@/components/layout/Hero";
import ScalpingAnalysisButton from "@/components/analysis/ScalpingAnalysisButton";
import { useOnboardingTracker } from "@/hooks/useOnboardingTracker";
import { AIUsageBadge } from "@/components/ai/AIUsageDisplay";

export default function StockDetail() {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { completeTask } = useOnboardingTracker();
  const [stock, setStock] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(true);
  const [priceHistory, setPriceHistory] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStockDetail();
    fetchNews();
    fetchPriceHistory();
  }, [symbol]);

  const fetchPriceHistory = async () => {
    try {
      const response = await getPriceHistory('stock', symbol, '1M');
      setPriceHistory(response.priceData || []);
      setStats(response.stats || {});
    } catch (error) {
      console.error('Error fetching price history:', error);
    }
  };

  const fetchStockDetail = async () => {
    setLoading(true);
    console.log('Fetching stock detail for symbol:', symbol);

    try {
      // Fetch stock data directly by symbol from server
      const stockData = await getStockBySymbol(symbol);
      console.log('Stock data received:', stockData);

      setStock(stockData);
      // NOTE: Analysis is NOT fetched automatically on page load
      // The user must click the "Analyze Market" button to trigger AI analysis
      // This prevents accidental token usage just from visiting the page
    } catch (error) {
      console.error("Error fetching stock detail:", error);
      setStock(null);
    }
    setLoading(false);
  };

  const fetchNews = async () => {
    setNewsLoading(true);
    try {
      const newsData = await getStockNews(symbol, stock?.name, 5);
      setNews(newsData);
    } catch (error) {
      console.error("Error fetching news:", error);
    }
    setNewsLoading(false);
  };

  const formatPrice = (price) => {
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatMarketCap = (marketCap) => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    }
    return `$${marketCap.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
        <div className="container mx-auto px-4 py-10">
          <Button onClick={() => navigate(-1)} variant="outline" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("common.back")}
          </Button>
          <Card className="bg-card border-border/60">
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                {t("stock.notFound")}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isPositive = stock.change24h >= 0;

  // Technical indicators - use data from API
  const indicators = {
    // RSI from API or fallback
    rsi: stock.rsi || 'N/A',
    rsiColor: stock.rsiColor || 'text-muted-foreground',
    rsiSignal: stock.rsiSignal || 'No data',
    // MACD from API or fallback
    macd: stock.macd || 'N/A',
    macdColor: stock.macdColor || 'text-muted-foreground',
    macdSignal: stock.macdSignal || 'No data',
    // Moving averages
    ma50: stock.ma50 || stock.price,
    ma200: stock.ma200 || stock.price,
    // Trend
    trend: stock.trend || 'Unknown',
    trendColor: stock.trendColor || 'text-muted-foreground',
    // Fundamental metrics from API
    peRatio: stock.peRatio != null ? Number(stock.peRatio).toFixed(2) : 'N/A',
    eps: stock.eps != null ? Number(stock.eps).toFixed(2) : 'N/A',
    dividendYield: stock.dividendYield != null ? Number(stock.dividendYield).toFixed(2) : 'N/A',
    // Price action from API
    dayHigh: stock.dayHigh || null,
    dayLow: stock.dayLow || null,
    high52w: stock.high52w || null,
    low52w: stock.low52w || null,
    // Performance from API
    change1w: stock.change1w || null,
    change1m: stock.change1m || null,
    change3m: stock.change3m || null,
    change1y: stock.change1y || null,
    // Volume from API
    avgVolume: stock.avgVolume || null,
    todayVolume: stock.todayVolume || stock.volume24h || null,
    isAboveAverage: stock.isAboveAverage || false,
    sharesOutstanding: stock.sharesOutstanding || null
  };

  const heroIcons = [
    { Icon: DollarSign, gradient: 'bg-gradient-money' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      {/* Hero Section */}
      <Hero
        title={stock.name}
        subtitle={`${t("stock.detailedAnalysis") || "Detailed analysis and insights for"} ${stock.symbol}`}
        icons={heroIcons}
        showSingleIcon={true}
        align="left"
        size="medium"
      >
        <Button onClick={() => navigate(-1)} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("common.back")}
        </Button>
          <CreatePriceAlertButton
            assetType="stock"
            assetId={stock.symbol}
            assetName={stock.name}
            assetSymbol={stock.symbol}
            currentPrice={stock.price}
            assetImage={stock.image}
          />
          <ScalpingAnalysisButton
            assetName={stock.name}
            assetSymbol={stock.symbol}
            assetType="stock"
            currentPrice={stock.price}
          />
        </Hero>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-10">

        <FadeIn className="space-y-6">
          {/* Price Chart */}
          <PriceChart
            currentPrice={stock.price}
            change24h={stock.change24h}
            assetName={stock.name}
            assetSymbol={stock.symbol}
            assetType="stock"
            assetId={stock.symbol}
          />

          {/* Header Card */}
          <Card className="bg-card border-border/60">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  {stock.image ? (
                    <img
                      src={stock.image}
                      alt={stock.name}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg flex-shrink-0"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg flex-shrink-0 bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-xl sm:text-2xl font-bold text-primary"
                    style={{ display: stock.image ? 'none' : 'flex' }}
                  >
                    {stock.symbol?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{stock.name}</h1>
                    <p className="text-lg sm:text-xl text-muted-foreground mt-1">{stock.symbol}</p>
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium">
                      <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
                      {t("stock.publicCompany")}
                    </div>
                  </div>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto">
                  <div className="text-3xl sm:text-4xl font-bold text-foreground">{formatPrice(stock.price)}</div>
                  <div className={`flex items-center gap-2 justify-start sm:justify-end mt-2 text-base sm:text-lg font-semibold ${
                    isPositive ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {isPositive ? <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" /> : <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />}
                    <span>{isPositive ? '+' : ''}{stock.change24h.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <Card className="bg-card border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xs sm:text-sm">
                  <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                  {t("stock.marketCap")}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground break-all">{formatMarketCap(stock.marketCap)}</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xs sm:text-sm">
                  <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                  {t("stock.peRatio")}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">{indicators.peRatio}</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xs sm:text-sm">
                  <PieChart className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                  {t("stock.eps")}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                  {indicators.eps !== 'N/A' ? `$${indicators.eps}` : 'N/A'}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xs sm:text-sm">
                  <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                  {t("stock.dividendYield")}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                  {indicators.dividendYield !== 'N/A' ? `${indicators.dividendYield}%` : 'N/A'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Technical Analysis */}
          <Card className="bg-card border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <LineChart className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                {t("stock.technicalAnalysis")}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">{t("stock.technicalAnalysisDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <div className="text-xs sm:text-sm text-muted-foreground">RSI (14)</div>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">{indicators.rsi}</div>
                  <div className={`text-xs sm:text-sm font-semibold ${indicators.rsiColor}`}>
                    {indicators.rsiSignal}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs sm:text-sm text-muted-foreground">MACD</div>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">{indicators.macd}</div>
                  <div className={`text-xs sm:text-sm font-semibold ${indicators.macdColor}`}>
                    {indicators.macdSignal}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs sm:text-sm text-muted-foreground">MA (50-day)</div>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground break-all">{formatPrice(indicators.ma50)}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Short-term avg</div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs sm:text-sm text-muted-foreground">MA (200-day)</div>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground break-all">{formatPrice(indicators.ma200)}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Long-term avg</div>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border/40">
                <div className="flex flex-wrap items-center gap-2">
                  <div className={`font-semibold ${indicators.trendColor}`}>
                    {indicators.trend === 'Uptrend' ? <TrendingUp className="w-5 h-5 inline" /> :
                     indicators.trend === 'Downtrend' ? <TrendingDown className="w-5 h-5 inline" /> : null}
                    {' '}{indicators.trend === 'Unknown' ? indicators.trend : t(`stock.${indicators.trend.toLowerCase()}`)}
                  </div>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">
                    {t("stock.technicalSummary")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Price Action & Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card className="bg-card border-border/60">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">{t("stock.priceAction")}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">{t("stock.priceActionDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <div className="text-xs sm:text-sm text-muted-foreground">{t("stock.dayHigh")}</div>
                    <div className="text-sm sm:text-base md:text-lg font-semibold text-foreground break-all">
                      {formatPrice(indicators?.dayHigh || stock.price * 1.03)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs sm:text-sm text-muted-foreground">{t("stock.dayLow")}</div>
                    <div className="text-sm sm:text-base md:text-lg font-semibold text-foreground break-all">
                      {formatPrice(indicators?.dayLow || stock.price * 0.97)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs sm:text-sm text-muted-foreground">{t("stock.52wHigh")}</div>
                    <div className="text-sm sm:text-base md:text-lg font-semibold text-foreground break-all">
                      {formatPrice(indicators?.high52w || stock.price * 1.35)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs sm:text-sm text-muted-foreground">{t("stock.52wLow")}</div>
                    <div className="text-sm sm:text-base md:text-lg font-semibold text-foreground break-all">
                      {formatPrice(indicators?.low52w || stock.price * 0.75)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/60">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">{t("stock.performance")}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">{t("stock.performanceDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <div className="text-xs sm:text-sm text-muted-foreground">{t("stock.1wChange")}</div>
                    <div className={`text-sm sm:text-base md:text-lg font-semibold ${
                      (indicators?.change1w || 0) > 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {(indicators?.change1w || stock.change24h * 1.2).toFixed(2)}%
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs sm:text-sm text-muted-foreground">{t("stock.1mChange")}</div>
                    <div className={`text-sm sm:text-base md:text-lg font-semibold ${
                      (indicators?.change1m || 0) > 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {(indicators?.change1m || stock.change24h * 2.5).toFixed(2)}%
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs sm:text-sm text-muted-foreground">{t("stock.3mChange")}</div>
                    <div className={`text-sm sm:text-base md:text-lg font-semibold ${
                      (indicators?.change3m || 0) > 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {(indicators?.change3m || stock.change24h * 4).toFixed(2)}%
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs sm:text-sm text-muted-foreground">{t("stock.1yChange")}</div>
                    <div className={`text-sm sm:text-base md:text-lg font-semibold ${
                      (indicators?.change1y || 0) > 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {(indicators?.change1y || stock.change24h * 12).toFixed(2)}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Volume & Liquidity */}
          <Card className="bg-card border-border/60">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">{t("stock.volumeLiquidity")}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">{t("stock.volumeLiquidityDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <div className="text-xs sm:text-sm text-muted-foreground">{t("stock.avgVolume")}</div>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                    {((indicators?.avgVolume || stock.marketCap / stock.price * 0.01) / 1e6).toFixed(1)}M
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{t("stock.sharesTraded")}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs sm:text-sm text-muted-foreground">{t("stock.todayVolume")}</div>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                    {((indicators?.todayVolume || stock.marketCap / stock.price * 0.012) / 1e6).toFixed(1)}M
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    {indicators?.isAboveAverage ? t("stock.aboveAverage") : 'Below average'}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs sm:text-sm text-muted-foreground">{t("stock.sharesOutstanding")}</div>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                    {indicators?.sharesOutstanding || (stock.marketCap / stock.price / 1e6).toFixed(2)}B
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{t("stock.totalShares")}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Price Alerts for this Asset */}
          <AssetPriceAlerts
            assetType="stock"
            assetId={stock.symbol}
            assetSymbol={stock.symbol}
            currentPrice={stock.price}
          />

          {/* AI Analysis Section */}
          <div className="flex justify-end mb-2">
            <AIUsageBadge analysisType="stock" />
          </div>
          {stock && priceHistory.length > 0 && stats && (
            <AIAnalysis
              assetName={stock.name}
              assetSymbol={stock.symbol}
              assetType="stock"
              currentPrice={stock.price}
              change24h={stock.change24h}
              priceHistory={priceHistory}
              stats={stats}
              news={news}
              chartData={priceHistory}
            />
          )}

          {/* News Section */}
          <NewsSection news={news} loading={newsLoading} />
        </FadeIn>
      </div>
    </div>
  );
}
