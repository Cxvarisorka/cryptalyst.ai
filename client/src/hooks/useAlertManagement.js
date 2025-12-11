/**
 * useAlertManagement Hook
 *
 * Custom hook that manages all alert-related state and operations.
 * Centralizes API calls, state management, and error handling for price alerts.
 *
 * @param {string} activeTab - Current active tab ('active', 'triggered', or 'all')
 * @returns {Object} Alert state and handler functions
 */

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import priceAlertService from "@/services/priceAlert.service";

export const useAlertManagement = (activeTab) => {
  const { toast } = useToast();
  const { t } = useTranslation();

  // State management
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({ active: 0, triggered: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  /**
   * Fetch alerts based on current tab filter
   */
  const fetchAlerts = async () => {
    setLoading(true);
    try {
      // Build filter based on active tab
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

  /**
   * Fetch alert statistics
   */
  const fetchStats = async () => {
    try {
      const response = await priceAlertService.getAlertStats();
      setStats(response);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  /**
   * Delete a single alert
   * @param {string} alertId - ID of the alert to delete
   */
  const handleDeleteAlert = async (alertId) => {
    try {
      await priceAlertService.deleteAlert(alertId);
      toast({
        title: t("priceAlerts.toast.success"),
        description: t("priceAlerts.toast.deleteSuccess")
      });
      // Refresh data
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

  /**
   * Toggle alert active state (pause/activate)
   * @param {Object} alert - Alert object to toggle
   */
  const handleToggleActive = async (alert) => {
    try {
      await priceAlertService.updateAlert(alert._id, {
        isActive: !alert.isActive
      });

      const status = !alert.isActive
        ? t("priceAlerts.toast.activated")
        : t("priceAlerts.toast.deactivated");

      toast({
        title: t("priceAlerts.toast.success"),
        description: t("priceAlerts.toast.updateSuccess", { status })
      });

      // Refresh data
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

  /**
   * Delete all triggered alerts
   */
  const handleDeleteAllTriggered = async () => {
    try {
      await priceAlertService.deleteTriggeredAlerts();
      toast({
        title: t("priceAlerts.toast.success"),
        description: t("priceAlerts.toast.clearSuccess")
      });
      // Refresh data
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

  // Load data when tab changes
  useEffect(() => {
    fetchAlerts();
    fetchStats();
  }, [activeTab]);

  return {
    // State
    alerts,
    stats,
    loading,
    // Handlers
    handleDeleteAlert,
    handleToggleActive,
    handleDeleteAllTriggered,
    // Refresh functions
    refreshAlerts: fetchAlerts,
    refreshStats: fetchStats
  };
};
