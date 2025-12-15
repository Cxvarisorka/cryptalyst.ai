import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import settingsService from '@/services/settings.service';
import {
  GraduationCap,
  Trophy,
  Flame,
  Target,
  Star,
  Zap,
  Clock,
  Bell,
  Volume2,
  Sparkles,
  BookOpen,
  Award,
  TrendingUp,
  Medal,
  Crown,
  Loader2,
  CheckCircle,
  Calendar
} from 'lucide-react';

// XP amounts for different activities
const XP_REWARDS = {
  lessonComplete: 25,
  courseComplete: 100,
  dailyStreak: 10,
  achievement: 50,
  quiz: 15
};

// Level titles
const LEVEL_TITLES = {
  1: { name: 'Novice Trader', icon: BookOpen, color: 'text-slate-500' },
  2: { name: 'Apprentice Investor', icon: TrendingUp, color: 'text-green-500' },
  3: { name: 'Market Observer', icon: Target, color: 'text-blue-500' },
  4: { name: 'Chart Reader', icon: TrendingUp, color: 'text-cyan-500' },
  5: { name: 'Trend Spotter', icon: Zap, color: 'text-yellow-500' },
  6: { name: 'Technical Analyst', icon: Award, color: 'text-orange-500' },
  7: { name: 'Portfolio Manager', icon: Star, color: 'text-purple-500' },
  8: { name: 'Strategy Expert', icon: Trophy, color: 'text-pink-500' },
  9: { name: 'Trading Veteran', icon: Medal, color: 'text-red-500' },
  10: { name: 'Market Master', icon: Crown, color: 'text-amber-500' }
};

// Available achievements
const ACHIEVEMENTS = [
  { id: 'first_lesson', name: 'First Steps', description: 'Complete your first lesson', icon: '🎯', xpReward: 50 },
  { id: 'first_course', name: 'Course Complete', description: 'Complete your first course', icon: '📚', xpReward: 100 },
  { id: 'streak_7', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🔥', xpReward: 75 },
  { id: 'streak_30', name: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '⚡', xpReward: 200 },
  { id: 'level_5', name: 'Rising Star', description: 'Reach level 5', icon: '⭐', xpReward: 100 },
  { id: 'level_10', name: 'Expert Trader', description: 'Reach level 10', icon: '👑', xpReward: 250 },
  { id: 'lessons_10', name: 'Dedicated Learner', description: 'Complete 10 lessons', icon: '📖', xpReward: 100 },
  { id: 'lessons_50', name: 'Knowledge Seeker', description: 'Complete 50 lessons', icon: '🎓', xpReward: 300 },
  { id: 'courses_3', name: 'Multi-skilled', description: 'Complete 3 courses', icon: '🏆', xpReward: 150 },
  { id: 'courses_10', name: 'Course Champion', description: 'Complete 10 courses', icon: '💎', xpReward: 500 }
];

const LearningSettings = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState(null);
  const [preferences, setPreferences] = useState({
    dailyGoal: 15,
    reminderEnabled: true,
    reminderTime: '09:00',
    showLeaderboard: true,
    soundEffects: true,
    celebrationAnimations: true
  });

  useEffect(() => {
    loadLearningStats();
  }, []);

  const loadLearningStats = async () => {
    try {
      setLoading(true);
      const response = await settingsService.getLearningStats();
      if (response.success) {
        setStats(response.stats);
        setPreferences(response.stats.preferences || preferences);
      }
    } catch (error) {
      console.error('Error loading learning stats:', error);
      // Set default stats if none exist
      setStats({
        xp: 0,
        level: 1,
        title: 'Novice Trader',
        xpProgress: 0,
        xpNeeded: 100,
        progressPercentage: 0,
        totalLessonsCompleted: 0,
        totalCoursesCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        achievements: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesUpdate = async () => {
    setSaving(true);
    try {
      await settingsService.updateLearning({ preferences });
      toast({
        title: 'Success!',
        description: 'Learning preferences updated successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update learning preferences',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const getLevelInfo = (level) => {
    const levels = Object.keys(LEVEL_TITLES).map(Number).sort((a, b) => b - a);
    for (const l of levels) {
      if (level >= l) return LEVEL_TITLES[l];
    }
    return LEVEL_TITLES[1];
  };

  const isAchievementUnlocked = (achievementId) => {
    return stats?.achievements?.some(a => a.id === achievementId) || false;
  };

  if (loading) {
    return (
      <Card className="border-border/60 shadow-lg">
        <CardContent className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
        <CardHeader className="border-b border-border/60 bg-gradient-to-r from-green-500/5 to-emerald-500/0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle>Your Progress</CardTitle>
              <CardDescription>Track your XP, level, and achievements</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Main Stats Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Level & XP */}
            <div className="relative p-6 rounded-2xl bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 border border-green-500/20">
              <div className="absolute top-4 right-4">
                <div className={`w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-lg`}>
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
                  <span className="font-semibold text-green-500">
                    {stats?.xpProgress || 0} / {stats?.xpNeeded || 100} XP
                  </span>
                </div>
                <Progress
                  value={stats?.progressPercentage || 0}
                  className="h-3 bg-green-500/20"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {stats?.xpNeeded - stats?.xpProgress || 100} XP to next level
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-green-500/20">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span>Total XP: <span className="font-semibold text-foreground">{stats?.xp || 0}</span></span>
                </div>
              </div>
            </div>

            {/* Streak & Stats */}
            <div className="space-y-4">
              {/* Current Streak */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                      <Flame className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Current Streak</p>
                      <p className="text-2xl font-bold text-orange-500">{stats?.currentStreak || 0} days</p>
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
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                    <span className="text-xs text-muted-foreground">Lessons</span>
                  </div>
                  <p className="text-xl font-bold text-blue-500">{stats?.totalLessonsCompleted || 0}</p>
                </div>
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-muted-foreground">Courses</span>
                  </div>
                  <p className="text-xl font-bold text-green-500">{stats?.totalCoursesCompleted || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* XP Rewards Info */}
          <div className="p-4 rounded-xl bg-muted/50 border border-border/60 mb-6">
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              How to Earn XP
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary" className="bg-green-500/10 text-green-500">+{XP_REWARDS.lessonComplete}</Badge>
                <span className="text-muted-foreground">Per lesson</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500">+{XP_REWARDS.courseComplete}</Badge>
                <span className="text-muted-foreground">Per course</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary" className="bg-orange-500/10 text-orange-500">+{XP_REWARDS.dailyStreak}</Badge>
                <span className="text-muted-foreground">Daily streak</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary" className="bg-amber-500/10 text-amber-500">+{XP_REWARDS.achievement}</Badge>
                <span className="text-muted-foreground">Achievement</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements Card */}
      <Card className="border-border/60 shadow-lg overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500" />
        <CardHeader className="border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center">
              <Medal className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Achievements</CardTitle>
              <CardDescription>
                {stats?.achievements?.length || 0} / {ACHIEVEMENTS.length} unlocked
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {ACHIEVEMENTS.map((achievement) => {
              const unlocked = isAchievementUnlocked(achievement.id);
              return (
                <div
                  key={achievement.id}
                  className={`relative p-4 rounded-xl border text-center transition-all duration-300 ${
                    unlocked
                      ? 'bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/30'
                      : 'bg-muted/30 border-border/60 opacity-60 grayscale'
                  }`}
                >
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <p className="text-xs font-semibold text-foreground line-clamp-1">{achievement.name}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{achievement.description}</p>
                  <Badge
                    variant="secondary"
                    className={`mt-2 text-xs ${unlocked ? 'bg-yellow-500/20 text-yellow-600' : ''}`}
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

      {/* Learning Preferences Card */}
      <Card className="border-border/60 shadow-lg overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500" />
        <CardHeader className="border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Learning Preferences</CardTitle>
              <CardDescription>Customize your learning experience</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Daily Goal */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Daily Learning Goal
              </Label>
              <div className="flex items-center gap-4">
                {[5, 10, 15, 30, 60].map((minutes) => (
                  <button
                    key={minutes}
                    onClick={() => setPreferences({ ...preferences, dailyGoal: minutes })}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      preferences.dailyGoal === minutes
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted/50 border-border hover:border-primary/50'
                    }`}
                  >
                    {minutes} min
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Reminder */}
              <div className="flex items-start justify-between p-4 rounded-xl bg-muted/30 border border-border/60">
                <div className="flex items-start gap-3">
                  <Bell className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <Label className="font-semibold">Daily Reminders</Label>
                    <p className="text-sm text-muted-foreground mt-1">Get notified to maintain your streak</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.reminderEnabled}
                  onChange={(e) => setPreferences({ ...preferences, reminderEnabled: e.target.checked })}
                  className="mt-1 h-5 w-5 rounded border-input"
                />
              </div>

              {/* Sound Effects */}
              <div className="flex items-start justify-between p-4 rounded-xl bg-muted/30 border border-border/60">
                <div className="flex items-start gap-3">
                  <Volume2 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <Label className="font-semibold">Sound Effects</Label>
                    <p className="text-sm text-muted-foreground mt-1">Play sounds on XP gains and level ups</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.soundEffects}
                  onChange={(e) => setPreferences({ ...preferences, soundEffects: e.target.checked })}
                  className="mt-1 h-5 w-5 rounded border-input"
                />
              </div>

              {/* Celebration Animations */}
              <div className="flex items-start justify-between p-4 rounded-xl bg-muted/30 border border-border/60">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <Label className="font-semibold">Celebration Animations</Label>
                    <p className="text-sm text-muted-foreground mt-1">Show confetti on achievements</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.celebrationAnimations}
                  onChange={(e) => setPreferences({ ...preferences, celebrationAnimations: e.target.checked })}
                  className="mt-1 h-5 w-5 rounded border-input"
                />
              </div>

              {/* Show Leaderboard */}
              <div className="flex items-start justify-between p-4 rounded-xl bg-muted/30 border border-border/60">
                <div className="flex items-start gap-3">
                  <Award className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <Label className="font-semibold">Show on Leaderboard</Label>
                    <p className="text-sm text-muted-foreground mt-1">Compete with other learners</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.showLeaderboard}
                  onChange={(e) => setPreferences({ ...preferences, showLeaderboard: e.target.checked })}
                  className="mt-1 h-5 w-5 rounded border-input"
                />
              </div>
            </div>

            {/* Reminder Time */}
            {preferences.reminderEnabled && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Reminder Time
                </Label>
                <input
                  type="time"
                  value={preferences.reminderTime}
                  onChange={(e) => setPreferences({ ...preferences, reminderTime: e.target.value })}
                  className="h-11 w-full md:w-48 rounded-md border border-input bg-background px-3 py-2"
                />
              </div>
            )}

            <div className="pt-4">
              <Button
                onClick={handlePreferencesUpdate}
                disabled={saving}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Preferences'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LearningSettings;
