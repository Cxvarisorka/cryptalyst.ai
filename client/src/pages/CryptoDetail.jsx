import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/magicui/fade-in";
import { ArrowLeft, TrendingUp, TrendingDown, Loader2, BarChart3, LineChart, PieChart, Activity } from "lucide-react";
import { getCryptoData } from "@/services/marketDataService";
import { getCryptoAnalysis } from "@/services/analysisService";
import PriceChart from "@/components/charts/PriceChart";

export default function CryptoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [crypto, setCrypto] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCryptoDetail();
  }, [id]);

  const fetchCryptoDetail = async () => {
    setLoading(true);
    try {
      // Fetch crypto data and analysis from server
      const [cryptoData, analysisData] = await Promise.all([
        getCryptoData(50),
        getCryptoAnalysis(id).catch(err => {
          console.error('Error fetching analysis:', err);
          return null;
        })
      ]);

      const foundCrypto = cryptoData.find(c => c.id === id);
      setCrypto(foundCrypto);

      if (analysisData) {
        setAnalysis(analysisData.analysis);
      }
    } catch (error) {
      console.error("Error fetching crypto detail:", error);
    }
    setLoading(false);
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

  // Get technical indicators from server analysis
  const indicators = analysis;

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
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {crypto.image && (
                    <img src={crypto.image} alt={crypto.name} className="w-20 h-20 rounded-full" />
                  )}
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">{crypto.name}</h1>
                    <p className="text-xl text-muted-foreground">{crypto.symbol}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-foreground">{formatPrice(crypto.price)}</div>
                  <div className={`flex items-center gap-2 justify-end mt-2 text-lg font-semibold ${
                    isPositive ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    <span>{isPositive ? '+' : ''}{crypto.change24h.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  {t("crypto.marketCap")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{formatMarketCap(crypto.marketCap)}</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  {t("crypto.24hVolume")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {formatMarketCap(indicators?.volume24h || crypto.marketCap * 0.15)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-primary" />
                  {t("crypto.circulatingSupply")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {(crypto.marketCap / crypto.price).toFixed(0)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{crypto.symbol}</div>
              </CardContent>
            </Card>
          </div>

          {/* Technical Analysis */}
          <Card className="bg-card border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5 text-primary" />
                {t("crypto.technicalAnalysis")}
              </CardTitle>
              <CardDescription>{t("crypto.technicalAnalysisDesc")}</CardDescription>
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
                  <div className="text-sm text-muted-foreground">MA (7-day)</div>
                  <div className="text-2xl font-bold text-foreground">{formatPrice(indicators.ma7)}</div>
                  <div className="text-sm text-muted-foreground">Short-term avg</div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">MA (30-day)</div>
                  <div className="text-2xl font-bold text-foreground">{formatPrice(indicators.ma30)}</div>
                  <div className="text-sm text-muted-foreground">Long-term avg</div>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border/40">
                <div className="flex items-center gap-2">
                  <div className={`font-semibold ${indicators.trendColor}`}>
                    {indicators.trend === 'Uptrend' ? <TrendingUp className="w-5 h-5 inline" /> : <TrendingDown className="w-5 h-5 inline" />}
                    {' '}{t(`crypto.${indicators.trend.toLowerCase()}`)}
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
              <CardTitle>{t("crypto.priceAction")}</CardTitle>
              <CardDescription>{t("crypto.priceActionDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">{t("crypto.24hHigh")}</div>
                  <div className="text-lg font-semibold text-foreground">
                    {formatPrice(indicators?.high24h || crypto.price * 1.05)}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">{t("crypto.24hLow")}</div>
                  <div className="text-lg font-semibold text-foreground">
                    {formatPrice(indicators?.low24h || crypto.price * 0.95)}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">{t("crypto.7dChange")}</div>
                  <div className={`text-lg font-semibold ${
                    (indicators?.change7d || 0) > 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {(indicators?.change7d || crypto.change24h * 1.5).toFixed(2)}%
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">{t("crypto.30dChange")}</div>
                  <div className={`text-lg font-semibold ${
                    (indicators?.change30d || 0) > 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {(indicators?.change30d || crypto.change24h * 3).toFixed(2)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
