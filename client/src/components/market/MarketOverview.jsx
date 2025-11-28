import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { getMarketData } from "@/services/marketDataService";
import { FadeIn } from "@/components/magicui/fade-in";

export default function MarketOverview() {
  const { t } = useTranslation();
  const [marketData, setMarketData] = useState({ crypto: [], stocks: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    setLoading(true);
    const data = await getMarketData();
    setMarketData(data);
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

  const MarketItem = ({ item }) => {
    const isPositive = item.change24h >= 0;

    return (
      <div className="flex items-center justify-between py-3 border-b border-border/40 last:border-0 hover:bg-muted/30 px-3 rounded transition-all duration-300">
        <div className="flex items-center gap-3 flex-1">
          {item.image && (
            <img src={item.image} alt={item.name} className="w-8 h-8 rounded-full" />
          )}
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-foreground">{item.symbol}</div>
            <div className="text-xs text-muted-foreground truncate">{item.name}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-semibold text-foreground">{formatPrice(item.price)}</div>
          <div className={`flex items-center gap-1 text-sm justify-end ${
            isPositive ? 'text-green-500' : 'text-red-500'
          }`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{Math.abs(item.change24h).toFixed(2)}%</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-20">
      {/* Crypto Section */}
      <FadeIn delay={0.1}>
        <Card className="bg-card border-border/60 hover:border-border transition-all duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-foreground">{t('home.marketOverview.crypto')}</div>
                <div className="text-sm font-normal text-muted-foreground">
                  {t('home.marketOverview.cryptoDesc')}
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3">
            {marketData.crypto.length > 0 ? (
              <div className="space-y-0">
                {marketData.crypto.slice(0, 5).map((coin) => (
                  <MarketItem key={coin.id} item={coin} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {t('home.marketOverview.noData')}
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>

      {/* Stocks Section */}
      <FadeIn delay={0.2}>
        <Card className="bg-card border-border/60 hover:border-border transition-all duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-foreground">{t('home.marketOverview.stocks')}</div>
                <div className="text-sm font-normal text-muted-foreground">
                  {t('home.marketOverview.stocksDesc')}
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3">
            {marketData.stocks.length > 0 ? (
              <div className="space-y-0">
                {marketData.stocks.slice(0, 5).map((stock) => (
                  <MarketItem key={stock.id} item={stock} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {t('home.marketOverview.noData')}
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
