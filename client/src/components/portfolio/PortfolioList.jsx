import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Trash2, ExternalLink } from "lucide-react";

export default function PortfolioList({ portfolio, onRemoveAsset }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
          <div className="flex items-end justify-between">
            <div>
              <div className="text-4xl font-bold text-foreground">
                {formatPrice(totalValue)}
              </div>
              <div className={`flex items-center gap-2 mt-2 text-lg font-semibold ${
                isPositive ? 'text-green-500' : 'text-red-500'
              }`}>
                {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                <span>{isPositive ? '+' : ''}{totalChange.toFixed(2)}%</span>
                <span className="text-sm text-muted-foreground font-normal">
                  {t("dashboard.portfolio.today")}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">{t("dashboard.portfolio.assets")}</div>
              <div className="text-2xl font-bold text-foreground">{portfolio.length}</div>
            </div>
          </div>
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
                    className="flex items-center justify-between p-4 border border-border/40 rounded-lg hover:bg-muted/30 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {asset.image && (
                        <img
                          src={asset.image}
                          alt={asset.name}
                          className={`w-12 h-12 ${asset.type === 'crypto' ? 'rounded-full' : 'rounded-lg'}`}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground text-lg">{asset.symbol}</div>
                        <div className="text-sm text-muted-foreground">{asset.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {asset.quantity || 1} {asset.quantity > 1 ? 'units' : 'unit'} • {percentage.toFixed(2)}% of portfolio
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-semibold text-foreground">{formatPrice(value)}</div>
                        <div className="text-sm text-muted-foreground">{formatPrice(asset.price)} each</div>
                        <div className={`flex items-center gap-1 text-sm justify-end mt-1 ${
                          isPositive ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          <span>{Math.abs(asset.change24h).toFixed(2)}%</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(asset)}
                          className="gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          {t("dashboard.portfolio.details")}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onRemoveAsset(asset)}
                          className="gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          {t("dashboard.portfolio.remove")}
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
    </div>
  );
}
