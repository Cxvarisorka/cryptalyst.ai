const Course = require('../models/course.model');
const Section = require('../models/section.model');
const Lesson = require('../models/lesson.model');
const CourseProgress = require('../models/courseProgress.model');

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
      hasAccess = hasAccessToTier(userPlan, course.tier);
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
    if (!hasAccessToTier(userPlan, course.tier)) {
      return res.status(403).json({
        success: false,
        message: `This course requires a ${course.tier} subscription or higher. Please upgrade your plan to access this course.`,
        requiredTier: course.tier,
        userTier: userPlan,
      });
    }

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

      // Check if course completed
      if (progress.progressPercentage === 100 && !progress.completedAt) {
        progress.completedAt = new Date();

        // Increment course completed count
        const course = await Course.findById(courseId);
        course.completedCount += 1;
        await course.save();
      }

      progress.lastAccessedAt = new Date();
      await progress.save();
    }

    res.status(200).json({
      success: true,
      message: 'Lesson marked as complete',
      data: progress,
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
