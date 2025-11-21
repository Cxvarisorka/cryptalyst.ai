import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, PieChart, BarChart3, Activity } from "lucide-react";

export default function PortfolioAnalytics({ portfolio }) {
  const { t } = useTranslation();

  const calculateMetrics = () => {
    if (portfolio.length === 0) {
      return {
        totalValue: 0,
        totalChange: 0,
        bestPerformer: null,
        worstPerformer: null,
        diversification: 0,
        cryptoPercentage: 0,
        stockPercentage: 0
      };
    }

    const totalValue = portfolio.reduce((sum, asset) => sum + (asset.price * (asset.quantity || 1)), 0);

    const totalChange = portfolio.reduce((sum, asset) => {
      const value = asset.price * (asset.quantity || 1);
      return sum + (value * asset.change24h / 100);
    }, 0);

    const changePercentage = totalValue > 0 ? (totalChange / totalValue) * 100 : 0;

    const sortedByPerformance = [...portfolio].sort((a, b) => b.change24h - a.change24h);
    const bestPerformer = sortedByPerformance[0];
    const worstPerformer = sortedByPerformance[sortedByPerformance.length - 1];

    const cryptoAssets = portfolio.filter(a => a.type === 'crypto');
    const stockAssets = portfolio.filter(a => a.type === 'stock');

    const cryptoValue = cryptoAssets.reduce((sum, asset) => sum + (asset.price * (asset.quantity || 1)), 0);
    const stockValue = stockAssets.reduce((sum, asset) => sum + (asset.price * (asset.quantity || 1)), 0);

    const cryptoPercentage = totalValue > 0 ? (cryptoValue / totalValue) * 100 : 0;
    const stockPercentage = totalValue > 0 ? (stockValue / totalValue) * 100 : 0;

    // Simple diversification score (0-100)
    const diversification = Math.min(100, portfolio.length * 10);

    return {
      totalValue,
      totalChange: changePercentage,
      bestPerformer,
      worstPerformer,
      diversification,
      cryptoPercentage,
      stockPercentage
    };
  };

  const formatPrice = (price) => {
    if (price >= 1) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${price.toFixed(6)}`;
  };

  const metrics = calculateMetrics();

  const MetricCard = ({ icon: Icon, title, value, subtitle, color = "primary" }) => (
    <Card className="bg-card border-border/60 hover:border-border transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );

  if (portfolio.length === 0) {
    return (
      <Card className="bg-card border-border/60">
        <CardHeader>
          <CardTitle>{t("dashboard.analytics.title")}</CardTitle>
          <CardDescription>{t("dashboard.analytics.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>{t("dashboard.analytics.noData")}</p>
            <p className="text-sm mt-2">{t("dashboard.analytics.noDataDesc")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={TrendingUp}
          title={t("dashboard.analytics.performance")}
          value={`${metrics.totalChange >= 0 ? '+' : ''}${metrics.totalChange.toFixed(2)}%`}
          subtitle={t("dashboard.analytics.today")}
          color={metrics.totalChange >= 0 ? "green-500" : "red-500"}
        />
        <MetricCard
          icon={PieChart}
          title={t("dashboard.analytics.diversification")}
          value={`${metrics.diversification.toFixed(0)}%`}
          subtitle={`${portfolio.length} ${t("dashboard.analytics.assets")}`}
        />
        <MetricCard
          icon={BarChart3}
          title={t("dashboard.analytics.cryptoAllocation")}
          value={`${metrics.cryptoPercentage.toFixed(1)}%`}
          subtitle={formatPrice(metrics.totalValue * metrics.cryptoPercentage / 100)}
        />
        <MetricCard
          icon={BarChart3}
          title={t("dashboard.analytics.stockAllocation")}
          value={`${metrics.stockPercentage.toFixed(1)}%`}
          subtitle={formatPrice(metrics.totalValue * metrics.stockPercentage / 100)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              {t("dashboard.analytics.bestPerformer")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.bestPerformer ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {metrics.bestPerformer.image && (
                    <img
                      src={metrics.bestPerformer.image}
                      alt={metrics.bestPerformer.name}
                      className={`w-12 h-12 ${metrics.bestPerformer.type === 'crypto' ? 'rounded-full' : 'rounded-lg'}`}
                    />
                  )}
                  <div>
                    <div className="font-semibold text-foreground">{metrics.bestPerformer.symbol}</div>
                    <div className="text-sm text-muted-foreground">{metrics.bestPerformer.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-foreground">{formatPrice(metrics.bestPerformer.price)}</div>
                  <div className="text-green-500 font-semibold">
                    +{metrics.bestPerformer.change24h.toFixed(2)}%
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">{t("dashboard.analytics.noData")}</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
              </div>
              {t("dashboard.analytics.worstPerformer")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.worstPerformer ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {metrics.worstPerformer.image && (
                    <img
                      src={metrics.worstPerformer.image}
                      alt={metrics.worstPerformer.name}
                      className={`w-12 h-12 ${metrics.worstPerformer.type === 'crypto' ? 'rounded-full' : 'rounded-lg'}`}
                    />
                  )}
                  <div>
                    <div className="font-semibold text-foreground">{metrics.worstPerformer.symbol}</div>
                    <div className="text-sm text-muted-foreground">{metrics.worstPerformer.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-foreground">{formatPrice(metrics.worstPerformer.price)}</div>
                  <div className="text-red-500 font-semibold">
                    {metrics.worstPerformer.change24h.toFixed(2)}%
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">{t("dashboard.analytics.noData")}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border/60">
        <CardHeader>
          <CardTitle>{t("dashboard.analytics.assetAllocation")}</CardTitle>
          <CardDescription>{t("dashboard.analytics.assetAllocationDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {portfolio.map((asset) => {
              const value = asset.price * (asset.quantity || 1);
              const percentage = metrics.totalValue > 0 ? (value / metrics.totalValue) * 100 : 0;

              return (
                <div key={`${asset.type}-${asset.id}`} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {asset.image && (
                        <img
                          src={asset.image}
                          alt={asset.name}
                          className={`w-6 h-6 ${asset.type === 'crypto' ? 'rounded-full' : 'rounded'}`}
                        />
                      )}
                      <span className="text-sm font-medium">{asset.symbol}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{formatPrice(value)}</span>
                      <span className="text-sm font-medium">{percentage.toFixed(2)}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        asset.type === 'crypto'
                          ? 'bg-gradient-to-r from-orange-500 to-yellow-500'
                          : 'bg-gradient-to-r from-blue-500 to-purple-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
