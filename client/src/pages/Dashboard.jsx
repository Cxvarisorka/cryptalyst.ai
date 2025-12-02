import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FadeIn } from "@/components/magicui/fade-in";
import { TrendingUp, TrendingDown, Loader2, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PortfolioSearch from "@/components/portfolio/PortfolioSearch";
import PortfolioList from "@/components/portfolio/PortfolioList";
import PortfolioAnalytics from "@/components/portfolio/PortfolioAnalytics";
import PortfolioManager from "@/components/portfolio/PortfolioManager";
import { getMarketData } from "@/services/marketDataService";
import { getPortfolio, addAsset, removeAsset } from "@/services/portfolioService";
import { useToast } from "@/components/ui/use-toast";
import Hero from "@/components/layout/Hero";
import socketService from "@/services/socket.service";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState([]);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [marketData, setMarketData] = useState({ crypto: [], stocks: [] });
  const [selectedCollection, setSelectedCollection] = useState(null);

  useEffect(() => {
    // Don't load portfolio here - let PortfolioManager trigger it when default collection is selected
    // Load portfolio will be called by handleCollectionChange when PortfolioManager sets default collection

    // Fetch market data
    fetchMarketData();
  }, []);

  // Set up Socket.io listeners for real-time price updates
  useEffect(() => {
    const handleCryptoPriceUpdate = (updateData) => {
      console.log('📡 Received crypto price update');
      setMarketData((prev) => ({
        ...prev,
        crypto: updateData.data
      }));
    };

    const handleStockPriceUpdate = (updateData) => {
      console.log('📡 Received stock price update');
      setMarketData((prev) => ({
        ...prev,
        stocks: updateData.data
      }));
    };

    // Subscribe to price updates
    socketService.onCryptoPriceUpdate(handleCryptoPriceUpdate);
    socketService.onStockPriceUpdate(handleStockPriceUpdate);

    // Cleanup listeners on unmount
    return () => {
      socketService.offCryptoPriceUpdate(handleCryptoPriceUpdate);
      socketService.offStockPriceUpdate(handleStockPriceUpdate);
    };
  }, []);

  const loadPortfolio = async (collectionId) => {
    setPortfolioLoading(true);
    try {
      const portfolioData = await getPortfolio(collectionId);
      setPortfolio(portfolioData);
    } catch (error) {
      console.error("Error loading portfolio:", error);
      toast({
        title: t("dashboard.portfolio.error") || "Error",
        description: "Failed to load portfolio",
        variant: "destructive"
      });
    } finally {
      setPortfolioLoading(false);
    }
  };

  const handleCollectionChange = async (collection) => {
    setSelectedCollection(collection);
    await loadPortfolio(collection?._id);
  };

  const fetchMarketData = async () => {
    try {
      const data = await getMarketData();
      setMarketData(data);
    } catch (error) {
      console.error("Error fetching market data:", error);
    }
  };

  const handleAddAsset = async (asset) => {
    try {
      // Add collection ID to asset if one is selected
      const assetWithCollection = {
        ...asset,
        collectionId: selectedCollection?._id
      };
      await addAsset(assetWithCollection);

      // Reload portfolio to get updated data
      await loadPortfolio(selectedCollection?._id);

      toast({
        title: t("dashboard.portfolio.added"),
        description: `${asset.name} ${t("dashboard.portfolio.addedDesc")}`
      });
    } catch (error) {
      console.error("Error adding asset:", error);
      toast({
        title: t("dashboard.portfolio.error") || "Error",
        description: error.message || t("dashboard.portfolio.addError") || "Failed to add asset",
        variant: "destructive"
      });
    }
  };

  const handleRemoveAsset = async (asset) => {
    try {
      await removeAsset(asset._id);

      // Reload portfolio to get updated data
      await loadPortfolio(selectedCollection?._id);

      toast({
        title: t("dashboard.portfolio.removed"),
        description: `${asset.name} ${t("dashboard.portfolio.removedDesc")}`
      });
    } catch (error) {
      console.error("Error removing asset:", error);
      toast({
        title: t("dashboard.portfolio.error") || "Error",
        description: error.message || t("dashboard.portfolio.removeError") || "Failed to remove asset",
        variant: "destructive"
      });
    }
  };

  const handleViewCrypto = (crypto) => {
    navigate(`/crypto/${crypto.id}`);
  };

  const handleViewStock = (stock) => {
    navigate(`/stock/${stock.symbol}`);
  };

  const calculatePortfolioMetrics = () => {
    if (portfolio.length === 0) {
      return { totalValue: 0, dayChange: 0, dayChangePercent: 0 };
    }

    const totalValue = portfolio.reduce((sum, asset) => {
      return sum + (asset.price * (asset.quantity || 1));
    }, 0);

    const dayChange = portfolio.reduce((sum, asset) => {
      const value = asset.price * (asset.quantity || 1);
      return sum + (value * asset.change24h / 100);
    }, 0);

    const dayChangePercent = totalValue > 0 ? (dayChange / totalValue) * 100 : 0;

    return { totalValue, dayChange, dayChangePercent };
  };

  const metrics = calculatePortfolioMetrics();
  const formatPrice = (price) => {
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const heroIcons = [
    { Icon: BarChart3, gradient: 'bg-gradient-money' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      {/* Hero Section */}
      <Hero
        title={t("dashboard.title")}
        subtitle={t("dashboard.subtitle")}
        icons={heroIcons}
        showSingleIcon={true}
        align="left"
        size="medium"
      >
        <PortfolioManager onCollectionChange={handleCollectionChange} />
      </Hero>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-10">

        {portfolioLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading portfolio...</p>
            </div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-muted/60 w-full h-auto flex flex-wrap justify-start sm:justify-center gap-1 p-1">
              <TabsTrigger value="overview" className="text-xs sm:text-sm flex-1 sm:flex-initial min-w-[80px]">{t("dashboard.tabs.overview")}</TabsTrigger>
              <TabsTrigger value="portfolio" className="text-xs sm:text-sm flex-1 sm:flex-initial min-w-[80px]">{t("dashboard.tabs.portfolio")}</TabsTrigger>
              <TabsTrigger value="search" className="text-xs sm:text-sm flex-1 sm:flex-initial min-w-[80px]">{t("dashboard.tabs.search")}</TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs sm:text-sm flex-1 sm:flex-initial min-w-[80px]">{t("dashboard.tabs.analytics")}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              <Card className="bg-card border-border/60">
                <CardHeader>
                  <CardTitle>{t("dashboard.overview.totalValue.title")}</CardTitle>
                  <CardDescription>{t("dashboard.overview.totalValue.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-semibold text-foreground">
                    {formatPrice(metrics.totalValue)}
                  </div>
                  <div className={`mt-2 flex items-center gap-1 ${
                    metrics.dayChangePercent >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {metrics.dayChangePercent >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span>{metrics.dayChangePercent >= 0 ? '+' : ''}{metrics.dayChangePercent.toFixed(2)}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border/60">
                <CardHeader>
                  <CardTitle>{t("dashboard.overview.dayChange.title")}</CardTitle>
                  <CardDescription>{t("dashboard.overview.dayChange.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-semibold text-foreground">
                    {metrics.dayChange >= 0 ? '+' : ''}{formatPrice(Math.abs(metrics.dayChange))}
                  </div>
                  <div className={`mt-2 ${
                    metrics.dayChange >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {t("dashboard.overview.dayChange.change")}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border/60">
                <CardHeader>
                  <CardTitle>{t("dashboard.overview.assets.title")}</CardTitle>
                  <CardDescription>{t("dashboard.overview.assets.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-semibold text-foreground">{portfolio.length}</div>
                  <div className="text-muted-foreground mt-2">{t("dashboard.overview.assets.count")}</div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="bg-card border-border/60">
                <CardHeader>
                  <CardTitle>{t("dashboard.overview.marketOverview.crypto")}</CardTitle>
                  <CardDescription>{t("dashboard.overview.marketOverview.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 sm:space-y-3">
                    {marketData.crypto.slice(0, 5).map((crypto) => {
                      const isPositive = crypto.change24h >= 0;
                      return (
                        <div
                          key={crypto.id}
                          onClick={() => handleViewCrypto(crypto)}
                          className="flex items-center justify-between rounded-md border border-border/60 p-2 sm:p-3 hover:bg-muted/30 cursor-pointer transition-all duration-300 gap-2 min-w-0"
                        >
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 overflow-hidden">
                            {crypto.image && (
                              <img src={crypto.image} alt={crypto.name} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex-shrink-0" />
                            )}
                            <div className="min-w-0 flex-1 overflow-hidden">
                              <div className="font-medium text-foreground text-sm sm:text-base truncate" title={crypto.name}>{crypto.name}</div>
                              <div className="text-muted-foreground text-xs sm:text-sm truncate">{crypto.symbol}</div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-semibold text-sm sm:text-base whitespace-nowrap">{formatPrice(crypto.price)}</div>
                            <div className={`text-xs sm:text-sm whitespace-nowrap ${isPositive ? "text-green-500" : "text-red-500"}`}>
                              {isPositive ? '+' : ''}{crypto.change24h.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border/60">
                <CardHeader>
                  <CardTitle>{t("dashboard.overview.marketOverview.stocks")}</CardTitle>
                  <CardDescription>{t("dashboard.overview.marketOverview.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 sm:space-y-3">
                    {marketData.stocks.slice(0, 5).map((stock) => {
                      const isPositive = stock.change24h >= 0;
                      return (
                        <div
                          key={stock.id}
                          onClick={() => handleViewStock(stock)}
                          className="flex items-center justify-between rounded-md border border-border/60 p-2 sm:p-3 hover:bg-muted/30 cursor-pointer transition-all duration-300 gap-2 min-w-0"
                        >
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 overflow-hidden">
                            {stock.image && (
                              <img src={stock.image} alt={stock.name} className="w-7 h-7 sm:w-8 sm:h-8 rounded flex-shrink-0" />
                            )}
                            <div className="min-w-0 flex-1 overflow-hidden">
                              <div className="font-medium text-foreground text-sm sm:text-base truncate" title={stock.name}>{stock.name}</div>
                              <div className="text-muted-foreground text-xs sm:text-sm truncate">{stock.symbol}</div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-semibold text-sm sm:text-base whitespace-nowrap">{formatPrice(stock.price)}</div>
                            <div className={`text-xs sm:text-sm whitespace-nowrap ${isPositive ? "text-green-500" : "text-red-500"}`}>
                              {isPositive ? '+' : ''}{stock.change24h.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="portfolio" className="mt-6">
            <PortfolioList portfolio={portfolio} onRemoveAsset={handleRemoveAsset} />
          </TabsContent>

          <TabsContent value="search" className="mt-6">
            <PortfolioSearch onAddAsset={handleAddAsset} />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <PortfolioAnalytics portfolio={portfolio} />
          </TabsContent>
        </Tabs>
        )}
      </div>
    </div>
  );
}
