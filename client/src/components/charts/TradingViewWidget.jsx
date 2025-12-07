import { useEffect, useRef, memo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";

function TradingViewWidget({ currentPrice, change24h, assetName, assetSymbol, assetType }) {
  const container = useRef();
  const [isLoading, setIsLoading] = useState(true);
  const isPositive = change24h >= 0;

  // Format price for display
  const formatPrice = (price) => {
    if (price >= 1) {
      return `$${parseFloat(price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${parseFloat(price).toFixed(6)}`;
  };

  useEffect(() => {
    if (!container.current) return;

    setIsLoading(true);

    // Clear previous widget
    container.current.innerHTML = '';

    // Determine the trading symbol for TradingView
    // For crypto, most symbols are in format SYMBOLUSD (e.g., BTCUSD, ETHUSD)
    const tvSymbol = assetType === 'crypto'
      ? `${assetSymbol.toUpperCase()}USD`
      : assetSymbol.toUpperCase();

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": `BINANCE:${tvSymbol}`, // Using Binance as default exchange for crypto
      "interval": "D",
      "timezone": "Etc/UTC",
      "theme": "dark",
      "style": "1",
      "locale": "en",
      "enable_publishing": false,
      "allow_symbol_change": true,
      "calendar": false,
      "support_host": "https://www.tradingview.com",
      "studies": [
        "STD;SMA",
        "STD;EMA",
        "STD;RSI",
        "STD;MACD"
      ],
      "backgroundColor": "rgba(0, 0, 0, 0)",
      "gridColor": "rgba(42, 46, 57, 0.5)",
      "hide_top_toolbar": false,
      "hide_legend": false,
      "save_image": false,
      "container_id": "tradingview_chart"
    });

    script.onload = () => {
      setTimeout(() => setIsLoading(false), 1000);
    };

    script.onerror = () => {
      setIsLoading(false);
    };

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [assetSymbol, assetType]);

  return (
    <Card className="bg-card border-border/60">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-base sm:text-lg md:text-xl">{assetName} Price Chart (TradingView)</span>
              <div className={`flex items-center gap-1 text-xs sm:text-sm font-semibold ${
                isPositive ? 'text-green-500' : 'text-red-500'
              }`}>
                {isPositive ? <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />}
                {isPositive ? '+' : ''}{change24h.toFixed(2)}%
              </div>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Professional trading chart powered by TradingView
            </CardDescription>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-2xl sm:text-3xl font-bold text-foreground">
              {formatPrice(currentPrice)}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Current Price
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative" style={{ height: "500px", width: "100%" }}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm z-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
          <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
            <div id="tradingview_chart" style={{ height: "100%", width: "100%" }}></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default memo(TradingViewWidget);
