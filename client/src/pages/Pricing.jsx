import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { FadeIn } from "@/components/magicui/fade-in";
import { GradientText } from "@/components/magicui/gradient-text";
import { Check, DollarSign, Sparkles, Crown, Star, Zap } from "lucide-react";
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
        align="left"
        size="medium"
      />

      {/* Main Content - Static spacing from hero */}
      <div className="container mx-auto px-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 md:pt-20">
              {pricingPlans.map((p, index) => {
                const Icon = p.icon;
                return (
                  <FadeIn key={p.key} delay={0.1 * (index + 1)}>
                    <Card className={`bg-card border-border/60 h-full flex flex-col transition-all duration-500 ${p.featured ? "ring-2 ring-primary shadow-lg" : ""}`}>
                      {p.featured && (
                        <div className="bg-gradient-money text-white text-center py-2 text-sm font-semibold rounded-t-lg">
                          Most Popular
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="h-6 w-6 text-primary" />
                          <CardTitle className="text-2xl">{p.name}</CardTitle>
                        </div>
                        {p.trial && (
                          <CardDescription className="text-blue-500 font-semibold">
                            {p.trial}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col">
                        <div className="mb-6">
                          <span className="text-4xl font-bold text-foreground">{p.price}</span>
                          <span className="text-muted-foreground">{p.period}</span>
                        </div>
                        <ul className="space-y-3 mb-8 flex-1">
                          {p.features.map((f, i) => (
                            <li key={i} className="flex items-start gap-2 text-muted-foreground">
                              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                        <Button
                          className={`w-full ${p.featured ? "bg-gradient-money hover:opacity-90" : ""}`}
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
                          {isCurrentPlan(p.key) ? 'Current Plan' : processingPlan === p.key ? 'Processing...' : p.cta}
                        </Button>
                      </CardContent>
                    </Card>
                  </FadeIn>
                );
              })}
            </div>

            {/* AI Usage Comparison Section */}
            <FadeIn delay={0.35} className="mt-12">
              <Card className="bg-card border-border/60">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2">
                    <Zap className="h-6 w-6 text-primary" />
                    AI Analysis Limits Comparison
                  </CardTitle>
                  <CardDescription>
                    Each crypto, stock, portfolio, or scalping analysis counts as 1 AI use
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 rounded-lg bg-gray-500/10 border border-gray-500/20">
                      <h4 className="font-semibold text-lg mb-2">Free</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-2xl font-bold text-gray-500">{AI_USAGE_LIMITS.free.dailyLimit}</span> /day</p>
                        <p className="text-muted-foreground">{AI_USAGE_LIMITS.free.monthlyLimit} /month</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <h4 className="font-semibold text-lg mb-2 text-blue-600 dark:text-blue-400">Basic</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-2xl font-bold text-blue-500">{AI_USAGE_LIMITS.basic.dailyLimit}</span> /day</p>
                        <p className="text-muted-foreground">{AI_USAGE_LIMITS.basic.monthlyLimit} /month</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <h4 className="font-semibold text-lg mb-2 text-purple-600 dark:text-purple-400">Premium</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-2xl font-bold text-purple-500">{AI_USAGE_LIMITS.premium.dailyLimit}</span> /day</p>
                        <p className="text-muted-foreground">{AI_USAGE_LIMITS.premium.monthlyLimit} /month</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-4">
                    Limits reset daily at midnight and monthly on the 1st. Portfolio analysis may use 2-3 credits.
                  </p>
                </CardContent>
              </Card>
            </FadeIn>

            {/* Current Subscription Info */}
            {currentSubscription && isPlanActive() && (
              <div className="mt-12 flex justify-center">
                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 max-w-xl w-full">
                  <CardContent className="p-6 text-center">
                    <p className="text-foreground mb-3">
                      {currentSubscription.isTrialing
                        ? `You're on a free trial until ${new Date(currentSubscription.trialEndsAt).toLocaleDateString()}`
                        : `Your ${currentSubscription.plan} plan renews on ${new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}`}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/settings?tab=subscription')}
                    >
                      Manage Subscription
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}

        {/* FAQ Section */}
        <FadeIn delay={0.4} className="mt-16 md:mt-20 max-w-6xl mx-auto">
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
        <FadeIn delay={0.5} className="text-center mt-16 md:mt-20 mb-20 md:mb-24">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 transition-all duration-500">
            <CardContent className="p-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">{t("pricing.cta.title")}</h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">{t("pricing.cta.subtitle")}</p>
              <Button
                size="lg"
                className="bg-gradient-money hover:opacity-90"
                onClick={() => user ? navigate('/dashboard') : navigate('/signup')}
              >
                {t("pricing.cta.getStarted")}
              </Button>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
