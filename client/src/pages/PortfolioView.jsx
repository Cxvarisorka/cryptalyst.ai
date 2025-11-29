import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FadeIn } from "@/components/magicui/fade-in";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Loader2,
  Briefcase,
  Wallet,
  Eye,
  Calendar,
  User,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Target,
  PieChart,
} from "lucide-react";
import portfolioCollectionService from "@/services/portfolioCollection.service";

export default function PortfolioView() {
  const { t } = useTranslation();
  const { collectionId } = useParams();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    fetchPortfolio();
  }, [collectionId]);

  const fetchPortfolio = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await portfolioCollectionService.getPublicCollection(collectionId);
      setPortfolio(response.data);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      setError(error.response?.data?.message || "Failed to load portfolio");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined || isNaN(price)) {
      return "$0.00";
    }
    return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTotalValue = () => {
    if (!portfolio?.assets) return 0;
    return portfolio.assets.reduce((total, asset) => {
      const value = asset.quantity * (asset.currentPrice || 0);
      return total + value;
    }, 0);
  };

  const getTotalChange = () => {
    if (!portfolio?.assets) return 0;
    return portfolio.assets.reduce((total, asset) => {
      const currentValue = asset.quantity * (asset.currentPrice || 0);
      const purchaseValue = asset.quantity * asset.purchasePrice;
      return total + (currentValue - purchaseValue);
    }, 0);
  };

  const getChangePercentage = () => {
    if (!portfolio?.assets) return 0;
    const totalPurchaseValue = portfolio.assets.reduce((total, asset) => {
      return total + (asset.quantity * asset.purchasePrice);
    }, 0);
    if (totalPurchaseValue === 0) return 0;
    return ((getTotalChange() / totalPurchaseValue) * 100);
  };

  const generateAIAnalysis = async () => {
    setAnalyzing(true);
    setShowAnalysis(true);

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const totalValue = getTotalValue();
    const changePercent = getChangePercentage();
    const cryptoCount = portfolio.assets.filter(a => a.assetType === 'crypto').length;
    const stockCount = portfolio.assets.filter(a => a.assetType === 'stock').length;

    const cryptoAllocation = portfolio.assets
      .filter(a => a.assetType === 'crypto')
      .reduce((sum, a) => sum + (a.quantity * (a.currentPrice || 0)), 0);
    const stockAllocation = portfolio.assets
      .filter(a => a.assetType === 'stock')
      .reduce((sum, a) => sum + (a.quantity * (a.currentPrice || 0)), 0);

    const cryptoPercent = totalValue > 0 ? (cryptoAllocation / totalValue) * 100 : 0;
    const stockPercent = totalValue > 0 ? (stockAllocation / totalValue) * 100 : 0;

    // Generate simulated analysis
    const simulatedAnalysis = {
      riskScore: Math.floor(Math.random() * 40) + 30, // 30-70
      diversificationScore: portfolio.assets.length > 10 ? 85 : portfolio.assets.length > 5 ? 70 : 50,
      performanceRating: changePercent > 10 ? "Excellent" : changePercent > 0 ? "Good" : changePercent > -10 ? "Fair" : "Poor",
      allocation: {
        crypto: cryptoPercent.toFixed(1),
        stocks: stockPercent.toFixed(1)
      },
      insights: [
        {
          type: cryptoPercent > 70 || stockPercent > 70 ? "warning" : "success",
          title: "Asset Allocation",
          description: cryptoPercent > 70
            ? "Heavy concentration in crypto assets. Consider diversifying into stocks for reduced volatility."
            : stockPercent > 70
            ? "Majority allocation in stocks. Adding crypto exposure could increase growth potential."
            : "Well-balanced allocation between crypto and traditional assets."
        },
        {
          type: portfolio.assets.length < 5 ? "warning" : "success",
          title: "Diversification",
          description: portfolio.assets.length < 5
            ? `Portfolio has ${portfolio.assets.length} assets. Consider adding more positions to reduce concentration risk.`
            : `Good diversification with ${portfolio.assets.length} different assets across your portfolio.`
        },
        {
          type: changePercent > 0 ? "success" : "warning",
          title: "Performance",
          description: changePercent > 10
            ? `Outstanding performance with ${changePercent.toFixed(1)}% returns. Consider taking some profits.`
            : changePercent > 0
            ? `Positive returns of ${changePercent.toFixed(1)}%. Portfolio is performing well.`
            : `Current drawdown of ${Math.abs(changePercent).toFixed(1)}%. Consider dollar-cost averaging to lower your average cost.`
        }
      ],
      recommendations: [
        cryptoPercent > 70 ? "Consider reducing crypto exposure to 50-60% for better risk management" :
        stockPercent > 70 ? "Add 15-20% crypto allocation for higher growth potential" :
        "Maintain current allocation, it's well-balanced",

        portfolio.assets.length < 5 ? "Expand to at least 8-10 positions across different sectors" :
        "Continue monitoring existing positions for optimal performance",

        changePercent < -15 ? "Review underperforming assets and consider rebalancing" :
        changePercent > 20 ? "Consider taking partial profits on winning positions" :
        "Hold current positions and monitor market conditions"
      ]
    };

    setAnalysis(simulatedAnalysis);
    setAnalyzing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center pt-20">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background pt-20">
        <div className="container mx-auto px-4 py-6 sm:py-10">
          <Button onClick={() => navigate(-1)} variant="outline" className="mb-4 sm:mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("profile.back")}
          </Button>
          <Card className="bg-card border-border/60">
            <CardContent className="py-8 sm:py-12">
              <div className="text-center text-muted-foreground text-sm sm:text-base">
                {error || t("portfolio.notFound")}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const totalValue = getTotalValue();
  const totalChange = getTotalChange();
  const changePercentage = getChangePercentage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background pt-20">
      <div className="container mx-auto px-4 py-6 sm:py-10">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-4 sm:mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("profile.back")}
        </Button>

        <FadeIn className="space-y-4 sm:space-y-6">
          {/* Portfolio Header */}
          <Card className="bg-card border-border/60">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div
                  className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${portfolio.color}20` }}
                >
                  <Briefcase className="w-8 h-8" style={{ color: portfolio.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <CardTitle className="text-2xl sm:text-3xl mb-2">{portfolio.name}</CardTitle>
                      {portfolio.description && (
                        <CardDescription className="text-sm sm:text-base">{portfolio.description}</CardDescription>
                      )}
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                      <Eye className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-500">{t("community.public")}</span>
                    </div>
                  </div>

                  {/* Owner Info */}
                  {portfolio.user && (
                    <div className="flex items-center gap-3 mt-4 p-3 bg-muted/50 rounded-lg">
                      {portfolio.user.avatar ? (
                        <img
                          src={portfolio.user.avatar}
                          alt={portfolio.user.name}
                          className="w-10 h-10 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-money flex items-center justify-center text-white text-sm font-bold">
                          {portfolio.user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground">{portfolio.user.name}</p>
                        <p className="text-xs text-muted-foreground">{t("portfolio.owner")}</p>
                      </div>
                    </div>
                  )}

                  {/* AI Analysis Button */}
                  {portfolio.assets && portfolio.assets.length > 0 && (
                    <Button
                      onClick={generateAIAnalysis}
                      className="mt-4 w-full sm:w-auto"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {t("portfolio.analyzeWithAI")}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Portfolio Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card border-border/60">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  {t("portfolio.totalValue")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{formatPrice(totalValue)}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/60">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  {totalChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {t("portfolio.totalChange")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${totalChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {totalChange >= 0 ? '+' : ''}{formatPrice(totalChange)}
                </p>
                <p className={`text-sm ${totalChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {totalChange >= 0 ? '+' : ''}{changePercentage.toFixed(2)}%
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/60">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  {t("portfolio.assets")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{portfolio.assets?.length || 0}</p>
              </CardContent>
            </Card>
          </div>

          {/* Assets List */}
          <Card className="bg-card border-border/60">
            <CardHeader>
              <CardTitle>{t("portfolio.holdings")}</CardTitle>
            </CardHeader>
            <CardContent>
              {portfolio.assets && portfolio.assets.length > 0 ? (
                <div className="space-y-3">
                  {portfolio.assets.map((asset) => {
                    const currentValue = asset.quantity * (asset.currentPrice || 0);
                    const purchaseValue = asset.quantity * asset.purchasePrice;
                    const profitLoss = currentValue - purchaseValue;
                    const profitLossPercentage = purchaseValue > 0 ? ((profitLoss / purchaseValue) * 100) : 0;

                    return (
                      <div
                        key={asset._id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border/60 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            {asset.image && (
                              <img
                                src={asset.image}
                                alt={asset.symbol}
                                className="w-10 h-10 rounded-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            )}
                            <div>
                              <p className="font-semibold text-foreground">{asset.symbol}</p>
                              <p className="text-sm text-muted-foreground">{asset.name}</p>
                            </div>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">{t("portfolio.amount")}: </span>
                              <span className="font-medium text-foreground">{asset.quantity.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">{t("portfolio.avgPrice")}: </span>
                              <span className="font-medium text-foreground">{formatPrice(asset.purchasePrice)}</span>
                            </div>
                            {asset.purchaseDate && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-muted-foreground" />
                                <span className="text-muted-foreground">{formatDate(asset.purchaseDate)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-semibold text-foreground">{formatPrice(currentValue)}</p>
                          <p className={`text-sm font-medium ${profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {profitLoss >= 0 ? '+' : ''}{formatPrice(profitLoss)}
                          </p>
                          <p className={`text-xs ${profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {profitLoss >= 0 ? '+' : ''}{profitLossPercentage.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">{t("portfolio.noAssets")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>

        {/* AI Analysis Dialog */}
        <Dialog open={showAnalysis} onOpenChange={setShowAnalysis}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <Sparkles className="w-6 h-6 text-primary" />
                {t("portfolio.aiAnalysisTitle")}
              </DialogTitle>
              <DialogDescription>
                {t("portfolio.aiAnalysisDescription")}
              </DialogDescription>
            </DialogHeader>

            {analyzing ? (
              <div className="py-12 text-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">{t("portfolio.analyzing")}</p>
              </div>
            ) : analysis && (
              <div className="space-y-6">
                {/* Scores */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-card border-border/60">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-5 h-5 text-primary" />
                        <p className="text-sm font-medium text-muted-foreground">{t("portfolio.riskScore")}</p>
                      </div>
                      <p className="text-3xl font-bold text-foreground">{analysis.riskScore}/100</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {analysis.riskScore < 40 ? t("portfolio.lowRisk") : analysis.riskScore < 60 ? t("portfolio.moderateRisk") : t("portfolio.highRisk")}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border/60">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <PieChart className="w-5 h-5 text-primary" />
                        <p className="text-sm font-medium text-muted-foreground">{t("portfolio.diversification")}</p>
                      </div>
                      <p className="text-3xl font-bold text-foreground">{analysis.diversificationScore}/100</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {analysis.diversificationScore > 75 ? t("portfolio.excellent") : analysis.diversificationScore > 60 ? t("portfolio.good") : t("portfolio.needsImprovement")}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border/60">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        <p className="text-sm font-medium text-muted-foreground">{t("portfolio.performance")}</p>
                      </div>
                      <p className="text-3xl font-bold text-foreground">{analysis.performanceRating}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t("portfolio.overallRating")}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Asset Allocation */}
                <Card className="bg-card border-border/60">
                  <CardHeader>
                    <CardTitle className="text-lg">{t("portfolio.assetAllocation")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-muted-foreground">{t("portfolio.crypto")}</span>
                          <span className="text-sm font-medium text-foreground">{analysis.allocation.crypto}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${analysis.allocation.crypto}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-muted-foreground">{t("portfolio.stocks")}</span>
                          <span className="text-sm font-medium text-foreground">{analysis.allocation.stocks}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full opacity-70"
                            style={{ width: `${analysis.allocation.stocks}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Insights */}
                <Card className="bg-card border-border/60">
                  <CardHeader>
                    <CardTitle className="text-lg">{t("portfolio.keyInsights")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analysis.insights.map((insight, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${
                          insight.type === "success"
                            ? "bg-green-500/10 border-green-500/20"
                            : "bg-yellow-500/10 border-yellow-500/20"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {insight.type === "success" ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                          )}
                          <div>
                            <p className="font-semibold text-foreground mb-1">{insight.title}</p>
                            <p className="text-sm text-muted-foreground">{insight.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card className="bg-card border-border/60">
                  <CardHeader>
                    <CardTitle className="text-lg">{t("portfolio.aiRecommendations")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span className="text-sm text-muted-foreground">{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <p className="text-xs text-center text-muted-foreground italic">
                  {t("portfolio.simulatedDisclaimer")}
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
