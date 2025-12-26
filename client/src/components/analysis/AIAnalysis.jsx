import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Download,
  RefreshCw,
  BarChart3,
  Newspaper,
  Target,
  Shield,
  Activity,
  Info,
  Lock
} from "lucide-react";
import { generateAIAnalysis, formatAnalysisForDisplay } from "@/utils/aiAnalysis";
import { exportAnalysisToPDF } from "@/utils/pdfExport";
import { useAIUsage } from "@/hooks/useAIUsage";
import aiUsageService from "@/services/aiUsage.service";

export default function AIAnalysis({
  assetName,
  assetSymbol,
  assetType,
  currentPrice,
  change24h,
  priceHistory,
  stats,
  news,
  chartData
}) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [usageLimitError, setUsageLimitError] = useState(null);
  const { refetch: refetchUsage, isAuthenticated, getLimitStatus } = useAIUsage();

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysis(null);
    setUsageLimitError(null);

    // Check if user is authenticated
    if (!isAuthenticated) {
      setUsageLimitError('Please sign in to use AI analysis');
      setLoading(false);
      return;
    }

    try {
      // Check usage limits before performing analysis
      const checkResponse = await aiUsageService.checkUsage(assetType === 'portfolio' ? 'portfolio' : assetType);

      if (!checkResponse.data?.allowed) {
        setUsageLimitError(checkResponse.data?.message || 'AI usage limit exceeded');
        setLoading(false);
        return;
      }

      // Perform the analysis
      setTimeout(async () => {
        const rawAnalysis = generateAIAnalysis({
          assetName,
          assetSymbol,
          assetType,
          currentPrice,
          change24h,
          priceHistory,
          stats,
          news,
          chartData
        });

        const formattedAnalysis = formatAnalysisForDisplay(rawAnalysis);
        setAnalysis(formattedAnalysis);

        // Record AI usage after successful analysis
        try {
          const axios = (await import('axios')).default;
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
          await axios.post(`${API_URL}/analysis/record-usage`, {
            type: assetType,
            assetId: assetSymbol
          }, { withCredentials: true });

          // Immediately refresh navbar usage indicator
          refetchUsage();
        } catch (err) {
          console.error('Error recording AI usage:', err);
        }

        setLoading(false);
      }, 2500);
    } catch (error) {
      console.error('Error checking usage:', error);
      setUsageLimitError(error.message || 'Failed to check usage limits');
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (analysis) {
      exportAnalysisToPDF(analysis, i18n.language);
    }
  };

  const getRecommendationColor = (action) => {
    if (action === 'BUY') return 'border-green-500/50 bg-green-50 dark:bg-green-950/30';
    if (action === 'SELL') return 'border-green-700/50 bg-green-100 dark:bg-green-900/30';
    return 'border-green-500/50 bg-green-50 dark:bg-green-950/30';
  };

  const getRecommendationIcon = (action) => {
    if (action === 'BUY') return <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />;
    if (action === 'SELL') return <TrendingDown className="w-8 h-8 text-green-700 dark:text-green-500" />;
    return <Activity className="w-8 h-8 text-green-600 dark:text-green-400" />;
  };

  const getRiskColor = (level) => {
    if (level === 'High') return 'text-green-800 dark:text-green-600';
    if (level === 'Medium') return 'text-green-600 dark:text-green-400';
    return 'text-green-500 dark:text-green-300';
  };

  const getSentimentColor = (sentiment) => {
    if (sentiment === 'bullish') return 'text-green-600 dark:text-green-400';
    if (sentiment === 'bearish') return 'text-green-700 dark:text-green-500';
    return 'text-green-600 dark:text-green-400';
  };

  // Check if at limit to show warning
  const limitStatus = getLimitStatus();

  if (!analysis) {
    return (
      <div className="space-y-4">
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

        {/* Near Limit Warning */}
        {!usageLimitError && limitStatus.nearLimit && (
          <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <div className="ml-2">
              <AlertDescription className="text-foreground">
                You're approaching your AI usage limit. Consider upgrading for more analyses.
              </AlertDescription>
            </div>
          </Alert>
        )}

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center shadow-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {t('aiAnalysis.title', 'AI-Powered Market Analysis')}
                </CardTitle>
                <CardDescription className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {t('aiAnalysis.description', 'Comprehensive analysis using technical indicators, news sentiment, and market data')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 pb-10">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-950 mb-4">
                  <Brain className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  {t('aiAnalysis.title', 'AI-Powered Market Analysis')}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                {t('aiAnalysis.description', 'Comprehensive analysis using technical indicators, news sentiment, and market data')}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { icon: BarChart3, label: t('aiAnalysis.technicalAnalysis', 'Technical Analysis'), color: 'green' },
                { icon: Newspaper, label: t('aiAnalysis.sentimentAnalysis', 'News Sentiment Analysis'), color: 'emerald' },
                { icon: Target, label: t('aiAnalysis.priceTargets', 'Price Targets & Support/Resistance'), color: 'green' },
                { icon: Shield, label: t('aiAnalysis.riskLevel', 'Risk Level'), color: 'green' }
              ].map((item, index) => (
                <div key={index} className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-green-500 dark:hover:border-green-500 transition-colors">
                  <item.icon className={`w-6 h-6 text-${item.color}-600 dark:text-${item.color}-400 mx-auto mb-2`} />
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-300 text-center">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={handleAnalyze}
                disabled={loading}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all px-8"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    {t('aiAnalysis.analyzing', 'Analyzing Market Data')}
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5 mr-2" />
                    {t('aiAnalysis.analyzeButton', 'Analyze Market')} (1 token)
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center shadow-md">
                  <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  {t('aiAnalysis.title', 'AI-Powered Market Analysis')}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                  {analysis.formattedDate}
                </p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                className="gap-2 flex-1 sm:flex-initial border-slate-300 dark:border-slate-700"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">{t('aiAnalysis.downloadPdfButton', 'Download PDF Report')}</span>
                <span className="sm:hidden">PDF</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAnalyze}
                className="gap-2 flex-1 sm:flex-initial border-slate-300 dark:border-slate-700"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">{t('aiAnalysis.reanalyzeButton', 'Re-analyze')}</span>
                <span className="sm:hidden">{t('aiAnalysis.reanalyzeButton', 'Re-analyze')}</span>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Recommendation */}
      <Card className={`border-2 shadow-sm ${getRecommendationColor(analysis.recommendation.action)}`}>
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="flex items-center gap-4">
              {getRecommendationIcon(analysis.recommendation.action)}
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100">
                  {analysis.recommendation.action}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {t('aiAnalysis.recommendation', 'Recommendation')}
                </div>
              </div>
            </div>
            <div className="flex-1 w-full">
              <div className="mb-2 flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t('aiAnalysis.confidence', 'Confidence')}
                </span>
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {analysis.recommendation.confidence}%
                </span>
              </div>
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-600 to-emerald-600 transition-all duration-1000 ease-out"
                  style={{ width: `${analysis.recommendation.confidence}%` }}
                />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                {analysis.summary}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Sentiment */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Newspaper className="w-5 h-5 text-green-600 dark:text-green-400" />
              {t('aiAnalysis.sentimentAnalysis', 'News Sentiment Analysis')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getSentimentColor(analysis.sentiment.sentiment)}`}>
                  {analysis.sentiment.score}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 capitalize mt-1">
                  {t(`aiAnalysis.${analysis.sentiment.sentiment}`, analysis.sentiment.sentiment)}
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">{t('aiAnalysis.confidence', 'Confidence')}:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{analysis.sentiment.confidence}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">{t('aiAnalysis.newsAnalyzed', 'News Analyzed')}:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{analysis.sentiment.newsCount}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
              {t('aiAnalysis.technicalAnalysis', 'Technical Analysis')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className={`text-4xl font-bold ${analysis.technical.score > 60 ? 'text-green-600 dark:text-green-400' : analysis.technical.score < 40 ? 'text-green-700 dark:text-green-500' : 'text-green-600 dark:text-green-400'}`}>
                  {analysis.technical.score}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 capitalize mt-1">
                  {t(`aiAnalysis.${analysis.technical.trend}`, analysis.technical.trend)}
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">{t('aiAnalysis.bullishSignals', 'Bullish Signals')}:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">{analysis.technical.bullishCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">{t('aiAnalysis.bearishSignals', 'Bearish Signals')}:</span>
                  <span className="font-semibold text-green-700 dark:text-green-500">{analysis.technical.bearishCount}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
              {t('aiAnalysis.riskLevel', 'Risk Level')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getRiskColor(analysis.risk.level)}`}>
                  {t(`aiAnalysis.riskLevel`, analysis.risk.level)}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {t('aiAnalysis.riskScore', 'Risk Score')}: {analysis.risk.score}/100
                </div>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${analysis.risk.level === 'High' ? 'bg-green-800' : analysis.risk.level === 'Medium' ? 'bg-green-600' : 'bg-green-500'}`}
                  style={{ width: `${analysis.risk.score}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Technical Signals */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t('aiAnalysis.technicalSignals', 'Technical Signals')}
          </CardTitle>
          <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
            {t('aiAnalysis.description', 'Detailed breakdown of each technical indicator')}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {analysis.technical.signals && analysis.technical.signals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.technical.signals.map((signal, index) => (
                <div key={index} className="flex items-start gap-3 p-4 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-green-500 dark:hover:border-green-500 transition-colors">
                  <div className="flex-shrink-0 mt-0.5">
                    {signal.signal.includes('Bullish') || signal.signal === 'Oversold' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : signal.signal.includes('Bearish') || signal.signal === 'Overbought' ? (
                      <XCircle className="w-5 h-5 text-green-700 dark:text-green-500" />
                    ) : (
                      <Info className="w-5 h-5 text-green-600 dark:text-green-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                      {signal.indicator}: <span className="text-slate-600 dark:text-slate-400">{signal.signal}</span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">{signal.description}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              {t('aiAnalysis.noSignals', 'No technical signals available')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Price Targets */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
            <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
            {t('aiAnalysis.priceTargets', 'Price Targets & Support/Resistance')}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {[
              { label: t('aiAnalysis.resistance', 'Resistance') + ' 2', value: analysis.priceTargets.resistance2, color: 'green', type: 'resistance' },
              { label: t('aiAnalysis.resistance', 'Resistance') + ' 1', value: analysis.priceTargets.resistance1, color: 'green', type: 'resistance' },
              { label: t('aiAnalysis.currentPrice', 'Current Price'), value: analysis.priceTargets.currentPrice, color: 'emerald', type: 'current' },
              { label: t('aiAnalysis.support', 'Support') + ' 1', value: analysis.priceTargets.support1, color: 'green', type: 'support' },
              { label: t('aiAnalysis.support', 'Support') + ' 2', value: analysis.priceTargets.support2, color: 'green', type: 'support' },
              { label: t('aiAnalysis.targetPrice', '30-Day Target Price'), value: analysis.priceTargets.targetPrice, color: 'green', type: 'target' }
            ].map((item, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${
                item.type === 'current' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' :
                item.type === 'target' ? 'border-green-600 bg-green-50 dark:bg-green-950/30' :
                'border-slate-200 dark:border-slate-800'
              }`}>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                <span className={`font-bold text-${item.color}-600 dark:text-${item.color}-400`}>
                  ${item.value.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t('aiAnalysis.keyInsights', 'Key Insights')}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ul className="space-y-3">
            {analysis.insights.map((insight, index) => (
              <li key={index} className="flex items-start gap-3 text-sm">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mt-0.5">
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400">{index + 1}</span>
                </div>
                <span className="text-slate-700 dark:text-slate-300">{insight}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Recommendation Reasoning */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t('aiAnalysis.recommendationReasoning', 'Recommendation Reasoning')}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ul className="space-y-2">
            {analysis.recommendation.reasoning.map((reason, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <div className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400 flex-shrink-0"></div>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 dark:text-slate-300">
              <strong>{t('aiAnalysis.disclaimer', 'Disclaimer')}:</strong> {t('aiAnalysis.disclaimerText', 'This analysis is for educational and informational purposes only and should not be considered as financial advice. Always conduct your own research and consult with a qualified financial advisor before making investment decisions. Past performance does not guarantee future results.')}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
