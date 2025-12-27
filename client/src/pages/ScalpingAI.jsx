import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useOnboardingTracker } from "@/hooks/useOnboardingTracker";
import { useAIUsage } from "@/hooks/useAIUsage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FadeIn } from "@/components/magicui/fade-in";
import Hero from "@/components/layout/Hero";
import aiUsageService from "@/services/aiUsage.service";
import { AIUsageBadge } from "@/components/ai/AIUsageDisplay";
import {
  Upload,
  Image as ImageIcon,
  TrendingUp,
  TrendingDown,
  Target,
  ShieldAlert,
  DollarSign,
  Zap,
  Loader2,
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowUpCircle,
  ArrowDownCircle,
  BarChart3,
  Lock,
  Clock
} from "lucide-react";

// Simulated AI analysis function
const generateSimulatedAnalysis = (t) => {
  const isBullish = Math.random() > 0.4; // 60% chance bullish
  const currentPrice = (Math.random() * 1000 + 50).toFixed(2);
  const volatility = Math.random() * 5 + 1;

  const buyPrice = isBullish
    ? (parseFloat(currentPrice) * (1 - Math.random() * 0.02)).toFixed(2)
    : (parseFloat(currentPrice) * (1 - Math.random() * 0.03 - 0.01)).toFixed(2);

  const stopLoss = (parseFloat(buyPrice) * (1 - volatility / 100 - 0.02)).toFixed(2);
  const takeProfit1 = (parseFloat(buyPrice) * (1 + volatility / 100 + 0.01)).toFixed(2);
  const takeProfit2 = (parseFloat(buyPrice) * (1 + volatility / 100 * 2 + 0.02)).toFixed(2);
  const takeProfit3 = (parseFloat(buyPrice) * (1 + volatility / 100 * 3 + 0.03)).toFixed(2);

  const riskRewardRatio = ((parseFloat(takeProfit1) - parseFloat(buyPrice)) / (parseFloat(buyPrice) - parseFloat(stopLoss))).toFixed(2);

  const patterns = [
    "Double Bottom Formation",
    "Bull Flag Pattern",
    "Ascending Triangle",
    "Cup and Handle",
    "Inverse Head and Shoulders",
    "Falling Wedge Breakout",
    "Morning Star Candlestick",
    "Bullish Engulfing Pattern",
    "Bear Flag Pattern",
    "Descending Triangle",
    "Head and Shoulders",
    "Rising Wedge Breakdown",
    "Evening Star Candlestick",
    "Bearish Engulfing Pattern"
  ];

  const supportLevels = [
    (parseFloat(currentPrice) * 0.95).toFixed(2),
    (parseFloat(currentPrice) * 0.90).toFixed(2),
    (parseFloat(currentPrice) * 0.85).toFixed(2)
  ];

  const resistanceLevels = [
    (parseFloat(currentPrice) * 1.05).toFixed(2),
    (parseFloat(currentPrice) * 1.10).toFixed(2),
    (parseFloat(currentPrice) * 1.15).toFixed(2)
  ];

  const confidence = Math.floor(Math.random() * 30) + 65; // 65-95%

  return {
    signal: isBullish ? "BUY" : "SELL",
    confidence,
    currentPrice,
    entryPrice: buyPrice,
    stopLoss,
    takeProfits: [takeProfit1, takeProfit2, takeProfit3],
    riskRewardRatio,
    pattern: patterns[Math.floor(Math.random() * (isBullish ? 8 : patterns.length - 8) + (isBullish ? 0 : 8))],
    trend: isBullish ? "bullish" : "bearish",
    volatility: volatility.toFixed(1),
    supportLevels,
    resistanceLevels,
    timeframe: ["1m", "5m", "15m", "1h"][Math.floor(Math.random() * 4)],
    recommendations: isBullish ? [
      "Strong buying momentum detected",
      "Volume confirms the upward move",
      "Consider scaling in positions",
      "Set alerts at key resistance levels"
    ] : [
      "Bearish pressure increasing",
      "Watch for breakdown confirmation",
      "Consider waiting for better entry",
      "Monitor support levels closely"
    ]
  };
};

export default function ScalpingAI() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { completeTask } = useOnboardingTracker();
  const { usage, isAuthenticated, checkCanAnalyze, refetch: refetchUsage, getLimitStatus } = useAIUsage();
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [usageError, setUsageError] = useState(null);
  const fileInputRef = useRef(null);

  const limitStatus = getLimitStatus();

  // Track onboarding task when analysis is completed
  useEffect(() => {
    if (analysis) {
      completeTask('useScalpingAI');
    }
  }, [analysis, completeTask]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setAnalysis(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setAnalysis(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const clearImage = () => {
    setImage(null);
    setImagePreview(null);
    setAnalysis(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const analyzeChart = async () => {
    setUsageError(null);

    // Check if user can perform analysis (only for authenticated users)
    if (isAuthenticated) {
      const canAnalyze = await checkCanAnalyze('scalping');
      if (!canAnalyze.allowed) {
        setUsageError({
          type: canAnalyze.reason === 'daily_limit_exceeded' ? 'daily' : 'monthly',
          message: canAnalyze.message
        });
        return;
      }
    }

    setAnalyzing(true);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1500));
      const result = generateSimulatedAnalysis(t);
      setAnalysis(result);

      // Record usage after successful analysis (for authenticated users)
      if (isAuthenticated) {
        try {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
          await fetch(`${API_URL}/analysis/scalping`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
          });
          refetchUsage(); // Refresh usage stats
        } catch (err) {
          console.error('Error recording usage:', err);
        }
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const heroIcons = [
    { Icon: Zap, gradient: 'bg-gradient-money' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <Hero
        title={t('scalping.title')}
        subtitle={t('scalping.subtitle')}
        icons={heroIcons}
        showSingleIcon={true}
        align="left"
        size="medium"
      />

      <div className="container mx-auto px-4 py-10">
        <FadeIn className="space-y-6">
          {/* AI Usage Display */}
          {isAuthenticated && usage && (
            <Card className="bg-card border-border/60">
              <CardContent className="py-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Daily:</span>
                      <Badge variant={limitStatus.atDailyLimit ? "destructive" : "secondary"}>
                        {usage.dailyRemaining}/{usage.dailyLimit} left
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Monthly:</span>
                      <Badge variant={limitStatus.atMonthlyLimit ? "destructive" : "secondary"}>
                        {usage.monthlyRemaining}/{usage.monthlyLimit} left
                      </Badge>
                    </div>
                  </div>
                  <Badge className={
                    usage.plan === 'premium' ? 'bg-purple-500' :
                    usage.plan === 'basic' ? 'bg-blue-500' : 'bg-gray-500'
                  }>
                    {usage.planName || usage.plan} Plan
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Usage Limit Error */}
          {usageError && (
            <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700">
              <Lock className="h-5 w-5 text-red-500" />
              <div className="ml-2 flex-1">
                <h4 className="font-semibold text-red-700 dark:text-red-400">
                  {usageError.type === 'daily' ? 'Daily Limit Reached' : 'Monthly Limit Reached'}
                </h4>
                <AlertDescription className="text-foreground mt-1">
                  {usageError.message}
                </AlertDescription>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={() => navigate('/pricing')} className="bg-gradient-money">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Upgrade Plan
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setUsageError(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </Alert>
          )}

          {/* AI Usage Badge */}
          <div className="flex justify-end mb-2">
            <AIUsageBadge analysisType="scalping" />
          </div>

          {/* Upload Section */}
          <Card className="bg-card border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                {t('scalping.uploadTitle')}
              </CardTitle>
              <CardDescription>
                {t('scalping.uploadDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!imagePreview ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border/60 rounded-lg p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-foreground mb-2">
                    {t('scalping.dropHere')}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('scalping.orClickBrowse')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('scalping.supportedFormats')}
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Chart preview"
                      className="w-full max-h-[500px] object-contain rounded-lg border border-border/60"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={clearImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Button
                      onClick={analyzeChart}
                      disabled={analyzing || (isAuthenticated && (limitStatus.atDailyLimit || limitStatus.atMonthlyLimit))}
                      className="bg-gradient-money hover:opacity-90 px-8"
                      size="lg"
                    >
                      {analyzing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          {t('scalping.analyzingChart')}
                        </>
                      ) : (limitStatus.atDailyLimit || limitStatus.atMonthlyLimit) ? (
                        <>
                          <Lock className="w-5 h-5 mr-2" />
                          Limit Reached
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 mr-2" />
                          {t('scalping.analyzeWithAI')}
                        </>
                      )}
                    </Button>
                    {isAuthenticated && (limitStatus.atDailyLimit || limitStatus.atMonthlyLimit) && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => navigate('/pricing')}
                        className="text-primary"
                      >
                        Upgrade for more analyses
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {analysis && (
            <FadeIn>
              {/* Signal Card */}
              <Card className={`bg-card border-2 mb-6 ${
                analysis.signal === "BUY"
                  ? "border-green-500/50 bg-green-500/5"
                  : "border-red-500/50 bg-red-500/5"
              }`}>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-full ${
                        analysis.signal === "BUY"
                          ? "bg-green-500/20"
                          : "bg-red-500/20"
                      }`}>
                        {analysis.signal === "BUY" ? (
                          <ArrowUpCircle className="w-12 h-12 text-green-500" />
                        ) : (
                          <ArrowDownCircle className="w-12 h-12 text-red-500" />
                        )}
                      </div>
                      <div>
                        <div className={`text-4xl font-bold ${
                          analysis.signal === "BUY" ? "text-green-500" : "text-red-500"
                        }`}>
                          {analysis.signal === "BUY" ? t('scalping.buy') : t('scalping.sell')}
                        </div>
                        <div className="text-muted-foreground">
                          {t('scalping.signalDetected')}
                        </div>
                      </div>
                    </div>
                    <div className="text-center md:text-right">
                      <div className="text-sm text-muted-foreground mb-1">{t('scalping.confidenceLevel')}</div>
                      <div className="text-3xl font-bold text-foreground">{analysis.confidence}%</div>
                      <div className="flex items-center gap-2 justify-center md:justify-end mt-1">
                        <div className={`w-2 h-2 rounded-full ${
                          analysis.confidence >= 80 ? "bg-green-500" :
                          analysis.confidence >= 60 ? "bg-yellow-500" : "bg-red-500"
                        }`} />
                        <span className="text-sm text-muted-foreground">
                          {analysis.confidence >= 80 ? t('scalping.high') :
                           analysis.confidence >= 60 ? t('scalping.moderate') : t('scalping.low')}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trading Levels */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="bg-card border-border/60">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Target className="w-4 h-4 text-blue-500" />
                      {t('scalping.entryPrice')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-500">${analysis.entryPrice}</div>
                    <p className="text-xs text-muted-foreground mt-1">{t('scalping.recommendedEntry')}</p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border/60">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <ShieldAlert className="w-4 h-4 text-red-500" />
                      {t('scalping.stopLoss')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-500">${analysis.stopLoss}</div>
                    <p className="text-xs text-muted-foreground mt-1">{t('scalping.riskManagement')}</p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border/60">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      {t('scalping.takeProfit')} 1
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-500">${analysis.takeProfits[0]}</div>
                    <p className="text-xs text-muted-foreground mt-1">{t('scalping.firstTarget')}</p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border/60">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <BarChart3 className="w-4 h-4 text-primary" />
                      {t('scalping.rrRatio')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">1:{analysis.riskRewardRatio}</div>
                    <p className="text-xs text-muted-foreground mt-1">{t('scalping.riskToReward')}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Take Profits */}
              <Card className="bg-card border-border/60 mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Target className="w-5 h-5 text-primary" />
                    {t('scalping.takeProfitLevels')}
                  </CardTitle>
                  <CardDescription>{t('scalping.scaleOutPositions')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {analysis.takeProfits.map((tp, index) => (
                      <div key={index} className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="text-sm text-muted-foreground mb-1">TP {index + 1}</div>
                        <div className="text-xl font-bold text-green-500">${tp}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          +{(((parseFloat(tp) - parseFloat(analysis.entryPrice)) / parseFloat(analysis.entryPrice)) * 100).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Pattern & Analysis Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card className="bg-card border-border/60">
                  <CardHeader>
                    <CardTitle className="text-base">{t('scalping.patternDetected')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                      <span className="text-lg font-semibold">{analysis.pattern}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">{t('scalping.trend')}:</span>
                        <span className={`ml-2 font-semibold ${
                          analysis.trend === "bullish" ? "text-green-500" : "text-red-500"
                        }`}>
                          {t(`scalping.${analysis.trend}`)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t('scalping.volatility')}:</span>
                        <span className="ml-2 font-semibold">{analysis.volatility}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t('scalping.timeframe')}:</span>
                        <span className="ml-2 font-semibold">{analysis.timeframe}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t('scalping.currentPrice')}:</span>
                        <span className="ml-2 font-semibold">${analysis.currentPrice}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border/60">
                  <CardHeader>
                    <CardTitle className="text-base">{t('scalping.keyLevels')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-green-500 mb-2 flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          {t('scalping.resistance')}
                        </h4>
                        <div className="space-y-1">
                          {analysis.resistanceLevels.map((level, i) => (
                            <div key={i} className="text-sm text-muted-foreground">
                              R{i + 1}: <span className="text-foreground font-medium">${level}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-red-500 mb-2 flex items-center gap-1">
                          <TrendingDown className="w-4 h-4" />
                          {t('scalping.support')}
                        </h4>
                        <div className="space-y-1">
                          {analysis.supportLevels.map((level, i) => (
                            <div key={i} className="text-sm text-muted-foreground">
                              S{i + 1}: <span className="text-foreground font-medium">${level}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations */}
              <Card className="bg-card border-border/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    {t('scalping.aiRecommendations')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{rec}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-yellow-500">{t('scalping.disclaimer')}:</strong> {t('scalping.disclaimerText')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          )}
        </FadeIn>
      </div>
    </div>
  );
}
