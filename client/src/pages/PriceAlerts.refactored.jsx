/**
 * PriceAlerts Page - REFACTORED VERSION
 *
 * Manages user price alerts for cryptocurrency and stock tracking.
 * Allows users to create, view, pause, and delete price alerts.
 *
 * Page Structure:
 * - Hero section with page title and create button
 * - Stats cards showing alert counts (active/triggered/total)
 * - Tabbed interface for viewing different alert categories
 * - Create alert modal for adding new alerts
 *
 * Key Features:
 * - Real-time alert status updates
 * - Email and in-app notification preferences
 * - Asset selection with search functionality
 * - Automatic price fetching from market data
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, Loader2, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FadeIn } from "@/components/magicui/fade-in";
import Hero from "@/components/layout/Hero";

// Custom components
import { AlertCard } from "@/components/alerts/AlertCard";
import { AlertStatsCards } from "@/components/alerts/AlertStatsCards";
import { AlertEmptyState } from "@/components/alerts/AlertEmptyState";

// Custom hook
import { useAlertManagement } from "@/hooks/useAlertManagement";

export default function PriceAlerts() {
  const { t } = useTranslation();

  // State management
  const [activeTab, setActiveTab] = useState("active");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Alert management hook
  const {
    alerts,
    stats,
    loading,
    handleDeleteAlert,
    handleToggleActive,
    handleDeleteAllTriggered,
    refreshAlerts,
    refreshStats
  } = useAlertManagement(activeTab);

  // Hero icon configuration
  const heroIcons = [
    { Icon: Bell, gradient: 'bg-gradient-to-r from-orange-500 to-yellow-500' }
  ];

  /**
   * Handle successful alert creation
   * Closes modal and refreshes data
   */
  const handleAlertCreated = () => {
    setShowCreateModal(false);
    refreshAlerts();
    refreshStats();
  };

  /**
   * Render alert list for current tab
   */
  const renderAlertList = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      );
    }

    if (alerts.length === 0) {
      return <AlertEmptyState type={activeTab} />;
    }

    return (
      <div className="space-y-4">
        {alerts.map((alert) => (
          <AlertCard
            key={alert._id}
            alert={alert}
            onToggleActive={handleToggleActive}
            onDelete={handleDeleteAlert}
          />
        ))}
      </div>
    );
  };

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
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-money"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t("priceAlerts.createAlert")}
        </Button>
      </Hero>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-10">
        <FadeIn>
          {/* Statistics Cards */}
          <AlertStatsCards stats={stats} />

          {/* Create Button */}
          <div className="mb-6">
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-money hover:opacity-90"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("priceAlerts.createNewAlert")}
            </Button>
          </div>

          {/* Alerts Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="active">
                {t("priceAlerts.tabs.active")} ({stats.active})
              </TabsTrigger>
              <TabsTrigger value="triggered">
                {t("priceAlerts.tabs.triggered")} ({stats.triggered})
              </TabsTrigger>
              <TabsTrigger value="all">
                {t("priceAlerts.tabs.all")} ({stats.total})
              </TabsTrigger>
            </TabsList>

            {/* Active Alerts Tab */}
            <TabsContent value="active">
              {renderAlertList()}
            </TabsContent>

            {/* Triggered Alerts Tab */}
            <TabsContent value="triggered">
              {!loading && alerts.length > 0 && stats.triggered > 0 && (
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
              {renderAlertList()}
            </TabsContent>

            {/* All Alerts Tab */}
            <TabsContent value="all">
              {renderAlertList()}
            </TabsContent>
          </Tabs>
        </FadeIn>
      </div>

      {/* TODO: Create Alert Modal Component */}
      {/* Will be extracted to CreateAlertModal component */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <p className="text-white">CreateAlertModal goes here</p>
          <Button onClick={() => setShowCreateModal(false)}>Close</Button>
        </div>
      )}
    </div>
  );
}
