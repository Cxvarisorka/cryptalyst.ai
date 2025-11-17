import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FadeIn } from "@/components/magicui/fade-in";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { t } = useTranslation();

  const cryptoData = [
    { name: "Bitcoin", symbol: "BTC", price: "$43,250", change: "+5.2%", isPositive: true },
    { name: "Ethereum", symbol: "ETH", price: "$2,280", change: "+3.8%", isPositive: true },
    { name: "Cardano", symbol: "ADA", price: "$0.58", change: "-1.2%", isPositive: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <div className="container mx-auto px-4 py-10">
        <FadeIn className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground">{t("dashboard.title")}</h1>
          <p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
        </FadeIn>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-muted/60">
            <TabsTrigger value="overview">{t("dashboard.tabs.overview")}</TabsTrigger>
            <TabsTrigger value="portfolio">{t("dashboard.tabs.portfolio")}</TabsTrigger>
            <TabsTrigger value="analytics">{t("dashboard.tabs.analytics")}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-card border-border/60">
                <CardHeader>
                  <CardTitle>{t("dashboard.overview.totalValue.title")}</CardTitle>
                  <CardDescription>{t("dashboard.overview.totalValue.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold text-foreground">$125,430</div>
                  <div className="text-success mt-2">{t("dashboard.overview.totalValue.change")}</div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border/60">
                <CardHeader>
                  <CardTitle>{t("dashboard.overview.dayChange.title")}</CardTitle>
                  <CardDescription>{t("dashboard.overview.dayChange.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold text-foreground">+$4,230</div>
                  <div className="text-success mt-2">{t("dashboard.overview.dayChange.change")}</div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border/60">
                <CardHeader>
                  <CardTitle>{t("dashboard.overview.assets.title")}</CardTitle>
                  <CardDescription>{t("dashboard.overview.assets.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold text-foreground">8</div>
                  <div className="text-muted-foreground mt-2">{t("dashboard.overview.assets.count")}</div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <Card className="bg-card border-border/60">
                <CardHeader>
                  <CardTitle>{t("dashboard.overview.marketOverview.title")}</CardTitle>
                  <CardDescription>{t("dashboard.overview.marketOverview.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {cryptoData.map((c) => (
                      <div key={c.symbol} className="flex items-center justify-between rounded-md border border-border/60 p-3">
                        <div>
                          <div className="font-medium text-foreground">{c.name}</div>
                          <div className="text-muted-foreground text-sm">{c.symbol}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{c.price}</div>
                          <div className={c.isPositive ? "text-success" : "text-danger"}>{c.change}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="portfolio" className="mt-6">
            <Card className="bg-card border-border/60">
              <CardHeader>
                <CardTitle>{t("dashboard.portfolio.title")}</CardTitle>
                <CardDescription>{t("dashboard.portfolio.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t("dashboard.portfolio.comingSoon")}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card className="bg-card border-border/60">
              <CardHeader>
                <CardTitle>{t("dashboard.analytics.title")}</CardTitle>
                <CardDescription>{t("dashboard.analytics.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t("dashboard.analytics.comingSoon")}</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
