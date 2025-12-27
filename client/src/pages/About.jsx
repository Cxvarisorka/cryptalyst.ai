import { FadeIn } from "@/components/magicui/fade-in";
import { GradientText } from "@/components/magicui/gradient-text";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Users, TrendingUp, Shield, Zap, Brain, LineChart,
  BarChart3, Eye, Target, Rocket, Cpu, Globe, Lock, Database
} from "lucide-react";
import Hero from "@/components/layout/Hero";

export default function About() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const stats = [
    { icon: Users, value: "50K+", label: t("about.stats.users"), color: "text-blue-500" },
    { icon: TrendingUp, value: "$2B+", label: t("about.stats.volume"), color: "text-green-500" },
    { icon: Shield, value: "99.9%", label: t("about.stats.uptime"), color: "text-purple-500" },
    { icon: Zap, value: "<1s", label: t("about.stats.latency"), color: "text-yellow-500" },
  ];

  const heroIcons = [
    { Icon: Users, gradient: 'bg-gradient-money' },
  ];

  const features = [
    {
      icon: Brain,
      title: t("about.keyFeatures.aiPowered.title"),
      description: t("about.keyFeatures.aiPowered.description"),
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: LineChart,
      title: t("about.keyFeatures.realTime.title"),
      description: t("about.keyFeatures.realTime.description"),
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: BarChart3,
      title: t("about.keyFeatures.portfolioTracking.title"),
      description: t("about.keyFeatures.portfolioTracking.description"),
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Eye,
      title: t("about.keyFeatures.sentiment.title"),
      description: t("about.keyFeatures.sentiment.description"),
      gradient: "from-orange-500 to-yellow-500"
    },
  ];

  const values = [
    {
      icon: Shield,
      title: t("about.values.transparency.title"),
      description: t("about.values.transparency.description"),
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      icon: Zap,
      title: t("about.values.innovation.title"),
      description: t("about.values.innovation.description"),
      color: "text-yellow-500",
      bg: "bg-yellow-500/10"
    },
    {
      icon: Users,
      title: t("about.values.community.title"),
      description: t("about.values.community.description"),
      color: "text-green-500",
      bg: "bg-green-500/10"
    },
  ];

  const techStack = [
    { icon: Cpu, label: "AI Models", desc: "GPT-powered insights" },
    { icon: Database, label: "Real-time Data", desc: "Live market feeds" },
    { icon: Globe, label: "Global Coverage", desc: "100+ exchanges" },
    { icon: Lock, label: "Bank-grade Security", desc: "End-to-end encryption" },
  ];

  return (
    <div className="bg-gradient-to-br from-background via-muted to-background">
      {/* Hero Section */}
      <Hero
        title={t("about.title")}
        subtitle={t("about.subtitle")}
        icons={heroIcons}
        showSingleIcon={false}
        align="left"
        size="medium"
      />

      {/* Main Content */}
      <div className="container mx-auto px-4">

        {/* Stats - Bento Style */}
        <FadeIn className="pt-16 md:pt-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="bg-card border-border/60 text-center p-6 hover:border-primary/30 transition-all duration-300">
                  <div className={`w-14 h-14 rounded-2xl ${stat.color} bg-current/10 flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`h-7 w-7 ${stat.color}`} />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </Card>
              );
            })}
          </div>
        </FadeIn>

        {/* Mission & Technology - Two Column */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-16 md:mt-20">
          <FadeIn>
            <Card className="bg-card border-border/60 h-full hover:border-primary/30 transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-money flex items-center justify-center">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-xl">
                    <GradientText>{t("about.mission.title")}</GradientText>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground leading-relaxed">
                {t("about.mission.content")}
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.1}>
            <Card className="bg-card border-border/60 h-full hover:border-primary/30 transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Rocket className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-xl">
                    <GradientText>{t("about.technology.title")}</GradientText>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground leading-relaxed">
                {t("about.technology.content")}
              </CardContent>
            </Card>
          </FadeIn>
        </div>

        {/* Tech Stack Badges */}
        <FadeIn delay={0.15} className="mt-8">
          <Card className="bg-card border-border/60 p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {techStack.map((tech, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <tech.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">{tech.label}</p>
                    <p className="text-xs text-muted-foreground">{tech.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </FadeIn>

        {/* Key Features */}
        <FadeIn delay={0.2} className="mt-16 md:mt-20">
          <h2 className="text-3xl font-bold text-center mb-10">
            <GradientText>{t("about.keyFeatures.title")}</GradientText>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="bg-card border-border/60 p-6 hover:border-primary/30 transition-all duration-300 group">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </FadeIn>

        {/* Values */}
        <FadeIn delay={0.3} className="mt-16 md:mt-20">
          <h2 className="text-3xl font-bold text-center mb-10">
            <GradientText>{t("about.values.title")}</GradientText>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="bg-card border-border/60 p-6 text-center hover:border-primary/30 transition-all duration-300 group">
                  <div className={`w-16 h-16 rounded-2xl ${value.bg} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-8 w-8 ${value.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {value.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </FadeIn>

        {/* CTA */}
        <FadeIn delay={0.4} className="text-center mt-16 md:mt-20 mb-20 md:mb-24">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 transition-all duration-500">
            <CardContent className="p-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-money flex items-center justify-center mx-auto mb-6">
                <Rocket className="h-8 w-8 text-white" />
              </div>
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
