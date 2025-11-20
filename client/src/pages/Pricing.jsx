import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { FadeIn } from "@/components/magicui/fade-in";
import { GradientText } from "@/components/magicui/gradient-text";
import { Check, DollarSign, Sparkles } from "lucide-react";
import Hero from "@/components/layout/Hero";

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

  const faqs = [
    { q: t("pricing.faq.q1"), a: t("pricing.faq.a1") },
    { q: t("pricing.faq.q2"), a: t("pricing.faq.a2") },
    { q: t("pricing.faq.q3"), a: t("pricing.faq.a3") },
    { q: t("pricing.faq.q4"), a: t("pricing.faq.a4") },
  ];

  const heroIcons = [
    { Icon: DollarSign, gradient: 'bg-gradient-money' },
    { Icon: Sparkles, gradient: 'bg-gradient-to-r from-purple-500 to-pink-500' }
  ];

  return (
    <div className="bg-gradient-to-br from-background via-muted to-background">
      {/* Hero Section */}
      <Hero
        title={t("pricing.title")}
        subtitle={t("pricing.subtitle")}
        icons={heroIcons}
        showSingleIcon={false}
      />

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-20">
          {plans.map((p, index) => (
            <FadeIn key={p.key} delay={0.1 * (index + 1)}>
              <Card className={`bg-card border-border/60 h-full flex flex-col transition-all duration-500 ${p.featured ? "ring-2 ring-primary shadow-lg" : ""}`}>
                {p.featured && (
                  <div className="bg-gradient-money text-white text-center py-2 text-sm font-semibold rounded-t-lg">
                    {t("pricing.popular")}
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {t(`pricing.plans.${p.key}.name`)}
                  </CardTitle>
                  <CardDescription>{t("pricing.billing.monthly")}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="text-4xl font-bold text-foreground mb-6">{p.price}</div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-muted-foreground">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
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

        {/* FAQ Section */}
        <FadeIn delay={0.4} className="my-20 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">
            <GradientText>{t("pricing.faq.title")}</GradientText>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="bg-card border-border/60 p-6 transition-all duration-500">
                <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                <p className="text-muted-foreground text-sm">{faq.a}</p>
              </Card>
            ))}
          </div>
        </FadeIn>

        {/* CTA */}
        <FadeIn delay={0.5} className="text-center my-20 mb-32">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 transition-all duration-500">
            <CardContent className="p-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">{t("pricing.cta.title")}</h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">{t("pricing.cta.subtitle")}</p>
              <Button size="lg" className="bg-gradient-money hover:opacity-90">
                {t("pricing.cta.getStarted")}
              </Button>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
