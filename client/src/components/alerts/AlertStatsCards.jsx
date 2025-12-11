/**
 * AlertStatsCards Component
 *
 * Displays statistics for price alerts in a grid layout.
 * Shows: Active alerts, Triggered alerts, and Total alerts count.
 */

import { Bell, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

/**
 * Individual stat card configuration
 */
const STAT_CONFIGS = [
  {
    key: 'active',
    icon: Bell,
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-500/20',
    translationKey: 'priceAlerts.stats.active'
  },
  {
    key: 'triggered',
    icon: CheckCircle2,
    iconColor: 'text-green-500',
    bgColor: 'bg-green-500/20',
    translationKey: 'priceAlerts.stats.triggered'
  },
  {
    key: 'total',
    icon: AlertTriangle,
    iconColor: 'text-primary',
    bgColor: 'bg-primary/20',
    translationKey: 'priceAlerts.stats.total'
  }
];

export const AlertStatsCards = ({ stats }) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {STAT_CONFIGS.map(({ key, icon: Icon, iconColor, bgColor, translationKey }) => (
        <Card key={key} className="bg-card border-border/60">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              {/* Stat Label and Value */}
              <div>
                <p className="text-sm text-muted-foreground">
                  {t(translationKey)}
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {stats[key]}
                </p>
              </div>

              {/* Icon Badge */}
              <div className={`w-12 h-12 rounded-full ${bgColor} flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
