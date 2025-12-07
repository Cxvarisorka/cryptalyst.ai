import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from 'lucide-react';

export default function SubscriptionSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Wait a moment to ensure webhook has processed, then refresh user data
    const timer = setTimeout(async () => {
      // Refresh user data to get updated subscription info
      await refreshUser();
      setLoading(false);
    }, 3000); // 3 seconds to allow webhook processing

    return () => clearTimeout(timer);
  }, [refreshUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Processing your subscription...
            </h2>
            <p className="text-muted-foreground">
              Please wait while we confirm your payment.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="bg-green-100 dark:bg-green-900/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-4">
            Welcome to Premium!
          </h2>

          <p className="text-muted-foreground mb-2">
            Your subscription has been activated successfully.
          </p>

          <p className="text-muted-foreground mb-6">
            You now have access to all premium features. Your 3-day free trial starts now!
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
            <p className="text-sm text-foreground">
              You won't be charged until your trial ends. Cancel anytime from your account settings.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-gradient-money hover:opacity-90"
            >
              Go to Dashboard
            </Button>
            <Button
              onClick={() => navigate('/settings')}
              variant="outline"
              className="flex-1"
            >
              Manage Subscription
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
