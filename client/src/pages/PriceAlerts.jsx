import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { FadeIn } from "@/components/magicui/fade-in";
import {
  Bell,
  BellOff,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Loader2,
  Mail,
  Monitor,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  Search
} from "lucide-react";
import priceAlertService from "@/services/priceAlert.service";
import { getCryptoData, getStockData } from "@/services/marketDataService";
import Hero from "@/components/layout/Hero";

export default function PriceAlerts() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({ active: 0, triggered: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [assetSearch, setAssetSearch] = useState("");
  const [activeAssetTab, setActiveAssetTab] = useState("crypto");

  const [newAlert, setNewAlert] = useState({
    assetType: "crypto",
    assetId: "",
    assetName: "",
    assetSymbol: "",
    assetImage: "",
    alertType: "above",
    targetPrice: "",
    currentPrice: "",
    notificationPreferences: {
      email: true,
      inApp: true
    }
  });

  useEffect(() => {
    fetchAlerts();
    fetchStats();
  }, [activeTab]);

  useEffect(() => {
    if (showCreateModal) {
      fetchAvailableAssets();
    }
  }, [showCreateModal, newAlert.assetType]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (activeTab === "active") {
        filters.status = "active";
      } else if (activeTab === "triggered") {
        filters.status = "triggered";
      }

      const response = await priceAlertService.getUserAlerts(filters);
      setAlerts(response.alerts || []);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      toast({
        title: t("priceAlerts.toast.error"),
        description: t("priceAlerts.toast.fetchFailed"),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await priceAlertService.getAlertStats();
      setStats(response);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchAvailableAssets = async () => {
    setLoadingAssets(true);
    try {
      let assets = [];
      if (newAlert.assetType === "crypto") {
        assets = await getCryptoData(100);
      } else if (newAlert.assetType === "stock") {
        assets = await getStockData(100);
      }
      setAvailableAssets(assets || []);
    } catch (error) {
      console.error("Error fetching available assets:", error);
      toast({
        title: t("priceAlerts.toast.error"),
        description: t("priceAlerts.toast.loadAssetsFailed"),
        variant: "destructive"
      });
    } finally {
      setLoadingAssets(false);
    }
  };

  const handleAssetSelection = (asset) => {
    setNewAlert({
      ...newAlert,
      assetId: newAlert.assetType === "crypto" ? asset.id : asset.symbol,
      assetName: asset.name,
      assetSymbol: asset.symbol,
      assetImage: asset.image || "",
      currentPrice: asset.price ? asset.price.toString() : ""
    });
  };

  const filterAssets = (assets) => {
    if (!assetSearch) return assets;
    const search = assetSearch.toLowerCase();
    return assets.filter(
      (asset) =>
        asset.symbol.toLowerCase().includes(search) ||
        asset.name.toLowerCase().includes(search)
    );
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!newAlert.assetId || !newAlert.assetName || !newAlert.assetSymbol) {
        toast({
          title: t("priceAlerts.toast.error"),
          description: t("priceAlerts.toast.selectAsset"),
          variant: "destructive"
        });
        setSubmitting(false);
        return;
      }

      if (!newAlert.targetPrice || !newAlert.currentPrice) {
        toast({
          title: t("priceAlerts.toast.error"),
          description: t("priceAlerts.toast.enterTargetPrice"),
          variant: "destructive"
        });
        setSubmitting(false);
        return;
      }

      await priceAlertService.createAlert({
        ...newAlert,
        targetPrice: parseFloat(newAlert.targetPrice),
        currentPrice: parseFloat(newAlert.currentPrice)
      });

      toast({
        title: t("priceAlerts.toast.success"),
        description: t("priceAlerts.toast.createSuccess")
      });

      setNewAlert({
        assetType: "crypto",
        assetId: "",
        assetName: "",
        assetSymbol: "",
        assetImage: "",
        alertType: "above",
        targetPrice: "",
        currentPrice: "",
        notificationPreferences: {
          email: true,
          inApp: true
        }
      });

      setShowCreateModal(false);
      fetchAlerts();
      fetchStats();
    } catch (error) {
      toast({
        title: t("priceAlerts.toast.error"),
        description: error.response?.data?.message || t("priceAlerts.toast.createFailed"),
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAlert = async (alertId) => {
    try {
      await priceAlertService.deleteAlert(alertId);
      toast({
        title: t("priceAlerts.toast.success"),
        description: t("priceAlerts.toast.deleteSuccess")
      });
      fetchAlerts();
      fetchStats();
    } catch (error) {
      toast({
        title: t("priceAlerts.toast.error"),
        description: t("priceAlerts.toast.deleteFailed"),
        variant: "destructive"
      });
    }
  };

  const handleToggleActive = async (alert) => {
    try {
      await priceAlertService.updateAlert(alert._id, {
        isActive: !alert.isActive
      });
      const status = !alert.isActive ? t("priceAlerts.toast.activated") : t("priceAlerts.toast.deactivated");
      toast({
        title: t("priceAlerts.toast.success"),
        description: t("priceAlerts.toast.updateSuccess", { status })
      });
      fetchAlerts();
      fetchStats();
    } catch (error) {
      toast({
        title: t("priceAlerts.toast.error"),
        description: error.response?.data?.message || t("priceAlerts.toast.updateFailed"),
        variant: "destructive"
      });
    }
  };

  const handleDeleteAllTriggered = async () => {
    try {
      await priceAlertService.deleteTriggeredAlerts();
      toast({
        title: t("priceAlerts.toast.success"),
        description: t("priceAlerts.toast.clearSuccess")
      });
      fetchAlerts();
      fetchStats();
    } catch (error) {
      toast({
        title: t("priceAlerts.toast.error"),
        description: t("priceAlerts.toast.clearFailed"),
        variant: "destructive"
      });
    }
  };

  const formatPrice = (price) => {
    if (price >= 1) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${price.toFixed(6)}`;
  };

  const filteredCrypto = filterAssets(availableAssets);
  const filteredStocks = filterAssets(availableAssets);

  const renderAlert = (alert) => {
    const isTriggered = alert.triggered;
    const isAbove = alert.alertType === "above";
    const Icon = isAbove ? TrendingUp : TrendingDown;
    const iconColor = isAbove ? "text-green-500" : "text-red-500";
    const priceChange = ((alert.currentPrice - alert.targetPrice) / alert.targetPrice * 100);

    return (
      <Card key={alert._id} className="bg-card border-border/60 hover:border-primary/30 transition-all overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-center gap-4 p-4">
            {/* Asset Image and Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                isTriggered ? 'bg-green-500/20' : 'bg-primary/20'
              }`}>
                <Icon className={`w-6 h-6 ${isTriggered ? 'text-green-500' : iconColor}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground text-lg">
                    {alert.assetSymbol}
                  </h3>
                  {isTriggered && (
                    <div className="flex items-center gap-1 bg-green-500/20 text-green-500 px-2 py-0.5 rounded text-xs font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      {t("priceAlerts.status.triggered")}
                    </div>
                  )}
                  {!isTriggered && alert.isActive && (
                    <div className="flex items-center gap-1 bg-blue-500/20 text-blue-500 px-2 py-0.5 rounded text-xs font-semibold">
                      <Clock className="w-3 h-3" />
                      {t("priceAlerts.status.active")}
                    </div>
                  )}
                  {!isTriggered && !alert.isActive && (
                    <div className="flex items-center gap-1 bg-gray-500/20 text-gray-500 px-2 py-0.5 rounded text-xs font-semibold">
                      <BellOff className="w-3 h-3" />
                      {t("priceAlerts.status.paused")}
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">{alert.assetName}</p>
                <p className="text-xs text-muted-foreground mt-1 capitalize">
                  {alert.assetType} • {alert.alertType} {formatPrice(alert.targetPrice)}
                </p>
              </div>
            </div>

            {/* Price Info */}
            <div className="text-right flex-shrink-0">
              <div className="text-sm text-muted-foreground mb-1">{t("priceAlerts.alert.currentPrice")}</div>
              <div className="text-xl font-bold text-foreground">
                {formatPrice(alert.currentPrice)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {t("priceAlerts.alert.target")}: {formatPrice(alert.targetPrice)}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              {!isTriggered && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleActive(alert)}
                  className="w-10 h-10 p-0"
                >
                  {alert.isActive ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteAlert(alert._id)}
                className="w-10 h-10 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Additional Info Footer */}
          <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-t border-border/60">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {alert.notificationPreferences.email && (
                <div className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {t("priceAlerts.alert.email")}
                </div>
              )}
              {alert.notificationPreferences.inApp && (
                <div className="flex items-center gap-1">
                  <Monitor className="w-3 h-3" />
                  {t("priceAlerts.alert.inApp")}
                </div>
              )}
            </div>
            {isTriggered && alert.triggeredAt && (
              <div className="text-xs text-muted-foreground">
                {t("priceAlerts.alert.triggeredAt")} {new Date(alert.triggeredAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const heroIcons = [
    { Icon: Bell, gradient: 'bg-gradient-to-r from-orange-500 to-yellow-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      {/* Hero Section */}
      <Hero
        title={t("priceAlerts.title")}
        subtitle={t("priceAlerts.subtitle")}
        icons={heroIcons}
        showSingleIcon={true}
        align="left"
        size="medium"
      >
        <Button onClick={() => setShowCreateModal(true)} className="bg-gradient-money">
          <Plus className="w-4 h-4 mr-2" />
          {t("priceAlerts.createAlert")}
        </Button>
      </Hero>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-10">
        <FadeIn>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card className="bg-card border-border/60">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("priceAlerts.stats.active")}</p>
                    <p className="text-3xl font-bold text-foreground">{stats.active}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Bell className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/60">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("priceAlerts.stats.triggered")}</p>
                    <p className="text-3xl font-bold text-foreground">{stats.triggered}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/60">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("priceAlerts.stats.total")}</p>
                    <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Create Alert Button */}
          <div className="mb-6">
            <Button
              onClick={() => {
                setShowCreateModal(true);
                setAssetSearch("");
              }}
              className="bg-gradient-money hover:opacity-90"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("priceAlerts.createNewAlert")}
            </Button>
          </div>

          {/* Alerts Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="active">{t("priceAlerts.tabs.active")} ({stats.active})</TabsTrigger>
              <TabsTrigger value="triggered">{t("priceAlerts.tabs.triggered")} ({stats.triggered})</TabsTrigger>
              <TabsTrigger value="all">{t("priceAlerts.tabs.all")} ({stats.total})</TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                </div>
              ) : alerts.length === 0 ? (
                <Card className="bg-card border-border/60">
                  <CardContent className="py-12">
                    <div className="text-center text-muted-foreground">
                      <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">{t("priceAlerts.empty.noActive")}</p>
                      <p className="text-sm">{t("priceAlerts.empty.noActiveDesc")}</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {alerts.map(renderAlert)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="triggered">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                </div>
              ) : alerts.length === 0 ? (
                <Card className="bg-card border-border/60">
                  <CardContent className="py-12">
                    <div className="text-center text-muted-foreground">
                      <CheckCircle2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">{t("priceAlerts.empty.noTriggered")}</p>
                      <p className="text-sm">{t("priceAlerts.empty.noTriggeredDesc")}</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {stats.triggered > 0 && (
                    <div className="mb-4 flex justify-end">
                      <Button
                        variant="outline"
                        onClick={handleDeleteAllTriggered}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {t("priceAlerts.buttons.clearAllTriggered")}
                      </Button>
                    </div>
                  )}
                  <div className="space-y-4">
                    {alerts.map(renderAlert)}
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="all">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                </div>
              ) : alerts.length === 0 ? (
                <Card className="bg-card border-border/60">
                  <CardContent className="py-12">
                    <div className="text-center text-muted-foreground">
                      <AlertTriangle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">{t("priceAlerts.empty.noAlerts")}</p>
                      <p className="text-sm">{t("priceAlerts.empty.noAlertsDesc")}</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {alerts.map(renderAlert)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </FadeIn>
      </div>

      {/* Create Alert Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border">
            <CardHeader className="border-b border-border/60">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t("priceAlerts.modal.title")}</CardTitle>
                  <CardDescription>{t("priceAlerts.modal.description")}</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleCreateAlert} className="space-y-6">
                {/* Asset Selection */}
                <div className="space-y-2">
                  <Label>{t("priceAlerts.modal.selectAsset")} *</Label>

                  {!newAlert.assetId ? (
                    <div className="border border-border rounded-lg p-4">
                      {/* Search Bar */}
                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder={t("priceAlerts.modal.searchAssets")}
                          value={assetSearch}
                          onChange={(e) => setAssetSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>

                      {/* Tabs */}
                      <Tabs value={newAlert.assetType} onValueChange={(value) => setNewAlert({ ...newAlert, assetType: value })}>
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                          <TabsTrigger value="crypto">{t("priceAlerts.modal.cryptocurrency")}</TabsTrigger>
                          <TabsTrigger value="stock">{t("priceAlerts.modal.stocks")}</TabsTrigger>
                        </TabsList>

                        <div className="max-h-[300px] overflow-y-auto">
                          {loadingAssets ? (
                            <div className="text-center py-8">
                              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                            </div>
                          ) : (
                            <TabsContent value={newAlert.assetType} className="mt-0 space-y-2">
                              {(newAlert.assetType === "crypto" ? filteredCrypto : filteredStocks).map((asset) => (
                                <button
                                  key={asset.id || asset.symbol}
                                  type="button"
                                  onClick={() => handleAssetSelection(asset)}
                                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors text-left w-full"
                                >
                                  {asset.image && (
                                    <img
                                      src={asset.image}
                                      alt={asset.symbol}
                                      className="w-10 h-10 rounded-full flex-shrink-0"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-foreground">{asset.symbol}</div>
                                    <p className="text-sm text-muted-foreground truncate">{asset.name}</p>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <p className="text-sm font-medium text-foreground">
                                      ${asset.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: asset.price < 1 ? 6 : 2 }) || 'N/A'}
                                    </p>
                                    <p className={`text-xs ${
                                      asset.change24h >= 0 ? 'text-green-500' : 'text-red-500'
                                    }`}>
                                      {asset.change24h >= 0 ? '+' : ''}{asset.change24h?.toFixed(2)}%
                                    </p>
                                  </div>
                                </button>
                              ))}
                            </TabsContent>
                          )}
                        </div>
                      </Tabs>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-muted rounded-lg border border-border">
                      {newAlert.assetImage && (
                        <img
                          src={newAlert.assetImage}
                          alt={newAlert.assetSymbol}
                          className="w-12 h-12 rounded-full flex-shrink-0"
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-foreground text-lg">{newAlert.assetSymbol}</div>
                        <p className="text-sm text-muted-foreground">{newAlert.assetName}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t("priceAlerts.modal.current")}: ${parseFloat(newAlert.currentPrice).toFixed(newAlert.assetType === "crypto" && parseFloat(newAlert.currentPrice) < 1 ? 6 : 2)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setNewAlert({ ...newAlert, assetId: "", assetName: "", assetSymbol: "", assetImage: "", currentPrice: "" })}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {newAlert.assetId && (
                  <>
                    {/* Alert Type */}
                    <div className="space-y-2">
                      <Label htmlFor="alertType">{t("priceAlerts.modal.alertType")} *</Label>
                      <select
                        id="alertType"
                        className="w-full h-11 rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        value={newAlert.alertType}
                        onChange={(e) => setNewAlert({ ...newAlert, alertType: e.target.value })}
                      >
                        <option value="above">{t("priceAlerts.modal.priceRisesAbove")}</option>
                        <option value="below">{t("priceAlerts.modal.priceFallsBelow")}</option>
                      </select>
                    </div>

                    {/* Target Price */}
                    <div className="space-y-2">
                      <Label htmlFor="targetPrice">{t("priceAlerts.modal.targetPrice")} *</Label>
                      <Input
                        id="targetPrice"
                        type="number"
                        step="0.000001"
                        value={newAlert.targetPrice}
                        onChange={(e) => setNewAlert({ ...newAlert, targetPrice: e.target.value })}
                        placeholder={t("priceAlerts.modal.enterTargetPrice")}
                        required
                      />
                    </div>

                    {/* Notification Preferences */}
                    <div className="space-y-3">
                      <Label>{t("priceAlerts.modal.notificationPreferences")}</Label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newAlert.notificationPreferences.email}
                            onChange={(e) => setNewAlert({
                              ...newAlert,
                              notificationPreferences: {
                                ...newAlert.notificationPreferences,
                                email: e.target.checked
                              }
                            })}
                            className="h-4 w-4 rounded border-input focus:ring-2 focus:ring-primary"
                          />
                          <Mail className="w-4 h-4" />
                          <span className="text-sm">{t("priceAlerts.modal.email")}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newAlert.notificationPreferences.inApp}
                            onChange={(e) => setNewAlert({
                              ...newAlert,
                              notificationPreferences: {
                                ...newAlert.notificationPreferences,
                                inApp: e.target.checked
                              }
                            })}
                            className="h-4 w-4 rounded border-input focus:ring-2 focus:ring-primary"
                          />
                          <Monitor className="w-4 h-4" />
                          <span className="text-sm">{t("priceAlerts.modal.inApp")}</span>
                        </label>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="bg-gradient-money hover:opacity-90 flex-1"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {t("priceAlerts.modal.creating")}
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            {t("priceAlerts.createAlert")}
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCreateModal(false)}
                        disabled={submitting}
                      >
                        {t("priceAlerts.modal.cancel")}
                      </Button>
                    </div>
                  </>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
