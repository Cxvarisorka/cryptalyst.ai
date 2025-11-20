import { FadeIn } from "@/components/magicui/fade-in";
import { GradientText } from "@/components/magicui/gradient-text";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Users, TrendingUp, Shield, Zap } from "lucide-react";
import Hero from "@/components/layout/Hero";

export default function About() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const stats = [
    { icon: Users, value: "50K+", label: t("about.stats.users") },
    { icon: TrendingUp, value: "$2B+", label: t("about.stats.volume") },
    { icon: Shield, value: "99.9%", label: t("about.stats.uptime") },
    { icon: Zap, value: "<1s", label: t("about.stats.latency") },
  ];

  const heroIcons = [
    { Icon: Users, gradient: 'bg-gradient-money' },
    { Icon: Shield, gradient: 'bg-gradient-to-r from-blue-500 to-purple-500' },
    { Icon: TrendingUp, gradient: 'bg-gradient-to-r from-green-500 to-emerald-500' }
  ];

  return (
    <div className="bg-gradient-to-br from-background via-muted to-background">
      {/* Hero Section */}
      <Hero
        title={t("about.title")}
        subtitle={t("about.subtitle")}
        icons={heroIcons}
        showSingleIcon={false}
      />

      <div className="container mx-auto px-4 max-w-6xl">
        {/* Stats */}
        <FadeIn className="my-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="bg-card border-border/60 text-center p-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-money flex items-center justify-center mx-auto mb-3">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </Card>
              );
            })}
          </div>
        </FadeIn>

        {/* Mission & Technology */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-20">
          <FadeIn>
            <Card className="bg-card border-border/60 h-full">
              <CardHeader>
                <CardTitle className="text-xl">
                  <GradientText>{t("about.mission.title")}</GradientText>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground leading-relaxed">
                {t("about.mission.content")}
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.1}>
            <Card className="bg-card border-border/60 h-full">
              <CardHeader>
                <CardTitle className="text-xl">
                  <GradientText>{t("about.technology.title")}</GradientText>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground leading-relaxed">
                {t("about.technology.content")}
              </CardContent>
            </Card>
          </FadeIn>
        </div>

        {/* Key Features */}
        <FadeIn delay={0.2} className="my-20">
          <h2 className="text-3xl font-bold text-center mb-8">
            <GradientText>{t("about.keyFeatures.title")}</GradientText>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card border-border/60 p-6">
              <h3 className="font-semibold text-lg text-foreground mb-2">
                {t("about.keyFeatures.aiPowered.title")}
              </h3>
              <p className="text-muted-foreground">
                {t("about.keyFeatures.aiPowered.description")}
              </p>
            </Card>

            <Card className="bg-card border-border/60 p-6">
              <h3 className="font-semibold text-lg text-foreground mb-2">
                {t("about.keyFeatures.realTime.title")}
              </h3>
              <p className="text-muted-foreground">
                {t("about.keyFeatures.realTime.description")}
              </p>
            </Card>

            <Card className="bg-card border-border/60 p-6">
              <h3 className="font-semibold text-lg text-foreground mb-2">
                {t("about.keyFeatures.portfolioTracking.title")}
              </h3>
              <p className="text-muted-foreground">
                {t("about.keyFeatures.portfolioTracking.description")}
              </p>
            </Card>

            <Card className="bg-card border-border/60 p-6">
              <h3 className="font-semibold text-lg text-foreground mb-2">
                {t("about.keyFeatures.sentiment.title")}
              </h3>
              <p className="text-muted-foreground">
                {t("about.keyFeatures.sentiment.description")}
              </p>
            </Card>
          </div>
        </FadeIn>

        {/* Values */}
        <FadeIn delay={0.3} className="my-20">
          <h2 className="text-3xl font-bold text-center mb-8">
            <GradientText>{t("about.values.title")}</GradientText>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card border-border/60 p-6">
              <div className="w-12 h-12 rounded-full bg-gradient-money flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground text-center">
                {t("about.values.transparency.title")}
              </h3>
              <p className="text-muted-foreground text-center">
                {t("about.values.transparency.description")}
              </p>
            </Card>

            <Card className="bg-card border-border/60 p-6">
              <div className="w-12 h-12 rounded-full bg-gradient-money flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground text-center">
                {t("about.values.innovation.title")}
              </h3>
              <p className="text-muted-foreground text-center">
                {t("about.values.innovation.description")}
              </p>
            </Card>

            <Card className="bg-card border-border/60 p-6">
              <div className="w-12 h-12 rounded-full bg-gradient-money flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground text-center">
                {t("about.values.community.title")}
              </h3>
              <p className="text-muted-foreground text-center">
                {t("about.values.community.description")}
              </p>
            </Card>
          </div>
        </FadeIn>

        {/* CTA */}
        <FadeIn delay={0.4} className="text-center my-20 mb-32">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-10 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">{t("about.cta.title")}</h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">{t("about.cta.subtitle")}</p>
              <Button size="lg" className="bg-gradient-money hover:opacity-90" onClick={() => navigate("/dashboard")}>
                {t("about.startAnalyzing")}
              </Button>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
