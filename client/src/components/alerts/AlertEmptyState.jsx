/**
 * AlertEmptyState Component
 *
 * Displays empty state message when no alerts exist for the current filter.
 * Shows different messages for active, triggered, and all alerts tabs.
 */

import { Bell, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

/**
 * Empty state configuration for each tab
 */
const EMPTY_STATE_CONFIG = {
  active: {
    icon: Bell,
    titleKey: 'priceAlerts.empty.noActive',
    descKey: 'priceAlerts.empty.noActiveDesc'
  },
  triggered: {
    icon: CheckCircle2,
    titleKey: 'priceAlerts.empty.noTriggered',
    descKey: 'priceAlerts.empty.noTriggeredDesc'
  },
  all: {
    icon: AlertTriangle,
    titleKey: 'priceAlerts.empty.noAlerts',
    descKey: 'priceAlerts.empty.noAlertsDesc'
  }
};

export const AlertEmptyState = ({ type = 'all' }) => {
  const { t } = useTranslation();
  const config = EMPTY_STATE_CONFIG[type] || EMPTY_STATE_CONFIG.all;
  const Icon = config.icon;

  return (
    <Card className="bg-card border-border/60">
      <CardContent className="py-12">
        <div className="text-center text-muted-foreground">
          <Icon className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">{t(config.titleKey)}</p>
          <p className="text-sm">{t(config.descKey)}</p>
        </div>
      </CardContent>
    </Card>
  );
};
