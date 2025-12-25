import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  TrendingUp,
  TrendingDown,
  Trash2,
  ExternalLink,
  Sparkles,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Target,
  PieChart,
  Plus,
  Minus,
  Lock,
} from "lucide-react";
import { useAIUsage } from "@/hooks/useAIUsage";
import aiUsageService from "@/services/aiUsage.service";
import { AIUsageBadge } from "@/components/ai/AIUsageDisplay";

export default function PortfolioList({ portfolio, onRemoveAsset, onUpdateQuantity }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { refetch: refetchUsage, isAuthenticated } = useAIUsage();
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [updatingAsset, setUpdatingAsset] = useState(null);
  const [imgErrors, setImgErrors] = useState({});
  const [usageLimitError, setUsageLimitError] = useState(null);

  const handleImgError = (assetId) => {
    setImgErrors(prev => ({ ...prev, [assetId]: true }));
  };

  const handleQuantityChange = async (asset, newQuantity) => {
    if (newQuantity < 0) return;

    if (newQuantity === 0) {
      // Remove asset when quantity reaches 0
      onRemoveAsset(asset);
      return;
    }

    if (onUpdateQuantity) {
      setUpdatingAsset(asset._id);
      try {
        await onUpdateQuantity(asset, newQuantity);
      } finally {
        setUpdatingAsset(null);
      }
    }
  };

  const handleIncrement = (asset) => {
    const currentQuantity = asset.quantity || 1;
    handleQuantityChange(asset, currentQuantity + 1);
  };

  const handleDecrement = (asset) => {
    const currentQuantity = asset.quantity || 1;
    handleQuantityChange(asset, currentQuantity - 1);
  };

  const formatPrice = (price) => {
    if (price >= 1) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${price.toFixed(6)}`;
  };

  const calculateTotalValue = () => {
    return portfolio.reduce((sum, asset) => sum + (asset.price * (asset.quantity || 1)), 0);
  };

  const calculateTotalChange = () => {
    const total = calculateTotalValue();
    if (total === 0) return 0;

    const totalChange = portfolio.reduce((sum, asset) => {
      const value = asset.price * (asset.quantity || 1);
      return sum + (value * asset.change24h / 100);
    }, 0);

    return (totalChange / total) * 100;
  };

  const handleViewDetails = (asset) => {
    if (asset.type === 'crypto') {
      navigate(`/crypto/${asset.id}`);
    } else {
      navigate(`/stock/${asset.symbol}`);
    }
  };

  const generateAIAnalysis = async () => {
    setUsageLimitError(null);

    // Check if user is authenticated
    if (!isAuthenticated) {
      setUsageLimitError('Please sign in to use AI analysis');
      return;
    }

    try {
      // Check usage limits before performing analysis
      const checkResponse = await aiUsageService.checkUsage('portfolio');

      if (!checkResponse.data?.allowed) {
        setUsageLimitError(checkResponse.data?.message || 'AI usage limit exceeded');
        return;
      }
    } catch (error) {
      console.error('Error checking usage:', error);
      setUsageLimitError(error.message || 'Failed to check usage limits');
      return;
    }

    setAnalyzing(true);
    setShowAnalysis(true);

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const totalValue = calculateTotalValue();
    const totalChange = calculateTotalChange();
    const cryptoCount = portfolio.filter(a => a.type === 'crypto').length;
    const stockCount = portfolio.filter(a => a.type === 'stock').length;

    const cryptoAllocation = portfolio
      .filter(a => a.type === 'crypto')
      .reduce((sum, a) => sum + (a.quantity * (a.price || 0)), 0);
    const stockAllocation = portfolio
      .filter(a => a.type === 'stock')
      .reduce((sum, a) => sum + (a.quantity * (a.price || 0)), 0);

    const cryptoPercent = totalValue > 0 ? (cryptoAllocation / totalValue) * 100 : 0;
    const stockPercent = totalValue > 0 ? (stockAllocation / totalValue) * 100 : 0;

    // Generate simulated analysis
    const simulatedAnalysis = {
      riskScore: Math.floor(Math.random() * 40) + 30, // 30-70
      diversificationScore: portfolio.length > 10 ? 85 : portfolio.length > 5 ? 70 : 50,
      performanceRating: totalChange > 10 ? "Excellent" : totalChange > 0 ? "Good" : totalChange > -10 ? "Fair" : "Poor",
      allocation: {
        crypto: cryptoPercent.toFixed(1),
        stocks: stockPercent.toFixed(1)
      },
      insights: [
        {
          type: cryptoPercent > 70 || stockPercent > 70 ? "warning" : "success",
          title: t("portfolio.assetAllocation"),
          description: cryptoPercent > 70
            ? "Heavy concentration in crypto assets. Consider diversifying into stocks for reduced volatility."
            : stockPercent > 70
            ? "Majority allocation in stocks. Adding crypto exposure could increase growth potential."
            : "Well-balanced allocation between crypto and traditional assets."
        },
        {
          type: portfolio.length < 5 ? "warning" : "success",
          title: t("portfolio.diversification"),
          description: portfolio.length < 5
            ? `Portfolio has ${portfolio.length} assets. Consider adding more positions to reduce concentration risk.`
            : `Good diversification with ${portfolio.length} different assets across your portfolio.`
        },
        {
          type: totalChange > 0 ? "success" : "warning",
          title: t("portfolio.performance"),
          description: totalChange > 10
            ? `Outstanding performance with ${totalChange.toFixed(1)}% returns. Consider taking some profits.`
            : totalChange > 0
            ? `Positive returns of ${totalChange.toFixed(1)}%. Portfolio is performing well.`
            : `Current drawdown of ${Math.abs(totalChange).toFixed(1)}%. Consider dollar-cost averaging to lower your average cost.`
        }
      ],
      recommendations: [
        cryptoPercent > 70 ? "Consider reducing crypto exposure to 50-60% for better risk management" :
        stockPercent > 70 ? "Add 15-20% crypto allocation for higher growth potential" :
        "Maintain current allocation, it's well-balanced",

        portfolio.length < 5 ? "Expand to at least 8-10 positions across different sectors" :
        "Continue monitoring existing positions for optimal performance",

        totalChange < -15 ? "Review underperforming assets and consider rebalancing" :
        totalChange > 20 ? "Consider taking partial profits on winning positions" :
        "Hold current positions and monitor market conditions"
      ]
    };

    setAnalysis(simulatedAnalysis);
    setAnalyzing(false);

    // Record AI usage after successful analysis
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      await axios.post(`${API_URL}/analysis/record-usage`, {
        type: 'portfolio',
        assetId: 'portfolio-analysis'
      }, { withCredentials: true });

      // Immediately refresh navbar usage indicator
      refetchUsage();
    } catch (err) {
      console.error('Error recording AI usage:', err);
    }
  };

  const totalValue = calculateTotalValue();
  const totalChange = calculateTotalChange();
  const isPositive = totalChange >= 0;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
        <CardHeader>
          <CardTitle>{t("dashboard.portfolio.totalValue")}</CardTitle>
          <CardDescription>{t("dashboard.portfolio.totalValueDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                {formatPrice(totalValue)}
              </div>
              <div className={`flex items-center gap-2 mt-2 text-base sm:text-lg font-semibold ${
                isPositive ? 'text-green-500' : 'text-red-500'
              }`}>
                {isPositive ? <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" /> : <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />}
                <span>{isPositive ? '+' : ''}{totalChange.toFixed(2)}%</span>
                <span className="text-xs sm:text-sm text-muted-foreground font-normal">
                  {t("dashboard.portfolio.today")}
                </span>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-xs sm:text-sm text-muted-foreground">{t("dashboard.portfolio.assets")}</div>
              <div className="text-xl sm:text-2xl font-bold text-foreground">{portfolio.length}</div>
            </div>
          </div>
          {portfolio.length > 0 && (
            <div className="mt-4 space-y-3">
              {/* Usage Limit Error */}
              {usageLimitError && (
                <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700">
                  <Lock className="h-5 w-5 text-red-500" />
                  <div className="ml-2 flex-1">
                    <h4 className="font-semibold text-red-700 dark:text-red-400">AI Usage Limit Reached</h4>
                    <AlertDescription className="text-foreground mt-1">
                      {usageLimitError}
                    </AlertDescription>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" onClick={() => navigate('/pricing')} className="bg-gradient-to-r from-green-600 to-emerald-600">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Upgrade Plan
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setUsageLimitError(null)}>
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </Alert>
              )}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Button
                  onClick={generateAIAnalysis}
                  className="w-full sm:w-auto"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t("portfolio.analyzeWithAI")}
                </Button>
                <AIUsageBadge />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card border-border/60">
        <CardHeader>
          <CardTitle>{t("dashboard.portfolio.holdings")}</CardTitle>
          <CardDescription>{t("dashboard.portfolio.holdingsDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          {portfolio.length > 0 ? (
            <div className="space-y-3">
              {portfolio.map((asset) => {
                const isPositive = asset.change24h >= 0;
                const value = asset.price * (asset.quantity || 1);
                const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;

                return (
                  <div
                    key={`${asset.type}-${asset.id}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border border-border/40 rounded-lg hover:bg-muted/30 transition-all duration-300 gap-3 sm:gap-4"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      {asset.image && !imgErrors[asset.id] ? (
                        <img
                          src={asset.image}
                          alt={asset.name}
                          className={`w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 ${asset.type === 'crypto' ? 'rounded-full' : 'rounded-lg'}`}
                          onError={() => handleImgError(asset.id)}
                        />
                      ) : (
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center ${asset.type === 'crypto' ? 'rounded-full' : 'rounded-lg'}`}>
                          <span className="text-sm font-bold text-primary">{asset.symbol?.charAt(0)}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground text-base sm:text-lg truncate">{asset.symbol}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground truncate">{asset.name}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 sm:h-7 sm:w-7 hover:bg-destructive/20 hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDecrement(asset);
                              }}
                              disabled={updatingAsset === asset._id}
                            >
                              <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <span className="min-w-[2rem] text-center font-medium text-sm sm:text-base">
                              {updatingAsset === asset._id ? (
                                <Loader2 className="h-3 w-3 animate-spin mx-auto" />
                              ) : (
                                asset.quantity || 1
                              )}
                            </span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 sm:h-7 sm:w-7 hover:bg-green-500/20 hover:text-green-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleIncrement(asset);
                              }}
                              disabled={updatingAsset === asset._id}
                            >
                              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                      <div className="text-left sm:text-right flex-1 sm:flex-initial">
                        <div className="font-semibold text-foreground text-sm sm:text-base whitespace-nowrap">{formatPrice(value)}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">{formatPrice(asset.price)} each</div>
                        <div className={`flex items-center gap-1 text-xs sm:text-sm justify-start sm:justify-end mt-1 whitespace-nowrap ${
                          isPositive ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          <span>{Math.abs(asset.change24h).toFixed(2)}%</span>
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(asset)}
                          className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
                        >
                          <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">{t("dashboard.portfolio.details")}</span>
                          <span className="sm:hidden">View</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onRemoveAsset(asset)}
                          className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">{t("dashboard.portfolio.remove")}</span>
                          <span className="sm:hidden">Remove</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>{t("dashboard.portfolio.empty")}</p>
              <p className="text-sm mt-2">{t("dashboard.portfolio.emptyDesc")}</p>
            </div>
          )}
        </CardContent>
      </Card>

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
  );
}
