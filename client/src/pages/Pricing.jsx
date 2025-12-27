import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { FadeIn } from "@/components/magicui/fade-in";
import { GradientText } from "@/components/magicui/gradient-text";
import {
  Check, DollarSign, Sparkles, Crown, Star, Zap,
  Rocket, Shield, ArrowRight, HelpCircle, ChevronDown
} from "lucide-react";
import Hero from "@/components/layout/Hero";
import { useAuth } from "../contexts/AuthContext";
import subscriptionService from "../services/subscription.service";

// AI Usage limits configuration (matches backend)
const AI_USAGE_LIMITS = {
  free: { dailyLimit: 2, monthlyLimit: 50 },
  basic: { dailyLimit: 5, monthlyLimit: 150 },
  premium: { dailyLimit: 40, monthlyLimit: 1000 }
};

export default function Pricing() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plans, setPlans] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [processingPlan, setProcessingPlan] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    // Set hardcoded plans - no API call needed
    setPlans({
      basic: {
        price: 10,
        features: [
          'Access to basic crypto analysis',
          'Real-time price tracking',
          'Up to 10 portfolio holdings',
          'Basic technical indicators',
          'Email support'
        ]
      },
      premium: {
        price: 25,
        features: [
          'All Basic features',
          'Advanced AI-powered analysis',
          'Unlimited portfolio holdings',
          'Advanced technical indicators',
          'Custom alerts and notifications',
          'Priority support',
          'Market sentiment analysis',
          'Advanced charting tools'
        ]
      }
    });
    setLoading(false);

    if (user) {
      loadSubscriptionStatus();
    }
  }, [user]);

  const loadSubscriptionStatus = async () => {
    try {
      const response = await subscriptionService.getSubscriptionStatus();
      setCurrentSubscription(response.subscription);
    } catch (error) {
      console.error('Error loading subscription status:', error);
    }
  };

  const handleSubscribe = async (planType) => {
    if (!user) {
      navigate('/signup', { state: { from: '/pricing', selectedPlan: planType } });
      return;
    }

    try {
      setProcessingPlan(planType);
      await subscriptionService.checkout(planType);
    } catch (error) {
      console.error('Error starting checkout:', error);
      alert(error.message || 'Failed to start checkout. Please try again.');
      setProcessingPlan(null);
    }
  };

  const isCurrentPlan = (planType) => {
    return currentSubscription?.plan === planType;
  };

  const isPlanActive = () => {
    return currentSubscription?.isActive || currentSubscription?.isTrialing;
  };

  const pricingPlans = [
    {
      key: "free",
      name: "Free",
      price: "$0",
      period: "Forever",
      icon: DollarSign,
      cta: "Get Started",
      color: "gray",
      gradient: "from-gray-500 to-slate-500",
      aiLimits: AI_USAGE_LIMITS.free,
      features: [
        "Basic crypto tracking",
        "Up to 5 portfolio holdings",
        `${AI_USAGE_LIMITS.free.dailyLimit} AI analyses per day`,
        `${AI_USAGE_LIMITS.free.monthlyLimit} AI analyses per month`,
        "Community features",
        "Basic price alerts"
      ],
    },
    ...(plans.basic ? [{
      key: "basic",
      name: "Basic",
      price: `$${plans.basic.price}`,
      period: "/month",
      icon: Crown,
      cta: "Start Free Trial",
      featured: true,
      trial: "3-day free trial",
      color: "blue",
      gradient: "from-blue-500 to-cyan-500",
      aiLimits: AI_USAGE_LIMITS.basic,
      features: [
        ...plans.basic.features.filter(f => !f.includes('AI analyses')),
        `${AI_USAGE_LIMITS.basic.dailyLimit} AI analyses per day`,
        `${AI_USAGE_LIMITS.basic.monthlyLimit} AI analyses per month`
      ]
    }] : []),
    ...(plans.premium ? [{
      key: "premium",
      name: "Premium",
      price: `$${plans.premium.price}`,
      period: "/month",
      icon: Star,
      cta: "Start Free Trial",
      trial: "3-day free trial",
      color: "purple",
      gradient: "from-purple-500 to-pink-500",
      aiLimits: AI_USAGE_LIMITS.premium,
      features: [
        ...plans.premium.features.filter(f => !f.includes('AI analyses')),
        `${AI_USAGE_LIMITS.premium.dailyLimit} AI analyses per day`,
        `${AI_USAGE_LIMITS.premium.monthlyLimit} AI analyses per month`
      ]
    }] : []),
  ];

  const faqs = [
    { q: t("pricing.faq.q1"), a: t("pricing.faq.a1") },
    { q: t("pricing.faq.q2"), a: t("pricing.faq.a2") },
    { q: t("pricing.faq.q3"), a: t("pricing.faq.a3") },
    { q: t("pricing.faq.q4"), a: t("pricing.faq.a4") },
  ];

  const heroIcons = [
    { Icon: DollarSign, gradient: 'bg-gradient-money' },
  ];

  const benefits = [
    { icon: Shield, text: "Cancel anytime" },
    { icon: Zap, text: "Instant access" },
    { icon: Sparkles, text: "No hidden fees" },
  ];

  return (
    <div className="bg-gradient-to-br from-background via-muted to-background">
      {/* Hero Section */}
      <Hero
        title={t("pricing.title")}
        subtitle={t("pricing.subtitle")}
        icons={heroIcons}
        showSingleIcon={false}
        align="left"
        size="medium"
      />

      {/* Main Content */}
      <div className="container mx-auto px-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Trust badges */}
            <FadeIn className="pt-16 md:pt-20">
              <div className="flex flex-wrap items-center justify-center gap-6 mb-12">
                {benefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <benefit.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </FadeIn>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {pricingPlans.map((p, index) => {
                const Icon = p.icon;
                return (
                  <FadeIn key={p.key} delay={0.1 * (index + 1)}>
                    <Card className={`bg-card border-border/60 h-full flex flex-col transition-all duration-300 hover:border-primary/30 relative overflow-hidden group ${p.featured ? "ring-2 ring-primary shadow-xl scale-[1.02]" : ""}`}>
                      {/* Featured badge */}
                      {p.featured && (
                        <div className="absolute top-0 left-0 right-0 bg-gradient-money text-white text-center py-2 text-sm font-semibold">
                          Most Popular
                        </div>
                      )}

                      {/* Gradient accent on hover */}
                      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${p.gradient} opacity-0 group-hover:opacity-10 rounded-bl-full transition-opacity duration-300`} />

                      <CardHeader className={p.featured ? "pt-12" : ""}>
                        {/* Plan icon and name */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.gradient} flex items-center justify-center`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-2xl">{p.name}</CardTitle>
                            {p.trial && (
                              <CardDescription className="text-primary font-medium">
                                {p.trial}
                              </CardDescription>
                            )}
                          </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-1">
                          <span className="text-5xl font-bold text-foreground">{p.price}</span>
                          <span className="text-muted-foreground text-lg">{p.period}</span>
                        </div>
                      </CardHeader>

                      <CardContent className="flex-1 flex flex-col pt-0">
                        {/* AI Limit highlight */}
                        <div className={`mb-6 p-3 rounded-xl bg-${p.color}-500/10 border border-${p.color}-500/20`}>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">AI Analyses</span>
                            <div className="text-right">
                              <span className={`text-lg font-bold text-${p.color}-500`}>{p.aiLimits.dailyLimit}</span>
                              <span className="text-muted-foreground text-sm">/day</span>
                            </div>
                          </div>
                        </div>

                        {/* Features list */}
                        <ul className="space-y-3 mb-8 flex-1">
                          {p.features.map((f, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Check className="h-3 w-3 text-green-500" />
                              </div>
                              <span className="text-muted-foreground text-sm">{f}</span>
                            </li>
                          ))}
                        </ul>

                        {/* CTA Button */}
                        <Button
                          className={`w-full h-12 text-base font-semibold transition-all duration-300 ${p.featured ? "bg-gradient-money hover:opacity-90 shadow-lg" : "hover:bg-primary/90"}`}
                          variant={p.featured ? "default" : "outline"}
                          onClick={() => {
                            if (p.key === 'free') {
                              if (!user) {
                                navigate('/signup');
                              }
                            } else {
                              handleSubscribe(p.key);
                            }
                          }}
                          disabled={isCurrentPlan(p.key) || processingPlan === p.key}
                        >
                          {isCurrentPlan(p.key) ? (
                            'Current Plan'
                          ) : processingPlan === p.key ? (
                            'Processing...'
                          ) : (
                            <>
                              {p.cta}
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </FadeIn>
                );
              })}
            </div>

            {/* AI Usage Comparison */}
            <FadeIn delay={0.35} className="mt-12">
              <Card className="bg-card border-border/60 overflow-hidden">
                <CardHeader className="text-center border-b border-border/60 bg-muted/30">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-xl">AI Analysis Limits Comparison</CardTitle>
                  <CardDescription>
                    Each crypto, stock, portfolio, or scalping analysis counts as 1 AI use
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { name: "Free", limits: AI_USAGE_LIMITS.free, color: "gray" },
                      { name: "Basic", limits: AI_USAGE_LIMITS.basic, color: "blue" },
                      { name: "Premium", limits: AI_USAGE_LIMITS.premium, color: "purple" },
                    ].map((plan, i) => (
                      <div key={i} className={`p-5 rounded-xl bg-${plan.color}-500/10 border border-${plan.color}-500/20 text-center hover:border-${plan.color}-500/40 transition-colors`}>
                        <h4 className={`font-semibold text-lg mb-3 text-${plan.color}-600 dark:text-${plan.color}-400`}>
                          {plan.name}
                        </h4>
                        <div className="space-y-2">
                          <div>
                            <span className={`text-3xl font-bold text-${plan.color}-500`}>{plan.limits.dailyLimit}</span>
                            <span className="text-muted-foreground text-sm ml-1">/day</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {plan.limits.monthlyLimit} /month
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-4 flex items-center justify-center gap-1">
                    <HelpCircle className="h-3 w-3" />
                    Limits reset daily at midnight and monthly on the 1st. Portfolio analysis may use 2-3 credits.
                  </p>
                </CardContent>
              </Card>
            </FadeIn>

            {/* Current Subscription Info */}
            {currentSubscription && isPlanActive() && (
              <FadeIn delay={0.4} className="mt-8">
                <Card className="bg-primary/5 border-primary/20 max-w-xl mx-auto">
                  <CardContent className="p-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Crown className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {currentSubscription.isTrialing ? 'Free Trial Active' : `${currentSubscription.plan} Plan`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {currentSubscription.isTrialing
                            ? `Ends ${new Date(currentSubscription.trialEndsAt).toLocaleDateString()}`
                            : `Renews ${new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/settings?tab=subscription')}
                    >
                      Manage
                    </Button>
                  </CardContent>
                </Card>
              </FadeIn>
            )}
          </>
        )}

        {/* FAQ Section - Accordion Style */}
        <FadeIn delay={0.4} className="mt-20 md:mt-24">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 mb-4">
              <HelpCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">FAQ</span>
            </div>
            <h2 className="text-3xl font-bold">
              <GradientText>{t("pricing.faq.title")}</GradientText>
            </h2>
          </div>

          <Card className="bg-card border-border/60 overflow-hidden divide-y divide-border/60">
            {faqs.map((faq, index) => (
              <div key={index} className="overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm text-primary font-bold">
                      {index + 1}
                    </span>
                    <h3 className="font-semibold text-foreground text-base">
                      {faq.q}
                    </h3>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${openFaq === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-5 pl-[4.5rem]">
                      <p className="text-muted-foreground leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </FadeIn>

        {/* CTA */}
        <FadeIn delay={0.5} className="text-center mt-16 md:mt-20 mb-20 md:mb-24">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-money flex items-center justify-center mx-auto mb-6">
                <Rocket className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">{t("pricing.cta.title")}</h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">{t("pricing.cta.subtitle")}</p>
              <Button
                size="lg"
                className="bg-gradient-money hover:opacity-90"
                onClick={() => user ? navigate('/dashboard') : navigate('/signup')}
              >
                {t("pricing.cta.getStarted")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
