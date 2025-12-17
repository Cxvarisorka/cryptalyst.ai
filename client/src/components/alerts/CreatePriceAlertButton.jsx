import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Bell, Loader2, Mail, Monitor, Plus, X } from "lucide-react";
import priceAlertService from "@/services/priceAlert.service";
import { useOnboardingTracker } from "@/hooks/useOnboardingTracker";

export default function CreatePriceAlertButton({ assetType, assetId, assetName, assetSymbol, currentPrice, assetImage }) {
  const { toast } = useToast();
  const { completeTask } = useOnboardingTracker();
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alertData, setAlertData] = useState({
    alertType: "above",
    targetPrice: "",
    notificationPreferences: {
      email: true,
      inApp: true
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!alertData.targetPrice) {
        toast({
          title: "Error",
          description: "Please enter a target price",
          variant: "destructive"
        });
        setSubmitting(false);
        return;
      }

      await priceAlertService.createAlert({
        assetType,
        assetId,
        assetName,
        assetSymbol,
        alertType: alertData.alertType,
        targetPrice: parseFloat(alertData.targetPrice),
        currentPrice: parseFloat(currentPrice),
        notificationPreferences: alertData.notificationPreferences
      });

      toast({
        title: "Success",
        description: `Price alert created for ${assetSymbol}`
      });

      // Track onboarding task
      completeTask('setPriceAlert');

      // Reset and close
      setAlertData({
        alertType: "above",
        targetPrice: "",
        notificationPreferences: {
          email: true,
          inApp: true
        }
      });
      setShowModal(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create price alert",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    if (numPrice >= 1) {
      return numPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return numPrice.toFixed(6);
  };

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        className="bg-gradient-money hover:opacity-90"
      >
        <Bell className="w-4 h-4 mr-2" />
        Create Price Alert
      </Button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card border-border">
            <CardHeader className="border-b border-border/60">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Create Price Alert</CardTitle>
                  <CardDescription>Get notified when {assetName} reaches your target price</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Asset Info Card */}
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border border-border">
                  {assetImage && (
                    <img
                      src={assetImage}
                      alt={assetSymbol}
                      className="w-14 h-14 rounded-full flex-shrink-0"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  {!assetImage && (
                    <div className="w-14 h-14 rounded-full bg-gradient-money flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {assetSymbol.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground text-lg">{assetSymbol}</div>
                    <p className="text-sm text-muted-foreground truncate">{assetName}</p>
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground">Current Price</p>
                      <p className="text-xl font-bold text-foreground">${formatPrice(currentPrice)}</p>
                    </div>
                  </div>
                </div>

                {/* Alert Type */}
                <div className="space-y-2">
                  <Label htmlFor="alertType">Alert Type *</Label>
                  <select
                    id="alertType"
                    className="w-full h-11 rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    value={alertData.alertType}
                    onChange={(e) => setAlertData({ ...alertData, alertType: e.target.value })}
                  >
                    <option value="above">🔔 Notify me when price rises above target</option>
                    <option value="below">🔔 Notify me when price falls below target</option>
                  </select>
                </div>

                {/* Target Price */}
                <div className="space-y-2">
                  <Label htmlFor="targetPrice">Target Price ($) *</Label>
                  <Input
                    id="targetPrice"
                    type="number"
                    step="0.000001"
                    value={alertData.targetPrice}
                    onChange={(e) => setAlertData({ ...alertData, targetPrice: e.target.value })}
                    placeholder="Enter your target price"
                    required
                    className="text-lg"
                  />
                  {alertData.targetPrice && (
                    <div className="mt-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                      <p className="text-sm text-foreground">
                        <strong>Alert will trigger when:</strong> {assetName} price {alertData.alertType === "above" ? "rises above" : "falls below"} <strong>${formatPrice(alertData.targetPrice)}</strong>
                      </p>
                    </div>
                  )}
                </div>

                {/* Notification Preferences */}
                <div className="space-y-3">
                  <Label>How should we notify you?</Label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={alertData.notificationPreferences.email}
                        onChange={(e) => setAlertData({
                          ...alertData,
                          notificationPreferences: {
                            ...alertData.notificationPreferences,
                            email: e.target.checked
                          }
                        })}
                        className="h-4 w-4 rounded border-input focus:ring-2 focus:ring-primary"
                      />
                      <Mail className="w-5 h-5 text-primary" />
                      <div className="flex-1">
                        <div className="font-medium text-foreground">Email Notification</div>
                        <div className="text-xs text-muted-foreground">Receive alerts via email</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={alertData.notificationPreferences.inApp}
                        onChange={(e) => setAlertData({
                          ...alertData,
                          notificationPreferences: {
                            ...alertData.notificationPreferences,
                            inApp: e.target.checked
                          }
                        })}
                        className="h-4 w-4 rounded border-input focus:ring-2 focus:ring-primary"
                      />
                      <Monitor className="w-5 h-5 text-primary" />
                      <div className="flex-1">
                        <div className="font-medium text-foreground">In-App Notification</div>
                        <div className="text-xs text-muted-foreground">Receive alerts in the platform</div>
                      </div>
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
                        Creating Alert...
                      </>
                    ) : (
                      <>
                        <Bell className="w-4 h-4 mr-2" />
                        Create Alert
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
