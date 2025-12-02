import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Bell,
  BellOff,
  Trash2,
  TrendingUp,
  TrendingDown,
  Loader2,
  Mail,
  Monitor,
  CheckCircle2,
  Clock,
  AlertTriangle
} from "lucide-react";
import priceAlertService from "@/services/priceAlert.service";

export default function AssetPriceAlerts({ assetType, assetId, assetSymbol, currentPrice }) {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssetAlerts();
  }, [assetId, assetType]);

  const fetchAssetAlerts = async () => {
    setLoading(true);
    try {
      const response = await priceAlertService.getUserAlerts({
        assetType,
        assetId
      });
      setAlerts(response.alerts || []);
    } catch (error) {
      console.error("Error fetching asset alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlert = async (alertId) => {
    try {
      await priceAlertService.deleteAlert(alertId);
      toast({
        title: "Success",
        description: "Alert deleted successfully"
      });
      fetchAssetAlerts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete alert",
        variant: "destructive"
      });
    }
  };

  const handleToggleActive = async (alert) => {
    try {
      await priceAlertService.updateAlert(alert._id, {
        isActive: !alert.isActive
      });
      toast({
        title: "Success",
        description: `Alert ${!alert.isActive ? 'activated' : 'deactivated'} successfully`
      });
      fetchAssetAlerts();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update alert",
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

  if (loading) {
    return (
      <Card className="bg-card border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="w-5 h-5 text-primary" />
            Your Price Alerts for {assetSymbol}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return null; // Don't show the component if there are no alerts
  }

  return (
    <Card className="bg-card border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="w-5 h-5 text-primary" />
          Your Price Alerts for {assetSymbol}
        </CardTitle>
        <CardDescription>
          {alerts.length} {alerts.length === 1 ? 'alert' : 'alerts'} set for this asset
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => {
            const isTriggered = alert.triggered;
            const isAbove = alert.alertType === "above";
            const Icon = isAbove ? TrendingUp : TrendingDown;
            const iconColor = isAbove ? "text-green-500" : "text-red-500";
            const priceDistance = ((currentPrice - alert.targetPrice) / alert.targetPrice * 100).toFixed(2);
            const distanceText = isAbove
              ? priceDistance < 0
                ? `${Math.abs(priceDistance)}% below target`
                : `Target reached!`
              : priceDistance > 0
                ? `${priceDistance}% above target`
                : `Target reached!`;

            return (
              <div
                key={alert._id}
                className={`p-4 border rounded-lg transition-all ${
                  isTriggered
                    ? 'border-green-500/50 bg-green-50 dark:bg-green-950/20'
                    : alert.isActive
                      ? 'border-border bg-background hover:border-primary/30'
                      : 'border-border bg-muted/30'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Alert Info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isTriggered ? 'bg-green-500/20' : 'bg-primary/20'
                    }`}>
                      <Icon className={`w-5 h-5 ${isTriggered ? 'text-green-500' : iconColor}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-foreground">
                          {isAbove ? 'Above' : 'Below'} {formatPrice(alert.targetPrice)}
                        </span>
                        {isTriggered && (
                          <div className="flex items-center gap-1 bg-green-500/20 text-green-500 px-2 py-0.5 rounded text-xs font-semibold">
                            <CheckCircle2 className="w-3 h-3" />
                            Triggered
                          </div>
                        )}
                        {!isTriggered && alert.isActive && (
                          <div className="flex items-center gap-1 bg-blue-500/20 text-blue-500 px-2 py-0.5 rounded text-xs font-semibold">
                            <Clock className="w-3 h-3" />
                            Active
                          </div>
                        )}
                        {!isTriggered && !alert.isActive && (
                          <div className="flex items-center gap-1 bg-gray-500/20 text-gray-500 px-2 py-0.5 rounded text-xs font-semibold">
                            <BellOff className="w-3 h-3" />
                            Paused
                          </div>
                        )}
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {!isTriggered && `Current: ${formatPrice(currentPrice)} • ${distanceText}`}
                        {isTriggered && alert.triggeredAt && `Triggered ${new Date(alert.triggeredAt).toLocaleDateString()}`}
                      </div>

                      {/* Notification preferences */}
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {alert.notificationPreferences.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            Email
                          </div>
                        )}
                        {alert.notificationPreferences.inApp && (
                          <div className="flex items-center gap-1">
                            <Monitor className="w-3 h-3" />
                            In-App
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    {!isTriggered && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(alert)}
                        className="w-9 h-9 p-0"
                        title={alert.isActive ? "Pause alert" : "Activate alert"}
                      >
                        {alert.isActive ? (
                          <BellOff className="w-4 h-4" />
                        ) : (
                          <Bell className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAlert(alert._id)}
                      className="w-9 h-9 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      title="Delete alert"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info message for triggered alerts */}
        {alerts.some(a => a.triggered) && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Triggered alerts have already sent notifications and won't trigger again. You can delete them or create new alerts.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
