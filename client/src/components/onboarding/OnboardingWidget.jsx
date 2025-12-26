import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  ChevronDown,
  ChevronUp,
  X,
  Check,
  Briefcase,
  TrendingUp,
  BarChart3,
  PieChart,
  Newspaper,
  Bell,
  Zap,
  Sparkles,
  Trophy
} from 'lucide-react';
import axios from 'axios';
import { ONBOARDING_UPDATE_EVENT } from '@/hooks/useOnboardingTracker';

const TASKS = [
  { id: 'createPortfolio', icon: Briefcase, route: '/dashboard?tab=portfolio' },
  { id: 'useCryptoAnalyzer', icon: TrendingUp, route: '/crypto/bitcoin' },
  { id: 'useStockAnalyzer', icon: BarChart3, route: '/stock/AAPL' },
  { id: 'usePortfolioAnalyzer', icon: PieChart, route: '/dashboard?tab=analytics' },
  { id: 'viewNews', icon: Newspaper, route: '/news' },
  { id: 'setPriceAlert', icon: Bell, route: '/price-alerts' },
  { id: 'useScalpingAI', icon: Zap, route: '/scalping-ai' },
];

export default function OnboardingWidget() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [isExpanded, setIsExpanded] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [onboarding, setOnboarding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

  // Fetch onboarding status
  const fetchOnboarding = useCallback(async () => {
    if (!isAuthenticated) {
      setIsVisible(false);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('/onboarding');
      if (response.data.success) {
        const data = response.data.data;
        setOnboarding(data);

        // Show widget if not completed and not dismissed
        setIsVisible(!data.isCompleted && !data.dismissedAt);

        // Show celebration if all tasks just completed
        if (data.isCompleted && !showCelebration) {
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 3000);
        }
      }
    } catch (error) {
      console.error('Failed to fetch onboarding:', error);
      setIsVisible(false);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, showCelebration]);

  useEffect(() => {
    fetchOnboarding();
  }, [fetchOnboarding]);

  // Listen for task completion events to update in real-time
  useEffect(() => {
    const handleTaskCompleted = () => {
      fetchOnboarding();
    };

    window.addEventListener(ONBOARDING_UPDATE_EVENT, handleTaskCompleted);
    return () => {
      window.removeEventListener(ONBOARDING_UPDATE_EVENT, handleTaskCompleted);
    };
  }, [fetchOnboarding]);

  // Refresh onboarding status periodically (every 30 seconds)
  useEffect(() => {
    if (!isAuthenticated || !isVisible) return;

    const interval = setInterval(() => {
      fetchOnboarding();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, isVisible, fetchOnboarding]);

  const handleTaskClick = (task) => {
    navigate(task.route);
  };

  const handleDismiss = async () => {
    try {
      await axios.post('/onboarding/dismiss');
      setIsVisible(false);
    } catch (error) {
      console.error('Failed to dismiss onboarding:', error);
    }
  };

  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (loading || !isVisible) return null;

  const completedCount = onboarding?.completedCount || 0;
  const totalTasks = TASKS.length;
  const progress = onboarding?.progress || 0;

  // Minimized state - just show a floating button
  if (isMinimized) {
    return (
      <div className="fixed bottom-20 right-4 z-[90] sm:bottom-6 sm:right-6">
        <Button
          onClick={handleToggleMinimize}
          className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
        >
          <div className="relative">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
            <span className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {totalTasks - completedCount}
            </span>
          </div>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-[90] w-80 sm:w-96 sm:bottom-6 sm:right-6">
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes celebrate {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .widget-enter {
          animation: slideUp 0.3s ease-out forwards;
        }
        .celebrate {
          animation: celebrate 0.5s ease-in-out 3;
        }
      `}</style>

      <Card className={`widget-enter bg-card/95 backdrop-blur border-primary/20 shadow-xl ${showCelebration ? 'celebrate border-primary' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-2 cursor-pointer flex-1"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {showCelebration ? (
                <Trophy className="w-5 h-5 text-secondary" />
              ) : (
                <Sparkles className="w-5 h-5 text-primary" />
              )}
              <CardTitle className="text-base">
                {showCelebration ? t('onboarding.celebration.title') : t('onboarding.title')}
              </CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground mr-1">
                {completedCount}/{totalTasks}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleToggleMinimize}
                title={t('onboarding.minimize')}
              >
                <ChevronDown className="h-4 w-4 rotate-45" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleDismiss}
                title={t('onboarding.dismiss')}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Progress value={progress} className="h-1.5 mt-2" />
        </CardHeader>

        {isExpanded && (
          <CardContent className="pt-0 max-h-72 overflow-y-auto">
            {showCelebration ? (
              <p className="text-sm text-primary font-medium py-4 text-center">
                {t('onboarding.celebration.message')}
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-3">
                  {t('onboarding.subtitle')}
                </p>
                <ul className="space-y-1.5">
                  {TASKS.map((task) => {
                    const isCompleted = onboarding?.tasks?.[task.id]?.completed;
                    const Icon = task.icon;

                    return (
                      <li
                        key={task.id}
                        onClick={() => !isCompleted && handleTaskClick(task)}
                        className={`flex items-center gap-3 p-2.5 rounded-lg transition-all duration-200 ${
                          isCompleted
                            ? 'bg-primary/10 cursor-default'
                            : 'hover:bg-primary/5 cursor-pointer hover:translate-x-1'
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-full shrink-0 ${
                            isCompleted ? 'bg-primary/20' : 'bg-muted'
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="w-4 h-4 text-primary" />
                          ) : (
                            <Icon className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <span
                          className={`text-sm ${
                            isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
                          }`}
                        >
                          {t(`onboarding.tasks.${task.id}`)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
