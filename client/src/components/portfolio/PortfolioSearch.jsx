import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { getCryptoData, getStockData, searchCrypto, searchStocks } from "@/services/marketDataService";

const MAX_QUANTITY = 9999;

export default function PortfolioSearch({ onAddAsset }) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("crypto");
  const [cryptoData, setCryptoData] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(null);
  const [imgErrors, setImgErrors] = useState({});
  const [quantities, setQuantities] = useState({});

  const handleImgError = (assetId) => {
    setImgErrors(prev => ({ ...prev, [assetId]: true }));
  };

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

  const getQuantity = (assetId) => {
    return quantities[assetId] ?? '';
  };

  const handleQuantityChange = (assetId, value) => {
    // Allow empty string for clearing input
    if (value === '') {
      setQuantities(prev => ({ ...prev, [assetId]: '' }));
      return;
    }
    // Remove leading zeros and parse
    const cleanValue = value.replace(/^0+/, '') || '0';
    const numValue = parseInt(cleanValue, 10);
    if (!isNaN(numValue)) {
      const clampedValue = Math.min(Math.max(0, numValue), MAX_QUANTITY);
      setQuantities(prev => ({ ...prev, [assetId]: clampedValue || '' }));
    }
  };

  const getQuantityForSubmit = (assetId) => {
    const qty = quantities[assetId];
    return (qty === '' || qty === 0) ? 1 : qty;
  };

  const handleAddAsset = async (asset) => {
    setAdding(asset.id);
    try {
      const quantity = getQuantityForSubmit(asset.id);
      await onAddAsset({ ...asset, quantity });
      // Reset quantity after adding
      setQuantities(prev => ({ ...prev, [asset.id]: '' }));
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
    const hasImgError = imgErrors[asset.id];
    const quantity = getQuantity(asset.id);

    return (
      <div className="flex items-center justify-between p-3 sm:p-4 border border-border/40 rounded-lg hover:bg-muted/30 transition-all duration-300 gap-2 sm:gap-3 min-w-0">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 overflow-hidden">
          {asset.image && !hasImgError ? (
            <img
              src={asset.image}
              alt={asset.name}
              className={`w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 ${type === 'crypto' ? 'rounded-full' : 'rounded'}`}
              onError={() => handleImgError(asset.id)}
            />
          ) : (
            <div className={`w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center ${type === 'crypto' ? 'rounded-full' : 'rounded'}`}>
              <span className="text-xs font-bold text-primary">{asset.symbol?.charAt(0)}</span>
            </div>
          )}
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="font-semibold text-foreground text-sm sm:text-base truncate">{asset.symbol}</div>
            <div className="text-xs sm:text-sm text-muted-foreground truncate">{asset.name}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <div className="font-semibold text-foreground whitespace-nowrap">{formatPrice(asset.price)}</div>
            <div className={`flex items-center gap-1 text-sm justify-end whitespace-nowrap ${
              isPositive ? 'text-green-500' : 'text-red-500'
            }`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{Math.abs(asset.change24h).toFixed(2)}%</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Input
              type="number"
              min="1"
              max={MAX_QUANTITY}
              value={quantity}
              onChange={(e) => handleQuantityChange(asset.id, e.target.value)}
              onBlur={() => {
                // Reset to empty (defaults to 1) if invalid
                if (quantity === '' || quantity === 0) {
                  setQuantities(prev => ({ ...prev, [asset.id]: '' }));
                }
              }}
              className="w-14 sm:w-16 h-8 text-center text-xs sm:text-sm px-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="1"
            />
            <Button
              size="sm"
              onClick={() => handleAddAsset({ ...asset, type })}
              disabled={isAdding}
              className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
            >
              {isAdding ? (
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
              ) : (
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
              <span className="hidden sm:inline">{t("dashboard.portfolio.add")}</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
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
