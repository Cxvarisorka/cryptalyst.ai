import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, TrendingUp, DollarSign, Loader2, CheckCircle, Clock, Users, Star, Award, Zap, ArrowRight, Sparkles } from 'lucide-react';
import { FadeIn } from '@/components/magicui/fade-in';
import Hero from '@/components/layout/Hero';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { courseService } from '@/services/course.service';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const CourseCard = ({ course, enrolledCourses, onEnroll, user }) => {
  const navigate = useNavigate();
  const enrollment = enrolledCourses?.find((e) => e.courseId._id === course._id);
  const isEnrolled = !!enrollment;

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

  const categoryIcons = {
    crypto: TrendingUp,
    stocks: DollarSign,
    trading: BookOpen,
    fundamentals: BookOpen,
    'technical-analysis': TrendingUp,
  };

  const config = difficultyConfig[course.difficulty] || difficultyConfig.beginner;
  const CategoryIcon = categoryIcons[course.category] || BookOpen;
  const DifficultyIcon = config.icon;

  return (
    <Card className="group relative overflow-hidden bg-gradient-to-br from-card to-card/50 border-border/60 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
      {/* Animated gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

      {/* Top accent bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${config.color}`} />

      <CardHeader className="relative pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${config.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <CategoryIcon className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="secondary" className="text-xs font-semibold">
              {course.category}
            </Badge>
            {isEnrolled && enrollment.progressPercentage === 100 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                <span className="text-xs font-medium text-green-600 dark:text-green-400">
                  Completed
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
              <p className="text-xs">minutes</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">{course.totalLessons || 0}</p>
              <p className="text-xs">lessons</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Users className="h-3.5 w-3.5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">{course.enrolledCount || 0}</p>
              <p className="text-xs">students</p>
            </div>
          </div>
        </div>

        {/* Difficulty Badge */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${config.bg} border ${config.border}`}>
            <DifficultyIcon className={`h-3.5 w-3.5 ${config.text}`} />
            <span className={`text-xs font-semibold ${config.text} capitalize`}>
              {course.difficulty}
            </span>
          </div>
        </div>

        {/* Progress or Enroll */}
        {isEnrolled ? (
          <div className="space-y-3 pt-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Your Progress</span>
                <span className={`font-bold ${enrollment.progressPercentage === 100 ? 'text-green-600' : 'text-primary'}`}>
                  {enrollment.progressPercentage}%
                </span>
              </div>
              <Progress value={enrollment.progressPercentage} className="h-2.5" />
            </div>
            <Button
              onClick={() => navigate(`/learn/course/${course._id}`)}
              className="w-full group/btn relative overflow-hidden bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/50"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {enrollment.progressPercentage === 100 ? 'Review Course' : 'Continue Learning'}
                <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
              </span>
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => onEnroll(course._id)}
            variant="default"
            className="w-full group/btn relative overflow-hidden"
            disabled={!user}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {user ? 'Enroll Now' : 'Sign in to Enroll'}
              <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
            </span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

const Learn = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchCourses();
    if (user) {
      fetchEnrolledCourses();
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getAllCourses();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch courses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      const data = await courseService.getMyEnrolledCourses();
      setEnrolledCourses(data);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    }
  };

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
      fetchEnrolledCourses();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to enroll in course',
        variant: 'destructive',
      });
    }
  };

  const categories = [
    { id: 'all', name: 'All Courses', icon: Sparkles },
    { id: 'crypto', name: 'Cryptocurrency', icon: TrendingUp },
    { id: 'stocks', name: 'Stocks', icon: DollarSign },
    { id: 'trading', name: 'Trading', icon: Star },
    { id: 'fundamentals', name: 'Fundamentals', icon: BookOpen },
    { id: 'technical-analysis', name: 'Technical Analysis', icon: Award },
  ];

  const filteredCourses =
    activeTab === 'all' ? courses : courses.filter((c) => c.category === activeTab);

  const inProgressCourses = enrolledCourses.filter(
    (e) => e.progressPercentage > 0 && e.progressPercentage < 100
  );
  const completedCourses = enrolledCourses.filter((e) => e.progressPercentage === 100);

  const heroIcons = [
    { Icon: BookOpen, gradient: 'bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <Hero
          title="Learn Trading & Investing"
          subtitle="Master crypto, stocks, and trading strategies with expert-led interactive courses"
          icons={heroIcons}
          showSingleIcon={true}
          align="left"
          size="medium"
        />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-10">
        <FadeIn>
          {/* My Learning Dashboard (for logged-in users with enrollments) */}
          {user && enrolledCourses.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    My Learning
                  </h2>
                  <p className="text-muted-foreground mt-1">Continue where you left off</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-muted-foreground">
                      {inProgressCourses.length} In Progress
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-muted-foreground">
                      {completedCourses.length} Completed
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.slice(0, 6).map((enrollment) => (
                  <CourseCard
                    key={enrollment.courseId._id}
                    course={enrollment.courseId}
                    enrolledCourses={enrolledCourses}
                    onEnroll={handleEnroll}
                    user={user}
                  />
                ))}
              </div>

              {enrolledCourses.length > 6 && (
                <div className="mt-6 text-center">
                  <Button variant="outline" size="lg" className="group">
                    View All My Courses ({enrolledCourses.length})
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
                {user && enrolledCourses.length > 0 ? 'Explore More Courses' : 'Browse Courses'}
              </h2>
              <p className="text-muted-foreground mt-1">
                {courses.length} courses available • All skill levels
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
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                  <p className="mt-4 text-muted-foreground">Loading courses...</p>
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
                  <p className="text-lg font-medium text-muted-foreground">No courses available in this category</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Check back later for new courses or explore other categories
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setActiveTab('all')}
                  >
                    View All Courses
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  );
};

export default Learn;
