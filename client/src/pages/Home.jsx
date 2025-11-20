import { useTranslation } from "react-i18next";
import { FadeIn } from "@/components/magicui/fade-in";
import { GradientText } from "@/components/magicui/gradient-text";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Brain, Wallet, Shield, Zap, BarChart3, CheckCircle2 } from "lucide-react";
import MarketOverview from "@/components/market/MarketOverview";
import Hero from "@/components/layout/Hero";

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

  const benefits = [
    { icon: Shield, text: t('home.benefits.security') },
    { icon: Zap, text: t('home.benefits.realtime') },
    { icon: BarChart3, text: t('home.benefits.insights') },
  ];

  const heroIcons = [
    { Icon: TrendingUp, gradient: 'bg-gradient-money' }
  ];

  return (
    <div className="bg-gradient-to-br from-background via-muted to-background">
      {/* Hero Section */}
      <Hero
        title={t('home.title')}
        subtitle={t('home.subtitle')}
        icons={heroIcons}
        showSingleIcon={true}
      >
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
      </Hero>

      <div className="container mx-auto px-4">

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-20">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <FadeIn key={index} delay={0.1 * (index + 1)}>
                <Card className="bg-card border-border/60 hover:border-border hover:bg-card-hover transition-all duration-300 h-full">
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

        {/* Market Overview - Crypto & Stocks */}
        <MarketOverview />

        {/* Why Choose Us Section */}
        <FadeIn delay={0.3} className="my-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <GradientText>{t('home.whyChoose.title')}</GradientText>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('home.whyChoose.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="bg-card border-border/60 text-center p-6 transition-all duration-500">
                  <div className="w-16 h-16 rounded-full bg-gradient-money flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-foreground font-semibold text-lg">{benefit.text}</p>
                </Card>
              );
            })}
          </div>
        </FadeIn>

        {/* CTA Section */}
        <FadeIn delay={0.4} className="my-20 mb-32">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 transition-all duration-500">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t('home.cta.title')}
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                {t('home.cta.subtitle')}
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <ShimmerButton
                  onClick={() => navigate("/signup")}
                  className="bg-gradient-money text-white"
                >
                  {t('home.cta.button')}
                </ShimmerButton>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/pricing")}
                  className="border-primary/30 hover:border-primary"
                >
                  {t('home.cta.pricing')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
