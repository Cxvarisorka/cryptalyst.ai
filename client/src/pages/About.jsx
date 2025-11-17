import { FadeIn } from "@/components/magicui/fade-in";
import { GradientText } from "@/components/magicui/gradient-text";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function About() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-14">
        {/* Hero */}
        <FadeIn className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-semibold mb-3">
            <GradientText>{t("about.title")}</GradientText>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("about.subtitle")}
          </p>
        </FadeIn>

        {/* Two-column content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <FadeIn>
            <Card className="bg-card border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-semibold">{t("about.mission.title")}</CardTitle>
                <CardDescription className="text-muted-foreground"></CardDescription>
              </CardHeader>
              <CardContent className="text-muted-foreground leading-relaxed">
                {t("about.mission.content")}
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.1}>
            <Card className="bg-card border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-semibold">{t("about.technology.title")}</CardTitle>
                <CardDescription className="text-muted-foreground"></CardDescription>
              </CardHeader>
              <CardContent className="text-muted-foreground leading-relaxed">
                {t("about.technology.content")}
              </CardContent>
            </Card>
          </FadeIn>
        </div>

        {/* Features - minimalist list */}
        <FadeIn>
          <Card className="bg-card border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold">{t("about.keyFeatures.title")}</CardTitle>
              <CardDescription>{t("about.keyFeatures.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="font-medium text-foreground">{t("about.keyFeatures.aiPowered.title")}</div>
                  <p className="text-sm text-muted-foreground">{t("about.keyFeatures.aiPowered.description")}</p>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-foreground">{t("about.keyFeatures.realTime.title")}</div>
                  <p className="text-sm text-muted-foreground">{t("about.keyFeatures.realTime.description")}</p>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-foreground">{t("about.keyFeatures.portfolioTracking.title")}</div>
                  <p className="text-sm text-muted-foreground">{t("about.keyFeatures.portfolioTracking.description")}</p>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-foreground">{t("about.keyFeatures.sentiment.title")}</div>
                  <p className="text-sm text-muted-foreground">{t("about.keyFeatures.sentiment.description")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* CTA */}
        <FadeIn className="text-center mt-12">
          <Button size="lg" className="bg-gradient-money hover:opacity-90" onClick={() => navigate("/dashboard")}>
            {t("about.startAnalyzing")}
          </Button>
        </FadeIn>
      </div>
    </div>
  );
}
