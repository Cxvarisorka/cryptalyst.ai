import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Crown,
  Star,
  Check,
  Loader2,
  Calendar,
  CreditCard,
  ArrowRight,
  AlertCircle,
  TrendingUp,
  Settings,
  ExternalLink
} from 'lucide-react';
import subscriptionService from '../../services/subscription.service';
import { AIUsageCard } from '@/components/ai/AIUsageDisplay';

export default function SubscriptionManagement() {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [actionType, setActionType] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subscriptionRes, plansRes] = await Promise.all([
        subscriptionService.getSubscriptionStatus(),
        subscriptionService.getPlans()
      ]);

      setSubscription(subscriptionRes.subscription);
      setPlans(plansRes.plans);
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planType) => {
    try {
      setProcessing(true);
      setActionType('upgrade');
      await subscriptionService.checkout(planType);
    } catch (error) {
      console.error('Error upgrading:', error);
      alert(error.message || 'Failed to upgrade. Please try again.');
      setProcessing(false);
      setActionType(null);
    }
  };

  const handleManageBilling = async () => {
    try {
      setProcessing(true);
      setActionType('portal');
      await subscriptionService.openCustomerPortal();
    } catch (error) {
      console.error('Error opening portal:', error);
      alert(error.message || 'Failed to open billing portal. Please try again.');
      setProcessing(false);
      setActionType(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will still have access until the end of your billing period.')) {
      return;
    }

    try {
      setProcessing(true);
      setActionType('cancel');
      await subscriptionService.cancelSubscription();
      await loadData();
      alert('Subscription cancelled successfully. You will have access until the end of your billing period.');
    } catch (error) {
      console.error('Error canceling subscription:', error);
      alert(error.message || 'Failed to cancel subscription. Please try again.');
    } finally {
      setProcessing(false);
      setActionType(null);
    }
  };

  const handleReactivate = async () => {
    try {
      setProcessing(true);
      setActionType('reactivate');
      await subscriptionService.reactivateSubscription();
      await loadData();
      alert('Subscription reactivated successfully!');
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      alert(error.message || 'Failed to reactivate subscription. Please try again.');
    } finally {
      setProcessing(false);
      setActionType(null);
    }
  };

  const getPlanIcon = (plan) => {
    switch (plan) {
      case 'basic':
        return <Crown className="h-5 w-5" />;
      case 'premium':
        return <Star className="h-5 w-5" />;
      default:
        return <TrendingUp className="h-5 w-5" />;
    }
  };

  const getPlanColor = (plan) => {
    switch (plan) {
      case 'basic':
        return 'bg-blue-500';
      case 'premium':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusBadge = () => {
    if (subscription?.isTrialing) {
      return <Badge className="bg-blue-500">Free Trial</Badge>;
    }
    if (subscription?.cancelAtPeriodEnd) {
      return <Badge variant="destructive">Canceling</Badge>;
    }
    if (subscription?.isActive) {
      return <Badge className="bg-green-500">Active</Badge>;
    }
    return <Badge variant="secondary">Inactive</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentPlan = subscription?.plan || 'free';
  const isActive = subscription?.isActive || subscription?.isTrialing;

  return (
    <div className="space-y-6">
      {/* AI Usage Section */}
      <AIUsageCard showUpgrade={currentPlan !== 'premium'} />

      {/* Current Subscription Status */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Subscription
            </CardTitle>
            <CardDescription className="mt-1.5">
              Manage your subscription and billing settings
            </CardDescription>
          </div>
          {/* Manage Subscription Button - For any user with a paid plan (active or inactive) */}
          {currentPlan !== 'free' && (
            <Button
              onClick={handleManageBilling}
              disabled={processing}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
            >
              {processing && actionType === 'portal' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Settings className="h-4 w-4 mr-2" />
              )}
              Manage Subscription
              <ExternalLink className="h-3 w-3 ml-2" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Plan Info */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`${getPlanColor(currentPlan)} p-3 rounded-lg text-white`}>
                {getPlanIcon(currentPlan)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-2xl font-bold capitalize">{currentPlan} Plan</h3>
                  {getStatusBadge()}
                </div>
                <p className="text-muted-foreground">
                  {currentPlan === 'free'
                    ? 'Limited features and storage'
                    : currentPlan === 'basic'
                    ? `$${plans.basic?.price || 10}/month - Essential features for crypto tracking`
                    : `$${plans.premium?.price || 25}/month - Full access to all features`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Free User Info */}
          {currentPlan === 'free' && (
            <Alert className="bg-muted/50 border-border/60">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <AlertDescription className="text-foreground">
                Upgrade to a paid plan to unlock subscription management features including payment method updates, billing history, and invoice downloads.
              </AlertDescription>
            </Alert>
          )}

          {/* Trial Info */}
          {subscription?.isTrialing && (
            <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
              <Calendar className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-foreground">
                Your free trial ends on{' '}
                <strong>{new Date(subscription.trialEndsAt).toLocaleDateString()}</strong>.
                You won't be charged until then.
              </AlertDescription>
            </Alert>
          )}

          {/* Cancellation Warning */}
          {subscription?.cancelAtPeriodEnd && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your subscription will be canceled on{' '}
                <strong>{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</strong>.
                You can reactivate it anytime before then.
              </AlertDescription>
            </Alert>
          )}

          {/* Inactive Subscription Warning */}
          {currentPlan !== 'free' && !isActive && !subscription?.cancelAtPeriodEnd && (
            <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-foreground">
                Your subscription is currently <strong>inactive</strong>. Use the "Manage Subscription" button to update your payment method or resubscribe to restore access to premium features.
              </AlertDescription>
            </Alert>
          )}

          {/* Active Subscription Info */}
          {isActive && !subscription?.cancelAtPeriodEnd && currentPlan !== 'free' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {subscription?.isTrialing
                  ? `Trial ends: ${new Date(subscription.trialEndsAt).toLocaleDateString()}`
                  : `Next billing date: ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                }
              </span>
            </div>
          )}

          {/* Subscription Management Info for Paid Users */}
          {currentPlan !== 'free' && !subscription?.cancelAtPeriodEnd && (
            <div className="p-4 bg-muted/50 rounded-lg border border-border/60">
              <div className="flex items-start gap-3">
                <Settings className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Subscription Management</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Use the "Manage Subscription" button to access your billing portal where you can:
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="h-3 w-3 text-green-500" />
                      Update your payment method
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3 w-3 text-green-500" />
                      View billing history and invoices
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3 w-3 text-green-500" />
                      Change or cancel your subscription
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3 w-3 text-green-500" />
                      Update billing information
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {currentPlan !== 'free' && (
              <Button
                onClick={handleManageBilling}
                disabled={processing}
                variant="outline"
              >
                {processing && actionType === 'portal' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4 mr-2" />
                )}
                Update Payment Method
              </Button>
            )}

            {subscription?.cancelAtPeriodEnd && (
              <Button
                onClick={handleReactivate}
                disabled={processing}
                className="bg-green-500 hover:bg-green-600"
              >
                {processing && actionType === 'reactivate' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Reactivate Subscription
              </Button>
            )}

            {currentPlan !== 'free' && isActive && !subscription?.cancelAtPeriodEnd && (
              <Button
                onClick={handleCancelSubscription}
                disabled={processing}
                variant="destructive"
              >
                {processing && actionType === 'cancel' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Cancel Subscription
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Options */}
      {(currentPlan === 'free' || currentPlan === 'basic') && (
        <Card>
          <CardHeader>
            <CardTitle>Upgrade Your Plan</CardTitle>
            <CardDescription>
              Get access to more features and unlock your full potential
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentPlan === 'free' && plans.basic && (
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-500 p-3 rounded-lg text-white">
                    <Crown className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Basic Plan</h4>
                    <p className="text-sm text-muted-foreground">
                      ${plans.basic.price}/month • 3-day free trial
                    </p>
                    <ul className="mt-2 space-y-1">
                      {plans.basic.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="text-sm flex items-center gap-2">
                          <Check className="h-3 w-3 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <Button
                  onClick={() => handleUpgrade('basic')}
                  disabled={processing}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {processing && actionType === 'upgrade' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Upgrade
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}

            {plans.premium && (
              <div className="flex items-center justify-between p-4 border-2 border-purple-500 rounded-lg bg-purple-50 dark:bg-purple-900/10">
                <div className="flex items-center gap-4">
                  <div className="bg-purple-500 p-3 rounded-lg text-white">
                    <Star className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-lg">Premium Plan</h4>
                      <Badge className="bg-purple-500">Recommended</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ${plans.premium.price}/month • 3-day free trial
                    </p>
                    <ul className="mt-2 space-y-1">
                      {plans.premium.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="text-sm flex items-center gap-2">
                          <Check className="h-3 w-3 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <Button
                  onClick={() => handleUpgrade('premium')}
                  disabled={processing}
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  {processing && actionType === 'upgrade' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Upgrade
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}

            <Button
              variant="link"
              onClick={() => navigate('/pricing')}
              className="w-full"
            >
              View all plans and features
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Features Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Your Plan Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentPlan === 'free' ? (
              <>
                <FeatureItem text="Basic crypto tracking" included />
                <FeatureItem text="Up to 5 portfolio holdings" included />
                <FeatureItem text="Community features" included />
                <FeatureItem text="Basic price alerts" included />
                <FeatureItem text="Advanced AI analysis" included={false} />
                <FeatureItem text="Unlimited holdings" included={false} />
                <FeatureItem text="Priority support" included={false} />
              </>
            ) : currentPlan === 'basic' && plans.basic ? (
              plans.basic.features.map((feature, idx) => (
                <FeatureItem key={idx} text={feature} included />
              ))
            ) : currentPlan === 'premium' && plans.premium ? (
              plans.premium.features.map((feature, idx) => (
                <FeatureItem key={idx} text={feature} included />
              ))
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FeatureItem({ text, included }) {
  return (
    <div className="flex items-center gap-3">
      {included ? (
        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
      ) : (
        <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
      )}
      <span className={included ? 'text-foreground' : 'text-muted-foreground line-through'}>
        {text}
      </span>
    </div>
  );
}
