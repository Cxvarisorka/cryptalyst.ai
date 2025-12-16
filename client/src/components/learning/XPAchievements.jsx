import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  Flame,
  Star,
  Zap,
  BookOpen,
  TrendingUp,
  Medal,
  CheckCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import settingsService from '@/services/settings.service';
import { ALL_ACHIEVEMENTS, XP_REWARDS, getLevelInfo } from './constants';

const XPAchievements = ({
  stats: externalStats = null,
  loading: externalLoading = false,
  onRefresh = null,
  compact = false,
  showXPRewards = true
}) => {
  const [internalStats, setInternalStats] = useState(null);
  const [internalLoading, setInternalLoading] = useState(false);
  const [error, setError] = useState(null);

  // Use external stats if provided, otherwise fetch internally
  const stats = externalStats || internalStats;
  const loading = externalLoading || internalLoading;

  const fetchStats = useCallback(async () => {
    if (externalStats !== null) return; // Don't fetch if external stats provided

    try {
      setInternalLoading(true);
      setError(null);
      const response = await settingsService.getLearningStats();

      if (response.success && response.stats) {
        setInternalStats(response.stats);
      } else {
        setError('Failed to load stats');
      }
    } catch (err) {
      console.error('Error loading learning stats:', err);
      setError(err.response?.data?.message || 'Failed to load learning stats');
    } finally {
      setInternalLoading(false);
    }
  }, [externalStats]);

  useEffect(() => {
    if (externalStats === null) {
      fetchStats();
    }
  }, [fetchStats, externalStats]);

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      fetchStats();
    }
  };

  const isAchievementUnlocked = (achievementId) => {
    return stats?.achievements?.some(a => a.id === achievementId) || false;
  };

  if (loading) {
    return (
      <Card className="border-border/60 shadow-lg">
        <CardContent className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-green-500 mx-auto" />
            <p className="mt-2 text-sm text-muted-foreground">Loading your progress...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !stats) {
    return (
      <Card className="border-border/60 shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-20">
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const levelInfo = getLevelInfo(stats?.level || 1);
  const LevelIcon = levelInfo?.icon || BookOpen;

  return (
    <div className="space-y-6">
      {/* XP & Level Card */}
      <Card className="border-border/60 shadow-lg overflow-hidden">
        <div className="h-2 w-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500" />
        <CardHeader className="border-b border-border/60 bg-gradient-to-r from-green-500/5 to-emerald-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle>Your Progress</CardTitle>
                <CardDescription>Level up by completing lessons and courses</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleRefresh} className="h-8 w-8">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Main Stats Display */}
          <div className={`grid grid-cols-1 ${compact ? '' : 'md:grid-cols-2'} gap-6 mb-8`}>
            {/* Level & XP */}
            <div className="relative p-6 rounded-2xl bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 border border-green-500/20">
              <div className="absolute top-4 right-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-white">{stats?.level || 1}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <LevelIcon className={`h-5 w-5 ${levelInfo.color}`} />
                <span className={`text-sm font-semibold ${levelInfo.color}`}>Level {stats?.level || 1}</span>
              </div>

              <h3 className="text-xl font-bold text-foreground mb-1">
                {stats?.title || levelInfo.name}
              </h3>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">XP Progress</span>
                  <span className="font-semibold text-green-600">
                    {stats?.xpProgress || 0} / {stats?.xpNeeded || 100} XP
                  </span>
                </div>
                <Progress
                  value={stats?.progressPercentage || 0}
                  className="h-3 bg-green-500/20"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {(stats?.xpNeeded || 100) - (stats?.xpProgress || 0)} XP to next level
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-green-500/20">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="h-4 w-4 text-green-500" />
                  <span>Total XP: <span className="font-semibold text-foreground">{stats?.xp || 0}</span></span>
                </div>
              </div>
            </div>

            {/* Streak & Stats */}
            <div className="space-y-4">
              {/* Current Streak */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                      <Flame className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Current Streak</p>
                      <p className="text-2xl font-bold text-amber-600">{stats?.currentStreak || 0} days</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Best</p>
                    <p className="text-lg font-semibold text-foreground">{stats?.longestStreak || 0} days</p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="h-4 w-4 text-teal-600" />
                    <span className="text-xs text-muted-foreground">Lessons</span>
                  </div>
                  <p className="text-xl font-bold text-teal-600">{stats?.totalLessonsCompleted || 0}</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs text-muted-foreground">Courses</span>
                  </div>
                  <p className="text-xl font-bold text-emerald-600">{stats?.totalCoursesCompleted || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* XP Rewards Info */}
          {showXPRewards && (
            <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-green-500" />
                How to Earn XP
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600">+{XP_REWARDS.lessonComplete}</Badge>
                  <span className="text-muted-foreground">Per lesson</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">+{XP_REWARDS.courseComplete}</Badge>
                  <span className="text-muted-foreground">Per course</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">+{XP_REWARDS.dailyStreak}</Badge>
                  <span className="text-muted-foreground">Daily streak</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary" className="bg-teal-500/10 text-teal-600">+{XP_REWARDS.quiz}</Badge>
                  <span className="text-muted-foreground">Quiz bonus</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements Card */}
      <Card className="border-border/60 shadow-lg overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500" />
        <CardHeader className="border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center">
                <Medal className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Achievements</CardTitle>
                <CardDescription>
                  {stats?.achievements?.length || 0} / {ALL_ACHIEVEMENTS.length} unlocked
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className={`grid grid-cols-2 ${compact ? 'md:grid-cols-3' : 'md:grid-cols-5'} gap-3`}>
            {ALL_ACHIEVEMENTS.map((achievement) => {
              const unlocked = isAchievementUnlocked(achievement.id);
              return (
                <div
                  key={achievement.id}
                  className={`relative p-4 rounded-xl border text-center transition-all duration-300 ${
                    unlocked
                      ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30'
                      : 'bg-muted/30 border-border/60 opacity-60 grayscale'
                  }`}
                >
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <p className="text-xs font-semibold text-foreground line-clamp-1">{achievement.name}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{achievement.description}</p>
                  <Badge
                    variant="secondary"
                    className={`mt-2 text-xs ${unlocked ? 'bg-green-500/20 text-green-600' : ''}`}
                  >
                    +{achievement.xpReward} XP
                  </Badge>
                  {unlocked && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default XPAchievements;
