import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Zap,
  TrendingUp,
  Calendar,
  Clock,
  AlertTriangle,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { useAIUsage } from '@/hooks/useAIUsage';

/**
 * Compact AI Usage indicator for navbar or small spaces
 */
export function AIUsageIndicator() {
  const { usage, loading, isAuthenticated, getLimitStatus } = useAIUsage();
  const navigate = useNavigate();

  if (!isAuthenticated || loading) return null;

  const limitStatus = getLimitStatus();
  const dailyPercent = usage ? (usage.dailyUsed / usage.dailyLimit) * 100 : 0;

  return (
    <button
      onClick={() => navigate('/settings?tab=subscription')}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
      title="AI Usage - Click to view details"
    >
      <Zap className={`w-4 h-4 ${limitStatus.atDailyLimit ? 'text-red-500' : limitStatus.nearLimit ? 'text-yellow-500' : 'text-primary'}`} />
      <span className="text-sm font-medium">
        {usage?.dailyRemaining ?? '...'}/{usage?.dailyLimit ?? '...'}
      </span>
      {limitStatus.atDailyLimit && (
        <Badge variant="destructive" className="text-xs px-1 py-0">Limit</Badge>
      )}
    </button>
  );
}

/**
 * Full AI Usage Card component for settings/dashboard
 */
export function AIUsageCard({ showUpgrade = true }) {
  const { usage, limits, loading, error, refetch, getUsagePercentages, getLimitStatus } = useAIUsage();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={refetch} variant="outline" className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!usage) return null;

  const percentages = getUsagePercentages();
  const limitStatus = getLimitStatus();

  const getProgressColor = (percent) => {
    if (percent >= 100) return 'bg-red-500';
    if (percent >= 80) return 'bg-yellow-500';
    return 'bg-primary';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          AI Usage
        </CardTitle>
        <CardDescription>
          Track your AI analysis usage for the current period
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Plan Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Current Plan:</span>
            <Badge className={
              usage.plan === 'premium' ? 'bg-purple-500' :
              usage.plan === 'basic' ? 'bg-blue-500' : 'bg-gray-500'
            }>
              {usage.planName || usage.plan}
            </Badge>
          </div>
          {showUpgrade && usage.plan !== 'premium' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/pricing')}
              className="text-primary"
            >
              Upgrade
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>

        {/* Daily Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Daily Usage</span>
            </div>
            <span className={`font-medium ${limitStatus.atDailyLimit ? 'text-red-500' : ''}`}>
              {usage.dailyUsed} / {usage.dailyLimit}
            </span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-primary/20">
            <div
              className={`h-full transition-all duration-300 ${getProgressColor(percentages.daily)}`}
              style={{ width: `${Math.min(100, percentages.daily)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {usage.dailyRemaining} analyses remaining today
          </p>
        </div>

        {/* Monthly Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Monthly Usage</span>
            </div>
            <span className={`font-medium ${limitStatus.atMonthlyLimit ? 'text-red-500' : ''}`}>
              {usage.monthlyUsed} / {usage.monthlyLimit}
            </span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-primary/20">
            <div
              className={`h-full transition-all duration-300 ${getProgressColor(percentages.monthly)}`}
              style={{ width: `${Math.min(100, percentages.monthly)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {usage.monthlyRemaining} analyses remaining this month
          </p>
        </div>

        {/* Warning Alerts */}
        {limitStatus.atDailyLimit && (
          <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-foreground">
              You've reached your daily limit. Upgrade your plan for more AI analyses.
            </AlertDescription>
          </Alert>
        )}

        {limitStatus.atMonthlyLimit && !limitStatus.atDailyLimit && (
          <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-foreground">
              You've reached your monthly limit. Upgrade your plan for more AI analyses.
            </AlertDescription>
          </Alert>
        )}

        {(limitStatus.nearDailyLimit || limitStatus.nearMonthlyLimit) && !limitStatus.atDailyLimit && !limitStatus.atMonthlyLimit && (
          <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-foreground">
              You're approaching your usage limit. Consider upgrading for more analyses.
            </AlertDescription>
          </Alert>
        )}

        {/* Plan Comparison */}
        {showUpgrade && usage.plan !== 'premium' && limits && (
          <div className="pt-4 border-t border-border/60">
            <p className="text-sm font-medium mb-3">Upgrade for more analyses:</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {usage.plan === 'free' && limits.allPlans?.basic && (
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <p className="font-medium text-blue-600 dark:text-blue-400">Basic Plan</p>
                  <p className="text-muted-foreground">{limits.allPlans.basic.dailyLimit}/day</p>
                  <p className="text-muted-foreground">{limits.allPlans.basic.monthlyLimit}/month</p>
                </div>
              )}
              {limits.allPlans?.premium && (
                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <p className="font-medium text-purple-600 dark:text-purple-400">Premium Plan</p>
                  <p className="text-muted-foreground">{limits.allPlans.premium.dailyLimit}/day</p>
                  <p className="text-muted-foreground">{limits.allPlans.premium.monthlyLimit}/month</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Token costs for different analysis types
export const TOKEN_COSTS = {
  crypto: 1,
  stock: 1,
  scalping: 1,
  portfolio: 2  // Portfolio analysis costs 2 tokens
};

/**
 * Inline AI Usage Badge - Shows remaining tokens in a compact inline format
 * Use this in pages where AI analysis is available
 * @param {string} analysisType - Type of analysis: 'crypto', 'stock', 'scalping', 'portfolio'
 */
export function AIUsageBadge({ className = '', analysisType = null }) {
  const { usage, loading, isAuthenticated, getLimitStatus } = useAIUsage();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 text-muted-foreground text-sm ${className}`}>
        <Zap className="w-4 h-4" />
        <span>Sign in to track AI usage</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  if (!usage) return null;

  const limitStatus = getLimitStatus();

  const getBgColor = () => {
    if (limitStatus.atDailyLimit || limitStatus.atMonthlyLimit) return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700';
    if (limitStatus.nearLimit) return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700';
    return 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700';
  };

  const getTextColor = () => {
    if (limitStatus.atDailyLimit || limitStatus.atMonthlyLimit) return 'text-red-700 dark:text-red-400';
    if (limitStatus.nearLimit) return 'text-yellow-700 dark:text-yellow-400';
    return 'text-green-700 dark:text-green-400';
  };

  const getIconColor = () => {
    if (limitStatus.atDailyLimit || limitStatus.atMonthlyLimit) return 'text-red-500';
    if (limitStatus.nearLimit) return 'text-yellow-500';
    return 'text-green-500';
  };

  const cost = analysisType ? TOKEN_COSTS[analysisType] || 1 : null;

  return (
    <button
      onClick={() => navigate('/settings?tab=subscription')}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all hover:opacity-80 ${getBgColor()} ${className}`}
      title="Click to view AI usage details"
    >
      <Zap className={`w-4 h-4 ${getIconColor()}`} />
      <span className={`text-sm font-medium ${getTextColor()}`}>
        {usage.dailyRemaining}/{usage.dailyLimit} tokens
        {cost && <span className="opacity-75"> • Cost: {cost}</span>}
      </span>
      {(limitStatus.atDailyLimit || limitStatus.atMonthlyLimit) && (
        <Badge variant="destructive" className="text-xs px-1.5 py-0">
          Limit
        </Badge>
      )}
    </button>
  );
}

/**
 * Limit Reached Modal/Alert Component
 */
export function AILimitReachedAlert({ type = 'daily', onUpgrade, onClose }) {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      navigate('/pricing');
    }
    if (onClose) onClose();
  };

  return (
    <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700">
      <AlertTriangle className="h-5 w-5 text-red-500" />
      <div className="ml-2">
        <h4 className="font-semibold text-red-700 dark:text-red-400">
          {type === 'daily' ? 'Daily Limit Reached' : 'Monthly Limit Reached'}
        </h4>
        <AlertDescription className="text-foreground mt-1">
          {type === 'daily'
            ? "You've used all your AI analyses for today. Your limit resets at midnight."
            : "You've used all your AI analyses for this month. Your limit resets on the 1st."
          }
        </AlertDescription>
        <div className="flex gap-2 mt-3">
          <Button size="sm" onClick={handleUpgrade} className="bg-gradient-money">
            <TrendingUp className="h-4 w-4 mr-1" />
            Upgrade Plan
          </Button>
          {onClose && (
            <Button size="sm" variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
}

export default AIUsageCard;
