import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { getCryptoData, getStockData, searchCrypto, searchStocks } from "@/services/marketDataService";

export default function PortfolioSearch({ onAddAsset }) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("crypto");
  const [cryptoData, setCryptoData] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(null);

  useEffect(() => {
    fetchMarketData();
  }, []);

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        handleSearch(searchQuery);
      } else if (searchQuery.trim().length === 0) {
        fetchMarketData();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, activeTab]);

  // Re-search when switching tabs if there's an active search
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      handleSearch(searchQuery);
    }
  }, [activeTab]);

  const fetchMarketData = async () => {
    setLoading(true);
    setSearching(false);
    try {
      const [crypto, stocks] = await Promise.all([
        getCryptoData(250),
        getStockData(100)
      ]);
      setCryptoData(crypto);
      setStockData(stocks);
    } catch (error) {
      console.error("Error fetching market data:", error);
    }
    setLoading(false);
  };

  const handleSearch = async (query) => {
    setSearching(true);
    try {
      if (activeTab === "crypto") {
        const results = await searchCrypto(query);
        setCryptoData(results);
      } else {
        const results = await searchStocks(query);
        setStockData(results);
      }
    } catch (error) {
      console.error("Error searching:", error);
    }
    setSearching(false);
  };

  const handleAddAsset = async (asset) => {
    setAdding(asset.id);
    try {
      await onAddAsset(asset);
    } finally {
      setAdding(null);
    }
  };

  // When searching, use API results directly
  // When not searching, filter cached data
  const filteredCrypto = searchQuery.trim().length >= 2 && searching === false
    ? cryptoData
    : cryptoData.filter(
        (coin) =>
          coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const filteredStocks = searchQuery.trim().length >= 2 && searching === false
    ? stockData
    : stockData.filter(
        (stock) =>
          stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const formatPrice = (price) => {
    if (price >= 1) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${price.toFixed(6)}`;
  };

  const AssetItem = ({ asset, type }) => {
    const isPositive = asset.change24h >= 0;
    const isAdding = adding === asset.id;

    return (
      <div className="flex items-center justify-between p-4 border border-border/40 rounded-lg hover:bg-muted/30 transition-all duration-300">
        <div className="flex items-center gap-3 flex-1">
          {asset.image && (
            <img
              src={asset.image}
              alt={asset.name}
              className={`w-10 h-10 ${type === 'crypto' ? 'rounded-full' : 'rounded'}`}
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-foreground">{asset.symbol}</div>
            <div className="text-sm text-muted-foreground truncate">{asset.name}</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="font-semibold text-foreground">{formatPrice(asset.price)}</div>
            <div className={`flex items-center gap-1 text-sm justify-end ${
              isPositive ? 'text-green-500' : 'text-red-500'
            }`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{Math.abs(asset.change24h).toFixed(2)}%</span>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => handleAddAsset({ ...asset, type })}
            disabled={isAdding}
            className="gap-2"
          >
            {isAdding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {t("dashboard.portfolio.add")}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-card border-border/60">
      <CardHeader>
        <CardTitle>{t("dashboard.portfolio.search.title")}</CardTitle>
        <CardDescription>{t("dashboard.portfolio.search.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={t("dashboard.portfolio.search.placeholder") || "Search any stock or crypto worldwide..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searchQuery.trim().length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                {searching ? "Searching globally..." : searchQuery.trim().length >= 2 ? "Showing global search results" : "Type at least 2 characters to search"}
              </p>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="crypto">{t("dashboard.portfolio.search.crypto")}</TabsTrigger>
              <TabsTrigger value="stocks">{t("dashboard.portfolio.search.stocks")}</TabsTrigger>
            </TabsList>

            <TabsContent value="crypto" className="mt-4">
              {loading || searching ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground mt-2">
                    {searching ? t("dashboard.portfolio.search.searching") || "Searching..." : "Loading..."}
                  </p>
                </div>
              ) : filteredCrypto.length > 0 ? (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {filteredCrypto.map((coin) => (
                    <AssetItem key={coin.id} asset={coin} type="crypto" />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {t("dashboard.portfolio.search.noResults")}
                </div>
              )}
            </TabsContent>

            <TabsContent value="stocks" className="mt-4">
              {loading || searching ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground mt-2">
                    {searching ? t("dashboard.portfolio.search.searching") || "Searching..." : "Loading..."}
                  </p>
                </div>
              ) : filteredStocks.length > 0 ? (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {filteredStocks.map((stock) => (
                    <AssetItem key={stock.id} asset={stock} type="stock" />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {t("dashboard.portfolio.search.noResults")}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
