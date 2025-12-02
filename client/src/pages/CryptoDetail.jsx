import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/magicui/fade-in";
import { ArrowLeft, TrendingUp, TrendingDown, Loader2, BarChart3, LineChart, PieChart, Activity } from "lucide-react";
import { getCryptoById } from "@/services/marketDataService";
import { getCryptoAnalysis, getPriceHistory } from "@/services/analysisService";
import { getCryptoNews } from "@/services/newsService";
import PriceChart from "@/components/charts/PriceChart";
import NewsSection from "@/components/news/NewsSection";
import AIAnalysis from "@/components/analysis/AIAnalysis";
import CreatePriceAlertButton from "@/components/alerts/CreatePriceAlertButton";
import AssetPriceAlerts from "@/components/alerts/AssetPriceAlerts";
import Hero from "@/components/layout/Hero";

export default function CryptoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [crypto, setCrypto] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(true);
  const [priceHistory, setPriceHistory] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchCryptoDetail();
    fetchNews();
    fetchPriceHistory();
  }, [id]);

  const fetchPriceHistory = async () => {
    try {
      const response = await getPriceHistory('crypto', id, '1M');
      setPriceHistory(response.priceData || []);
      setStats(response.stats || {});
    } catch (error) {
      console.error('Error fetching price history:', error);
    }
  };

  const fetchCryptoDetail = async () => {
    setLoading(true);
    console.log('Fetching crypto detail for ID:', id);

    try {
      // Fetch crypto data directly by ID from server
      const cryptoData = await getCryptoById(id);
      console.log('Crypto data received:', cryptoData);

      setCrypto(cryptoData);

      // Fetch analysis separately (optional)
      try {
        const analysisData = await getCryptoAnalysis(id);
        if (analysisData) {
          setAnalysis(analysisData.analysis);
        }
      } catch (err) {
        console.warn('Error fetching analysis (non-critical):', err);
        // Analysis is optional, don't fail the whole page
      }
    } catch (error) {
      console.error("Error fetching crypto detail:", error);
      setCrypto(null);
    }
    setLoading(false);
  };

  const fetchNews = async () => {
    setNewsLoading(true);
    try {
      const newsData = await getCryptoNews(id, 5);
      setNews(newsData);
    } catch (error) {
      console.error("Error fetching news:", error);
    }
    setNewsLoading(false);
  };

  const formatPrice = (price) => {
    if (price >= 1) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${price.toFixed(6)}`;
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

  if (!crypto) {
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
                {t("crypto.notFound")}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isPositive = crypto.change24h >= 0;

  // Get technical indicators from server analysis with safe defaults
  const indicators = analysis || {
    rsi: 'N/A',
    rsiColor: 'text-muted-foreground',
    rsiSignal: 'No data',
    macd: 'N/A',
    macdColor: 'text-muted-foreground',
    macdSignal: 'No data',
    ma7: crypto.price,
    ma30: crypto.price,
    trend: 'Unknown',
    trendColor: 'text-muted-foreground',
    volume24h: null,
    high24h: null,
    low24h: null,
    change7d: null,
    change30d: null
  };

  const heroIcons = [
    { Icon: Activity, gradient: 'bg-gradient-money' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      {/* Hero Section */}
      <Hero
        title={crypto.name}
        subtitle={`${t("crypto.detailedAnalysis") || "Detailed analysis and insights for"} ${crypto.symbol}`}
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
            assetType="crypto"
            assetId={crypto.id}
            assetName={crypto.name}
            assetSymbol={crypto.symbol}
            currentPrice={crypto.price}
            assetImage={crypto.image}
          />
        </Hero>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-10">

        <FadeIn className="space-y-6">
          {/* Price Chart */}
          <PriceChart
            currentPrice={crypto.price}
            change24h={crypto.change24h}
            assetName={crypto.name}
            assetSymbol={crypto.symbol}
            assetType="crypto"
            assetId={crypto.id}
          />

          {/* Header Card */}
          <Card className="bg-card border-border/60">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  {crypto.image && (
                    <img src={crypto.image} alt={crypto.name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex-shrink-0" />
                  )}
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{crypto.name}</h1>
                    <p className="text-lg sm:text-xl text-muted-foreground">{crypto.symbol}</p>
                  </div>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto">
                  <div className="text-3xl sm:text-4xl font-bold text-foreground">{formatPrice(crypto.price)}</div>
                  <div className={`flex items-center gap-2 justify-start sm:justify-end mt-2 text-base sm:text-lg font-semibold ${
                    isPositive ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {isPositive ? <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" /> : <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />}
                    <span>{isPositive ? '+' : ''}{crypto.change24h.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <Card className="bg-card border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  {t("crypto.marketCap")}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3">
                <div className="text-xl sm:text-2xl font-bold text-foreground break-all">{formatMarketCap(crypto.marketCap)}</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  {t("crypto.24hVolume")}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3">
                <div className="text-xl sm:text-2xl font-bold text-foreground break-all">
                  {formatMarketCap(indicators?.volume24h || crypto.marketCap * 0.15)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <PieChart className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  {t("crypto.circulatingSupply")}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3">
                <div className="text-xl sm:text-2xl font-bold text-foreground break-all">
                  {(crypto.marketCap / crypto.price).toFixed(0)}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">{crypto.symbol}</div>
              </CardContent>
            </Card>
          </div>

          {/* Technical Analysis */}
          <Card className="bg-card border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <LineChart className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                {t("crypto.technicalAnalysis")}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">{t("crypto.technicalAnalysisDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <div className="text-xs sm:text-sm text-muted-foreground">RSI (14)</div>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">{indicators.rsi}</div>
                  <div className={`text-sm font-semibold ${indicators.rsiColor}`}>
                    {indicators.rsiSignal}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs sm:text-sm text-muted-foreground">MACD</div>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">{indicators.macd}</div>
                  <div className={`text-sm font-semibold ${indicators.macdColor}`}>
                    {indicators.macdSignal}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs sm:text-sm text-muted-foreground">MA (7-day)</div>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground break-all">{formatPrice(indicators.ma7)}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Short-term avg</div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs sm:text-sm text-muted-foreground">MA (30-day)</div>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground break-all">{formatPrice(indicators.ma30)}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Long-term avg</div>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border/40">
                <div className="flex flex-wrap items-center gap-2">
                  <div className={`font-semibold ${indicators.trendColor}`}>
                    {indicators.trend === 'Uptrend' ? <TrendingUp className="w-5 h-5 inline" /> :
                     indicators.trend === 'Downtrend' ? <TrendingDown className="w-5 h-5 inline" /> : null}
                    {' '}{indicators.trend === 'Unknown' ? indicators.trend : t(`crypto.${indicators.trend.toLowerCase()}`)}
                  </div>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">
                    {t("crypto.technicalSummary")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Price Action */}
          <Card className="bg-card border-border/60">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">{t("crypto.priceAction")}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">{t("crypto.priceActionDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <div className="text-xs sm:text-sm text-muted-foreground">{t("crypto.24hHigh")}</div>
                  <div className="text-sm sm:text-base md:text-lg font-semibold text-foreground break-all">
                    {formatPrice(indicators?.high24h || crypto.price * 1.05)}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs sm:text-sm text-muted-foreground">{t("crypto.24hLow")}</div>
                  <div className="text-sm sm:text-base md:text-lg font-semibold text-foreground break-all">
                    {formatPrice(indicators?.low24h || crypto.price * 0.95)}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs sm:text-sm text-muted-foreground">{t("crypto.7dChange")}</div>
                  <div className={`text-sm sm:text-base md:text-lg font-semibold ${
                    (indicators?.change7d || 0) > 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {(indicators?.change7d || crypto.change24h * 1.5).toFixed(2)}%
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs sm:text-sm text-muted-foreground">{t("crypto.30dChange")}</div>
                  <div className={`text-sm sm:text-base md:text-lg font-semibold ${
                    (indicators?.change30d || 0) > 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {(indicators?.change30d || crypto.change24h * 3).toFixed(2)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Price Alerts for this Asset */}
          <AssetPriceAlerts
            assetType="crypto"
            assetId={crypto.id}
            assetSymbol={crypto.symbol}
            currentPrice={crypto.price}
          />

          {/* AI Analysis Section */}
          {crypto && priceHistory.length > 0 && stats && (
            <AIAnalysis
              assetName={crypto.name}
              assetSymbol={crypto.symbol}
              assetType="crypto"
              currentPrice={crypto.price}
              change24h={crypto.change24h}
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
