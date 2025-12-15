import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  TrendingUp,
  DollarSign,
  Loader2,
  CheckCircle,
  Clock,
  Users,
  Star,
  Award,
  Zap,
  ArrowRight,
  Sparkles,
  Lock,
  Crown,
  Trophy,
  Flame,
  Target,
  Medal,
  GraduationCap
} from 'lucide-react';
import { FadeIn } from '@/components/magicui/fade-in';
import Hero from '@/components/layout/Hero';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { courseService } from '@/services/course.service';
import settingsService from '@/services/settings.service';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

// Helper to normalize keys (e.g., "Technical Analysis" -> "technical-analysis")
const normalizeKey = (str) => {
  if (!str) return '';
  return str.toLowerCase().replace(/\s+/g, '-');
};

const CourseCard = ({ course, enrolledCourses, onEnroll, user }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  
  // Safety check: ensure course exists
  if (!course) return null;

  const enrollment = enrolledCourses?.find((e) => e?.courseId?._id === course._id);
  const isEnrolled = !!enrollment;

  // Check if user has access to this course tier
  const tierHierarchy = { free: 0, basic: 1, premium: 2 };
  const userPlan = user?.subscription?.plan || 'free';
  const courseTier = course.tier || 'free';
  const userTierLevel = tierHierarchy[userPlan] || 0;
  const courseTierLevel = tierHierarchy[courseTier] || 0;
  const hasAccess = userTierLevel >= courseTierLevel;
  const isLocked = !hasAccess;

  const difficultyConfig = {
    beginner: {
      color: 'from-emerald-500 to-teal-500',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/20',
      icon: Sparkles
    },
    intermediate: {
      color: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-500/10',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-500/20',
      icon: Zap
    },
    advanced: {
      color: 'from-rose-500 to-pink-500',
      bg: 'bg-rose-500/10',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-500/20',
      icon: Award
    },
  };

  const tierConfig = useMemo(() => ({
    free: {
      label: t('learn.free') || 'Free',
      color: 'text-muted-foreground',
      bg: 'bg-muted',
      icon: null,
    },
    basic: {
      label: t('learn.basic') || 'Basic',
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      icon: Sparkles,
    },
    premium: {
      label: t('learn.premium') || 'Premium',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-gradient-to-r from-amber-500/10 to-orange-500/10',
      border: 'border-amber-500/20',
      icon: Crown,
    },
  }), [t, i18n.language]);

  const categoryIcons = {
    crypto: TrendingUp,
    stocks: DollarSign,
    trading: BookOpen,
    fundamentals: BookOpen,
    'technical-analysis': TrendingUp,
  };

  const categoryTranslations = useMemo(() => ({
    crypto: t('learn.cryptocurrency'),
    stocks: t('learn.stocks'),
    trading: t('learn.trading'),
    fundamentals: t('learn.fundamentals'),
    'technical-analysis': t('learn.technicalAnalysis'),
  }), [t, i18n.language]);

  const difficultyTranslations = useMemo(() => ({
    beginner: t('learn.beginner'),
    intermediate: t('learn.intermediate'),
    advanced: t('learn.advanced'),
  }), [t, i18n.language]);

  // Normalize keys to ensure matches even if backend case differs
  const normalizedDifficulty = normalizeKey(course.difficulty);
  const normalizedCategory = normalizeKey(course.category);

  const config = difficultyConfig[normalizedDifficulty] || difficultyConfig.beginner;
  const CategoryIcon = categoryIcons[normalizedCategory] || BookOpen;
  const DifficultyIcon = config.icon;
  const TierIcon = tierConfig[courseTier]?.icon;

  return (
    <Card className={`group relative overflow-hidden bg-gradient-to-br from-card to-card/50 border-border/60 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 ${isLocked ? 'opacity-75' : ''}`}>
      {/* Animated gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

      {/* Locked overlay */}
      {isLocked && (
        <div className="absolute top-4 left-4 z-10 flex items-center gap-1 px-3 py-1.5 rounded-full bg-background/95 backdrop-blur-sm border border-border shadow-lg">
          <Lock className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
            {tierConfig[courseTier]?.label} {t('learn.required')}
          </span>
        </div>
      )}

      {/* Top accent bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${config.color}`} />

      <CardHeader className="relative pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${config.color} shadow-lg group-hover:scale-110 transition-transform duration-300 ${isLocked ? 'opacity-50' : ''}`}>
            <CategoryIcon className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs font-semibold">
                {categoryTranslations[normalizedCategory] || course.category}
              </Badge>
              {courseTier !== 'free' && TierIcon && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${tierConfig[courseTier].bg} border ${tierConfig[courseTier].border}`}>
                  <TierIcon className={`h-3 w-3 ${tierConfig[courseTier].color}`} />
                  <span className={`text-xs font-semibold ${tierConfig[courseTier].color}`}>
                    {tierConfig[courseTier].label}
                  </span>
                </div>
              )}
            </div>
            {isEnrolled && enrollment.progressPercentage === 100 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                <span className="text-xs font-medium text-green-600 dark:text-green-400">
                  {t('learn.completed')}
                </span>
              </div>
            )}
          </div>
        </div>

        <CardTitle className="text-xl line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </CardTitle>
        <CardDescription className="line-clamp-2 text-muted-foreground/80">
          {course.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 relative">
        {/* Course Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Clock className="h-3.5 w-3.5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">{course.estimatedDuration || 0}</p>
              <p className="text-xs">{t('learn.minutes')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">{course.totalLessons || 0}</p>
              <p className="text-xs">{t('learn.lessons')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Users className="h-3.5 w-3.5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">{course.enrolledCount || 0}</p>
              <p className="text-xs">{t('learn.students')}</p>
            </div>
          </div>
        </div>

        {/* Difficulty Badge */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${config.bg} border ${config.border}`}>
            <DifficultyIcon className={`h-3.5 w-3.5 ${config.text}`} />
            <span className={`text-xs font-semibold ${config.text}`}>
              {difficultyTranslations[normalizedDifficulty] || course.difficulty}
            </span>
          </div>
        </div>

        {/* Progress or Enroll */}
        {isEnrolled ? (
          <div className="space-y-3 pt-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">{t('learn.yourProgress')}</span>
                <span className={`font-bold ${enrollment.progressPercentage === 100 ? 'text-green-600' : 'text-primary'}`}>
                  {enrollment.progressPercentage}%
                </span>
              </div>
              <Progress value={enrollment.progressPercentage} className="h-2.5" />
            </div>
            <Button
              onClick={() => navigate(`/learn/course/${course._id}`)}
              className="w-full group/btn relative overflow-hidden bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/50"
              disabled={isLocked}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLocked ? (
                  <>
                    <Lock className="h-4 w-4" />
                    {t('learn.upgradeToAccess')}
                  </>
                ) : (
                  <>
                    {enrollment.progressPercentage === 100 ? t('learn.reviewCourse') : t('learn.continuelearning')}
                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => isLocked ? navigate('/pricing') : onEnroll(course._id)}
            variant={isLocked ? "outline" : "default"}
            className="w-full group/btn relative overflow-hidden"
            disabled={!user && !isLocked && false} // Logic adjusted: Let guests click to trigger auth redirect
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isLocked ? (
                <>
                  <Lock className="h-4 w-4" />
                  {t('learn.upgradeTo')} {tierConfig[courseTier]?.label}
                </>
              ) : user ? (
                <>
                  {t('learn.enrollNow')}
                  <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </>
              ) : (
                <>
                  {t('learn.signInToEnroll')}
                  <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </>
              )}
            </span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

// Level titles for display
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
const ALL_ACHIEVEMENTS = [
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

const Learn = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [learningStats, setLearningStats] = useState(null);

  // Load Data Effect
  useEffect(() => {
    // Only proceed if auth loading is finished to avoid false "logged out" state
    if (authLoading) return;

    const loadData = async () => {
      try {
        setDataLoading(true);
        const currentLanguage = i18n.language || 'en';

        // Parallel fetching
        const promises = [courseService.getAllCourses({ language: currentLanguage })];
        if (user) {
          promises.push(courseService.getMyEnrolledCourses(currentLanguage));
          promises.push(settingsService.getLearningStats().catch(() => null));
        }

        const results = await Promise.all(promises);
        setCourses(results[0] || []);

        if (user) {
          setEnrolledCourses(results[1] || []);
          if (results[2]?.stats) {
            setLearningStats(results[2].stats);
          }
        } else {
          setEnrolledCourses([]);
          setLearningStats(null);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch courses',
          variant: 'destructive',
        });
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, [user, i18n.language, authLoading, toast]);

  const handleEnroll = async (courseId) => {
    if (!user) {
      navigate('/signin');
      return;
    }

    try {
      await courseService.enrollCourse(courseId);
      toast({
        title: 'Success!',
        description: 'Successfully enrolled in course. Start learning now!',
      });
      // Refresh enrollments
      const currentLanguage = i18n.language || 'en';
      const data = await courseService.getMyEnrolledCourses(currentLanguage);
      setEnrolledCourses(data);
    } catch (error) {
      if (error.response?.status === 403) {
        toast({
          title: 'Upgrade Required',
          description: error.response?.data?.message || 'You need to upgrade your subscription to access this course',
          variant: 'destructive',
          action: {
            label: 'View Plans',
            onClick: () => navigate('/pricing'),
          },
        });
      } else {
        toast({
          title: 'Error',
          description: error.message || 'Failed to enroll in course',
          variant: 'destructive',
        });
      }
    }
  };

  const categories = useMemo(() => [
    { id: 'all', name: t('learn.allCourses'), icon: Sparkles },
    { id: 'crypto', name: t('learn.cryptocurrency'), icon: TrendingUp },
    { id: 'stocks', name: t('learn.stocks'), icon: DollarSign },
    { id: 'trading', name: t('learn.trading'), icon: Star },
    { id: 'fundamentals', name: t('learn.fundamentals'), icon: BookOpen },
    { id: 'technical-analysis', name: t('learn.technicalAnalysis'), icon: Award },
  ], [t, i18n.language]);

  // Optimize Filtering
  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    return activeTab === 'all' 
      ? courses 
      : courses.filter((c) => normalizeKey(c.category) === normalizeKey(activeTab));
  }, [activeTab, courses]);

  // Optimize Sorting & Safety Check
  const sortedEnrolledCourses = useMemo(() => {
    if (!enrolledCourses || enrolledCourses.length === 0) return [];
    
    // Filter out corrupted data (where courseId is null)
    const validEnrollments = enrolledCourses.filter(e => e && e.courseId);

    const inProgress = validEnrollments.filter(
      (e) => e.progressPercentage > 0 && e.progressPercentage < 100
    );
    const completed = validEnrollments.filter((e) => e.progressPercentage === 100);
    const notStarted = validEnrollments.filter((e) => e.progressPercentage === 0);

    return [
      ...inProgress,
      ...notStarted,
      ...completed
    ];
  }, [enrolledCourses]);

  const heroIcons = [
    { Icon: BookOpen, gradient: 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500' },
  ];

  // Helper to get level info
  const getLevelInfo = (level) => {
    const levels = Object.keys(LEVEL_TITLES).map(Number).sort((a, b) => b - a);
    for (const l of levels) {
      if (level >= l) return LEVEL_TITLES[l];
    }
    return LEVEL_TITLES[1];
  };

  // Check if achievement is unlocked
  const isAchievementUnlocked = (achievementId) => {
    return learningStats?.achievements?.some(a => a.id === achievementId) || false;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <Hero
          title={t('learn.title')}
          subtitle={t('learn.subtitle')}
          icons={heroIcons}
          showSingleIcon={true}
          align="left"
          size="medium"
        />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-10">
        <FadeIn>
          {/* Main Tabs - Courses / XP & Achievements */}
          {user && (
            <Tabs defaultValue="courses" className="mb-8">
              <TabsList className="bg-card/80 backdrop-blur-sm border border-border/60 p-1 rounded-xl mb-6">
                <TabsTrigger
                  value="courses"
                  className="flex items-center gap-2 px-6 py-3 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground"
                >
                  <BookOpen className="h-4 w-4" />
                  Courses
                </TabsTrigger>
                <TabsTrigger
                  value="xp-achievements"
                  className="flex items-center gap-2 px-6 py-3 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white"
                >
                  <Trophy className="h-4 w-4" />
                  XP & Achievements
                </TabsTrigger>
              </TabsList>

              {/* XP & Achievements Tab Content */}
              <TabsContent value="xp-achievements" className="mt-0">
                <div className="space-y-6">
                  {/* XP & Level Card */}
                  <Card className="border-border/60 shadow-lg overflow-hidden">
                    <div className="h-2 w-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500" />
                    <CardHeader className="border-b border-border/60 bg-gradient-to-r from-green-500/5 to-emerald-500/5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                          <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle>Your Progress</CardTitle>
                          <CardDescription>Level up by completing lessons and courses</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {/* Main Stats Display */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Level & XP */}
                        <div className="relative p-6 rounded-2xl bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 border border-green-500/20">
                          <div className="absolute top-4 right-4">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                              <span className="text-2xl font-bold text-white">{learningStats?.level || 1}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-2">
                            <Star className="h-5 w-5 text-green-500" />
                            <span className="text-sm font-semibold text-green-600">Level {learningStats?.level || 1}</span>
                          </div>

                          <h3 className="text-xl font-bold text-foreground mb-1">
                            {learningStats?.title || 'Novice Trader'}
                          </h3>

                          <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">XP Progress</span>
                              <span className="font-semibold text-green-600">
                                {learningStats?.xpProgress || 0} / {learningStats?.xpNeeded || 100} XP
                              </span>
                            </div>
                            <Progress
                              value={learningStats?.progressPercentage || 0}
                              className="h-3 bg-green-500/20"
                            />
                            <p className="text-xs text-muted-foreground text-right">
                              {(learningStats?.xpNeeded || 100) - (learningStats?.xpProgress || 0)} XP to next level
                            </p>
                          </div>

                          <div className="mt-4 pt-4 border-t border-green-500/20">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Zap className="h-4 w-4 text-green-500" />
                              <span>Total XP: <span className="font-semibold text-foreground">{learningStats?.xp || 0}</span></span>
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
                                  <p className="text-2xl font-bold text-amber-600">{learningStats?.currentStreak || 0} days</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground">Best</p>
                                <p className="text-lg font-semibold text-foreground">{learningStats?.longestStreak || 0} days</p>
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
                              <p className="text-xl font-bold text-teal-600">{learningStats?.totalLessonsCompleted || 0}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                              <div className="flex items-center gap-2 mb-1">
                                <Trophy className="h-4 w-4 text-emerald-600" />
                                <span className="text-xs text-muted-foreground">Courses</span>
                              </div>
                              <p className="text-xl font-bold text-emerald-600">{learningStats?.totalCoursesCompleted || 0}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* XP Rewards Info */}
                      <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                          <Zap className="h-4 w-4 text-green-500" />
                          How to Earn XP
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Badge variant="secondary" className="bg-green-500/10 text-green-600">+25</Badge>
                            <span className="text-muted-foreground">Per lesson</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">+100</Badge>
                            <span className="text-muted-foreground">Per course</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">+10</Badge>
                            <span className="text-muted-foreground">Daily streak</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Badge variant="secondary" className="bg-teal-500/10 text-teal-600">+15</Badge>
                            <span className="text-muted-foreground">Quiz bonus</span>
                          </div>
                        </div>
                      </div>
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
                              {learningStats?.achievements?.length || 0} / {ALL_ACHIEVEMENTS.length} unlocked
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
              </TabsContent>

              {/* Courses Tab Content */}
              <TabsContent value="courses" className="mt-0">
                {/* My Learning Dashboard */}
                {sortedEnrolledCourses.length > 0 && (
                  <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                          {t('learn.myLearning')}
                        </h2>
                        <p className="text-muted-foreground mt-1">{t('learn.continueMessage')}</p>
                      </div>
                      {/* Stats indicators */}
                      <div className="flex items-center gap-4 text-sm hidden sm:flex">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-primary" />
                          <span className="text-muted-foreground">
                            {sortedEnrolledCourses.filter(c => c.progressPercentage > 0 && c.progressPercentage < 100).length} {t('learn.inProgress')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          <span className="text-muted-foreground">
                            {sortedEnrolledCourses.filter(c => c.progressPercentage === 100).length} {t('learn.completed')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {sortedEnrolledCourses.slice(0, 6).map((enrollment) => (
                        <CourseCard
                          key={enrollment.courseId?._id || `enroll-${Math.random()}`}
                          course={enrollment.courseId}
                          enrolledCourses={enrolledCourses}
                          onEnroll={handleEnroll}
                          user={user}
                        />
                      ))}
                    </div>

                    {sortedEnrolledCourses.length > 6 && (
                      <div className="mt-6 text-center">
                        <Button variant="outline" size="lg" className="group">
                          {t('learn.viewAllMyCourses')} ({sortedEnrolledCourses.length})
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Browse All Courses */}
                <div>
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                      {enrolledCourses.length > 0 ? t('learn.exploreCourses') : t('learn.browseCourses')}
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      {courses.length} {t('learn.coursesAvailable')} • {t('learn.allSkillLevels')}
                    </p>
                  </div>

                  {/* Category Tabs */}
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
                    <TabsList className="bg-muted/40 backdrop-blur-sm w-full h-auto flex flex-wrap justify-start gap-2 p-2 rounded-xl border border-border/50">
                      {categories.map((category) => {
                        const Icon = category.icon;
                        return (
                          <TabsTrigger
                            key={category.id}
                            value={category.id}
                            className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
                          >
                            <Icon className="h-4 w-4" />
                            {category.name}
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>
                  </Tabs>

                  {/* Course Grid */}
                  {dataLoading ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                        <p className="mt-4 text-muted-foreground">{t('learn.loadingCourses')}</p>
                      </div>
                    </div>
                  ) : filteredCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredCourses.map((course) => (
                        <CourseCard
                          key={course._id}
                          course={course}
                          enrolledCourses={enrolledCourses}
                          onEnroll={handleEnroll}
                          user={user}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card className="border-dashed">
                      <CardContent className="py-20 text-center">
                        <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium text-muted-foreground">{t('learn.noCourses')}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {t('learn.checkBackLater')}
                        </p>
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => setActiveTab('all')}
                        >
                          {t('learn.viewAllCourses')}
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}

          {/* Content for non-logged in users (no tabs) */}
          {!user && (
            <>
              {/* Browse All Courses */}
              <div>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                    {t('learn.browseCourses')}
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    {courses.length} {t('learn.coursesAvailable')} • {t('learn.allSkillLevels')}
                  </p>
                </div>

                {/* Category Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
                  <TabsList className="bg-muted/40 backdrop-blur-sm w-full h-auto flex flex-wrap justify-start gap-2 p-2 rounded-xl border border-border/50">
                    {categories.map((category) => {
                      const Icon = category.icon;
                      return (
                        <TabsTrigger
                          key={category.id}
                          value={category.id}
                          className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
                        >
                          <Icon className="h-4 w-4" />
                          {category.name}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </Tabs>

                {/* Course Grid */}
                {dataLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                      <p className="mt-4 text-muted-foreground">{t('learn.loadingCourses')}</p>
                    </div>
                  </div>
                ) : filteredCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => (
                      <CourseCard
                        key={course._id}
                        course={course}
                        enrolledCourses={enrolledCourses}
                        onEnroll={handleEnroll}
                        user={user}
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="py-20 text-center">
                      <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium text-muted-foreground">{t('learn.noCourses')}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {t('learn.checkBackLater')}
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setActiveTab('all')}
                      >
                        {t('learn.viewAllCourses')}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </FadeIn>
      </div>
    </div>
  );
};

export default Learn;