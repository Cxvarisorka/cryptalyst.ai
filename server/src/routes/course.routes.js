const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth.middleware');
const courseController = require('../controllers/course.controller');

// ==================== PUBLIC ROUTES ====================

// Get all published courses
router.get('/', courseController.getAllCourses);

// Get course by ID
router.get('/:id', courseController.getCourseById);

// ==================== USER ROUTES (require authentication) ====================

// Enroll in a course
router.post('/:id/enroll', protect, courseController.enrollCourse);

// Get course progress
router.get('/:id/progress', protect, courseController.getCourseProgress);

// Complete a lesson
router.post('/:courseId/lessons/:lessonId/complete', protect, courseController.completeLesson);

// Get my enrolled courses
router.get('/me/enrolled', protect, courseController.getMyEnrolledCourses);

// ==================== ADMIN ROUTES ====================

// Get all courses (including unpublished)
router.get('/admin/all', protect, adminOnly, courseController.getAllCoursesAdmin);

// Create a new course
router.post('/admin/create', protect, adminOnly, courseController.createCourse);

// Update course
router.put('/admin/:id', protect, adminOnly, courseController.updateCourse);

// Delete course
router.delete('/admin/:id', protect, adminOnly, courseController.deleteCourse);

// Section management
router.post('/admin/:courseId/sections', protect, adminOnly, courseController.createSection);
router.put('/admin/sections/:id', protect, adminOnly, courseController.updateSection);
router.delete('/admin/sections/:id', protect, adminOnly, courseController.deleteSection);

// Lesson management
router.post('/admin/sections/:sectionId/lessons', protect, adminOnly, courseController.createLesson);
router.put('/admin/lessons/:id', protect, adminOnly, courseController.updateLesson);
router.delete('/admin/lessons/:id', protect, adminOnly, courseController.deleteLesson);

module.exports = router;
