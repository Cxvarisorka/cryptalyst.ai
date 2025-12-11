/**
 * AlertCard Component
 *
 * Displays a single price alert with its status, pricing information,
 * and action buttons (toggle active/delete).
 *
 * Features:
 * - Visual indicators for triggered/active/paused states
 * - Price formatting based on asset value
 * - Notification preference badges
 * - Action buttons for management
 */

import {
  Bell,
  BellOff,
  Trash2,
  TrendingUp,
  TrendingDown,
  Mail,
  Monitor,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

/**
 * Formats price with appropriate decimal places
 * @param {number} price - Price to format
 * @returns {string} Formatted price string
 */
const formatPrice = (price) => {
  if (price >= 1) {
    return `$${price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }
  return `$${price.toFixed(6)}`; // More decimals for small prices
};

export const AlertCard = ({ alert, onToggleActive, onDelete }) => {
  const { t } = useTranslation();

  // Alert state and configuration
  const isTriggered = alert.triggered;
  const isAbove = alert.alertType === "above";
  const Icon = isAbove ? TrendingUp : TrendingDown;
  const iconColor = isAbove ? "text-green-500" : "text-red-500";

  return (
    <Card className="bg-card border-border/60 hover:border-primary/30 transition-all overflow-hidden">
      <CardContent className="p-0">
        {/* Main Content Area */}
        <div className="flex items-center gap-4 p-4">

          {/* Asset Icon and Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Trend Icon */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
              isTriggered ? 'bg-green-500/20' : 'bg-primary/20'
            }`}>
              <Icon className={`w-6 h-6 ${isTriggered ? 'text-green-500' : iconColor}`} />
            </div>

            {/* Asset Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground text-lg">
                  {alert.assetSymbol}
                </h3>

                {/* Status Badges */}
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

          {/* Price Information */}
          <div className="text-right flex-shrink-0">
            <div className="text-sm text-muted-foreground mb-1">
              {t("priceAlerts.alert.currentPrice")}
            </div>
            <div className="text-xl font-bold text-foreground">
              {formatPrice(alert.currentPrice)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {t("priceAlerts.alert.target")}: {formatPrice(alert.targetPrice)}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            {!isTriggered && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleActive(alert)}
                className="w-10 h-10 p-0"
                title={alert.isActive ? "Pause alert" : "Activate alert"}
              >
                {alert.isActive ?
                  <BellOff className="w-4 h-4" /> :
                  <Bell className="w-4 h-4" />
                }
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(alert._id)}
              className="w-10 h-10 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
              title="Delete alert"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Footer: Notification Preferences & Trigger Time */}
        <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-t border-border/60">
          {/* Notification Badges */}
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

          {/* Triggered Timestamp */}
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
