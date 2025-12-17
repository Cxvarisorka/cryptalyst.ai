const User = require('../models/user.model');

const TASK_LIST = [
  'createPortfolio',
  'useCryptoAnalyzer',
  'useStockAnalyzer',
  'usePortfolioAnalyzer',
  'viewNews',
  'setPriceAlert',
  'startLearning',
  'useScalpingAI'
];

/**
 * Complete an onboarding task for a user
 * @param {string} userId - The user's ID
 * @param {string} taskId - The task ID to complete
 * @returns {Object} Result with completion status
 */
const completeOnboardingTask = async (userId, taskId) => {
  try {
    if (!TASK_LIST.includes(taskId)) {
      return { success: false, message: 'Invalid task ID' };
    }

    const user = await User.findById(userId);
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    // Initialize onboarding if not exists
    if (!user.onboarding) {
      user.onboarding = {
        isCompleted: false,
        dismissedAt: null,
        tasks: {}
      };
    }

    if (!user.onboarding.tasks) {
      user.onboarding.tasks = {};
    }

    // Check if already completed
    if (user.onboarding.tasks[taskId]?.completed) {
      return { success: true, alreadyCompleted: true };
    }

    // Mark task as complete
    user.onboarding.tasks[taskId] = {
      completed: true,
      completedAt: new Date()
    };

    // Check if all tasks completed
    const completedTasks = TASK_LIST.filter(
      task => user.onboarding.tasks[task]?.completed
    ).length;

    if (completedTasks === TASK_LIST.length) {
      user.onboarding.isCompleted = true;
    }

    user.markModified('onboarding');
    await user.save();

    return {
      success: true,
      taskId,
      completed: true,
      allCompleted: user.onboarding.isCompleted,
      completedCount: completedTasks,
      totalTasks: TASK_LIST.length
    };
  } catch (error) {
    console.error('Onboarding task completion error:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Get onboarding status for a user
 * @param {string} userId - The user's ID
 * @returns {Object} Onboarding status
 */
const getOnboardingStatus = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    // Initialize onboarding if not exists
    if (!user.onboarding) {
      user.onboarding = {
        isCompleted: false,
        dismissedAt: null,
        tasks: {}
      };
      user.markModified('onboarding');
      await user.save();
    }

    const completedTasks = TASK_LIST.filter(
      task => user.onboarding.tasks?.[task]?.completed
    ).length;

    const progress = Math.round((completedTasks / TASK_LIST.length) * 100);

    return {
      success: true,
      data: {
        isCompleted: user.onboarding.isCompleted,
        dismissedAt: user.onboarding.dismissedAt,
        tasks: user.onboarding.tasks || {},
        completedCount: completedTasks,
        totalTasks: TASK_LIST.length,
        progress
      }
    };
  } catch (error) {
    console.error('Get onboarding status error:', error);
    return { success: false, message: error.message };
  }
};

module.exports = {
  completeOnboardingTask,
  getOnboardingStatus,
  TASK_LIST
};
