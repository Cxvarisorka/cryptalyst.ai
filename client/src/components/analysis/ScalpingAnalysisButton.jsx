import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Zap,
  Loader2,
  Target,
  ShieldAlert,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  ArrowUpCircle,
  ArrowDownCircle,
  BarChart3,
  AlertTriangle
} from "lucide-react";

// Simulated AI scalping analysis based on current price
const generateScalpingAnalysis = (currentPrice, assetName, assetType) => {
  const isBullish = Math.random() > 0.4;
  const volatility = Math.random() * 3 + 1;
  const price = parseFloat(currentPrice) || 100;

  const entryPrice = isBullish
    ? (price * (1 - Math.random() * 0.01)).toFixed(price >= 1 ? 2 : 6)
    : (price * (1 - Math.random() * 0.015 - 0.005)).toFixed(price >= 1 ? 2 : 6);

  const entry = parseFloat(entryPrice);
  const stopLoss = (entry * (1 - volatility / 100 - 0.015)).toFixed(price >= 1 ? 2 : 6);
  const takeProfit1 = (entry * (1 + volatility / 100 + 0.008)).toFixed(price >= 1 ? 2 : 6);
  const takeProfit2 = (entry * (1 + volatility / 100 * 2 + 0.015)).toFixed(price >= 1 ? 2 : 6);
  const takeProfit3 = (entry * (1 + volatility / 100 * 3 + 0.025)).toFixed(price >= 1 ? 2 : 6);

  const riskRewardRatio = ((parseFloat(takeProfit1) - entry) / (entry - parseFloat(stopLoss))).toFixed(2);

  const patterns = isBullish
    ? ["Bullish Momentum", "Support Bounce", "Breakout Setup", "VWAP Reclaim", "EMA Cross Up"]
    : ["Bearish Momentum", "Resistance Rejection", "Breakdown Setup", "VWAP Rejection", "EMA Cross Down"];

  const confidence = Math.floor(Math.random() * 25) + 70;

  const recommendations = isBullish
    ? [
        `Consider entering ${assetName} at ${entryPrice} level`,
        "Volume supports the bullish move",
        "Set tight stop-loss for risk management",
        "Scale out at each take profit level"
      ]
    : [
        `Wait for ${assetName} to reach entry level`,
        "Watch for confirmation before entry",
        "Bearish pressure may continue",
        "Consider smaller position size"
      ];

  return {
    signal: isBullish ? "BUY" : "SELL",
    confidence,
    currentPrice: price.toFixed(price >= 1 ? 2 : 6),
    entryPrice,
    stopLoss,
    takeProfits: [takeProfit1, takeProfit2, takeProfit3],
    riskRewardRatio,
    pattern: patterns[Math.floor(Math.random() * patterns.length)],
    trend: isBullish ? "bullish" : "bearish",
    volatility: volatility.toFixed(1),
    timeframe: "5m - 15m",
    recommendations,
    assetName,
    assetType
  };
};

export default function ScalpingAnalysisButton({
  assetName,
  assetSymbol,
  assetType = "crypto",
  currentPrice,
  variant = "outline"
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setAnalysis(null);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    const result = generateScalpingAnalysis(currentPrice, assetName, assetType);
    setAnalysis(result);
    setAnalyzing(false);
  };

  const formatPrice = (price) => {
    const p = parseFloat(price);
    if (p >= 1) {
      return `$${p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${p.toFixed(6)}`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} className="gap-2" onClick={() => { setOpen(true); handleAnalyze(); }}>
          <Zap className="w-4 h-4" />
          {t('scalping.button.title')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            {t('scalping.button.dialogTitle')} - {assetSymbol}
          </DialogTitle>
          <DialogDescription>
            {t('scalping.button.dialogDescription')} {assetName}
          </DialogDescription>
        </DialogHeader>

        {analyzing && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">{t('scalping.button.analyzing')} {assetName}...</p>
          </div>
        )}

        {analysis && !analyzing && (
          <div className="space-y-4">
            {/* Signal Banner */}
            <div className={`p-4 rounded-lg flex items-center justify-between ${
              analysis.signal === "BUY"
                ? "bg-green-500/10 border border-green-500/30"
                : "bg-red-500/10 border border-red-500/30"
            }`}>
              <div className="flex items-center gap-3">
                {analysis.signal === "BUY" ? (
                  <ArrowUpCircle className="w-10 h-10 text-green-500" />
                ) : (
                  <ArrowDownCircle className="w-10 h-10 text-red-500" />
                )}
                <div>
                  <div className={`text-2xl font-bold ${
                    analysis.signal === "BUY" ? "text-green-500" : "text-red-500"
                  }`}>
                    {analysis.signal === "BUY" ? t('scalping.buy') : t('scalping.sell')}
                  </div>
                  <div className="text-sm text-muted-foreground">{analysis.pattern}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold">{analysis.confidence}%</div>
                <div className="text-xs text-muted-foreground">{t('scalping.confidenceLevel')}</div>
              </div>
            </div>

            {/* Trading Levels Grid */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-blue-500/5 border-blue-500/20">
                <CardHeader className="pb-1 pt-3">
                  <CardTitle className="text-xs flex items-center gap-1 text-blue-500">
                    <Target className="w-3 h-3" />
                    {t('scalping.entryPrice')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-1 pb-3">
                  <div className="text-lg font-bold text-blue-500">{formatPrice(analysis.entryPrice)}</div>
                </CardContent>
              </Card>

              <Card className="bg-red-500/5 border-red-500/20">
                <CardHeader className="pb-1 pt-3">
                  <CardTitle className="text-xs flex items-center gap-1 text-red-500">
                    <ShieldAlert className="w-3 h-3" />
                    {t('scalping.stopLoss')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-1 pb-3">
                  <div className="text-lg font-bold text-red-500">{formatPrice(analysis.stopLoss)}</div>
                </CardContent>
              </Card>
            </div>

            {/* Take Profit Levels */}
            <Card className="bg-card border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  {t('scalping.takeProfitLevels')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-3 gap-2">
                  {analysis.takeProfits.map((tp, index) => (
                    <div key={index} className="text-center p-2 rounded bg-green-500/10 border border-green-500/20">
                      <div className="text-xs text-muted-foreground">TP {index + 1}</div>
                      <div className="text-sm font-bold text-green-500">{formatPrice(tp)}</div>
                      <div className="text-xs text-muted-foreground">
                        +{(((parseFloat(tp) - parseFloat(analysis.entryPrice)) / parseFloat(analysis.entryPrice)) * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-lg bg-muted/30">
                <BarChart3 className="w-4 h-4 mx-auto mb-1 text-primary" />
                <div className="text-sm font-bold">1:{analysis.riskRewardRatio}</div>
                <div className="text-xs text-muted-foreground">{t('scalping.rrRatio')}</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/30">
                {analysis.trend === "bullish" ? (
                  <TrendingUp className="w-4 h-4 mx-auto mb-1 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 mx-auto mb-1 text-red-500" />
                )}
                <div className="text-sm font-bold">{t(`scalping.${analysis.trend}`)}</div>
                <div className="text-xs text-muted-foreground">{t('scalping.trend')}</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/30">
                <Zap className="w-4 h-4 mx-auto mb-1 text-yellow-500" />
                <div className="text-sm font-bold">{analysis.timeframe}</div>
                <div className="text-xs text-muted-foreground">{t('scalping.timeframe')}</div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                {t('scalping.button.recommendations')}
              </h4>
              <ul className="space-y-1">
                {analysis.recommendations.map((rec, index) => (
                  <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            {/* Disclaimer */}
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-xs text-muted-foreground flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                <span>
                  <strong className="text-yellow-500">{t('scalping.disclaimer')}:</strong> {t('scalping.disclaimerText')}
                </span>
              </p>
            </div>

            {/* Re-analyze Button */}
            <Button onClick={handleAnalyze} className="w-full" variant="outline">
              <Zap className="w-4 h-4 mr-2" />
              {t('scalping.reAnalyze')}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
