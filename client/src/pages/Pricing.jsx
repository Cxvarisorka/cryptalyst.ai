import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { FadeIn } from "@/components/magicui/fade-in";

export default function Pricing() {
  const { t } = useTranslation();

  const plans = [
    {
      key: "pro",
      price: t("pricing.plans.pro.price"),
      cta: t("pricing.cta.getStarted"),
      features: [
        t("pricing.features.aiAnalysis"),
        t("pricing.features.portfolioTracking"),
        t("pricing.features.basicAlerts"),
      ],
    },
    {
      key: "max",
      price: t("pricing.plans.max.price"),
      cta: t("pricing.cta.getStarted"),
      featured: true,
      features: [
        t("pricing.features.advancedAnalytics"),
        t("pricing.features.marketTrends"),
        t("pricing.features.prioritySupport"),
      ],
    },
    {
      key: "enterprise",
      price: t("pricing.plans.enterprise.price"),
      cta: t("pricing.cta.contactSales"),
      features: [
        t("pricing.features.sso"),
        t("pricing.features.sla"),
        t("pricing.features.dedicatedSupport"),
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <div className="container mx-auto px-4 py-14">
        <FadeIn className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-semibold mb-3">{t("pricing.title")}</h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("pricing.subtitle")}
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <FadeIn key={p.key}>
              <Card className={`bg-card border-border/60 ${p.featured ? "ring-1 ring-primary/40" : ""}`}>
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {t(`pricing.plans.${p.key}.name`)}
                  </CardTitle>
                  <CardDescription>{t("pricing.billing.monthly")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-foreground mb-4">{p.price}</div>
                  <ul className="space-y-2 mb-6 text-muted-foreground">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span>•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className={p.featured ? "bg-gradient-money hover:opacity-90 w-full" : "w-full"}>
                    {p.cta}
                  </Button>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}
