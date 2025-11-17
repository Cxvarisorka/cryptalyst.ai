import { useTranslation } from "react-i18next";
import { FadeIn } from "@/components/magicui/fade-in";
import { GradientText } from "@/components/magicui/gradient-text";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Brain, Wallet } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const features = [
    {
      icon: Brain,
      title: t('home.features.aiAnalysis.title'),
      description: t('home.features.aiAnalysis.description'),
      content: t('home.features.aiAnalysis.content'),
    },
    {
      icon: TrendingUp,
      title: t('home.features.marketTrends.title'),
      description: t('home.features.marketTrends.description'),
      content: t('home.features.marketTrends.content'),
    },
    {
      icon: Wallet,
      title: t('home.features.portfolio.title'),
      description: t('home.features.portfolio.description'),
      content: t('home.features.portfolio.content'),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <FadeIn className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <GradientText>{t('home.title')}</GradientText>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            {t('home.subtitle')}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <ShimmerButton
              onClick={() => navigate("/dashboard")}
              className="bg-gradient-money text-white"
            >
              {t('home.getStarted')}
            </ShimmerButton>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => navigate("/about")}
              className="border-primary/30 hover:border-primary hover:bg-primary/5"
            >
              {t('home.learnMore')}
            </Button>
          </div>
        </FadeIn>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <FadeIn key={index} delay={0.1 * (index + 1)}>
                <Card className="bg-card/50 border-primary/20 hover:border-primary/40 hover:bg-card-hover transition-all duration-300 h-full">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-gradient-money flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-foreground">{feature.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.content}
                    </p>
                  </CardContent>
                </Card>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </div>
  );
}
