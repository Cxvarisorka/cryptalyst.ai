const Course = require('../models/course.model');
const Section = require('../models/section.model');
const Lesson = require('../models/lesson.model');
const CourseProgress = require('../models/courseProgress.model');
const User = require('../models/user.model');
const { completeOnboardingTask } = require('../services/onboarding.service');

// XP reward amounts
const XP_REWARDS = {
  lessonComplete: 25,
  courseComplete: 100,
  dailyStreak: 10,
  quizBonus: 15
};

// Level titles mapping
const LEVEL_TITLES = {
  1: 'Novice Trader',
  2: 'Apprentice Investor',
  3: 'Market Observer',
  4: 'Chart Reader',
  5: 'Trend Spotter',
  6: 'Technical Analyst',
  7: 'Portfolio Manager',
  8: 'Strategy Expert',
  9: 'Trading Veteran',
  10: 'Market Master',
  15: 'Crypto Sage',
  20: 'Trading Legend',
  25: 'Financial Guru',
  30: 'Market Oracle'
};

/**
 * Calculate cumulative XP threshold to REACH a level
 * Level 1: 0 XP (starting point)
 * Level 2: 100 XP
 * Level 3: 250 XP (100 + 150)
 * Level 4: 475 XP (250 + 225)
 */
const getXpThresholdForLevel = (level) => {
  if (level <= 1) return 0;
  let totalXp = 0;
  for (let i = 1; i < level; i++) {
    totalXp += Math.floor(100 * Math.pow(1.5, i - 1));
  }
  return totalXp;
};

/**
 * Get title for a given level
 */
const getTitleForLevel = (level) => {
  const levels = Object.keys(LEVEL_TITLES).map(Number).sort((a, b) => b - a);
  for (const l of levels) {
    if (level >= l) return LEVEL_TITLES[l];
  }
  return 'Novice Trader';
};

/**
 * Award XP to user and handle level ups
 */
const awardXp = async (userId, amount, source) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.error('awardXp: User not found for ID:', userId);
      return null;
    }

    // Initialize learning object if doesn't exist
    if (!user.learning) {
      user.learning = {
        xp: 0,
        level: 1,
        title: 'Novice Trader',
        totalLessonsCompleted: 0,
        totalCoursesCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        achievements: [],
        preferences: {
          dailyGoal: 15,
          reminderEnabled: true,
          reminderTime: '09:00',
          showLeaderboard: true,
          soundEffects: true,
          celebrationAnimations: true
        }
      };
    }

    // Ensure level is at least 1
    if (!user.learning.level || user.learning.level < 1) {
      user.learning.level = 1;
    }

    // Add XP
    const previousXp = user.learning.xp || 0;
    user.learning.xp = previousXp + amount;

    // Check for level up using cumulative thresholds
    let leveledUp = false;
    let newLevel = user.learning.level || 1;
    const previousLevel = newLevel;

    // Keep leveling up while XP is sufficient
    while (user.learning.xp >= getXpThresholdForLevel(newLevel + 1)) {
      newLevel++;
      leveledUp = true;
    }

    if (leveledUp) {
      user.learning.level = newLevel;
      user.learning.title = getTitleForLevel(newLevel);
      console.log(`User ${userId} leveled up from ${previousLevel} to ${newLevel}!`);
    }

    // Update streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActivity = user.learning.lastActivityDate
      ? new Date(user.learning.lastActivityDate)
      : null;

    if (lastActivity) {
      lastActivity.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Continue streak
        user.learning.currentStreak = (user.learning.currentStreak || 0) + 1;
        // Award streak bonus
        user.learning.xp += XP_REWARDS.dailyStreak;
      } else if (diffDays > 1) {
        // Streak broken
        user.learning.currentStreak = 1;
      }
      // If same day (diffDays === 0), don't change streak
    } else {
      user.learning.currentStreak = 1;
    }

    // Update longest streak
    if ((user.learning.currentStreak || 0) > (user.learning.longestStreak || 0)) {
      user.learning.longestStreak = user.learning.currentStreak;
    }

    user.learning.lastActivityDate = new Date();

    // Check for new achievements
    const newAchievements = [];
    const existingAchievementIds = (user.learning.achievements || []).map(a => a.id);

    // First lesson achievement
    if (source === 'lesson' && user.learning.totalLessonsCompleted === 1 && !existingAchievementIds.includes('first_lesson')) {
      newAchievements.push({
        id: 'first_lesson',
        name: 'First Steps',
        description: 'Complete your first lesson',
        icon: '🎯',
        xpReward: 50
      });
    }

    // Lessons milestones
    if (user.learning.totalLessonsCompleted >= 10 && !existingAchievementIds.includes('lessons_10')) {
      newAchievements.push({
        id: 'lessons_10',
        name: 'Dedicated Learner',
        description: 'Complete 10 lessons',
        icon: '📖',
        xpReward: 100
      });
    }

    if (user.learning.totalLessonsCompleted >= 50 && !existingAchievementIds.includes('lessons_50')) {
      newAchievements.push({
        id: 'lessons_50',
        name: 'Knowledge Seeker',
        description: 'Complete 50 lessons',
        icon: '🎓',
        xpReward: 300
      });
    }

    // Course completion achievements
    if (source === 'course' && user.learning.totalCoursesCompleted === 1 && !existingAchievementIds.includes('first_course')) {
      newAchievements.push({
        id: 'first_course',
        name: 'Course Complete',
        description: 'Complete your first course',
        icon: '📚',
        xpReward: 100
      });
    }

    if (user.learning.totalCoursesCompleted >= 3 && !existingAchievementIds.includes('courses_3')) {
      newAchievements.push({
        id: 'courses_3',
        name: 'Multi-skilled',
        description: 'Complete 3 courses',
        icon: '🏆',
        xpReward: 150
      });
    }

    if (user.learning.totalCoursesCompleted >= 10 && !existingAchievementIds.includes('courses_10')) {
      newAchievements.push({
        id: 'courses_10',
        name: 'Course Champion',
        description: 'Complete 10 courses',
        icon: '💎',
        xpReward: 500
      });
    }

    // Streak achievements
    if (user.learning.currentStreak >= 7 && !existingAchievementIds.includes('streak_7')) {
      newAchievements.push({
        id: 'streak_7',
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: '🔥',
        xpReward: 75
      });
    }

    if (user.learning.currentStreak >= 30 && !existingAchievementIds.includes('streak_30')) {
      newAchievements.push({
        id: 'streak_30',
        name: 'Monthly Master',
        description: 'Maintain a 30-day streak',
        icon: '⚡',
        xpReward: 200
      });
    }

    // Level achievements
    if (user.learning.level >= 5 && !existingAchievementIds.includes('level_5')) {
      newAchievements.push({
        id: 'level_5',
        name: 'Rising Star',
        description: 'Reach level 5',
        icon: '⭐',
        xpReward: 100
      });
    }

    if (user.learning.level >= 10 && !existingAchievementIds.includes('level_10')) {
      newAchievements.push({
        id: 'level_10',
        name: 'Expert Trader',
        description: 'Reach level 10',
        icon: '👑',
        xpReward: 250
      });
    }

    // Add new achievements and award XP
    for (const achievement of newAchievements) {
      user.learning.achievements.push(achievement);
      user.learning.xp += achievement.xpReward;
    }

    // Mark the learning subdocument as modified for Mongoose
    user.markModified('learning');

    await user.save();

    console.log(`XP awarded to user ${userId}: +${amount} XP, Total: ${user.learning.xp}, Level: ${user.learning.level}`);

    return {
      xpAwarded: amount,
      totalXp: user.learning.xp,
      level: user.learning.level,
      title: user.learning.title || getTitleForLevel(user.learning.level),
      leveledUp,
      newAchievements,
      currentStreak: user.learning.currentStreak || 0,
      longestStreak: user.learning.longestStreak || 0
    };
  } catch (error) {
    console.error('Error in awardXp:', error);
    return null;
  }
};

/**
 * Helper function to check if user has access to a course tier
 */
const hasAccessToTier = (userPlan, courseTier) => {
  const tierHierarchy = {
    free: 0,
    basic: 1,
    premium: 2,
  };

  const userTierLevel = tierHierarchy[userPlan] || 0;
  const courseTierLevel = tierHierarchy[courseTier] || 0;

  return userTierLevel >= courseTierLevel;
};

/**
 * Get all published courses (public)
 */
exports.getAllCourses = async (req, res, next) => {
  try {
    const { category, difficulty, search, language = 'en' } = req.query;
    const query = { isPublished: true };

    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const courses = await Course.find(query)
      .sort({ order: 1, createdAt: -1 })
      .populate('createdBy', 'name avatar')
      .lean();

    // Apply translations to each course
    const translatedCourses = courses.map((course) => {
      if (language !== 'en' && course.translations) {
        // Handle both Map (from Mongoose) and plain object (from .lean())
        const translation = typeof course.translations.get === 'function'
          ? course.translations.get(language)
          : course.translations[language];

        if (translation) {
          return {
            ...course,
            title: translation.title || course.title,
            description: translation.description || course.description,
          };
        }
      }
      return course;
    });

    res.status(200).json({
      success: true,
      data: translatedCourses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get course by ID with sections and lessons
 */
exports.getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { language = 'en' } = req.query;

    const course = await Course.findById(id)
      .populate('createdBy', 'name avatar')
      .lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Get sections with lessons
    const sections = await Section.find({ courseId: id })
      .sort({ order: 1 })
      .lean();

    // Get all lessons for this course
    const lessons = await Lesson.find({ courseId: id })
      .sort({ order: 1 })
      .lean();

    // Group lessons by section
    const sectionsWithLessons = sections.map((section) => ({
      ...section,
      lessons: lessons.filter(
        (lesson) => lesson.sectionId.toString() === section._id.toString()
      ),
    }));

    // Apply translations if requested language is not English
    if (language !== 'en' && course.translations) {
      const translation = typeof course.translations.get === 'function'
        ? course.translations.get(language)
        : course.translations[language];

      if (translation) {
        course.title = translation.title || course.title;
        course.description = translation.description || course.description;
      }
    }

    // Apply section and lesson translations
    sectionsWithLessons.forEach((section) => {
      if (language !== 'en' && section.translations) {
        const sectionTranslation = typeof section.translations.get === 'function'
          ? section.translations.get(language)
          : section.translations[language];

        if (sectionTranslation) {
          section.title = sectionTranslation.title || section.title;
          section.description = sectionTranslation.description || section.description;
        }
      }

      // Apply lesson translations
      section.lessons.forEach((lesson) => {
        if (language !== 'en' && lesson.translations) {
          const lessonTranslation = typeof lesson.translations.get === 'function'
            ? lesson.translations.get(language)
            : lesson.translations[language];

          if (lessonTranslation) {
            lesson.title = lessonTranslation.title || lesson.title;
            lesson.content = lessonTranslation.content || lesson.content;

            // Apply quiz translations
            if (lesson.quiz && lesson.quiz.questions && lessonTranslation.quiz && lessonTranslation.quiz.questions) {
              lesson.quiz.questions = lesson.quiz.questions.map((q, idx) => {
                const translatedQ = lessonTranslation.quiz.questions[idx];
                if (translatedQ) {
                  return {
                    question: translatedQ.question || q.question,
                    options: translatedQ.options || q.options,
                    correctAnswer: q.correctAnswer,
                    explanation: translatedQ.explanation || q.explanation,
                  };
                }
                return q;
              });
            }
          }
        }
      });
    });

    // Check if user has access to this course tier
    let hasAccess = true;
    if (req.user) {
      const userPlan = req.user.subscription?.plan || 'free';
      console.log('🎓 Course Access Check:');
      console.log('  - Course:', course.title);
      console.log('  - Course Tier:', course.tier);
      console.log('  - User Plan:', userPlan);
      console.log('  - User Subscription:', JSON.stringify(req.user.subscription, null, 2));
      hasAccess = hasAccessToTier(userPlan, course.tier);
      console.log('  - Has Access:', hasAccess);
    }

    res.status(200).json({
      success: true,
      data: {
        ...course,
        sections: sectionsWithLessons,
        hasAccess,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Enroll in a course
 */
exports.enrollCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if user has access to this course tier
    const userPlan = req.user.subscription?.plan || 'free';
    console.log('🎓 Enroll Check:');
    console.log('  - Course Tier:', course.tier);
    console.log('  - User Plan:', userPlan);
    console.log('  - User Subscription:', JSON.stringify(req.user.subscription, null, 2));

    if (!hasAccessToTier(userPlan, course.tier)) {
      console.log('  - ❌ Access DENIED');
      return res.status(403).json({
        success: false,
        message: `This course requires a ${course.tier} subscription or higher. Please upgrade your plan to access this course.`,
        requiredTier: course.tier,
        userTier: userPlan,
      });
    }
    console.log('  - ✅ Access GRANTED');

    // Check if already enrolled
    let progress = await CourseProgress.findOne({ userId, courseId: id });

    if (progress) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course',
      });
    }

    // Get the first lesson of the course to set as current
    const firstLesson = await Lesson.findOne({ courseId: id }).sort({ order: 1 });

    // Create progress record
    progress = await CourseProgress.create({
      userId,
      courseId: id,
      currentLessonId: firstLesson?._id || null,
    });

    // Increment enrolled count
    course.enrolledCount += 1;
    await course.save();

    // Complete onboarding task
    completeOnboardingTask(userId, 'startLearning').catch(() => {});

    res.status(200).json({
      success: true,
      message: 'Successfully enrolled in course',
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's course progress
 */
exports.getCourseProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Check course tier access
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    const userPlan = req.user.subscription?.plan || 'free';
    if (!hasAccessToTier(userPlan, course.tier)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this course',
      });
    }

    const progress = await CourseProgress.findOne({
      userId,
      courseId: id,
    }).lean();

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Not enrolled in this course',
      });
    }

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark lesson as complete
 */
exports.completeLesson = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;
    const { score } = req.body;
    const userId = req.user._id;

    // Check course tier access
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    const userPlan = req.user.subscription?.plan || 'free';
    if (!hasAccessToTier(userPlan, course.tier)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this course',
      });
    }

    const progress = await CourseProgress.findOne({ userId, courseId });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Not enrolled in this course',
      });
    }

    // Check if lesson already completed
    const alreadyCompleted = progress.completedLessons.some(
      (l) => l.lessonId.toString() === lessonId
    );

    let xpResult = null;
    let courseCompleted = false;

    if (!alreadyCompleted) {
      progress.completedLessons.push({
        lessonId,
        score: score || null,
      });

      // Update current lesson
      const allLessons = await Lesson.find({ courseId }).sort({ order: 1 });
      const currentIndex = allLessons.findIndex(
        (l) => l._id.toString() === lessonId
      );

      if (currentIndex < allLessons.length - 1) {
        progress.currentLessonId = allLessons[currentIndex + 1]._id;
      }

      // Calculate progress percentage
      progress.progressPercentage = Math.round(
        (progress.completedLessons.length / allLessons.length) * 100
      );

      // Update user's total lessons completed and award XP
      const user = await User.findById(userId);
      if (user) {
        if (!user.learning) {
          user.learning = {
            xp: 0,
            level: 1,
            title: 'Novice Trader',
            totalLessonsCompleted: 0,
            totalCoursesCompleted: 0,
            currentStreak: 0,
            longestStreak: 0,
            lastActivityDate: null,
            achievements: [],
            preferences: {}
          };
        }
        user.learning.totalLessonsCompleted = (user.learning.totalLessonsCompleted || 0) + 1;
        user.markModified('learning');
        await user.save();
      }

      // Award XP for lesson completion
      let xpAmount = XP_REWARDS.lessonComplete;
      if (score && score >= 80) {
        xpAmount += XP_REWARDS.quizBonus; // Bonus for quiz scores >= 80%
      }
      xpResult = await awardXp(userId, xpAmount, 'lesson');

      // Check if course completed
      if (progress.progressPercentage === 100 && !progress.completedAt) {
        progress.completedAt = new Date();
        courseCompleted = true;

        // Increment course completed count
        const course = await Course.findById(courseId);
        course.completedCount += 1;
        await course.save();

        // Update user's total courses completed
        const userForCourse = await User.findById(userId);
        if (userForCourse) {
          if (!userForCourse.learning) {
            userForCourse.learning = {
              xp: 0,
              level: 1,
              title: 'Novice Trader',
              totalLessonsCompleted: 0,
              totalCoursesCompleted: 0,
              currentStreak: 0,
              longestStreak: 0,
              lastActivityDate: null,
              achievements: [],
              preferences: {}
            };
          }
          userForCourse.learning.totalCoursesCompleted = (userForCourse.learning.totalCoursesCompleted || 0) + 1;
          userForCourse.markModified('learning');
          await userForCourse.save();
        }

        // Award XP for course completion
        const courseXpResult = await awardXp(userId, XP_REWARDS.courseComplete, 'course');
        if (courseXpResult) {
          xpResult = courseXpResult; // Use latest result with updated totals
        }
      }

      progress.lastAccessedAt = new Date();
      await progress.save();
    }

    res.status(200).json({
      success: true,
      message: 'Lesson marked as complete',
      data: progress,
      xp: xpResult,
      courseCompleted
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's enrolled courses
 */
exports.getMyEnrolledCourses = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { language = 'en' } = req.query;

    const enrollments = await CourseProgress.find({ userId })
      .populate('courseId')
      .sort({ lastAccessedAt: -1 })
      .lean();

    // Filter out enrollments where course was deleted
    const validEnrollments = enrollments.filter(e => e.courseId !== null);

    // Apply translations to each course
    const translatedEnrollments = validEnrollments.map((enrollment) => {
      if (language !== 'en' && enrollment.courseId && enrollment.courseId.translations) {
        const translation = typeof enrollment.courseId.translations.get === 'function'
          ? enrollment.courseId.translations.get(language)
          : enrollment.courseId.translations[language];

        if (translation) {
          return {
            ...enrollment,
            courseId: {
              ...enrollment.courseId,
              title: translation.title || enrollment.courseId.title,
              description: translation.description || enrollment.courseId.description,
            },
          };
        }
      }
      return enrollment;
    });

    res.status(200).json({
      success: true,
      data: translatedEnrollments,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== ADMIN ROUTES ====================

/**
 * Create a new course (admin only)
 */
exports.createCourse = async (req, res, next) => {
  try {
    const courseData = {
      ...req.body,
      createdBy: req.user._id,
    };

    const course = await Course.create(courseData);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update course (admin only)
 */
exports.updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await Course.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete course (admin only)
 */
exports.deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Delete all sections and lessons
    await Section.deleteMany({ courseId: id });
    await Lesson.deleteMany({ courseId: id });
    await CourseProgress.deleteMany({ courseId: id });
    await Course.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create section (admin only)
 */
exports.createSection = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const section = await Section.create({
      ...req.body,
      courseId,
    });

    res.status(201).json({
      success: true,
      message: 'Section created successfully',
      data: section,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update section (admin only)
 */
exports.updateSection = async (req, res, next) => {
  try {
    const { id } = req.params;

    const section = await Section.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Section updated successfully',
      data: section,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete section (admin only)
 */
exports.deleteSection = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Delete all lessons in this section
    await Lesson.deleteMany({ sectionId: id });
    await Section.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Section deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create lesson (admin only)
 */
exports.createLesson = async (req, res, next) => {
  try {
    const { sectionId } = req.params;

    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found',
      });
    }

    const lesson = await Lesson.create({
      ...req.body,
      sectionId,
      courseId: section.courseId,
    });

    // Update course total lessons count
    const course = await Course.findById(section.courseId);
    course.totalLessons = await Lesson.countDocuments({ courseId: course._id });
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Lesson created successfully',
      data: lesson,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update lesson (admin only)
 */
exports.updateLesson = async (req, res, next) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lesson updated successfully',
      data: lesson,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete lesson (admin only)
 */
exports.deleteLesson = async (req, res, next) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found',
      });
    }

    await Lesson.findByIdAndDelete(id);

    // Update course total lessons count
    const course = await Course.findById(lesson.courseId);
    course.totalLessons = await Lesson.countDocuments({ courseId: course._id });
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Lesson deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all courses (admin - includes unpublished)
 */
exports.getAllCoursesAdmin = async (req, res, next) => {
  try {
    const courses = await Course.find()
      .sort({ order: 1, createdAt: -1 })
      .populate('createdBy', 'name email')
      .lean();

    res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error) {
    next(error);
  }
};
