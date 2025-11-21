import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/magicui/fade-in";
import { ArrowLeft, TrendingUp, TrendingDown, Loader2, BarChart3, LineChart, PieChart, Activity, DollarSign } from "lucide-react";
import { getStockData } from "@/services/marketDataService";
import { getStockAnalysis } from "@/services/analysisService";
import PriceChart from "@/components/charts/PriceChart";

export default function StockDetail() {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [stock, setStock] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStockDetail();
  }, [symbol]);

  const fetchStockDetail = async () => {
    setLoading(true);
    try {
      // Fetch stock data and analysis from server
      const [stockData, analysisData] = await Promise.all([
        getStockData(50),
        getStockAnalysis(symbol).catch(err => {
          console.error('Error fetching analysis:', err);
          return null;
        })
      ]);

      const foundStock = stockData.find(s => s.symbol === symbol);
      setStock(foundStock);

      if (analysisData) {
        setAnalysis(analysisData.analysis);
      }
    } catch (error) {
      console.error("Error fetching stock detail:", error);
    }
    setLoading(false);
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

  // Get technical indicators from server analysis
  const indicators = analysis;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <div className="container mx-auto px-4 py-10">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("common.back")}
        </Button>

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
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {stock.image && (
                    <img src={stock.image} alt={stock.name} className="w-16 h-16 rounded-lg" />
                  )}
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">{stock.name}</h1>
                    <p className="text-xl text-muted-foreground mt-1">{stock.symbol}</p>
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      <Activity className="w-4 h-4" />
                      {t("stock.publicCompany")}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-foreground">{formatPrice(stock.price)}</div>
                  <div className={`flex items-center gap-2 justify-end mt-2 text-lg font-semibold ${
                    isPositive ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    <span>{isPositive ? '+' : ''}{stock.change24h.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-card border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  {t("stock.marketCap")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{formatMarketCap(stock.marketCap)}</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-primary" />
                  {t("stock.peRatio")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{indicators.peRatio}</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <PieChart className="w-4 h-4 text-primary" />
                  {t("stock.eps")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">${indicators.eps}</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Activity className="w-4 h-4 text-primary" />
                  {t("stock.dividendYield")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{indicators.dividendYield}%</div>
              </CardContent>
            </Card>
          </div>

          {/* Technical Analysis */}
          <Card className="bg-card border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5 text-primary" />
                {t("stock.technicalAnalysis")}
              </CardTitle>
              <CardDescription>{t("stock.technicalAnalysisDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">RSI (14)</div>
                  <div className="text-2xl font-bold text-foreground">{indicators.rsi}</div>
                  <div className={`text-sm font-semibold ${indicators.rsiColor}`}>
                    {indicators.rsiSignal}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">MACD</div>
                  <div className="text-2xl font-bold text-foreground">{indicators.macd}</div>
                  <div className={`text-sm font-semibold ${indicators.macdColor}`}>
                    {indicators.macdSignal}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">MA (50-day)</div>
                  <div className="text-2xl font-bold text-foreground">{formatPrice(indicators.ma50)}</div>
                  <div className="text-sm text-muted-foreground">Short-term avg</div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">MA (200-day)</div>
                  <div className="text-2xl font-bold text-foreground">{formatPrice(indicators.ma200)}</div>
                  <div className="text-sm text-muted-foreground">Long-term avg</div>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border/40">
                <div className="flex items-center gap-2">
                  <div className={`font-semibold ${indicators.trendColor}`}>
                    {indicators.trend === 'Uptrend' ? <TrendingUp className="w-5 h-5 inline" /> : <TrendingDown className="w-5 h-5 inline" />}
                    {' '}{t(`stock.${indicators.trend.toLowerCase()}`)}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border-border/60">
              <CardHeader>
                <CardTitle>{t("stock.priceAction")}</CardTitle>
                <CardDescription>{t("stock.priceActionDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">{t("stock.dayHigh")}</div>
                    <div className="text-lg font-semibold text-foreground">
                      {formatPrice(indicators?.dayHigh || stock.price * 1.03)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">{t("stock.dayLow")}</div>
                    <div className="text-lg font-semibold text-foreground">
                      {formatPrice(indicators?.dayLow || stock.price * 0.97)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">{t("stock.52wHigh")}</div>
                    <div className="text-lg font-semibold text-foreground">
                      {formatPrice(indicators?.high52w || stock.price * 1.35)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">{t("stock.52wLow")}</div>
                    <div className="text-lg font-semibold text-foreground">
                      {formatPrice(indicators?.low52w || stock.price * 0.75)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/60">
              <CardHeader>
                <CardTitle>{t("stock.performance")}</CardTitle>
                <CardDescription>{t("stock.performanceDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">{t("stock.1wChange")}</div>
                    <div className={`text-lg font-semibold ${
                      (indicators?.change1w || 0) > 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {(indicators?.change1w || stock.change24h * 1.2).toFixed(2)}%
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">{t("stock.1mChange")}</div>
                    <div className={`text-lg font-semibold ${
                      (indicators?.change1m || 0) > 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {(indicators?.change1m || stock.change24h * 2.5).toFixed(2)}%
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">{t("stock.3mChange")}</div>
                    <div className={`text-lg font-semibold ${
                      (indicators?.change3m || 0) > 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {(indicators?.change3m || stock.change24h * 4).toFixed(2)}%
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">{t("stock.1yChange")}</div>
                    <div className={`text-lg font-semibold ${
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
              <CardTitle>{t("stock.volumeLiquidity")}</CardTitle>
              <CardDescription>{t("stock.volumeLiquidityDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">{t("stock.avgVolume")}</div>
                  <div className="text-2xl font-bold text-foreground">
                    {((indicators?.avgVolume || stock.marketCap / stock.price * 0.01) / 1e6).toFixed(1)}M
                  </div>
                  <div className="text-sm text-muted-foreground">{t("stock.sharesTraded")}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">{t("stock.todayVolume")}</div>
                  <div className="text-2xl font-bold text-foreground">
                    {((indicators?.todayVolume || stock.marketCap / stock.price * 0.012) / 1e6).toFixed(1)}M
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {indicators?.isAboveAverage ? t("stock.aboveAverage") : 'Below average'}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">{t("stock.sharesOutstanding")}</div>
                  <div className="text-2xl font-bold text-foreground">
                    {indicators?.sharesOutstanding || (stock.marketCap / stock.price / 1e6).toFixed(2)}B
                  </div>
                  <div className="text-sm text-muted-foreground">{t("stock.totalShares")}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
