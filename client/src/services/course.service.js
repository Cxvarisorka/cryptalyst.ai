import api from './api';

const COURSE_API_URL = '/courses';

export const courseService = {
  // ==================== PUBLIC ROUTES ====================

  /**
   * Get all published courses
   */
  getAllCourses: async (params = {}) => {
    try {
      const response = await api.get(COURSE_API_URL, { params });
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get course by ID
   */
  getCourseById: async (id, language = 'en') => {
    try {
      const response = await api.get(`${COURSE_API_URL}/${id}`, {
        params: { language },
      });
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ==================== USER ROUTES ====================

  /**
   * Enroll in a course
   */
  enrollCourse: async (id) => {
    try {
      const response = await api.post(`${COURSE_API_URL}/${id}/enroll`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get course progress
   */
  getCourseProgress: async (id) => {
    try {
      const response = await api.get(`${COURSE_API_URL}/${id}/progress`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Mark lesson as complete
   */
  completeLesson: async (courseId, lessonId, score = null) => {
    try {
      const response = await api.post(
        `${COURSE_API_URL}/${courseId}/lessons/${lessonId}/complete`,
        { score }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get my enrolled courses
   */
  getMyEnrolledCourses: async (language = 'en') => {
    try {
      const response = await api.get(`${COURSE_API_URL}/me/enrolled`, {
        params: { language },
      });
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ==================== ADMIN ROUTES ====================

  /**
   * Get all courses (admin - includes unpublished)
   */
  getAllCoursesAdmin: async () => {
    try {
      const response = await api.get(`${COURSE_API_URL}/admin/all`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Create a new course
   */
  createCourse: async (courseData) => {
    try {
      const response = await api.post(`${COURSE_API_URL}/admin/create`, courseData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update course
   */
  updateCourse: async (id, courseData) => {
    try {
      const response = await api.put(`${COURSE_API_URL}/admin/${id}`, courseData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Delete course
   */
  deleteCourse: async (id) => {
    try {
      const response = await api.delete(`${COURSE_API_URL}/admin/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Create section
   */
  createSection: async (courseId, sectionData) => {
    try {
      const response = await api.post(
        `${COURSE_API_URL}/admin/${courseId}/sections`,
        sectionData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update section
   */
  updateSection: async (id, sectionData) => {
    try {
      const response = await api.put(
        `${COURSE_API_URL}/admin/sections/${id}`,
        sectionData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Delete section
   */
  deleteSection: async (id) => {
    try {
      const response = await api.delete(`${COURSE_API_URL}/admin/sections/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Create lesson
   */
  createLesson: async (sectionId, lessonData) => {
    try {
      const response = await api.post(
        `${COURSE_API_URL}/admin/sections/${sectionId}/lessons`,
        lessonData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update lesson
   */
  updateLesson: async (id, lessonData) => {
    try {
      const response = await api.put(
        `${COURSE_API_URL}/admin/lessons/${id}`,
        lessonData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Delete lesson
   */
  deleteLesson: async (id) => {
    try {
      const response = await api.delete(`${COURSE_API_URL}/admin/lessons/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
