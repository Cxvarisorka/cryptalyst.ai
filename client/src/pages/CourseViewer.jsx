import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
  Lock,
  Loader2,
  BookOpen,
  Trophy,
  ArrowLeft,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { courseService } from '@/services/course.service';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useCelebration } from '@/components/ui/celebration';

const LessonContent = ({ lesson, onComplete, isCompleted }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [userCode, setUserCode] = useState(lesson.interactiveContent?.initialCode || '');

  const handleQuizSubmit = () => {
    setShowResults(true);
    const correct = lesson.quiz.questions.every(
      (q, idx) => q.correctAnswer === selectedAnswer
    );
    if (correct && !isCompleted) {
      onComplete(100);
    }
  };

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {/* Text Content */}
      {lesson.contentType === 'text' && (
        <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
      )}

      {/* Interactive Code Exercise */}
      {lesson.contentType === 'interactive' && lesson.interactiveContent && (
        <div className="space-y-4 not-prose">
          <div dangerouslySetInnerHTML={{ __html: lesson.content }} className="prose dark:prose-invert" />

          <div className="bg-muted rounded-lg p-4">
            <h4 className="font-semibold mb-2">Try it yourself:</h4>
            <textarea
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              className="w-full h-48 p-3 font-mono text-sm bg-background border border-border rounded-md"
              placeholder="Write your code here..."
            />
            {lesson.interactiveContent.hints && lesson.interactiveContent.hints.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                  Show Hints
                </summary>
                <ul className="mt-2 space-y-1 text-sm">
                  {lesson.interactiveContent.hints.map((hint, idx) => (
                    <li key={idx} className="text-muted-foreground">
                      {hint}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        </div>
      )}

      {/* Quiz */}
      {lesson.contentType === 'quiz' && lesson.quiz && (
        <div className="space-y-6 not-prose">
          <div dangerouslySetInnerHTML={{ __html: lesson.content }} className="prose dark:prose-invert" />

          {lesson.quiz.questions.map((question, idx) => (
            <Card key={idx} className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">{question.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {question.options.map((option, optionIdx) => {
                    const isCorrect = optionIdx === question.correctAnswer;
                    const isSelected = selectedAnswer === optionIdx;

                    return (
                      <button
                        key={optionIdx}
                        onClick={() => !showResults && setSelectedAnswer(optionIdx)}
                        disabled={showResults}
                        className={cn(
                          'w-full text-left p-3 rounded-lg border-2 transition-all',
                          !showResults && 'hover:border-primary cursor-pointer',
                          !showResults && isSelected && 'border-primary bg-primary/10',
                          !showResults && !isSelected && 'border-border',
                          showResults && isCorrect && 'border-green-500 bg-green-500/10',
                          showResults && !isCorrect && isSelected && 'border-red-500 bg-red-500/10',
                          showResults && !isCorrect && !isSelected && 'border-border opacity-50'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option}</span>
                          {showResults && isCorrect && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {showResults && question.explanation && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">{question.explanation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {!showResults && (
            <Button
              onClick={handleQuizSubmit}
              disabled={selectedAnswer === null}
              className="w-full"
            >
              Submit Quiz
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

const CourseViewer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const {
    showXPGain,
    showLevelUp,
    showCourseComplete,
    showAchievement,
    CelebrationComponents
  } = useCelebration();

  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }
    fetchCourseData();
  }, [courseId, user, i18n.language]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const currentLanguage = i18n.language || 'en';
      const [courseData, progressData] = await Promise.all([
        courseService.getCourseById(courseId, currentLanguage),
        courseService.getCourseProgress(courseId).catch(() => null),
      ]);

      setCourse(courseData);
      setProgress(progressData);

      // Set initial lesson
      if (progressData?.currentLessonId) {
        const lesson = findLessonById(courseData, progressData.currentLessonId);
        setCurrentLesson(lesson);
      } else if (courseData.sections?.[0]?.lessons?.[0]) {
        setCurrentLesson(courseData.sections[0].lessons[0]);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast({
        title: 'Error',
        description: 'Failed to load course',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const findLessonById = (courseData, lessonId) => {
    for (const section of courseData.sections || []) {
      const lesson = section.lessons.find((l) => l._id === lessonId);
      if (lesson) return lesson;
    }
    return null;
  };

  const isLessonCompleted = (lessonId) => {
    return progress?.completedLessons?.some((l) => l.lessonId === lessonId);
  };

  const handleCompleteLesson = async (score = null) => {
    if (!currentLesson || completing) return;

    try {
      setCompleting(true);
      const result = await courseService.completeLesson(courseId, currentLesson._id, score);
      setProgress(result.data);

      // Handle XP and celebration effects
      if (result.xp) {
        // Show XP gain popup
        showXPGain(result.xp.xpAwarded);

        // Show achievements if any unlocked
        if (result.xp.newAchievements && result.xp.newAchievements.length > 0) {
          // Show each achievement with a delay
          result.xp.newAchievements.forEach((achievement, index) => {
            setTimeout(() => {
              showAchievement(achievement);
            }, 2500 + index * 4000);
          });
        }

        // Show level up if user leveled up
        if (result.xp.leveledUp) {
          setTimeout(() => {
            showLevelUp(result.xp.level, result.xp.title || 'New Level!');
          }, 2000);
        }
      }

      // Show course complete celebration if course is finished
      if (result.courseCompleted) {
        setTimeout(() => {
          showCourseComplete(course?.title || 'Course', result.xp?.xpAwarded || 100);
        }, result.xp?.leveledUp ? 7000 : 2500);
      } else {
        toast({
          title: 'Lesson Complete!',
          description: `Great job! +${result.xp?.xpAwarded || 25} XP earned`,
        });
        // Move to next lesson only if course not completed
        goToNextLesson();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to complete lesson',
        variant: 'destructive',
      });
    } finally {
      setCompleting(false);
    }
  };

  const goToNextLesson = () => {
    const allLessons = getAllLessons();
    const currentIndex = allLessons.findIndex((l) => l._id === currentLesson._id);
    if (currentIndex < allLessons.length - 1) {
      setCurrentLesson(allLessons[currentIndex + 1]);
    }
  };

  const goToPreviousLesson = () => {
    const allLessons = getAllLessons();
    const currentIndex = allLessons.findIndex((l) => l._id === currentLesson._id);
    if (currentIndex > 0) {
      setCurrentLesson(allLessons[currentIndex - 1]);
    }
  };

  const getAllLessons = () => {
    return course?.sections?.flatMap((s) => s.lessons) || [];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course || !currentLesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Course not found</p>
          <Button onClick={() => navigate('/learn')} className="mt-4">
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  const allLessons = getAllLessons();
  const currentLessonIndex = allLessons.findIndex((l) => l._id === currentLesson._id);
  const isFirstLesson = currentLessonIndex === 0;
  const isLastLesson = currentLessonIndex === allLessons.length - 1;
  const isCurrentLessonCompleted = isLessonCompleted(currentLesson._id);

  return (
    <div className="min-h-screen bg-background">
      {/* Celebration Effects */}
      <CelebrationComponents />

      {/* Top Bar */}
      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/learn')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {progress?.progressPercentage || 0}% Complete
              </div>
              <Progress value={progress?.progressPercentage || 0} className="w-32" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Course Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">{course.title}</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="space-y-4">
                  {course.sections.map((section, sectionIdx) => (
                    <div key={section._id}>
                      <h4 className="font-semibold text-sm mb-2">
                        {sectionIdx + 1}. {section.title}
                      </h4>
                      <div className="space-y-1 ml-4">
                        {section.lessons.map((lesson) => {
                          const completed = isLessonCompleted(lesson._id);
                          const isCurrent = lesson._id === currentLesson._id;

                          return (
                            <button
                              key={lesson._id}
                              onClick={() => setCurrentLesson(lesson)}
                              className={cn(
                                'w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors',
                                isCurrent && 'bg-primary text-primary-foreground',
                                !isCurrent && 'hover:bg-muted'
                              )}
                            >
                              {completed ? (
                                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              ) : (
                                <Circle className="h-4 w-4 flex-shrink-0" />
                              )}
                              <span className="truncate">{lesson.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{currentLesson.title}</CardTitle>
                  {isCurrentLessonCompleted && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <LessonContent
                  lesson={currentLesson}
                  onComplete={handleCompleteLesson}
                  isCompleted={isCurrentLessonCompleted}
                />

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={goToPreviousLesson}
                    disabled={isFirstLesson}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>

                  {!isCurrentLessonCompleted ? (
                    <Button onClick={() => handleCompleteLesson()} disabled={completing}>
                      {completing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Completing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Complete
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button onClick={goToNextLesson} disabled={isLastLesson}>
                      {isLastLesson ? (
                        <>
                          <Trophy className="h-4 w-4 mr-2" />
                          Course Complete!
                        </>
                      ) : (
                        <>
                          Next Lesson
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseViewer;
